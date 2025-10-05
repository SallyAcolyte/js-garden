import React from 'react';

const difficultyOptions = [
  { value: 'All', label: 'すべて' },
  { value: 'Easy', label: 'Easy' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Hard', label: 'Hard' },
];

const sortOptions = [
  { value: 'default', label: '推奨順' },
  { value: 'difficulty-asc', label: '難易度(易→難)' },
  { value: 'difficulty-desc', label: '難易度(難→易)' },
  { value: 'title-asc', label: 'タイトルA→Z' },
  { value: 'title-desc', label: 'タイトルZ→A' },
];

function ChipButton({ active, children, onClick }) {
  return (
    <button type="button" className={'chip-button' + (active ? ' active' : '')} onClick={onClick}>
      {children}
    </button>
  );
}

function FilterGroup({ label, options, value, onChange, layout = 'row' }) {
  const wrapperClass = layout === 'grid' ? 'chip-collection grid' : 'chip-collection row';
  return (
    <div className="filter-group">
      <span className="filter-label">{label}</span>
      <div className={wrapperClass}>
        {options.map((option) => (
          <ChipButton key={option.value} active={value === option.value} onClick={() => onChange(option.value)}>
            {option.label}
          </ChipButton>
        ))}
      </div>
    </div>
  );
}

export default function ProblemSidebar({
  problems,
  selectedId,
  filters,
  onFiltersChange,
  onSelect,
  onResetSelection,
  tagOptions,
  categoryOptions,
  solvedIds,
  totalCount,
}) {
  const solvedSet = solvedIds instanceof Set ? solvedIds : new Set(Array.isArray(solvedIds) ? solvedIds : []);
  const solvedCount = solvedSet.size;
  const total = typeof totalCount === 'number' ? totalCount : problems.length;

  const categoryChips = categoryOptions.map((option) => ({
    value: option,
    label: option === 'All' ? 'すべて' : option,
  }));

  const tagChips = tagOptions.map((tag) => ({
    value: tag,
    label: tag === 'All' ? 'すべて' : tag,
  }));

  const handleQueryChange = (event) => {
    onFiltersChange({ ...filters, query: event.target.value });
  };

  const handleFilterChange = (field, value) => {
    if (filters[field] === value) {
      if (value === 'All') return;
      onFiltersChange({ ...filters, [field]: 'All' });
      return;
    }
    onFiltersChange({ ...filters, [field]: value });
  };

  const handleSortChange = (value) => {
    if (filters.sort === value) return;
    onFiltersChange({ ...filters, sort: value });
  };

  const handleLogoClick = () => {
    if (typeof onResetSelection === 'function') {
      onResetSelection();
    }
  };

  return (
    <aside className="sidebar">
      <header className="sidebar-header">
        <button type="button" className="logo-button" onClick={handleLogoClick} aria-label="トップ画面に戻る">
          JS Garden
        </button>
        <p>コーディングテストに備える実践型トレーニング</p>
        <div className="sidebar-progress">解いた問題 {solvedCount} / {total}</div>
      </header>

      <div className="sidebar-controls">
        <div className="sidebar-announcement">
          <p>このサービスは Codex による Vibe Coding で開発されました。個人・商用問わず自由に利用できますが、いかなる保証もありません。</p>
          <p>提供内容は予告なく変更・終了される場合があります。</p>
        </div>
        <input
          type="search"
          placeholder="問題を検索..."
          value={filters.query}
          onChange={handleQueryChange}
        />
        <FilterGroup label="難易度" options={difficultyOptions} value={filters.difficulty} onChange={(value) => handleFilterChange('difficulty', value)} />
        <FilterGroup label="カテゴリ" options={categoryChips} value={filters.category} onChange={(value) => handleFilterChange('category', value)} layout="grid" />
        <FilterGroup label="タグ" options={tagChips} value={filters.tag} onChange={(value) => handleFilterChange('tag', value)} layout="grid" />
      </div>

      <div className="problem-scroll">
        <div className="sort-control">
          <span className="filter-label">並び替え</span>
          <div className="chip-collection row">
            {sortOptions.map((option) => (
              <ChipButton key={option.value} active={filters.sort === option.value} onClick={() => handleSortChange(option.value)}>
                {option.label}
              </ChipButton>
            ))}
          </div>
        </div>

        {problems.length > 0 ? (
          <ul className="problem-list">
            {problems.map((problem) => {
              const isActive = problem.id === selectedId;
              const solved = solvedSet.has(problem.id);
              return (
                <li key={problem.id} className={isActive ? 'active' : ''}>
                  <button type="button" onClick={() => onSelect(problem.id)}>
                    <div className="problem-list-title">
                      <strong>{problem.title}</strong>
                      {solved && <span className="pill solved">済</span>}
                    </div>
                    <div className="problem-meta-row">
                      <span className={'badge difficulty-' + problem.difficulty}>{problem.difficulty}</span>
                      <span className="problem-category">{problem.category}</span>
                      <span className="problem-tags">{problem.tags.slice(0, 3).join(', ')}</span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="empty-group">該当する問題がありません</p>
        )}
      </div>
    </aside>
  );
}
