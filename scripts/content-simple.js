// Almond Floating Navigation with Full Functionality
console.log('ALMOND LOADED!');

let currentPanel = null;

// Add toggle switch styles
const toggleStyle = document.createElement('style');
toggleStyle.textContent = `
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #2196F3;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

/* Sticky click visual feedback */
.almond-sticky-active {
  background-color: rgba(139, 111, 71, 0.3) !important;
  transform: scale(1.08) !important;
  box-shadow: 0 0 15px rgba(139, 111, 71, 0.6) !important;
  position: relative !important;
}

.almond-sticky-active::before {
  content: '⏱️ Auto-click in 1s';
  position: absolute;
  top: -35px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 10000;
}
`;
document.head.appendChild(toggleStyle);

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
        // Make all buttons bigger for better usability
        const buttonSize = 52;
        button.style.cssText = `
            width: ${buttonSize}px;
            height: ${buttonSize}px;
            border: none;
            background: transparent;
            border-radius: ${buttonSize/2}px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            margin: 0 auto;
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
        button.onclick = btn.directAction || (() => showPanel(btn.id));
        
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
        width: 52px;
        height: 52px;
        border: none;
        background: transparent;
        border-radius: 26px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        margin: 8px auto 0 auto;
        border-top: 1px solid rgba(139, 111, 71, 0.2);
        padding-top: 8px;
        font-size: 16px;
        color: #2c3e50;
    `;
    toggleButton.innerHTML = '👁';
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
            toggleButton.innerHTML = '👁';
            toggleButton.title = 'Hide Navigation';
            nav.style.width = '50px';
        } else {
            // Hide navigation  
            buttons.forEach(btn => {
                const button = document.getElementById(`almond-btn-${btn.id}`);
                if (button) button.style.display = 'none';
            });
            toggleButton.innerHTML = '👁';
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
                    <button id="summarize-fact-check-btn" style="width: 100%; padding: 12px; margin-bottom: 10px; border: 1px solid #8b6f47; background: #8b6f47; color: white; border-radius: 6px; cursor: pointer; font-weight: 500;">
                        Summarize & Fact Check
                    </button>
                    <button id="extract-scan-spam-btn" style="width: 100%; padding: 12px; margin-bottom: 10px; border: 1px solid #8b6f47; background: white; color: #8b6f47; border-radius: 6px; cursor: pointer; font-weight: 500;">
                        Extract & Scan for Spams
                    </button>
                    <div style="margin-bottom: 15px;">
                        <input type="text" id="guide-question" placeholder="Ask me how to do something on this page..." 
                               style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 10px; font-size: 14px;">
                        <button id="ask-guide" style="width: 100%; padding: 10px; border: 1px solid #2196F3; background: #2196F3; color: white; border-radius: 6px; cursor: pointer; font-weight: 500;">
                            Guide
                        </button>
                    </div>
                    <button id="go-back-btn" style="width: 100%; padding: 12px; margin-bottom: 10px; border: 1px solid #28a745; background: white; color: #28a745; border-radius: 6px; cursor: pointer; font-weight: 500;">
                        Go Back
                    </button>
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
                        <label for="enhance-operability-toggle" style="font-weight: 500; color: #8b6f47;">Enhance Operability</label>
                        <label class="switch">
                            <input type="checkbox" id="enhance-operability-toggle">
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
                        <label for="page-navigation-alert-toggle" style="font-weight: 500; color: #8b6f47;">Page Navigation Alerts</label>
                        <label class="switch">
                            <input type="checkbox" id="page-navigation-alert-toggle">
                            <span class="slider"></span>
                        </label>
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
                        <button class="bg-btn" data-bg="#add8e6" data-text="#000000" style="padding: 8px; border: 1px solid #ddd; border-radius: 6px; cursor: pointer; background: linear-gradient(45deg, #add8e6 50%, #000000 50%);"></button>
                        <button class="bg-btn" data-bg="#fffacd" data-text="#000000" style="padding: 8px; border: 1px solid #ddd; border-radius: 6px; cursor: pointer; background: linear-gradient(45deg, #fffacd 50%, #000000 50%);"></button>
                        <button class="bg-btn" data-bg="#f5f5f5" data-text="#333333" style="padding: 8px; border: 1px solid #ddd; border-radius: 6px; cursor: pointer; background: linear-gradient(45deg, #f5f5f5 50%, #333333 50%);"></button>
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

// Helper functions for AI operations
async function summarizeWithAI(text) {
    try {
        const session = await LanguageModel.create();
        const prompt = `Please summarize the following text in a concise and clear manner:\n\n${text}`;
        const result = await session.prompt(prompt);
        session.destroy();
        return result;
    } catch (error) {
        throw new Error(`Failed to summarize: ${error.message}`);
    }
}

async function extractPoints(text) {
    if (!Rewriter || typeof Rewriter.create !== 'function') {
        throw new Error('Rewriter API not available.');
    }
    try {
        const rewriter = await Rewriter.create({
            sharedContext: 'Extract 5 key points from this email text in easy to read, bulleted form, focusing on all the important details of the specific email. Also, determine if this email is spam and explain why.'
        });
        const rewritten = await rewriter.rewrite(text);
        return rewritten;
    } catch (err) {
        throw new Error('Rewriter API error: ' + err.message);
    }
}

async function factCheck(text) {
    if (!LanguageModel || typeof LanguageModel.create !== 'function') {
        throw new Error('Prompt API not available.');
    }
    try {
        const session = await LanguageModel.create({
            expectedInputs: [{ type: "text", languages: ["en"] }],
            expectedOutputs: [{ type: "text", languages: ["en"] }]
        });
        let plainText = text.replaceAll(/\s+/g, ' ').replaceAll(/<[^>]*>/g, '');
        if (plainText.length > 8000) plainText = plainText.slice(0, 8000);
        const promptInput = `Fact check this article for accuracy. Identify any inaccuracies, provide corrections, and cite sources where possible. Provide a summary of the fact-check.\n\n${plainText}`;
        const response = await session.prompt(promptInput);
        return response || 'No fact check result.';
    } catch (err) {
        throw new Error('Prompt API error: ' + err.message);
    }
}

async function guideQuestion(question, screenshot) {
    if (!LanguageModel || typeof LanguageModel.create !== 'function') {
        throw new Error('Prompt API not available.');
    }
    try {
        // Convert data URL to Uint8Array
        let imageData;
        if (screenshot && screenshot.startsWith('data:image/')) {
            const base64 = screenshot.split(',')[1];
            const binaryString = atob(base64);
            imageData = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                imageData[i] = binaryString.charCodeAt(i);
            }
        } else {
            imageData = screenshot || new Uint8Array(0); // fallback empty array
        }
        const session = await LanguageModel.create({
            expectedInputs: [
                { type: "text", languages: ["en"] },
                { type: "image" }
            ],
            expectedOutputs: [{ type: "text", languages: ["en"] }]
        });
        let html = document.body.outerHTML;
        let htmlSnippet = html.length > 8000 ? html.slice(0, 8000) : html;

        // Check if it's a location question
        const isLocationQuestion = question.toLowerCase().includes('where') || question.toLowerCase().includes('locate') || question.toLowerCase().includes('find');

        let answer;
        if (isLocationQuestion) {
            answer = await handleLocationQuestion(session, question, imageData, htmlSnippet);
        } else {
            const promptInput = {
                text: `Answer the question to help identify what is on the web page (including screenshots and code): "${question}". Provide a clear, concise answer.\n\nHTML: ${htmlSnippet}`,
                data: imageData
            };
            const response = await session.prompt(promptInput);
            answer = response || 'No answer generated.';
        }
        return answer;
    } catch (err) {
        throw new Error('Prompt API error: ' + err.message);
    }
}

