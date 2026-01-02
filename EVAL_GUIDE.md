# Evaluation System Guide

This extension includes a complete evaluation system to collect real debate data, analyze performance, and improve prompts through testing.

## Quick Start

1. Use the extension normally - every debate is automatically logged
2. Click extension icon → "View Evals" to see your debate history
3. Export data in JSON, JSONL, or CSV format
4. Use the data to improve prompts and fine-tune models

---

## What Gets Logged

Every debate conversation is saved with:

```json
{
  "id": "debate_1735789012345_abc123",
  "timestamp": "2026-01-02T12:30:15.123Z",
  "site": "amazon.in",
  "url": "https://amazon.in/product/...",
  "duration": 45000,
  "messages": [
    { "role": "assistant", "content": "Why do you want to buy this?" },
    { "role": "user", "content": "I need new headphones..." },
    ...
  ],
  "outcome": "approved", // or "override" or "cancelled"
  "questionCount": 3,
  "minimumQuestionsRequired": 3
}
```

**Storage:** Chrome local storage (last 100 debates)

---

## Viewing Evals

### Access
- Click extension icon → "View Evals"
- Or open `chrome-extension://[id]/evals-viewer.html`

### Stats Dashboard
- Total debates
- AI approved count
- User override count
- Cancelled count

### Debate List
- Click any debate to expand conversation details
- See full message history
- View metadata (site, duration, outcome)

---

## Exporting Data

### 1. JSON Export
**Use for:** Analysis, backup, sharing

```bash
# Click "Export JSON"
# Downloads: debates_[timestamp].json
```

Full debate history with all metadata.

### 2. JSONL Export (Training Data)
**Use for:** Fine-tuning LLMs

```bash
# Click "Export JSONL (Training)"
# Downloads: training_data_[timestamp].jsonl
```

Filtered to only `approved` debates (good examples). Format:
```jsonl
{"messages":[{"role":"assistant","content":"..."},{"role":"user","content":"..."},...]}
{"messages":[{"role":"assistant","content":"..."},{"role":"user","content":"..."},...]}
```

Ready for OpenAI/Anthropic fine-tuning APIs.

### 3. CSV Export
**Use for:** Spreadsheet analysis, visualization

```bash
# Click "Export CSV"
# Downloads: debates_[timestamp].csv
```

Columns: ID, Timestamp, Site, Outcome, Questions, Duration, URL

---

## Fine-Tuning with Your Data

### Anthropic (Claude)

```bash
# Export JSONL
# Upload to Anthropic Console
# Create fine-tuning job

# Example API usage
curl https://api.anthropic.com/v1/fine_tuning/jobs \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "training_file": "file-xyz123",
    "model": "claude-3-haiku-20240307",
    "hyperparameters": {
      "n_epochs": 3
    }
  }'
```

### OpenAI (GPT-4)

```bash
# Install OpenAI CLI
pip install openai

# Upload training file
openai api fine_tuning.jobs.create \
  -t training_data_[timestamp].jsonl \
  -m gpt-3.5-turbo

# Monitor training
openai api fine_tuning.jobs.get -i ft-xyz123
```

### Ollama (Local Fine-Tuning)

```bash
# Convert JSONL to training format
# Use ollama create with Modelfile

# Example Modelfile
FROM llama3.2
SYSTEM "You are a purchase debate assistant..."
# Add training examples
```

