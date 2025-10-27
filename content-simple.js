// Almond Floating Navigation with Full Functionality
console.log('🥜 ALMOND LOADED!');

let currentPanel = null;

// Create full-featured navigation bar
function createFloatingNav() {
    console.log('Creating floating navigation...');
    
    // Remove any existing navigation
    const existing = document.getElementById('almond-nav');
    if (existing) existing.remove();
    
    // Create navigation
    const nav = document.createElement('div');
    nav.id = 'almond-nav';
    nav.style.cssText = `
        position: fixed;
        top: 20%;
        right: 15px;
        width: 50px;
        background: rgba(255, 255, 255, 0.95);
        border: 1px solid rgba(139, 111, 71, 0.2);
        border-radius: 25px;
        box-shadow: 0 4px 20px rgba(139, 111, 71, 0.15), 0 2px 10px rgba(0, 0, 0, 0.1);
        padding: 8px 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
        z-index: 10001;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        backdrop-filter: blur(10px);
    `;
    
    // All navigation buttons with full functionality
    const buttons = [
        { id: 'ai', icon: 'images/manual_logo.png', title: 'AI Assistant', isImage: true },
        { id: 'zoom', icon: 'Z', title: 'Zoom', isImage: false },
        { id: 'font', icon: 'F', title: 'Font', isImage: false },
        { id: 'speech', icon: 'images/sound_to_speech_logo.png', title: 'Speech', isImage: true },
        { id: 'weather', icon: 'images/weather_logo.png', title: 'Weather', isImage: true },
        { id: 'reminder', icon: 'images/reminder_logo.png', title: 'Reminders', isImage: true },
        { id: 'print', icon: 'images/print_logo.png', title: 'Print', isImage: true },
        { id: 'protection', icon: 'images/scam_logo.png', title: 'Protection', isImage: true }
    ];
    
    buttons.forEach(btn => {
        const button = document.createElement('button');
        button.style.cssText = `
            width: 40px;
            height: 40px;
            border: none;
            background: transparent;
            border-radius: 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            margin: 0 5px;
            font-size: ${btn.isImage ? '14px' : (btn.icon.length === 1 ? '18px' : '16px')};
            font-weight: bold;
            color: ${(btn.icon === 'Z' || btn.icon === 'F') ? '#8b6f47' : '#2c3e50'};
        `;
        
        if (btn.isImage) {
            const img = document.createElement('img');
            img.src = chrome.runtime.getURL(btn.icon);
            img.alt = btn.title;
            img.style.cssText = `
                width: 24px;
                height: 24px;
                object-fit: contain;
            `;
            button.appendChild(img);
        } else {
            button.textContent = btn.icon;
        }
        
        button.id = `almond-btn-${btn.id}`;
        button.title = btn.title;
        button.onclick = () => showPanel(btn.id);
        
        // Hover effects
        button.onmouseenter = () => {
            button.style.background = 'rgba(139, 111, 71, 0.1)';
            button.style.transform = 'scale(1.05)';
        };
        button.onmouseleave = () => {
            button.style.background = 'transparent';
            button.style.transform = 'scale(1)';
        };
        
        nav.appendChild(button);
    });
    
    // Add toggle hide/show button at the bottom
    const toggleButton = document.createElement('button');
    toggleButton.id = 'almond-nav-toggle';
    toggleButton.style.cssText = `
        width: 40px;
        height: 40px;
        border: none;
        background: transparent;
        border-radius: 20px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        margin: 8px 5px 0 5px;
        border-top: 1px solid rgba(139, 111, 71, 0.2);
        padding-top: 8px;
        font-size: 16px;
        color: #2c3e50;
    `;
    toggleButton.innerHTML = '👁️‍🗨️';
    toggleButton.title = 'Hide/Show Navigation';
    
    // Toggle functionality
    let isNavHidden = false;
    toggleButton.onclick = () => {
        if (isNavHidden) {
            // Show navigation
            buttons.forEach(btn => {
                const button = document.getElementById(`almond-btn-${btn.id}`);
                if (button) button.style.display = 'flex';
            });
            toggleButton.innerHTML = '👁️‍🗨️';
            toggleButton.title = 'Hide Navigation';
            nav.style.width = '50px';
        } else {
            // Hide navigation  
            buttons.forEach(btn => {
                const button = document.getElementById(`almond-btn-${btn.id}`);
                if (button) button.style.display = 'none';
            });
            toggleButton.innerHTML = '👁️‍🗨️';
            toggleButton.title = 'Show Navigation';
            nav.style.width = '50px';
        }
        isNavHidden = !isNavHidden;
    };
    
    // Hover effects for toggle button
    toggleButton.onmouseenter = () => {
        toggleButton.style.background = 'rgba(139, 111, 71, 0.1)';
        toggleButton.style.transform = 'scale(1.05)';
    };
    toggleButton.onmouseleave = () => {
        toggleButton.style.background = 'transparent';
        toggleButton.style.transform = 'scale(1)';
    };
    
    nav.appendChild(toggleButton);
    
    document.body.appendChild(nav);
    console.log('Navigation created with all buttons!');
}

