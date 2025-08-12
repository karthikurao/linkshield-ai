// background.js - Service Worker for Chrome Extension
class LinkShieldAPI {
  constructor() {
    this.baseURL = 'http://localhost:8000'; // Change to your production API URL
    this.cache = new Map();
    this.cacheExpiry = 2 * 60 * 1000; // 2 minutes for faster updates
    this.requestTimeout = 5000; // 5 second timeout
  }

  async scanURL(url) {
    // Check cache first
    const cacheKey = url;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      console.log('LinkShield: Using cached result for', url);
      return cached.result;
    }

    console.log('LinkShield: Scanning URL:', url);
    
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

      const response = await fetch(`${this.baseURL}/api/v1/predict/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('LinkShield: API response:', result);
      
      // Normalize the response format
      const normalizedResult = {
        status: this.normalizeStatus(result.status || result.message),
        confidence: result.confidence || 0.5,
        url: url,
        message: result.message || `URL scanned successfully`,
        details: result.details || [],
        scan_id: result.scan_id || Date.now().toString()
      };
      
      // Cache the result
      this.cache.set(cacheKey, {
        result: normalizedResult,
        timestamp: Date.now()
      });

      return normalizedResult;
    } catch (error) {
      console.error('LinkShield API Error:', error);
      
      // Return a fallback result based on URL analysis
      return this.getFallbackAnalysis(url);
    }
  }

  normalizeStatus(status) {
    if (!status) return 'unknown';
    const normalizedStatus = status.toLowerCase();
    
    if (normalizedStatus.includes('safe') || normalizedStatus.includes('benign') || normalizedStatus.includes('legitimate')) {
      return 'safe';
    } else if (normalizedStatus.includes('malicious') || normalizedStatus.includes('phishing') || normalizedStatus.includes('dangerous')) {
      return 'malicious';
    } else if (normalizedStatus.includes('suspicious') || normalizedStatus.includes('warning')) {
      return 'suspicious';
    }
    
    return 'unknown';
  }

  getFallbackAnalysis(url) {
    console.log('LinkShield: Using fallback analysis for', url);
    
    try {
      const urlObj = new URL(url);
      let riskScore = 0;
      let riskFactors = [];

      // Check for HTTP (not HTTPS)
      if (urlObj.protocol === 'http:') {
        riskScore += 0.3;
        riskFactors.push('Insecure HTTP connection');
      }

      // Check for suspicious domains
      const suspiciousDomains = ['bit.ly', 'tinyurl.com', 'short.link', 't.co'];
      if (suspiciousDomains.some(domain => urlObj.hostname.includes(domain))) {
        riskScore += 0.4;
        riskFactors.push('URL shortener detected');
      }

      // Check for IP addresses instead of domains
      if (/^\d+\.\d+\.\d+\.\d+/.test(urlObj.hostname)) {
        riskScore += 0.5;
        riskFactors.push('IP address instead of domain name');
      }

      // Check for suspicious subdomains
      const parts = urlObj.hostname.split('.');
      if (parts.length > 3) {
        riskScore += 0.2;
        riskFactors.push('Multiple subdomains detected');
      }

      // Check for suspicious characters
      if (urlObj.href.match(/[^\w\-\.\/\?\=\&\%\:\@]/)) {
        riskScore += 0.2;
        riskFactors.push('Unusual characters in URL');
      }

      let status = 'safe';
      if (riskScore > 0.7) {
        status = 'malicious';
      } else if (riskScore > 0.4) {
        status = 'suspicious';
      }

      return {
        status: status,
        confidence: Math.min(0.9, 0.5 + riskScore),
        url: url,
        message: `Fallback analysis: ${status} (${riskFactors.length} risk factors)`,
        details: riskFactors,
        scan_id: 'fallback_' + Date.now()
      };
    } catch (error) {
      return {
        status: 'unknown',
        confidence: 0.5,
        url: url,
        message: 'Unable to analyze URL',
        details: ['URL analysis failed'],
        scan_id: 'error_' + Date.now()
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

// Listen for navigation events - BEFORE navigation completes
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  // Only process main frame navigations (not iframes)
  if (details.frameId === 0) {
    const url = details.url;
    
    // Skip internal pages
    if (url.startsWith('chrome://') || 
        url.startsWith('chrome-extension://') ||
        url.startsWith('moz-extension://') ||
        url.startsWith('about:')) {
      return;
    }

    console.log('LinkShield: Scanning URL before navigation:', url);
    
    // Scan the URL immediately
    const result = await linkShieldAPI.scanURL(url);
    
    console.log('LinkShield: Scan result:', result);
    
    // Store result for popup and content script
    await chrome.storage.session.set({
      [`scan_${details.tabId}`]: {
        url: url,
        result: result,
        timestamp: Date.now()
      }
    });

    // If it's malicious, block the navigation
    if (result.status === 'malicious' && result.confidence > 0.8) {
      // Try to block navigation by redirecting to warning page
      chrome.tabs.update(details.tabId, {
        url: chrome.runtime.getURL('warning.html') + '?blocked=' + encodeURIComponent(url)
      });
      return;
    }

    // Update badge based on result
    if (result.status === 'suspicious' || result.status === 'malicious') {
      chrome.action.setBadgeText({
        text: '⚠',
        tabId: details.tabId
      });
      
      chrome.action.setBadgeBackgroundColor({
        color: result.status === 'malicious' ? '#ef4444' : '#f59e0b',
        tabId: details.tabId
      });
    } else if (result.status === 'safe') {
      chrome.action.setBadgeText({
        text: '✓',
        tabId: details.tabId
      });
      
      chrome.action.setBadgeBackgroundColor({
        color: '#10b981',
        tabId: details.tabId
      });
    }
  }
});

// Also listen for completed navigation to inject warnings
chrome.webNavigation.onCompleted.addListener(async (details) => {
  if (details.frameId === 0) {
    const url = details.url;
    
    // Skip internal pages
    if (url.startsWith('chrome://') || 
        url.startsWith('chrome-extension://') ||
        url.startsWith('moz-extension://') ||
        url.startsWith('about:')) {
      return;
    }

    // Get stored scan result
    const stored = await chrome.storage.session.get([`scan_${details.tabId}`]);
    const scanData = stored[`scan_${details.tabId}`];
    
    if (scanData && scanData.result) {
      const result = scanData.result;
      
      // Show notifications for threats
      if (result.status === 'suspicious' || result.status === 'malicious') {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: 'LinkShield AI Warning',
          message: `${result.status.toUpperCase()} website detected! Confidence: ${Math.round(result.confidence * 100)}%`
        });

        // Inject warning banner after page loads
        setTimeout(() => {
          chrome.scripting.executeScript({
            target: { tabId: details.tabId },
            func: showWarningBanner,
            args: [result]
          }).catch(err => console.log('Could not inject script:', err));
        }, 1000);
      }
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
