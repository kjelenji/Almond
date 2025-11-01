// weather.js - Weather functionality for the Almond extension

(function() {
    'use strict';
    
    console.log('[WEATHER] weather.js loaded successfully');
    
    // Weather API configuration
    const WEATHER_API_KEY = 'demo_key'; // Using demo/free service - can be replaced with real API key
    const WEATHER_API_BASE = 'https://api.openweathermap.org/data/2.5/weather';
    
    // Alternative free weather service (no API key required)
    const FREE_WEATHER_API = 'https://wttr.in';
    
    let currentUnit = 'celsius';
    
    // Initialize weather controls - called by popup.js
    window.initializeWeatherControls = function() {
        console.log('[WEATHER] Initializing weather panel');
        
        // Get weather control elements
        const locationInput = document.getElementById('location-input');
        const getWeatherBtn = document.getElementById('get-weather-btn');
        const getLocationBtn = document.getElementById('get-location-btn');
        const autoLocationCheckbox = document.getElementById('weather-auto-location');
        const unitRadios = document.querySelectorAll('input[name="weather-unit"]');
        
        // Debug element finding
        console.log('[WEATHER] Elements found:', {
            locationInput: !!locationInput,
            getWeatherBtn: !!getWeatherBtn,
            getLocationBtn: !!getLocationBtn,
            autoLocationCheckbox: !!autoLocationCheckbox,
            unitRadios: unitRadios.length
        });
        
        if (!locationInput || !getWeatherBtn) {
            console.error('[WEATHER] Missing weather controls in DOM');
            return;
        }
        
        // Set up event listeners
        getWeatherBtn.addEventListener('click', handleGetWeather);
        
        if (getLocationBtn) {
            getLocationBtn.addEventListener('click', getCurrentLocationWeather);
        }
        
        locationInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleGetWeather();
            }
        });
        
        autoLocationCheckbox?.addEventListener('change', function() {
            if (this.checked) {
                getCurrentLocationWeather();
            }
        });
        
        unitRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                currentUnit = this.value;
                // Refresh weather if we have data
                const weatherContent = document.getElementById('weather-content');
                if (weatherContent && !weatherContent.hidden) {
                    const location = document.getElementById('weather-city').textContent;
                    if (location !== '--') {
                        getWeatherData(location);
                    }
                }
            });
        });
        
        // Load saved settings
        loadWeatherSettings();
        
        console.log('[WEATHER] Weather panel initialized successfully');
    };
    
    // Handle get weather button click
    function handleGetWeather() {
        console.log('[WEATHER] Get weather button clicked');
        
        const locationInput = document.getElementById('location-input');
        const location = locationInput.value.trim();
        
        if (!location) {
            showWeatherError('Please enter a location');
            return;
        }
        
        getWeatherData(location);
    }
    
    // Get current location using geolocation API
    function getCurrentLocationWeather() {
        console.log('[WEATHER] Getting current location weather');
        
        if (!navigator.geolocation) {
            showWeatherError('Geolocation is not supported by this browser');
            return;
        }
        
        showWeatherLoading();
        
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                console.log('[WEATHER] Got coordinates:', lat, lon);
                getWeatherByCoordinates(lat, lon);
            },
            function(error) {
                console.error('[WEATHER] Geolocation error:', error);
                showWeatherError('Unable to get your location: ' + error.message);
            }
        );
    }
    
    // Get weather data by coordinates
    function getWeatherByCoordinates(lat, lon) {
        console.log('[WEATHER] Getting weather by coordinates:', lat, lon);
        
        // Use wttr.in service for coordinate-based weather
        const url = `${FREE_WEATHER_API}/${lat},${lon}?format=j1`;
        
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Weather service unavailable');
                }
                return response.json();
            })
            .then(data => {
                console.log('[WEATHER] Weather data received:', data);
                displayWeatherData(data, 'wttr');
                // Update location input with the fetched location
                const locationInput = document.getElementById('location-input');
                if (locationInput && data.nearest_area && data.nearest_area[0]) {
                    const location = data.nearest_area[0];
                    locationInput.value = location.areaName[0].value + ', ' + location.country[0].value;
                }
            })
            .catch(error => {
                console.error('[WEATHER] Error fetching weather:', error);
                showWeatherError('Unable to fetch weather data. Please try entering a city name manually.');
            });
    }
    
    // Get weather data by location name
    function getWeatherData(location) {
        console.log('[WEATHER] Getting weather for location:', location);
        
        showWeatherLoading();
        
        // Use wttr.in service (free, no API key required)
        const url = `${FREE_WEATHER_API}/${encodeURIComponent(location)}?format=j1`;
        
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Weather service unavailable');
                }
                return response.json();
            })
            .then(data => {
                console.log('[WEATHER] Weather data received:', data);
                displayWeatherData(data, 'wttr');
                saveLocationToSettings(location);
            })
            .catch(error => {
                console.error('[WEATHER] Error fetching weather:', error);
                // Try alternative approach with a simple weather display
                showWeatherError('Unable to fetch weather data. Try a different location.');
            });
    }
    
    // Display weather data
    function displayWeatherData(data, source) {
        console.log('[WEATHER] Displaying weather data from:', source);
        
        try {
            let weatherInfo;
            
            if (source === 'wttr') {
                // Parse wttr.in JSON format
                const current = data.current_condition[0];
                const location = data.nearest_area[0];
                
                weatherInfo = {
                    temperature: Math.round(currentUnit === 'fahrenheit' ? 
                        (parseFloat(current.temp_C) * 9/5 + 32) : 
                        parseFloat(current.temp_C)),
                    feelsLike: Math.round(currentUnit === 'fahrenheit' ? 
                        (parseFloat(current.FeelsLikeC) * 9/5 + 32) : 
                        parseFloat(current.FeelsLikeC)),
                    description: current.weatherDesc[0].value,
                    humidity: current.humidity,
                    windSpeed: Math.round(parseFloat(current.windspeedKmph)),
                    pressure: current.pressure,
                    city: location.areaName[0].value + ', ' + location.country[0].value
                };
            }
            
            // Update UI elements
            document.getElementById('weather-temperature').textContent = weatherInfo.temperature;
            document.getElementById('weather-unit').textContent = currentUnit === 'fahrenheit' ? 'F' : 'C';
            document.getElementById('weather-description').textContent = weatherInfo.description;
            document.getElementById('weather-feels-like').textContent = weatherInfo.feelsLike;
            document.getElementById('weather-humidity').textContent = weatherInfo.humidity;
            document.getElementById('weather-wind').textContent = weatherInfo.windSpeed;
            document.getElementById('weather-pressure').textContent = weatherInfo.pressure;
            document.getElementById('weather-city').textContent = weatherInfo.city;
            
            // Show weather content
            hideWeatherLoading();
            hideWeatherError();
            showWeatherContent();
            
            console.log('[WEATHER] Weather display updated successfully');
            
        } catch (error) {
            console.error('[WEATHER] Error parsing weather data:', error);
            showWeatherError('Error displaying weather data');
        }
    }
    
    // UI helper functions
    function showWeatherLoading() {
        document.getElementById('weather-loading').hidden = false;
        document.getElementById('weather-error').hidden = true;
        document.getElementById('weather-content').hidden = true;
    }
    
    function hideWeatherLoading() {
        document.getElementById('weather-loading').hidden = true;
    }
    
    function showWeatherError(message) {
        hideWeatherLoading();
        document.getElementById('weather-error').textContent = message;
        document.getElementById('weather-error').hidden = false;
        document.getElementById('weather-content').hidden = true;
    }
    
    function hideWeatherError() {
        document.getElementById('weather-error').hidden = true;
    }
    
    function showWeatherContent() {
        document.getElementById('weather-content').hidden = false;
    }
    
    // Settings functions
    function saveLocationToSettings(location) {
        try {
            if (chrome?.storage?.sync) {
                chrome.storage.sync.set({weatherLocation: location});
            } else {
                localStorage.setItem('weatherLocation', location);
            }
        } catch (error) {
            console.warn('[WEATHER] Failed to save location:', error);
        }
    }
    
    function loadWeatherSettings() {
        try {
            if (chrome?.storage?.sync) {
                chrome.storage.sync.get(['weatherLocation'], (items) => {
                    if (items.weatherLocation) {
                        document.getElementById('location-input').value = items.weatherLocation;
                    }
                });
            } else {
                const savedLocation = localStorage.getItem('weatherLocation');
                if (savedLocation) {
                    document.getElementById('location-input').value = savedLocation;
                }
            }
        } catch (error) {
            console.warn('[WEATHER] Failed to load settings:', error);
        }
    }
    
    // Test function for debugging
    window.testWeather = function() {
        console.log('[WEATHER] Testing weather functionality...');
        getWeatherData('London');
    };
    
})();
