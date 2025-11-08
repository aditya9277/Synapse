// Content script for injecting sidebar into pages
const API_URL = 'http://localhost:3000/api';

interface SynapseContent {
  id: string;
  title: string;
  description?: string;
  url?: string;
  type: string;
  tags: string[];
  createdAt: string;
  score?: number;
}

class SynapseSidebar {
  private sidebar: HTMLElement | null = null;
  private isVisible = false;
  private currentContext: any = {};

  constructor() {
    this.createSidebar();
    this.setupMessageListener();
  }

  private createSidebar() {
    // Create sidebar container
    this.sidebar = document.createElement('div');
    this.sidebar.id = 'synapse-sidebar';
    this.sidebar.innerHTML = `
      <div class="synapse-sidebar-header">
        <div class="synapse-logo">
          <span class="synapse-icon">⚡</span>
          <span class="synapse-title">Synapse</span>
        </div>
        <button class="synapse-close" id="synapse-close">×</button>
      </div>
      
      <div class="synapse-sidebar-content">
        <div class="synapse-current-page">
          <h3>Current Page</h3>
          <div class="synapse-page-info">
            <div class="synapse-page-title" id="synapse-page-title">Loading...</div>
            <button class="synapse-btn synapse-btn-primary" id="synapse-save-page">
              💾 Save Page
            </button>
          </div>
        </div>

        <div class="synapse-suggestions">
          <div class="synapse-section-header">
            <h3>🔍 Related Synapses</h3>
            <button class="synapse-btn synapse-btn-secondary" id="synapse-refresh">
              🔄 Refresh
            </button>
          </div>
          <div class="synapse-suggestions-content" id="synapse-suggestions-content">
            <div class="synapse-loading">Searching for related content...</div>
          </div>
        </div>

        <div class="synapse-actions">
          <button class="synapse-btn synapse-btn-secondary" id="synapse-open-dashboard">
            📊 Open Dashboard
          </button>
        </div>
      </div>
    `;

    // Add styles
    this.addStyles();

    // Add event listeners
    this.setupEventListeners();

    // Append to body
    document.body.appendChild(this.sidebar);
  }

