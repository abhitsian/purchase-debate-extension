# 🆓 Ollama Setup Guide - 100% FREE

Use Ollama to run AI models locally on your computer - completely free, no API costs!

## 📥 Step 1: Install Ollama

### macOS
```bash
# Download from website
open https://ollama.com/download

# Or install with Homebrew
brew install ollama
```

### Linux
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### Windows
Download the installer from: https://ollama.com/download

---

## 🤖 Step 2: Download an AI Model

After installing Ollama, open a terminal and run:

```bash
# Recommended: Llama 3.2 (best balance of speed and quality)
ollama pull llama3.2
```

### Other model options:

```bash
# Llama 3.1 (larger, more capable)
ollama pull llama3.1

# Mistral (good alternative)
ollama pull mistral

# Phi-3 (smaller, faster, less capable)
ollama pull phi3

# Gemma 2 (Google's model)
ollama pull gemma2
```

**Note:** First download will take a few minutes depending on the model size.

---

## 🚀 Step 3: Start Ollama

Ollama usually starts automatically after installation. If not:

```bash
ollama serve
```

You should see: `Ollama is running`

---

## ✅ Step 4: Verify Installation

Test that Ollama is working:

```bash
# Test with a simple question
ollama run llama3.2 "Hello, how are you?"
```

You should get a response from the AI!

---

## 🔧 Step 5: Configure the Extension

1. Click the Purchase Debate extension icon in Chrome
2. Click "Open Settings"
3. Select **"Ollama (FREE - Local)"** as AI Provider
4. Choose your model (default: llama3.2)
5. Keep URL as `http://localhost:11434` (default)
6. Click "Save Settings"

---

## 🎉 You're All Set!

Now visit any shopping site and try to make a purchase. The extension will use your local Ollama instance to debate with you - completely free!

---

## 🛠️ Troubleshooting

### "Cannot connect to Ollama" error

**Solution:**
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If not running, start it
ollama serve
```

### "Model not found" error

**Solution:**
```bash
# Make sure you've pulled the model
ollama pull llama3.2

# List all downloaded models
ollama list
```

### Slow responses

**Solutions:**
- Use a smaller model like `phi3` for faster responses
- Check your computer's RAM (16GB+ recommended for larger models)
- Close other heavy applications

### Ollama not starting on macOS

**Solution:**
```bash
# Check if it's already running
pgrep ollama

# Kill existing process if stuck
pkill ollama

# Restart
ollama serve
```

---

## 💡 Model Recommendations

| Model | Size | Speed | Quality | Best For |
|-------|------|-------|---------|----------|
| **llama3.2** | ~2GB | Fast | Great | Recommended ⭐ |
| llama3.1 | ~5GB | Medium | Excellent | Best quality |
| mistral | ~4GB | Medium | Great | Good alternative |
| phi3 | ~2GB | Very Fast | Good | Speed priority |
| gemma2 | ~2GB | Fast | Great | Google ecosystem |

---

## 🔄 Updating Ollama

```bash
# Update Ollama itself
brew upgrade ollama  # macOS
# or download latest from ollama.com

# Update a model
ollama pull llama3.2
```

---

## 📊 System Requirements

**Minimum:**
- 8GB RAM
- 4GB free disk space
- Modern CPU (Intel i5 or equivalent)

**Recommended:**
- 16GB+ RAM
- 10GB free disk space
- Recent CPU (2020+)
- SSD for faster model loading

---

## 🌐 Using Remote Ollama

You can also run Ollama on a different computer:

1. On the Ollama server machine:
```bash
# Allow remote connections
OLLAMA_HOST=0.0.0.0:11434 ollama serve
```

2. In the extension settings:
- Change Ollama URL to: `http://YOUR_SERVER_IP:11434`

---

## ❓ FAQ

**Q: Is Ollama really free?**
A: Yes! 100% free and open source. No API costs, no subscriptions.

**Q: Will it work offline?**
A: Yes! Once models are downloaded, everything runs locally offline.

**Q: How is privacy?**
A: Perfect! Your conversations never leave your computer.

**Q: Can I use multiple models?**
A: Yes! Download multiple models with `ollama pull` and switch between them in the extension settings.

**Q: Does it slow down my computer?**
A: It uses CPU/GPU during responses but is idle otherwise. Close it when not needed: `pkill ollama`

---

## 📚 More Information

- Official Ollama docs: https://github.com/ollama/ollama
- Model library: https://ollama.com/library
- Community: https://discord.gg/ollama

---

**Enjoy free, private, local AI debates before every purchase! 🎉**
