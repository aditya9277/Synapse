const API_URL = 'http://localhost:3000/api';

// Track recent saves for undo functionality
const recentSaves: Map<string, { contentId: string; data: any }> = new Map();

// Create enhanced context menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'save-page',
    title: '💾 Save Page to Synapse',
    contexts: ['page']
  });

  chrome.contextMenus.create({
    id: 'save-selection',
    title: '✂️ Save Selection',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'save-link',
    title: '🔗 Save Link',
    contexts: ['link']
  });

  chrome.contextMenus.create({
    id: 'save-image',
    title: '🖼️ Save Image',
    contexts: ['image']
  });

  chrome.contextMenus.create({
    id: 'separator',
    type: 'separator',
    contexts: ['all']
  });

  chrome.contextMenus.create({
    id: 'save-as-note',
    title: '📝 Save Selection as Note',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'save-as-quote',
    title: '💬 Save as Quote',
    contexts: ['selection']
  });
});

// Handle context menu clicks with enhanced functionality
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const token = await getAuthToken();
  
  if (!token) {
    showLoginNotification();
    return;
  }

  // Show saving notification
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon.png',
    title: '⏳ Saving to Synapse...',
    message: 'Extracting content and metadata...',
    silent: true
  }, (notificationId) => {
    extractContentData(info, tab).then(contentData => {
      // Save content to backend
      return saveContent(token, contentData).then(savedContent => {
        // Store for undo
        recentSaves.set(notificationId, { 
          contentId: savedContent.id, 
          data: contentData 
        });

        // Clear the loading notification
        chrome.notifications.clear(notificationId);

        // Show success notification with actions
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icon.png',
          title: '✅ Saved to Synapse!',
          message: `"${contentData.title?.substring(0, 50)}..." saved successfully`,
          buttons: [
            { title: '👁️ View' },
            { title: '↩️ Undo' }
          ],
          requireInteraction: true
        });
      });
    }).catch((error: Error) => {
      chrome.notifications.clear(notificationId);
      showErrorNotification(error.message);
    });
  });
});

// Enhanced content extraction
async function extractContentData(info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab | undefined): Promise<any> {
  const baseData = {
    source: 'chrome-extension',
    metadata: {
      savedFrom: tab?.url,
      savedAt: new Date().toISOString(),
      browser: 'Chrome'
    }
  };

  switch (info.menuItemId) {
    case 'save-page':
      // Get page metadata from content script
      const pageData = await getPageMetadata(tab?.id);
      return {
        ...baseData,
        type: 'URL',
        title: tab?.title || 'Untitled',
        url: tab?.url,
        description: pageData?.description || `Saved from ${new URL(tab?.url || '').hostname}`,
        thumbnailUrl: pageData?.image,
        contentText: pageData?.excerpt,
        tags: pageData?.keywords || []
      };

    case 'save-selection':
    case 'save-as-note':
      const selectionContext = await getSelectionContext(tab?.id);
      return {
        ...baseData,
        type: 'NOTE',
        title: generateSmartTitle(info.selectionText),
        contentText: info.selectionText,
        description: `From: ${tab?.title}`,
        url: tab?.url,
        metadata: {
          ...baseData.metadata,
          context: selectionContext,
          wordCount: info.selectionText?.split(/\s+/).length
        }
      };

    case 'save-as-quote':
      return {
        ...baseData,
        type: 'NOTE',
        title: `Quote from ${tab?.title}`,
        contentText: `"${info.selectionText}"\n\n— ${tab?.title}`,
        description: `Source: ${tab?.url}`,
        url: tab?.url,
        tags: ['quote', 'reference']
      };

    case 'save-link':
      return {
        ...baseData,
        type: 'URL',
        url: info.linkUrl,
        title: info.linkUrl,
        description: `Link from ${tab?.title}`
      };

    case 'save-image':
      return {
        ...baseData,
        type: 'IMAGE',
        url: info.srcUrl,
        thumbnailUrl: info.srcUrl,
        title: extractImageName(info.srcUrl) || `Image from ${tab?.title}`,
        description: `Source: ${tab?.url}`
      };

    default:
      return {
        ...baseData,
        type: 'URL',
        title: tab?.title || 'Untitled',
        url: tab?.url
      };
  }
}

// Get rich page metadata using content script
async function getPageMetadata(tabId: number | undefined): Promise<any> {
  if (!tabId) return null;
  
  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const getMeta = (name: string) => {
          const meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"], meta[property="og:${name}"]`);
          return meta?.getAttribute('content') || '';
        };

        return {
          description: getMeta('description') || getMeta('og:description'),
          image: getMeta('image') || getMeta('og:image'),
          keywords: getMeta('keywords')?.split(',').map(k => k.trim()) || [],
          author: getMeta('author'),
          excerpt: document.querySelector('p')?.textContent?.substring(0, 200)
        };
      }
    });

    return result?.result;
  } catch (error) {
    console.error('Failed to extract metadata:', error);
    return null;
  }
}