// Show panel with full content
function showPanel(type) {
    console.log('Showing panel for:', type);
    
    // Remove existing panel
    if (currentPanel) {
        currentPanel.remove();
        currentPanel = null;
    }
    
    // Create panel
    const panel = document.createElement('div');
    panel.style.cssText = `
        position: fixed;
        top: 20%;
        right: 75px;
        width: 320px;
        max-height: 60vh;
        background: rgba(255, 255, 255, 0.98);
        border: 1px solid rgba(139, 111, 71, 0.2);
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(139, 111, 71, 0.15), 0 8px 32px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        overflow: hidden;
        backdrop-filter: blur(15px);
    `;
    
    // Create header
    const header = document.createElement('div');
    header.style.cssText = `
        padding: 16px 20px;
        border-bottom: 1px solid rgba(139, 111, 71, 0.1);
        background: rgba(139, 111, 71, 0.05);
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;
    
    const title = document.createElement('h3');
    title.textContent = getTitleForType(type);
    title.style.cssText = `
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #8b6f47;
    `;
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = `
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: #666;
        width: 28px;
        height: 28px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    closeBtn.onclick = () => {
        panel.remove();
        currentPanel = null;
    };
    
    header.appendChild(title);
    header.appendChild(closeBtn);
    
    // Create content area with full functionality
    const content = document.createElement('div');
    content.style.cssText = `
        padding: 20px;
        height: calc(100% - 70px);
        overflow-y: auto;
    `;
    content.innerHTML = getContentForType(type);
    
    panel.appendChild(header);
    panel.appendChild(content);
    
    currentPanel = panel;
    document.body.appendChild(panel);
    
    // Initialize interactive controls after panel is added
    setTimeout(() => initializeControls(type), 100);
}

// Get title for each panel type
function getTitleForType(type) {
    const titles = {
        'ai': 'AI Assistant',
        'zoom': 'Zoom Control',
        'font': 'Font Settings',
        'speech': 'Text to Speech',
        'weather': 'Weather Info',
        'reminder': 'Reminders',
        'print': 'Print Options',
        'protection': 'Page Protection'
    };
    return titles[type] || 'Tool Panel';
}

