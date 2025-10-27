// CHANGE: Simple local summarization - no external dependencies
document.getElementById("manual-summarize").addEventListener("click", async () => {
  const resultDiv = document.getElementById("manual-content");
  resultDiv.innerHTML = 'Creating summary...';

  try {
    // CHANGE: Get article text and create local summary
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      chrome.tabs.sendMessage(tab.id, { type: "GET_ARTICLE_TEXT" }, async (res) => {
        if (!res?.text) {
          resultDiv.innerText = "Could not extract article text from this page.";
          return;
        }

        try {
          console.log("Creating Chrome AI rewrite...");
          const rewrite = await useChromeAIRewriter(res.text);
          resultDiv.innerHTML = rewrite.replaceAll('\n', '<br>');
        } catch (error) {
          console.error("Rewrite error:", error);
          resultDiv.innerText = `Error creating rewrite: ${error.message}`;
        }
      });
    });
  } catch (error) {
    resultDiv.innerText = `Error: ${error.message}`;
  }
});


// CHANGE: Chrome Rewriter API implementation (updated for correct API)
async function useChromeAIRewriter(text) {
  // CHANGE: Clean the text first to remove navigation elements
  const cleanedText = cleanTextForSummarization(text);
  
  // CHANGE: Enhanced debugging for API availability
  console.log("=== Chrome AI API Debug Info ===");
  console.log("Chrome version:", navigator.userAgent);
  console.log("globalThis.ai:", globalThis.ai);
  console.log("Rewriter in globalThis:", 'Rewriter' in globalThis);
  console.log("ai.rewriter:", globalThis.ai?.rewriter);
  console.log("ai.summarizer:", globalThis.ai?.summarizer);
  console.log("window.Rewriter:", window.Rewriter);
  console.log("=== End Debug Info ===");
  
  // Try both API patterns since the docs may be inconsistent
  let rewriterAPI = null;
  
  if ('Rewriter' in globalThis) {
    console.log("Found Rewriter in globalThis");
    rewriterAPI = globalThis.Rewriter;
  } else if (globalThis.ai?.rewriter) {
    console.log("Found rewriter in globalThis.ai");
    rewriterAPI = globalThis.ai.rewriter;
  } else if (window.Rewriter) {
    console.log("Found Rewriter in window");
    rewriterAPI = window.Rewriter;
  }
  
  if (!rewriterAPI) {
    throw new Error("Chrome Rewriter API not available. Please enable chrome://flags/#rewriter-api-for-gemini-nano or check Origin Trial token validity.");
  }

  console.log("Rewriter API found, checking availability...");
  
  // CHANGE: Check availability before creating rewriter (using the found API)
  const availability = await rewriterAPI.availability();
  console.log("Rewriter availability:", availability);

  if (availability === 'no') {
    throw new Error("Chrome Rewriter API is not supported on this device.");
  }

  // CHANGE: Limit text length for better processing
  const maxLength = 8000;
  const textToRewrite = cleanedText.length > maxLength ? 
    cleanedText.substring(0, maxLength) + "..." : cleanedText;

  console.log("Creating rewriter with Chrome Rewriter API...");
  
  // CHANGE: Create rewriter with proper options for summarization-like rewriting
  const options = {
    sharedContext: 'This is an article that needs to be rewritten to be more concise and summarized.',
    tone: 'as-is',
    format: 'plain-text',
    length: 'shorter'
  };

  let rewriter;
  
  if (availability === 'readily') {
    // The Rewriter API can be used immediately
    rewriter = await rewriterAPI.create(options);
  } else {
    // The Rewriter can be used after the model is downloaded
    rewriter = await rewriterAPI.create(options);
    if (availability === 'after-download') {
      console.log("Waiting for model download...");
      rewriter.addEventListener('downloadprogress', (e) => {
        console.log(`Model download: ${Math.round((e.loaded/e.total)*100)}%`);
      });
    }
  }

  console.log("Generating rewrite with Chrome Rewriter API...");
  
  // CHANGE: Use rewriter to create a condensed version (acts like summarization)
  const context = "Rewrite this to be a concise summary focusing on the main points and key information";
  const rewrite = await rewriter.rewrite(textToRewrite, { context });
  
  // CHANGE: Clean up resources
  rewriter.destroy();
  
  console.log("Chrome Rewriter API generated successfully");
  return rewrite;
}

// CHANGE: Clean text specifically for summarization
function cleanTextForSummarization(text) {
  return text
    // Remove Wikipedia navigation elements
    .replace(/^\d+\s+languages?\s*/i, '')
    .replace(/Article\s+Talk\s+Read\s+View\s+source\s+View\s+history/gi, '')
    .replace(/Tools\s+Appearance\s+hide\s+Text\s+Small\s+Standard\s+Large/gi, '')
    .replace(/Width\s+Standard\s+Wide\s+Color\s+\(beta\)\s+Automatic\s+Light\s+Dark/gi, '')
    .replace(/From Wikipedia, the free encyclopedia/gi, '')
    .replace(/\([^)]*disambiguation[^)]*\)/gi, '')
    // Remove common navigation phrases
    .replace(/redirects here/gi, '')
    .replace(/see also:/gi, '')
    // Clean up whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

// CHANGE: Chrome AI only - no fallback needed

