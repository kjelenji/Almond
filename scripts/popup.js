console.log('popup.js script loaded');

// Single initialization flag to prevent duplicates
let isInitialized = false;

// Initialize all navigation buttons
function initAllButtons() {
    if (isInitialized) {
        console.log('Already initialized, skipping...');
        return;
    }
    
    console.log('Initializing all buttons...');
    
    // Get all navigation buttons
    const buttons = document.querySelectorAll('.nav-button');
    console.log('Found', buttons.length, 'navigation buttons');
    
    buttons.forEach((button, index) => {
        const action = button.dataset.action;
        console.log(`Button ${index}: ${button.id} - action: ${action}`);
        
        button.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Button clicked:', action, 'Button ID:', this.id);
            handleButtonClick(action);
        });
    });
    
    isInitialized = true;
    console.log('Initialization complete');
}

function handleButtonClick(action) {
    console.log('Handling button click:', action);
    
    // Special handling for weather - show panel in popup instead of content script
    if (action === 'weather') {
        showWeatherPanel();
        return;
    }
    
    // Close the popup window immediately for other actions
    window.close();
    
    // Send messages to content script for different actions
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
            switch(action) {
                case 'ai':
                    chrome.tabs.sendMessage(tabs[0].id, { type: "SHOW_PANEL", panelType: "ai" });
                    break;
                case 'zoom':
                    chrome.tabs.sendMessage(tabs[0].id, { type: "SHOW_PANEL", panelType: "zoom" });
                    break;
                case 'font':
                    chrome.tabs.sendMessage(tabs[0].id, { type: "SHOW_PANEL", panelType: "font" });
                    break;
                case 'speech':
                    chrome.tabs.sendMessage(tabs[0].id, { type: "SHOW_PANEL", panelType: "speech" });
                    break;
                case 'weather':
                    chrome.tabs.sendMessage(tabs[0].id, { type: "SHOW_PANEL", panelType: "weather" });
                    break;
                case 'reminder':
                    chrome.tabs.sendMessage(tabs[0].id, { type: "SHOW_PANEL", panelType: "reminder" });
                    break;
                case 'print':
                    chrome.tabs.sendMessage(tabs[0].id, { type: "SHOW_PANEL", panelType: "print" });
                    break;
                case 'protection':
                    chrome.tabs.sendMessage(tabs[0].id, { type: "SHOW_PANEL", panelType: "protection" });
                    break;
                case 'folder':
                    chrome.tabs.sendMessage(tabs[0].id, { type: "SHOW_PANEL", panelType: "folder" });
                    break;
                default:
                    console.log('Unknown action:', action);
            }
        }
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM ready, initializing...');
    initAllButtons();
    initNavControlButtons();
});

// Initialize navigation control buttons
function initNavControlButtons() {
    console.log('Initializing navigation control buttons...');
    
    const hideBtn = document.getElementById('hide-nav-btn');
    const showBtn = document.getElementById('show-nav-btn');
    
    if (hideBtn) {
        hideBtn.addEventListener('click', function() {
            console.log('Hide navigation button clicked');
            hideFloatingNavigation();
        });
    }
    
    if (showBtn) {
        showBtn.addEventListener('click', function() {
            console.log('Show navigation button clicked');
            showFloatingNavigation();
        });
    }
    
    // Check current navigation state
    checkNavigationState();
}

// Hide the floating navigation
function hideFloatingNavigation() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { 
                type: "HIDE_NAVIGATION" 
            }, function(response) {
                if (response && response.success) {
                    updateButtonState(true); // Navigation is hidden
                } else {
                    console.log('Failed to hide navigation or no response');
                }
            });
        }
    });
}

// Show the floating navigation  
function showFloatingNavigation() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { 
                type: "SHOW_NAVIGATION" 
            }, function(response) {
                if (response && response.success) {
                    updateButtonState(false); // Navigation is visible
                } else {
                    console.log('Failed to show navigation or no response');
                }
            });
        }
    });
}

