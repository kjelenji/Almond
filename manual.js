// Manual tools functionality for Almond extension

document.addEventListener('DOMContentLoaded', () => {
  // Highlight button handler
  document.getElementById("manual-highlight")?.addEventListener("click", async () => {
    const resultDiv = document.getElementById("manual-content");
    resultDiv.innerHTML = 'Analyzing content for key information...';

    try {
      // Get the active tab and send highlight message
      chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        chrome.tabs.sendMessage(tab.id, { type: "HIGHLIGHT_KEY_INFO" }, (response) => {
          if (response?.result) {
            resultDiv.innerHTML = response.result.replaceAll('\n', '<br>');
          } else {
            resultDiv.innerText = "Could not extract key information from this page.";
          }
        });
      });
    } catch (error) {
      resultDiv.innerText = `Error: ${error.message}`;
    }
  });

  // Weather function handler
  document.getElementById("manual-weather")?.addEventListener("click", async () => {
    const resultDiv = document.getElementById("manual-content");
    const locationInput = document.getElementById("weather-location");
    const location = locationInput?.value || "Current Location";
    
    resultDiv.innerHTML = `Getting weather for ${location}...`;

    try {
      // Simulate weather API call (replace with real API in production)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock weather data
      const weatherData = {
        location: location,
        temperature: Math.floor(Math.random() * 30) + 50, // 50-80°F
        condition: ["Sunny", "Partly Cloudy", "Cloudy", "Rainy", "Stormy"][Math.floor(Math.random() * 5)],
        humidity: Math.floor(Math.random() * 40) + 30, // 30-70%
        windSpeed: Math.floor(Math.random() * 15) + 5 // 5-20 mph
      };

      resultDiv.innerHTML = `
        <div style="background: #f0f8ff; padding: 15px; border-radius: 8px; margin-top: 10px;">
          <h4 style="margin: 0 0 10px 0; color: #8b6f47;">${weatherData.location}</h4>
          <div style="font-size: 24px; margin: 10px 0;">${weatherData.temperature}°F</div>
          <div style="margin: 5px 0;">${weatherData.condition}</div>
          <div style="margin-top: 10px; font-size: 12px; color: #666;">
            Humidity: ${weatherData.humidity}% | Wind: ${weatherData.windSpeed} mph
          </div>
        </div>
      `;
    } catch (error) {
      resultDiv.innerHTML = `<div style="color: #dc3545;">Weather Error: ${error.message}</div>`;
    }
  });
});