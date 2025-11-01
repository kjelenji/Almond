// AI-powered Guide functionality using Chrome Prompt API
// Helps users navigate the web with step-by-step instructions and collects insights

let currentGuideSession = null;
let userInsights = [];

// Initialize guide functionality
document.addEventListener('DOMContentLoaded', () => {
  loadUserInsights();
  
  document.getElementById("manual-guide")?.addEventListener("click", () => {
    showGuideInterface();
  });
});

// Show the guide interface
function showGuideInterface() {
  const resultDiv = document.getElementById("manual-content");
  
  resultDiv.innerHTML = `
    <div class="guide-interface">
      <div class="guide-header">
        <h4>Web Navigation Guide</h4>
        <p style="font-size: 12px; color: #666; margin: 5px 0;">Ask how to do something on the web</p>
      </div>
      
      <div class="guide-input-section">
        <textarea id="guide-question" 
                  placeholder="Example: How do I check my email on Gmail? How do I navigate from Amazon to my orders?"
                  style="width: 100%; min-height: 60px; padding: 8px; border: 1px solid #ddd; border-radius: 4px; resize: vertical; font-family: inherit; font-size: 13px;"
        ></textarea>
        
        <div class="guide-buttons" style="margin-top: 8px; display: flex; gap: 8px;">
          <button id="ask-guide-btn" class="action-btn primary" style="flex: 1;">Get Guide</button>
          <button id="view-insights-btn" class="action-btn secondary" style="flex: 1;">View Insights</button>
        </div>
      </div>
      
      <div id="guide-response" class="guide-response" style="margin-top: 15px;"></div>
      
      <div id="guide-feedback" class="guide-feedback" style="margin-top: 10px; display: none;">
        <p style="font-size: 12px; color: #666; margin-bottom: 8px;">Was this guide helpful?</p>
        <div style="display: flex; gap: 8px; margin-bottom: 8px;">
          <button id="feedback-yes" class="feedback-btn" style="padding: 4px 12px; border: 1px solid #4CAF50; background: white; color: #4CAF50; border-radius: 4px; cursor: pointer;">Yes, helpful</button>
          <button id="feedback-no" class="feedback-btn" style="padding: 4px 12px; border: 1px solid #f44336; background: white; color: #f44336; border-radius: 4px; cursor: pointer;">Not helpful</button>
        </div>
        <textarea id="feedback-details" 
                  placeholder="Optional: What specifically was helpful or what could be improved?"
                  style="width: 100%; min-height: 40px; padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px; resize: vertical;"
        ></textarea>
      </div>
    </div>
  `;
  
  // Add event listeners
  document.getElementById("ask-guide-btn")?.addEventListener("click", handleGuideRequest);
  document.getElementById("view-insights-btn")?.addEventListener("click", showInsightsView);
  document.getElementById("feedback-yes")?.addEventListener("click", () => submitFeedback(true));
  document.getElementById("feedback-no")?.addEventListener("click", () => submitFeedback(false));
  
  // Focus on the input
  document.getElementById("guide-question")?.focus();
}

// Handle guide requests using Chrome AI Prompt API
async function handleGuideRequest() {
  const questionInput = document.getElementById("guide-question");
  const responseDiv = document.getElementById("guide-response");
  const question = questionInput?.value.trim();
  
  if (!question) {
    responseDiv.innerHTML = '<p style="color: #f44336;">Please enter a question about web navigation.</p>';
    return;
  }
  
  responseDiv.innerHTML = '<p>Generating personalized guide...</p>';
  
  try {
    const guide = await generateGuideWithAI(question);
    displayGuideResponse(guide, question);
  } catch (error) {
    console.error("Guide generation error:", error);
    responseDiv.innerHTML = `<p style="color: #f44336;">Error: ${error.message}</p>`;
  }
}

