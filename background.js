// Background service worker for Purchase Debate extension

chrome.runtime.onInstalled.addListener(() => {
  console.log('[Purchase Debate] Extension installed');

  // Set default settings
  chrome.storage.sync.get(['apiProvider', 'minQuestions', 'ollamaModel', 'ollamaUrl'], (result) => {
    const defaults = {};

    if (!result.apiProvider) {
      defaults.apiProvider = 'ollama'; // Default to free Ollama
    }
    if (!result.minQuestions) {
      defaults.minQuestions = 3;
    }
    if (!result.ollamaModel) {
      defaults.ollamaModel = 'phi3';
    }
    if (!result.ollamaUrl) {
      defaults.ollamaUrl = 'http://localhost:11434';
    }

    if (Object.keys(defaults).length > 0) {
      chrome.storage.sync.set(defaults);
    }
  });

  // Open options page on first install
  chrome.runtime.openOptionsPage();
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_SETTINGS') {
    chrome.storage.sync.get(['apiKey', 'apiProvider', 'minQuestions'], (result) => {
      sendResponse(result);
    });
    return true; // Keep channel open for async response
  }
});
