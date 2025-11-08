const API_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('saveForm') as HTMLFormElement;
  const titleInput = document.getElementById('title') as HTMLInputElement;
  const descInput = document.getElementById('description') as HTMLTextAreaElement;
  const urlInput = document.getElementById('url') as HTMLInputElement;
  const typeSelect = document.getElementById('type') as HTMLSelectElement;
  const tagsInput = document.getElementById('tags') as HTMLInputElement;
  const submitBtn = document.getElementById('submit-btn') as HTMLButtonElement;
  const statusDiv = document.getElementById('status') as HTMLDivElement;
  const loginPrompt = document.getElementById('login-prompt') as HTMLDivElement;
  const mainForm = document.getElementById('main-form') as HTMLDivElement;

  // Check if user is logged in
  const token = await getAuthToken();
  if (!token) {
    loginPrompt.style.display = 'block';
    mainForm.style.display = 'none';
    
    // Handle sync button
    document.getElementById('sync-token')?.addEventListener('click', async () => {
      const syncBtn = document.getElementById('sync-token') as HTMLButtonElement;
      syncBtn.textContent = '🔄 Syncing...';
      syncBtn.disabled = true;
      
      // Query for Synapse tabs
      const synapseTabs = await chrome.tabs.query({ 
        url: ['http://localhost:5173/*', 'http://localhost:5174/*'] 
      });
      
      if (synapseTabs.length > 0) {
        // Send sync message to the content script
        chrome.tabs.sendMessage(synapseTabs[0].id!, { action: 'syncToken' }, async (response) => {
          // Wait a moment for sync to complete
          setTimeout(async () => {
            const newToken = await getAuthToken();
            if (newToken) {
              loginPrompt.style.display = 'none';
              mainForm.style.display = 'block';
              location.reload();
            } else {
              syncBtn.textContent = '❌ Not logged in. Please login first.';
              setTimeout(() => {
                syncBtn.textContent = '🔄 Already Logged In? Sync Now';
                syncBtn.disabled = false;
              }, 2000);
            }
          }, 500);
        });
      } else {
        syncBtn.textContent = '❌ Please open Synapse dashboard first';
        setTimeout(() => {
          syncBtn.textContent = '🔄 Already Logged In? Sync Now';
          syncBtn.disabled = false;
        }, 2000);
      }
    });
    
    return;
  }

  // Get current tab info
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  titleInput.value = tab.title || '';
  urlInput.value = tab.url || '';

  // Quick action buttons
  document.getElementById('save-page')?.addEventListener('click', async () => {
    await savePage();
  });

  document.getElementById('save-selection')?.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.id) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.getSelection()?.toString() || ''
      }, (results) => {
        const selection = results[0].result;
        if (selection) {
          typeSelect.value = 'NOTE';
          titleInput.value = selection.substring(0, 100);
          descInput.value = selection;
        }
      });
    }
  });

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
      type: typeSelect.value,
      title: titleInput.value,
      description: descInput.value,
      url: urlInput.value,
      tags: tagsInput.value.split(',').map(t => t.trim()).filter(Boolean),
      source: 'chrome-extension'
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    try {
      const response = await fetch(`${API_URL}/content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        showStatus('✓ Saved successfully!', 'success');
        setTimeout(() => window.close(), 1500);
      } else if (response.status === 401) {
        loginPrompt.style.display = 'block';
        mainForm.style.display = 'none';
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      showStatus('✗ Failed to save. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Save to Synapse';
    }
  });

  async function savePage() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const data = {
      type: 'URL',
      title: tab.title || 'Untitled',
      url: tab.url,
      source: 'chrome-extension'
    };

    chrome.runtime.sendMessage({ action: 'saveContent', data }, (response) => {
      if (response.success) {
        showStatus('✓ Page saved!', 'success');
        setTimeout(() => window.close(), 1500);
      } else {
        showStatus('✗ Failed to save page', 'error');
      }
    });
  }
});

async function getAuthToken(): Promise<string | null> {
  const result = await chrome.storage.local.get(['accessToken']);
  return result.accessToken || null;
}

function showStatus(message: string, type: 'success' | 'error') {
  const statusDiv = document.getElementById('status') as HTMLDivElement;
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
  
  setTimeout(() => {
    statusDiv.style.display = 'none';
  }, 3000);
}

export {};
