function getArticleText() {
  // CHANGE: Try article tag first (semantic HTML)
  const article = document.querySelector("article");
  if (article && article.innerText.length > 100) return article.innerText;

  // CHANGE: Try common content areas if no article tag
  const contentSelectors = ['main', '[role="main"]', '.content', '.post-content', '.article-content'];
  for (const selector of contentSelectors) {
    const element = document.querySelector(selector);
    if (element && element.innerText.length > 100) {
      return element.innerText;
    }
  }

  // CHANGE: Improved fallback - filter paragraphs to avoid navigation text
  const paragraphs = Array.from(document.querySelectorAll("p"));
  const filteredParagraphs = paragraphs.filter(p => {
    const text = p.innerText.trim();
    // CHANGE: Skip very short paragraphs and navigation elements
    return text.length > 20 && !p.closest('nav, footer, header, aside');
  });
  
  return filteredParagraphs.map((p) => p.innerText).join("\n");
}

// Highlight functionality
function highlightSelectedText() {
  const selection = window.getSelection();
  if (selection.rangeCount === 0) {
    return { success: false, count: 0, message: 'No text selected' };
  }

  let highlightCount = 0;
  
  for (let i = 0; i < selection.rangeCount; i++) {
    const range = selection.getRangeAt(i);
    if (range.collapsed) continue; // Skip empty selections
    
    try {
      // Create highlight span
      const highlightSpan = document.createElement('span');
      highlightSpan.style.backgroundColor = '#ffff00';
      highlightSpan.style.color = '#000000';
      highlightSpan.style.padding = '2px';
      highlightSpan.style.borderRadius = '3px';
      highlightSpan.className = 'almond-highlight';
      
      // Wrap the selected content
      const contents = range.extractContents();
      highlightSpan.appendChild(contents);
      range.insertNode(highlightSpan);
      
      highlightCount++;
    } catch (error) {
      console.log('Could not highlight selection:', error);
    }
  }
  
  // Clear the selection
  selection.removeAllRanges();
  
  return {
    success: highlightCount > 0,
    count: highlightCount,
    message: highlightCount > 0 ? `Highlighted ${highlightCount} selections` : 'Could not highlight selected text'
  };
}

function removeAllHighlights() {
  const highlights = document.querySelectorAll('.almond-highlight');
  highlights.forEach(highlight => {
    const parent = highlight.parentNode;
    // Move all child nodes before the highlight element
    while (highlight.firstChild) {
      parent.insertBefore(highlight.firstChild, highlight);
    }
    // Remove the highlight element
    parent.removeChild(highlight);
  });
  
  return { success: true, count: highlights.length };
}

// Font styling functionality
function applyFontSettings(settings) {
  console.log('Applying font settings:', settings);
  
  // Create or update style element
  let styleEl = document.getElementById('almond-font-styles');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'almond-font-styles';
    document.head.appendChild(styleEl);
  }
  
  // Apply styles to main content areas
  const css = `
    body, main, article, .content, [role="main"] {
      font-size: ${settings.fontSize} !important;
      font-family: ${settings.fontFamily} !important;
      background-color: ${settings.backgroundColor} !important;
      color: ${settings.textColor} !important;
      line-height: ${settings.lineSpacing || '1.5'} !important;
      letter-spacing: ${settings.letterSpacing || '0px'} !important;
    }
    
    p, div, span, h1, h2, h3, h4, h5, h6 {
      font-size: inherit !important;
      font-family: inherit !important;
      color: inherit !important;
      line-height: inherit !important;
      letter-spacing: inherit !important;
    }
    
    /* Ensure paragraphs and text blocks get proper spacing */
    p, li, td, th {
      line-height: ${settings.lineSpacing || '1.5'} !important;
      letter-spacing: ${settings.letterSpacing || '0px'} !important;
    }
  `;
  
  styleEl.textContent = css;
  return { success: true, message: 'Font settings applied' };
}

