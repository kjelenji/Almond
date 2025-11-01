// speechtosound.js — popup side: send speak requests to the content script with language selection

// Initialize speech controls - called by popup.js  
window.initializeSpeechControls = function() {
    console.debug?.('Initializing speech controls');
    initSpeechPanel();
};

function initSpeechPanel() {
    console.log('initSpeechPanel called');
    const speechSpeak = document.getElementById('speech-speak');
    const speechStop = document.getElementById('speech-stop');
    const speechStatus = document.getElementById('speech-status');
    const langButtons = document.querySelectorAll('.lang-btn');
    
    console.log('Speech elements found:', {
        speechSpeak: !!speechSpeak, speechStop: !!speechStop,
        speechStatus: !!speechStatus, langButtons: langButtons.length
    });

    // State
    let selectedLanguage = 'en-US'; // default to English
    let selectedLanguageName = 'English';



    function updateStatus() {
        if (speechStatus) {
            speechStatus.textContent = `Selected: ${selectedLanguageName}`;
        }
    }

    // Initialize status
    updateStatus();

    // Language selection
    langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove selection from all buttons
            langButtons.forEach(b => b.classList.remove('selected'));
            // Add selection to clicked button
            btn.classList.add('selected');
            // Update selected language
            selectedLanguage = btn.dataset.lang;
            selectedLanguageName = btn.dataset.name;
            
            // Show warnings for languages with limited support
            if (selectedLanguage === 'ar-SA') {
                speechStatus.textContent = `Arabic selected - limited translation support`;
            } else if (selectedLanguage === 'ml-IN') {
                speechStatus.textContent = `Malayalam selected - will use Hindi fallback`;
            } else {
                updateStatus();
            }
        });
    });

    // Set default selection
    const defaultBtn = document.querySelector('[data-lang="en-US"]');
    if(defaultBtn) {
        defaultBtn.classList.add('selected');
    }



    // Speech functionality with translation
    function sendSpeechMessage(action, opts = {}) {
        chrome.tabs.query({active:true, currentWindow:true}, (tabs) => {
            const tabId = tabs?.[0]?.id;
            if(!tabId) {
                speechStatus.textContent = 'No active tab found';
                return;
            }

            const message = { 
                type: action,
                opts: {
                    rate: 1.0,
                    pitch: 1.0, 
                    volume: 1.0,
                    lang: selectedLanguage,
                    translateTo: selectedLanguage,
                    ...opts
                }
            };

            chrome.tabs.sendMessage(tabId, message, (resp) => {
                if (chrome.runtime.lastError) {
                    speechStatus.textContent = 'Error: ' + chrome.runtime.lastError.message;
                    return;
                }
                console.debug('Speech message response', resp);
            });
        });
    }

    speechSpeak.addEventListener('click', () => {
        if (selectedLanguage === 'en-US') {
            speechStatus.textContent = `Speaking in ${selectedLanguageName}...`;
        } else if (selectedLanguage === 'ar-SA') {
            speechStatus.textContent = `Attempting Arabic translation (limited support)...`;
        } else if (selectedLanguage === 'ml-IN') {
            speechStatus.textContent = `Using Hindi fallback for Malayalam...`;
        } else {
            speechStatus.textContent = `Translating to ${selectedLanguageName} and speaking...`;
        }
        sendSpeechMessage('speak-selection');
    });

    speechStop.addEventListener('click', () => {
        speechStatus.textContent = 'Stopped';
        sendSpeechMessage('speech-control', { action: 'stop' });
    });

    // Panel control now handled by popup.js

} // end initSpeechPanel

//adding sound to speech in any language
//adjust speed/pitch/volume/tone
