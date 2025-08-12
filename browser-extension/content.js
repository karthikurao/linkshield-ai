// content.js - Injected into every webpage
(function() {
  'use strict';

  let linkShieldAnalyzer = {
    // Track analyzed links to avoid duplicate checks
    analyzedLinks: new Set(),
    isScanning: false,
    
    // Initialize the analyzer
    init() {
      console.log('LinkShield: Content script initialized on', window.location.href);
      this.scanLinksOnPage();
      this.observeNewLinks();
      this.addHoverListeners();
      this.startPeriodicScan();
    },

    // Scan all links on the current page immediately
    async scanLinksOnPage() {
      if (this.isScanning) return;
      this.isScanning = true;
      
      console.log('LinkShield: Scanning links on page...');
      const links = document.querySelectorAll('a[href]');
      console.log(`LinkShield: Found ${links.length} links to analyze`);
      
      // Process more links but in batches to avoid overwhelming the API
      const linksToCheck = Array.from(links).slice(0, 50);

      for (let i = 0; i < linksToCheck.length; i += 5) {
        const batch = linksToCheck.slice(i, i + 5);
        await Promise.all(batch.map(link => {
          const href = link.href;
          if (this.shouldAnalyzeLink(href)) {
            this.analyzedLinks.add(href);
            return this.analyzeLink(link, href);
          }
        }));
        
        // Small delay between batches to be respectful to the API
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      this.isScanning = false;
    },

    // Start periodic scanning for dynamic content
    startPeriodicScan() {
      setInterval(() => {
        if (!this.isScanning) {
          this.scanLinksOnPage();
        }
      }, 10000); // Scan every 10 seconds
    },

    // Check if a link should be analyzed
    shouldAnalyzeLink(url) {
      if (!url || this.analyzedLinks.has(url)) return false;
      if (url.startsWith('javascript:')) return false;
      if (url.startsWith('mailto:')) return false;
      if (url.startsWith('tel:')) return false;
      if (url.startsWith('#')) return false;
      if (url === window.location.href) return false; // Skip same page
      
      // Skip relative URLs that are just anchors
      if (url.startsWith('/') && !url.startsWith('//')) {
        // Convert to absolute URL for analysis
        try {
          url = new URL(url, window.location.origin).href;
        } catch (e) {
          return false;
        }
      }
      
      // Skip if same domain (but allow subdomains)
      try {
        const linkDomain = new URL(url).hostname;
        const currentDomain = window.location.hostname;
        if (linkDomain === currentDomain) return false;
      } catch (e) {
        return false;
      }
      
      return true;
    },

    // Analyze a specific link with enhanced error handling
    async analyzeLink(linkElement, url) {
      try {
        console.log('LinkShield: Analyzing link:', url);
        
        // Send message to background script to scan URL
        const result = await chrome.runtime.sendMessage({
          action: 'scanURL',
          url: url
        });

        console.log('LinkShield: Analysis result for', url, ':', result);

        if (result && (result.status === 'suspicious' || result.status === 'malicious')) {
          console.log('LinkShield: Marking dangerous link:', url);
          this.markDangerousLink(linkElement, result);
        } else if (result && result.status === 'safe') {
          this.markSafeLink(linkElement);
        }
      } catch (error) {
        console.error('LinkShield: Error analyzing link', url, error);
      }
    },

    // Mark a link as safe
    markSafeLink(linkElement) {
      // Add subtle green indicator for safe links
      if (!linkElement.querySelector('.linkshield-safe-icon')) {
        const safeIcon = document.createElement('span');
        safeIcon.className = 'linkshield-safe-icon';
        safeIcon.innerHTML = '🛡️';
        safeIcon.style.cssText = `
          margin-left: 3px;
          font-size: 10px;
          color: #10b981;
          opacity: 0.7;
        `;
        safeIcon.title = 'LinkShield AI: Verified safe link';
        linkElement.appendChild(safeIcon);
      }
    },

    // Mark a link as dangerous with enhanced warnings
    markDangerousLink(linkElement, scanResult) {
      // Add visual indicator with more prominent styling
      linkElement.style.position = 'relative';
      linkElement.style.borderLeft = `4px solid ${scanResult.status === 'malicious' ? '#ef4444' : '#f59e0b'}`;
      linkElement.style.paddingLeft = '12px';
      linkElement.style.backgroundColor = scanResult.status === 'malicious' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)';
      linkElement.style.borderRadius = '4px';
      
      // Add warning icon
      if (!linkElement.querySelector('.linkshield-warning-icon')) {
        const warningIcon = document.createElement('span');
        warningIcon.className = 'linkshield-warning-icon';
        warningIcon.innerHTML = scanResult.status === 'malicious' ? '🚨' : '⚠️';
        warningIcon.style.cssText = `
          margin-left: 8px;
          font-size: 14px;
          animation: linkshield-pulse 2s infinite;
        `;
        linkElement.appendChild(warningIcon);
      }

      // Add click prevention with detailed warning
      const clickHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const warningMessage = `
🛡️ LinkShield AI Security Warning

This link has been flagged as potentially ${scanResult.status.toUpperCase()}!

URL: ${scanResult.url}
Confidence: ${Math.round(scanResult.confidence * 100)}%
Scan ID: ${scanResult.scan_id}

Risk Factors:
${scanResult.details ? scanResult.details.map(d => `• ${d}`).join('\n') : '• General security concerns detected'}

Do you want to proceed anyway? (Not recommended)
        `;
        
        const proceed = confirm(warningMessage);
        
        if (proceed) {
          // Open in new tab with warning parameter
          const warningUrl = scanResult.url + (scanResult.url.includes('?') ? '&' : '?') + 'linkshield_warning=true';
          window.open(warningUrl, '_blank');
        }
      };
      
      // Remove any existing click handlers and add new one
      linkElement.removeEventListener('click', clickHandler);
      linkElement.addEventListener('click', clickHandler, true);

      // Add enhanced title attribute
      linkElement.title = `🛡️ LinkShield AI Warning: This link is potentially ${scanResult.status} (${Math.round(scanResult.confidence * 100)}% confidence). Click for details.`;
      
      // Add CSS class for styling
      linkElement.classList.add(`linkshield-${scanResult.status}`);
    },

    // Observe new links added to the page (for dynamic content)
    observeNewLinks() {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const links = node.querySelectorAll ? node.querySelectorAll('a[href]') : [];
              Array.from(links).forEach((link) => {
                const href = link.href;
                if (this.shouldAnalyzeLink(href)) {
                  this.analyzedLinks.add(href);
                  this.analyzeLink(link, href);
                }
              });
            }
          });
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    },

    // Add hover listeners for real-time scanning
    addHoverListeners() {
      document.addEventListener('mouseover', async (e) => {
        if (e.target.tagName === 'A' && e.target.href) {
          const href = e.target.href;
          if (this.shouldAnalyzeLink(href) && !this.analyzedLinks.has(href)) {
            this.analyzedLinks.add(href);
            // Quick scan on hover
            setTimeout(() => {
              this.analyzeLink(e.target, href);
            }, 500); // Delay to avoid excessive API calls
          }
        }
      });
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      linkShieldAnalyzer.init();
    });
  } else {
    linkShieldAnalyzer.init();
  }

  // Listen for messages from popup or background
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getCurrentPageInfo') {
      sendResponse({
        url: window.location.href,
        title: document.title,
        links: Array.from(document.querySelectorAll('a[href]')).length
      });
    }
  });

})();