// Print functionality
function handlePrintAction(printData) {
  console.log('Handling print action:', printData);
  
  switch(printData.type) {
    case 'page':
      window.print();
      return { success: true, message: 'Print dialog opened' };
      
    case 'pdf':
      // Trigger browser's save as PDF
      document.title = document.title + ' - PDF';
      window.print();
      return { success: true, message: 'PDF save dialog opened' };
      
    case 'preview':
      window.print();
      return { success: true, message: 'Print preview opened' };
      
    case 'custom':
      // Apply custom print settings
      const printCSS = `
        @page {
          size: ${printData.options.paperSize} ${printData.options.orientation};
          margin: 1in;
        }
        @media print {
          body { 
            font-size: 12pt;
            line-height: 1.4;
          }
        }
      `;
      
      let printStyleEl = document.getElementById('almond-print-styles');
      if (!printStyleEl) {
        printStyleEl = document.createElement('style');
        printStyleEl.id = 'almond-print-styles';
        document.head.appendChild(printStyleEl);
      }
      printStyleEl.textContent = printCSS;
      
      window.print();
      return { success: true, message: 'Custom print started' };
      
    default:
      return { success: false, message: 'Unknown print type' };
  }
}

// Zoom functionality
function applyZoomSettings(zoomData) {
  const zoomLevel = parseFloat(zoomData.level) / 100;
  document.body.style.zoom = zoomLevel;
  return { success: true, message: `Zoom set to ${zoomData.level}%` };
}

// Panel and navigation management
let currentPanel = null;
let navigationBar = null;

// Create floating navigation bar on the page
function createFloatingNavigation() {
  try {
    if (navigationBar) {
      console.log('Navigation bar already exists, skipping...');
      return;
    }
    
    console.log('Creating floating navigation bar...');
    navigationBar = document.createElement('div');
  navigationBar.id = 'almond-floating-nav';
  navigationBar.style.cssText = `
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
    transition: all 0.3s ease;
  `;
  
  // Navigation button
  
  buttons.forEach(btn => {
    const button = document.createElement('button');
    button.id = `almond-btn-${btn.id}`;
    button.dataset.buttonId = btn.id;
    button.draggable = true;
    button.style.cssText = `
      width: 40px;
      height: 40px;
      border: none;
      background: transparent;
      border-radius: 20px;
      cursor: grab;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      margin: 0 5px;
      font-size: ${btn.icon.length === 1 ? '18px' : '16px'};
      font-weight: bold;
      color: #2c3e50;
    `;
    button.textContent = btn.icon;
    button.title = btn.title;
    
    // Click handler
    button.onclick = (e) => {
      if (!button.classList.contains('dragging')) {
        showPanel(btn.id);
      }
    };
    
    // Drag handlers
    button.ondragstart = (e) => {
      button.classList.add('dragging');
      button.style.cursor = 'grabbing';
      e.dataTransfer.setData('text/plain', btn.id);
      e.dataTransfer.effectAllowed = 'move';
    };
    
    button.ondragend = (e) => {
      button.classList.remove('dragging');
      button.style.cursor = 'grab';
    };
    
    // Hover effects
    button.onmouseenter = () => {
      if (!button.classList.contains('dragging')) {
        button.style.background = 'rgba(139, 111, 71, 0.1)';
        button.style.transform = 'scale(1.05)';
      }
    };
    button.onmouseleave = () => {
      if (!button.classList.contains('dragging')) {
        button.style.background = 'transparent';
        button.style.transform = 'scale(1)';
      }
    };
    
    navigationBar.appendChild(button);
  });
  
  // Create folder button
  console.log('Creating folder button...');
  const folderButton = document.createElement('button');
  folderButton.id = 'almond-folder-btn';
  folderButton.style.cssText = `
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
    padding-top: 8px;
    border-top: 1px solid rgba(139, 111, 71, 0.2);
    font-size: 20px;
    color: #2c3e50;
  `;
  folderButton.innerHTML = '📁';
  folderButton.title = 'Drag buttons here to hide them';
  folderButton.onclick = () => toggleFolderPanel();
  
  // Folder drop zone
  folderButton.ondragover = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    folderButton.style.background = 'rgba(139, 111, 71, 0.3)';
    folderButton.style.transform = 'scale(1.1)';
  };
  
  folderButton.ondragleave = (e) => {
    folderButton.style.background = 'transparent';
    folderButton.style.transform = 'scale(1)';
  };
  
  folderButton.ondrop = (e) => {
    e.preventDefault();
    const buttonId = e.dataTransfer.getData('text/plain');
    hideButtonInFolder(buttonId);
    folderButton.style.background = 'transparent';
    folderButton.style.transform = 'scale(1)';
  };
  
  navigationBar.appendChild(folderButton);
  
  document.body.appendChild(navigationBar);
  console.log('Navigation bar appended successfully');
  
  } catch (error) {
    console.error('Error creating floating navigation:', error);
  }
}

// Folder state management
let hiddenButtons = [];
let folderPanelOpen = false;

