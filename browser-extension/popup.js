// popup.js - Popup functionality for LinkShield AI extension
document.addEventListener('DOMContentLoaded', async () => {
  const elements = {
    loading: document.getElementById('loading'),
    mainContent: document.getElementById('main-content'),
    currentUrl: document.getElementById('current-url'),
    siteStatus: document.getElementById('site-status'),
    confidenceScore: document.getElementById('confidence-score'),
    rescanBtn: document.getElementById('rescan-btn'),
    detailsBtn: document.getElementById('details-btn'),
    sitesScanned: document.getElementById('sites-scanned'),
    threatsBlocked: document.getElementById('threats-blocked'),
    detailedAnalysis: document.getElementById('detailed-analysis'),
    riskFactors: document.getElementById('risk-factors'),
    errorMessage: document.getElementById('error-message'),
    openDashboard: document.getElementById('open-dashboard'),
    settings: document.getElementById('settings'),
    help: document.getElementById('help')
  };

  let currentTab = null;
  let currentScanResult = null;

  // Initialize popup
  await initializePopup();

  // Event listeners
  elements.rescanBtn.addEventListener('click', rescanCurrentSite);
  elements.detailsBtn.addEventListener('click', showDetailedAnalysis);
  elements.openDashboard.addEventListener('click', openDashboard);
  elements.settings.addEventListener('click', openSettings);
  elements.help.addEventListener('click', openHelp);

  async function initializePopup() {
    try {
      // Get current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      currentTab = tab;

      if (!tab) {
        showError('Unable to access current tab');
        return;
      }

      // Update URL display
      elements.currentUrl.textContent = tab.url;

      // Load statistics
      await loadStatistics();

      // Check if we have a cached scan result for this tab
      const cached = await chrome.storage.session.get([`scan_${tab.id}`]);
      if (cached[`scan_${tab.id}`]) {
        const scanData = cached[`scan_${tab.id}`];
        currentScanResult = scanData.result;
        updateStatusDisplay(scanData.result);
        hideLoading();
      } else {
        // Perform new scan
        await scanCurrentSite();
      }
    } catch (error) {
      console.error('Error initializing popup:', error);
      showError('Failed to initialize extension');
    }
  }

  async function scanCurrentSite() {
    if (!currentTab) return;

    try {
      showLoading();
      
      // Send scan request to background script
      const result = await chrome.runtime.sendMessage({
        action: 'scanURL',
        url: currentTab.url
      });

      if (result) {
        currentScanResult = result;
        updateStatusDisplay(result);
        
        // Update statistics if threat detected
        if (result.status === 'suspicious' || result.status === 'malicious') {
          await incrementThreatsBlocked();
        }
        await incrementSitesScanned();
      } else {
        showError('Failed to scan current site');
      }
    } catch (error) {
      console.error('Error scanning site:', error);
      showError('Scan failed: ' + error.message);
    } finally {
      hideLoading();
    }
  }

  async function rescanCurrentSite() {
    // Clear cache for current tab
    if (currentTab) {
      await chrome.storage.session.remove([`scan_${currentTab.id}`]);
    }
    await scanCurrentSite();
  }

  function updateStatusDisplay(result) {
    const statusElement = elements.siteStatus;
    const indicator = statusElement.querySelector('.status-indicator');
    const statusText = statusElement.querySelector('span') || statusElement;

    // Clear previous classes
    indicator.className = 'status-indicator';
    
    switch (result.status) {
      case 'safe':
        indicator.classList.add('status-safe');
        statusText.textContent = '✅ Safe';
        elements.confidenceScore.textContent = `Confidence: ${Math.round(result.confidence * 100)}%`;
        break;
      case 'suspicious':
        indicator.classList.add('status-suspicious');
        statusText.textContent = '⚠️ Suspicious';
        elements.confidenceScore.textContent = `Confidence: ${Math.round(result.confidence * 100)}%`;
        break;
      case 'malicious':
        indicator.classList.add('status-malicious');
        statusText.textContent = '🚨 Malicious';
        elements.confidenceScore.textContent = `Confidence: ${Math.round(result.confidence * 100)}%`;
        break;
      default:
        indicator.classList.add('status-unknown');
        statusText.textContent = '❓ Unknown';
        elements.confidenceScore.textContent = result.message || 'Unable to analyze';
    }
  }

  async function showDetailedAnalysis() {
    if (!currentScanResult || !currentTab) return;

    try {
      elements.detailsBtn.textContent = '⏳ Loading...';
      
      const analysis = await chrome.runtime.sendMessage({
        action: 'getDetailedAnalysis',
        url: currentTab.url
      });

      if (analysis && analysis.risk_factors) {
        elements.riskFactors.innerHTML = '';
        
        analysis.risk_factors.forEach(factor => {
          const factorDiv = document.createElement('div');
          factorDiv.className = 'risk-factor';
          factorDiv.innerHTML = `
            <strong>${factor.name}</strong> (${factor.impact})
            <br><small>${factor.description}</small>
          `;
          elements.riskFactors.appendChild(factorDiv);
        });
        
        elements.detailedAnalysis.style.display = 'block';
        elements.detailsBtn.textContent = '📊 Hide Details';
        elements.detailsBtn.onclick = hideDetailedAnalysis;
      } else {
        showError('Detailed analysis not available');
      }
    } catch (error) {
      console.error('Error getting detailed analysis:', error);
      showError('Failed to load detailed analysis');
    } finally {
      elements.detailsBtn.textContent = '📊 Details';
    }
  }

  function hideDetailedAnalysis() {
    elements.detailedAnalysis.style.display = 'none';
    elements.detailsBtn.textContent = '📊 Details';
    elements.detailsBtn.onclick = showDetailedAnalysis;
  }

  async function loadStatistics() {
    const stats = await chrome.storage.local.get(['sitesScanned', 'threatsBlocked']);
    elements.sitesScanned.textContent = stats.sitesScanned || 0;
    elements.threatsBlocked.textContent = stats.threatsBlocked || 0;
  }

  async function incrementSitesScanned() {
    const stats = await chrome.storage.local.get(['sitesScanned']);
    const count = (stats.sitesScanned || 0) + 1;
    await chrome.storage.local.set({ sitesScanned: count });
    elements.sitesScanned.textContent = count;
  }

  async function incrementThreatsBlocked() {
    const stats = await chrome.storage.local.get(['threatsBlocked']);
    const count = (stats.threatsBlocked || 0) + 1;
    await chrome.storage.local.set({ threatsBlocked: count });
    elements.threatsBlocked.textContent = count;
  }

  function showLoading() {
    elements.loading.style.display = 'block';
    elements.mainContent.style.display = 'none';
    elements.errorMessage.style.display = 'none';
  }

  function hideLoading() {
    elements.loading.style.display = 'none';
    elements.mainContent.style.display = 'block';
  }

  function showError(message) {
    elements.errorMessage.textContent = message;
    elements.errorMessage.style.display = 'block';
    hideLoading();
  }

  function openDashboard() {
    chrome.tabs.create({ url: 'http://localhost:3000' }); // Your frontend URL
  }

  function openSettings() {
    // Could open options page or settings modal
    chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
  }

  function openHelp() {
    chrome.tabs.create({ url: 'https://github.com/karthikurao/linkshield-ai' }); // Your GitHub repo
  }
});
