// Purchase Debate - Content Script
// Intercepts purchase buttons and shows debate modal

const SITE_SELECTORS = {
  'amazon.com': {
    buyButtons: [
      '#buy-now-button',
      'input[name="submit.buy-now"]',
      '#buyNow',
      'input[name="submit.add-to-cart"]',
      '#add-to-cart-button',
      '[data-action="a-popover-close"]'
    ],
    checkoutButtons: [
      'input[name="proceedToRetailCheckout"]',
      '#sc-buy-box-ptc-button',
      'input[name="proceedToCheckout"]'
    ]
  },
  'amazon.in': {
    buyButtons: [
      '#buy-now-button',
      'input[name="submit.buy-now"]',
      '#buyNow',
      'input[name="submit.add-to-cart"]',
      '#add-to-cart-button'
    ],
    checkoutButtons: [
      'input[name="proceedToRetailCheckout"]',
      '#sc-buy-box-ptc-button',
      'input[name="proceedToCheckout"]'
    ]
  },
  'zomato.com': {
    buyButtons: [
      '[data-testid="add-item"]',
      'button:has-text("ADD")',
      '.sc-1s0saks-13'
    ],
    checkoutButtons: [
      '[data-testid="checkout-button"]',
      'button:has-text("Proceed to Pay")',
      'button:has-text("Place Order")'
    ]
  },
  'swiggy.com': {
    buyButtons: [
      '[data-testid="normal-add-button"]',
      'button:has-text("ADD")',
      '.styles_itemBtn__CJX-a'
    ],
    checkoutButtons: [
      'button:has-text("Proceed to Pay")',
      'button:has-text("Place Order")',
      '[data-testid="checkout-button"]'
    ]
  },
  'flipkart.com': {
    buyButtons: [
      '._2KpZ6l._2U9uOA._3v1-ww',
      'button:has-text("BUY NOW")',
      'button:has-text("ADD TO CART")'
    ],
    checkoutButtons: [
      'button:has-text("PLACE ORDER")',
      '._2KpZ6l._2ObVJf._3AWRsL'
    ]
  }
};

class PurchaseDebateModal {
  constructor() {
    this.modal = null;
    this.debateHistory = [];
    this.debateComplete = false;
    this.originalClickHandler = null;
    this.blockedButton = null;
    this.minimumQuestions = 3;
    this.currentQuestionCount = 0;
  }

  async init() {
    await this.loadSettings();
    this.injectModalHTML();
    this.attachEventListeners();
    this.interceptPurchaseButtons();
    this.listenForMessages();
  }

  async loadSettings() {
    const settings = await chrome.storage.sync.get(['minQuestions']);
    if (settings.minQuestions) {
      this.minimumQuestions = settings.minQuestions;
    }
  }