// Hide button in folder
function hideButtonInFolder(buttonId) {
  const button = document.getElementById(`almond-btn-${buttonId}`);
  if (button && !hiddenButtons.includes(buttonId)) {
    button.style.display = 'none';
    hiddenButtons.push(buttonId);
    updateFolderAppearance();
    console.log(`Hidden button: ${buttonId}`);
  }
}

// Show button from folder
function showButtonFromFolder(buttonId) {
  const button = document.getElementById(`almond-btn-${buttonId}`);
  if (button) {
    button.style.display = 'flex';
    hiddenButtons = hiddenButtons.filter(id => id !== buttonId);
    updateFolderAppearance();
    console.log(`Restored button: ${buttonId}`);
  }
}

// Update folder appearance based on hidden buttons
function updateFolderAppearance() {
  const folderBtn = document.getElementById('almond-folder-btn');
  if (folderBtn) {
    if (hiddenButtons.length > 0) {
      folderBtn.style.background = 'rgba(139, 111, 71, 0.1)';
      folderBtn.innerHTML = `📁 ${hiddenButtons.length}`;
    } else {
      folderBtn.style.background = 'transparent';
      folderBtn.innerHTML = '📁';
    }
  }
}

// Toggle folder panel
function toggleFolderPanel() {
  if (hiddenButtons.length === 0) {
    showPanel('folder-empty');
    return;
  }
  
  folderPanelOpen = !folderPanelOpen;
  if (folderPanelOpen) {
    showFolderPanel();
  } else {
    closeFolderPanel();
  }
}

// Show folder panel with hidden buttons
function showFolderPanel() {
  closeFolderPanel(); // Close any existing panel
  
  const folderPanel = document.createElement('div');
  folderPanel.id = 'almond-folder-panel';
  folderPanel.style.cssText = `
    position: fixed;
    top: 20%;
    right: 75px;
    width: 200px;
    max-height: 300px;
    background: rgba(255, 255, 255, 0.98);
    border: 1px solid rgba(139, 111, 71, 0.2);
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(139, 111, 71, 0.15), 0 8px 32px rgba(0, 0, 0, 0.1);
    z-index: 9999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    overflow: hidden;
    backdrop-filter: blur(15px);
  `;
  
  // Create header
  const header = document.createElement('div');
  header.style.cssText = `
    padding: 12px 16px;
    border-bottom: 1px solid rgba(139, 111, 71, 0.1);
    background: rgba(139, 111, 71, 0.05);
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;
  
  const title = document.createElement('h3');
  title.textContent = 'Hidden Buttons';
  title.style.cssText = `
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #8b6f47;
  `;
  
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.style.cssText = `
    background: none;
    border: none;
    font-size: 16px;
    cursor: pointer;
    color: #666;
    width: 24px;
    height: 24px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  closeBtn.onclick = closeFolderPanel;
  
  header.appendChild(title);
  header.appendChild(closeBtn);
  
  // Create content area
  const content = document.createElement('div');
  content.style.cssText = `
    padding: 12px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  `;
  
  // Add hidden buttons to folder panel
  const buttonConfigs = [
    { id: 'ai', icon: 'AI', title: 'AI Assistant' },
    { id: 'zoom', icon: 'Z', title: 'Zoom' },
    { id: 'font', icon: 'F', title: 'Font' },
    { id: 'speech', icon: 'SP', title: 'Speech' },
    { id: 'weather', icon: 'WX', title: 'Weather' },
    { id: 'reminder', icon: '⏰', title: 'Reminders' },
    { id: 'print', icon: 'PR', title: 'Print' },
    { id: 'protection', icon: 'PT', title: 'Protection' }
  ];
  
  hiddenButtons.forEach(buttonId => {
    const config = buttonConfigs.find(cfg => cfg.id === buttonId);
    if (config) {
      const hiddenBtn = document.createElement('button');
      hiddenBtn.style.cssText = `
        width: 50px;
        height: 50px;
        border: 1px solid rgba(139, 111, 71, 0.2);
        background: white;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        font-size: 16px;
        font-weight: bold;
        color: #2c3e50;
      `;
      hiddenBtn.textContent = config.icon;
      hiddenBtn.title = `Click to restore ${config.title}`;
      hiddenBtn.onclick = () => {
        showButtonFromFolder(buttonId);
        if (hiddenButtons.length === 0) {
          closeFolderPanel();
        } else {
          // Refresh the folder panel
          closeFolderPanel();
          setTimeout(showFolderPanel, 100);
        }
      };
      
      hiddenBtn.onmouseenter = () => {
        hiddenBtn.style.background = 'rgba(139, 111, 71, 0.1)';
        hiddenBtn.style.transform = 'scale(1.05)';
      };
      hiddenBtn.onmouseleave = () => {
        hiddenBtn.style.background = 'white';
        hiddenBtn.style.transform = 'scale(1)';
      };
      
      content.appendChild(hiddenBtn);
    }
  });
  
  folderPanel.appendChild(header);
  folderPanel.appendChild(content);
  
  document.body.appendChild(folderPanel);
}