// Generate guide using Chrome AI Prompt API
async function generateGuideWithAI(question) {
  console.log("=== Chrome AI Prompt API Debug ===");
  console.log("globalThis.ai:", globalThis.ai);
  console.log("globalThis.ai.languageModel:", globalThis.ai?.languageModel);
  console.log("globalThis.ai.assistant:", globalThis.ai?.assistant);
  console.log("Available AI properties:", globalThis.ai ? Object.keys(globalThis.ai) : 'No AI');
  
  // Try different API patterns for Prompt API
  let promptAPI = null;
  
  // Check for the standard Prompt API patterns
  if (globalThis.ai?.languageModel) {
    console.log("Found ai.languageModel API");
    promptAPI = globalThis.ai.languageModel;
  } else if (globalThis.ai?.assistant) {
    console.log("Found ai.assistant API");  
    promptAPI = globalThis.ai.assistant;
  } else if (globalThis.ai?.prompt) {
    console.log("Found ai.prompt API");
    promptAPI = globalThis.ai.prompt;
  } else if ('ai' in globalThis && globalThis.ai) {
    // Try to use any available AI API
    console.log("Found generic AI, trying to use it directly");
    promptAPI = globalThis.ai;
  }
  
  if (!promptAPI) {
    const aiProps = globalThis.ai ? Object.keys(globalThis.ai).join(', ') : 'none';
    throw new Error(`Chrome AI Prompt API not found. Available AI properties: ${aiProps}. Make sure chrome://flags/#prompt-api-for-gemini-nano is enabled and Chrome restarted.`);
  }
  
  // Check capabilities using the found API
  const capabilities = await promptAPI.capabilities();
  console.log("Prompt API capabilities:", capabilities);
  
  if (capabilities.available === 'no') {
    throw new Error("Chrome AI Prompt API is not supported on this device.");
  }
  
  // Create AI session for guide generation
  console.log("Creating AI session for guide...");
  const session = await promptAPI.create({
    systemPrompt: `You are a helpful web navigation assistant. Provide clear, step-by-step instructions for web tasks. 

Instructions:
1. Give 3-5 specific, actionable steps
2. Use simple language suitable for all skill levels
3. Include relevant website names and navigation paths
4. Add helpful tips and alternatives when appropriate
5. Format as numbered steps with brief explanations
6. If the task involves multiple websites, clearly indicate transitions

Always be encouraging and assume the user wants practical, immediate help.`
  });
  
  // Handle model download if needed
  if (capabilities.available === 'after-download') {
    console.log("Waiting for model download...");
    session.addEventListener('downloadprogress', (e) => {
      console.log(`Model download: ${Math.round((e.loaded/e.total)*100)}%`);
    });
  }
  
  // Generate guide
  console.log("Generating guide response...");
  const response = await session.prompt(question);
  
  // Store session for potential follow-up questions
  currentGuideSession = session;
  
  return response;
}

// Display the guide response with feedback options
function displayGuideResponse(guide, originalQuestion) {
  const responseDiv = document.getElementById("guide-response");
  const feedbackDiv = document.getElementById("guide-feedback");
  
  responseDiv.innerHTML = `
    <div class="guide-content" style="background: #f9f9f9; padding: 12px; border-radius: 6px; border-left: 4px solid #4CAF50;">
      <h5 style="margin: 0 0 10px 0; color: #333;">Step-by-Step Guide:</h5>
      <div style="white-space: pre-wrap; line-height: 1.4; font-size: 13px;">${guide}</div>
    </div>
  `;
  
  // Show feedback section
  feedbackDiv.style.display = 'block';
  
  // Store the current question for insights
  window.currentGuideQuestion = originalQuestion;
  window.currentGuideResponse = guide;
}

// Submit user feedback and collect insights
function submitFeedback(isHelpful) {
  const feedbackDetails = document.getElementById("feedback-details")?.value.trim() || '';
  const currentUrl = window.location.href;
  
  // Create insight entry
  const insight = {
    timestamp: new Date().toISOString(),
    question: window.currentGuideQuestion,
    response: window.currentGuideResponse,
    helpful: isHelpful,
    details: feedbackDetails,
    url: currentUrl,
    userAgent: navigator.userAgent,
    id: Date.now().toString()
  };
  
  // Add to insights
  userInsights.push(insight);
  
  // Save to storage
  saveUserInsights();
  
  // Update UI
  const feedbackDiv = document.getElementById("guide-feedback");
  feedbackDiv.innerHTML = `
    <div style="color: #4CAF50; font-size: 12px; padding: 8px; background: #e8f5e8; border-radius: 4px;">
      Thank you for your feedback! This helps improve the AI guidance system.
    </div>
  `;
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    feedbackDiv.style.display = 'none';
  }, 3000);
  
  console.log("Feedback submitted:", insight);
}

