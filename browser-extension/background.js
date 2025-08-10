// background.js - Service Worker for Chrome Extension
class LinkShieldAPI {
  constructor() {
    this.baseURL = 'http://localhost:8000'; // Change to your production API URL
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  async scanURL(url) {
    // Check cache first
    const cacheKey = url;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.result;
    }

    try {
      const response = await fetch(`${this.baseURL}/api/v1/predict/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      
      // Cache the result
      this.cache.set(cacheKey, {
        result: result,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      console.error('LinkShield API Error:', error);
      return {
        status: 'error',
        message: 'Failed to scan URL',
        confidence: 0,
        url: url
      };
    }
  }

  async getDetailedAnalysis(url) {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/analyze-url?url=${encodeURIComponent(url)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('LinkShield Analysis Error:', error);
      return null;
    }
  }
}

const linkShieldAPI = new LinkShieldAPI();

// Listen for navigation events
chrome.webNavigation.onCompleted.addListener(async (details) => {
  // Only process main frame navigations (not iframes)
  if (details.frameId === 0) {
    const url = details.url;
    
    // Skip internal pages and common safe domains
    if (url.startsWith('chrome://') || 
        url.startsWith('chrome-extension://') ||
        url.startsWith('moz-extension://') ||
        url.includes('google.com') ||
        url.includes('youtube.com') ||
        url.includes('github.com')) {
      return;
    }

    // Scan the URL
    const result = await linkShieldAPI.scanURL(url);
    
    // Store result for popup and content script
    await chrome.storage.session.set({
      [`scan_${details.tabId}`]: {
        url: url,
        result: result,
        timestamp: Date.now()
      }
    });

    // If it's suspicious or malicious, show warning
    if (result.status === 'suspicious' || result.status === 'malicious') {
      // Update badge
      chrome.action.setBadgeText({
        text: '!',
        tabId: details.tabId
      });
      
      chrome.action.setBadgeBackgroundColor({
        color: result.status === 'malicious' ? '#ef4444' : '#f59e0b',
        tabId: details.tabId
      });

      // Show notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'LinkShield AI Warning',
        message: `Potentially ${result.status} website detected! Confidence: ${Math.round(result.confidence * 100)}%`
      });

      // Inject warning into the page
      chrome.scripting.executeScript({
        target: { tabId: details.tabId },
        func: showWarningBanner,
        args: [result]
      });
    } else if (result.status === 'safe') {
      // Clear badge for safe sites
      chrome.action.setBadgeText({
        text: '',
        tabId: details.tabId
      });
    }
  }
});

// Function to inject warning banner (will be stringified and injected)
function showWarningBanner(scanResult) {
  // Remove any existing warnings
  const existingWarning = document.getElementById('linkshield-warning');
  if (existingWarning) {
    existingWarning.remove();
  }

  // Create warning banner
  const warningDiv = document.createElement('div');
  warningDiv.id = 'linkshield-warning';
  warningDiv.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 999999;
    background: ${scanResult.status === 'malicious' ? '#ef4444' : '#f59e0b'};
    color: white;
    padding: 12px;
    text-align: center;
    font-family: Arial, sans-serif;
    font-size: 14px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    border-bottom: 3px solid ${scanResult.status === 'malicious' ? '#dc2626' : '#d97706'};
  `;

  warningDiv.innerHTML = `
    <div style="max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between;">
      <div style="display: flex; align-items: center;">
        <span style="margin-right: 10px; font-size: 18px;">⚠️</span>
        <strong>LinkShield AI Warning:</strong> 
        This website has been flagged as potentially ${scanResult.status}! 
        (Confidence: ${Math.round(scanResult.confidence * 100)}%)
      </div>
      <button id="linkshield-close" style="
        background: rgba(255,255,255,0.2);
        border: 1px solid rgba(255,255,255,0.3);
        color: white;
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      ">Close</button>
    </div>
  `;

  // Add close functionality
  warningDiv.querySelector('#linkshield-close').addEventListener('click', () => {
    warningDiv.remove();
  });

  // Insert at the beginning of the body
  document.body.insertBefore(warningDiv, document.body.firstChild);

  // Auto-hide after 10 seconds
  setTimeout(() => {
    if (document.getElementById('linkshield-warning')) {
      warningDiv.remove();
    }
  }, 10000);
}

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // This will open the popup, popup.html handles the rest
});

// Message handler for communication with content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scanURL') {
    linkShieldAPI.scanURL(request.url).then(result => {
      sendResponse(result);
    });
    return true; // Will respond asynchronously
  } else if (request.action === 'getDetailedAnalysis') {
    linkShieldAPI.getDetailedAnalysis(request.url).then(result => {
      sendResponse(result);
    });
    return true;
  }
});

// Clear badge when tab is updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading') {
    chrome.action.setBadgeText({
      text: '',
      tabId: tabId
    });
  }
});

console.log('LinkShield AI Extension Background Script Loaded');