// Close folder panel
function closeFolderPanel() {
  const existingPanel = document.getElementById('almond-folder-panel');
  if (existingPanel) {
    existingPanel.remove();
  }
  folderPanelOpen = false;
}

// Simple test to verify content script is running
console.log('🥜 ALMOND CONTENT SCRIPT LOADED! 🥜');

// Initialize navigation on page load
try {
  console.log('Almond content script loaded, document state:', document.readyState);
  
  // Add a small delay to ensure page is ready
  setTimeout(() => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', createFloatingNavigation);
    } else {
      createFloatingNavigation();
    }
  }, 100);
} catch (error) {
  console.error('Error initializing Almond navigation:', error);
}

// Show panel function
function showPanel(type) {
  console.log('Showing panel for type:', type);
  const content = getContentForType(type);
  console.log('Generated content:', content);
  createPanel(type, content);
}

// Close panel function
window.closePanel = function() {
  if (currentPanel) {
    currentPanel.remove();
    currentPanel = null;
  }
};

function createPanel(type, content) {
  // Remove existing panel
  if (currentPanel) {
    currentPanel.remove();
    currentPanel = null;
  }
  
  // Create panel container
  const panel = document.createElement('div');
  panel.id = 'almond-floating-panel';
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
  
  // Create content area
  const contentDiv = document.createElement('div');
  contentDiv.style.cssText = `
    padding: 20px;
    height: calc(100% - 70px);
    overflow-y: auto;
  `;
  contentDiv.innerHTML = content;
  
  panel.appendChild(header);
  panel.appendChild(contentDiv);
  
  document.body.appendChild(panel);
  currentPanel = panel;
  
  return panel;
}

function getTitleForType(type) {
  const titles = {
    'zoom': 'Zoom Control',
    'font': 'Font Settings',
    'speech': 'Text to Speech',
    'weather': 'Weather Info',
    'reminder': 'Reminders',
    'print': 'Print Options',
    'protection': 'Page Protection',
    'ai': 'AI Assistant',
    'folder-empty': 'Button Organizer'
  };
  return titles[type] || 'Tool Panel';
}

