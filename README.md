# Almond - Chrome Extension

**Making web browsing easy and simple.**

Almond is a Chrome extension that provides accessibility features, AI-powered assistance, and helpful tools for an enhanced web browsing experience through a floating navigation interface.

## Features

### Floating Navigation System
- **Non-intrusive floating panel** that appears on any webpage
- **Toggle visibility** - Hide/show navigation with eye icon for cleaner viewing
- **Icon-based interface** with visual icons instead of text for intuitive use
- **Responsive positioning** - Stays accessible without blocking content

### AI-Powered Assistant (Chrome AI APIs)
- **Page Summarization**: Uses Chrome Rewriter API to create concise summaries
- **Email Key Extraction**: Extracts important info for email summaries using Rewriter API  
- **Interactive Guide**: Ask questions and get step-by-step help using Prompt API
- **Trial Token Integration**: Utilizes Chrome's experimental AI features

### Accessibility & Customization
- **Zoom Controls**: Page magnification with reset functionality
- **Font Controls**: Font family, size, style, line spacing, and color customization
- **Eye Protection**: Dark mode, high contrast, and blue light filter
- **Reset Buttons**: Quick reset for all customization panels

### Weather Integration
- **Real-time weather display** with location-based data
- **Clean weather interface** integrated into floating navigation

### Simplified Popup
- **Minimalist design** showing only Almond title and instructions
- **Primary focus on floating navigation** for better user experience

## Technologies Used

### Core Platform
- **Chrome Extension (Manifest V3)** - Modern extension architecture with trial tokens
- **Content Scripts** - Floating navigation and DOM manipulation
- **Popup Interface** - Simplified UI with title display

### Languages & Markup
- **JavaScript (ES6+)** - Main application logic with async/await
- **HTML5** - User interface structure and floating panels
- **CSS3** - Dynamic styling with custom properties and animations
- **JSON** - Configuration and manifest with trial tokens

### Chrome AI APIs (Experimental - Origin Trial)
- **Rewriter API** (`window.ai.rewriter`):
  - Page content summarization
  - Key information extraction for emails
  - Uses `aiRewriterOriginTrial` permission with trial token
- **Prompt API** (`window.ai.languageModel`):
  - Interactive question-answering guide
  - Step-by-step assistance based on page content  
  - Uses `aiLanguageModelOriginTrial` permission with trial token

### Browser APIs
- **Chrome Extension APIs**:
  - `chrome.tabs` - Active tab management and messaging
  - `chrome.storage` - Settings persistence across sessions
  - `chrome.runtime` - Message passing between popup and content scripts
  - `chrome.scripting` - Dynamic content script injection
- **Web APIs**:
  - Geolocation API - Location services for weather data
  - DOM Manipulation APIs - Floating navigation creation
  - Fetch API - Weather service integration
  - CSS Style APIs - Dynamic theming and customization

### External Services
- **Weather Service** - Real-time weather data integration
- **Icon Resources** - Web-accessible image assets for navigation

### Storage & Data Management
- **Dynamic styling storage** - Font, zoom, and protection settings
- **Weather data caching** - Location and weather information persistence
- **AI response handling** - Error fallbacks and capability checking

## Project Structure

```
Almond/
├── Core Files:
├── ├── manifest.json              # Extension config with AI trial tokens
├── ├── popup.html                 # Simplified popup with Almond title
├── ├── popup.css                  # Popup styling and layout
├── ├── popup.js                   # Basic popup functionality
├── 
├── Main Application:
├── ├── content-simple.js          # Primary floating navigation system
├── ├── content-font-injector.js  # Font customization content script
├── 
├── Utility Files:
├── ├── font.js                    # Font and styling utilities
├── ├── speechtosound.js           # Text-to-speech functionality  
├── 
├── Assets:
├── ├── almond.png                 # Extension icon
├── ├── almond_title.png           # Popup header image
├── ├── speech.png                 # Speech/audio icon
├── └── images/                    # Web-accessible icon resources
├──     ├── manual_logo.png        # Manual/guide icon
├──     ├── weather_logo.png       # Weather icon  
├──     ├── font_logo.png          # Font icon
├──     ├── zoom_logo.png          # Zoom icon
├──     └── protection_logo.png    # Eye protection icon
└── 
```

