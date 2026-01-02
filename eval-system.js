// Evaluation System for Purchase Debate Extension
// Logs conversations, scores debates, and generates training data

class DebateEvaluator {
  constructor() {
    this.conversationId = this.generateId();
    this.startTime = Date.now();
    this.metadata = {
      site: window.location.hostname,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };
  }

  generateId() {
    return `debate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Log the complete debate
  logDebate(debateHistory, outcome, userOverride) {
    const debate = {
      id: this.conversationId,
      metadata: this.metadata,
      duration: Date.now() - this.startTime,
      messages: debateHistory,
      outcome: outcome, // 'approved', 'override', 'cancelled'
      userOverride: userOverride,
      questionCount: debateHistory.filter(m => m.role === 'user').length,
      evaluationMetrics: this.evaluateDebate(debateHistory, outcome)
    };

    // Save to chrome storage
    this.saveDebate(debate);

    return debate;
  }

  // Evaluate debate quality
  evaluateDebate(debateHistory, outcome) {
    const aiMessages = debateHistory.filter(m => m.role === 'assistant');
    const userMessages = debateHistory.filter(m => m.role === 'user');

    return {
      // Diversity of questions asked
      questionDiversity: this.analyzeQuestionDiversity(aiMessages),

      // Length and depth of user responses
      userEngagement: this.analyzeUserEngagement(userMessages),

      // Whether AI approved or user had to override
      aiDecision: outcome === 'approved' ? 'approved' : outcome === 'override' ? 'rejected' : 'cancelled',

      // Conversation quality indicators
      averageAIMessageLength: this.avgLength(aiMessages),
      averageUserMessageLength: this.avgLength(userMessages),

      // Keywords in AI responses
      keywordsUsed: this.extractKeywords(aiMessages),

      // Did debate cover key topics?
      topicsCovered: this.checkTopics(aiMessages)
    };
  }

  analyzeQuestionDiversity(aiMessages) {
    const questions = aiMessages.map(m => m.content.toLowerCase());

    const topics = {
      budget: ['budget', 'afford', 'price', 'cost', 'money', 'expensive'],
      necessity: ['need', 'necessary', 'essential', 'must have', 'require'],
      alternatives: ['alternative', 'instead', 'other option', 'compared'],
      longevity: ['long-term', 'future', 'use it', 'how long', 'still use'],
      replacement: ['broken', 'replace', 'current', 'existing', 'already have']
    };

    const covered = {};
    for (const [topic, keywords] of Object.entries(topics)) {
      covered[topic] = questions.some(q =>
        keywords.some(keyword => q.includes(keyword))
      );
    }

    return covered;
  }

  analyzeUserEngagement(userMessages) {
    const lengths = userMessages.map(m => m.content.length);
    const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;

    // Short responses (< 20 chars) indicate low engagement
    const shortResponses = lengths.filter(l => l < 20).length;

    return {
      avgLength: avgLength,
      shortResponseRatio: shortResponses / lengths.length,
      engagementLevel: avgLength > 50 ? 'high' : avgLength > 25 ? 'medium' : 'low'
    };
  }

  avgLength(messages) {
    if (messages.length === 0) return 0;
    return messages.reduce((sum, m) => sum + m.content.length, 0) / messages.length;
  }

  extractKeywords(aiMessages) {
    const allText = aiMessages.map(m => m.content.toLowerCase()).join(' ');
    const keywords = {
      budget: (allText.match(/budget|afford|cost|price/g) || []).length,
      alternatives: (allText.match(/alternative|instead|compared|other/g) || []).length,
      necessity: (allText.match(/need|necessary|essential|must/g) || []).length,
      approval: (allText.match(/approved|reasonable|makes sense|justified/g) || []).length
    };
    return keywords;
  }

  checkTopics(aiMessages) {
    const diversity = this.analyzeQuestionDiversity(aiMessages);
    return {
      totalTopics: Object.values(diversity).filter(Boolean).length,
      topics: diversity
    };
  }

  // Save debate to chrome storage
  async saveDebate(debate) {
    const { debates = [] } = await chrome.storage.local.get(['debates']);
    debates.push(debate);

    // Keep last 100 debates
    if (debates.length > 100) {
      debates.shift();
    }

    await chrome.storage.local.set({ debates });
    console.log('[Eval] Debate saved:', debate.id);
  }

  // Export all debates
  static async exportDebates() {
    const { debates = [] } = await chrome.storage.local.get(['debates']);
    return debates;
  }

  // Export as training dataset (JSONL format for fine-tuning)
  static async exportTrainingData() {
    const debates = await this.exportDebates();

    const trainingExamples = debates.map(debate => {
      // Only include debates where AI approved (good examples)
      if (debate.outcome !== 'approved') return null;

      return {
        messages: [
          {
            role: 'system',
            content: 'You are a thoughtful AI assistant helping someone make better purchasing decisions. Challenge their reasoning, ask about budget, alternatives, and long-term value. Be concise (2-3 sentences). Acknowledge good reasoning clearly.'
          },
          ...debate.messages
        ],
        metadata: {
          id: debate.id,
          site: debate.metadata.site,
          outcome: debate.outcome,
          quality_score: this.scoreDebate(debate)
        }
      };
    }).filter(Boolean);

    return trainingExamples;
  }

  // Score debate quality (0-100)
  static scoreDebate(debate) {
    let score = 0;
    const metrics = debate.evaluationMetrics;

    // Topic coverage (40 points)
    score += (metrics.topicsCovered.totalTopics / 5) * 40;

    // User engagement (30 points)
    if (metrics.userEngagement.engagementLevel === 'high') score += 30;
    else if (metrics.userEngagement.engagementLevel === 'medium') score += 15;

    // AI decision quality (20 points)
    if (debate.outcome === 'approved') score += 20;
    else if (debate.outcome === 'override') score += 5;

    // Conversation length (10 points)
    if (debate.questionCount >= 3) score += 10;

    return Math.round(score);
  }

  // Generate evaluation report
  static async generateReport() {
    const debates = await this.exportDebates();

    const report = {
      totalDebates: debates.length,
      outcomes: {
        approved: debates.filter(d => d.outcome === 'approved').length,
        override: debates.filter(d => d.outcome === 'override').length,
        cancelled: debates.filter(d => d.outcome === 'cancelled').length
      },
      averageScore: debates.reduce((sum, d) => sum + this.scoreDebate(d), 0) / debates.length,
      topicCoverage: this.analyzeTopicCoverage(debates),
      engagementStats: this.analyzeEngagementStats(debates),
      topSites: this.getTopSites(debates)
    };

    return report;
  }

  static analyzeTopicCoverage(debates) {
    const topics = ['budget', 'necessity', 'alternatives', 'longevity', 'replacement'];
    const coverage = {};

    topics.forEach(topic => {
      const debatesWithTopic = debates.filter(d =>
        d.evaluationMetrics?.topicsCovered?.topics?.[topic]
      ).length;
      coverage[topic] = {
        count: debatesWithTopic,
        percentage: (debatesWithTopic / debates.length) * 100
      };
    });

    return coverage;
  }

  static analyzeEngagementStats(debates) {
    const engagementLevels = debates.map(d => d.evaluationMetrics?.userEngagement?.engagementLevel || 'unknown');
    return {
      high: engagementLevels.filter(e => e === 'high').length,
      medium: engagementLevels.filter(e => e === 'medium').length,
      low: engagementLevels.filter(e => e === 'low').length
    };
  }

  static getTopSites(debates) {
    const sites = {};
    debates.forEach(d => {
      const site = d.metadata.site;
      sites[site] = (sites[site] || 0) + 1;
    });

    return Object.entries(sites)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([site, count]) => ({ site, count }));
  }

  // Test a prompt against historical debates
  static async testPrompt(newPrompt, testDebates = null) {
    if (!testDebates) {
      const allDebates = await this.exportDebates();
      // Use last 20 debates as test set
      testDebates = allDebates.slice(-20);
    }

    const results = {
      totalTests: testDebates.length,
      improvements: 0,
      regressions: 0,
      details: []
    };

    // This would require re-running conversations with the new prompt
    // For now, return structure for manual testing
    return {
      prompt: newPrompt,
      testCount: testDebates.length,
      message: 'Manual testing required - use eval-tester.html to test prompts'
    };
  }
}

// Export for use in extension
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DebateEvaluator;
}