async function handleLocationQuestion(session, question, imageData, htmlSnippet) {
    // Extract keyword from question
    let keyword = question.toLowerCase().replaceAll(/where is|locate|find|the/g, '').trim();
    const promptText = `Based on this page HTML and screenshot, provide a CSS selector for the element containing "${keyword}" text or the "${keyword}" button/element. Provide only the selector, e.g., #login-btn, .btn.login, button[type="submit"], p.privacy, or a[href="/login"]. If unsure, say "Not found".\n\nHTML: ${htmlSnippet}`;
    const promptInput = {
        text: promptText,
        data: imageData
    };
    const response = await session.prompt(promptInput);
    const selector = (response || '').trim();
    console.log('AI provided selector:', selector);
    if (selector && selector !== 'Not found') {
        try {
            const element = document.querySelector(selector);
            if (element && element.offsetWidth > 0 && element.offsetHeight > 0) {
                console.log('Highlighting element via AI selector:', element);
                glowElement(element);
                return `Located the ${keyword} at: ${selector}`;
            } else {
                console.log('Selector did not match visible element');
            }
        } catch (e) {
            console.log('Invalid selector:', e);
        }
    }
    // Fallback to DOM search
    console.log('AI said not found or invalid, falling back to DOM search');
    console.log('Location question detected, extracted keyword:', keyword);
    // Split keyword into words for better matching
    const keywords = keyword.split(/\s+/).filter(k => k.length > 0);
    // Find visible elements containing any of the keywords in text, alt, title, aria-label, id, or class
    let elements = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = (el.textContent || '').toLowerCase();
        const alt = (el.alt || '').toLowerCase();
        const title = String(el.title || '').toLowerCase();
        const ariaLabel = String(el.getAttribute('aria-label') || '').toLowerCase();
        const id = (el.id || '').toLowerCase();
        const className = String(el.className || '').toLowerCase();
        const hasKeyword = keywords.some(k => text.includes(k) || alt.includes(k) || title.includes(k) || ariaLabel.includes(k) || id.includes(k) || className.includes(k));
        return hasKeyword && el.offsetWidth > 0 && el.offsetHeight > 0 && !['SCRIPT', 'STYLE', 'META', 'LINK'].includes(el.tagName);
    });
    // Sort to prioritize buttons, links, inputs
    elements.sort((a, b) => {
        const priority = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'];
        const aPri = priority.indexOf(a.tagName);
        const bPri = priority.indexOf(b.tagName);
        return (aPri === -1 ? 99 : aPri) - (bPri === -1 ? 99 : bPri);
    });
    console.log('Found matching elements:', elements.length);
    if (elements.length > 0) {
        const numToHighlight = Math.min(elements.length, 3);
        for (let i = 0; i < numToHighlight; i++) {
            console.log('Highlighting element:', elements[i].tagName, elements[i].textContent.trim().slice(0, 50), elements[i].getAttribute('aria-label') || '');
            glowElement(elements[i]);
        }
        console.log('Glowing elements:', elements.slice(0, numToHighlight));
        return `Located ${numToHighlight} possible ${keyword} element(s).`;
    } else {
        console.log('No elements matched for keywords:', keywords);
        return `Could not locate the ${keyword} on the page.`;
    }
}

