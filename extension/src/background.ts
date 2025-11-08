const API_URL = 'http://localhost:3000/api';

// Track recent saves for undo functionality
const recentSaves: Map<string, { contentId: string; data: any }> = new Map();

// Check if Chrome APIs are available
const isAPIAvailable = (api: any) => {
  return typeof api !== 'undefined' && api !== null;
};

// Create enhanced context menu
chrome.runtime.onInstalled.addListener(() => {
  console.log('Synapse extension installed, creating context menus...');
  
  if (!isAPIAvailable(chrome.contextMenus)) {
    console.error('Context menus API not available');
    return;
  }
  
  try {
    chrome.contextMenus.removeAll(() => {
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
        contexts: ['selection']
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
      
      console.log('Context menus created successfully');
    });
  } catch (error) {
    console.error('Error creating context menus:', error);
  }
});

// Handle context menu clicks with enhanced functionality
if (isAPIAvailable(chrome.contextMenus)) {
  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    console.log('Context menu clicked:', info.menuItemId, info);
    
    const token = await getAuthToken();
    
    if (!token) {
      console.log('No token found, showing login notification');
      showLoginNotification();
      return;
    }

    console.log('Token found, proceeding with save...');

    try {
      let contentData: any = await extractContentData(info, tab);
      console.log('Content data extracted:', contentData);
      
      // Show inline saving toast
      if (tab?.id && isAPIAvailable(chrome.scripting)) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            // Remove existing toasts
            const existingToasts = document.querySelectorAll('[id^="synapse-"]');
            existingToasts.forEach(toast => toast.remove());
            
            const toast = document.createElement('div');
            toast.id = 'synapse-saving-toast';
            toast.textContent = '⏳ Saving to Synapse...';
            toast.style.cssText = `
              position: fixed; top: 20px; right: 20px; z-index: 999999;
              background: #2196F3; color: white; padding: 16px 24px;
              border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              font-family: system-ui; font-size: 14px; font-weight: 500;
              transition: all 0.3s ease;
            `;
            document.body.appendChild(toast);
          }
        });
      }
      
      // Save content to backend
      const savedContent = await saveContent(token, contentData);
      console.log('Content saved successfully:', savedContent);
      
      // Show success toast
      if (tab?.id && isAPIAvailable(chrome.scripting)) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (title: string) => {
            const existingToast = document.getElementById('synapse-saving-toast');
            if (existingToast) existingToast.remove();
            
            const toast = document.createElement('div');
            toast.innerHTML = `✅ Saved "${title.substring(0, 30)}..." to Synapse!`;
            toast.style.cssText = `
              position: fixed; top: 20px; right: 20px; z-index: 999999;
              background: #4CAF50; color: white; padding: 16px 24px;
              border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              font-family: system-ui; font-size: 14px; font-weight: 500;
              transition: all 0.3s ease;
            `;
            document.body.appendChild(toast);
            setTimeout(() => {
              toast.style.opacity = '0';
              setTimeout(() => toast.remove(), 300);
            }, 3000);
          },
          args: [contentData.title]
        });
      }

      // Show Chrome notification if available
      if (isAPIAvailable(chrome.notifications)) {
        try {
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon.png',
            title: '✅ Saved to Synapse!',
            message: `"${contentData.title?.substring(0, 50)}..." saved successfully`,
            buttons: [
              { title: '👁️ View' },
              { title: '↩️ Undo' }
            ],
            requireInteraction: false
          }, (notificationId) => {
            if (chrome.runtime.lastError) {
              console.warn('Notification error:', chrome.runtime.lastError);
            } else {
              recentSaves.set(notificationId, { 
                contentId: savedContent.id, 
                data: contentData 
              });
            }
          });
        } catch (error) {
          console.warn('Failed to create notification:', error);
        }
      }

    } catch (error: any) {
      console.error('Error saving content:', error);
      
      // Show error toast
      if (tab?.id && isAPIAvailable(chrome.scripting)) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (errorMsg: string) => {
            const existingToast = document.getElementById('synapse-saving-toast');
            if (existingToast) existingToast.remove();
            
            const toast = document.createElement('div');
            toast.innerHTML = `❌ Failed to save: ${errorMsg}`;
            toast.style.cssText = `
              position: fixed; top: 20px; right: 20px; z-index: 999999;
              background: #f44336; color: white; padding: 16px 24px;
              border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              font-family: system-ui; font-size: 14px; font-weight: 500;
            `;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
          },
          args: [error.message || 'Unknown error']
        });
      }
      showErrorNotification(error.message);
    }
  });
}

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
      const result: any = {
        ...baseData,
        type: 'URL',
        title: tab?.title || 'Untitled',
        url: tab?.url,
        description: pageData?.description || `Saved from ${new URL(tab?.url || '').hostname}`,
        contentText: pageData?.excerpt,
        tags: pageData?.keywords || []
      };
      
      // Only add thumbnailUrl if it's a valid URL
      if (pageData?.image && isValidUrl(pageData.image)) {
        result.thumbnailUrl = pageData.image;
      }
      
      return result;

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
      const imageResult: any = {
        ...baseData,
        type: 'IMAGE',
        url: info.srcUrl,
        title: extractImageName(info.srcUrl) || `Image from ${tab?.title}`,
        description: `Source: ${tab?.url}`
      };
      
      // Only add thumbnailUrl if it's a valid URL
      if (info.srcUrl && isValidUrl(info.srcUrl)) {
        imageResult.thumbnailUrl = info.srcUrl;
      }
      
      return imageResult;

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

