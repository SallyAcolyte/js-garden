import React from 'react';
import heroImage from '../assets/title.png';

export default function ProblemDetail({ problem }) {
  if (!problem) {
    return (
      <section className="problem-detail empty">
        <img src={heroImage} alt="JS Garden" />
        <div className="problem-body">
          <h2>JS Garden にようこそ</h2>
          <p>文字列アルゴリズムに特化した JavaScript 練習場です。課題を選び、右側のエディタで解答を書いてテストを走らせましょう。</p>
          <div className="service-disclaimer">
            <p><strong>JS Garden</strong> は Codex の Vibe Coding プログラムで制作されています。個人・商用を問わず無料でご利用いただけますが、動作保証は提供していません。</p>
            <p>機能は予告なく変更・終了することがあります。最新状況はリポジトリの更新履歴をご確認ください。</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="problem-detail">
      <h2>{problem.title}</h2>
      <div>
        <span className={'badge difficulty-' + problem.difficulty}>{problem.difficulty}</span>
        {problem.category && (
          <span className="badge badge-category">{problem.category}</span>
        )}
        {problem.tags.map((tag) => (
          <span key={tag} className="badge">
            {tag}
          </span>
        ))}
      </div>
      <div className="problem-body">
        <p>{problem.summary}</p>
        <p>{problem.prompt}</p>
      </div>
      {problem.constraints && problem.constraints.length > 0 && (
        <div>
          <strong>制約:</strong>
          <ul>
            {problem.constraints.map((constraint) => (
              <li key={constraint}>{constraint}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