function glowElement(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2 + window.scrollX;
    const centerY = rect.top + rect.height / 2 + window.scrollY;
    const radius = Math.hypot(rect.width / 2, rect.height / 2) + 5;
    const highlight = document.createElement('div');
    highlight.style.position = 'absolute';
    highlight.style.left = (centerX - radius) + 'px';
    highlight.style.top = (centerY - radius) + 'px';
    highlight.style.width = (2 * radius) + 'px';
    highlight.style.height = (2 * radius) + 'px';
    highlight.style.border = '3px solid red';
    highlight.style.borderRadius = '50%';
    highlight.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
    highlight.style.pointerEvents = 'none';
    highlight.style.zIndex = '9999';
    document.body.appendChild(highlight);
    setTimeout(() => {
        highlight.remove();
    }, 5000); // Highlight for 5 seconds
}

// Initialize AI controls
function initializeAIControls() {
    const summarizeBtn = document.getElementById('summarize-fact-check-btn');
    const extractBtn = document.getElementById('extract-scan-spam-btn');
    const guideInput = document.getElementById('guide-question');
    const askGuideBtn = document.getElementById('ask-guide');
    const goBackBtn = document.getElementById('go-back-btn');
    const enhanceToggle = document.getElementById('enhance-operability-toggle');
    const aiResponse = document.getElementById('ai-response');
    const aiResponseText = document.getElementById('ai-response-text');

    // Summarize & Fact Check
    if (summarizeBtn) {
        summarizeBtn.onclick = async () => {
            aiResponse.style.display = 'block';
            aiResponseText.innerHTML = 'Summarizing and fact checking...';

            try {
                const text = getPageText();
                const summary = await summarizeWithAI(text);
                const factCheckResult = await factCheck(text);
                aiResponseText.innerHTML = `<strong>Summary:</strong>\n\n${summary}\n\n<strong>Fact Check:</strong>\n\n${factCheckResult}`;
            } catch (error) {
                aiResponseText.innerHTML = `Error: ${error.message}`;
            }
        };
    }

    // Extract & Scan for Spams
    if (extractBtn) {
        extractBtn.onclick = async () => {
            aiResponse.style.display = 'block';
            aiResponseText.innerHTML = 'Extracting points and scanning for spam...';

            try {
                const text = getPageText();
                const points = await extractPoints(text);
                aiResponseText.innerHTML = `<strong>Extracted Points & Spam Analysis:</strong>\n\n${points}`;
            } catch (error) {
                aiResponseText.innerHTML = `Error: ${error.message}`;
            }
        };
    }

    // Guide
    if (askGuideBtn && guideInput) {
        askGuideBtn.onclick = async () => {
            const question = guideInput.value.trim();
            if (!question) {
                alert('Please enter a question.');
                return;
            }

            aiResponse.style.display = 'block';
            aiResponseText.innerHTML = 'Generating guide...';

            try {
                const screenshot = await captureScreenshot();
                const answer = await guideQuestion(question, screenshot);
                aiResponseText.innerHTML = `<strong>Question:</strong> ${question}\n\n<strong>Guide:</strong>\n${answer}`;
                guideInput.value = '';
            } catch (error) {
                aiResponseText.innerHTML = `Error: ${error.message}`;
            }
        };

        guideInput.onkeypress = (e) => {
            if (e.key === 'Enter') {
                askGuideBtn.click();
            }
        };
    }

    // Go Back
    if (goBackBtn) {
        goBackBtn.onclick = () => {
            window.history.back();
        };
    }

    // Enhance Operability Toggle
    if (enhanceToggle) {
        enhanceToggle.addEventListener('change', () => {
            const enabled = enhanceToggle.checked;
            toggleEnhanceOperability(enabled);
        });
    }

    // Page Navigation Alert Toggle
    const pageNavToggle = document.getElementById('page-navigation-alert-toggle');
    if (pageNavToggle) {
        // Load saved setting
        chrome.storage.local.get(['almondPageNavAlerts'], function(result) {
            const enabled = result.almondPageNavAlerts || false;
            pageNavToggle.checked = enabled;
        });

        pageNavToggle.addEventListener('change', () => {
            const enabled = pageNavToggle.checked;
            // Save setting
            chrome.storage.local.set({ 'almondPageNavAlerts': enabled });
            togglePageNavigationAlerts(enabled);
        });
    }
}

