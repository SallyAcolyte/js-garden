import React, { useEffect, useMemo, useState } from 'react';
import { runCustomExecution, formatValue } from '../lib/testRunner.js';

const DEFAULT_ARGS = {
  'reverse-string': '["garden"]',
  'is-palindrome': '["No lemon, no melon"]',
  'count-characters': '["hello world"]',
  camelize: '["background-color"]',
};

function useDefaultArgs(problem) {
  return useMemo(() => {
    if (!problem) return '[]';
    return DEFAULT_ARGS[problem.id] || '[]';
  }, [problem]);
}

export default function CustomRunPanel({ problem, code }) {
  const defaultArgs = useDefaultArgs(problem);
  const [argsText, setArgsText] = useState(defaultArgs);
  const [parseError, setParseError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    setArgsText(defaultArgs);
    setParseError('');
    setResult(null);
  }, [defaultArgs]);

  if (!problem) {
    return null;
  }

  const handleRun = () => {
    setParseError('');

    let parsedArgs;
    try {
      parsedArgs = JSON.parse(argsText || '[]');
    } catch (error) {
      setParseError('JSON の解析に失敗しました: ' + error.message);
      setResult(null);
      return;
    }

    if (!Array.isArray(parsedArgs)) {
      setParseError('実行する引数は JSON 配列で指定してください。例: ["sample", 42]');
      setResult(null);
      return;
    }

    const execution = runCustomExecution(problem, code, parsedArgs);
    setResult({ ...execution, args: parsedArgs });
  };

  return (
    <section className="run-card">
      <header>
        <h3>任意入力で試す</h3>
        <button type="button" className="secondary" onClick={handleRun}>
          実行する
        </button>
      </header>
      <p className="summary">JSON 配列形式で引数を指定し、現在のコードを単体で実行できます。</p>
      <textarea
        className={parseError ? 'invalid' : ''}
        value={argsText}
        onChange={(event) => setArgsText(event.target.value)}
        spellCheck="false"
        rows={3}
        placeholder='例: ["hello", 3]'
      />
      {parseError && <p className="parse-error">{parseError}</p>}
      {result && (
        <div className="custom-result">
          <div className={'badge status-' + result.status}>
            {result.status === 'success' && 'success'}
            {result.status === 'compile-error' && 'compile-error'}
            {result.status === 'runtime-error' && 'runtime-error'}
          </div>
          <span className="duration">{result.durationMs}ms</span>
          <div className="result-body">
            {result.status === 'success' && (
              <>
                <p>引数: {formatValue(result.args)}</p>
                <p>戻り値: {result.formatted}</p>
              </>
            )}
            {result.status !== 'success' && (
              <>
                <p>メッセージ: {result.message}</p>
                {result.stack && <pre>{result.stack}</pre>}
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