// Update button visibility based on navigation state
function updateButtonState(isHidden) {
    const hideBtn = document.getElementById('hide-nav-btn');
    const showBtn = document.getElementById('show-nav-btn');
    
    if (hideBtn && showBtn) {
        if (isHidden) {
            hideBtn.style.display = 'none';
            showBtn.style.display = 'block';
        } else {
            hideBtn.style.display = 'block';  
            showBtn.style.display = 'none';
        }
    }
}

// Check current navigation state
function checkNavigationState() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { 
                type: "CHECK_NAVIGATION_STATE" 
            }, function(response) {
                if (response) {
                    updateButtonState(response.isHidden);
                }
            });
        }
    });
}



function updateSidePanelContent(panel, contentType) {
    const panelTitle = panel.querySelector('.panel-title');
    const panelContent = panel.querySelector('.panel-content');
    
    if (!panelTitle || !panelContent) return;
    
    // Update title and content based on type
    const contentMap = {
        zoom: { title: 'Zoom Control', content: getZoomContent() },
        font: { title: 'Font Settings', content: getFontContent() },
        speech: { title: 'Text to Speech', content: getSpeechContent() },
        manual: { title: 'Manual Guide', content: getManualContent() },
        weather: { title: 'Weather Info', content: getWeatherContent() },
        reminder: { title: 'Reminders', content: getReminderContent() },
        print: { title: 'Print Options', content: getPrintContent() },
        protection: { title: 'Page Protection', content: getProtectionContent() }
    };
    
    const config = contentMap[contentType];
    if (config) {
        console.log('Updating panel with:', contentType, config);
        panelTitle.textContent = config.title;
        panelContent.innerHTML = config.content;
        
        // Initialize specific controls after content is loaded
        setTimeout(() => {
            initializeContentControls(contentType);
        }, 50);
    } else {
        console.log('No config found for:', contentType);
    }
}

function initializeAIPanel() {
    console.log('Initializing AI panel...');
    
    const highlightBtn = document.getElementById('highlight-key-info');
    const summarizeBtn = document.getElementById('summarize-page');
    const aiInput = document.getElementById('ai-input');
    const aiResponse = document.getElementById('ai-response');
    const aiResponseText = document.getElementById('ai-response-text');
    
    if (highlightBtn && aiResponse && aiResponseText) {
        highlightBtn.addEventListener('click', function() {
            alert('Highlight button clicked!'); // Debug alert
            console.log('Extracting key information from email/webpage...');
            
            aiResponseText.innerHTML = 'Extracting key information from page...';
            aiResponse.style.display = 'block';
            
            // Get page text and extract key information using AI
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, { type: "GET_ARTICLE_TEXT" }, async function(res) {
                        if (!res?.text) {
                            aiResponseText.innerHTML = "Could not extract text from this page for analysis.";
                            return;
                        }

                        try {
                            console.log("Extracting key information with Chrome AI...");
                            const highlights = await extractKeyInfoWithAI(res.text);
                            aiResponseText.innerHTML = highlights.replaceAll('\n', '<br>');
                        } catch (error) {
                            console.error("AI Highlight error:", error);
                            // Fallback to pattern-based extraction
                            const fallbackHighlights = extractKeyInfoFallback(res.text);
                            aiResponseText.innerHTML = fallbackHighlights.replaceAll('\n', '<br>');
                        }
                    });
                }
            });
        });
    }

    if (summarizeBtn && aiResponse && aiResponseText) {
        summarizeBtn.addEventListener('click', function() {
            alert('Summarize button clicked!'); // Debug alert
            console.log('Summarizing page content...');
            
            aiResponseText.innerHTML = 'Summarizing page content...';
            aiResponse.style.display = 'block';
            
            // Get page text and summarize using AI
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, { type: "GET_ARTICLE_TEXT" }, async function(res) {
                        if (!res?.text) {
                            aiResponseText.innerHTML = "Could not extract text from this page for summarization.";
                            return;
                        }

                        try {
                            console.log("Summarizing with Chrome AI...");
                            const summary = await summarizePageWithAI(res.text);
                            aiResponseText.innerHTML = summary.replaceAll('\n', '<br>');
                        } catch (error) {
                            console.error("AI Summarize error:", error);
                            aiResponseText.innerHTML = "Error: Could not summarize this content. " + error.message;
                        }
                    });
                }
            });
        });
    }
}



