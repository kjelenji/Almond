![Alt text for the image](images/almond_title.png)


A Chrome extension that provides accessibility features and AI-powered assistance for older adults (65+) through a floating navigation interface.

## Features

- Floating navigation panel on any webpage
- AI-powered page summarization, fact-checking, and key information extraction
- Font and zoom controls for better readability
- Text-to-speech functionality with speech rate control
- Weather display with location-based data
- Reminder system with notifications
- Print and PDF export capabilities
- Page protection and ad blocking
- Accessibility features including magnetic cursor and enlarged clickable areas

## Installation

The floating navigation appears automatically on webpages. Click the icons to access different features:

- AI Assistant: Summarize pages, extract key points, and get guided help
- Zoom: Adjust page magnification (50%-300%)
- Font: Customize text size, family, colors, and spacing
- Speech: Convert selected text or entire page to speech
- Weather: View current weather conditions
- Reminders: Set time-based reminders with notifications
- Print: Print current page or save as PDF
- Protection: Scan for threats and block ads

## Requirements

- Chrome version 120+ (recommended for AI features)
- Enable experimental AI features in Chrome flags for full functionality
- Notifications permission for reminder alerts

## Project Structure

```
Almond/
├── manifest.json          # Extension configuration
├── popup.html            # Extension popup interface
├── scripts/              # JavaScript files
│   ├── content-injector.js      # Content script utilities
│   ├── content-simple.js        # Main content script with all features
│   ├── floating_nav.js          # Floating navigation interface
│   └── popup.js                 # Popup interface logic
├── styles/               # CSS files
│   └── popup.css         # Comprehensive styling
└── images/               # Icon and image assets
```

## Architecture

Almond Chrome Extension provides comprehensive web accessibility and productivity tools:

- **Unified Content Script:** All features integrated into `content-simple.js` for streamlined deployment and maintenance
- **Floating Navigation & Panel System:** Dynamic UI components with accessibility controls and smooth interactions
- **AI Integrations:** Chrome AI APIs (Writer, Summarizer, Prompt) for intelligent content analysis with robust error handling
- **Storage Strategy:** Chrome storage API with localStorage fallback for cross-device synchronization
- **Accessibility-First Design:** Motor control enhancements, visual feedback, and inclusive interaction patterns
- **External APIs Integration:** Weather, geolocation, notifications, and print APIs with comprehensive error handling