// Show insights view for user awareness and potential data sharing
function showInsightsView() {
  const responseDiv = document.getElementById("guide-response");
  
  if (userInsights.length === 0) {
    responseDiv.innerHTML = `
      <div class="insights-empty" style="text-align: center; padding: 20px; color: #666;">
        <p>No insights collected yet.</p>
        <p style="font-size: 12px;">Use the guide feature and provide feedback to see insights about your web navigation patterns.</p>
      </div>
    `;
    return;
  }
  
  // Generate insights summary
  const totalQuestions = userInsights.length;
  const helpfulCount = userInsights.filter(i => i.helpful).length;
  const recentInsights = userInsights.slice(-5).reverse();
  
  // Identify common topics
  const topicCounts = {};
  userInsights.forEach(insight => {
    const question = insight.question.toLowerCase();
    if (question.includes('email')) topicCounts.email = (topicCounts.email || 0) + 1;
    if (question.includes('shop') || question.includes('buy')) topicCounts.shopping = (topicCounts.shopping || 0) + 1;
    if (question.includes('social') || question.includes('facebook') || question.includes('twitter')) topicCounts.social = (topicCounts.social || 0) + 1;
    if (question.includes('navigate') || question.includes('find')) topicCounts.navigation = (topicCounts.navigation || 0) + 1;
  });
  
  const topTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([topic, count]) => `${topic}: ${count} questions`)
    .join(', ');
  
  responseDiv.innerHTML = `
    <div class="insights-view">
      <h4 style="margin: 0 0 15px 0;">Your Web Navigation Insights</h4>
      
      <div class="insights-summary" style="background: #f0f8ff; padding: 12px; border-radius: 6px; margin-bottom: 15px;">
        <h5 style="margin: 0 0 8px 0;">Summary</h5>
        <p style="margin: 4px 0; font-size: 13px;">Total questions asked: ${totalQuestions}</p>
        <p style="margin: 4px 0; font-size: 13px;">Helpful responses: ${helpfulCount}/${totalQuestions} (${Math.round((helpfulCount/totalQuestions)*100)}%)</p>
        ${topTopics ? `<p style="margin: 4px 0; font-size: 13px;">Common topics: ${topTopics}</p>` : ''}
      </div>
      
      <div class="recent-insights">
        <h5 style="margin: 0 0 10px 0;">Recent Questions</h5>
        ${recentInsights.map(insight => `
          <div style="background: #f9f9f9; padding: 8px; margin-bottom: 8px; border-radius: 4px; border-left: 3px solid ${insight.helpful ? '#4CAF50' : '#f44336'};">
            <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: bold;">${insight.question}</p>
            <p style="margin: 0; font-size: 11px; color: #666;">
              ${new Date(insight.timestamp).toLocaleDateString()} - 
              ${insight.helpful ? 'Helpful' : 'Not helpful'}
              ${insight.details ? ` - "${insight.details}"` : ''}
            </p>
          </div>
        `).join('')}
      </div>
      
      <div class="insights-actions" style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd;">
        <h5 style="margin: 0 0 8px 0;">Data & Privacy</h5>
        <p style="font-size: 12px; color: #666; margin-bottom: 10px;">
          Your insights help improve AI guidance. Data is stored locally and can help companies understand user needs.
        </p>
        <div style="display: flex; gap: 8px;">
          <button id="export-insights-btn" class="action-btn secondary" style="flex: 1; font-size: 12px;">Export Data</button>
          <button id="clear-insights-btn" class="action-btn secondary" style="flex: 1; font-size: 12px;">Clear All</button>
        </div>
      </div>
    </div>
  `;
  
  // Add event listeners for insight actions
  document.getElementById("export-insights-btn")?.addEventListener("click", exportInsights);
  document.getElementById("clear-insights-btn")?.addEventListener("click", clearInsights);
}

// Export insights data
function exportInsights() {
  const dataStr = JSON.stringify(userInsights, null, 2);
  const dataBlob = new Blob([dataStr], {type: 'application/json'});
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `almond-insights-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
}

// Clear all insights
function clearInsights() {
  if (confirm('Are you sure you want to clear all insights? This cannot be undone.')) {
    userInsights = [];
    saveUserInsights();
    showInsightsView(); // Refresh the view
  }
}

// Save insights to Chrome storage
function saveUserInsights() {
  chrome.storage.local.set({ 
    userInsights: userInsights,
    lastUpdated: new Date().toISOString()
  });
}

// Load insights from Chrome storage
function loadUserInsights() {
  chrome.storage.local.get(['userInsights'], (result) => {
    if (result.userInsights) {
      userInsights = result.userInsights;
      console.log(`Loaded ${userInsights.length} user insights`);
    }
  });
}

// Cleanup function
window.addEventListener('beforeunload', () => {
  if (currentGuideSession) {
    currentGuideSession.destroy();
  }
});