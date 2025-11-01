# Almond

A Chrome extension that provides accessibility features and AI-powered assistance through a floating navigation interface.

## Features

- Floating navigation panel on any webpage
- AI-powered page summarization and key information extraction
- Font and zoom controls for better readability
- Weather display with location data
- Text-to-speech functionality
- Eye protection modes

## Installation

1. Download or clone the Almond project
2. Open Chrome and go to `chrome://extensions/`
3. Enable Developer mode
4. Click "Load unpacked" and select the Almond folder

## Usage

The floating navigation appears automatically on webpages. Click the icons to access different features:

- AI Assistant: Summarize pages and extract key information
- Weather: View current weather conditions
- Font: Customize text appearance
- Zoom: Adjust page magnification
- Speech: Convert text to speech
- Protection: Apply eye protection filters

## Requirements

- Chrome version 120+ (recommended for AI features)
- Enable experimental AI features in Chrome flags for full functionality

## Project Structure

```
Almond/
├── manifest.json          # Extension configuration
├── popup.html            # Extension popup (index)
├── scripts/              # JavaScript files
│   ├── content-simple.js
│   ├── content-font-injector.js
│   └── ...
├── styles/               # CSS files
└── images/               # Icon assets
```