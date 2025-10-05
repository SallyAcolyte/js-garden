import React from 'react';

export default function ProblemSidebar({
  problems,
  selectedId,
  filters,
  onFiltersChange,
  onSelect,
  tagOptions,
  categoryOptions,
}) {
  const handleChange = (field) => (event) => {
    onFiltersChange({ ...filters, [field]: event.target.value });
  };

  const categoriesInOrder = categoryOptions.filter((option) => option !== 'All');
  const grouped = problems.reduce((accumulator, problem) => {
    const category = problem.category || 'その他';
    if (!accumulator[category]) {
      accumulator[category] = [];
    }
    accumulator[category].push(problem);
    return accumulator;
  }, {});

  return (
    <aside className="sidebar">
      <header>
        <h1>JS Garden</h1>
        <p>コーディングテストに備える実践型トレーニング</p>
      </header>

      <div className="search">
        <input
          type="search"
          placeholder="問題を検索..."
          value={filters.query}
          onChange={handleChange('query')}
        />
        <div className="filters">
          <select value={filters.difficulty} onChange={handleChange('difficulty')}>
            <option value="All">難易度: All</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          <select value={filters.category} onChange={handleChange('category')}>
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                カテゴリ: {option}
              </option>
            ))}
          </select>
          <select value={filters.tag} onChange={handleChange('tag')}>
            {tagOptions.map((tag) => (
              <option key={tag} value={tag}>
                タグ: {tag}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="problem-groups">
        {categoriesInOrder
          .filter((category) => grouped[category] && grouped[category].length > 0)
          .map((category) => (
            <section key={category} className="problem-group">
              <div className="problem-group-header">
                <h3>{category}</h3>
                <span className="problem-count">{grouped[category].length}</span>
              </div>
              <ul className="problem-list">
                {grouped[category].map((problem) => {
                  const isActive = problem.id === selectedId;
                  return (
                    <li key={problem.id} className={isActive ? 'active' : ''}>
                      <button type="button" onClick={() => onSelect(problem.id)}>
                        <strong>{problem.title}</strong>
                        <div className="problem-meta">
                          <span>{problem.difficulty}</span>
                          <span>{problem.tags.join(', ')}</span>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        {problems.length === 0 && <p className="empty-group">該当する問題がありません</p>}
      </div>
    </aside>
  );
}