function initializePanelSwitching() {
    const mainButtons = document.querySelectorAll('.main-btn[data-panel]');
    
    mainButtons.forEach(button => {
        button.addEventListener('click', function() {
            const panelName = this.getAttribute('data-panel');
            showPanel(panelName);
            
            // Update active button state
            mainButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function showPanel(panelName) {
    // Hide all panels
    const panels = document.querySelectorAll('.panel-content');
    panels.forEach(panel => {
        panel.hidden = true;
    });
    
    // Show the selected panel
    const targetPanel = document.getElementById(panelName);
    if (targetPanel) {
        targetPanel.hidden = false;
        
        // Initialize panel-specific controls when panel is shown
        switch(panelName) {
            case 'zoom-panel':
                initializeZoomPanel();
                break;
            case 'font-panel':
                initializeFontPanel();
                break;
            case 'speech-panel':
                initializeSpeechPanel();
                break;
            case 'manual-panel':
                initializeManualPanel();
                break;
            case 'weather-panel':
                initializeWeatherPanel();
                break;
            case 'reminder-panel':
                initializeReminderPanel();
                break;
            case 'print-panel':
                initializePrintPanel();
                break;
            case 'protection-panel':
                initializeProtectionPanel();
                break;
        }
    }
}

function initializeZoomPanel() {
    console.log('Checking for zoom controls...');
    if (typeof window.initZoomPanel === 'function') {
        console.log('Initializing zoom controls');
        window.initZoomPanel();
    } else {
        console.warn('initZoomPanel function not found');
    }
}

function initializeFontPanel() {
    console.log('Checking for font controls...');
    if (typeof window.initializeFontControls === 'function') {
        console.log('Initializing font controls');
        window.initializeFontControls();
    } else {
        console.warn('initializeFontControls function not found');
    }
}

function initializeSpeechPanel() {
    console.log('Checking for speech controls...');
    if (typeof window.initializeSpeechControls === 'function') {
        console.log('Initializing speech controls');
        window.initializeSpeechControls();
    } else {
        console.warn('initializeSpeechControls function not found');
    }
}

function initializeManualPanel() {
    console.log('Checking for manual controls...');
    if (typeof window.initializeManualControls === 'function') {
        console.log('Initializing manual controls');
        window.initializeManualControls();
    } else {
        console.warn('initializeManualControls function not found');
    }
}

function initializeWeatherPanel() {
    console.log('Checking for weather controls...');
    if (typeof window.initializeWeatherControls === 'function') {
        console.log('Initializing weather controls');
        window.initializeWeatherControls();
    } else {
        console.warn('initializeWeatherControls function not found');
    }
}

function initializeReminderPanel() {
    console.log('Checking for reminder controls...');
    if (typeof globalThis.initializeReminderControls === 'function') {
        console.log('Initializing reminder controls...');
        globalThis.initializeReminderControls();
    } else {
        console.warn('initializeReminderControls function not found');
    }
}

function initializePrintPanel() {
    console.log('Checking for print controls...');
    if (typeof globalThis.initializePrintControls === 'function') {
        console.log('Initializing print controls...');
        globalThis.initializePrintControls();
    } else {
        console.warn('initializePrintControls function not found');
    }
}

function initializeProtectionPanel() {
    console.log('Checking for protection controls...');
    if (typeof globalThis.initializeProtectionControls === 'function') {
        console.log('Initializing protection controls...');
        globalThis.initializeProtectionControls();
    } else {
        console.warn('initializeProtectionControls function not found');
    }
}

// Content generation functions for side panels
function getZoomContent() {
    return `
        <div class="panel-section">
            <h3>Page Zoom Control</h3>
            
            <div class="zoom-controls">
                <button class="btn" id="zoom-out">−</button>
                <input type="range" id="zoom-slider" min="25" max="300" value="100" step="25">
                <button class="btn" id="zoom-in">+</button>
                <span id="zoom-value">100%</span>
            </div>
            
            <div class="form-group">
                <button class="btn" id="zoom-50">50%</button>
                <button class="btn" id="zoom-75">75%</button>
                <button class="btn btn-primary" id="zoom-100">100%</button>
                <button class="btn" id="zoom-125">125%</button>
                <button class="btn" id="zoom-150">150%</button>
            </div>
            
            <div class="form-group">
                <button class="btn" id="zoom-fit">Fit Width</button>
                <button class="btn" id="reset-zoom">Reset</button>
            </div>
        </div>
    `;
}

function getFontContent() {
    return `
        <div class="panel-section">
            <h3>Font Settings</h3>
            
            <div class="font-control-row">
                <label class="font-control-label">Font Size</label>
                <input type="range" id="font-size-slider" min="12" max="24" value="16" step="1">
                <span id="font-size-value">16px</span>
            </div>
            
            <div class="font-control-row">
                <label class="font-control-label">Line Spacing</label>
                <input type="range" id="line-spacing-slider" min="1" max="2.5" value="1.5" step="0.1">
                <span id="line-spacing-value">1.5</span>
            </div>
            
            <div class="font-presets">
                <label class="section-label">Font Family</label>
                <div class="font-grid">
                    <button class="preset-btn font-btn" data-font="Arial, sans-serif">Arial</button>
                    <button class="preset-btn font-btn" data-font="'Times New Roman', serif">Times</button>
                    <button class="preset-btn font-btn" data-font="'Courier New', monospace">Courier</button>
                    <button class="preset-btn font-btn" data-font="'Verdana', sans-serif">Verdana</button>
                </div>
            </div>
            
            <div class="background-colors">
                <label class="section-label">Background & Text Color</label>
                <div class="color-grid">
                    <button class="bg-color-btn bg-white-btn" data-bg="#ffffff" data-text="#000000" title="Black on White"></button>
                    <button class="bg-color-btn bg-yellow-btn" data-bg="#fffacd" data-text="#333333" title="Dark on Cream"></button>
                    <button class="bg-color-btn bg-blue-btn" data-bg="#bcddeaff" data-text="#000000" title="Black on Light Blue"></button>
                    <button class="bg-color-btn bg-purple-btn" data-bg="#d4d4f9e5" data-text="#333333" title="Dark on Light Purple"></button>
                </div>
            </div>
            
            <div class="form-group">
                <button class="btn btn-primary" id="apply-font-settings">Apply Changes</button>
            </div>
        </div>
    `;
}

function getSpeechContent() {
    return `
        <div class="panel-section">
            <h3>Text to Speech</h3>
            <div class="form-group">
                <button class="btn btn-primary" id="start-speech">Start Reading</button>
                <button class="btn" id="stop-speech">Stop</button>
            </div>
            <div class="form-group">
                <label class="form-label">Speech Rate</label>
                <input type="range" class="form-input" id="speech-rate" min="0.5" max="2" step="0.1" value="1">
            </div>
        </div>
    `;
}

function getManualContent() {
    return `
        <div class="panel-section">
            <h3>Quick Guide</h3>
            <div class="form-group">
                <textarea class="form-input" id="guide-input" placeholder="Ask me anything about this page..."></textarea>
            </div>
            <div class="form-group">
                <button class="btn btn-primary" id="ask-guide">Get Help</button>
            </div>
            <div id="guide-response" style="margin-top: 15px;"></div>
        </div>
    `;
}

function getWeatherContent() {
    return `
        <div class="panel-section">
            <h3>Weather Info</h3>
            <div class="form-group">
                <input type="text" class="form-input" id="weather-location" placeholder="Enter location">
                <button class="btn btn-primary" id="get-weather">Get Weather</button>
            </div>
            <div id="weather-display"></div>
        </div>
    `;
}

function getReminderContent() {
    return `
        <div class="panel-section">
            <h3>Quick Reminder</h3>
            <div class="form-group">
                <input type="text" class="form-input" id="reminder-text" placeholder="What to remember?">
            </div>
            <div class="form-group">
                <input type="datetime-local" class="form-input" id="reminder-time">
            </div>
            <div class="form-group">
                <button class="btn btn-primary" id="add-reminder">Add Reminder</button>
            </div>
        </div>
    `;
}

function getPrintContent() {
    return `
        <div class="panel-section">
            <h3>Print Options</h3>
            <div class="form-group">
                <button class="btn btn-primary" id="print-page">Print Page</button>
            </div>
            <div class="form-group">
                <button class="btn" id="save-pdf">Save as PDF</button>
            </div>
        </div>
    `;
}

function getProtectionContent() {
    return `
        <div class="panel-section">
            <h3>Page Protection</h3>
            <div class="form-group">
                <button class="btn btn-primary" id="scan-scams">Check for Scams</button>
            </div>
            <div class="form-group">
                <button class="btn" id="block-ads">Block Ads</button>
            </div>
            <div id="protection-results" style="margin-top: 15px; font-size: 12px;"></div>
        </div>
    `;
}

function initializeContentControls(contentType) {
    switch(contentType) {
        case 'zoom':
            initializeZoomControls();
            break;
        case 'font':
            initializeFontControls();
            break;
        case 'speech':
            initializeSpeechControls();
            break;
        case 'manual':
            initializeManualControls();
            break;
        case 'weather':
            initializeWeatherControls();
            break;
        case 'reminder':
            initializeReminderControls();
            break;
        case 'print':
            initializePrintControlsContent();
            break;
        case 'protection':
            initializeProtectionControls();
            break;
    }
}

function initializeFontControls() {
    console.log('Initializing font controls...');
    
    // Font size slider
    const fontSizeSlider = document.getElementById('font-size-slider');
    const fontSizeValue = document.getElementById('font-size-value');
    
    if (fontSizeSlider && fontSizeValue) {
        fontSizeSlider.addEventListener('input', function() {
            fontSizeValue.textContent = this.value + 'px';
        });
    }
    
    // Line spacing slider
    const lineSpacingSlider = document.getElementById('line-spacing-slider');
    const lineSpacingValue = document.getElementById('line-spacing-value');
    
    if (lineSpacingSlider && lineSpacingValue) {
        lineSpacingSlider.addEventListener('input', function() {
            lineSpacingValue.textContent = this.value;
        });
    }
    
    // Font family buttons
    const fontButtons = document.querySelectorAll('.font-btn');
    fontButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active from all font buttons
            fontButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Background/text color buttons
    const colorButtons = document.querySelectorAll('.bg-color-btn');
    colorButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active from all color buttons
            colorButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Apply settings button
    const applyBtn = document.getElementById('apply-font-settings');
    if (applyBtn) {
        applyBtn.addEventListener('click', function() {
            const fontSize = fontSizeSlider ? fontSizeSlider.value : '16';
            const lineSpacing = lineSpacingSlider ? lineSpacingSlider.value : '1.5';
            const activeFont = document.querySelector('.font-btn.active');
            const activeColor = document.querySelector('.bg-color-btn.active');
            
            const fontFamily = activeFont ? activeFont.dataset.font : 'Arial, sans-serif';
            const backgroundColor = activeColor ? activeColor.dataset.bg : '#ffffff';
            const textColor = activeColor ? activeColor.dataset.text : '#000000';
            
            sendToActiveTab({
                action: 'font',
                fontSize: fontSize + 'px',
                fontFamily: fontFamily,
                backgroundColor: backgroundColor,
                textColor: textColor,
                lineSpacing: lineSpacing
            });
            
            console.log('Applied font settings:', {fontSize, fontFamily, backgroundColor, textColor, lineSpacing, letterSpacing});
        });
    }
    
    // Reset button
    const resetBtn = document.getElementById('reset-font-settings');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            if (fontSizeSlider) fontSizeSlider.value = 16;
            if (fontSizeValue) fontSizeValue.textContent = '16px';
            if (lineSpacingSlider) lineSpacingSlider.value = 1.5;
            if (lineSpacingValue) lineSpacingValue.textContent = '1.5';
            if (letterSpacingSlider) letterSpacingSlider.value = 0;
            if (letterSpacingValue) letterSpacingValue.textContent = '0px';
            
            // Remove active classes
            document.querySelectorAll('.font-btn.active').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.bg-color-btn.active').forEach(b => b.classList.remove('active'));
            
            // Reset to default
            sendToActiveTab({
                action: 'font',
                fontSize: '16px',
                fontFamily: 'Arial, sans-serif',
                backgroundColor: '#ffffff',
                textColor: '#000000',
                lineSpacing: '1.5',
                letterSpacing: '0px'
            });
        });
    }
}

// AI-powered key information extraction (moved from rewriter_api_test.js)
async function extractKeyInfoWithAI(text) {
  const cleanedText = cleanTextForSummarization(text);
  
  // Use the same API detection as the rewriter
  let rewriterAPI = null;
  
  if ('Rewriter' in globalThis) {
    rewriterAPI = globalThis.Rewriter;
  } else if (globalThis.ai?.rewriter) {
    rewriterAPI = globalThis.ai.rewriter;
  }
  
  if (!rewriterAPI) {
    throw new Error("Chrome AI not available");
  }

  const availability = await rewriterAPI.availability();
  if (availability === 'no') {
    throw new Error("Chrome AI not supported");
  }

  // Limit text length
  const maxLength = 6000;
  const textToProcess = cleanedText.length > maxLength ? 
    cleanedText.substring(0, maxLength) + "..." : cleanedText;

  // Create rewriter specifically for extracting key information
  const options = {
    sharedContext: 'This is content from which I need to extract the 5 most important pieces of information, formatted as bullet points.',
    tone: 'as-is',
    format: 'plain-text',
    length: 'shorter'
  };

  let rewriter;
  if (availability === 'readily') {
    rewriter = await rewriterAPI.create(options);
  } else {
    rewriter = await rewriterAPI.create(options);
  }

  // Extract key information with specific context
  const context = "Extract exactly 5 key pieces of information from this content. Format each as a bullet point (•). Focus on dates, deadlines, action items, important numbers, contact information, and critical details.";
  const result = await rewriter.rewrite(textToProcess, { context });
  
  rewriter.destroy();
  
  // Format the result
  const formatted = formatKeyInfo(result);
  return `Key Information Extracted:\n\n${formatted}`;
}

// Clean text specifically for summarization
function cleanTextForSummarization(text) {
  return text
    .replace(/^\d+\s+languages?\s*/i, '')
    .replace(/Article\s+Talk\s+Read\s+View\s+source\s+View\s+history/gi, '')
    .replace(/Tools\s+Appearance\s+hide\s+Text\s+Small\s+Standard\s+Large/gi, '')
    .replace(/Width\s+Standard\s+Wide\s+Color\s+\(beta\)\s+Automatic\s+Light\s+Dark/gi, '')
    .replace(/From Wikipedia, the free encyclopedia/gi, '')
    .replace(/\([^)]*disambiguation[^)]*\)/gi, '')
    .replace(/redirects here/gi, '')
    .replace(/see also:/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Format and clean up the AI-extracted key information
function formatKeyInfo(aiResult) {
  const lines = aiResult.split('\n').filter(line => line.trim());
  const bulletPoints = [];
  
  for (const line of lines) {
    const cleaned = line.trim();
    if (cleaned && cleaned.length > 10) {
      const formatted = cleaned.startsWith('•') || cleaned.startsWith('-') || cleaned.startsWith('*') 
        ? cleaned.replace(/^[-*]/, '•') 
        : `• ${cleaned}`;
      bulletPoints.push(formatted);
    }
  }
  
  if (bulletPoints.length < 5) {
    bulletPoints.push(`• [Only ${bulletPoints.length} key points were identified in this content]`);
  }
  
  return bulletPoints.slice(0, 5).join('\n');
}

// Fallback extraction without AI
function extractKeyInfoFallback(text) {
  const highlights = [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 15);
  
  const patterns = [
    /\b(deadline|due date|expires?|until)\b.*\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
    /\b(meeting|call|appointment)\b.*\b(\d{1,2}:\d{2}|\d{1,2}[\/\-]\d{1,2})\b/i,
    /\b(amount|cost|price|fee|payment)\b.*\$?\d+/i,
    /\b(contact|email|phone)\b.*(@\w+\.\w+|\d{3}[.-]\d{3}[.-]\d{4})/i,
    /\b(action required|please|must|need to|important|urgent)\b/i
  ];
  
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (trimmed.length > 200) continue;
    
    const isImportant = patterns.some(pattern => pattern.test(trimmed));
    if (isImportant) {
      highlights.push(`• ${trimmed}`);
      if (highlights.length >= 5) break;
    }
  }
  
  if (highlights.length < 5) {
    const remaining = 5 - highlights.length;
    const additionalSentences = sentences
      .filter(s => s.trim().length > 20 && s.trim().length < 150)
      .slice(0, remaining);
    
    for (const sentence of additionalSentences) {
      highlights.push(`• ${sentence.trim()}`);
    }
  }
  
  return highlights.length > 0 
    ? `Key Information Found:\n\n${highlights.slice(0, 5).join('\n')}`
    : `Key Information:\n\n• No specific key information patterns detected\n• Try selecting text from an email or document\n• Content may not contain typical important elements\n• Check if page has dates, deadlines, or action items\n• Consider using the Summary function instead`;
}

// AI-powered page summarization
async function summarizePageWithAI(text) {
  const cleanedText = cleanTextForSummarization(text);
  
  // Check for Summarizer API (newer Chrome versions)
  if (globalThis.ai?.summarizer) {
    try {
      const summarizer = await globalThis.ai.summarizer.create({
        type: 'key-points',
        format: 'plain-text',
        length: 'medium'
      });
      
      const result = await summarizer.summarize(cleanedText.substring(0, 8000));
      summarizer.destroy();
      return `Summary:\n\n${result}`;
    } catch (error) {
      console.log('Summarizer API not available, falling back to Rewriter API');
    }
  }
  
  // Fallback to Rewriter API for summarization
  let rewriterAPI = null;
  
  if ('Rewriter' in globalThis) {
    rewriterAPI = globalThis.Rewriter;
  } else if (globalThis.ai?.rewriter) {
    rewriterAPI = globalThis.ai.rewriter;
  }
  
  if (!rewriterAPI) {
    throw new Error("Chrome AI not available");
  }

  const availability = await rewriterAPI.availability();
  if (availability === 'no') {
    throw new Error("Chrome AI not supported");
  }

  // Limit text length for rewriter
  const maxLength = 6000;
  const textToProcess = cleanedText.length > maxLength ? 
    cleanedText.substring(0, maxLength) + "..." : cleanedText;

  const options = {
    sharedContext: 'Summarize this content in 3-4 concise paragraphs, highlighting the main points and key takeaways.',
    tone: 'as-is',
    format: 'plain-text',
    length: 'shorter'
  };

  let rewriter;
  if (availability === 'readily') {
    rewriter = await rewriterAPI.create(options);
  } else {
    rewriter = await rewriterAPI.create(options);
  }

  const context = "Create a clear, concise summary of this content in 3-4 paragraphs. Focus on the main topic, key points, and important details.";
  const result = await rewriter.rewrite(textToProcess, { context });
  
  rewriter.destroy();
  
  return `Summary:\n\n${result}`;
}

function initializeZoomControls() {
    console.log('Initializing zoom controls...');
    
    const slider = document.getElementById('zoom-slider');
    const value = document.getElementById('zoom-value');
    
    // Update zoom function
    function updateZoom(zoomLevel) {
        if (slider) slider.value = zoomLevel;
        if (value) value.textContent = zoomLevel + '%';
        sendToActiveTab({action: 'zoom', level: zoomLevel});
    }
    
    // Slider control
    if (slider && value) {
        slider.addEventListener('input', function() {
            value.textContent = this.value + '%';
            sendToActiveTab({action: 'zoom', level: this.value});
        });
    }
    
    // Zoom in/out buttons
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    
    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', function() {
            const current = slider ? parseInt(slider.value) : 100;
            const newZoom = Math.min(300, current + 25);
            updateZoom(newZoom);
        });
    }
    
    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', function() {
            const current = slider ? parseInt(slider.value) : 100;
            const newZoom = Math.max(25, current - 25);
            updateZoom(newZoom);
        });
    }
    
    // Preset zoom buttons
    const presetButtons = [
        {id: 'zoom-50', level: 50},
        {id: 'zoom-75', level: 75},
        {id: 'zoom-100', level: 100},
        {id: 'zoom-125', level: 125},
        {id: 'zoom-150', level: 150}
    ];
    
    presetButtons.forEach(({id, level}) => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', function() {
                updateZoom(level);
            });
        }
    });
    
    // Reset button
    const resetBtn = document.getElementById('reset-zoom');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            updateZoom(100);
        });
    }
    
    // Fit width button
    const fitBtn = document.getElementById('zoom-fit');
    if (fitBtn) {
        fitBtn.addEventListener('click', function() {
            updateZoom(90); // Approximate fit width zoom
        });
    }
}

