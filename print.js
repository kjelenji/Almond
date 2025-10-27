// print.js - Comprehensive print functionality for the Almond extension

(function() {
    'use strict';
    
    console.log('[PRINT] print.js loaded successfully');
    
    // Print settings and state - simplified for basic functionality
    
    // Initialize print controls - called by popup.js
    globalThis.initializePrintControls = function() {
        console.log('[PRINT] Initializing print panel');
        
        // Wait a moment for DOM to be ready
        setTimeout(() => {
            // Get print control elements
            const printPageBtn = document.getElementById('print-page-btn');
            const savePdfBtn = document.getElementById('save-pdf-btn');
            
            // Debug element finding
            console.log('[PRINT] Elements found:', {
                printPageBtn: !!printPageBtn,
                savePdfBtn: !!savePdfBtn,
                printPageBtnId: printPageBtn?.id,
                savePdfBtnId: savePdfBtn?.id
            });
            
            if (!printPageBtn || !savePdfBtn) {
                console.error('[PRINT] Missing print controls in DOM');
                console.log('[PRINT] All buttons:', document.querySelectorAll('button'));
                return;
            }
            
            // Set up event listeners with additional logging
            printPageBtn.addEventListener('click', function() {
                console.log('[PRINT] Print page button clicked via event listener');
                handlePrintPage();
            });
            
            savePdfBtn.addEventListener('click', function() {
                console.log('[PRINT] Save PDF button clicked via event listener');
                handleSavePdf();
            });
            
            // Add visual feedback
            printPageBtn.style.cursor = 'pointer';
            savePdfBtn.style.cursor = 'pointer';
            
            console.log('[PRINT] Print panel initialized successfully with event listeners');
        }, 100);
    };
    
    // Handle print current page
    function handlePrintPage() {
        console.log('[PRINT] Print page button clicked');
        
        const settings = getCurrentPrintSettings();
        
        // Send message to content script to prepare and print
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (chrome.runtime.lastError) {
                console.error('[PRINT] Error querying tabs:', chrome.runtime.lastError);
                showError('Unable to access current tab');
                return;
            }
            
            if (!tabs || tabs.length === 0) {
                console.error('[PRINT] No active tab found');
                showError('No active tab found');
                return;
            }
            
            const activeTab = tabs[0];
            console.log('[PRINT] Sending print request to tab:', activeTab.id);
            
            const message = {
                action: 'print-page',
                settings: settings
            };
            
            chrome.tabs.sendMessage(activeTab.id, message, function(response) {
                if (chrome.runtime.lastError) {
                    console.error('[PRINT] Error sending message:', chrome.runtime.lastError.message);
                    // Fallback to basic browser print
                    fallbackPrint();
                    return;
                }
                
                console.log('[PRINT] Print response:', response);
                
                if (response?.success) {
                    showSuccess('Print dialog opened successfully');
                } else {
                    console.warn('[PRINT] Print failed, using fallback');
                    fallbackPrint();
                }
            });
        });
    }
    

    
    // Handle save as PDF
    function handleSavePdf() {
        console.log('[PRINT] Save PDF button clicked');
        
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (chrome.runtime.lastError) {
                console.error('[PRINT] Error querying tabs:', chrome.runtime.lastError);
                showError('Unable to access current tab');
                return;
            }
            
            if (!tabs || tabs.length === 0) {
                console.error('[PRINT] No active tab found');
                showError('No active tab found');
                return;
            }
            
            const activeTab = tabs[0];
            console.log('[PRINT] Generating PDF for tab:', activeTab.id);
            
            // Use print dialog method with PDF pre-selection
            generatePDFViaDialog(activeTab);
        });
    }

    
    // Generate PDF via print dialog
    function generatePDFViaDialog(tab) {
        console.log('[PRINT] Using print dialog for PDF');
        
        const settings = getCurrentPrintSettings();
        const message = {
            action: 'save-pdf',
            settings: settings
        };
        
        chrome.tabs.sendMessage(tab.id, message, function(response) {
            if (chrome.runtime.lastError) {
                console.error('[PRINT] Error sending message:', chrome.runtime.lastError.message);
                fallbackPDFMethod(tab);
                return;
            }
            
            if (response?.success) {
                showSuccess('PDF ready! Print dialog will open with "Save as PDF" pre-selected.');
            } else {
                fallbackPDFMethod(activeTab);
            }
        });
    }

    
    // Function to inject into the page for PDF instructions

    

    
    // Fallback PDF method using print dialog
    function fallbackPDFMethod(tab) {
        console.log('[PRINT] Using fallback PDF method');
        
        // Open print dialog optimized for PDF
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: function() {
                // Optimize page for PDF printing
                document.title = document.title.replaceAll(/[^\w\s-]/g, '').trim() || 'webpage';
                
                // Open print dialog - user will see "Save as PDF" as default option in most browsers
                globalThis.print();
            }
        }, function() {
            if (chrome.runtime.lastError) {
                showError('Unable to open print dialog');
            } else {
                showInfo('Print dialog opened - "Save as PDF" should be available as destination');
            }
        });
    }
    

    
    // Get current print settings (simplified for basic usage)
    function getCurrentPrintSettings() {
        const settings = {
            printMode: 'normal',
            printBackgrounds: false,
            printHeaders: false,
            removeAds: true,
            orientation: 'portrait',
            paperSize: 'A4',
            margins: 'default'
        };
        
        console.log('[PRINT] Current settings:', settings);
        return settings;
    }
    
    // Fallback print function using basic browser API
    function fallbackPrint() {
        console.log('[PRINT] Using fallback print method');
        
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs?.[0]) {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    func: function() { globalThis.print(); }
                }, function(result) {
                    if (chrome.runtime.lastError) {
                        console.error('[PRINT] Fallback print failed:', chrome.runtime.lastError);
                        showError('Unable to open print dialog');
                    } else {
                        showInfo('Print dialog opened');
                    }
                });
            }
        });
    }
    

    
    // UI feedback functions
    function showSuccess(message) {
        console.log('[PRINT] Success:', message);
    }
    
    function showError(message) {
        console.error('[PRINT] Error:', message);
        alert('Print Error: ' + message);
    }
    
    function showInfo(message) {
        console.log('[PRINT] Info:', message);
    }
    
})();