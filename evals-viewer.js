// Evals Viewer Script

let debates = [];

// Load debates on page load
document.addEventListener('DOMContentLoaded', async () => {
  await loadDebates();
  renderDebates();
});

async function loadDebates() {
  const result = await chrome.storage.local.get(['debates']);
  debates = result.debates || [];
  updateStats();
}

function updateStats() {
  document.getElementById('total-debates').textContent = debates.length;
  document.getElementById('approved-count').textContent = debates.filter(d => d.outcome === 'approved').length;
  document.getElementById('override-count').textContent = debates.filter(d => d.outcome === 'override').length;
  document.getElementById('cancelled-count').textContent = debates.filter(d => d.outcome === 'cancelled').length;
}

function renderDebates() {
  const container = document.getElementById('debates-list');

  if (debates.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h2>No debates yet</h2>
        <p>Start using the extension to collect debate data</p>
      </div>
    `;
    return;
  }

  // Sort by most recent first
  const sortedDebates = [...debates].reverse();

  container.innerHTML = sortedDebates.map((debate, index) => `
    <div class="debate-item" onclick="toggleDetails(${debates.length - 1 - index})">
      <div class="debate-header">
        <span class="debate-id">${debate.id}</span>
        <span class="debate-outcome outcome-${debate.outcome}">${debate.outcome}</span>
      </div>
      <div class="debate-meta">
        <span class="debate-site">${debate.site}</span> •
        ${formatDate(debate.timestamp)} •
        ${debate.questionCount} questions •
        ${formatDuration(debate.duration)}
      </div>
      <div class="debate-details" id="details-${debates.length - 1 - index}">
        <h3 style="margin-bottom: 10px; color: #a78bfa;">Conversation</h3>
        ${debate.messages.map(msg => `
          <div class="message message-${msg.role}">
            <div class="message-role">${msg.role}</div>
            <div>${escapeHtml(msg.content)}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function toggleDetails(index) {
  const details = document.getElementById(`details-${index}`);
  details.classList.toggle('open');
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString('en-IN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${seconds % 60}s`;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Export functions

function exportJSON() {
  const dataStr = JSON.stringify(debates, null, 2);
  downloadFile(dataStr, `debates_${Date.now()}.json`, 'application/json');
}

function exportJSONL() {
  // JSONL format for fine-tuning (one JSON object per line)
  const approvedDebates = debates.filter(d => d.outcome === 'approved');

  const jsonl = approvedDebates.map(debate => {
    const example = {
      messages: debate.messages
    };
    return JSON.stringify(example);
  }).join('\n');

  downloadFile(jsonl, `training_data_${Date.now()}.jsonl`, 'application/x-ndjson');
}

function exportCSV() {
  const headers = ['ID', 'Timestamp', 'Site', 'Outcome', 'Questions', 'Duration', 'URL'];
  const rows = debates.map(d => [
    d.id,
    d.timestamp,
    d.site,
    d.outcome,
    d.questionCount,
    d.duration,
    d.url
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  downloadFile(csv, `debates_${Date.now()}.csv`, 'text/csv');
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function clearDebates() {
  if (!confirm('Are you sure you want to clear all debate data? This cannot be undone.')) {
    return;
  }

  await chrome.storage.local.set({ debates: [] });
  debates = [];
  updateStats();
  renderDebates();
  alert('All debate data cleared');
}
