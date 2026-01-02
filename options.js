// Options page script for Purchase Debate extension

document.addEventListener('DOMContentLoaded', () => {
  loadSettings();

  document.getElementById('saveBtn').addEventListener('click', saveSettings);
  document.getElementById('apiProvider').addEventListener('change', toggleProviderSettings);
});

function loadSettings() {
  chrome.storage.sync.get([
    'apiKey',
    'apiProvider',
    'minQuestions',
    'ollamaModel',
    'ollamaUrl'
  ], (result) => {
    const provider = result.apiProvider || 'ollama';
    document.getElementById('apiProvider').value = provider;

    if (result.apiKey) {
      document.getElementById('apiKey').value = result.apiKey;
    }

    if (result.minQuestions) {
      document.getElementById('minQuestions').value = result.minQuestions;
    }

    if (result.ollamaModel) {
      document.getElementById('ollamaModel').value = result.ollamaModel;
    }

    if (result.ollamaUrl) {
      document.getElementById('ollamaUrl').value = result.ollamaUrl;
    }

    toggleProviderSettings();
  });
}

function saveSettings() {
  const apiProvider = document.getElementById('apiProvider').value;
  const minQuestions = parseInt(document.getElementById('minQuestions').value);

  const settings = {
    apiProvider,
    minQuestions
  };

  // For Ollama
  if (apiProvider === 'ollama') {
    settings.ollamaModel = document.getElementById('ollamaModel').value;
    settings.ollamaUrl = document.getElementById('ollamaUrl').value.trim() || 'http://localhost:11434';
  } else {
    // For paid providers
    const apiKey = document.getElementById('apiKey').value.trim();

    if (!apiKey) {
      showStatus('Please enter an API key', 'error');
      return;
    }

    // Basic validation
    if (apiProvider === 'anthropic' && !apiKey.startsWith('sk-ant-')) {
      showStatus('Anthropic API keys should start with "sk-ant-"', 'error');
      return;
    }

    if (apiProvider === 'openai' && !apiKey.startsWith('sk-')) {
      showStatus('OpenAI API keys should start with "sk-"', 'error');
      return;
    }

    settings.apiKey = apiKey;
  }

  chrome.storage.sync.set(settings, () => {
    showStatus('Settings saved successfully!', 'success');

    // Send message to content scripts to update their settings
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          type: 'SETTINGS_UPDATED',
          settings
        }).catch(() => {
          // Ignore errors from tabs without content script
        });
      });
    });
  });
}

function toggleProviderSettings() {
  const provider = document.getElementById('apiProvider').value;
  const ollamaSettings = document.getElementById('ollamaSettings');
  const apiKeySettings = document.getElementById('apiKeySettings');
  const apiKeyHelp = document.getElementById('apiKeyHelp');

  if (provider === 'ollama') {
    ollamaSettings.style.display = 'block';
    apiKeySettings.style.display = 'none';
  } else {
    ollamaSettings.style.display = 'none';
    apiKeySettings.style.display = 'block';

    // Update help text
    if (provider === 'anthropic') {
      apiKeyHelp.innerHTML = 'Get your API key from <a href="https://console.anthropic.com/" target="_blank">Anthropic Console</a>';
    } else if (provider === 'openai') {
      apiKeyHelp.innerHTML = 'Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank">OpenAI Platform</a>';
    }
  }
}

function showStatus(message, type) {
  const statusEl = document.getElementById('status-message');
  statusEl.textContent = message;
  statusEl.className = `status-message ${type}`;
  statusEl.style.display = 'block';

  setTimeout(() => {
    statusEl.style.display = 'none';
  }, 4000);
}
