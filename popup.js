// Popup script for Purchase Debate extension

document.addEventListener('DOMContentLoaded', () => {
  loadStatus();

  document.getElementById('settingsBtn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  document.getElementById('testBtn').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'TEST_MODAL' });
      window.close();
    });
  });
});

function loadStatus() {
  chrome.storage.sync.get(['apiKey', 'apiProvider', 'minQuestions', 'ollamaModel'], (result) => {
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    const providerText = document.getElementById('providerText');
    const questionsText = document.getElementById('questionsText');

    const provider = result.apiProvider || 'ollama';

    // Check if configured
    if (provider === 'ollama' || result.apiKey) {
      statusIndicator.className = 'status-indicator active';
      statusText.textContent = 'Active';
    } else {
      statusIndicator.className = 'status-indicator inactive';
      statusText.textContent = 'Not Configured';
    }

    // Provider display
    if (provider === 'ollama') {
      const model = result.ollamaModel || 'phi3';
      providerText.textContent = `Ollama (${model})`;
    } else if (provider === 'anthropic') {
      providerText.textContent = 'Claude';
    } else if (provider === 'openai') {
      providerText.textContent = 'GPT-4';
    } else {
      providerText.textContent = 'Not set';
    }

    if (result.minQuestions) {
      questionsText.textContent = result.minQuestions;
    } else {
      questionsText.textContent = '3';
    }
  });
}