function getContentForType(type) {
  switch(type) {
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
        <div style="display: flex; gap: 8px;">
          <button onclick="setZoom(75)" style="flex: 1; padding: 8px; border: 1px solid #8b6f47; background: white; color: #8b6f47; border-radius: 6px; cursor: pointer;">75%</button>
          <button onclick="setZoom(100)" style="flex: 1; padding: 8px; border: 1px solid #8b6f47; background: white; color: #8b6f47; border-radius: 6px; cursor: pointer;">100%</button>
          <button onclick="setZoom(125)" style="flex: 1; padding: 8px; border: 1px solid #8b6f47; background: white; color: #8b6f47; border-radius: 6px; cursor: pointer;">125%</button>
        </div>
      `;
    
    case 'font':
      return `
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #8b6f47;">Font Size</label>
          <input type="range" id="font-size-slider" min="12" max="24" value="16" 
                 style="width: 100%; margin-bottom: 10px;">
          <div style="text-align: center; font-size: 14px; color: #666;">
            <span id="font-size-value">16px</span>
          </div>
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #8b6f47;">Background Color</label>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <button onclick="setBackground('white')" style="padding: 8px; border: 1px solid #ddd; background: white; border-radius: 6px; cursor: pointer;">White</button>
            <button onclick="setBackground('#fffacd')" style="padding: 8px; border: 1px solid #ddd; background: #fffacd; border-radius: 6px; cursor: pointer;">Cream</button>
            <button onclick="setBackground('#f0f8ff')" style="padding: 8px; border: 1px solid #ddd; background: #f0f8ff; border-radius: 6px; cursor: pointer;">Light Blue</button>
            <button onclick="setBackground('#f5f5f5')" style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5; border-radius: 6px; cursor: pointer;">Light Gray</button>
          </div>
        </div>
      `;
    
    case 'print':
      return `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
          <button onclick="printPage()" style="padding: 15px; border: 1px solid #8b6f47; background: white; color: #8b6f47; border-radius: 6px; cursor: pointer; text-align: center;">
            <div style="font-size: 20px; margin-bottom: 5px;">PRINT</div>
            <div>Print Page</div>
          </button>
          <button onclick="savePDF()" style="padding: 15px; border: 1px solid #8b6f47; background: white; color: #8b6f47; border-radius: 6px; cursor: pointer; text-align: center;">
            <div style="font-size: 20px; margin-bottom: 5px;">📄</div>
            <div>Save as PDF</div>
          </button>
        </div>
      `;
    
    case 'folder-empty':
      return `
        <div style="text-align: center; padding: 20px;">
          <div style="font-size: 48px; margin-bottom: 15px;">📁</div>
          <h4 style="margin: 0 0 10px 0; color: #8b6f47;">Organize Your Buttons</h4>
          <p style="color: #666; margin-bottom: 15px; line-height: 1.4;">
            Drag any navigation button into the folder icon to hide it from the main bar.
          </p>
          <div style="background: #f8f9fa; padding: 12px; border-radius: 6px; font-size: 13px; color: #666;">
            <strong>How to use:</strong><br>
            • Drag buttons to 📁 to hide them<br>
            • Click 📁 to see hidden buttons<br>
            • Click hidden buttons to restore them
          </div>
        </div>
      `;
    
    default:
      return `<p style="color: #666; text-align: center; padding: 20px;">Feature coming soon!</p>`;
  }
}

// Global functions for panel interactions
window.setZoom = function(level) {
  document.body.style.zoom = level / 100;
  const slider = document.getElementById('zoom-slider');
  const value = document.getElementById('zoom-value');
  if (slider) slider.value = level;
  if (value) value.textContent = level + '%';
};

window.setBackground = function(color) {
  document.body.style.backgroundColor = color;
};

window.printPage = function() {
  window.print();
};

window.savePDF = function() {
  window.print();
};

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.type === "GET_ARTICLE_TEXT") {
    const text = getArticleText();
    sendResponse({ text });
  } else if (req.type === "SHOW_PANEL") {
    const content = getContentForType(req.panelType);
    createPanel(req.panelType, content);
    sendResponse({ success: true });
  } else if (req.type === "ZOOM_IN") {
    const currentZoom = parseFloat(document.body.style.zoom || 1);
    const newZoom = Math.min(currentZoom + 0.1, 2);
    document.body.style.zoom = newZoom;
    sendResponse({ success: true, zoom: Math.round(newZoom * 100) + '%' });
  } else if (req.type === "INCREASE_FONT") {
    const currentSize = parseInt(window.getComputedStyle(document.body).fontSize);
    const newSize = Math.min(currentSize + 2, 24);
    document.body.style.fontSize = newSize + 'px';
    sendResponse({ success: true, fontSize: newSize + 'px' });
  } else if (req.type === "READ_PAGE") {
    const text = getArticleText();
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text.substring(0, 500));
      speechSynthesis.speak(utterance);
      sendResponse({ success: true, message: 'Reading page content' });
    } else {
      sendResponse({ success: false, message: 'Speech synthesis not supported' });
    }
  } else if (req.type === "PRINT_PAGE") {
    window.print();
    sendResponse({ success: true, message: 'Print dialog opened' });
  } else if (req.type === "SCAN_PAGE") {
    // Simple page protection check
    const suspicious = document.querySelectorAll('script[src*="ads"], iframe[src*="ads"], .popup, .modal');
    sendResponse({ success: true, message: `Found ${suspicious.length} suspicious elements` });
  } else if (req.action === "highlight") {
    if (req.type === "selection") {
      const result = highlightSelectedText();
      sendResponse(result);
    } else if (req.type === "clear") {
      const result = removeAllHighlights();
      sendResponse(result);
    }
  } else if (req.action === "font") {
    const result = applyFontSettings(req);
    sendResponse(result);
  } else if (req.action === "print") {
    const result = handlePrintAction(req);
    sendResponse(result);
  } else if (req.action === "zoom") {
    const result = applyZoomSettings(req);
    sendResponse(result);
  }
  
  // Return true to indicate we will send a response asynchronously
  return true;
});