// AI-powered highlight function for key information extraction
document.getElementById("manual-highlight")?.addEventListener("click", async () => {
  const resultDiv = document.getElementById("manual-content");
  resultDiv.innerHTML = 'Extracting key information...';

  try {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      chrome.tabs.sendMessage(tab.id, { type: "GET_ARTICLE_TEXT" }, async (res) => {
        if (!res?.text) {
          resultDiv.innerText = "Could not extract text from this page.";
          return;
        }

        try {
          console.log("Extracting key information with Chrome AI...");
          const highlights = await extractKeyInfoWithAI(res.text);
          resultDiv.innerHTML = highlights.replaceAll('\n', '<br>');
        } catch (error) {
          console.error("Highlight error:", error);
          // Fallback to simple extraction
          const fallbackHighlights = extractKeyInfoFallback(res.text);
          resultDiv.innerHTML = fallbackHighlights.replaceAll('\n', '<br>');
        }
      });
    });
  } catch (error) {
    resultDiv.innerText = `Error: ${error.message}`;
  }
});

// AI-powered key information extraction
async function extractKeyInfoWithAI(text) {
  const cleanedText = cleanTextForSummarization(text);
  
  // Use the same API detection as the rewriter
  let rewriterAPI = null;
  
  if ('Rewriter' in globalThis) {
    rewriterAPI = globalThis.Rewriter;
  } else if (globalThis.ai?.rewriter) {
    rewriterAPI = globalThis.ai.rewriter;
  }
  
  if (!rewriterAPI) {
    throw new Error("Chrome AI not available");
  }

  const availability = await rewriterAPI.availability();
  if (availability === 'no') {
    throw new Error("Chrome AI not supported");
  }

  // Limit text length
  const maxLength = 6000;
  const textToProcess = cleanedText.length > maxLength ? 
    cleanedText.substring(0, maxLength) + "..." : cleanedText;

  // Create rewriter specifically for extracting key information
  const options = {
    sharedContext: 'This is content from which I need to extract the 5 most important pieces of information, formatted as bullet points.',
    tone: 'as-is',
    format: 'plain-text',
    length: 'shorter'
  };

  let rewriter;
  if (availability === 'readily') {
    rewriter = await rewriterAPI.create(options);
  } else {
    rewriter = await rewriterAPI.create(options);
  }

  // Extract key information with specific context
  const context = "Extract exactly 5 key pieces of information from this content. Format each as a bullet point (•). Focus on dates, deadlines, action items, important numbers, contact information, and critical details.";
  const result = await rewriter.rewrite(textToProcess, { context });
  
  rewriter.destroy();
  
  // Format the result
  const formatted = formatKeyInfo(result);
  return `Key Information Extracted:\n\n${formatted}`;
}

// Format and clean up the AI-extracted key information
function formatKeyInfo(aiResult) {
  const lines = aiResult.split('\n').filter(line => line.trim());
  const bulletPoints = [];
  
  for (const line of lines) {
    const cleaned = line.trim();
    if (cleaned && cleaned.length > 10) {
      // Ensure each line starts with a bullet
      const formatted = cleaned.startsWith('•') || cleaned.startsWith('-') || cleaned.startsWith('*') 
        ? cleaned.replace(/^[-*]/, '•') 
        : `• ${cleaned}`;
      bulletPoints.push(formatted);
    }
  }
  
  // Ensure we have at least 5 points, or indicate if fewer were found
  if (bulletPoints.length < 5) {
    bulletPoints.push(`• [Only ${bulletPoints.length} key points were identified in this content]`);
  }
  
  return bulletPoints.slice(0, 5).join('\n');
}

// Fallback extraction without AI
function extractKeyInfoFallback(text) {
  const highlights = [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 15);
  
  // Important patterns for emails and documents
  const patterns = [
    /\b(deadline|due date|expires?|until)\b.*\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
    /\b(meeting|call|appointment)\b.*\b(\d{1,2}:\d{2}|\d{1,2}[\/\-]\d{1,2})\b/i,
    /\b(amount|cost|price|fee|payment)\b.*\$?\d+/i,
    /\b(contact|email|phone)\b.*(@\w+\.\w+|\d{3}[.-]\d{3}[.-]\d{4})/i,
    /\b(action required|please|must|need to|important|urgent)\b/i
  ];
  
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (trimmed.length > 200) continue;
    
    const isImportant = patterns.some(pattern => pattern.test(trimmed));
    if (isImportant) {
      highlights.push(`• ${trimmed}`);
      if (highlights.length >= 5) break;
    }
  }
  
  // Fill remaining slots with other important-looking content
  if (highlights.length < 5) {
    const remaining = 5 - highlights.length;
    const additionalSentences = sentences
      .filter(s => s.trim().length > 20 && s.trim().length < 150)
      .slice(0, remaining);
    
    for (const sentence of additionalSentences) {
      highlights.push(`• ${sentence.trim()}`);
    }
  }
  
  return highlights.length > 0 
    ? `Key Information Found:\n\n${highlights.slice(0, 5).join('\n')}`
    : `Key Information:\n\n• No specific key information patterns detected\n• Try selecting text from an email or document\n• Content may not contain typical important elements\n• Check if page has dates, deadlines, or action items\n• Consider using the Summary function instead`;
}