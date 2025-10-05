import React, { useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';

export default function EditorPanel({ value, onChange, onRun, onReset, running }) {
  const extensions = useMemo(() => [
    javascript({ jsx: false, typescript: false }),
    EditorView.lineWrapping
  ], []);

  return (
    <section className="editor-card">
      <header>
        <h3>コードエディタ</h3>
        <div className="controls">
          <button type="button" className="secondary" onClick={onReset} disabled={running}>
            リセット
          </button>
          <button type="button" className="primary" onClick={onRun} disabled={running}>
            {running ? '実行中...' : 'テストを実行'}
          </button>
        </div>
      </header>
      <p className="summary">指定された関数名を変更せずにコードを記述してください。ローカル環境のように console.log も利用できます。</p>
      <div className="editor-wrapper">
        <CodeMirror
          value={value}
          theme={oneDark}
          height="100%"
          extensions={extensions}
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            highlightActiveLine: true,
            highlightActiveLineGutter: true,
            bracketMatching: true,
          }}
          onChange={(nextValue) => onChange(nextValue)}
        />
      </div>
    </section>
  );
}