See [Ollama documentation](https://github.com/ollama/ollama/blob/main/docs/import.md) for details.

---

## Analyzing Debates

### What Makes a Good Debate?

**High Quality Indicators:**
1. User answered 3+ questions
2. User responses > 30 characters avg
3. AI covered 3+ topics (budget, necessity, alternatives)
4. Natural conversation flow
5. AI approved after solid justification

**Low Quality Indicators:**
1. User gave short/dismissive answers
2. User cancelled immediately
3. AI asked same question type repeatedly
4. Debate ended in override

### Manual Review Process

1. Export JSON
2. Filter by outcome: `approved` debates
3. Read conversations
4. Note patterns:
   - What questions work best?
   - Where do users struggle?
   - Which approvals seem premature?
   - Which rejections seem too strict?

### Metrics to Track

```javascript
// Calculate from exported JSON
const debates = JSON.parse(exportedData);

// Approval rate
const approvalRate = debates.filter(d => d.outcome === 'approved').length / debates.length;

// Average duration
const avgDuration = debates.reduce((sum, d) => sum + d.duration, 0) / debates.length;

// Most common sites
const sites = debates.reduce((acc, d) => {
  acc[d.site] = (acc[d.site] || 0) + 1;
  return acc;
}, {});

// Question count distribution
const questionDist = debates.reduce((acc, d) => {
  acc[d.questionCount] = (acc[d.questionCount] || 0) + 1;
  return acc;
}, {});
```

---

## Testing New Prompts

### Current Prompt (v1.0)
```
You are a thoughtful AI assistant helping someone make better purchasing decisions. Your role is to:

1. Challenge their purchase by asking probing questions about necessity, budget, alternatives, and long-term value
2. Be empathetic but firm - you want to help them avoid impulse purchases
3. Ask follow-up questions based on their responses
4. After at least 3 meaningful exchanges, if they've made a solid case, acknowledge it with phrases like "sounds reasonable", "makes sense", "well-justified", or "approved"
5. If they haven't justified it well, keep questioning gently
6. Look for: real need vs want, budget impact, alternatives considered, long-term use

Keep responses concise (2-3 sentences max). Be conversational and helpful, not preachy. If the user has good reasoning, acknowledge it clearly.
```

### Testing Process

1. **Collect baseline data** - Use extension for 1 week with current prompt
2. **Export debates** - Get JSONL of approved debates
3. **Identify issues** - Manual review for patterns
4. **Draft new prompt** - Address identified issues
5. **A/B test** - Split debates 50/50 between old/new prompt
6. **Compare metrics**:
   - Approval rate (should be ~40-60%)
   - Override rate (should be < 30%)
   - Average duration (sweet spot: 30-90 seconds)
   - User satisfaction (qualitative)

### Example Prompt Iterations

**V1.1 - More specific questions**
```diff
- Challenge their purchase by asking probing questions
+ Ask specific questions:
+   - What problem does this solve?
+   - Have you checked 3+ alternative options?
+   - Will you use this weekly for 6+ months?
+   - Does this fit your monthly budget?
```

**V1.2 - Faster approval**
```diff
- After at least 3 meaningful exchanges
+ After 2-3 exchanges, if they show:
+   - Clear need (not want)
+   - Budget planning
+   - Price comparison
+   Then approve quickly
```

---

## Advanced: Prompt Engineering

### Variables to Test

**Tone:**
- Strict vs lenient
- Formal vs casual
- Empathetic vs direct

**Structure:**
- Numbered steps vs free-form
- Required topics vs flexible
- Examples included vs not

**Approval Criteria:**
- Explicit checklist vs implicit
- Strict (5/5 criteria) vs lenient (3/5)
- Binary vs gradual

### Measuring Success

Good prompt characteristics:
- **40-60% approval rate** - Not too easy, not too hard
- **< 30% override rate** - Users don't bypass frequently
- **30-90 second duration** - Long enough to think, short enough to tolerate
- **High topic coverage** - Budget, necessity, alternatives all covered
- **Natural conversation** - Doesn't feel robotic

### Dataset Quality

For fine-tuning, you want:
- **Minimum 50 examples** (more is better)
- **Diverse scenarios** - Different sites, price points, product types
- **High quality approved debates** - User gave good justifications
- **Balanced outcomes** - Mix of approved/override (not all one type)

---

## Privacy Note

All debate data is stored **locally** in Chrome storage. Nothing is sent to external servers unless you explicitly export it.

To clear data:
- Evals viewer → "Clear All Data" button
- Or: Chrome DevTools → Application → Storage → Local Storage → Clear

---

## Example Analysis Workflow

### Week 1: Collect Data
```bash
# Use extension normally
# Aim for 20+ debates
```

### Week 2: Analyze
```python
import json

# Load exported JSON
with open('debates_123.json') as f:
    debates = json.load(f)

# Filter approved debates
approved = [d for d in debates if d['outcome'] == 'approved']

# Analyze average question count
avg_questions = sum(d['questionCount'] for d in approved) / len(approved)
print(f"Avg questions for approval: {avg_questions}")

# Find common approval phrases
from collections import Counter
ai_messages = [msg['content'] for d in approved for msg in d['messages'] if msg['role'] == 'assistant']
approval_words = Counter(word for msg in ai_messages if any(phrase in msg.lower() for phrase in ['approved', 'reasonable', 'makes sense']))
```

### Week 3: Iterate
```bash
# Update prompt based on findings
# Test with 10 new debates
# Compare metrics
```

---

## Community Contributions

Share your findings:
1. Export anonymized debates (remove URLs/personal info)
2. Share prompt improvements
3. Report which models work best (Ollama vs Claude vs GPT-4)

---

## Next Steps

1. **Start collecting** - Use extension normally
2. **Review weekly** - Check evals dashboard
3. **Export monthly** - Backup your data
4. **Iterate prompts** - Test improvements
5. **Share learnings** - Help others improve

**Questions?** Open GitHub Issues with `[eval]` tag
