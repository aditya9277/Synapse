// Content script - runs on web pages
console.log('Synapse content script loaded');

// Add visual indicator when text is selected
document.addEventListener('mouseup', () => {
  const selection = window.getSelection();
  if (selection && selection.toString().trim().length > 0) {
    // Could add a floating button here to save selection
  }
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPageContent') {
    const pageData = {
      title: document.title,
      url: window.location.href,
      description: getMetaDescription(),
      content: getPageContent(),
      images: getPageImages()
    };
    sendResponse(pageData);
  }
  return true;
});

function getMetaDescription(): string {
  const meta = document.querySelector('meta[name="description"]') as HTMLMetaElement;
  return meta?.content || '';
}

function getPageContent(): string {
  // Get main content, excluding scripts and styles
  const clone = document.body.cloneNode(true) as HTMLElement;
  const scripts = clone.querySelectorAll('script, style, nav, header, footer');
  scripts.forEach(el => el.remove());
  return clone.innerText.substring(0, 5000); // First 5000 chars
}

function getPageImages(): string[] {
  const images = document.querySelectorAll('img');
  return Array.from(images)
    .map(img => img.src)
    .filter(src => src.startsWith('http'))
    .slice(0, 5);
}

export {};
