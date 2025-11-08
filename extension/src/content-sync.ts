// Content script to sync authentication token from webpage to extension storage
// This runs on localhost:5173 and localhost:5174 to capture the login token

console.log('Synapse token sync active');

// Function to sync token from localStorage to chrome.storage
function syncToken() {
  try {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (accessToken) {
      chrome.storage.local.set({ 
        accessToken, 
        refreshToken,
        syncedAt: new Date().toISOString()
      }, () => {
        console.log('✅ Token synced to extension storage');
        // Notify background script
        chrome.runtime.sendMessage({ 
          action: 'tokenSynced', 
          token: accessToken 
        });
      });
    } else {
      // If no token, clear extension storage
      chrome.storage.local.remove(['accessToken', 'refreshToken'], () => {
        console.log('🔒 Token cleared from extension storage');
      });
    }
  } catch (error) {
    console.error('Token sync failed:', error);
  }
}

// Sync immediately when script loads
syncToken();

// Watch for storage changes (when user logs in/out)
window.addEventListener('storage', (e) => {
  if (e.key === 'accessToken' || e.key === 'refreshToken') {
    console.log('🔄 Storage changed, syncing token...');
    syncToken();
  }
});

// Also check periodically every 2 seconds for token changes
setInterval(() => {
  const currentToken = localStorage.getItem('accessToken');
  chrome.storage.local.get(['accessToken'], (result) => {
    if (currentToken !== result.accessToken) {
      console.log('🔄 Token mismatch detected, syncing...');
      syncToken();
    }
  });
}, 2000);

// Listen for manual sync requests from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'syncToken') {
    syncToken();
    sendResponse({ success: true });
  }
  return true;
});

export {};