  listenForMessages() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.type === 'SETTINGS_UPDATED' && request.settings.minQuestions) {
        this.minimumQuestions = request.settings.minQuestions;
      }
      if (request.type === 'TEST_MODAL') {
        this.showModal();
      }
    });
  }

  injectModalHTML() {
    if (document.getElementById('purchase-debate-modal')) return;

    const modalHTML = `
      <div id="purchase-debate-modal" class="pdb-modal-overlay" style="display: none;">
        <div class="pdb-modal-container">
          <div class="pdb-modal-header">
            <h2>🤔 Do you really need this?</h2>
            <p class="pdb-subtitle">Let's have a quick debate before you buy</p>
          </div>

          <div class="pdb-chat-container" id="pdb-chat-container">
            <div class="pdb-message pdb-ai-message">
              <div class="pdb-message-content">
                Hi! I noticed you're about to make a purchase. Before we proceed, I'd like to understand: <strong>Why do you want to buy this?</strong> What need does it fulfill?
              </div>
            </div>
          </div>

          <div class="pdb-input-container">
            <textarea
              id="pdb-user-input"
              placeholder="Type your response here..."
              rows="3"
            ></textarea>
            <div class="pdb-button-group">
              <button id="pdb-send-btn" class="pdb-btn pdb-btn-primary">Send Response</button>
              <button id="pdb-cancel-btn" class="pdb-btn pdb-btn-secondary">Cancel Purchase</button>
            </div>
          </div>

          <div class="pdb-progress">
            <span id="pdb-progress-text">Question 0 of ${this.minimumQuestions} minimum</span>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.modal = document.getElementById('purchase-debate-modal');
  }

  attachEventListeners() {
    const sendBtn = document.getElementById('pdb-send-btn');
    const cancelBtn = document.getElementById('pdb-cancel-btn');
    const userInput = document.getElementById('pdb-user-input');

    sendBtn.addEventListener('click', () => this.handleUserResponse());
    cancelBtn.addEventListener('click', () => this.closeModal());

    userInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleUserResponse();
      }
    });
  }

  interceptPurchaseButtons() {
    const hostname = window.location.hostname;
    const siteKey = Object.keys(SITE_SELECTORS).find(key => hostname.includes(key));

    if (!siteKey) {
      console.log('[Purchase Debate] Site not configured');
      return;
    }

    const selectors = SITE_SELECTORS[siteKey];
    const allSelectors = [...selectors.buyButtons, ...selectors.checkoutButtons];

    // Use MutationObserver to handle dynamically loaded buttons
    const observer = new MutationObserver(() => {
      this.attachToButtons(allSelectors);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Initial attachment
    this.attachToButtons(allSelectors);
  }

  attachToButtons(selectors) {
    selectors.forEach(selector => {
      const buttons = document.querySelectorAll(selector);
      buttons.forEach(button => {
        if (!button.dataset.pdbAttached) {
          button.dataset.pdbAttached = 'true';
          button.addEventListener('click', (e) => this.handleButtonClick(e), true);
        }
      });
    });
  }

  handleButtonClick(event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    this.blockedButton = event.currentTarget;
    this.showModal();

    return false;
  }

  showModal() {
    this.debateHistory = [];
    this.debateComplete = false;
    this.currentQuestionCount = 0;
    this.modal.style.display = 'flex';
    document.getElementById('pdb-user-input').focus();
    this.updateProgress();
  }

  closeModal() {
    this.modal.style.display = 'none';
    this.blockedButton = null;
  }

  async handleUserResponse() {
    const input = document.getElementById('pdb-user-input');
    const userMessage = input.value.trim();

    if (!userMessage) return;

    // Add user message to chat
    this.addMessageToChat(userMessage, 'user');
    input.value = '';

    // Add to history
    this.debateHistory.push({ role: 'user', content: userMessage });
    this.currentQuestionCount++;
    this.updateProgress();

    // Get AI response
    await this.getAIResponse();
  }

  async getAIResponse() {
    this.showTypingIndicator();

    try {
      const response = await this.callLLM();
      this.removeTypingIndicator();

      this.addMessageToChat(response, 'ai');
      this.debateHistory.push({ role: 'assistant', content: response });

      // Check if debate should end
      if (this.shouldAllowPurchase()) {
        this.enablePurchaseButton();
      } else if (this.currentQuestionCount >= this.minimumQuestions) {
        // Show override option after minimum questions
        this.showOverrideOption();
      }
    } catch (error) {
      this.removeTypingIndicator();
      this.addMessageToChat('Error connecting to AI. Please try again or cancel.', 'ai');
      console.error('[Purchase Debate] Error:', error);
    }
  }

  async callLLM() {
    // Get settings from storage
    const { apiKey, apiProvider, ollamaModel, ollamaUrl } = await chrome.storage.sync.get([
      'apiKey',
      'apiProvider',
      'ollamaModel',
      'ollamaUrl'
    ]);

    const provider = apiProvider || 'ollama';

    // Only require API key for paid providers
    if ((provider === 'anthropic' || provider === 'openai') && !apiKey) {
      throw new Error('No API key configured. Please set it in the extension options.');
    }

    const systemPrompt = `You are a thoughtful AI assistant helping someone make better purchasing decisions. Your role is to:

1. Challenge their purchase by asking probing questions about necessity, budget, alternatives, and long-term value
2. Be empathetic but firm - you want to help them avoid impulse purchases
3. Ask follow-up questions based on their responses
4. After at least ${this.minimumQuestions} meaningful exchanges, if they've made a solid case, acknowledge it with phrases like "sounds reasonable", "makes sense", "well-justified", or "approved"
5. If they haven't justified it well, keep questioning gently
6. Look for: real need vs want, budget impact, alternatives considered, long-term use

Keep responses concise (2-3 sentences max). Be conversational and helpful, not preachy. If the user has good reasoning, acknowledge it clearly.`;

    if (provider === 'ollama') {
      const model = ollamaModel || 'phi3';
      const baseUrl = ollamaUrl || 'http://localhost:11434';

      try {
        const response = await fetch(`${baseUrl}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: 'system', content: systemPrompt },
              ...this.debateHistory
            ],
            stream: false,
            options: {
              temperature: 0.7,
              num_predict: 200
            }
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Ollama error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        return data.message.content;
      } catch (error) {
        if (error.message.includes('Failed to fetch')) {
          throw new Error('Cannot connect to Ollama. Make sure Ollama is running on your machine. Run: ollama serve');
        }
        throw error;
      }
    } else if (provider === 'anthropic') {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 300,
          system: systemPrompt,
          messages: this.debateHistory
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.content[0].text;
    } else if (provider === 'openai') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          max_tokens: 300,
          messages: [
            { role: 'system', content: systemPrompt },
            ...this.debateHistory
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    }

    throw new Error('Unsupported API provider');
  }

  shouldAllowPurchase() {
    if (this.currentQuestionCount < this.minimumQuestions) {
      return false;
    }

    // Check if AI has approved (more lenient detection)
    const lastAIMessage = this.debateHistory[this.debateHistory.length - 1];
    if (lastAIMessage && lastAIMessage.role === 'assistant') {
      const content = lastAIMessage.content.toLowerCase();

      // Check for various approval phrases
      const approvalPhrases = [
        'approved',
        'go ahead',
        'sounds reasonable',
        'seems justified',
        'well-justified',
        'makes sense',
        'good reasoning',
        'fair point',
        'sounds good',
        'that works'
      ];

      return approvalPhrases.some(phrase => content.includes(phrase));
    }

    return false;
  }

  enablePurchaseButton() {
    const container = document.querySelector('.pdb-button-group');

    if (!document.getElementById('pdb-proceed-btn')) {
      const proceedBtn = document.createElement('button');
      proceedBtn.id = 'pdb-proceed-btn';
      proceedBtn.className = 'pdb-btn pdb-btn-success';
      proceedBtn.textContent = 'Proceed with Purchase';
      proceedBtn.addEventListener('click', () => this.proceedWithPurchase());
      container.insertBefore(proceedBtn, container.firstChild);
    }
  }

  showOverrideOption() {
    const container = document.querySelector('.pdb-button-group');

    // Don't show if already exists or if approved button exists
    if (document.getElementById('pdb-override-btn') || document.getElementById('pdb-proceed-btn')) {
      return;
    }

    const overrideBtn = document.createElement('button');
    overrideBtn.id = 'pdb-override-btn';
    overrideBtn.className = 'pdb-btn pdb-btn-override';
    overrideBtn.textContent = 'Proceed Anyway';
    overrideBtn.title = 'You\'ve answered the minimum questions. Proceed if you\'re confident.';
    overrideBtn.addEventListener('click', () => this.proceedWithPurchase());
    container.insertBefore(overrideBtn, container.firstChild);
  }

  proceedWithPurchase() {
    this.closeModal();

    if (this.blockedButton) {
      // Temporarily remove our listener and trigger the original action
      this.blockedButton.dataset.pdbAttached = 'false';
      this.blockedButton.click();

      // Re-attach after a short delay
      setTimeout(() => {
        this.blockedButton.dataset.pdbAttached = 'true';
      }, 1000);
    }
  }

  addMessageToChat(message, sender) {
    const chatContainer = document.getElementById('pdb-chat-container');
    const messageDiv = document.createElement('div');
    messageDiv.className = `pdb-message pdb-${sender}-message`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'pdb-message-content';
    contentDiv.textContent = message;

    messageDiv.appendChild(contentDiv);
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  showTypingIndicator() {
    const chatContainer = document.getElementById('pdb-chat-container');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'pdb-message pdb-ai-message';
    typingDiv.id = 'pdb-typing-indicator';
    typingDiv.innerHTML = '<div class="pdb-message-content"><div class="pdb-typing-dots"><span>.</span><span>.</span><span>.</span></div></div>';
    chatContainer.appendChild(typingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  removeTypingIndicator() {
    const typingIndicator = document.getElementById('pdb-typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  updateProgress() {
    const progressText = document.getElementById('pdb-progress-text');
    if (this.currentQuestionCount >= this.minimumQuestions) {
      progressText.textContent = `✓ Minimum questions answered`;
      progressText.style.color = '#10b981';
    } else {
      progressText.textContent = `Question ${this.currentQuestionCount} of ${this.minimumQuestions} minimum`;
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const debateModal = new PurchaseDebateModal();
    debateModal.init();
  });
} else {
  const debateModal = new PurchaseDebateModal();
  debateModal.init();
}
