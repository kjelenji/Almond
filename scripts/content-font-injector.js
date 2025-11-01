// content-font-injector.js
// Fallback content script: reads saved font from storage/localStorage and applies it to the page.
(function(){
    function applyFontObj(opts){
        try{
            const selector = 'p, li, span, a, label, input, textarea, h1, h2, h3, h4, h5, h6';
            const els = document.querySelectorAll(selector);
            for (const el of els){
                el.style.fontFamily = opts.family;
                el.style.color = opts.color;
                el.style.fontSize = opts.size;
                el.style.lineHeight = opts.lineHeight;
            }
            if (document.body){
                document.body.style.fontFamily = opts.family;
                document.body.style.color = opts.color;
                if (opts.backgroundColor) {
                    document.body.style.backgroundColor = opts.backgroundColor;
                }
                const current = window.getComputedStyle(document.body).fontSize || '';
                const curNum = parseFloat(current) || 0;
                const desired = parseFloat(opts.size) || 0;
                if(desired && curNum < desired) document.body.style.fontSize = opts.size;
                document.body.style.lineHeight = opts.lineHeight;
            }

            // Apply button and widget enlargement
            if (opts.buttonScale && opts.buttonScale !== 100) {
                applyButtonEnlargement(opts.buttonScale);
            }

            console.debug?.('content-font-injector applied font', opts);
        }catch(err){ console.error('content-font-injector error', err); }
    }

    // Function to enlarge buttons and interactive widgets
    function applyButtonEnlargement(scale) {
        try {
            const scaleMultiplier = scale / 100;
            
            // Remove existing almond button scale styles
            const existingStyle = document.getElementById('almond-button-scale-style');
            if (existingStyle) {
                existingStyle.remove();
            }

            // Create new style element for button scaling
            const styleElement = document.createElement('style');
            styleElement.id = 'almond-button-scale-style';
            styleElement.textContent = `
                /* Almond Extension - Button and Widget Enlargement */
                button, input[type="button"], input[type="submit"], input[type="reset"],
                .button, .btn, [role="button"],
                select, input[type="text"], input[type="email"], input[type="password"],
                input[type="search"], input[type="tel"], input[type="url"], input[type="number"],
                textarea, input[type="checkbox"], input[type="radio"],
                a.button, a.btn, .nav-link, .menu-item,
                .form-control, .input-group, .dropdown-toggle {
                    transform: scale(${scaleMultiplier}) !important;
                    transform-origin: top left !important;
                    margin-right: ${(scaleMultiplier - 1) * 50}px !important;
                    margin-bottom: ${(scaleMultiplier - 1) * 20}px !important;
                }
                
                /* Navigation and menu items */
                nav ul li, .navbar-nav li, .menu li, .nav-item {
                    transform: scale(${scaleMultiplier}) !important;
                    transform-origin: top left !important;
                    margin-right: ${(scaleMultiplier - 1) * 30}px !important;
                    margin-bottom: ${(scaleMultiplier - 1) * 10}px !important;
                }
                
                /* Form groups and containers */
                .form-group, .input-group, .field-wrapper {
                    margin-bottom: ${20 * scaleMultiplier}px !important;
                }
                
                /* Interactive elements */
                .slider, .range-input, .toggle, .switch {
                    transform: scale(${scaleMultiplier}) !important;
                    transform-origin: top left !important;
                }
                
                /* Clickable cards and tiles */
                .card[onclick], .tile[onclick], [onclick]:not(script):not(style) {
                    transform: scale(${scaleMultiplier}) !important;
                    transform-origin: top left !important;
                    margin-right: ${(scaleMultiplier - 1) * 20}px !important;
                    margin-bottom: ${(scaleMultiplier - 1) * 15}px !important;
                }
            `;
            
            document.head.appendChild(styleElement);
            console.debug?.('Applied button enlargement scale:', scale + '%');
            
        } catch (err) {
            console.error('Button enlargement error:', err);
        }
    }

    // Try chrome.storage first, else localStorage fallback (apply saved on load)
    function applySaved(){
        if (chrome?.storage?.sync){
            chrome.storage.sync.get(['almondFont'], (items)=>{
                const font = items.almondFont;
                if (font) applyFontObj(font);
                else {
                    const raw = localStorage.getItem('almondFont');
                    if(raw){
                        try{ applyFontObj(JSON.parse(raw)); }
                        catch(err){ console.warn('content-font-injector JSON parse failed', err); }
                    }
                }
            });
        } else {
            try{
                const raw = localStorage.getItem('almondFont');
                if(raw) applyFontObj(JSON.parse(raw));
            }catch(e){ console.error('content-font-injector read localStorage failed', e); }
        }
    }

    applySaved();

    // Listen for messages from the popup to apply a font immediately or speak text
    chrome.runtime.onMessage.addListener(onRuntimeMessage);

    function onRuntimeMessage(message, sender, sendResponse){
        if (!message) return false;
        
        if (message.type === 'apply-font' && message.font) { 
            handleApplyFont(message.font, sendResponse); 
            return true;
        }
        if (message.type === 'speak-selection') { 
            handleSpeakSelection(message.opts || {}, sendResponse); 
            return true; // Async handler
        }
        if (message.type === 'speech-control') { 
            console.log('[SPEECH] Received speech-control message:', message);
            handleSpeechControl(message.command, sendResponse); 
            return true;
        }
        if (message.type === 'reset-font') { 
            handleResetFont(sendResponse); 
            return true;
        }
        if (message.type === 'manual-guide') { 
            handleManualGuide(sendResponse); 
            return true;
        }
        if (message.type === 'ask-guide') {
            handleAskGuide(message.question, sendResponse);
            return true;
        }
        if (message.type === 'manual-highlight') { 
            console.log('[CONTENT] Received manual-highlight message');
            handleManualHighlight(sendResponse); 
            return true;
        }
        if (message.type === 'manual-summarize') { 
            console.log('[CONTENT] Received manual-summarize message');
            handleManualSummarize(sendResponse); 
            return true;
        }
        if (message.type === 'check-ai-availability') {
            handleCheckAIAvailability(sendResponse);
            return true;
        }
        if (message.action === 'apply-zoom') { 
            handleApplyZoom(message.zoom, sendResponse); 
            return true;
        }
        if (message.action === 'print-page') {
            handlePrintPage(message.settings, sendResponse);
            return true;
        }
        if (message.action === 'print-selection') {
            handlePrintSelection(message.settings, sendResponse);
            return true;
        }
        if (message.action === 'print-preview') {
            handlePrintPreview(message.settings, sendResponse);
            return true;
        }
        if (message.action === 'save-pdf') {
            handleSavePdf(message.settings, sendResponse);
            return true;
        }
        if (message.action === 'get-page-info') {
            handleGetPageInfo(sendResponse);
            return true;
        }
        if (message.action === 'check-scams') {
            handleCheckScams(sendResponse);
            return true;
        }
        if (message.action === 'block-ads') {
            handleBlockAds(sendResponse);
            return true;
        }
        if (message.action === 'show-ads') {
            handleShowAds(sendResponse);
            return true;
        }
        
        return false;
    }

    function handleApplyFont(font, sendResponse){
        try{ applyFontObj(font); sendResponse({ok:true}); }
        catch(err){ sendResponse({ok:false, error:String(err)}); }
        return true;
    }

        // Manual helpers: AI-powered guide generation
        async function handleManualGuide(sendResponse){
            try{
                // Gather page content for analysis
                const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).slice(0,10).map(h=>({
                    text: h.innerText.trim(),
                    level: parseInt(h.tagName[1]),
                    element: h
                })).filter(h => h.text);

                // Gather images with better context
                const images = Array.from(document.images).slice(0,10).map(img => ({
                    src: img.src,
                    alt: img.alt || '',
                    title: img.title || '',
                    description: img.alt || img.title || `Image from ${window.location.hostname}`,
                    width: img.naturalWidth || img.width || 100,
                    height: img.naturalHeight || img.height || 100
                })).filter(img => img.width > 50 && img.height > 50); // Filter out small icons
                
                console.log('Found images for guide:', images.length, images);

                // Get page text for context
                let pageText = '';
                const selection = window.getSelection();
                if (selection && selection.toString().trim()) {
                    pageText = selection.toString().trim();
                } else {
                    const mainContent = document.querySelector('main, article, .content, .post, .entry') || document.body;
                    pageText = mainContent?.innerText || '';
                    if (pageText.length > 5000) {
                        pageText = pageText.substring(0, 5000) + '...';
                    }
                }

                // Check if AI Writer is available
                if (!window.ai || !window.ai.writer) {
                    // Fallback to original logic
                    const steps = []
                    for(let i=0;i<Math.max(headings.length, images.length);i++){
                        const h = headings[i]?.text
                        const img = images[i]?.description
                        let step = ''
                        if(h) step += `Step ${i+1}: ${h}`
                        if(img) step += (step? ' — ' : `Step ${i+1}: `) + `See image: ${img}`
                        if(step) steps.push(step)
                    }
                    const result = steps.length ? steps.join('\n') : 'No clear headings or images found on this page to auto-generate a guide.'
                    sendResponse({ok:true, result, allowEdit: false});
                    return;
                }

                // Check Writer API capabilities
                const canWrite = await window.ai.writer.capabilities();
                if (canWrite.available === 'no') {
                    throw new Error('AI Writer not available on this device');
                }

                // Create Writer session for guide generation
                const writer = await window.ai.writer.create({
                    tone: 'friendly',
                    format: 'plain-text',
                    length: 'medium'
                });

                // Build context for the AI writer
                let context = `Page Title: ${document.title}\n`;
                if (headings.length > 0) {
                    context += `Headings found: ${headings.map(h => h.text).join(', ')}\n`;
                }
                if (images.length > 0) {
                    context += `Images found: ${images.map(img => img.description).join(', ')}\n`;
                }
                if (pageText) {
                    context += `Page content: ${pageText.substring(0, 1000)}...\n`;
                }

                const prompt = `Create a step-by-step guide for older adults (65+) based on this webpage content. 
Make it clear, simple, and easy to follow with numbered steps.
Include references to images when relevant for visual guidance.
Use simple language and short sentences appropriate for seniors.
Focus on the main actions someone would need to take.

${context}

Generate a helpful step-by-step guide:`;

                // If AI is downloading, notify user
                if (canWrite.available === 'after-download') {
                    sendResponse({ok:true, result: 'Downloading AI model for better guides... This may take a moment.', allowEdit: false});
                    
                    writer.addEventListener('downloadprogress', (e) => {
                        console.log(`AI model download: ${e.loaded}/${e.total} bytes`);
                    });
                    
                    await writer.ready;
                }

                const guide = await writer.write(prompt);
                writer.destroy();

                // Format the guide with proper structure and images
                const formattedGuide = formatGuideForSeniors(guide, images);
                
                sendResponse({
                    ok: true, 
                    result: formattedGuide,
                    allowEdit: true,
                    images: images, // Pass images for display
                    originalContent: {
                        headings: headings,
                        images: images,
                        pageText: pageText.substring(0, 500)
                    }
                });

            }catch(err){ 
                console.error('Guide generation error:', err);
                // Fallback to original logic on error
                try {
                    const headings = Array.from(document.querySelectorAll('h1,h2,h3')).slice(0,6).map(h=>h.innerText.trim()).filter(Boolean)
                    const imgs = Array.from(document.images).slice(0,6).map(i=>i.alt || i.title || i.src)
                    const steps = []
                    for(let i=0;i<Math.max(headings.length, imgs.length);i++){
                        const h = headings[i]
                        const img = imgs[i]
                        let step = ''
                        if(h) step += `Step ${i+1}: ${h}`
                        if(img) step += (step? ' — ' : `Step ${i+1}: `) + `See image: ${img}`
                        if(step) steps.push(step)
                    }
                    const result = steps.length ? steps.join('\n') : 'AI guide generation failed. Using basic guide instead.'
                    sendResponse({ok:true, result, allowEdit: false});
                } catch(fallbackErr) {
                    sendResponse({ok:false, error:'Guide generation failed: ' + String(err)});
                }
            }
            return true
        }

        // Helper function to format guides for seniors with images
        function formatGuideForSeniors(guide, images) {
            // Clean up the guide text
            let formatted = guide.trim();
            
            // Ensure proper step numbering and add images
            const lines = formatted.split('\n');
            let stepNumber = 1;
            const formattedLines = [];
            let imageIndex = 0;
            
            for (let line of lines) {
                line = line.trim();
                if (!line) continue;
                
                // If line doesn't start with "Step" but looks like a step, format it
                if (line.match(/^\d+\.?/) || line.match(/^[A-Z]/) && line.length > 10) {
                    line = `Step ${stepNumber}: ${line.replace(/^\d+\.?\s*/, '')}`;
                    
                    // Add relevant image if available
                    if (images && imageIndex < images.length) {
                        const img = images[imageIndex];
                        line += `\n📷 See image: ${img.description}`;
                        if (img.src) {
                            line += `\n   ${img.src}`;
                        }
                        imageIndex++;
                    }
                    
                    stepNumber++;
                }
                
                formattedLines.push(line);
            }
            
            // Add any remaining images at the end
            if (images && imageIndex < images.length) {
                formattedLines.push('\n📷 Additional helpful images:');
                for (let i = imageIndex; i < images.length; i++) {
                    const img = images[i];
                    formattedLines.push(`   • ${img.description}`);
                    if (img.src) {
                        formattedLines.push(`     ${img.src}`);
                    }
                }
            }
            
            return formattedLines.join('\n\n');
        }

        // Question-based guide generation using AI Writer
        async function handleAskGuide(question, sendResponse) {
            try {
                if (!question || !question.trim()) {
                    sendResponse({ok: false, error: 'Please enter a question about what you want to learn.'});
                    return;
                }

                // Get page context and images for better guidance
                const pageContext = gatherPageContext();
                
                // Gather relevant images from the page
                const images = Array.from(document.images).slice(0,5).map(img => ({
                    src: img.src,
                    alt: img.alt || '',
                    title: img.title || '',
                    description: img.alt || img.title || `Image from ${window.location.hostname}`,
                    width: img.naturalWidth || img.width || 100,
                    height: img.naturalHeight || img.height || 100
                })).filter(img => img.width > 50 && img.height > 50);
                
                console.log('Found images for ask guide:', images.length, images);
                
                // Check if AI Writer is available
                if (!window.ai || !window.ai.writer) {
                    // Fallback response for basic questions
                    const fallbackGuide = generateFallbackGuideFromQuestion(question);
                    sendResponse({ok: true, result: fallbackGuide, allowEdit: false});
                    return;
                }

                // Check Writer API capabilities
                const canWrite = await window.ai.writer.capabilities();
                if (canWrite.available === 'no') {
                    throw new Error('AI Writer not available on this device');
                }

                // Create Writer session for question-based guide generation
                const writer = await window.ai.writer.create({
                    tone: 'friendly',
                    format: 'plain-text',
                    length: 'medium'
                });

                // If AI is downloading, notify user
                if (canWrite.available === 'after-download') {
                    sendResponse({ok: true, result: 'Downloading AI model for better guides... This may take a moment.', allowEdit: false});
                    
                    writer.addEventListener('downloadprogress', (e) => {
                        console.log(`AI model download: ${e.loaded}/${e.total} bytes`);
                    });
                    
                    await writer.ready;
                }

                // Create a comprehensive prompt for the AI Writer
                const prompt = `Create a simple, step-by-step guide for older adults (65+) to answer this question: "${question}"

Guidelines for the guide:
- Use simple, clear language appropriate for seniors
- Break down complex tasks into small, manageable steps
- Number each step clearly (Step 1, Step 2, etc.)
- Include safety warnings or important notes where relevant
- Use encouraging, patient language
- Assume basic technology skills but explain technical terms
- Keep each step focused on one action

${pageContext ? `Current webpage context: ${pageContext}` : ''}

Create a helpful, senior-friendly guide:`;

                const guide = await writer.write(prompt);
                writer.destroy();

                // Format the guide specifically for the question
                const formattedGuide = formatQuestionGuide(question, guide);
                
                sendResponse({
                    ok: true, 
                    result: formattedGuide,
                    allowEdit: true,
                    questionAsked: question,
                    images: images // Include images for display
                });

            } catch (err) {
                console.error('Ask guide generation error:', err);
                // Fallback to basic guide
                try {
                    const fallbackGuide = generateFallbackGuideFromQuestion(question);
                    sendResponse({ok: true, result: fallbackGuide, allowEdit: false});
                } catch (fallbackErr) {
                    sendResponse({ok: false, error: 'Could not generate guide: ' + String(err)});
                }
            }
            return true;
        }

        // Helper function to gather page context
        function gatherPageContext() {
            try {
                let context = '';
                
                // Add page title
                if (document.title) {
                    context += `Page: ${document.title}\n`;
                }
                
                // Add main headings
                const headings = Array.from(document.querySelectorAll('h1,h2,h3')).slice(0,5)
                    .map(h => h.innerText.trim()).filter(Boolean);
                if (headings.length > 0) {
                    context += `Main topics: ${headings.join(', ')}\n`;
                }
                
                // Add some page content
                const mainContent = document.querySelector('main, article, .content') || document.body;
                const pageText = mainContent?.innerText || '';
                if (pageText.length > 100) {
                    context += `Content preview: ${pageText.substring(0, 300)}...\n`;
                }
                
                return context.substring(0, 500); // Limit context size
            } catch (err) {
                return '';
            }
        }

        // Fallback guide generator for when AI is not available
        function generateFallbackGuideFromQuestion(question) {
            const lowerQ = question.toLowerCase();
            
            // Common question patterns and basic responses
            if (lowerQ.includes('email')) {
                return `Step-by-Step Guide: Email Setup

Step 1: Find the Settings app on your device (usually a gear icon)
Step 2: Look for "Mail" or "Accounts" in the settings
Step 3: Tap "Add Account" or "Add Email Account"  
Step 4: Choose your email provider (Gmail, Yahoo, Outlook, etc.)
Step 5: Enter your email address and password
Step 6: Follow the on-screen instructions to complete setup

Note: Make sure you have a stable internet connection before starting.`;
            }
            
            if (lowerQ.includes('password') || lowerQ.includes('login')) {
                return `Step-by-Step Guide: Password Management

Step 1: Visit the website or app where you need to reset your password
Step 2: Look for "Forgot Password" or "Reset Password" link
Step 3: Enter your email address when prompted
Step 4: Check your email for a reset link (may take a few minutes)
Step 5: Click the link in the email
Step 6: Create a new, strong password
Step 7: Write down your new password in a safe place

Safety tip: Never share your passwords with anyone.`;
            }
            
            if (lowerQ.includes('phone') || lowerQ.includes('call')) {
                return `Step-by-Step Guide: Using Your Phone

Step 1: Unlock your phone using your passcode or fingerprint
Step 2: Find the Phone app (usually green with a phone icon)
Step 3: Tap on the Phone app to open it
Step 4: Use the keypad to dial the number, or select from contacts
Step 5: Tap the green call button to start the call
Step 6: Hold the phone to your ear or use speaker mode
Step 7: Tap the red button to end the call when finished`;
            }
            
            // Generic response for other questions
            return `Step-by-Step Guide: ${question}

I understand you want to learn about: "${question}"

Here are some general steps to get started:

Step 1: Take your time - there's no need to rush
Step 2: Make sure you have everything you need nearby
Step 3: If using technology, ensure your device is charged and connected
Step 4: Follow instructions one step at a time
Step 5: Don't hesitate to ask for help from family or friends
Step 6: Practice makes perfect - try again if something doesn't work

Note: For specific instructions, try asking about particular topics like "email," "phone calls," or "passwords."`;
        }

        // Format question-based guides
        function formatQuestionGuide(question, guide) {
            let formatted = `Guide: ${question}\n\n${guide.trim()}`;
            
            // Ensure proper formatting
            const lines = formatted.split('\n');
            const formattedLines = [];
            let stepNumber = 1;
            
            for (let line of lines) {
                line = line.trim();
                if (!line) {
                    formattedLines.push('');
                    continue;
                }
                
                // Format step lines
                if (line.match(/^step\s+\d+/i) || line.match(/^\d+[\.)]/)) {
                    line = line.replace(/^(step\s+)?\d+[\.)]\s*/i, `Step ${stepNumber}: `);
                    stepNumber++;
                }
                
                formattedLines.push(line);
            }
            
            return formattedLines.join('\n');
        }

        async function handleManualHighlight(sendResponse){
            try{
                console.log('[HIGHLIGHT] Starting highlight analysis');
                
                // Get text (selected text if available, otherwise full page)
                let text = '';
                const selection = globalThis.getSelection();
                if (selection?.toString().trim()) {
                    text = selection.toString().trim();
                    console.log('[HIGHLIGHT] Using selected text');
                } else {
                    // Look for email content or main content
                    const emailBody = document.querySelector('.email-body, .message-body, .mail-content, [role="main"]');
                    text = emailBody?.innerText || document.body?.innerText || '';
                    console.log('[HIGHLIGHT] Using page content');
                }

                if (!text || text.length < 20) {
                    sendResponse({ok: true, result: 'No text found to highlight. Try selecting some text or ensure the page has content.'});
                    return;
                }

                // Limit text for processing
                if (text.length > 5000) {
                    text = text.substring(0, 5000);
                }

                // Extract key information using simple pattern matching
                const highlights = extractKeyInformation(text);
                
                const highlightResult = `Key Information Highlighted:\n\n${highlights}`;
                console.log('[HIGHLIGHT] Analysis complete');
                sendResponse({ok: true, result: highlightResult});
                
            } catch(err) { 
                console.error('Highlight error:', err);
                // Simple fallback highlighting
                const fallbackResult = extractKeyInformationFallback(document.body?.innerText || '');
                sendResponse({ok: true, result: fallbackResult || 'Could not extract key information.'});
            }
            return true;
        }

        // Simple key information extraction for highlighting
        function extractKeyInformation(text) {
            const highlights = [];
            
            // Split into sentences and analyze
            const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
            
            // Look for important patterns
            const importantPatterns = [
                /\b(important|urgent|deadline|due|required|must|need to|action|task)\b/i,
                /\b(meeting|appointment|call|interview)\b.*\b(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{1,2}:\d{2}|\d{1,2}\/\d{1,2})\b/i,
                /\b(payment|bill|invoice|amount|cost|price|fee)\b.*\$?\d+/i,
                /\b(confirm|reply|respond|contact|email|phone)\b/i,
                /\b(reminder|don't forget|please note|fyi|attention)\b/i
            ];
            
            // Check each sentence for important information
            for (const sentence of sentences) {
                const trimmed = sentence.trim();
                if (trimmed.length < 20 || trimmed.length > 200) continue;
                
                // Check if sentence matches important patterns
                const isImportant = importantPatterns.some(pattern => pattern.test(trimmed));
                
                // Also check for email signatures, dates, and contact info
                const hasDateTime = /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{1,2}:\d{2}\s*(am|pm)?/i.test(trimmed);
                const hasContact = /@\w+\.\w+|\b\d{3}[.-]\d{3}[.-]\d{4}/i.test(trimmed);
                
                if (isImportant || hasDateTime || hasContact) {
                    highlights.push(`• ${trimmed}`);
                    if (highlights.length >= 8) break;
                }
            }
            
            return highlights.length > 0 ? highlights.join('\n') : 'No key information found. Try selecting specific text from an email or document.';
        }

        // Fallback extraction method
        function extractKeyInformationFallback(text) {
            if (!text || text.length < 50) {
                return 'No text available for highlighting. Please select some text or navigate to a page with content.';
            }
            
            const keywords = ['important', 'urgent', 'deadline', 'meeting', 'appointment', 'payment', 'reminder', 'action', 'required'];
            const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 15);
            const keyItems = [];
            
            for (const sentence of sentences.slice(0, 50)) {
                const lower = sentence.toLowerCase();
                if (keywords.some(keyword => lower.includes(keyword))) {
                    keyItems.push(`• ${sentence.trim()}`);
                    if (keyItems.length >= 6) break;
                }
            }
            
            return keyItems.length > 0 
                ? `Key Information Found:\n\n${keyItems.join('\n')}`
                : 'No obviously important information detected. Try selecting specific text that contains dates, deadlines, or action items.';
        }

        async function handleManualSummarize(sendResponse){
            try{
                console.log('[SUMMARIZE] Starting enhanced content summarization');
                
                // Check if enhanced AI summaries are available (integrated with writer_api_test.js)
                let useEnhancedAI = false;
                try {
                    // Check for Chrome AI capabilities
                    if (globalThis.ai?.summarizer) {
                        useEnhancedAI = true;
                        console.log('[SUMMARIZE] Chrome AI available - using enhanced mode');
                    }
                } catch (aiCheckError) {
                    console.log('[SUMMARIZE] Chrome AI not available, using basic mode');
                }
                
                // Get text (selected text if available, otherwise main content)
                let text = '';
                const selection = globalThis.getSelection();
                if (selection?.toString().trim()) {
                    text = selection.toString().trim();
                    console.log('[SUMMARIZE] Using selected text');
                } else {
                    // Enhanced content extraction - works with content.js
                    const mainContent = document.querySelector('article, main, [role="main"], .content, .post, .entry, .article-body, .story-body') || document.body;
                    text = mainContent?.innerText || '';
                    console.log('[SUMMARIZE] Using main content');
                }

                // Clean and limit text
                if (text.length > 8000) {
                    text = text.substring(0, 8000);
                }

                if (!text || text.length < 100) {
                    sendResponse({ok: true, result: 'Not enough text found to summarize. Try selecting a longer article or text passage.'});
                    return;
                }

                // Try enhanced AI summarization first
                if (useEnhancedAI) {
                    try {
                        console.log('[SUMMARIZE] Attempting Chrome AI enhanced summary');
                        const summarizer = await globalThis.ai.summarizer.create();
                        const enhancedSummary = await summarizer.summarize(text);
                        
                        const result = `Enhanced AI Summary:\n\n${enhancedSummary}\n\nTip: This summary was created using Chrome's built-in AI. Use the Guide feature for specific questions!`;
                        console.log('[SUMMARIZE] Enhanced AI summary complete');
                        sendResponse({ok: true, result: result});
                        return;
                    } catch (aiError) {
                        console.log('[SUMMARIZE] Chrome AI failed, falling back to basic summary:', aiError);
                        // Fall through to basic summary
                    }
                }

                // Fallback to enhanced basic summary (improved from original)
                const summary = createEnhancedBasicSummary(text);
                
                const result = `Enhanced Summary:\n\n${summary}\n\nTip: Use the Guide feature to ask specific questions about this content!`;
                console.log('[SUMMARIZE] Enhanced basic summary complete');
                sendResponse({ok: true, result: result});
                
            } catch(err) { 
                console.error('[SUMMARIZE] Summary error:', err);
                sendResponse({ok: true, result: 'Could not create summary. Try selecting specific text or ensure the page has readable content.'});
            }
            return true;
        }

        // Simple text summarization function
        function createSimpleSummary(text) {
            // Split into sentences
            const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
            
            if (sentences.length === 0) {
                return 'No readable sentences found in the text.';
            }
            
            // If short text, return first few sentences
            if (sentences.length <= 3) {
                return sentences.map(s => s.trim()).join('. ') + '.';
            }
            
            // For longer text, extract key sentences
            const keyPoints = [];
            const importantWords = ['important', 'key', 'main', 'primary', 'significant', 'result', 'conclusion', 'summary'];
            
            // Get first sentence (often contains main topic)
            keyPoints.push(sentences[0].trim());
            
            // Look for sentences with important keywords
            for (let i = 1; i < Math.min(sentences.length, 20); i++) {
                const sentence = sentences[i].trim();
                const hasImportantWord = importantWords.some(word => 
                    sentence.toLowerCase().includes(word)
                );
                
                if (hasImportantWord && keyPoints.length < 3) {
                    keyPoints.push(sentence);
                }
            }
            
            // If we don't have enough key sentences, add more from the beginning
            while (keyPoints.length < 3 && keyPoints.length < sentences.length) {
                const nextSentence = sentences[keyPoints.length].trim();
                if (!keyPoints.includes(nextSentence)) {
                    keyPoints.push(nextSentence);
                }
            }
            
            return keyPoints.join('. ') + '.';
        }

        function handleCheckAIAvailability(sendResponse) {
            try {
                let aiStatus = 'Not available';
                
                if (window.ai) {
                    const features = [];
                    if (window.ai.languageModel) features.push('Highlighting');
                    if (window.ai.summarizer) features.push('Summarizing');
                    if (window.ai.writer) features.push('Guide Creation');
                    
                    if (features.length > 0) {
                        aiStatus = `Available (${features.join(', ')})`;
                    }
                }
                
                sendResponse({ok: true, aiStatus});
            } catch (err) {
                sendResponse({ok: true, aiStatus: 'Check failed'});
            }
            return true;
        }

    async function handleSpeakSelection(opts, sendResponse){
        try{
            const selection = window.getSelection ? window.getSelection().toString() : '';
            let text = '';
            let isSelection = false;

            if (selection?.trim()) {
                text = selection.trim();
                isSelection = true;
                console.log('[SPEECH] Speaking selected text:', text.substring(0, 100) + '...');
            } else {
                text = document.body?.innerText || '';
                console.log('[SPEECH] No selection found, speaking full page content');
            }

            // Limit text length more intelligently
            const lines = text.split('\n');
            let truncated;

            if (isSelection) {
                // For selections, allow more lines (up to 500)
                truncated = lines.slice(0, 500).join('\n');
            } else {
                // For full page, limit to 300 lines
                truncated = lines.slice(0, 300).join('\n');
            }

            // Clean up the text
            truncated = truncated.trim();

            if (!truncated) {
                sendResponse({ok: false, error: 'No readable text found to speak'});
                return true;
            }

            // Show feedback about what's being spoken
            showSpeechFeedback(isSelection, truncated.length);

            // Translate text if a target language is specified
            if (opts.translateTo && opts.translateTo !== 'en-US') {
                const translatedText = await translateText(truncated, opts.translateTo);
                speakText(translatedText, opts);
            } else {
                speakText(truncated, opts);
            }

            sendResponse({ok:true});
        }catch(err){
            console.error('Speech error:', err);
            sendResponse({ok:false, error:String(err)});
        }
        return true;
    }    // Translation function for content script
    async function translateText(text, targetLang) {
        try {
            // Remove region code for translation (e.g., 'en-US' -> 'en')
            const langCode = targetLang.split('-')[0];
            
            // If target is English, no translation needed
            if (langCode === 'en') return text;
            
            // Language mapping for better API support
            const langMap = {
                'ar': 'ar',     // Arabic - supported by MyMemory
                'ml': 'hi',     // Malayalam - fallback to Hindi (similar script family)
                'zh': 'zh-cn',  // Chinese - use specific variant
                'ko': 'ko',     // Korean
                'es': 'es',     // Spanish
                'ru': 'ru',     // Russian
                'ja': 'ja',     // Japanese
                'fr': 'fr',     // French
                'it': 'it',     // Italian
                'hi': 'hi',     // Hindi
                'de': 'de'      // German
            };
            
            const apiLangCode = langMap[langCode] || langCode;
            
            // Special handling for Malayalam - notify user about Hindi fallback
            if (langCode === 'ml') {
                console.info('Malayalam translation using Hindi as fallback');
            }
            
            // Use MyMemory API (free translation service) - limit text length for API
            const textToTranslate = text.length > 500 ? text.substring(0, 500) + '...' : text;
            const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=en|${apiLangCode}`);
            const data = await response.json();
            
            if (data.responseStatus === 200 && data.responseData?.translatedText) {
                // Check if translation actually happened (not just returned the same text)
                const translated = data.responseData.translatedText;
                if (translated && translated.toLowerCase() !== textToTranslate.toLowerCase()) {
                    return translated;
                }
            }
            
            // Try alternative translation service for Arabic and Malayalam
            if (langCode === 'ar' || langCode === 'ml') {
                return await tryAlternativeTranslation(textToTranslate, langCode);
            }
            
            // Fallback: return original text if translation fails
            console.warn('Translation failed for', langCode, ', using original text');
            return text;
        } catch (error) {
            console.warn('Translation error:', error);
            return text; // Return original text on error
        }
    }
    
    // Alternative translation for languages that may not work well with MyMemory
    async function tryAlternativeTranslation(text, langCode) {
        try {
            // For Arabic and Malayalam, try Google Translate API (if available)
            // This is a backup method - you may need to configure your own translation service
            console.warn(`Using fallback for ${langCode} - translation may be limited`);
            
            // For now, return a message indicating limited support
            if (langCode === 'ar') {
                return 'النص باللغة الإنجليزية: ' + text; // "Text in English: " + original text
            } else if (langCode === 'ml') {
                return 'ഇംഗ്ലീഷ് വാചകം: ' + text; // "English text: " + original text
            }
            
            return text;
        } catch (error) {
            console.warn('Alternative translation failed:', error);
            return text;
        }
    }

    function handleSpeechControl(action, sendResponse){
        try{
            console.log('[SPEECH] handleSpeechControl called with action:', action);
            console.log('[SPEECH] speechSynthesis state:', {
                speaking: window.speechSynthesis.speaking,
                pending: window.speechSynthesis.pending,
                paused: window.speechSynthesis.paused
            });
            if(action === 'stop') {
                console.log('[SPEECH] Stopping speech synthesis');
                window.speechSynthesis.cancel();
                console.log('[SPEECH] After cancel, speaking:', window.speechSynthesis.speaking);
            }
            else if(action === 'pause') window.speechSynthesis.pause();
            else if(action === 'resume') window.speechSynthesis.resume();
            sendResponse({ok:true});
        }catch(err){ 
            console.error('[SPEECH] handleSpeechControl error:', err);
            sendResponse({ok:false, error:String(err)}); 
        }
        return true;
    }

    // handle reset-font: remove inline styles applied by this extension
    function handleResetFont(sendResponse){
        try{
            const selector = 'p, li, span, a, label, input, textarea, h1, h2, h3, h4, h5, h6';
            const els = document.querySelectorAll(selector);
            for (const el of els){
                el.style.removeProperty('font-family');
                el.style.removeProperty('color');
                el.style.removeProperty('font-size');
                el.style.removeProperty('line-height');
            }
            if (document.body){
                document.body.style.removeProperty('font-family');
                document.body.style.removeProperty('color');
                document.body.style.removeProperty('font-size');
                document.body.style.removeProperty('line-height');
                document.body.style.removeProperty('background-color');
            }
            
            // Remove button enlargement styles
            const buttonScaleStyle = document.getElementById('almond-button-scale-style');
            if (buttonScaleStyle) {
                buttonScaleStyle.remove();
            }
            
            sendResponse({ok:true});
        }catch(err){ sendResponse({ok:false, error:String(err)}); }
        return true;
    }

    // zoom helper
    function handleApplyZoom(zoomLevel, sendResponse) {
        console.log('handleApplyZoom called with zoomLevel:', zoomLevel);
        try {
            const zoomValue = (zoomLevel / 100);
            console.log('Calculated zoom value:', zoomValue);
            
            if (!document.body) {
                console.error('document.body not available');
                sendResponse({ok: false, error: 'Document body not available'});
                return true;
            }
            
            // Use transform scale for better browser compatibility
            document.body.style.transform = `scale(${zoomValue})`;
            document.body.style.transformOrigin = 'top left';
            document.body.style.width = `${100/zoomValue}%`;
            
            // Also try the zoom property as fallback for some browsers
            document.body.style.zoom = zoomValue;
            
            console.log('Zoom applied successfully. Body transform:', document.body.style.transform);
            sendResponse({ok: true, appliedZoom: zoomLevel});
        } catch(err) {
            console.error('Zoom error:', err);
            sendResponse({ok: false, error: String(err)});
        }
        return true;
    }

    // speech helper
    function speakText(text, opts){
        try{
            if (!('speechSynthesis' in window)) { console.warn('speechSynthesis not available'); return; }
            const utter = new SpeechSynthesisUtterance(text);
            if (opts.rate) utter.rate = opts.rate;
            if (opts.pitch) utter.pitch = opts.pitch;
            if (opts.volume) utter.volume = opts.volume;
            if (opts.lang) utter.lang = opts.lang;
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utter);
        }catch(err){ console.error('speakText error', err); }
    }
    
    // Print handlers
    function handlePrintPage(settings, sendResponse) {
        console.log('handlePrintPage called with settings:', settings);
        try {
            // Apply print-specific styling if needed
            if (settings.printMode === 'reader') {
                applyReaderMode();
            }
            
            if (settings.removeAds) {
                hideAdvertisements();
            }
            
            // Configure print media styles
            configurePrintStyles(settings);
            
            // Open print dialog
            window.print();
            
            sendResponse({success: true});
        } catch (err) {
            console.error('Print page error:', err);
            sendResponse({success: false, error: err.message});
        }
    }
    
    function handlePrintSelection(settings, sendResponse) {
        console.log('handlePrintSelection called');
        try {
            const selection = window.getSelection();
            const selectedText = selection.toString().trim();
            
            if (!selectedText) {
                sendResponse({success: false, error: 'No text selected'});
                return;
            }
            
            // Create a new window with only selected content
            const printWindow = window.open('', '_blank');
            const selectedHtml = getSelectionHtml();
            
            const printContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Selected Content - ${document.title}</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            margin: 1in; 
                            line-height: 1.6; 
                            color: #000;
                        }
                        @media print {
                            body { margin: 0.5in; }
                        }
                    </style>
                </head>
                <body>
                    <h1>Selected Content</h1>
                    <p><strong>From:</strong> ${document.title}</p>
                    <p><strong>URL:</strong> ${window.location.href}</p>
                    <hr>
                    <div>${selectedHtml}</div>
                </body>
                </html>
            `;
            
            printWindow.document.write(printContent);
            printWindow.document.close();
            
            setTimeout(() => {
                printWindow.print();
                setTimeout(() => printWindow.close(), 1000);
            }, 500);
            
            sendResponse({success: true});
        } catch (err) {
            console.error('Print selection error:', err);
            sendResponse({success: false, error: err.message});
        }
    }
    
    function handlePrintPreview(settings, sendResponse) {
        console.log('handlePrintPreview called');
        try {
            // Apply print settings
            if (settings.printMode === 'reader') {
                applyReaderMode();
            }
            
            if (settings.removeAds) {
                hideAdvertisements();
            }
            
            configurePrintStyles(settings);
            
            // Open print dialog (browsers show preview by default)
            window.print();
            
            sendResponse({success: true});
        } catch (err) {
            console.error('Print preview error:', err);
            sendResponse({success: false, error: err.message});
        }
    }
    
    function handleSavePdf(settings, sendResponse) {
        console.log('handleSavePdf called');
        try {
            // Apply print settings for better PDF output
            if (settings.printMode === 'reader') {
                applyReaderMode();
            }
            
            if (settings.removeAds) {
                hideAdvertisements();
            }
            
            configurePrintStyles(settings);
            
            // Show PDF preparation message
            showPDFInstructions();
            
            // Prepare and open print dialog with PDF destination preference
            setTimeout(() => {
                // Try to use Chrome's print API if available
                if (globalThis.chrome && globalThis.chrome.runtime) {
                    // Send message to background to handle PDF generation
                    globalThis.chrome.runtime.sendMessage({
                        action: 'generate-pdf',
                        url: globalThis.location.href
                    }, (response) => {
                        if (!response || response.error) {
                            // Fallback to regular print dialog
                            openPrintDialogForPDF();
                        }
                    });
                } else {
                    // Fallback to regular print dialog
                    openPrintDialogForPDF();
                }
            }, 1000);
            
            sendResponse({success: true});
        } catch (err) {
            console.error('Save PDF error:', err);
            sendResponse({success: false, error: err.message});
        }
    }
    
    // Open print dialog optimized for PDF generation
    function openPrintDialogForPDF() {
        // Set document title for PDF filename
        const originalTitle = document.title;
        const cleanTitle = document.title.replace(/[^\w\s-]/g, '').trim() || 'webpage';
        document.title = cleanTitle;
        
        // Open print dialog
        globalThis.print();
        
        // Restore original title after a delay
        setTimeout(() => {
            document.title = originalTitle;
        }, 2000);
        
        // Try to auto-select PDF destination if print dialog supports it
        setTimeout(() => {
            try {
                // Look for Chrome's print preview elements
                const printPreview = document.querySelector('print-preview-app');
                if (printPreview && printPreview.shadowRoot) {
                    const destinationSettings = printPreview.shadowRoot.querySelector('print-preview-destination-settings');
                    if (destinationSettings) {
                        // Try to trigger PDF selection
                        const pdfOption = destinationSettings.shadowRoot?.querySelector('[data-destination-id*="Save"]');
                        if (pdfOption) {
                            pdfOption.click();
                        }
                    }
                }
            } catch (e) {
                // Silently handle any errors in auto-selection
                console.log('Auto PDF selection not available:', e.message);
            }
        }, 1500);
    }
    
    // Show PDF instructions and attempt to set PDF destination
    function showPDFInstructions() {
        // Remove any existing instructions
        const existing = document.getElementById('almond-pdf-instructions');
        if (existing) existing.remove();
        
        // Create success notification
        const instructionDiv = document.createElement('div');
        instructionDiv.id = 'almond-pdf-instructions';
        instructionDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #fff;
            border: 2px solid #4CAF50;
            border-radius: 8px;
            padding: 15px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            max-width: 300px;
            font-family: Arial, sans-serif;
            font-size: 14px;
        `;
        instructionDiv.innerHTML = `
            <div style="color: #4CAF50; font-weight: bold; margin-bottom: 10px;">
                PDF Destination Set!
            </div>
            <div style="margin-bottom: 10px;">
                Destination: <strong>"Save as PDF"</strong><br>
                The print dialog will open shortly.<br>
                Just choose where to save and click "Save"!
            </div>
            <button onclick="this.parentElement.remove()" 
                    style="background: #4CAF50; color: white; border: none; 
                           padding: 8px 12px; border-radius: 4px; cursor: pointer;">
                Perfect!
            </button>
        `;
        document.body.appendChild(instructionDiv);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            const popup = document.getElementById('almond-pdf-instructions');
            if (popup) popup.remove();
        }, 10000);
        
        // Try to set up print media queries for better PDF output
        const printStyle = document.createElement('style');
        printStyle.id = 'almond-pdf-styles';
        printStyle.textContent = `
            @media print {
                @page { 
                    margin: 1in;
                    size: A4;
                }
                body { 
                    font-size: 12pt;
                    line-height: 1.4;
                    color: #000 !important;
                    background: #fff !important;
                }
                .no-print, 
                nav, 
                header[role="banner"],
                footer[role="contentinfo"],
                .advertisement,
                .ads,
                .sidebar,
                .popup,
                .modal,
                #almond-nav,
                .almond-panel,
                [id*="almond"],
                [class*="almond"] {
                    display: none !important;
                }
                img {
                    max-width: 100% !important;
                    height: auto !important;
                }
            }
        `;
        document.head.appendChild(printStyle);
        
        // Clean up print styles after PDF generation
        setTimeout(() => {
            const styles = document.getElementById('almond-pdf-styles');
            if (styles) styles.remove();
        }, 30000);
    }
    
    function handleGetPageInfo(sendResponse) {
        console.log('handleGetPageInfo called');
        try {
            const text = document.body.innerText || '';
            const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
            
            sendResponse({
                success: true,
                wordCount: wordCount,
                title: document.title,
                url: window.location.href
            });
        } catch (err) {
            console.error('Get page info error:', err);
            sendResponse({success: false, error: err.message});
        }
    }
    
    // Print utility functions
    function applyReaderMode() {
        // Hide navigation, ads, sidebars for clean printing
        const elementsToHide = document.querySelectorAll([
            'nav', 'header', 'footer', 'aside', '.sidebar', '.navigation',
            '.ads', '.advertisement', '.ad-container', '.social-share',
            '.comments', '.related-posts', '.popup', '.modal'
        ].join(', '));
        
        elementsToHide.forEach(el => {
            el.style.display = 'none';
        });
        
        // Apply clean typography
        const mainContent = document.querySelector('main, article, .content, .post, #main');
        if (mainContent) {
            mainContent.style.maxWidth = 'none';
            mainContent.style.margin = '0';
            mainContent.style.padding = '20px';
        }
    }
    
    function hideAdvertisements() {
        const adSelectors = [
            '.ad', '.ads', '.advertisement', '.google-ad', '.adsense',
            '[id*="ad-"]', '[class*="ad-"]', '[id*="ads"]', '[class*="ads"]',
            'iframe[src*="googlesyndication"]', 'iframe[src*="doubleclick"]'
        ];
        
        adSelectors.forEach(selector => {
            try {
                const ads = document.querySelectorAll(selector);
                ads.forEach(ad => ad.style.display = 'none');
            } catch (e) {
                // Ignore invalid selectors
            }
        });
    }
    
    function configurePrintStyles(settings) {
        // Create or update print stylesheet
        let printStyle = document.getElementById('almond-print-styles');
        if (!printStyle) {
            printStyle = document.createElement('style');
            printStyle.id = 'almond-print-styles';
            printStyle.type = 'text/css';
            document.head.appendChild(printStyle);
        }
        
        let css = `
            @media print {
                * {
                    -webkit-print-color-adjust: ${settings.printBackgrounds ? 'exact' : 'economy'} !important;
                    color-adjust: ${settings.printBackgrounds ? 'exact' : 'economy'} !important;
                }
                
                @page {
                    size: ${settings.paperSize} ${settings.orientation};
                    margin: ${getMarginValue(settings.margins)};
                }
                
                body {
                    font-size: 12pt !important;
                    line-height: 1.4 !important;
                }
                
                h1, h2, h3, h4, h5, h6 {
                    page-break-after: avoid;
                }
                
                p, li {
                    page-break-inside: avoid;
                }
                
                img {
                    max-width: 100% !important;
                    page-break-inside: avoid;
                }
                
                table {
                    page-break-inside: auto;
                }
                
                tr {
                    page-break-inside: avoid;
                    page-break-after: auto;
                }
                
                /* Hide extension elements */
                #almond-nav,
                .almond-panel,
                [id*="almond"],
                [class*="almond"] {
                    display: none !important;
                }
            }
        `;
        
        if (!settings.printHeaders) {
            css += `
                @media print {
                    @page { 
                        margin-top: 0.5in; 
                        margin-bottom: 0.5in; 
                    }
                }
            `;
        }
        
        printStyle.textContent = css;
    }
    
    function getMarginValue(marginType) {
        switch (marginType) {
            case 'minimum': return '0.25in';
            case 'none': return '0';
            default: return '1in';
        }
    }
    
    function getSelectionHtml() {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return '';
        
        const range = selection.getRangeAt(0);
        const contents = range.cloneContents();
        const div = document.createElement('div');
        div.appendChild(contents);
        return div.innerHTML;
    }
    
    // Simple scam detection handler
    function handleCheckScams(sendResponse) {
        try {
            console.log('[PROTECTION] Checking page for scams');
            
            const pageText = document.body.innerText.toLowerCase();
            const pageTitle = document.title.toLowerCase();
            const url = globalThis.location.href.toLowerCase();
            
            // Simple scam indicators
            const scamWords = [
                'congratulations', 'you have won', 'urgent action required', 
                'verify your account', 'suspended account', 'click here now',
                'limited time offer', 'act now', 'free money', 'inheritance',
                'nigerian prince', 'tax refund', 'irs', 'social security'
            ];
            
            const foundWarnings = [];
            
            // Check page content for scam words
            scamWords.forEach(word => {
                if (pageText.includes(word) || pageTitle.includes(word)) {
                    foundWarnings.push(`WARNING: Suspicious phrase: "${word}"`);
                }
            });
            
            // Check for suspicious links
            const links = document.querySelectorAll('a');
            let suspiciousLinks = 0;
            links.forEach(link => {
                const href = link.href?.toLowerCase() || '';
                if (href.includes('bit.ly') || href.includes('tinyurl') || href.includes('t.co')) {
                    suspiciousLinks++;
                }
            });
            
            if (suspiciousLinks > 5) {
                foundWarnings.push('WARNING: Many shortened links found');
            }
            
            // Generate result
            let result;
            if (foundWarnings.length > 0) {
                result = `ALERT: Potential scam indicators found:\n\n${foundWarnings.join('\n')}\n\nSafety tips:\n• Be cautious with personal information\n• Verify sender through other means\n• When in doubt, don't click or respond`;
            } else {
                result = `No obvious scam indicators found\n\nStay vigilant:\n• Always verify who you're dealing with\n• Be careful with personal information\n• Trust your instincts`;
            }
            
            sendResponse({ success: true, result: result });
            
        } catch (err) {
            console.error('[PROTECTION] Scam check error:', err);
            sendResponse({ success: false, result: 'Could not check this page for scams' });
        }
    }
    
    // Simple ad blocker handler
    function handleBlockAds(sendResponse) {
        try {
            console.log('[PROTECTION] Blocking ads');
            
            // Simple ad selectors (common ad containers)
            const adSelectors = [
                '[class*="ad"]', '[id*="ad"]', '[class*="banner"]', '[id*="banner"]',
                '[class*="sidebar"]', '[class*="popup"]', '[class*="modal"]',
                'iframe[src*="ads"]', 'iframe[src*="doubleclick"]', 'iframe[src*="googlesyndication"]',
                '.advertisement', '.ad-container', '.ad-banner', '.ad-space'
            ];
            
            let hiddenCount = 0;
            
            adSelectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    // Don't hide if it's clearly content
                    const text = element.textContent?.toLowerCase() || '';
                    if (text.includes('article') || text.includes('content') || text.includes('main')) {
                        return;
                    }
                    
                    // Hide the element
                    element.style.display = 'none';
                    element.setAttribute('data-almond-hidden', 'true');
                    hiddenCount++;
                });
            });
            
            const result = hiddenCount > 0 
                ? `Hidden ${hiddenCount} potential ads` 
                : 'No obvious ads found to hide';
            
            sendResponse({ success: true, result: result });
            
        } catch (err) {
            console.error('[PROTECTION] Ad blocking error:', err);
            sendResponse({ success: false, result: 'Could not block ads on this page' });
        }
    }
    
    // Show speech feedback to user
    function showSpeechFeedback(isSelection, textLength) {
        // Remove any existing feedback
        const existing = document.getElementById('almond-speech-feedback');
        if (existing) existing.remove();

        // Create feedback notification
        const feedbackDiv = document.createElement('div');
        feedbackDiv.id = 'almond-speech-feedback';
        feedbackDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #007bff;
            color: white;
            border-radius: 8px;
            padding: 12px 16px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            max-width: 300px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            animation: slideIn 0.3s ease-out;
        `;

        const contentType = isSelection ? 'selected text' : 'page content';
        const charCount = textLength.toLocaleString();

        feedbackDiv.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 4px;">
                🔊 Speaking ${contentType}
            </div>
            <div style="font-size: 12px; opacity: 0.9;">
                ${charCount} characters
            </div>
        `;

        // Add slide-in animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(feedbackDiv);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            const feedback = document.getElementById('almond-speech-feedback');
            if (feedback) {
                feedback.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => feedback.remove(), 300);
            }
        }, 3000);
    }
    
})();