// Get context around selection
async function getSelectionContext(tabId: number | undefined): Promise<string> {
  if (!tabId) return '';
  
  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount) return '';
        
        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer.parentElement;
        return container?.textContent?.substring(0, 500) || '';
      }
    });

    return result?.result || '';
  } catch (error) {
    return '';
  }
}

// Generate smart title from selection
function generateSmartTitle(text: string | undefined): string {
  if (!text) return 'Note';
  
  // Take first sentence or first 50 chars
  const firstSentence = text.match(/^[^.!?]+[.!?]/)?.[0] || text.substring(0, 50);
  return firstSentence.trim() + (firstSentence.length < text.length ? '...' : '');
}

// Extract image name from URL
function extractImageName(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const path = new URL(url).pathname;
    const filename = path.split('/').pop();
    return filename?.split('.')[0] || null;
  } catch {
    return null;
  }
}

// Handle keyboard shortcut
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'save-page') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const token = await getAuthToken();
    
    if (!token) {
      showLoginNotification();
      return;
    }

    // Show inline notification
    await chrome.scripting.executeScript({
      target: { tabId: tab.id! },
      func: () => {
        const toast = document.createElement('div');
        toast.textContent = '⏳ Saving to Synapse...';
        toast.style.cssText = `
          position: fixed; top: 20px; right: 20px; z-index: 999999;
          background: #2196F3; color: white; padding: 16px 24px;
          border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          font-family: system-ui; font-size: 14px; font-weight: 500;
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
      }
    });

    const pageData = await getPageMetadata(tab.id);
    await saveContent(token, {
      type: 'URL',
      title: tab.title || 'Untitled',
      url: tab.url,
      description: pageData?.description,
      thumbnailUrl: pageData?.image,
      source: 'chrome-extension-keyboard'
    });

    // Show success toast
    await chrome.scripting.executeScript({
      target: { tabId: tab.id! },
      func: () => {
        const toast = document.createElement('div');
        toast.innerHTML = '✅ Saved to Synapse!';
        toast.style.cssText = `
          position: fixed; top: 20px; right: 20px; z-index: 999999;
          background: #4CAF50; color: white; padding: 16px 24px;
          border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          font-family: system-ui; font-size: 14px; font-weight: 500;
          animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
          toast.style.animation = 'slideOut 0.3s ease';
          setTimeout(() => toast.remove(), 300);
        }, 2500);
      }
    });
  }
});

// Helper functions
async function getAuthToken(): Promise<string | null> {
  const result = await chrome.storage.local.get(['accessToken']);
  return result.accessToken || null;
}

async function saveContent(token: string, data: any): Promise<any> {
  const response = await fetch(`${API_URL}/content`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  if (response.ok) {
    return await response.json();
  } else if (response.status === 401) {
    throw new Error('Authentication required');
  } else {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to save content');
  }
}

async function deleteContent(token: string, contentId: string): Promise<void> {
  const response = await fetch(`${API_URL}/content/${contentId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to delete content');
  }
}

function showLoginNotification() {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon.png',
    title: '🔐 Login Required',
    message: 'Please login to Synapse to save content',
    buttons: [{ title: 'Login Now' }],
    requireInteraction: true
  });
}

function showErrorNotification(message: string) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon.png',
    title: '❌ Save Failed',
    message: message || 'Could not save to Synapse. Please try again.',
    requireInteraction: false
  });
}

// Handle notification button clicks
chrome.notifications.onButtonClicked.addListener(async (notificationId, buttonIndex) => {
  if (buttonIndex === 0) {
    // View button - open dashboard
    chrome.tabs.create({ url: 'http://localhost:5173/dashboard' });
  } else if (buttonIndex === 1) {
    // Undo button
    const saved = recentSaves.get(notificationId);
    if (saved) {
      const token = await getAuthToken();
      if (token) {
        try {
          await deleteContent(token, saved.contentId);
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon.png',
            title: '↩️ Undone',
            message: 'Content removed from Synapse',
            silent: true
          });
          recentSaves.delete(notificationId);
        } catch (error) {
          showErrorNotification('Could not undo save');
        }
      }
    }
  }
});

// Handle notification clicks
chrome.notifications.onClicked.addListener((notificationId) => {
  if (notificationId.includes('login')) {
    chrome.tabs.create({ url: 'http://localhost:5173/login' });
  } else {
    chrome.tabs.create({ url: 'http://localhost:5173/dashboard' });
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveContent') {
    getAuthToken().then(token => {
      if (token) {
        saveContent(token, request.data).then((result) => {
          sendResponse({ success: true, data: result });
        }).catch(error => {
          sendResponse({ success: false, error: error.message });
        });
      } else {
        sendResponse({ success: false, error: 'Not authenticated' });
      }
    });
    return true; // Required for async response
  }
  
  if (request.action === 'getToken') {
    getAuthToken().then(token => {
      sendResponse({ token });
    });
    return true;
  }
});

// Clean up old saves from memory every hour
setInterval(() => {
  const oneHourAgo = Date.now() - 3600000;
  for (const [key] of recentSaves) {
    if (parseInt(key) < oneHourAgo) {
      recentSaves.delete(key);
    }
  }
}, 3600000);

export {};