### Architecture Overview

**Primary System**: `content-simple.js`
- Floating navigation creation and management  
- Chrome AI integration (Rewriter + Prompt APIs)
- Weather functionality with async data fetching
- Font, zoom, and protection controls with reset buttons
- Toggle hide/show navigation capability

**Supporting System**: `content-font-injector.js`  
- Legacy font injection and customization
- Works alongside main floating system

## Getting Started

### Prerequisites
- **Google Chrome** (version 120+ recommended for AI features)
- **Chrome Canary or Beta** (recommended for latest AI API support)
- **Developer mode enabled** for extension installation

### Installation for Development

1. **Clone or Download** the Almond project to your local machine
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable Developer mode** (toggle in top-right corner)
4. **Click "Load unpacked"** and select the Almond folder
5. **Pin the extension** to your toolbar (optional - main interface is floating)

### Enabling Chrome AI Features

The extension includes **trial tokens** for Chrome AI APIs, but you may need to enable experimental features:

#### Method 1: Chrome Flags (Recommended)
```
chrome://flags/#optimization-guide-on-device-model
chrome://flags/#prompt-api-for-gemini-nano  
chrome://flags/#summarization-api-for-gemini-nano
chrome://flags/#rewriter-api-for-gemini-nano
```
Set each to **"Enabled"** and restart Chrome.

#### Method 2: Chrome Components
1. Visit `chrome://components/`
2. Find "Optimization Guide On Device Model"
3. Click "Check for update" to download AI models

### First Use
1. **Visit any webpage** - The floating navigation will automatically appear
2. **Test the toggle** - Click the eye icon (👁️) to hide/show navigation
3. **Try AI features** - Use the AI Assistant panel to test summarization and Q&A
4. **Customize appearance** - Adjust fonts, zoom, and protection settings

## How It Works

### Architecture Overview

```
┌─────────────────┐                   ┌─────────────────────┐
│   Popup UI      │                   │ Floating Navigation │
│ (simplified)    │                   │  (content-simple.js)│
│ - Title image   │                   │ ┌─────────────────┐ │
│ - Instructions  │                   │ │ 🤖 AI Assistant│ │
└─────────────────┘                   │ │ 🌤️ Weather     │ │
         │                            │ │ 📖 Font        │ │
         ▼                            │ │ 🔍 Zoom        │ │
┌─────────────────┐                   │ │ 🛡️ Protection  │ │
│ Chrome AI APIs  │◄──────────────────┤ │ 👁️ Toggle      │ │
│ - Rewriter API  │                   │ └─────────────────┘ │
│ - Prompt API    │                   └─────────────────────┘
│ (Trial Tokens)  │                             │
└─────────────────┘                             ▼
         │                            ┌─────────────────────┐
         ▼                            │    Web Page DOM     │
┌─────────────────┐                   │ - Dynamic styling   │
│ External APIs   │                   │ - Content panels    │
│ - Weather data  │                   │ - AI integration    │
│ - Icon resources│                   │ - Reset functions   │
└─────────────────┘                   └─────────────────────┘
```

### Floating Navigation System

The extension primarily operates through a **floating navigation panel** that:

1. **Auto-creates on page load** - Injects into any webpage DOM
2. **Positions non-intrusively** - Top-left corner with fixed positioning  
3. **Provides direct interaction** - No popup-to-content messaging needed
4. **Integrates AI directly** - Chrome AI APIs accessible in content script context
5. **Manages state locally** - Settings and preferences stored per-session

### Panel Management System

Each feature panel operates independently:

```javascript
// Panel creation pattern used throughout
function createPanel(id, title, content) {
    const panel = document.createElement('div');
    panel.className = 'almond-panel';
    panel.id = id;
    // Panel content and styling...
    return panel;
}
```