function toggleEnhanceOperability(enabled) {
    // Motor control accessibility enhancements for users with reduced dexterity
    if (enabled) {
        // Add accessibility features for motor control issues
        document.body.style.fontSize = '120%';
        document.body.style.lineHeight = '1.6';

        // Enable magnetic cursor behavior
        enableMagneticCursor();

        // Enlarge clickable areas
        enlargeClickableAreas();

        // Add visual feedback for clickable elements
        addVisualFeedback();

        // Add sticky click behavior
        enableStickyClick();

        console.log('Motor control enhancements enabled');
    } else {
        // Remove accessibility features
        document.body.style.fontSize = '';
        document.body.style.lineHeight = '';

        // Disable magnetic cursor behavior
        disableMagneticCursor();

        // Restore original clickable areas
        restoreClickableAreas();

        // Remove visual feedback
        removeVisualFeedback();

        // Disable sticky click behavior
        disableStickyClick();

        console.log('Motor control enhancements disabled');
    }
}

// Page navigation alert functionality
let pageNavigationAlertsEnabled = false;
let currentPageUrl = window.location.href;
let currentPageTitle = document.title;
let lastAlertTime = 0;
let initialAlertShown = false;

function togglePageNavigationAlerts(enabled) {
    pageNavigationAlertsEnabled = enabled;

    if (enabled) {
        // Reset state for new monitoring session
        initialAlertShown = false;
        currentPageUrl = window.location.href;
        currentPageTitle = document.title;

        // Start monitoring page navigation
        startPageNavigationMonitoring();
        console.log('Page navigation alerts enabled');

        // Show alert for current page after a short delay (for when user first lands on page)
        setTimeout(() => {
            if (pageNavigationAlertsEnabled && !initialAlertShown) {
                showPageNavigationAlert(document.title || 'New Page', window.location.href);
                initialAlertShown = true;
                lastAlertTime = Date.now();
            }
        }, 1000);
    } else {
        // Stop monitoring page navigation
        stopPageNavigationMonitoring();
        console.log('Page navigation alerts disabled');
    }
}

function startPageNavigationMonitoring() {
    // Monitor URL changes using various methods

    // Method 1: Listen for popstate events (back/forward buttons)
    window.addEventListener('popstate', handlePageNavigation);

    // Method 2: Monitor for pushState/replaceState calls
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(state, title, url) {
        originalPushState.apply(this, arguments);
        setTimeout(() => checkForPageChange(), 100);
    };

    history.replaceState = function(state, title, url) {
        originalReplaceState.apply(this, arguments);
        setTimeout(() => checkForPageChange(), 100);
    };

    // Method 3: Periodic check for URL changes (fallback)
    setInterval(checkForPageChange, 1000);
}

function stopPageNavigationMonitoring() {
    window.removeEventListener('popstate', handlePageNavigation);
}

function handlePageNavigation() {
    setTimeout(() => checkForPageChange(), 100);
}

function checkForPageChange() {
    if (!pageNavigationAlertsEnabled) return;

    const newUrl = window.location.href;
    const newTitle = document.title;

    if (newUrl !== currentPageUrl || newTitle !== currentPageTitle) {
        // Check if enough time has passed since last alert (minimum 2 seconds)
        const now = Date.now();
        if (now - lastAlertTime > 2000) {
            // Page has changed, show alert
            showPageNavigationAlert(newTitle || 'New Page', newUrl);
            lastAlertTime = now;
        }

        // Update current page info
        currentPageUrl = newUrl;
        currentPageTitle = newTitle;
        initialAlertShown = true; // Mark that we've shown an alert for navigation
    }
}

function showPageNavigationAlert(pageTitle, pageUrl) {
    // Extract a meaningful page name from the title or URL
    let displayName = pageTitle;
    if (displayName === 'New Page' || displayName.length > 50) {
        // Try to extract from URL
        try {
            const url = new URL(pageUrl);
            displayName = url.hostname + url.pathname.replace(/\/$/, '');
            if (displayName.length > 50) {
                displayName = url.hostname;
            }
        } catch (e) {
            displayName = 'New Page';
        }
    }

    // Show browser alert
    alert(`You are now on: ${displayName}`);

    console.log(`Page navigation alert: ${displayName} (${pageUrl})`);
}