  private addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #synapse-sidebar {
        position: fixed;
        top: 0;
        right: -400px;
        width: 400px;
        height: 100vh;
        background: #ffffff;
        box-shadow: -2px 0 20px rgba(0, 0, 0, 0.15);
        z-index: 2147483647;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        transition: right 0.3s ease-in-out;
        overflow-y: auto;
        border-left: 1px solid #e0e0e0;
      }

      #synapse-sidebar.synapse-visible {
        right: 0;
      }

      .synapse-sidebar-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        background: #1976d2;
        color: white;
        border-bottom: 1px solid #1565c0;
      }

      .synapse-logo {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        font-size: 18px;
      }

      .synapse-icon {
        font-size: 24px;
      }

      .synapse-close {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: background-color 0.2s;
      }

      .synapse-close:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }

      .synapse-sidebar-content {
        padding: 20px;
        height: calc(100vh - 80px);
        overflow-y: auto;
      }

      .synapse-current-page {
        margin-bottom: 24px;
      }

      .synapse-current-page h3 {
        margin: 0 0 12px 0;
        font-size: 16px;
        color: #333;
        font-weight: 600;
      }

      .synapse-page-info {
        background: #f5f5f5;
        padding: 16px;
        border-radius: 8px;
        border: 1px solid #e0e0e0;
      }

      .synapse-page-title {
        font-size: 14px;
        color: #666;
        margin-bottom: 12px;
        line-height: 1.4;
        max-height: 60px;
        overflow: hidden;
      }

      .synapse-suggestions {
        margin-bottom: 24px;
      }

      .synapse-section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }

      .synapse-section-header h3 {
        margin: 0;
        font-size: 16px;
        color: #333;
        font-weight: 600;
      }

      .synapse-btn {
        background: #1976d2;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        transition: background-color 0.2s;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .synapse-btn:hover {
        background: #1565c0;
      }

      .synapse-btn-secondary {
        background: #f5f5f5;
        color: #666;
        border: 1px solid #e0e0e0;
      }

      .synapse-btn-secondary:hover {
        background: #eeeeee;
        color: #333;
      }

      .synapse-btn-primary {
        width: 100%;
        justify-content: center;
      }

      .synapse-suggestions-content {
        max-height: 400px;
        overflow-y: auto;
      }

      .synapse-suggestion-item {
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 8px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .synapse-suggestion-item:hover {
        background: #f9f9f9;
        border-color: #1976d2;
      }

      .synapse-suggestion-title {
        font-weight: 500;
        font-size: 14px;
        color: #333;
        margin-bottom: 4px;
        line-height: 1.3;
      }

      .synapse-suggestion-desc {
        font-size: 12px;
        color: #666;
        line-height: 1.4;
        margin-bottom: 6px;
      }

      .synapse-suggestion-meta {
        display: flex;
        gap: 8px;
        font-size: 11px;
        color: #999;
      }

      .synapse-suggestion-score {
        background: #e3f2fd;
        color: #1976d2;
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 500;
      }

      .synapse-loading {
        text-align: center;
        color: #666;
        padding: 20px;
        font-size: 14px;
      }

      .synapse-empty {
        text-align: center;
        color: #999;
        padding: 20px;
        font-size: 14px;
      }

      .synapse-actions {
        border-top: 1px solid #e0e0e0;
        padding-top: 16px;
      }

      .synapse-actions .synapse-btn {
        width: 100%;
        justify-content: center;
      }

      @media (max-width: 768px) {
        #synapse-sidebar {
          width: 100vw;
          right: -100vw;
        }
      }
    `;
    document.head.appendChild(style);
  }

  private setupEventListeners() {
    if (!this.sidebar) return;

    // Close button
    this.sidebar.querySelector('#synapse-close')?.addEventListener('click', () => {
      this.hide();
    });

    // Save page button
    this.sidebar.querySelector('#synapse-save-page')?.addEventListener('click', () => {
      this.saveCurrentPage();
    });

    // Refresh suggestions
    this.sidebar.querySelector('#synapse-refresh')?.addEventListener('click', () => {
      this.fetchSuggestions();
    });

    // Open dashboard
    this.sidebar.querySelector('#synapse-open-dashboard')?.addEventListener('click', () => {
      window.open('http://localhost:5173', '_blank');
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (this.isVisible && this.sidebar && !this.sidebar.contains(e.target as Node)) {
        this.hide();
      }
    });
  }

  private setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'toggle-sidebar') {
        this.toggle();
        sendResponse({ success: true });
      }
    });
  }

  public show() {
    if (!this.sidebar) return;
    this.isVisible = true;
    this.sidebar.classList.add('synapse-visible');
    this.initialize();
  }

  public hide() {
    if (!this.sidebar) return;
    this.isVisible = false;
    this.sidebar.classList.remove('synapse-visible');
  }

  public toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  private async initialize() {
    await this.extractPageContext();
    await this.fetchSuggestions();
    this.updatePageInfo();
  }

  private updatePageInfo() {
    const titleEl = this.sidebar?.querySelector('#synapse-page-title');
    if (titleEl) {
      titleEl.textContent = document.title || 'Unknown Page';
    }
  }

  private async extractPageContext() {
    try {
      const getMeta = (name: string) => {
        const meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"], meta[property="og:${name}"]`);
        return meta?.getAttribute('content') || '';
      };

      // Extract keywords from page
      const text = document.body.innerText;
      const words = text.toLowerCase().match(/\\b\\w{4,}\\b/g) || [];
      const wordFreq = words.reduce((acc: any, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {});
      
      // Get top keywords
      const topKeywords = Object.entries(wordFreq)
        .sort((a: any, b: any) => b[1] - a[1])
        .slice(0, 10)
        .map((entry: any) => entry[0]);

      this.currentContext = {
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
    } catch (error) {
      console.error('Failed to extract context:', error);
    }
  }

  private async fetchSuggestions() {
    const token = await this.getAuthToken();
    
    if (!token) {
      this.showEmptyState('Please login to see suggestions', '🔐');
      return;
    }

    // Build search query from current page context
    const searchQuery = this.buildSearchQuery();
    
    if (!searchQuery) {
      this.showEmptyState('Unable to analyze page context', '🤔');
      return;
    }

    try {
      // Use semantic search API to find related content
      const encodedQuery = encodeURIComponent(searchQuery);
      const response = await fetch(`${API_URL}/search?q=${encodedQuery}&limit=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch suggestions');

      const result = await response.json();
      const suggestions = result.data || result.results || result;
      
      // Ensure suggestions is an array
      if (!Array.isArray(suggestions)) {
        console.warn('Search API did not return an array:', suggestions);
        this.showEmptyState('No related content found', '📝');
        return;
      }
      
      this.displaySearchResults(suggestions);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      this.showEmptyState('Failed to load suggestions', '❌');
    }
  }

  private buildSearchQuery(): string {
    // Create a natural language query from the page context
    const parts: string[] = [];
    
    // Add page title (most important)
    if (this.currentContext.title) {
      parts.push(this.currentContext.title);
    }
    
    // Add description if available
    if (this.currentContext.description) {
      parts.push(this.currentContext.description);
    }
    
    // Add top headings
    if (this.currentContext.headings && this.currentContext.headings.length > 0) {
      parts.push(this.currentContext.headings.slice(0, 2).join(' '));
    }
    
    // Add top keywords
    if (this.currentContext.extractedKeywords && this.currentContext.extractedKeywords.length > 0) {
      parts.push(this.currentContext.extractedKeywords.slice(0, 5).join(' '));
    }
    
    // Combine and limit length
    const query = parts.join(' ').substring(0, 500);
    return query.trim();
  }

  private analyzeSuggestions(allContent: SynapseContent[], context: any) {
    // Safety check: ensure allContent is an array
    if (!Array.isArray(allContent)) {
      console.warn('analyzeSuggestions called with non-array:', allContent);
      return { related: [], similar: [] };
    }

    const related: SynapseContent[] = [];
    const similar: SynapseContent[] = [];

    // Extract search terms from current page
    const searchTerms = [
      ...(context.keywords || []),
      ...(context.extractedKeywords || []),
      context.domain,
      ...context.title?.toLowerCase().split(' ').filter((w: string) => w.length > 3) || []
    ].filter(term => term && typeof term === 'string')
     .map((term: string) => term.toLowerCase());

    allContent.forEach((item: SynapseContent) => {
      let score = 0;
      const itemText = `${item.title} ${item.description || ''} ${item.tags?.join(' ') || ''}`.toLowerCase();
      
      // Calculate relevance score
      searchTerms.forEach((term: string) => {
        if (itemText.includes(term)) score += 10;
      });

      // Boost if same domain
      if (item.url && context.url) {
        try {
          if (new URL(item.url).hostname === context.domain) {
            score += 50;
          }
        } catch (e) {
          // Invalid URL, skip domain check
        }
      }

      // Boost if tags match
      if (item.tags) {
        item.tags.forEach((tag: string) => {
          if (searchTerms.includes(tag.toLowerCase())) score += 20;
        });
      }

      // Add to suggestions if score is high enough
      if (score > 15) {
        related.push({ ...item, score });
      } else if (score > 5) {
        similar.push({ ...item, score });
      }
    });

    // Sort by score
    related.sort((a, b) => (b.score || 0) - (a.score || 0));
    similar.sort((a, b) => (b.score || 0) - (a.score || 0));

    return {
      related: related.slice(0, 5),
      similar: similar.slice(0, 3)
    };
  }

  private displaySearchResults(suggestions: SynapseContent[]) {
    const container = this.sidebar?.querySelector('#synapse-suggestions-content');
    if (!container) return;

    if (suggestions.length === 0) {
      this.showEmptyState('No related synapses found', '🔍');
      return;
    }

    container.innerHTML = suggestions.map(item => `
      <div class="synapse-suggestion-item" data-url="${item.url || '#'}" data-id="${item.id}">
        <div class="synapse-suggestion-title">${this.escapeHtml(item.title)}</div>
        ${item.description ? `<div class="synapse-suggestion-desc">${this.escapeHtml(item.description.substring(0, 100))}${item.description.length > 100 ? '...' : ''}</div>` : ''}
        <div class="synapse-suggestion-meta">
          <span>${item.type}</span>
          ${item.tags && item.tags.length > 0 ? `<span>🏷️ ${item.tags.slice(0, 2).join(', ')}</span>` : ''}
          <span>${new Date(item.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    `).join('');

    // Add click handlers
    container.querySelectorAll('.synapse-suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        const url = item.getAttribute('data-url');
        if (url && url !== '#') {
          window.open(url, '_blank');
        }
      });
    });
  }

  private showEmptyState(message: string, icon: string) {
    const container = this.sidebar?.querySelector('#synapse-suggestions-content');
    if (container) {
      container.innerHTML = `
        <div class="synapse-empty">
          <div style="font-size: 32px; margin-bottom: 8px;">${icon}</div>
          <div>${message}</div>
        </div>
      `;
    }
  }

  private async saveCurrentPage() {
    const token = await this.getAuthToken();
    
    if (!token) {
      this.showNotification('Please login first', 'error');
      return;
    }

    try {
      const pageData = {
        type: 'URL',
        title: document.title,
        url: window.location.href,
        description: this.currentContext.description || '',
        metadata: {
          domain: window.location.hostname,
          extractedKeywords: this.currentContext.extractedKeywords || [],
          headings: this.currentContext.headings || []
        }
      };

      const response = await fetch(`${API_URL}/content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(pageData)
      });

      if (response.ok) {
        this.showNotification('Page saved successfully!', 'success');
        this.fetchSuggestions(); // Refresh suggestions
      } else {
        throw new Error('Failed to save page');
      }
    } catch (error) {
      console.error('Save failed:', error);
      this.showNotification('Failed to save page', 'error');
    }
  }

  private showNotification(message: string, type: 'success' | 'error') {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 2147483648;
      padding: 12px 16px;
      border-radius: 6px;
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      background: ${type === 'success' ? '#4caf50' : '#f44336'};
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      transition: opacity 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  private async getAuthToken(): Promise<string | null> {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'getAuthToken' }, (response) => {
        resolve(response?.token || null);
      });
    });
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize sidebar when content script loads
let synapseSidebar: SynapseSidebar;

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    synapseSidebar = new SynapseSidebar();
  });
} else {
  synapseSidebar = new SynapseSidebar();
}