**Switch-Case Architecture**: Main navigation uses structured switch cases with proper `break` statements to prevent fall-through issues.

### AI Integration Flow

The Chrome AI APIs are integrated directly in the content script:

```javascript
// Rewriter API for summarization and key extraction
async function summarizeWithAI(text) {
    const rewriter = await window.ai.rewriter.create({
        tone: 'neutral',
        format: 'plain-text', 
        length: 'shorter'
    });
    return await rewriter.rewrite(promptText);
}

// Prompt API for interactive guidance  
async function askGuideQuestion(question, pageContext) {
    const session = await window.ai.languageModel.create({
        temperature: 0.7,
        topK: 3
    });
    return await session.prompt(promptText);
}
```

### Key Feature Functions

| Feature | Function | Implementation Location |
|---------|----------|-------------------------|
| **AI Summarization** | `summarizeWithAI()` | `content-simple.js` |
| **AI Key Extraction** | `extractKeyInfoForEmail()` | `content-simple.js` |
| **AI Q&A Guide** | `askGuideQuestion()` | `content-simple.js` |
| **Weather Display** | Weather case in switch | `content-simple.js` |
| **Font Controls** | Font panel creation | `content-simple.js` |
| **Zoom Controls** | Zoom panel creation | `content-simple.js` |
| **Eye Protection** | Protection panel creation | `content-simple.js` |
| **Toggle Navigation** | Hide/show functionality | `content-simple.js` |
| **Reset Functions** | Panel-specific reset buttons | `content-simple.js` |

### Reset System Architecture

Each customization panel includes a reset button that restores default values:

```javascript
// Pattern used across font, zoom, and protection panels
function createResetButton(panelType, defaultValues) {
    const resetBtn = document.createElement('button');
    resetBtn.onclick = () => applyDefaults(defaultValues);
    return resetBtn;
}
```

## Testing & Debugging

### Developer Console Access

- **Content Script Console**: F12 on any webpage → Console tab (primary debugging)
- **Popup Console**: Right-click extension icon → "Inspect popup" (minimal activity)
- **Extension Management**: `chrome://extensions/` → "Inspect views" (errors and logs)

### Testing the Floating Navigation

1. **Load any webpage** - Navigation should auto-appear in top-left
2. **Test toggle functionality** - Click eye icon to hide/show buttons
3. **Verify panel switching** - Click different icons to load panels
4. **Test AI features** - Use content-rich pages (Wikipedia, news articles)
5. **Check responsiveness** - Resize browser window to verify positioning

### AI Feature Testing

**Best Test Pages for AI Features**:
- Wikipedia articles (rich, structured content)
- News websites (articles with clear information)
- Documentation pages (technical content for extraction)

**AI Testing Commands**:
```javascript
// In browser console (F12)
console.log('Rewriter API available:', !!window.ai?.rewriter);
console.log('Language Model available:', !!window.ai?.languageModel);

// Test AI capability checking
window.ai?.rewriter?.capabilities().then(caps => 
    console.log('Rewriter capabilities:', caps)
);
```

### Common Debug Patterns

```javascript
// Check if floating navigation loaded
console.log('Almond nav exists:', !!document.querySelector('.almond-floating-nav'));

// Verify trial tokens are working
window.ai?.rewriter?.capabilities().then(caps => {
    console.log('AI available:', caps.available);
    if (caps.available === 'no') console.log('Trial tokens may be inactive');
});

// Debug weather functionality
console.log('Geolocation support:', !!navigator.geolocation);

// Check web-accessible resources
fetch(chrome.runtime.getURL('images/manual_logo.png'))
    .then(r => console.log('Icons accessible:', r.ok));
```

### Feature Status Indicators

Look for these console messages to verify functionality:

| Message | Status | Feature |
|---------|--------|---------|
| `"Floating navigation created successfully"` | Working | Base system |
| `"Rewriter created successfully..."` | Working | AI summarization |
| `"Language Model session created..."` | Working | AI Q&A |
| `"Weather data fetched successfully"` | Working | Weather |
| `"AI ... not available. Trial token may not be active"` | Issue | AI APIs |