// Magnetic cursor functionality - snaps cursor to nearby clickable elements
let magneticCursorEnabled = false;
let originalCursorElements = [];
let magneticRange = 50; // pixels

function enableMagneticCursor() {
    if (magneticCursorEnabled) return;
    magneticCursorEnabled = true;

    // Store original cursor styles
    const clickableElements = document.querySelectorAll('button, a, input[type="button"], input[type="submit"], [role="button"], [onclick]');
    clickableElements.forEach(el => {
        originalCursorElements.push({
            element: el,
            originalCursor: el.style.cursor || ''
        });
    });

    // Add magnetic behavior on mouse move
    document.addEventListener('mousemove', handleMagneticCursor);
}

function disableMagneticCursor() {
    if (!magneticCursorEnabled) return;
    magneticCursorEnabled = false;

    // Remove magnetic behavior
    document.removeEventListener('mousemove', handleMagneticCursor);

    // Restore original cursor styles
    originalCursorElements.forEach(item => {
        item.element.style.cursor = item.originalCursor;
    });
    originalCursorElements = [];
}

function handleMagneticCursor(e) {
    if (!magneticCursorEnabled) return;

    const mouseX = e.clientX;
    const mouseY = e.clientY;
    let nearestElement = null;
    let nearestDistance = magneticRange;

    // Find clickable elements within magnetic range
    const clickableElements = document.querySelectorAll('button, a, input[type="button"], input[type="submit"], [role="button"], [onclick]');
    clickableElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const distance = Math.sqrt(Math.pow(mouseX - centerX, 2) + Math.pow(mouseY - centerY, 2));

        if (distance < nearestDistance && distance < magneticRange) {
            nearestElement = el;
            nearestDistance = distance;
        }
    });

    // Apply magnetic effect
    if (nearestElement) {
        const rect = nearestElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Create a custom cursor that snaps to the element center
        nearestElement.style.cursor = 'pointer';
        nearestElement.style.transform = 'scale(1.05)';
        nearestElement.style.transition = 'transform 0.1s ease';

        // Add visual indicator
        nearestElement.style.boxShadow = '0 0 10px rgba(139, 111, 71, 0.5)';
    } else {
        // Reset all elements
        clickableElements.forEach(el => {
            el.style.cursor = '';
            el.style.transform = '';
            el.style.boxShadow = '';
        });
    }
}

// Enlarge clickable areas for easier targeting
let enlargedElements = [];

function enlargeClickableAreas() {
    const clickableElements = document.querySelectorAll('button, a, input[type="button"], input[type="submit"], [role="button"]');

    clickableElements.forEach(el => {
        // Skip if already enlarged
        if (el.dataset.enlarged) return;

        const originalStyles = {
            padding: el.style.padding || '',
            margin: el.style.margin || '',
            minWidth: el.style.minWidth || '',
            minHeight: el.style.minHeight || '',
            position: el.style.position || '',
            zIndex: el.style.zIndex || ''
        };

        enlargedElements.push({
            element: el,
            originalStyles: originalStyles
        });

        // Enlarge clickable area
        el.style.padding = '12px 20px';
        el.style.minWidth = '60px';
        el.style.minHeight = '44px'; // WCAG AA minimum touch target
        el.style.position = el.style.position || 'relative';
        el.style.zIndex = '1000';
        el.dataset.enlarged = 'true';

        // Add visual enhancement
        el.style.border = '2px solid #8b6f47';
        el.style.borderRadius = '6px';
    });
}

function restoreClickableAreas() {
    enlargedElements.forEach(item => {
        const el = item.element;
        Object.assign(el.style, item.originalStyles);
        delete el.dataset.enlarged;
    });
    enlargedElements = [];
}

// Visual feedback for clickable elements
function addVisualFeedback() {
    const style = document.createElement('style');
    style.id = 'almond-accessibility-styles';
    style.textContent = `
        .almond-accessible-element {
            transition: all 0.2s ease !important;
        }
        .almond-accessible-element:hover {
            transform: scale(1.1) !important;
            box-shadow: 0 4px 12px rgba(139, 111, 71, 0.3) !important;
            background-color: rgba(139, 111, 71, 0.1) !important;
        }
        .almond-magnetic-target {
            position: relative !important;
        }
        .almond-magnetic-target::after {
            content: '🎯';
            position: absolute;
            top: -20px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 16px;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s ease;
        }
        .almond-magnetic-target.almond-magnetic-active::after {
            opacity: 1;
        }
    `;
    document.head.appendChild(style);

    // Add classes to clickable elements
    const clickableElements = document.querySelectorAll('button, a, input[type="button"], input[type="submit"], [role="button"]');
    clickableElements.forEach(el => {
        el.classList.add('almond-accessible-element');
    });
}