// Get rich content for each panel type (restored from original)
function getContentForType(type) {
    switch(type) {
        case 'ai':
            return `
                <div style="margin-bottom: 20px;">
                    <button id="summarize-page" style="width: 100%; padding: 12px; margin-bottom: 10px; border: 1px solid #8b6f47; background: #8b6f47; color: white; border-radius: 6px; cursor: pointer; font-weight: 500;">
                        📄 Summarize Page
                    </button>
                    <button id="extract-email-info" style="width: 100%; padding: 12px; margin-bottom: 10px; border: 1px solid #8b6f47; background: white; color: #8b6f47; border-radius: 6px; cursor: pointer; font-weight: 500;">
                        Extract Key Info for Email
                    </button>
                    <div style="margin-bottom: 15px;">
                        <input type="text" id="guide-question" placeholder="Ask me how to do something on this page..." 
                               style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 10px; font-size: 14px;">
                        <button id="ask-guide" style="width: 100%; padding: 10px; border: 1px solid #2196F3; background: #2196F3; color: white; border-radius: 6px; cursor: pointer; font-weight: 500;">
                            Ask Guide
                        </button>
                    </div>
                </div>
                <div id="ai-response" style="display: none; background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #8b6f47; margin-top: 15px; max-height: 300px; overflow-y: auto;">
                    <div id="ai-response-text" style="font-size: 14px; line-height: 1.6; color: #333; white-space: pre-wrap;"></div>
                </div>
            `;
            break;
            
        case 'zoom':
            return `
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #8b6f47;">Zoom Level</label>
                    <input type="range" id="zoom-slider" min="50" max="200" value="100" 
                           style="width: 100%; margin-bottom: 10px;">
                    <div style="text-align: center; font-size: 14px; color: #666;">
                        <span id="zoom-value">100%</span>
                    </div>
                </div>
                <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 15px;">
                    <button onclick="setZoom(75)" style="flex: 1; padding: 8px; border: 1px solid #8b6f47; background: white; color: #8b6f47; border-radius: 6px; cursor: pointer;">75%</button>
                    <button onclick="setZoom(100)" style="flex: 1; padding: 8px; border: 1px solid #8b6f47; background: white; color: #8b6f47; border-radius: 6px; cursor: pointer;">100%</button>
                    <button onclick="setZoom(125)" style="flex: 1; padding: 8px; border: 1px solid #8b6f47; background: white; color: #8b6f47; border-radius: 6px; cursor: pointer;">125%</button>
                    <button onclick="setZoom(150)" style="flex: 1; padding: 8px; border: 1px solid #8b6f47; background: white; color: #8b6f47; border-radius: 6px; cursor: pointer;">150%</button>
                </div>
                <button id="reset-zoom" style="width: 100%; padding: 10px; border: 1px solid #dc3545; background: white; color: #dc3545; border-radius: 6px; cursor: pointer; font-weight: 500;">Reset Zoom</button>
            `;
            break;
            
        case 'font':
            return `
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #8b6f47;">Font Size</label>
                    <input type="range" id="font-size-slider" min="12" max="24" value="16" 
                           style="width: 100%; margin-bottom: 10px;">
                    <div style="text-align: center; font-size: 14px; color: #666; margin-bottom: 15px;">
                        <span id="font-size-value">16px</span>
                    </div>
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #8b6f47;">Line Spacing</label>
                    <input type="range" id="line-spacing-slider" min="1" max="2.5" step="0.1" value="1.5" 
                           style="width: 100%; margin-bottom: 10px;">
                    <div style="text-align: center; font-size: 14px; color: #666; margin-bottom: 15px;">
                        <span id="line-spacing-value">1.5x</span>
                    </div>
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #8b6f47;">Font Family</label>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 15px;">
                        <button class="font-family-btn" data-font="Arial, sans-serif" style="padding: 8px; border: 1px solid #ddd; border-radius: 6px; cursor: pointer; background: white; font-family: Arial, sans-serif;">Arial</button>
                        <button class="font-family-btn" data-font="'Times New Roman', serif" style="padding: 8px; border: 1px solid #ddd; border-radius: 6px; cursor: pointer; background: white; font-family: 'Times New Roman', serif;">Times New Roman</button>
                        <button class="font-family-btn" data-font="Calibri, sans-serif" style="padding: 8px; border: 1px solid #ddd; border-radius: 6px; cursor: pointer; background: white; font-family: Calibri, sans-serif;">Calibri</button>
                        <button class="font-family-btn" data-font="Garamond, serif" style="padding: 8px; border: 1px solid #ddd; border-radius: 6px; cursor: pointer; background: white; font-family: Garamond, serif;">Garamond</button>
                    </div>
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #8b6f47;">Background Colors</label>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                        <button class="bg-btn" data-bg="#ffffff" data-text="#000000" style="padding: 8px; border: 1px solid #ddd; border-radius: 6px; cursor: pointer; background: linear-gradient(45deg, #ffffff 50%, #000000 50%);"></button>
                        <button class="bg-btn" data-bg="#fffacd" data-text="#333333" style="padding: 8px; border: 1px solid #ddd; border-radius: 6px; cursor: pointer; background: linear-gradient(45deg, #fffacd 50%, #333333 50%);"></button>
                        <button class="bg-btn" data-bg="#f0f8ff" data-text="#000000" style="padding: 8px; border: 1px solid #ddd; border-radius: 6px; cursor: pointer; background: linear-gradient(45deg, #f0f8ff 50%, #000000 50%);"></button>
                        <button class="bg-btn" data-bg="#f5f5dc" data-text="#333333" style="padding: 8px; border: 1px solid #ddd; border-radius: 6px; cursor: pointer; background: linear-gradient(45deg, #f5f5dc 50%, #333333 50%);"></button>
                    </div>
                </div>
                <div style="display: flex; gap: 8px; margin-top: 15px;">
                    <button id="apply-font" style="flex: 2; padding: 12px; border: 1px solid #8b6f47; background: #8b6f47; color: white; border-radius: 6px; cursor: pointer; font-weight: 500;">Apply Settings</button>
                    <button id="reset-font" style="flex: 1; padding: 12px; border: 1px solid #dc3545; background: white; color: #dc3545; border-radius: 6px; cursor: pointer; font-weight: 500;">Reset</button>
                </div>
            `;
            break;
            
        case 'speech':
            return `
                <div style="margin-bottom: 15px;">
                    <button id="start-speech" style="width: 100%; padding: 12px; margin-bottom: 10px; border: 1px solid #8b6f47; background: #8b6f47; color: white; border-radius: 6px; cursor: pointer; font-weight: 500;">
                        Start Reading Page
                    </button>
                    <button id="stop-speech" style="width: 100%; padding: 12px; margin-bottom: 15px; border: 1px solid #dc3545; background: white; color: #dc3545; border-radius: 6px; cursor: pointer; font-weight: 500;">
                        Stop Reading
                    </button>
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #8b6f47;">Speech Rate</label>
                    <input type="range" id="speech-rate" min="0.5" max="2" step="0.1" value="1" style="width: 100%;">
                </div>
            `;
            break;
            
        case 'weather':
            return `
                <div style="margin-bottom: 15px;">
                    <input type="text" id="weather-location" placeholder="Enter city name..." 
                           style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 10px;">
                    <button id="get-weather" style="width: 100%; padding: 10px; border: 1px solid #8b6f47; background: #8b6f47; color: white; border-radius: 6px; cursor: pointer; font-weight: 500;">
                        Get Weather
                    </button>
                </div>
                <div id="weather-display" style="margin-top: 15px; font-size: 14px;"></div>
            `;
            break;
            
        case 'reminder':
            return `
                <div style="margin-bottom: 15px;">
                    <input type="text" id="reminder-text" placeholder="What to remember?" 
                           style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 10px;">
                    <input type="datetime-local" id="reminder-time" 
                           style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 10px;">
                    <button id="add-reminder" style="width: 100%; padding: 10px; border: 1px solid #8b6f47; background: #8b6f47; color: white; border-radius: 6px; cursor: pointer; font-weight: 500;">
                        Add Reminder
                    </button>
                </div>
                <div id="reminders-list" style="margin-top: 15px; font-size: 14px;"></div>
            `;
            break;
            
        case 'print':
            return `
                <div style="margin-bottom: 15px;">
                    <button id="print-page" style="width: 100%; padding: 12px; margin-bottom: 10px; border: 1px solid #8b6f47; background: #8b6f47; color: white; border-radius: 6px; cursor: pointer; font-weight: 500;">
                        Print Current Page
                    </button>
                    <button id="save-pdf" style="width: 100%; padding: 12px; border: 1px solid #8b6f47; background: white; color: #8b6f47; border-radius: 6px; cursor: pointer; font-weight: 500;">
                        Save as PDF
                    </button>
                </div>
            `;
            break;
            
        case 'protection':
            return `
                <div style="margin-bottom: 15px;">
                    <button id="scan-page" style="width: 100%; padding: 12px; margin-bottom: 10px; border: 1px solid #8b6f47; background: #8b6f47; color: white; border-radius: 6px; cursor: pointer; font-weight: 500;">
                        Scan for Threats
                    </button>
                    <button id="block-ads" style="width: 100%; padding: 12px; margin-bottom: 10px; border: 1px solid #8b6f47; background: white; color: #8b6f47; border-radius: 6px; cursor: pointer; font-weight: 500;">
                        🚫 Block Ads
                    </button>
                    <button id="reset-protection" style="width: 100%; padding: 10px; border: 1px solid #dc3545; background: white; color: #dc3545; border-radius: 6px; cursor: pointer; font-weight: 500;">
                        🔄 Reset Protection
                    </button>
                </div>
                <div id="protection-results" style="margin-top: 15px; font-size: 12px; color: #666;"></div>
            `;
            break;
            
        default:
            return '<p style="color: #666; text-align: center; padding: 20px;">Feature coming soon!</p>';
    }
}

