import React from 'react';

function SummaryBanner({ summary }) {
  if (!summary) return null;

  const statusClass = summary.status === 'pass' ? 'badge difficulty-Easy' : summary.status === 'fail' ? 'badge difficulty-Medium' : 'badge difficulty-Hard';

  return (
    <div className="summary">
      <span className={statusClass}>{summary.status}</span>
      <span style={{ marginLeft: '0.5rem' }}>{summary.message}</span>
      {typeof summary.durationMs === 'number' && (
        <span style={{ marginLeft: '0.5rem' }}>({summary.durationMs}ms)</span>
      )}
    </div>
  );
}

export default function ResultPanel({ result }) {
  if (!result) {
    return (
      <section className="result-card">
        <header>
          <h3>テスト結果</h3>
        </header>
        <p className="summary">まだテストを実行していません。課題に応じたコードを書き、テストを実行してください。</p>
      </section>
    );
  }

  if (result.summary.status === 'compile-error') {
    return (
      <section className="result-card">
        <header>
          <h3>テスト結果</h3>
        </header>
        <div className="test-result fail">
          <h4>コードを評価できませんでした</h4>
          <pre>{result.summary.message}</pre>
        </div>
      </section>
    );
  }

  return (
    <section className="result-card">
      <header>
        <h3>テスト結果</h3>
      </header>
      <SummaryBanner summary={result.summary} />
      <div className="test-results">
        {result.items.map((item, index) => (
          <div key={index} className={'test-result ' + (item.outcome === 'pass' ? 'pass' : item.outcome === 'fail' ? 'fail' : 'error')}>
            <h4>{item.description}</h4>
            {item.outcome === 'error' ? (
              <>
                <pre>エラー: {item.error}</pre>
                {item.stack && <pre>{item.stack}</pre>}
              </>
            ) : (
              <>
                <pre>期待値: {item.expected}</pre>
                <pre>戻り値: {item.received}</pre>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