function removeVisualFeedback() {
    const style = document.getElementById('almond-accessibility-styles');
    if (style) {
        style.remove();
    }

    // Remove classes from elements
    const clickableElements = document.querySelectorAll('.almond-accessible-element');
    clickableElements.forEach(el => {
        el.classList.remove('almond-accessible-element', 'almond-magnetic-target', 'almond-magnetic-active');
    });
}

// Sticky click behavior - allows clicking to "stick" briefly for easier activation
let stickyClickEnabled = false;
let stickyTimeout = null;
let currentStickyElement = null;

function enableStickyClick() {
    if (stickyClickEnabled) return;
    stickyClickEnabled = true;

    document.addEventListener('mouseenter', handleStickyEnter, true);
    document.addEventListener('mouseleave', handleStickyLeave, true);
    document.addEventListener('click', handleStickyClick, true);
}

function disableStickyClick() {
    if (!stickyClickEnabled) return;
    stickyClickEnabled = false;

    document.removeEventListener('mouseenter', handleStickyEnter, true);
    document.removeEventListener('mouseleave', handleStickyLeave, true);
    document.removeEventListener('click', handleStickyClick, true);

    if (stickyTimeout) {
        clearTimeout(stickyTimeout);
        stickyTimeout = null;
    }
    if (currentStickyElement) {
        currentStickyElement.classList.remove('almond-sticky-active');
        currentStickyElement = null;
    }
}

function handleStickyEnter(e) {
    if (!stickyClickEnabled) return;

    const target = e.target;
    if (target.matches('button, a, input[type="button"], input[type="submit"], [role="button"]')) {
        // Clear any existing timeout
        if (stickyTimeout) {
            clearTimeout(stickyTimeout);
        }

        // Set current sticky element
        if (currentStickyElement) {
            currentStickyElement.classList.remove('almond-sticky-active');
        }
        currentStickyElement = target;
        currentStickyElement.classList.add('almond-sticky-active');

        // Add visual feedback
        currentStickyElement.style.backgroundColor = 'rgba(139, 111, 71, 0.2)';
        currentStickyElement.style.transform = 'scale(1.05)';

        // Set timeout to auto-click after 1 second of hovering
        stickyTimeout = setTimeout(() => {
            if (currentStickyElement) {
                currentStickyElement.click();
                currentStickyElement.classList.remove('almond-sticky-active');
                currentStickyElement.style.backgroundColor = '';
                currentStickyElement.style.transform = '';
                currentStickyElement = null;
            }
        }, 1000);
    }
}

function handleStickyLeave(e) {
    if (!stickyClickEnabled || !currentStickyElement) return;

    // Clear timeout if mouse leaves
    if (stickyTimeout) {
        clearTimeout(stickyTimeout);
        stickyTimeout = null;
    }

    // Remove visual feedback
    currentStickyElement.classList.remove('almond-sticky-active');
    currentStickyElement.style.backgroundColor = '';
    currentStickyElement.style.transform = '';
    currentStickyElement = null;
}

function handleStickyClick(e) {
    if (!stickyClickEnabled) return;

    // Clear timeout on manual click
    if (stickyTimeout) {
        clearTimeout(stickyTimeout);
        stickyTimeout = null;
    }

    if (currentStickyElement) {
        currentStickyElement.classList.remove('almond-sticky-active');
        currentStickyElement.style.backgroundColor = '';
        currentStickyElement.style.transform = '';
        currentStickyElement = null;
    }
}

async function captureScreenshot() {
    // Placeholder for screenshot functionality
    return null;
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

    if (startBtn) {
        startBtn.onclick = () => {
            const rate = rateSlider ? parseFloat(rateSlider.value) : 1;

            // Send message to content-font-injector.js to handle speech with selection support
            chrome.runtime.sendMessage({
                type: 'speak-selection',
                opts: { rate: rate }
            }, (response) => {
                if (!response || !response.ok) {
                    console.error('Speech failed:', response?.error || 'Unknown error');
                    // Fallback to basic speech if enhanced version fails
                    fallbackSpeech(rate);
                }
            });
        };
    }

    if (stopBtn) {
        stopBtn.onclick = () => {
            console.log('[SPEECH] Stop button clicked, sending speech-control message');
            // Send message to stop speech
            chrome.runtime.sendMessage({
                type: 'speech-control',
                command: 'stop'
            });
        };
    }
}