## User Interface Design

### Floating Navigation Layout

**Position**: Fixed top-left corner of any webpage
**Structure**: Vertical stack of icon buttons with expanding panels

```
┌─────────────────┐
│ AI Assistant │ ← Always first (primary feature)
│ Weather      │ ← Real-time data display  
│ Font         │ ← Customization controls
│ Zoom         │ ← Page magnification
│ Protection   │ ← Eye protection modes
│ �️ Toggle       │ ← Hide/show navigation
└─────────────────┘
```

### Visual Design Philosophy

**Icon-Based Navigation**:
- **Visual icons** replace text for universal understanding
- **Consistent sizing** (50x50px buttons) for easy clicking
- **High contrast** backgrounds for visibility
- **Hover effects** provide interactive feedback

**Panel Design**:
- **Expandable content areas** appear below navigation
- **Clean, organized layouts** with logical grouping
- **Reset buttons** prominently placed for easy defaults
- **Responsive sizing** adapts to content length

### Accessibility Features

- **Large click targets** - 50x50px minimum button size
- **High contrast ratios** - Dark backgrounds with light text
- **Clear visual hierarchy** - Icons → Panels → Controls → Actions  
- **Non-blocking positioning** - Doesn't interfere with page content
- **Toggle capability** - Hide interface when not needed
- **Keyboard accessibility** - Tab navigation support for panels

## Permissions & Security

### Manifest Permissions

| Permission | Purpose | Used By | Security Impact |
|-----------|---------|---------|-----------------|
| `activeTab` | Access current webpage DOM | All features | Low - Only active tab |
| `storage` | Save user preferences | Settings persistence | Low - Local storage only |
| `scripting` | Inject content scripts | Floating navigation | Low - Required for UI |
| `geolocation` | Location for weather | Weather display | Medium - Location access |
| `tabs` | Tab management | Extension coordination | Low - Standard extension API |
| `downloads` | File downloads | Future features | Medium - File system access |

### Trial Permissions (Experimental)

| Trial Permission | Chrome AI API | Purpose | Status |
|------------------|---------------|---------|--------|
| `aiRewriterOriginTrial` | `window.ai.rewriter` | Text summarization & key extraction | Experimental |
| `aiLanguageModelOriginTrial` | `window.ai.languageModel` | Interactive Q&A guidance | Experimental |

### Trial Tokens

The extension includes embedded trial tokens for Chrome AI APIs:
- **AIRewriterAPI Token**: Enables text rewriting and summarization
- **AIPromptAPIMultimodalInput Token**: Enables interactive language model

**Token Security**: Tokens are tied to the specific extension ID and expire automatically. No personal data is transmitted to external servers through these APIs.

### External Data Access

| Service | Data Accessed | Privacy Impact |
|---------|---------------|----------------|
| **Weather Service** | Location coordinates | Anonymous location requests |
| **Chrome AI** | Page text content | Processed locally in browser |
| **Extension Icons** | Web-accessible resources | Static assets only |

**Privacy Note**: All AI processing happens locally in the browser. No webpage content or user data is sent to external servers.

## 🚧 Development Guide

### 🎯 Adding New Features to Floating Navigation

**Step-by-step process for extending the main navigation system**:

1. **Add icon to web_accessible_resources**:
```json
// In manifest.json
"web_accessible_resources": [
  {
    "resources": ["images/*", "images/new_feature_logo.png"],
    "matches": ["<all_urls>"]
  }
]
```

2. **Create button configuration**:
```javascript
// In content-simple.js buttons array
{
    id: 'newfeature',
    icon: chrome.runtime.getURL('images/new_feature_logo.png'),
    title: 'New Feature'
}
```

3. **Add switch case handler**:
```javascript  
// In button click handler switch statement
case 'newfeature':
    createNewFeaturePanel();
    break; // Always include break statement!
```

