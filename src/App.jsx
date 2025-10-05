import React, { useEffect, useMemo, useState } from 'react';
import ProblemSidebar from './components/ProblemSidebar.jsx';
import ProblemDetail from './components/ProblemDetail.jsx';
import EditorPanel from './components/EditorPanel.jsx';
import ResultPanel from './components/ResultPanel.jsx';
import CustomRunPanel from './components/CustomRunPanel.jsx';
import { problems, getTagOptions, getCategoryOptions } from './problems/index.js';
import { runTests } from './lib/testRunner.js';

const STORAGE_KEY = 'js-garden-code-map';

function useCodeStorage(initialMap) {
  const [codeMap, setCodeMap] = useState(() => {
    if (typeof window === 'undefined') return initialMap;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) return initialMap;
      const parsed = JSON.parse(stored);
      return { ...initialMap, ...parsed };
    } catch (error) {
      console.warn('保存されたコードを読み込めませんでした', error);
      return initialMap;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(codeMap));
    } catch (error) {
      console.warn('コードを保存できませんでした', error);
    }
  }, [codeMap]);

  return [codeMap, setCodeMap];
}

export default function App() {
  const tagOptions = useMemo(() => getTagOptions(), []);
  const categoryOptions = useMemo(() => getCategoryOptions(), []);
  const [filters, setFilters] = useState({ query: '', difficulty: 'All', tag: 'All', category: 'All' });
  const [selectedId, setSelectedId] = useState(null);
  const initialCodeMap = useMemo(() => {
    const map = {};
    for (const problem of problems) {
      map[problem.id] = problem.starterCode;
    }
    return map;
  }, []);
  const [codeMap, setCodeMap] = useCodeStorage(initialCodeMap);
  const [resultMap, setResultMap] = useState({});
  const [running, setRunning] = useState(false);

  const filteredProblems = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    return problems.filter((problem) => {
      const matchText = query.length === 0 || problem.title.toLowerCase().includes(query) || problem.summary.toLowerCase().includes(query);
      const matchDifficulty = filters.difficulty === 'All' || problem.difficulty === filters.difficulty;
      const matchTag = filters.tag === 'All' || problem.tags.includes(filters.tag);
      const matchCategory = filters.category === 'All' || problem.category === filters.category;
      return matchText && matchDifficulty && matchTag && matchCategory;
    });
  }, [filters]);

  useEffect(() => {
    if (!selectedId || filteredProblems.some((item) => item.id === selectedId)) return;
    if (filteredProblems.length > 0) {
      setSelectedId(filteredProblems[0].id);
    }
  }, [filteredProblems, selectedId]);

  const currentProblem = problems.find((item) => item.id === selectedId) || null;
  const currentCode = currentProblem ? codeMap[selectedId] ?? currentProblem.starterCode : '';
  const currentResult = currentProblem ? resultMap[selectedId] ?? null : null;

  const handleCodeChange = (value) => {
    if (!currentProblem) return;
    setCodeMap({ ...codeMap, [currentProblem.id]: value });
  };

  const handleSelect = (id) => {
    setSelectedId(id);
  };

  const handleFiltersChange = (nextFilters) => {
    setFilters(nextFilters);
  };

  const handleReset = () => {
    if (!currentProblem) return;
    const restored = currentProblem.starterCode;
    setCodeMap({ ...codeMap, [currentProblem.id]: restored });
    setResultMap({ ...resultMap, [currentProblem.id]: null });
  };

  const handleRun = async () => {
    if (!currentProblem) return;
    setRunning(true);
    await new Promise((resolve) => setTimeout(resolve, 30));
    const outcome = runTests(currentProblem, currentCode);
    setResultMap({ ...resultMap, [currentProblem.id]: outcome });
    setRunning(false);
  };

  return (
    <div className="app">
      <div className="app-shell">
        <ProblemSidebar
          problems={filteredProblems}
          selectedId={selectedId}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onSelect={handleSelect}
          tagOptions={tagOptions}
          categoryOptions={categoryOptions}
        />
        <main className="main">
          <ProblemDetail problem={currentProblem} />
          {currentProblem ? (
            <div className="code-editor">
              <EditorPanel value={currentCode} onChange={handleCodeChange} onRun={handleRun} onReset={handleReset} running={running} />
              <div className="result-stack">
                <ResultPanel result={currentResult} />
                <CustomRunPanel problem={currentProblem} code={currentCode} />
              </div>
            </div>
          ) : (
            <section className="empty-panels">
              <p className="empty-message">左のリストから解きたい問題を選択すると、エディタとテスト結果が表示されます。</p>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
