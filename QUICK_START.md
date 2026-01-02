# 🚀 Quick Start Guide - FREE with Ollama

## Setup in 5 Minutes (100% FREE)

### 🆓 Option A: Ollama (Recommended - FREE)

#### 1️⃣ Install Ollama

**macOS:**
```bash
# Download from website or use Homebrew
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows:**
Download from https://ollama.com/download

#### 2️⃣ Download AI Model
```bash
# Download Llama 3.2 (recommended, ~2GB)
ollama pull llama3.2
```

#### 3️⃣ Verify Ollama is Running
```bash
# Ollama usually auto-starts, but if needed:
ollama serve
```

#### 4️⃣ Load Extension in Chrome

1. Open Chrome browser
2. Go to `chrome://extensions/`
3. Toggle ON "Developer mode" (top-right corner)
4. Click "Load unpacked" button
5. Select this folder: `purchase-debate-extension`

#### 5️⃣ Configure Extension

1. Click the Purchase Debate extension icon (🤔)
2. Click "Open Settings"
3. **"Ollama (FREE - Local)"** should already be selected!
4. Click "Save Settings"

#### ✅ Done! Visit any shopping site and try to buy something!

---

### 💰 Option B: Paid APIs (Anthropic/OpenAI)

Only use this if you prefer cloud-based AI or already have API credits.

#### 1️⃣ Get an API Key (Choose One)

**Anthropic Claude:**
- Go to https://console.anthropic.com/
- Create API key (starts with `sk-ant-`)
- ~$0.002-0.005 per debate

**OpenAI GPT-4:**
- Go to https://platform.openai.com/
- Create API key (starts with `sk-`)
- ~$0.01-0.02 per debate

#### 2️⃣ Load Extension (same as above)

#### 3️⃣ Configure

1. Click extension icon → "Open Settings"
2. Select "Anthropic" or "OpenAI"
3. Paste your API key
4. Click "Save Settings"

---

## 🎯 Testing the Extension

### Quick Test
1. Click the extension icon
2. Click "Test on This Page"
3. The debate modal appears!

### Real Test
Visit a shopping site:
- Amazon.com or Amazon.in
- Zomato.com
- Swiggy.com
- Flipkart.com

Try to click "Buy Now" or "Add to Cart" - the debate starts!

---

## 🗨️ How a Debate Works

```
[You click "Buy Now"]

AI: "Hi! Why do you want to buy this?"

You: "I need new headphones"

AI: "What happened to your current ones? Have you
     considered repairing them?"

You: "They're broken beyond repair, and I saved
     money specifically for this"

AI: "That sounds reasonable. Have you compared
     prices across different stores?"

You: "Yes, this is the best price I found"

AI: "Good thinking! You've justified this well. APPROVED ✓"

[Proceed with Purchase button appears]
```

---

## 💡 Model Comparison

| Model | Cost | Speed | Quality | Privacy |
|-------|------|-------|---------|---------|
| **Ollama (llama3.2)** | FREE | Fast | Great | 100% Private ⭐ |
| Ollama (llama3.1) | FREE | Medium | Excellent | 100% Private |
| Anthropic Claude | ~$0.003 | Fast | Excellent | Sent to API |
| OpenAI GPT-4 | ~$0.015 | Fast | Excellent | Sent to API |

**Recommendation:** Start with Ollama! It's free, private, and works great.

---

## ⚠️ Troubleshooting

### Ollama Issues

**"Cannot connect to Ollama"**
```bash
# Check if running
curl http://localhost:11434/api/tags

# Start it
ollama serve
```

**"Model not found"**
```bash
# Download the model
ollama pull llama3.2

# List installed models
ollama list
```

**Slow responses**
- Use smaller model: `ollama pull phi3`
- Close other applications
- Upgrade RAM if possible

### Extension Issues

**Modal not appearing?**
- Refresh the shopping page
- Check if you're on a supported site
- Open browser console (F12) for errors

**API errors (paid providers)?**
- Verify your API key is correct
- Check you have API credits remaining
- Ensure correct provider is selected

---

## 📖 More Help

- **Ollama Setup:** See [OLLAMA_SETUP.md](OLLAMA_SETUP.md) for detailed guide
- **Full Docs:** See [README.md](README.md) for complete documentation
- **Add New Sites:** Edit `SITE_SELECTORS` in `content.js`

---

## 🎉 You're Ready!

Start shopping mindfully with your free AI debate partner!

**Sites that work:**
- ✅ Amazon (US & India)
- ✅ Zomato
- ✅ Swiggy
- ✅ Flipkart
- ✅ Myntra
- ✅ UberEats
- ✅ DoorDash

**Happy Mindful Shopping! 🛍️**
