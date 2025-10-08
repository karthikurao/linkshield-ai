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
    
    // Update based on status (handle both 'safe' and 'benign')
    const status = result.status === 'benign' ? 'safe' : result.status;
    
    switch (status) {
      case 'safe':
        indicator.classList.add('status-safe');
        statusText.innerHTML = '<span style="color: #10b981; font-weight: bold;">✅ Safe</span>';
        elements.confidenceScore.textContent = `Confidence: ${Math.round(result.confidence * 100)}%`;
        elements.confidenceScore.style.color = '#10b981';
        break;
      case 'suspicious':
        indicator.classList.add('status-suspicious');
        statusText.innerHTML = '<span style="color: #f59e0b; font-weight: bold;">⚠️ Suspicious</span>';
        elements.confidenceScore.textContent = `Confidence: ${Math.round(result.confidence * 100)}%`;
        elements.confidenceScore.style.color = '#f59e0b';
        break;
      case 'malicious':
        indicator.classList.add('status-malicious');
        statusText.innerHTML = '<span style="color: #ef4444; font-weight: bold; font-size: 1.1em;">🚨 MALICIOUS - DANGER</span>';
        elements.confidenceScore.innerHTML = `<span style="color: #ef4444; font-weight: bold;">Confidence: ${Math.round(result.confidence * 100)}%</span>`;
        // Add pulsing animation to make it more noticeable
        statusText.style.animation = 'pulse 2s infinite';
        break;
      default:
        indicator.classList.add('status-unknown');
        statusText.textContent = '❓ Unknown';
        elements.confidenceScore.textContent = result.message || 'Unable to analyze';
        elements.confidenceScore.style.color = '#64748b';
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
          
          // Determine color based on impact level
          let impactColor = '#64748b'; // default gray
          let impactBg = '#f1f5f9';
          
          if (factor.impact === 'high' || factor.impact === 'critical') {
            impactColor = '#ef4444'; // red
            impactBg = '#fee2e2';
          } else if (factor.impact === 'medium') {
            impactColor = '#f59e0b'; // orange
            impactBg = '#fef3c7';
          } else if (factor.impact === 'low') {
            impactColor = '#10b981'; // green
            impactBg = '#d1fae5';
          }
          
          factorDiv.style.backgroundColor = impactBg;
          factorDiv.style.borderLeft = `4px solid ${impactColor}`;
          factorDiv.style.padding = '8px';
          factorDiv.style.marginBottom = '8px';
          factorDiv.style.borderRadius = '4px';
          
          factorDiv.innerHTML = `
            <strong style="color: ${impactColor};">${factor.name}</strong> 
            <span style="color: ${impactColor}; font-size: 0.85em; font-weight: bold;">(${factor.impact.toUpperCase()})</span>
            <br><small style="color: #475569;">${factor.description}</small>
          `;
          elements.riskFactors.appendChild(factorDiv);
        });
        
        // Also display details if available with severity-based coloring
        if (analysis.details && Array.isArray(analysis.details)) {
          analysis.details.forEach(detail => {
            const detailDiv = document.createElement('div');
            detailDiv.className = 'risk-factor';
            
            let detailColor = '#64748b';
            let detailBg = '#f1f5f9';
            let detailBorder = '#cbd5e1';
            
            // Check for severity indicators in the detail text
            if (detail.includes('🚨') || detail.includes('CRITICAL')) {
              detailColor = '#dc2626';
              detailBg = '#fee2e2';
              detailBorder = '#ef4444';
            } else if (detail.includes('🔴') || detail.includes('OVERRIDE')) {
              detailColor = '#ef4444';
              detailBg = '#fef2f2';
              detailBorder = '#f87171';
            } else if (detail.includes('⚠️') || detail.includes('ALERT')) {
              detailColor = '#ea580c';
              detailBg = '#ffedd5';
              detailBorder = '#fb923c';
            } else if (detail.includes('🟡') || detail.includes('WARNING')) {
              detailColor = '#d97706';
              detailBg = '#fef3c7';
              detailBorder = '#fbbf24';
            }
            
            detailDiv.style.backgroundColor = detailBg;
            detailDiv.style.borderLeft = `4px solid ${detailBorder}`;
            detailDiv.style.padding = '8px';
            detailDiv.style.marginBottom = '6px';
            detailDiv.style.borderRadius = '4px';
            detailDiv.style.color = detailColor;
            detailDiv.style.fontSize = '0.9em';
            detailDiv.innerHTML = `<strong>${detail}</strong>`;
            
            elements.riskFactors.appendChild(detailDiv);
          });
        }
        
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
