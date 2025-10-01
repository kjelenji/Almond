// popup.js - control zoom on the active tab (fixed executeScript usage)
(function(){
	const DEFAULT = 100; // percent
	const slider = document.getElementById('zoom-slider');
	const label = document.getElementById('zoom-label');
	const btnIn = document.getElementById('zoom-in');
	const btnOut = document.getElementById('zoom-out');
	const btnReset = document.getElementById('zoom-reset');
	const zoomToggle = document.getElementById('zoom-toggle');
	const zoomPanel = document.getElementById('zoom-panel');

	if(!slider) return;

	function clamp(v){ return Math.max(10, Math.min(500, Number(v) || DEFAULT)); }

	function readSaved(cb){
		if (chrome?.storage?.sync) {
			chrome.storage.sync.get(['almondZoom'], (items)=>{
				const v = items.almondZoom ?? DEFAULT;
				cb(clamp(v));
			});
		} else {
			try{
				const v = localStorage.getItem('almondZoom');
				cb(clamp(v));
			}catch(e){
				console.warn('Failed to read localStorage almondZoom', e);
				cb(DEFAULT);
			}
		}
	}

	function save(v){
		if (chrome?.storage?.sync) {
			chrome.storage.sync.set({almondZoom: v});
		} else {
			try{
				localStorage.setItem('almondZoom', String(v));
			}catch(e){
				console.warn('Failed to save almondZoom to localStorage', e);
			}
		}
	}

	// inject function executed in page context
	function applyToActiveTab(percent){
		percent = clamp(percent);

		// update popup UI and save immediately
		slider.value = String(Math.round(percent));
		label.textContent = `${Math.round(percent)}%`;
		save(percent);

		// query the active tab
		chrome.tabs.query({active:true, currentWindow:true}, (tabs)=>{
			const tabId = tabs?.[0]?.id;
			if (!tabId) {
				console.warn('No active tab found');
				return;
			}

			// Prefer chrome.scripting.executeScript with a function + args
			if (chrome?.scripting?.executeScript) {
				chrome.scripting.executeScript({
					target: {tabId},
					func: (p)=>{
						const percent = p;
						const scale = percent / 100;
						try {
							// Prefer CSS zoom on root element if supported
							if (document.documentElement && ('zoom' in document.documentElement.style)){
										document.documentElement.style.zoom = scale;
										if(document.body){ document.body.style.transform = ''; }
									} else if (document.body){
										// fallback to scaling body (no width adjustment)
										if(document.documentElement) document.documentElement.style.zoom = '';
										document.body.style.transformOrigin = '0 0';
										document.body.style.transform = 'scale(' + scale + ')';
									}
							return {ok:true, percent};
						} catch(e){
							return {ok:false, error: String(e)};
						}
					},
					args: [percent],
					world: 'MAIN'
					}).then((results)=>{
					// results is an array with result objects from the injected function
					// inspect first result for errors
					try{
						const res = results?.[0]?.result;
						if(res && res.ok===false) console.warn('Injected script reported error:', res.error);
					}catch(e){ console.warn('Could not read executeScript results', e); }
				}).catch(err=>{
					console.error('scripting.executeScript failed', err);
				});

			} else if (chrome?.tabs?.setZoom) {
				// as a fallback, try native tabs.setZoom (requires tabs permission)
				const zoomFactor = percent / 100;
				chrome.tabs.setZoom(tabId, zoomFactor, ()=>{
					if(chrome.runtime.lastError) console.error('tabs.setZoom error', chrome.runtime.lastError);
				});
			} else {
				console.warn('No supported API available to apply page zoom');
			}
		});
	}

	// init
	readSaved((v)=>{
		slider.value = String(Math.round(v));
		label.textContent = `${Math.round(v)}%`;
	});

	btnIn.addEventListener('click', ()=> applyToActiveTab(Number(slider.value) + 10));
	btnOut.addEventListener('click', ()=> applyToActiveTab(Number(slider.value) - 10));
	btnReset.addEventListener('click', ()=> applyToActiveTab(DEFAULT));
	slider.addEventListener('input', (e)=> applyToActiveTab(e.target.value));

	// Toggle panel
	function openPanel(){
		if(zoomPanel){ zoomPanel.hidden = false; zoomToggle?.setAttribute('aria-expanded','true'); }
	}
	function closePanel(){
		if(zoomPanel){ zoomPanel.hidden = true; zoomToggle?.setAttribute('aria-expanded','false'); }
	}
	zoomToggle?.addEventListener('click', (e)=>{
		if(!zoomPanel) return;
		if(zoomPanel.hidden) openPanel(); else closePanel();
		e.stopPropagation();
	});

	// close when clicking outside or pressing Escape
	document.addEventListener('click', (e)=>{ if(zoomPanel && !zoomPanel.hidden) closePanel(); });
	document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closePanel(); });

	// keyboard shortcuts
	document.addEventListener('keydown', (e)=>{
		if(e.key === '+' || e.key === '=') { applyToActiveTab(Number(slider.value) + 10); e.preventDefault(); }
		if(e.key === '-') { applyToActiveTab(Number(slider.value) - 10); e.preventDefault(); }
		if(e.key === '0') { applyToActiveTab(DEFAULT); e.preventDefault(); }
	});

})();