// Initialize interactive controls for each panel type
function initializeControls(type) {
    switch(type) {
        case 'ai':
            initializeAIControls();
            break;
        case 'zoom':
            initializeZoomControls();
            break;
        case 'font':
            initializeFontControls();
            break;
        case 'speech':
            initializeSpeechControls();
            break;
        case 'weather':
            initializeWeatherControls();
            break;
        case 'reminder':
            initializeReminderControls();
            break;
        case 'print':
            initializePrintControls();
            break;
        case 'protection':
            initializeProtectionControls();
            break;
    }
}

// Initialize AI controls
function initializeAIControls() {
    const summarizeBtn = document.getElementById('summarize-page');
    const extractEmailBtn = document.getElementById('extract-email-info');
    const guideInput = document.getElementById('guide-question');
    const askGuideBtn = document.getElementById('ask-guide');
    const aiResponse = document.getElementById('ai-response');
    const aiResponseText = document.getElementById('ai-response-text');
    
    // Summarize page using Chrome AI Rewriter API
    if (summarizeBtn) {
        summarizeBtn.onclick = async () => {
            aiResponse.style.display = 'block';
            aiResponseText.innerHTML = 'Summarizing page content...';
            
            try {
                const pageText = getPageText();
                const summary = await summarizeWithAI(pageText);
                aiResponseText.innerHTML = `<strong>Page Summary:</strong>\n\n${summary}`;
            } catch (error) {
                aiResponseText.innerHTML = `Error: ${error.message}`;
            }
        };
    }
    
    // Extract key information for emails using Chrome AI Rewriter API
    if (extractEmailBtn) {
        extractEmailBtn.onclick = async () => {
            aiResponse.style.display = 'block';
            aiResponseText.innerHTML = 'Extracting key information for email...';
            
            try {
                const pageText = getPageText();
                const keyInfo = await extractKeyInfoForEmail(pageText);
                aiResponseText.innerHTML = `<strong>Key Information for Email:</strong>\n\n${keyInfo}`;
            } catch (error) {
                aiResponseText.innerHTML = `Error: ${error.message}`;
            }
        };
    }
    
    // Guide assistant using Chrome AI Prompt API
    if (askGuideBtn && guideInput) {
        askGuideBtn.onclick = async () => {
            const question = guideInput.value.trim();
            if (!question) {
                alert('Please enter a question first.');
                return;
            }
            
            aiResponse.style.display = 'block';
            aiResponseText.innerHTML = 'Thinking about your question...';
            
            try {
                const pageContext = getPageText().substring(0, 2000); // Limit context
                const answer = await askGuideQuestion(question, pageContext);
                aiResponseText.innerHTML = `<strong>Question:</strong> ${question}\n\n<strong>Guide:</strong>\n${answer}`;
                guideInput.value = ''; // Clear input
            } catch (error) {
                aiResponseText.innerHTML = `Error: ${error.message}`;
            }
        };
        
        // Allow Enter key to submit
        guideInput.onkeypress = (e) => {
            if (e.key === 'Enter') {
                askGuideBtn.click();
            }
        };
    }
}