function initializePrintControlsContent() {
    console.log('Initializing print controls...');
    
    // Print page button
    const printPageBtn = document.getElementById('print-page');
    if (printPageBtn) {
        printPageBtn.addEventListener('click', function() {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                if (tabs[0]) {
                    chrome.tabs.executeScript(tabs[0].id, {
                        code: 'window.print();'
                    });
                }
            });
        });
    }
    
    // Save PDF button
    const savePdfBtn = document.getElementById('save-pdf');
    if (savePdfBtn) {
        savePdfBtn.addEventListener('click', function() {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                if (tabs[0]) {
                    chrome.tabs.executeScript(tabs[0].id, {
                        code: 'window.print();'
                    });
                }
            });
        });
    }
}

// Utility function to send messages to content script
function sendToActiveTab(message) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, message);
        }
    });
}

// Weather panel functions
function showWeatherPanel() {
    console.log('Showing weather panel');
    const weatherPanel = document.getElementById('weather-panel');
    if (weatherPanel) {
        weatherPanel.classList.remove('hidden');
        
        // Add event listener for close button
        const closeBtn = document.getElementById('close-weather');
        if (closeBtn) {
            closeBtn.addEventListener('click', hideWeatherPanel);
        }
    }
}

function hideWeatherPanel() {
    console.log('Hiding weather panel');
    const weatherPanel = document.getElementById('weather-panel');
    if (weatherPanel) {
        weatherPanel.classList.add('hidden');
    }
}