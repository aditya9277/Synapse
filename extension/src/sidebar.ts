const API_URL = 'http://localhost:3000/api';

let currentTab: chrome.tabs.Tab;
let currentContext: any = {};

document.addEventListener('DOMContentLoaded', async () => {
  await initialize();
  
  // Set up button handlers
  document.getElementById('save-current')?.addEventListener('click', saveCurrentPage);
  document.getElementById('refresh-suggestions')?.addEventListener('click', refreshSuggestions);
  document.getElementById('open-dashboard')?.addEventListener('click', openDashboard);
});

async function initialize() {
  // Get current tab
  [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // Update UI
  const titleEl = document.getElementById('current-page-title');
  if (titleEl) {
    titleEl.textContent = currentTab.title || 'Unknown Page';
  }
  
  // Extract page context
  await extractPageContext();
  
  // Fetch suggestions
  await fetchSuggestions();
}

async function extractPageContext() {
  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: currentTab.id! },
      func: () => {
        const getMeta = (name: string) => {
          const meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"], meta[property="og:${name}"]`);
          return meta?.getAttribute('content') || '';
        };

        // Extract keywords from page
        const text = document.body.innerText;
        const words = text.toLowerCase().match(/\b\w{4,}\b/g) || [];
        const wordFreq = words.reduce((acc: any, word) => {
          acc[word] = (acc[word] || 0) + 1;
          return acc;
        }, {});
        
        // Get top keywords
        const topKeywords = Object.entries(wordFreq)
          .sort((a: any, b: any) => b[1] - a[1])
          .slice(0, 10)
          .map((entry: any) => entry[0]);

        return {
          title: document.title,
          description: getMeta('description'),
          keywords: getMeta('keywords')?.split(',').map((k: string) => k.trim()) || [],
          url: window.location.href,
          domain: window.location.hostname,
          extractedKeywords: topKeywords,
          headings: Array.from(document.querySelectorAll('h1, h2, h3'))
            .map(h => h.textContent)
            .filter(Boolean)
            .slice(0, 5)
        };
      }
    });

    currentContext = result?.result || {};
  } catch (error) {
    console.error('Failed to extract context:', error);
  }
}