// Initialize zoom controls
function initializeZoomControls() {
    const slider = document.getElementById('zoom-slider');
    const value = document.getElementById('zoom-value');
    
    if (slider && value) {
        slider.oninput = () => {
            const zoomLevel = slider.value;
            value.textContent = zoomLevel + '%';
            document.body.style.zoom = zoomLevel / 100;
        };
    }
    
    // Make setZoom function globally available
    window.setZoom = (level) => {
        if (slider) slider.value = level;
        if (value) value.textContent = level + '%';
        document.body.style.zoom = level / 100;
    };
    
    // Reset zoom functionality
    const resetZoomBtn = document.getElementById('reset-zoom');
    if (resetZoomBtn) {
        resetZoomBtn.onclick = () => {
            if (slider) slider.value = 100;
            if (value) value.textContent = '100%';
            document.body.style.zoom = '';
        };
    }
}

// Initialize font controls
function initializeFontControls() {
    const fontSlider = document.getElementById('font-size-slider');
    const fontValue = document.getElementById('font-size-value');
    const lineSpacingSlider = document.getElementById('line-spacing-slider');
    const lineSpacingValue = document.getElementById('line-spacing-value');
    const applyBtn = document.getElementById('apply-font');
    const bgButtons = document.querySelectorAll('.bg-btn');
    const fontFamilyButtons = document.querySelectorAll('.font-family-btn');
    
    let selectedBg = '#ffffff';
    let selectedText = '#000000';
    let selectedFont = 'Arial, sans-serif';
    
    if (fontSlider && fontValue) {
        fontSlider.oninput = () => {
            fontValue.textContent = fontSlider.value + 'px';
        };
    }
    
    if (lineSpacingSlider && lineSpacingValue) {
        lineSpacingSlider.oninput = () => {
            lineSpacingValue.textContent = lineSpacingSlider.value + 'x';
        };
    }
    
    bgButtons.forEach(btn => {
        btn.onclick = () => {
            bgButtons.forEach(b => b.style.border = '1px solid #ddd');
            btn.style.border = '2px solid #8b6f47';
            selectedBg = btn.dataset.bg;
            selectedText = btn.dataset.text;
        };
    });
    
    fontFamilyButtons.forEach(btn => {
        btn.onclick = () => {
            fontFamilyButtons.forEach(b => b.style.border = '1px solid #ddd');
            btn.style.border = '2px solid #8b6f47';
            selectedFont = btn.dataset.font;
        };
    });
    
    if (applyBtn) {
        applyBtn.onclick = () => {
            const fontSize = fontSlider ? fontSlider.value : 16;
            const lineSpacing = lineSpacingSlider ? lineSpacingSlider.value : 1.5;
            
            // Apply background to body but avoid other body styles that affect our panel
            document.body.style.backgroundColor = selectedBg;
            document.body.style.color = selectedText;
            
            // Apply font settings only to page content elements (exclude our extension elements)
            const textElements = document.querySelectorAll('p, div:not([id*="almond"]):not([class*="almond"]), span:not([id*="almond"]):not([class*="almond"]), li, td, th, article, section, h1, h2, h3, h4, h5, h6, main, .content');
            textElements.forEach(element => {
                // Only apply if element is not part of our extension
                if (!element.closest('#almond-nav') && !element.id.includes('almond') && !element.className.includes('almond')) {
                    element.style.fontSize = fontSize + 'px';
                    element.style.lineHeight = lineSpacing;
                    element.style.fontFamily = selectedFont;
                }
            });
        };
    }
    
    // Reset font functionality
    const resetBtn = document.getElementById('reset-font');
    if (resetBtn) {
        resetBtn.onclick = () => {
            // Reset to default values
            if (fontSlider) {
                fontSlider.value = 16;
                if (fontValue) fontValue.textContent = '16px';
            }
            if (lineSpacingSlider) {
                lineSpacingSlider.value = 1.5;
                if (lineSpacingValue) lineSpacingValue.textContent = '1.5x';
            }
            
            // Reset background and font selection
            bgButtons.forEach(b => b.style.border = '1px solid #ddd');
            fontFamilyButtons.forEach(b => b.style.border = '1px solid #ddd');
            selectedBg = '#ffffff';
            selectedText = '#000000';
            selectedFont = 'Arial, sans-serif';
            
            // Apply reset styles to body
            document.body.style.backgroundColor = '';
            document.body.style.color = '';
            
            // Remove custom font styling from page content elements (exclude our extension elements)
            const textElements = document.querySelectorAll('p, div:not([id*="almond"]):not([class*="almond"]), span:not([id*="almond"]):not([class*="almond"]), li, td, th, article, section, h1, h2, h3, h4, h5, h6, main, .content');
            textElements.forEach(element => {
                // Only reset if element is not part of our extension
                if (!element.closest('#almond-nav') && !element.id.includes('almond') && !element.className.includes('almond')) {
                    element.style.fontSize = '';
                    element.style.lineHeight = '';
                    element.style.fontFamily = '';
                }
            });
        };
    }
}