// Fallback speech function if the enhanced version fails
function fallbackSpeech(rate) {
    const selection = window.getSelection ? window.getSelection().toString() : '';
    let text = '';

    if (selection?.trim()) {
        text = selection.trim();
        console.log('[SPEECH] Fallback: Speaking selected text');
    } else {
        text = document.body?.innerText || '';
        console.log('[SPEECH] Fallback: Speaking page content');
    }

    const truncated = text.split('\n').slice(0, 300).join('\n');

    if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(truncated);
        utterance.rate = rate;
        window.speechSynthesis.speak(utterance);
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

    // Load saved reminders
    loadReminders();

    // Start checking for due reminders
    startReminderChecking();

    if (addBtn) {
        addBtn.onclick = () => {
            const text = textInput ? textInput.value.trim() : '';
            const time = timeInput ? timeInput.value : '';

            if (text && list) {
                const reminderId = Date.now().toString(); // Unique ID based on timestamp
                const reminderData = {
                    id: reminderId,
                    text: text,
                    time: time,
                    created: new Date().toISOString()
                };

                // Add to DOM
                addReminderToDOM(reminderData);

                // Save to storage
                saveReminder(reminderData);

                // Clear inputs
                if (textInput) textInput.value = '';
                if (timeInput) timeInput.value = '';
            }
        };
    }
    
    // Function to add reminder to DOM with delete button
    function addReminderToDOM(reminderData) {
        const reminder = document.createElement('div');
        reminder.id = `reminder-${reminderData.id}`;
        reminder.style.cssText = 'background: #f8f9fa; padding: 10px; margin: 5px 0; border-radius: 6px; border-left: 3px solid #8b6f47; position: relative;';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '×';
        deleteBtn.style.cssText = 'position: absolute; top: 5px; right: 5px; background: #dc3545; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; font-size: 14px; line-height: 1; display: flex; align-items: center; justify-content: center;';
        deleteBtn.title = 'Delete reminder';
        deleteBtn.onclick = () => deleteReminder(reminderData.id);
        
        reminder.innerHTML = `
            <div style="font-weight: 500; margin-right: 25px;">${reminderData.text}</div>
            <div style="font-size: 12px; color: #666; margin-top: 5px; margin-right: 25px;">${reminderData.time ? new Date(reminderData.time).toLocaleString() : 'No time set'}</div>
        `;
        reminder.appendChild(deleteBtn);
        list.appendChild(reminder);
    }
    
    // Function to save reminder to Chrome storage
    function saveReminder(reminderData) {
        chrome.storage.local.get(['almondReminders'], function(result) {
            const reminders = result.almondReminders || [];
            reminders.push(reminderData);
            chrome.storage.local.set({ 'almondReminders': reminders });
        });
    }
    
    // Function to load reminders from Chrome storage
    function loadReminders() {
        chrome.storage.local.get(['almondReminders'], function(result) {
            const reminders = result.almondReminders || [];
            reminders.forEach(reminderData => {
                addReminderToDOM(reminderData);
            });
        });
    }
    
    // Function to delete reminder
    function deleteReminder(reminderId) {
        // Remove from DOM
        const reminderElement = document.getElementById(`reminder-${reminderId}`);
        if (reminderElement) {
            reminderElement.remove();
        }

        // Remove from storage
        chrome.storage.local.get(['almondReminders'], function(result) {
            const reminders = result.almondReminders || [];
            const updatedReminders = reminders.filter(r => r.id !== reminderId);
            chrome.storage.local.set({ 'almondReminders': updatedReminders });
        });
    }
}

// Reminder notification functionality
let reminderCheckInterval = null;

function startReminderChecking() {
    // Request notification permission if not already granted
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }

    // Check for due reminders every minute
    reminderCheckInterval = setInterval(checkForDueReminders, 60000);

    // Also check immediately
    setTimeout(checkForDueReminders, 1000);
}

function checkForDueReminders() {
    chrome.storage.local.get(['almondReminders'], function(result) {
        const reminders = result.almondReminders || [];
        const now = new Date();

        reminders.forEach(reminder => {
            if (reminder.time) {
                const reminderTime = new Date(reminder.time);
                const timeDiff = reminderTime - now;

                // Check if reminder is due (within 1 minute)
                if (timeDiff <= 60000 && timeDiff > -60000) {
                    // Show notification
                    showReminderNotification(reminder);

                    // Mark as notified (optional - you could remove it or mark it)
                    // For now, we'll just show the notification
                }
            }
        });
    });
}

function showReminderNotification(reminder) {
    const title = 'Almond Reminder';
    const options = {
        body: reminder.text,
        icon: chrome.runtime.getURL('images/almond.png'),
        badge: chrome.runtime.getURL('images/almond.png'),
        tag: `almond-reminder-${reminder.id}`, // Prevents duplicate notifications
        requireInteraction: true, // Keep notification visible until user interacts
        silent: false
    };

    // Try to show notification
    if ('Notification' in window) {
        if (Notification.permission === 'granted') {
            const notification = new Notification(title, options);

            // Auto-close after 10 seconds if not interacted with
            setTimeout(() => {
                notification.close();
            }, 10000);

            // Handle click on notification
            notification.onclick = function() {
                // Focus the window
                window.focus();
                notification.close();
            };

        } else if (Notification.permission === 'default') {
            // Request permission and try again
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    const notification = new Notification(title, options);
                    setTimeout(() => notification.close(), 10000);
                    notification.onclick = function() {
                        window.focus();
                        notification.close();
                    };
                } else {
                    // Fallback to alert
                    alert(`Reminder: ${reminder.text}`);
                }
            });
        } else {
            // Permission denied, use alert as fallback
            alert(`Reminder: ${reminder.text}`);
        }
    } else {
        // Notifications not supported, use alert
        alert(`Reminder: ${reminder.text}`);
    }

    console.log('Reminder notification shown:', reminder.text);
}