4. **Implement panel creation function**:
```javascript
function createNewFeaturePanel() {
    const panel = createPanel('New Feature', 'new-feature-panel');
    // Add feature-specific controls and logic
    document.body.appendChild(panel);
}
```

### 🤖 Integrating Chrome AI APIs

**Pattern for adding new AI functionality**:

```javascript
async function newAIFunction(inputText) {
    try {
        console.log('Attempting AI operation with trial token...');
        
        // Check API availability
        if (!window.ai?.rewriter) {
            throw new Error('AI API not available');
        }
        
        // Check capabilities  
        const capabilities = await window.ai.rewriter.capabilities();
        if (capabilities.available === 'no') {
            throw new Error('AI model not available');
        }
        
        // Create AI session
        const aiSession = await window.ai.rewriter.create({
            tone: 'neutral',
            format: 'plain-text',
            length: 'medium'
        });
        
        // Process with AI
        const result = await aiSession.rewrite(inputText);
        aiSession.destroy();
        
        return result;
    } catch (error) {
        console.error('AI operation failed:', error);
        return `Fallback result for: ${inputText}`;
    }
}
```

### 📝 Code Style Guidelines

**Modern JavaScript Patterns**:
- **ES6+ syntax**: `const`/`let`, arrow functions, template literals
- **Async/await**: For AI API calls and external requests  
- **Error boundaries**: Try/catch blocks with meaningful fallbacks
- **Console logging**: Debug information at key operation points
- **Capability checking**: Always verify API availability before use

**Switch Statement Best Practices**:
```javascript
// ALWAYS include break statements to prevent fall-through
switch (buttonId) {
    case 'feature1':
        handleFeature1();
        break; // ← Critical!
    case 'feature2':  
        handleFeature2();
        break; // ← Critical!
    default:
        console.log('Unknown feature:', buttonId);
}
```

### 🎨 UI Component Patterns

**Panel Creation Template**:
```javascript
function createFeaturePanel() {
    const panel = document.createElement('div');
    panel.className = 'almond-panel';
    panel.id = 'feature-panel';
    panel.style.cssText = `
        position: fixed;
        top: 60px;
        left: 10px; 
        background: rgba(0,0,0,0.9);
        border: 2px solid #4a90e2;
        border-radius: 10px;
        padding: 15px;
        z-index: 10001;
        color: white;
        font-family: Arial, sans-serif;
    `;
    
    // Add reset button pattern
    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'Reset';
    resetBtn.onclick = () => resetFeatureDefaults();
    
    return panel;
}
```

### 🔄 Reset Function Implementation

**Standard reset button pattern used across all panels**:
```javascript
function createResetButton(resetFunction, defaultValues) {
    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'Reset';
    resetBtn.style.cssText = `
        background: #e74c3c;
        color: white; 
        border: none;
        padding: 8px 16px;
        border-radius: 5px;
        cursor: pointer;
        margin-top: 10px;
    `;
    resetBtn.onclick = () => resetFunction(defaultValues);
    return resetBtn;
}
```

## License

This project is designed for educational and accessibility purposes. Please ensure any external API usage complies with respective terms of service.

## 🤝 Contributing

When contributing:
1. Test on multiple websites
2. Verify accessibility features work
3. Check both AI-enabled and fallback modes
4. Update documentation for new features
5. Follow the senior-friendly design principles

## 🆘 Troubleshooting Guide

### 🚨 Common Issues & Solutions

#### **Floating Navigation Not Appearing**
**Symptoms**: No navigation visible on webpages
**Solutions**:
1. Check Developer Console (F12) for errors in `content-simple.js`
2. Verify extension is enabled in `chrome://extensions/`
3. Refresh the webpage after loading extension
4. Check if content script is blocked by CSP (try different websites)

#### **AI Features Returning Errors**
**Symptoms**: "AI API not available" or "Trial token may not be active"
**Solutions**:
1. **Enable Chrome AI Flags**:
   ```
   chrome://flags/#optimization-guide-on-device-model → Enabled
   chrome://flags/#prompt-api-for-gemini-nano → Enabled
   chrome://flags/#summarization-api-for-gemini-nano → Enabled
   chrome://flags/#rewriter-api-for-gemini-nano → Enabled
   ```
