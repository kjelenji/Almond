//add a font template
//general fonts that are suitable for older adults or elders
//AVOID ALL CAPS
//AVOID USING MORE THAN 2 OR MORE TYPEFACES IN ONE DOCUMENT
//REMOVE PHOTO AND PATTERENED BACKGROUND WITH TEXT OVER IT
//font size: 14 point (min 16px)
//font family: serif/sans serif, Timew New Roman, Arial, Garamond, Calibri
//Background color & font color: (DARK TEXT AND LIGHT BACKGROUND) black font on white, black font on light yellow, dark blue font on light blue
//spacing: 1.5 spacing, no justified text + 1.5 left leading
(function() {
// debug: indicate script loaded in popup
console.debug?.('font.js loaded in popup');

// Initialize font controls - called by popup.js
window.initializeFontControls = function() {
    console.debug?.('Initializing font controls');
    initFontPanel();
};
// Simple font selector for the active tab. Replaces broken logic which ran inside the popup
// (that only affected the popup DOM) with a script injected into the page.

const DEFAULT_FONT = {
	family: 'Arial, sans-serif',
	color: '#000000',
	size: '16px',
	lineHeight: '1.5',
	backgroundColor: '#ffffff',
	buttonScale: 100
};

// helper: convert points to pixels (1pt = 1.333333px)
function ptToPx(pt){ return Math.round((Number(pt) || 16) * 1.333333); }
function pxToPt(px){ return Math.round((Number(String(px).replace('px','')) || 16) / 1.333333); }

function saveFont(obj){
	try{
		if (chrome?.storage?.sync) {
			chrome.storage.sync.set({almondFont: obj});
		} else {
			localStorage.setItem('almondFont', JSON.stringify(obj));
		}
	}catch(e){ console.warn('Failed to save almondFont', e); }
}

function readSaved(cb){
	if (chrome?.storage?.sync) {
		chrome.storage.sync.get(['almondFont'], (items)=>{
			const v = items.almondFont ?? DEFAULT_FONT;
			cb(v);
		});
	} else {
		try{
			const raw = localStorage.getItem('almondFont');
			cb(raw ? JSON.parse(raw) : DEFAULT_FONT);
		}catch(e){ console.warn('Failed to read almondFont from localStorage', e); cb(DEFAULT_FONT); }
	}
}

function clearSaved(){
	try{
		if (chrome?.storage?.sync) chrome.storage.sync.remove('almondFont');
		else localStorage.removeItem('almondFont');
	}catch(e){ console.warn('Failed to clear almondFont', e); }
}

// apply a font object to the active tab page using scripting.executeScript
function applyToActiveTab(fontObj){
	// persist
	saveFont(fontObj);

	console.debug?.('applyToActiveTab (sendMessage)', fontObj);

	chrome.tabs.query({active:true, currentWindow:true}, (tabs)=>{
		const tabId = tabs?.[0]?.id;
		console.debug?.('Found tabId', tabId);
		if (!tabId) return console.warn('No active tab to apply font to');

		// send a message to the content script running on the page
		chrome.tabs.sendMessage(tabId, {type:'apply-font', font: fontObj, buttonScale: fontObj.buttonScale || 100}, (resp)=>{
			if (chrome.runtime?.lastError) {
				// Likely no content script is available on this page or host permissions missing
				console.error('sendMessage error', chrome.runtime.lastError);
				return;
			}
			console.debug('sendMessage response', resp);
		});
	});
}

function initFontPanel() {
console.log('initFontPanel called');
// attach handlers only if elements exist
// Map buttons to the labels in popup.html
const font1 = document.getElementById('font1');
const font2 = document.getElementById('font2');
const font3 = document.getElementById('font3');
const font4 = document.getElementById('font4');
const fontReset = document.getElementById('font-reset');
const fontSizeSlider = document.getElementById('font-size-slider');
const fontSizeLabel = document.getElementById('font-size-label');
const lineHeightSlider = document.getElementById('line-height-slider');
const lineHeightLabel = document.getElementById('line-height-label');
const buttonSizeSlider = document.getElementById('button-size-slider');
const buttonSizeLabel = document.getElementById('button-size-label');
const bgLightYellow = document.getElementById('bg-light-yellow');
const bgLightPurple = document.getElementById('bg-light-purple');
const bgLightBlue = document.getElementById('bg-light-blue');
const bgWhite = document.getElementById('bg-white');

console.log('Font elements found:', {
    font1: !!font1, font2: !!font2, font3: !!font3, font4: !!font4,
    fontReset: !!fontReset, fontSizeSlider: !!fontSizeSlider,
    buttonSizeSlider: !!buttonSizeSlider, buttonSizeLabel: !!buttonSizeLabel,
    bgLightYellow: !!bgLightYellow, bgLightPurple: !!bgLightPurple,
    bgLightBlue: !!bgLightBlue, bgWhite: !!bgWhite
});

font1?.addEventListener('click', ()=>{
	const sizePt = 16;
	if(fontSizeSlider) { fontSizeSlider.value = String(sizePt); fontSizeLabel.textContent = `${sizePt}pt`; }
	if(lineHeightSlider) { lineHeightSlider.value = String(Math.round(1.5 * 10)); lineHeightLabel.textContent = '1.5'; }
	readSaved((saved) => {
		const backgroundColor = saved.backgroundColor || DEFAULT_FONT.backgroundColor;
		const buttonScale = saved.buttonScale || DEFAULT_FONT.buttonScale;
		applyToActiveTab({family: 'Times New Roman, serif', color:'#000000', size: ptToPx(sizePt) + 'px', lineHeight:'1.5', backgroundColor, buttonScale});
	});
});
font2?.addEventListener('click', ()=>{
	const sizePt = 16;
	if(fontSizeSlider) { fontSizeSlider.value = String(sizePt); fontSizeLabel.textContent = `${sizePt}pt`; }
	if(lineHeightSlider) { lineHeightSlider.value = String(Math.round(1.5 * 10)); lineHeightLabel.textContent = '1.5'; }
	readSaved((saved) => {
		const backgroundColor = saved.backgroundColor || DEFAULT_FONT.backgroundColor;
		const buttonScale = saved.buttonScale || DEFAULT_FONT.buttonScale;
		applyToActiveTab({family: 'Arial, sans-serif', color:'#000000', size: ptToPx(sizePt) + 'px', lineHeight:'1.5', backgroundColor, buttonScale});
	});
});
font3?.addEventListener('click', ()=>{
	const sizePt = 16;
	if(fontSizeSlider) { fontSizeSlider.value = String(sizePt); fontSizeLabel.textContent = `${sizePt}pt`; }
	if(lineHeightSlider) { lineHeightSlider.value = String(Math.round(1.5 * 10)); lineHeightLabel.textContent = '1.5'; }
	readSaved((saved) => {
		const backgroundColor = saved.backgroundColor || DEFAULT_FONT.backgroundColor;
		const buttonScale = saved.buttonScale || DEFAULT_FONT.buttonScale;
		applyToActiveTab({family: 'Calibri, sans-serif', color:'#000000', size: ptToPx(sizePt) + 'px', lineHeight:'1.5', backgroundColor, buttonScale});
	});
});
font4?.addEventListener('click', ()=>{
	const sizePt = 16;
	if(fontSizeSlider) { fontSizeSlider.value = String(sizePt); fontSizeLabel.textContent = `${sizePt}pt`; }
	if(lineHeightSlider) { lineHeightSlider.value = String(Math.round(1.5 * 10)); lineHeightLabel.textContent = '1.5'; }
	readSaved((saved) => {
		const backgroundColor = saved.backgroundColor || DEFAULT_FONT.backgroundColor;
		const buttonScale = saved.buttonScale || DEFAULT_FONT.buttonScale;
		applyToActiveTab({family: 'Garamond, serif', color:'#000000', size: ptToPx(sizePt) + 'px', lineHeight:'1.5', backgroundColor, buttonScale});
	});
});

fontReset?.addEventListener('click', ()=>{
	// clear saved font
	clearSaved();
	// send reset to active tab
	chrome.tabs.query({active:true, currentWindow:true}, (tabs)=>{
		const tabId = tabs?.[0]?.id;
		if(!tabId) return;
		chrome.tabs.sendMessage(tabId, {type:'reset-font'}, (resp)=>{
			if (chrome.runtime?.lastError) console.error('reset-font sendMessage error', chrome.runtime.lastError);
			else console.debug('reset-font response', resp);
		});
	});
});

// Background color button handlers
function applyBackgroundColor(backgroundColor) {
	readSaved((saved) => {
		// Automatically set appropriate font color based on background
		let fontColor = saved.color || DEFAULT_FONT.color;
		
		// For light backgrounds, use appropriate text color for better readability
		if (backgroundColor === '#fffacd' || // light yellow
			backgroundColor === '#d4d4f9e5') { // light purple
			fontColor = '#333333'; // dark gray for yellow and purple
		} else if (backgroundColor === '#bcddeaff' || // light blue
				   backgroundColor === '#ffffff') { // white
			fontColor = '#000000'; // black for blue and white
		}
		
		const fontObj = {
			family: saved.family || DEFAULT_FONT.family,
			color: fontColor,
			size: saved.size || DEFAULT_FONT.size,
			lineHeight: saved.lineHeight || DEFAULT_FONT.lineHeight,
			backgroundColor: backgroundColor,
			buttonScale: saved.buttonScale || DEFAULT_FONT.buttonScale
		};
		applyToActiveTab(fontObj);
	});
}

bgLightYellow?.addEventListener('click', () => {
	applyBackgroundColor('#fffacd'); // light yellow
});

bgLightPurple?.addEventListener('click', () => {
	applyBackgroundColor('#d4d4f9e5'); // light pastel purple
});

bgLightBlue?.addEventListener('click', () => {
	applyBackgroundColor('#bcddeaff'); // light sky blue
});

bgWhite?.addEventListener('click', () => {
	applyBackgroundColor('#ffffff'); // white
});

// Font slider handlers
if(fontSizeSlider){
	fontSizeLabel.textContent = `${fontSizeSlider.value}pt`;
	fontSizeSlider.addEventListener('input', (e)=>{
		const pt = Math.max(12, Number(e.target.value) || 12);
		fontSizeLabel.textContent = `${pt}pt`;
		// apply current font family with updated size
		readSaved((saved)=>{
			const family = saved.family || DEFAULT_FONT.family;
			const color = saved.color || DEFAULT_FONT.color;
			const backgroundColor = saved.backgroundColor || DEFAULT_FONT.backgroundColor;
			const buttonScale = saved.buttonScale || DEFAULT_FONT.buttonScale;
			const lineH = (lineHeightSlider ? (Number(lineHeightSlider.value)/10) : Number.parseFloat(DEFAULT_FONT.lineHeight));
			const px = ptToPx(pt) + 'px';
			applyToActiveTab({family, color, size: px, lineHeight: String(lineH), backgroundColor, buttonScale});
		});
	});
}

if(lineHeightSlider){
	// slider stores percent * 10 (e.g., 15 => 1.5)
	lineHeightLabel.textContent = (Number(lineHeightSlider.value)/10).toFixed(1);
	lineHeightSlider.addEventListener('input', (e)=>{
		const lh = Number(e.target.value)/10;
		lineHeightLabel.textContent = lh.toFixed(1);
		readSaved((saved)=>{
			const family = saved.family || DEFAULT_FONT.family;
			const color = saved.color || DEFAULT_FONT.color;
			const backgroundColor = saved.backgroundColor || DEFAULT_FONT.backgroundColor;
			const buttonScale = saved.buttonScale || DEFAULT_FONT.buttonScale;
			const pt = (fontSizeSlider ? Number(fontSizeSlider.value) : 16);
			const px = ptToPx(pt) + 'px';
			applyToActiveTab({family, color, size: px, lineHeight: String(lh), backgroundColor, buttonScale});
		});
	});
}

// Button size slider handler
if(buttonSizeSlider){
	buttonSizeLabel.textContent = `${buttonSizeSlider.value}%`;
	buttonSizeSlider.addEventListener('input', (e)=>{
		const scale = Number(e.target.value) || 100;
		buttonSizeLabel.textContent = `${scale}%`;
		// apply current settings with updated button scale
		readSaved((saved)=>{
			const family = saved.family || DEFAULT_FONT.family;
			const color = saved.color || DEFAULT_FONT.color;
			const backgroundColor = saved.backgroundColor || DEFAULT_FONT.backgroundColor;
			const lineH = saved.lineHeight || DEFAULT_FONT.lineHeight;
			const size = saved.size || DEFAULT_FONT.size;
			applyToActiveTab({family, color, size, lineHeight: lineH, backgroundColor, buttonScale: scale});
		});
	});
}

// Old panel toggle code removed - now handled by popup.js

// init: if a saved font exists, enable a quick apply button (optional)
readSaved((font)=>{
	// initialize sliders from saved font
	if(fontSizeSlider && font.size){
		const pt = pxToPt(font.size);
		fontSizeSlider.value = String(Math.max(12, pt));
		fontSizeLabel.textContent = `${Math.max(12, pt)}pt`;
	}
	if(lineHeightSlider && font.lineHeight){
		// stored lineHeight is like '1.5'
		const lh = Number(font.lineHeight) || 1.5;
		lineHeightSlider.value = String(Math.round(lh * 10));
		lineHeightLabel.textContent = lh.toFixed(1);
	}
	if(buttonSizeSlider && font.buttonScale){
		const scale = Number(font.buttonScale) || 100;
		buttonSizeSlider.value = String(scale);
		buttonSizeLabel.textContent = `${scale}%`;
	}
});

} // end initFontPanel

})();
