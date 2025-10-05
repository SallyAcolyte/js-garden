import React from 'react';
import heroImage from '../assets/title.png';

export default function ProblemDetail({ problem }) {
  if (!problem) {
    return (
      <section className="problem-detail empty">
        <img src={heroImage} alt="JS Garden" />
        <div className="problem-body">
          <p>ようこそ JS Garden へ。文字列処理を中心としたアルゴリズム問題で、実践的にコーディング力を磨けます。</p>
          <p>サイドバーから気になる問題を選んで、右側のエディタでコードを書き、テストを実行してみましょう。</p>
          <div className="service-disclaimer">
            <p>このサービスは Codex による Vibe Coding で開発されています。個人・商用問わず自由に利用できますが、いかなる保証も提供していません。</p>
            <p>機能や提供内容は予告なく変更または終了となる場合があります。最新情報はリポジトリの更新履歴を確認してください。</p>
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