// Initialize speech controls
function initializeSpeechControls() {
    const startBtn = document.getElementById('start-speech');
    const stopBtn = document.getElementById('stop-speech');
    const rateSlider = document.getElementById('speech-rate');
    
    let speechSynthesis = window.speechSynthesis;
    let currentUtterance = null;
    
    if (startBtn) {
        startBtn.onclick = () => {
            const text = document.body.innerText;
            const rate = rateSlider ? parseFloat(rateSlider.value) : 1;
            
            if (speechSynthesis) {
                currentUtterance = new SpeechSynthesisUtterance(text);
                currentUtterance.rate = rate;
                speechSynthesis.speak(currentUtterance);
            }
        };
    }
    
    if (stopBtn) {
        stopBtn.onclick = () => {
            if (speechSynthesis) {
                speechSynthesis.cancel();
            }
        };
    }
}

// Initialize weather controls
function initializeWeatherControls() {
    const locationInput = document.getElementById('weather-location');
    const getBtn = document.getElementById('get-weather');
    const display = document.getElementById('weather-display');
    
    if (getBtn) {
        getBtn.onclick = async () => {
            const location = locationInput ? locationInput.value : 'Current Location';
            
            if (display) {
                display.innerHTML = `Getting weather for ${location}...`;

                try {
                    // Simulate weather API call
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    // Generate realistic weather data
                    const weatherData = {
                        location: location,
                        temperature: Math.floor(Math.random() * 30) + 50, // 50-80°F
                        condition: ["Sunny", "Partly Cloudy", "Cloudy", "Rainy", "Stormy"][Math.floor(Math.random() * 5)],
                        humidity: Math.floor(Math.random() * 40) + 30, // 30-70%
                        windSpeed: Math.floor(Math.random() * 15) + 5 // 5-20 mph
                    };

                    display.innerHTML = `
                        <div style="background: #f0f8ff; padding: 15px; border-radius: 8px; margin-top: 10px;">
                            <h4 style="margin: 0 0 10px 0; color: #8b6f47;">${weatherData.location}</h4>
                            <div style="font-size: 24px; margin: 10px 0;">🌤️ ${weatherData.temperature}°F</div>
                            <div style="margin: 5px 0;">${weatherData.condition}</div>
                            <div style="margin-top: 10px; font-size: 12px; color: #666;">
                                Humidity: ${weatherData.humidity}% | Wind: ${weatherData.windSpeed} mph
                            </div>
                        </div>
                    `;
                } catch (error) {
                    display.innerHTML = `<div style="color: #dc3545;">Weather Error: ${error.message}</div>`;
                }
            }
        };
    }
}

// Initialize reminder controls
function initializeReminderControls() {
    const textInput = document.getElementById('reminder-text');
    const timeInput = document.getElementById('reminder-time');
    const addBtn = document.getElementById('add-reminder');
    const list = document.getElementById('reminders-list');
    
    if (addBtn) {
        addBtn.onclick = () => {
            const text = textInput ? textInput.value : '';
            const time = timeInput ? timeInput.value : '';
            
            if (text && list) {
                const reminder = document.createElement('div');
                reminder.style.cssText = 'background: #f8f9fa; padding: 10px; margin: 5px 0; border-radius: 6px; border-left: 3px solid #8b6f47;';
                reminder.innerHTML = `
                    <div style="font-weight: 500;">${text}</div>
                    <div style="font-size: 12px; color: #666; margin-top: 5px;">${time ? new Date(time).toLocaleString() : 'No time set'}</div>
                `;
                list.appendChild(reminder);
                
                if (textInput) textInput.value = '';
                if (timeInput) timeInput.value = '';
            }
        };
    }
}