// Validate if string is a valid URL
function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Handle keyboard shortcut
if (isAPIAvailable(chrome.commands)) {
  chrome.commands.onCommand.addListener(async (command) => {
    if (command === 'save-page') {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const token = await getAuthToken();
      
      if (!token) {
        showLoginNotification();
        return;
      }

      try {
        // Use the same extraction logic as context menu
        const info = {
          menuItemId: 'save-page',
          pageUrl: tab.url || '',
          editable: false
        } as chrome.contextMenus.OnClickData;
        
        const contentData = await extractContentData(info, tab);
        console.log('Keyboard shortcut - content data extracted:', contentData);

        // Show inline notification
        if (tab?.id && isAPIAvailable(chrome.scripting)) {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
              const toast = document.createElement('div');
              toast.id = 'synapse-saving-toast';
              toast.textContent = '⏳ Saving to Synapse...';
              toast.style.cssText = `
                position: fixed; top: 20px; right: 20px; z-index: 999999;
                background: #2196F3; color: white; padding: 16px 24px;
                border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                font-family: system-ui; font-size: 14px; font-weight: 500;
              `;
              document.body.appendChild(toast);
            }
          });
        }

        // Save using the enhanced content data
        const savedContent = await saveContent(token, contentData);
        console.log('Keyboard shortcut - content saved:', savedContent);

        // Show success toast
        if (tab?.id && isAPIAvailable(chrome.scripting)) {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (title: string) => {
              const existingToast = document.getElementById('synapse-saving-toast');
              if (existingToast) existingToast.remove();
              
              const toast = document.createElement('div');
              toast.innerHTML = `✅ Saved "${title.substring(0, 30)}..." to Synapse!`;
              toast.style.cssText = `
                position: fixed; top: 20px; right: 20px; z-index: 999999;
                background: #4CAF50; color: white; padding: 16px 24px;
                border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                font-family: system-ui; font-size: 14px; font-weight: 500;
                transition: all 0.3s ease;
              `;
              document.body.appendChild(toast);
              setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 300);
              }, 2500);
            },
            args: [contentData.title]
          });
        }

        // Show Chrome notification
        if (isAPIAvailable(chrome.notifications)) {
          try {
            chrome.notifications.create({
              type: 'basic',
              iconUrl: 'icon.png',
              title: '✅ Saved to Synapse!',
              message: `"${contentData.title?.substring(0, 50)}..." saved successfully`,
              buttons: [
                { title: '👁️ View' },
                { title: '↩️ Undo' }
              ],
              requireInteraction: false
            }, (notificationId) => {
              if (!chrome.runtime.lastError) {
                recentSaves.set(notificationId, { 
                  contentId: savedContent.id, 
                  data: contentData 
                });
              }
            });
          } catch (error) {
            console.warn('Failed to create notification:', error);
          }
        }

      } catch (error: any) {
        console.error('Keyboard shortcut save error:', error);
        
        // Show error toast
        if (tab?.id && isAPIAvailable(chrome.scripting)) {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (errorMsg: string) => {
              const existingToast = document.getElementById('synapse-saving-toast');
              if (existingToast) existingToast.remove();
              
              const toast = document.createElement('div');
              toast.innerHTML = `❌ Failed to save: ${errorMsg}`;
              toast.style.cssText = `
                position: fixed; top: 20px; right: 20px; z-index: 999999;
                background: #f44336; color: white; padding: 16px 24px;
                border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                font-family: system-ui; font-size: 14px; font-weight: 500;
              `;
              document.body.appendChild(toast);
              setTimeout(() => toast.remove(), 3000);
            },
            args: [error.message || 'Unknown error']
          });
        }
        showErrorNotification(error.message);
      }
    } else if (command === 'open-sidebar') {
      // Inject content script and show inline sidebar
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab?.id) {
          console.error('No active tab found');
          return;
        }

        // Inject the content script if not already injected
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content-sidebar.js']
          });
        } catch (error) {
          // Script might already be injected, which is fine
          console.log('Content script may already be injected:', error);
        }

        // Send message to toggle the sidebar
        try {
          await chrome.tabs.sendMessage(tab.id, { action: 'toggle-sidebar' });
        } catch (error) {
          console.error('Failed to send message to content script:', error);
          
          // Fallback: Open sidebar as a new tab
          chrome.tabs.create({ 
            url: chrome.runtime.getURL('sidebar.html'),
            active: false,
            index: tab.index + 1
          });
        }
      } catch (error) {
        console.error('Failed to open sidebar:', error);
        
        // Final fallback: Open as popup window
        if (isAPIAvailable(chrome.windows)) {
          chrome.windows.create({
            url: chrome.runtime.getURL('sidebar.html'),
            type: 'popup',
            width: 400,
            height: 600,
            left: 100,
            top: 100
          });
        }
      }
    }
  });
}

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
  if (isAPIAvailable(chrome.notifications)) {
    try {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon.png',
        title: '🔐 Login Required',
        message: 'Please login to Synapse to save content',
        buttons: [{ title: 'Login Now' }],
        requireInteraction: true
      });
    } catch (error) {
      console.warn('Failed to show login notification:', error);
    }
  }
}

function showErrorNotification(message: string) {
  if (isAPIAvailable(chrome.notifications)) {
    try {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon.png',
        title: '❌ Save Failed',
        message: message || 'Could not save to Synapse. Please try again.',
        requireInteraction: false
      });
    } catch (error) {
      console.warn('Failed to show error notification:', error);
    }
  }
}

// Handle notification button clicks (with safety check)
if (isAPIAvailable(chrome.notifications)) {
  try {
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
  } catch (error) {
    console.warn('Failed to set up notification handlers:', error);
  }
}

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
  
  if (request.action === 'getAuthToken') {
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