async function fetchSuggestions() {
  const token = await getAuthToken();
  
  if (!token) {
    showEmptyState('Please login to see suggestions', '🔐');
    return;
  }

  try {
    // Get all user content
    const response = await fetch(`${API_URL}/content?limit=100`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Failed to fetch content');

    const allContent = await response.json();
    
    // Analyze and categorize suggestions
    const suggestions = analyzeSuggestions(allContent, currentContext);
    
    displaySuggestions(suggestions);
  } catch (error) {
    console.error('Failed to fetch suggestions:', error);
    showEmptyState('Failed to load suggestions', '❌');
  }
}

function analyzeSuggestions(allContent: any[], context: any) {
  const related: any[] = [];
  const similar: any[] = [];
  const recent: any[] = [];

  // Extract search terms from current page
  const searchTerms = [
    ...(context.keywords || []),
    ...(context.extractedKeywords || []),
    context.domain,
    ...context.title?.toLowerCase().split(' ').filter((w: string) => w.length > 3) || []
  ].map((term: string) => term.toLowerCase());

  allContent.forEach((item: any) => {
    let score = 0;
    const itemText = `${item.title} ${item.description || ''} ${item.contentText || ''} ${item.tags?.join(' ') || ''}`.toLowerCase();
    
    // Calculate relevance score
    searchTerms.forEach((term: string) => {
      if (itemText.includes(term)) score += 10;
    });

    // Boost if same domain
    if (item.url && context.url && new URL(item.url).hostname === context.domain) {
      score += 50;
    }

    // Boost if tags match
    if (item.tags) {
      item.tags.forEach((tag: string) => {
        if (searchTerms.includes(tag.toLowerCase())) score += 20;
      });
    }

    // Calculate recency (within last 7 days)
    const daysSinceCreated = (Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreated < 7) {
      recent.push({ ...item, score, daysSinceCreated });
    }

    // Add to related if score is high
    if (score > 15) {
      related.push({ ...item, score });
    } else if (score > 5) {
      similar.push({ ...item, score });
    }
  });

  // Sort by score
  related.sort((a, b) => b.score - a.score);
  similar.sort((a, b) => b.score - a.score);
  recent.sort((a, b) => a.daysSinceCreated - b.daysSinceCreated);

  return {
    related: related.slice(0, 5),
    similar: similar.slice(0, 5),
    recent: recent.slice(0, 5)
  };
}

function displaySuggestions(suggestions: any) {
  const contentEl = document.getElementById('content');
  if (!contentEl) return;

  // Update stats
  document.getElementById('related-count')!.textContent = suggestions.related.length.toString();
  document.getElementById('similar-count')!.textContent = suggestions.similar.length.toString();
  document.getElementById('recent-count')!.textContent = suggestions.recent.length.toString();

  if (suggestions.related.length === 0 && suggestions.similar.length === 0 && suggestions.recent.length === 0) {
    showEmptyState('No related content found. Start saving to see suggestions!', '📭');
    return;
  }

  let html = '';

  // Show context info
  if (currentContext.extractedKeywords && currentContext.extractedKeywords.length > 0) {
    html += `
      <div class="context-info">
        <span>🔍</span>
        <span>Searching for: ${currentContext.extractedKeywords.slice(0, 3).join(', ')}</span>
      </div>
    `;
  }

  // Related content (high relevance)
  if (suggestions.related.length > 0) {
    html += `
      <div class="section">
        <div class="section-title">🎯 Highly Related</div>
        ${suggestions.related.map((item: any) => renderSuggestionCard(item)).join('')}
      </div>
    `;
  }

  // Similar content (medium relevance)
  if (suggestions.similar.length > 0) {
    html += `
      <div class="section">
        <div class="section-title">🔗 Similar Content</div>
        ${suggestions.similar.map((item: any) => renderSuggestionCard(item)).join('')}
      </div>
    `;
  }

  // Recent content
  if (suggestions.recent.length > 0) {
    html += `
      <div class="section">
        <div class="section-title">⏰ Recently Saved</div>
        ${suggestions.recent.map((item: any) => renderSuggestionCard(item, true)).join('')}
      </div>
    `;
  }

  contentEl.innerHTML = html;

  // Add click handlers
  contentEl.querySelectorAll('.suggestion-card').forEach((card) => {
    card.addEventListener('click', () => {
      const itemId = card.getAttribute('data-id');
      openContent(itemId!);
    });
  });
}

function renderSuggestionCard(item: any, showTime: boolean = false): string {
  const typeIcon = getTypeIcon(item.type);
  const score = Math.round(item.score || 0);
  const timeAgo = showTime ? getTimeAgo(item.createdAt) : '';
  
  return `
    <div class="suggestion-card" data-id="${item.id}">
      <div class="title">
        <span>${typeIcon}</span>
        <span>${item.title}</span>
      </div>
      <div class="meta">
        ${score > 0 ? `<span class="score">Match: ${score}%</span>` : ''}
        ${timeAgo ? `<span>${timeAgo}</span>` : ''}
        ${item.tags && item.tags.length > 0 ? item.tags.slice(0, 2).map((tag: string) => `<span class="tag">${tag}</span>`).join('') : ''}
      </div>
    </div>
  `;
}

function getTypeIcon(type: string): string {
  const icons: any = {
    'URL': '🔗',
    'NOTE': '📝',
    'ARTICLE': '📄',
    'TODO': '✅',
    'CODE': '💻',
    'PRODUCT': '🛍️',
    'VIDEO': '🎥',
    'IMAGE': '🖼️',
    'PDF': '📕'
  };
  return icons[type] || '📌';
}

function getTimeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
}

function showEmptyState(message: string, icon: string) {
  const contentEl = document.getElementById('content');
  if (!contentEl) return;
  
  contentEl.innerHTML = `
    <div class="empty-state">
      <div class="icon">${icon}</div>
      <div>${message}</div>
    </div>
  `;
}

async function saveCurrentPage() {
  const token = await getAuthToken();
  if (!token) {
    alert('Please login first');
    return;
  }

  const btn = document.getElementById('save-current') as HTMLButtonElement;
  btn.textContent = '⏳ Saving...';
  btn.disabled = true;

  try {
    const response = await fetch(`${API_URL}/content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        type: 'URL',
        title: currentTab.title,
        url: currentTab.url,
        description: currentContext.description,
        tags: currentContext.keywords || [],
        source: 'chrome-extension-sidebar'
      })
    });

    if (response.ok) {
      btn.textContent = '✅ Saved!';
      setTimeout(() => {
        btn.textContent = '💾 Save';
        btn.disabled = false;
        refreshSuggestions();
      }, 2000);
    } else {
      throw new Error('Failed to save');
    }
  } catch (error) {
    btn.textContent = '❌ Failed';
    setTimeout(() => {
      btn.textContent = '💾 Save';
      btn.disabled = false;
    }, 2000);
  }
}

async function refreshSuggestions() {
  const btn = document.getElementById('refresh-suggestions') as HTMLButtonElement;
  btn.textContent = '⏳ Loading...';
  btn.disabled = true;

  await extractPageContext();
  await fetchSuggestions();

  btn.textContent = '🔄 Refresh';
  btn.disabled = false;
}

function openDashboard() {
  chrome.tabs.create({ url: 'http://localhost:5173/dashboard' });
}

function openContent(itemId: string) {
  chrome.tabs.create({ url: `http://localhost:5173/content/${itemId}` });
}

async function getAuthToken(): Promise<string | null> {
  const result = await chrome.storage.local.get(['accessToken']);
  return result.accessToken || null;
}

export {};
