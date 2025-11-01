// protection.js - Simple scam detection and ad blocking for Almond extension

(function() {
    'use strict';
    
    console.log('[PROTECTION] protection.js loaded successfully');
    
    // Initialize protection controls - called by popup.js
    globalThis.initializeProtectionControls = function() {
        console.log('[PROTECTION] Initializing protection panel');
        
        // Wait a moment for DOM to be ready
        setTimeout(() => {
            // Get protection control elements
            const checkScamsBtn = document.getElementById('check-scams-btn');
            const blockAdsBtn = document.getElementById('block-ads-btn');
            const showAdsBtn = document.getElementById('show-ads-btn');
            const scamResults = document.getElementById('scam-results');
            const adblockStatus = document.getElementById('adblock-status');
            
            // Debug element finding
            console.log('[PROTECTION] Elements found:', {
                checkScamsBtn: !!checkScamsBtn,
                blockAdsBtn: !!blockAdsBtn,
                showAdsBtn: !!showAdsBtn,
                scamResults: !!scamResults,
                adblockStatus: !!adblockStatus
            });
            
            if (!checkScamsBtn || !blockAdsBtn || !showAdsBtn) {
                console.error('[PROTECTION] Missing protection controls in DOM');
                return;
            }
            
            // Set up event listeners
            checkScamsBtn.addEventListener('click', function() {
                console.log('[PROTECTION] Check scams button clicked');
                handleCheckScams();
            });
            
            blockAdsBtn.addEventListener('click', function() {
                console.log('[PROTECTION] Block ads button clicked');
                handleBlockAds();
            });
            
            showAdsBtn.addEventListener('click', function() {
                console.log('[PROTECTION] Show ads button clicked');
                handleShowAds();
            });
            
            // Add visual feedback
            checkScamsBtn.style.cursor = 'pointer';
            blockAdsBtn.style.cursor = 'pointer';
            showAdsBtn.style.cursor = 'pointer';
            
            console.log('[PROTECTION] Protection panel initialized successfully');
        }, 100);
    };
    
    // Simple scam detection
    function handleCheckScams() {
        console.log('[PROTECTION] Starting scam detection');
        
        const scamResults = document.getElementById('scam-results');
        if (scamResults) {
            scamResults.textContent = 'Checking...';
        }
        
        // Send message to content script to check for scams
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (chrome.runtime.lastError) {
                console.error('[PROTECTION] Error querying tabs:', chrome.runtime.lastError);
                showScamResults('Error: Unable to access current tab');
                return;
            }
            
            if (!tabs || tabs.length === 0) {
                console.error('[PROTECTION] No active tab found');
                showScamResults('Error: No active tab found');
                return;
            }
            
            const activeTab = tabs[0];
            console.log('[PROTECTION] Sending scam check request to tab:', activeTab.id);
            
            const message = {
                action: 'check-scams'
            };
            
            chrome.tabs.sendMessage(activeTab.id, message, function(response) {
                if (chrome.runtime.lastError) {
                    console.error('[PROTECTION] Error sending message:', chrome.runtime.lastError.message);
                    // Fallback scam check
                    fallbackScamCheck(activeTab.url);
                    return;
                }
                
                console.log('[PROTECTION] Scam check response:', response);
                
                if (response?.result) {
                    showScamResults(response.result);
                } else {
                    fallbackScamCheck(activeTab.url);
                }
            });
        });
    }
    
    // Simple fallback scam detection
    function fallbackScamCheck(url) {
        console.log('[PROTECTION] Using fallback scam check for:', url);
        
        if (!url) {
            showScamResults('Cannot check this page');
            return;
        }
        
        // Simple scam indicators
        const scamIndicators = [
            'urgent', 'limited time', 'act now', 'congratulations', 'winner',
            'free money', 'click here now', 'verify account', 'suspended',
            'suspicious activity', 'confirm identity', 'tax refund'
        ];
        
        const suspiciousDomains = [
            'bit.ly', 'tinyurl', 'shortened'
        ];
        
        let warnings = [];
        
        // Check for suspicious domains
        try {
            const hostname = new URL(url).hostname.toLowerCase();
            if (suspiciousDomains.some(domain => hostname.includes(domain))) {
                warnings.push('⚠️ Shortened URL - be careful');
            }
            
            // Check for common scam patterns in URL
            if (hostname.includes('secure') || hostname.includes('verify') || hostname.includes('update')) {
                warnings.push('⚠️ Suspicious domain name');
            }
        } catch (e) {
            warnings.push('⚠️ Cannot analyze this URL');
        }
        
        if (warnings.length > 0) {
            showScamResults('Potential concerns found:\n' + warnings.join('\n') + '\n\nAlways verify sender identity\nNever share personal info\nCheck the website URL carefully');
        } else {
            showScamResults('No obvious scam indicators found\n\nStay safe:\n• Always verify who you\'re dealing with\n• Never give out personal information\n• When in doubt, ask someone you trust');
        }
    }
    
    // Show scam detection results
    function showScamResults(message) {
        const scamResults = document.getElementById('scam-results');
        if (scamResults) {
            scamResults.textContent = message;
            scamResults.style.whiteSpace = 'pre-line';
        }
        console.log('[PROTECTION] Scam results:', message);
    }
    
    // Simple ad blocking
    function handleBlockAds() {
        console.log('[PROTECTION] Blocking ads');
        
        const adblockStatus = document.getElementById('adblock-status');
        if (adblockStatus) {
            adblockStatus.textContent = 'Hiding ads...';
        }
        
        // Send message to content script to block ads
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (chrome.runtime.lastError) {
                console.error('[PROTECTION] Error querying tabs:', chrome.runtime.lastError);
                showAdblockStatus('Error: Unable to access current tab');
                return;
            }
            
            if (!tabs || tabs.length === 0) {
                console.error('[PROTECTION] No active tab found');
                showAdblockStatus('Error: No active tab found');
                return;
            }
            
            const activeTab = tabs[0];
            console.log('[PROTECTION] Sending ad block request to tab:', activeTab.id);
            
            const message = {
                action: 'block-ads'
            };
            
            chrome.tabs.sendMessage(activeTab.id, message, function(response) {
                if (chrome.runtime.lastError) {
                    console.error('[PROTECTION] Error sending message:', chrome.runtime.lastError.message);
                    showAdblockStatus('Error: Could not block ads');
                    return;
                }
                
                console.log('[PROTECTION] Ad block response:', response);
                
                if (response?.success) {
                    showAdblockStatus('Ads hidden');
                } else {
                    showAdblockStatus('Could not hide ads');
                }
            });
        });
    }
    
    // Show ads again
    function handleShowAds() {
        console.log('[PROTECTION] Showing ads');
        
        const adblockStatus = document.getElementById('adblock-status');
        if (adblockStatus) {
            adblockStatus.textContent = 'Showing ads...';
        }
        
        // Send message to content script to show ads
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (chrome.runtime.lastError) {
                console.error('[PROTECTION] Error querying tabs:', chrome.runtime.lastError);
                showAdblockStatus('Error: Unable to access current tab');
                return;
            }
            
            if (!tabs || tabs.length === 0) {
                console.error('[PROTECTION] No active tab found');
                showAdblockStatus('Error: No active tab found');
                return;
            }
            
            const activeTab = tabs[0];
            console.log('[PROTECTION] Sending show ads request to tab:', activeTab.id);
            
            const message = {
                action: 'show-ads'
            };
            
            chrome.tabs.sendMessage(activeTab.id, message, function(response) {
                if (chrome.runtime.lastError) {
                    console.error('[PROTECTION] Error sending message:', chrome.runtime.lastError.message);
                    showAdblockStatus('Ready');
                    return;
                }
                
                console.log('[PROTECTION] Show ads response:', response);
                
                if (response?.success) {
                    showAdblockStatus('Ads visible');
                } else {
                    showAdblockStatus('Ready');
                }
            });
        });
    }
    
    // Show ad blocker status
    function showAdblockStatus(message) {
        const adblockStatus = document.getElementById('adblock-status');
        if (adblockStatus) {
            adblockStatus.textContent = message;
        }
        console.log('[PROTECTION] Ad block status:', message);
    }
    
})();