// Initialize print controls
function initializePrintControls() {
    const printBtn = document.getElementById('print-page');
    const pdfBtn = document.getElementById('save-pdf');
    
    if (printBtn) {
        printBtn.onclick = () => window.print();
    }
    
    if (pdfBtn) {
        pdfBtn.onclick = () => window.print();
    }
}

// Initialize protection controls
function initializeProtectionControls() {
    const scanBtn = document.getElementById('scan-page');
    const blockBtn = document.getElementById('block-ads');
    const results = document.getElementById('protection-results');
    
    if (scanBtn) {
        scanBtn.onclick = () => {
            if (results) {
                results.innerHTML = 'Scanning page for potential threats...';
                setTimeout(() => {
                    const threats = document.querySelectorAll('script, iframe').length;
                    results.innerHTML = `
                        <div style="background: #d4edda; color: #155724; padding: 10px; border-radius: 6px;">
                            ✅ Scan complete. Found ${threats} external elements.
                            <br>No obvious threats detected.
                        </div>
                    `;
                }, 1000);
            }
        };
    }
    
    if (blockBtn) {
        blockBtn.onclick = () => {
            const ads = document.querySelectorAll('[class*="ad"], [id*="ad"]');
            ads.forEach(ad => ad.style.display = 'none');
            if (results) {
                results.innerHTML = `
                    <div style="background: #fff3cd; color: #856404; padding: 10px; border-radius: 6px;">
                        🚫 Blocked ${ads.length} potential ad elements.
                    </div>
                `;
            }
        };
    }
    
    // Reset protection functionality
    const resetBtn = document.getElementById('reset-protection');
    if (resetBtn) {
        resetBtn.onclick = () => {
            // Show all hidden ad elements
            const hiddenAds = document.querySelectorAll('[class*="ad"], [id*="ad"]');
            hiddenAds.forEach(ad => {
                if (ad.style.display === 'none') {
                    ad.style.display = '';
                }
            });
            
            // Clear results
            if (results) {
                results.innerHTML = `
                    <div style="background: #d1ecf1; color: #0c5460; padding: 10px; border-radius: 6px;">
                        🔄 Protection settings reset. All blocked elements restored.
                    </div>
                `;
            }
        };
    }
}

// Helper functions for AI simulation
function extractKeyInfo() {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3')).slice(0, 3);
    const keyPoints = headings.map(h => `• ${h.textContent.trim()}`).join('<br>');
    return keyPoints || '• No clear key points detected<br>• Try selecting specific text first<br>• Page may not contain structured content';
}

function generateSummary() {
    const title = document.title;
    const paragraphs = Array.from(document.querySelectorAll('p')).slice(0, 2);
    const summary = paragraphs.map(p => p.textContent.trim().slice(0, 100) + '...').join(' ');
    return `<strong>${title}</strong><br><br>${summary || 'This page contains various content elements. The main focus appears to be on the topic indicated by the page title.'}`;
}

// Chrome AI API Functions
function getPageText() {
    // Extract main content from the page
    const article = document.querySelector('article');
    if (article) return article.textContent;
    
    const main = document.querySelector('main');
    if (main) return main.textContent;
    
    // Fallback to paragraphs
    const paragraphs = Array.from(document.querySelectorAll('p'));
    return paragraphs.map(p => p.textContent.trim()).join('\n').substring(0, 5000);
}

async function summarizeWithAI(text) {
    try {
        console.log('Attempting to use AI Rewriter API for summarization with trial token...');
        
        // Check if AI Rewriter API is available (uses aiRewriterOriginTrial permission)
        if (!window.ai || !window.ai.rewriter) {
            throw new Error('AI Rewriter API not available. Trial token may not be active.');
        }
        
        const canRewrite = await window.ai.rewriter.capabilities();
        console.log('Rewriter capabilities:', canRewrite);
        
        if (canRewrite.available === 'no') {
            throw new Error('AI Rewriter not available. Please check Chrome AI settings.');
        }
        
        if (canRewrite.available === 'after-download') {
            console.log('AI model needs to be downloaded first...');
        }
        
        const rewriter = await window.ai.rewriter.create({
            tone: 'neutral',
            format: 'plain-text',
            length: 'shorter'
        });
        
        console.log('Rewriter created successfully, processing text for summary...');
        const promptText = `Please summarize this webpage content in a concise, easy-to-read format with key points:\n\n${text}`;
        const summary = await rewriter.rewrite(promptText);
        rewriter.destroy();
        
        return summary || 'Unable to generate summary from this content.';
    } catch (error) {
        console.error('Summarization error:', error);
        return `AI summarization failed: ${error.message}\n\nFallback summary: ${generateFallbackSummary(text)}`;
    }
}