2. **Download AI Models**: Visit `chrome://components/` → "Optimization Guide On Device Model" → "Check for update"
3. **Use Chrome Canary**: AI APIs work best on Chrome Canary or Beta versions
4. **Check API Status**: Console command `window.ai?.rewriter?.capabilities()`

#### **Weather Not Loading**
**Symptoms**: Weather panel shows loading or error
**Solutions**:
1. **Grant location permission** when prompted by browser
2. **Check geolocation**: Console command `navigator.geolocation`
3. **Try different websites** (some sites block geolocation)
4. **Manual location**: Consider hardcoding test coordinates for development

#### **Icons Not Displaying**  
**Symptoms**: Navigation shows broken image icons
**Solutions**:
1. **Check web_accessible_resources**: Verify `images/*` in manifest.json
2. **Verify file paths**: Ensure all icon files exist in `images/` directory
3. **Check browser cache**: Hard refresh (Ctrl+Shift+R) to clear cached resources
4. **Console errors**: Look for 404 errors for missing image files

### 🔍 Debug Commands

**Essential Console Commands for Troubleshooting**:
```javascript
// Check if main navigation loaded
document.querySelector('.almond-floating-nav')

// Verify AI API availability  
window.ai?.rewriter?.capabilities()
window.ai?.languageModel?.capabilities()

// Test weather functionality
navigator.geolocation?.getCurrentPosition(pos => console.log(pos))

// Check extension resource access
fetch(chrome.runtime.getURL('images/manual_logo.png')).then(r => console.log(r.ok))

// Verify content script injection
console.log('Content script loaded:', typeof createFloatingNav === 'function')
```

### 📊 Status Verification Checklist

| Component | Check Method | Expected Result |
|-----------|--------------|------------------|
| **Extension Loaded** | `chrome://extensions/` | ✅ Enabled, no errors |
| **Content Script** | F12 → Sources → Content Scripts | ✅ `content-simple.js` listed |
| **Floating Nav** | Visual on webpage | ✅ Navigation visible top-left |
| **AI APIs** | Console: `window.ai` | ✅ Object with rewriter/languageModel |
| **Icons** | Navigation buttons | ✅ Images load, no broken icons |
| **Weather** | Geolocation prompt | ✅ Permission granted |

### 🔧 Development Troubleshooting

**Switch Case Fall-through Issues**:
- **Problem**: Multiple panels opening simultaneously
- **Solution**: Ensure every case has a `break;` statement
- **Check**: Search code for switch statements missing breaks

**Panel Positioning Issues**:
- **Problem**: Panels appear in wrong location or overlap
- **Solution**: Verify CSS `position: fixed` and `z-index` values
- **Test**: Try different website layouts to ensure consistency

**Memory Leaks from AI Sessions**:
- **Problem**: Browser slowdown with repeated AI use  
- **Solution**: Always call `.destroy()` on AI sessions after use
- **Pattern**: Use try/finally blocks to ensure cleanup

### 📞 Getting Help

**Before Reporting Issues**:
1. ✅ Test on multiple websites (different CSP policies)
2. ✅ Check Chrome version (`chrome://version/`)
3. ✅ Clear extension and browser cache
4. ✅ Test with fresh Chrome profile
5. ✅ Document console errors with screenshots

**Useful Information for Bug Reports**:
- Chrome version and channel (Stable/Beta/Canary)
- Website where issue occurs
- Console error messages  
- Extension manifest version
- Steps to reproduce the issue

---

## 📜 License & Credits

This project is designed for educational and accessibility purposes. Chrome AI APIs are experimental and subject to change. Please ensure compliance with Chrome's origin trial terms and respective API service terms.

**Trial Token Credits**: Chrome AI Origin Trial Program  
**Icon Resources**: Extension-specific assets  
**Weather Data**: External weather service integration

---

*Almond Extension - Enhancing web accessibility through intelligent navigation and AI assistance.*