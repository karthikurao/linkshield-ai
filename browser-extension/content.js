// content.js - Injected into every webpage
(function() {
  'use strict';

  let linkShieldAnalyzer = {
    // Track analyzed links to avoid duplicate checks
    analyzedLinks: new Set(),
    
    // Initialize the analyzer
    init() {
      this.scanLinksOnPage();
      this.observeNewLinks();
      this.addHoverListeners();
    },

    // Scan all links on the current page
    async scanLinksOnPage() {
      const links = document.querySelectorAll('a[href]');
      const linksToCheck = Array.from(links).slice(0, 20); // Limit to first 20 links to avoid overload

      for (let link of linksToCheck) {
        const href = link.href;
        if (this.shouldAnalyzeLink(href)) {
          this.analyzedLinks.add(href);
          this.analyzeLink(link, href);
        }
      }
    },

    // Check if a link should be analyzed
    shouldAnalyzeLink(url) {
      if (this.analyzedLinks.has(url)) return false;
      if (url.startsWith('javascript:')) return false;
      if (url.startsWith('mailto:')) return false;
      if (url.startsWith('tel:')) return false;
      if (url.startsWith('#')) return false;
      if (url.includes(window.location.hostname)) return false; // Skip internal links
      
      // Skip common safe domains
      const safeDomains = ['google.com', 'youtube.com', 'github.com', 'stackoverflow.com', 'wikipedia.org'];
      for (let domain of safeDomains) {
        if (url.includes(domain)) return false;
      }
      
      return true;
    },

    // Analyze a specific link
    async analyzeLink(linkElement, url) {
      try {
        // Send message to background script to scan URL
        const result = await chrome.runtime.sendMessage({
          action: 'scanURL',
          url: url
        });

        if (result && (result.status === 'suspicious' || result.status === 'malicious')) {
          this.markDangerousLink(linkElement, result);
        }
      } catch (error) {
        console.error('LinkShield: Error analyzing link', error);
      }
    },

    // Mark a link as dangerous
    markDangerousLink(linkElement, scanResult) {
      // Add visual indicator
      linkElement.style.position = 'relative';
      linkElement.style.borderLeft = `3px solid ${scanResult.status === 'malicious' ? '#ef4444' : '#f59e0b'}`;
      linkElement.style.paddingLeft = '8px';
      
      // Add warning icon
      if (!linkElement.querySelector('.linkshield-warning-icon')) {
        const warningIcon = document.createElement('span');
        warningIcon.className = 'linkshield-warning-icon';
        warningIcon.innerHTML = '⚠️';
        warningIcon.style.cssText = `
          margin-left: 5px;
          font-size: 12px;
          color: ${scanResult.status === 'malicious' ? '#ef4444' : '#f59e0b'};
        `;
        linkElement.appendChild(warningIcon);
      }

      // Add click prevention
      linkElement.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const proceed = confirm(`
LinkShield AI Warning: This link has been flagged as potentially ${scanResult.status}!

URL: ${scanResult.url}
Confidence: ${Math.round(scanResult.confidence * 100)}%

Do you want to proceed anyway? (Not recommended)
        `);
        
        if (proceed) {
          window.open(scanResult.url, '_blank');
        }
      }, true);

      // Add title attribute for hover info
      linkElement.title = `⚠️ LinkShield AI: Potentially ${scanResult.status} link (${Math.round(scanResult.confidence * 100)}% confidence)`;
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
