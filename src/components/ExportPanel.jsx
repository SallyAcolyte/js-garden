import React, { useEffect, useMemo, useState } from 'react';

function translateOutcome(outcome) {
  if (outcome === 'pass') return '✅ pass';
  if (outcome === 'fail') return '❌ fail';
  if (outcome === 'error') return '⚠️ error';
  return outcome || 'unknown';
}

function buildMarkdown(problem, code, result) {
  if (!problem) return '';

  const lines = [];
  lines.push('# レビュー依頼');
  lines.push('あなたはプロの JavaScript コードレビュワーです。以下の情報を読み、学習者の解答を評価してください。');
  lines.push('改善点があれば **具体的な指摘と修正例** を提示し、問題なく合格と判断する場合はその根拠を明記してください。');
  lines.push('必ず以下の観点をカバーしてください: 正しさ、パフォーマンス、可読性、拡張性、安全性。');
  lines.push('');
  lines.push('## 問題概要');
  lines.push(`- ID: ${problem.id}`);
  lines.push(`- タイトル: ${problem.title}`);
  lines.push(`- 難易度: ${problem.difficulty}`);
  if (problem.category) {
    lines.push(`- カテゴリ: ${problem.category}`);
  }
  if (problem.tags && problem.tags.length > 0) {
    lines.push(`- タグ: ${problem.tags.join(', ')}`);
  }
  lines.push('');
  if (problem.summary) {
    lines.push('### サマリー');
    lines.push(problem.summary.trim());
    lines.push('');
  }
  if (problem.prompt) {
    lines.push('### 問題文');
    lines.push(problem.prompt.trim());
    lines.push('');
  }
  if (problem.constraints && problem.constraints.length > 0) {
    lines.push('### 制約');
    for (const constraint of problem.constraints) {
      lines.push(`- ${constraint}`);
    }
    lines.push('');
  }

  lines.push('## 受験者コード');
  lines.push('```javascript');
  lines.push(code || '// コードが未入力です');
  lines.push('```');
  lines.push('');

  lines.push('## テスト結果');
  if (!result) {
    lines.push('- まだテストを実行していません。');
  } else if (result.summary.status === 'compile-error') {
    lines.push('- ステータス: ⚠️ compile-error');
    lines.push(`- メッセージ: ${result.summary.message}`);
  } else {
    lines.push(`- ステータス: ${translateOutcome(result.summary.status)}`);
    lines.push(`- メッセージ: ${result.summary.message}`);
    if (typeof result.summary.durationMs === 'number') {
      lines.push(`- 実行時間: ${result.summary.durationMs}ms`);
    }
    lines.push('');
    lines.push('### ケース詳細');
    result.items.forEach((item, index) => {
      lines.push(`#### ケース ${index + 1}: ${item.description || 'テスト'}`);
      lines.push(`- 結果: ${translateOutcome(item.outcome)}`);
      if (Array.isArray(item.args) && item.args.length > 0) {
        lines.push(`- 入力: ${item.args.join(', ')}`);
      }
      if (item.outcome === 'error') {
        lines.push(`- エラー: ${item.error}`);
        if (item.stack) {
          lines.push('```');
          lines.push(item.stack);
          lines.push('```');
        }
      } else {
        lines.push(`- 期待値: ${item.expected}`);
        lines.push(`- 戻り値: ${item.received}`);
      }
      lines.push('');
    });
  }

  lines.push('---');
  lines.push('### 出力テンプレート');
  lines.push('1. **総合評価**: 合格/保留/不合格 + 理由の要約');
  lines.push('2. **指摘事項**: 箇条書きで具体的な改善点とサンプルコード');
  lines.push('3. **アドバイス**: 今後の学習に向けた助言');
  lines.push('');
  return lines.join('\n').trimEnd();
}

export default function ExportPanel({ problem, code, result }) {
  const [copied, setCopied] = useState(false);
  const markdown = useMemo(() => buildMarkdown(problem, code, result), [problem, code, result]);

  useEffect(() => {
    setCopied(false);
  }, [markdown]);

  if (!problem) {
    return null;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
    } catch (error) {
      // 同期フォールバック
      const textarea = document.createElement('textarea');
      textarea.value = markdown;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
      } catch (err) {
        setCopied(false);
      } finally {
        document.body.removeChild(textarea);
      }
    }
  };

  return (
    <section className="export-card">
      <header>
        <h3>AI 採点用 Markdown</h3>
        <button type="button" className="secondary" onClick={handleCopy}>
          {copied ? 'コピーしました' : 'Markdown をコピー'}
        </button>
      </header>
      <p className="summary">問題文・コード・テスト結果をまとめた Markdown を生成します。外部 AI に貼り付けて採点を依頼してください。</p>
      <pre className="export-preview">{markdown}</pre>
    </section>
  );
}