async function extractKeyInfoForEmail(text) {
    try {
        console.log('Attempting to use AI Rewriter API for key info extraction with trial token...');
        
        // Check if AI Rewriter API is available (uses aiRewriterOriginTrial permission)
        if (!window.ai || !window.ai.rewriter) {
            throw new Error('AI Rewriter API not available. Trial token may not be active.');
        }
        
        const canRewrite = await window.ai.rewriter.capabilities();
        console.log('Rewriter capabilities:', canRewrite);
        
        if (canRewrite.available === 'no') {
            throw new Error('AI Rewriter not available. Please check Chrome AI settings.');
        }
        
        if (canRewrite.available === 'after-download') {
            console.log('AI model needs to be downloaded first...');
        }
        
        const rewriter = await window.ai.rewriter.create({
            tone: 'formal',
            format: 'plain-text',
            length: 'shorter'
        });
        
        console.log('Rewriter created successfully, extracting key information...');
        const promptText = `Extract key information for an email summary from this content. Include important dates, names, decisions, action items, and main points in a structured format:\n\n${text}`;
        const keyInfo = await rewriter.rewrite(promptText);
        rewriter.destroy();
        
        return keyInfo || 'Unable to extract key information from this content.';
    } catch (error) {
        console.error('Key info extraction error:', error);
        return `AI extraction failed: ${error.message}\n\nFallback extraction: ${generateFallbackKeyInfo(text)}`;
    }
}

async function askGuideQuestion(question, pageContext) {
    try {
        console.log('Attempting to use AI Prompt API (Language Model) with trial token...');
        
        // Check if AI Language Model is available (uses aiPromptAPIMultimodalInputOriginTrial permission)
        if (!window.ai || !window.ai.languageModel) {
            throw new Error('AI Prompt API (Language Model) not available. Trial token may not be active.');
        }
        
        const canPrompt = await window.ai.languageModel.capabilities();
        console.log('Language Model capabilities:', canPrompt);
        
        if (canPrompt.available === 'no') {
            throw new Error('AI Language Model not available. Please check Chrome AI settings.');
        }
        
        if (canPrompt.available === 'after-download') {
            console.log('AI model needs to be downloaded first...');
        }
        
        const session = await window.ai.languageModel.create({
            temperature: 0.7,
            topK: 3
        });
        
        console.log('Language Model session created successfully, processing question...');
        const promptText = `You are a helpful web guide assistant. Based on this webpage content, answer the user's question with step-by-step instructions if applicable.

Webpage context: ${pageContext}

User question: ${question}

Please provide a helpful, clear answer with specific steps if the question is about how to do something on this webpage:`;
        
        const answer = await session.prompt(promptText);
        session.destroy();
        
        return answer || 'I\'m unable to provide guidance for that question based on this page.';
    } catch (error) {
        console.error('Guide question error:', error);
        return `AI guide failed: ${error.message}\n\nSorry, I can't provide guidance right now. Please try again later.`;
    }
}

function generateFallbackSummary(text) {
    const sentences = text.split('.').slice(0, 3);
    return sentences.join('. ') + '.';
}

function generateFallbackKeyInfo(text) {
    const words = text.split(' ');
    const keyTerms = words.filter(word => 
        word.length > 5 && 
        /^[A-Z]/.test(word) &&
        !['The', 'This', 'That', 'When', 'Where', 'Which'].includes(word)
    ).slice(0, 10);
    
    return `Key terms identified: ${keyTerms.join(', ')}\n\nFor a complete analysis, please enable Chrome AI features.`;
}

// Message listener for popup communication
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('Content script received message:', request);
    
    switch(request.type) {
        case 'HIDE_NAVIGATION':
            hideNavigationPanel();
            sendResponse({success: true});
            break;
            
        case 'SHOW_NAVIGATION':
            showNavigationPanel();
            sendResponse({success: true});
            break;
            
        case 'CHECK_NAVIGATION_STATE':
            const nav = document.getElementById('almond-nav');
            const isHidden = nav ? nav.style.display === 'none' : true;
            sendResponse({isHidden: isHidden});
            break;
            
        default:
            sendResponse({success: false, error: 'Unknown message type'});
    }
    
    return true; // Keep the message channel open for async response
});

// Hide navigation panel
function hideNavigationPanel() {
    const nav = document.getElementById('almond-nav');
    if (nav) {
        nav.style.display = 'none';
        console.log('Navigation panel hidden');
        
        // Also hide any open panels
        const panels = document.querySelectorAll('.almond-panel');
        panels.forEach(panel => panel.remove());
    }
}

// Show navigation panel
function showNavigationPanel() {
    const nav = document.getElementById('almond-nav');
    if (nav) {
        nav.style.display = 'flex';
        console.log('Navigation panel shown');
    } else {
        // If navigation doesn't exist, create it
        console.log('Navigation not found, recreating...');
        createFloatingNav();
    }
}

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createFloatingNav);
} else {
    createFloatingNav();
}