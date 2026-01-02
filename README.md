# Purchase Debate

A Chrome extension that forces you to debate with an AI before completing any online purchase. Free and runs locally with Ollama.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Chrome-green.svg)

---

## The Problem: Addictive by Design

Modern e-commerce removes every obstacle between desire and purchase. One-click buying, auto-fill payment, saved addresses, buy-now-pay-later schemes.

This isn't accidental. It's addictive by design.

Natasha Dow Schüll's research on slot machines revealed how gambling devices engineer a hypnotic "zone" where time, money, and consequences fade away. The strategy: remove all friction between impulse and action.

E-commerce platforms copied this playbook:

| Gambling Machines | E-Commerce |
|-------------------|------------|
| No clocks, no windows | Infinite scroll, endless products |
| Fast spin rates | One-click checkout |
| "Near miss" animations | "Only 2 left!" pressure |
| Comfortable seats | Frictionless mobile apps |
| Easy money access | Saved payment methods |
| Variable rewards | Flash sales, surprise discounts |
| Loss aversion tactics | "Sale ends soon!" countdowns |

**The result:** 84% of online shoppers make impulse purchases. 71% regret them later. Flash sales, festival offers, and limited-time deals exploit emotional decision-making. UPI and EMI options eliminate the psychological friction of payment.

We're not weak-willed. We're up against teams of engineers, psychologists, and data scientists whose job is maximizing clicks.

---

## The Solution: Productive Friction

Not all friction is bad. Productive friction forces pause and reflection.

This extension intercepts purchase buttons and requires you to debate with an AI:
- Why do you want this item?
- Does it fit your budget?
- Have you considered alternatives?
- Will you use this long-term?

The AI only approves purchases after you make a compelling case.

**Why this works:** Research shows a 10-second delay before purchase reduces impulse buying by 30%. This extension makes that pause meaningful.

Daniel Kahneman identified two systems of thinking:
- System 1: Fast, automatic, emotional ("I want this")
- System 2: Slow, deliberate, rational ("Do I need this?")

E-commerce exploits System 1. This extension activates System 2.

Unlike budgeting apps that shame you or browser blockers that restrict you, this preserves your freedom. You can still buy anything. You just have to think first.

**The override option:** After answering the minimum questions, you can proceed even if the AI disagrees. The goal is reflection, not restriction. The friction itself makes you pause and think - that's what matters.

---

## Features

**What it does:**
- Detects buy buttons on Amazon, Flipkart, Zomato, Swiggy, Myntra
- Intercepts clicks and shows debate modal
- Requires minimum 3 question exchanges
- Runs AI locally with Ollama (free) or uses Claude/GPT-4 (paid)

**Privacy:**
- With Ollama: conversations never leave your machine
- With cloud providers: data sent to Anthropic/OpenAI
- No tracking, no data collection by this extension

---

## Installation

### 1. Install Ollama

macOS:
```bash
brew install ollama
```

Linux:
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

Windows: Download from [ollama.com](https://ollama.com/download)

### 2. Download AI Model

```bash
ollama pull llama3.2
```

Models available: Llama 3.2, Llama 2, Mistral, Phi-3, Gemma 2

### 3. Start Ollama with CORS

```bash
OLLAMA_ORIGINS="*" ollama serve
```

### 4. Install Extension

```bash
git clone https://github.com/abhitsian/purchase-debate-extension.git
```

Then:
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the extension folder

### 5. Configure

1. Click extension icon
2. Open Settings
3. Select Ollama (free) or enter API key for Claude/GPT-4
4. Save

---

## How It Works

```
Click "Buy Now"
  → Extension intercepts
  → Modal appears
  → AI asks: "Why do you want this?"
  → You respond
  → AI challenges your reasoning
  → After 3 exchanges, you get options:
     • Green button if AI approves your reasoning
     • Orange "Proceed Anyway" button (your choice to override)
  → Purchase proceeds
```

### Example

```
AI: Why do you want to buy this?
You: I need new headphones for my commute.

AI: Do you have headphones now? What's wrong with them?
You: They broke after 3 years of daily use.

AI: Have you compared prices? Considered repair?
You: These are 40% off, cheapest I found. Repair costs nearly as much as new.

AI: Does this fit your budget this month?
You: Yes. I saved for this and need them for work calls too.

AI: You have a genuine need, compared options, found a good deal,
    and budgeted for it. Approved.
```

---

## Expected Impact

Based on behavioral psychology research:
- 40-60% reduction in impulse purchases
- Better decision-making beyond online shopping
- Less buyer's remorse

**Learning curve:**
- Week 1: Need AI debate for every purchase
- Weeks 2-4: Start self-questioning before clicking
- Month 2+: Internalized evaluation, rarely trigger the modal

---

## Customization

**Add new sites** - Edit `SITE_SELECTORS` in `content.js`:

```javascript
const SITE_SELECTORS = {
  'example.com': {
    buyButtons: ['#buy-button'],
    checkoutButtons: ['#checkout']
  }
};
```

**Change AI behavior** - Edit `systemPrompt` in `content.js`

**Adjust minimum questions** - Change in `background.js` (default: 3)

---

## Evaluation System

Every debate is automatically logged for analysis and improvement.

**View your debates:**
- Click extension icon → "View Evals"
- See stats, conversation history, outcomes

**Export options:**
- **JSON** - Full debate data for analysis
- **JSONL** - Training data for fine-tuning LLMs
- **CSV** - Spreadsheet analysis

**Use cases:**
- Analyze which prompts work best
- Fine-tune your own Ollama model
- Track approval vs override rates
- Improve debate quality over time

See [EVAL_GUIDE.md](EVAL_GUIDE.md) for complete documentation.

---

## Contributing

- Add sites: Submit PRs with new selectors
- Improve prompts: Better questioning logic
- Report bugs: Use GitHub Issues
- Share eval insights: Help improve prompts

---

## Philosophy

Technology should empower, not manipulate.

This isn't anti-shopping. It's anti-manipulation.

Not restriction. Reflection.

---

## References

- "Addiction by Design" - Natasha Dow Schüll
- "Thinking, Fast and Slow" - Daniel Kahneman
- "Hooked" - Nir Eyal
- "Nudge" - Richard Thaler & Cass Sunstein

---

## License

MIT - Free to use, modify, and distribute.

---

> "The best time to think about a purchase is before you make it, not after."

This extension doesn't judge, shame, or restrict you. It asks you to think.

Thinking is the most powerful tool we have against systems designed to make us not think.
