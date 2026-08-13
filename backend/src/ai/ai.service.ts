import { Injectable } from '@nestjs/common';
import { Question } from '../questions/question.entity';

@Injectable()
export class AiService {
  async evaluateAnswer(question: Question, userAnswer: string): Promise<{ score: number; feedback: string }> {
    const text = userAnswer.trim();
    if (text.length < 10) {
      return {
        score: 10,
        feedback: '### ⚠️ Evaluation Incomplete\nYour answer is too short. Please provide a more detailed explanation or code block to receive constructive feedback.',
      };
    }

    // Identify keywords to look for based on question context
    const keywordsMap: { [key: string]: string[] } = {
      nestjs: ['injectable', 'provider', 'module', 'constructor', 'singleton', 'controller', 'decorator'],
      react: ['state', 'effect', 'hook', 'context', 'props', 'render', 'memo', 'callback', 'ref'],
      sql: ['select', 'join', 'where', 'group by', 'index', 'foreign key', 'primary key', 'transaction'],
      database: ['index', 'transaction', 'nosql', 'acid', 'scaling', 'replication', 'shard'],
      javascript: ['closure', 'promise', 'async', 'prototype', 'scope', 'event loop', 'callback'],
      typescript: ['interface', 'type', 'generic', 'enum', 'union', 'assertion', 'tsconfig'],
      docker: ['container', 'image', 'volume', 'network', 'dockerfile', 'compose'],
      microservices: ['gateway', 'grpc', 'kafka', 'rabbitmq', 'event-driven', 'discovery', 'mesh'],
    };

    const targetKeywords: string[] = [];
    const questionLower = (question.title + ' ' + (question.description || '')).toLowerCase();

    for (const [key, words] of Object.entries(keywordsMap)) {
      if (questionLower.includes(key)) {
        targetKeywords.push(...words);
      }
    }

    // Default keywords if no matches
    if (targetKeywords.length === 0) {
      targetKeywords.push('complexity', 'performance', 'implementation', 'scalability', 'correctness');
    }

    // Analyze answer
    const foundKeywords = targetKeywords.filter(word => text.toLowerCase().includes(word));
    const keywordScore = Math.min(100, Math.round((foundKeywords.length / Math.max(1, targetKeywords.length)) * 100));

    // Length score modifier
    const lengthScore = Math.min(100, Math.round((text.length / 400) * 100));

    // Code blocks count modifier
    const hasCode = text.includes('```') || text.includes('function') || text.includes('const') || text.includes('class');
    const codeBonus = hasCode ? 15 : 0;

    // Final score calculation
    let finalScore = Math.round((keywordScore * 0.6) + (lengthScore * 0.4)) + codeBonus;
    finalScore = Math.max(30, Math.min(100, finalScore));

    // Construct constructive feedback
    const coveredSection = foundKeywords.length > 0
      ? foundKeywords.map(w => `- \`${w}\``).join('\n')
      : '- None of the core concepts identified in the prompt were matched. Try to incorporate relevant technical terms.';

    const missedKeywords = targetKeywords.filter(word => !foundKeywords.includes(word));
    const missingSection = missedKeywords.length > 0
      ? missedKeywords.slice(0, 4).map(w => `- \`${w}\``).join('\n')
      : '- None! You hit all primary concepts.';

    const suggestions = [];
    if (text.length < 150) {
      suggestions.push('- Elaborate on your answer. Try explaining the underlying mechanics in more detail.');
    }
    if (!hasCode && (questionLower.includes('code') || questionLower.includes('write') || questionLower.includes('implement'))) {
      suggestions.push('- Add a code snippet (`code block`) to demonstrate your implementation logic.');
    }
    if (missedKeywords.length > 2) {
      suggestions.push('- Focus on including architectural details such as lifecycle stages, dependencies, or performance trade-offs.');
    }
    if (suggestions.length === 0) {
      suggestions.push('- Excellent coverage. Consider exploring edge-cases or testing methods to further solidify this concept.');
    }

    const feedback = `
### 🤖 AI Evaluation Report
**Score:** \`${finalScore}/100\`

#### 🟢 Concepts Covered
${coveredSection}

#### 🔴 Recommendations to Include
${missingSection}

#### 💡 Key Suggestions for Improvement
${suggestions.join('\n')}
    `.trim();

    return {
      score: finalScore,
      feedback,
    };
  }
}