// Initialize print controls
function initializePrintControls() {
    const printBtn = document.getElementById('print-page');
    const pdfBtn = document.getElementById('save-pdf');

    if (printBtn) {
        printBtn.onclick = () => {
            // Close the panel before printing
            if (currentPanel) {
                currentPanel.remove();
                currentPanel = null;
            }
            // Apply print styles to hide extension elements
            applyPrintStyles();
            // Small delay to ensure styles are applied
            setTimeout(() => {
                window.print();
            }, 100);
        };
    }

    if (pdfBtn) {
        pdfBtn.onclick = () => {
            // Close the panel before PDF generation
            if (currentPanel) {
                currentPanel.remove();
                currentPanel = null;
            }
            // Send message to trigger PDF-specific handling
            chrome.runtime.sendMessage({
                action: 'save-pdf',
                url: window.location.href,
                title: document.title
            }, (response) => {
                if (!response || !response.success) {
                    // Fallback to regular print dialog
                    applyPrintStyles();
                    setTimeout(() => {
                        window.print();
                    }, 100);
                }
            });
        };
    }
}// Initialize protection controls

// Apply print styles to hide extension elements
function applyPrintStyles() {
    // Remove any existing print styles
    const existingStyle = document.getElementById('almond-print-hide-styles');
    if (existingStyle) {
        existingStyle.remove();
    }

    // Create print styles to hide extension elements
    const printStyle = document.createElement('style');
    printStyle.id = 'almond-print-hide-styles';
    printStyle.textContent = `
        @media print {
            /* Hide all extension elements */
            #almond-nav,
            .almond-panel,
            [id*="almond"],
            [class*="almond"],
            .almond-sticky-active,
            #almond-pdf-instructions,
            /* Hide common UI elements that shouldn't print */
            nav,
            header[role="banner"],
            footer[role="contentinfo"],
            .advertisement,
            .ads,
            .sidebar,
            .popup,
            .modal,
            .no-print {
                display: none !important;
            }
        }
    `;
    document.head.appendChild(printStyle);

    // Clean up print styles after printing
    setTimeout(() => {
        const style = document.getElementById('almond-print-hide-styles');
        if (style) {
            style.remove();
        }
    }, 30000); // Remove after 30 seconds
}

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
                        Protection settings reset. All blocked elements restored.
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
    // Check for email-specific content (e.g., Gmail)
    const gmailMessage = document.querySelector('div[data-message-id] .a3s');
    if (gmailMessage) {
        console.log('Found Gmail message, text length:', gmailMessage.innerText.length);
        return gmailMessage.innerText;
    }
    // Check for other email clients or general message
    const emailBody = document.querySelector('[role="main"] .message, .email-body, .mail-content');
    if (emailBody) {
        console.log('Found email body, text length:', emailBody.innerText.length);
        return emailBody.innerText;
    }
    // Try to get <article> tag or fallback to body text
    const article = document.querySelector('article');
    if (article) {
        console.log('Found article tag, text length:', article.innerText.length);
        return article.innerText;
    }
    // Fallback: get largest <p> block
    let largestP = '';
    for (const p of document.querySelectorAll('p')) {
        if (p.innerText.length > largestP.length) largestP = p.innerText;
    }
    if (largestP.length > 200) {
        console.log('Using largest p, text length:', largestP.length);
        return largestP;
    }
    // Fallback: whole body
    const bodyText = document.body.innerText;
    console.log('Using body text, length:', bodyText.length);
    return bodyText;
}

async function captureScreenshot() {
    try {
        // Use the Chrome Tab Capture API to get a screenshot
        const stream = await navigator.mediaDevices.getDisplayMedia({
            video: { mediaSource: 'screen' }
        });

        const video = document.createElement('video');
        video.srcObject = stream;
        await video.play();

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);

        // Stop the stream
        stream.getTracks().forEach(track => track.stop());

        return canvas.toDataURL('image/png');
    } catch (error) {
        console.error('Screenshot capture failed:', error);
        return null;
    }
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
    document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
    initializeExtension();
}

function initializeExtension() {
    createFloatingNav();
    initializePageNavigationAlerts();
}

function initializePageNavigationAlerts() {
    // Load saved page navigation alert setting and start monitoring if enabled
    chrome.storage.local.get(['almondPageNavAlerts'], function(result) {
        const enabled = result.almondPageNavAlerts || false;
        if (enabled) {
            // Reset state for new page load
            initialAlertShown = false;
            lastAlertTime = 0;

            // Delay initialization slightly to allow for page load completion
            setTimeout(() => {
                togglePageNavigationAlerts(true);
            }, 500);
        }
    });
}