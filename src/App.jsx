import React, { useEffect, useMemo, useState } from 'react';
import ProblemSidebar from './components/ProblemSidebar.jsx';
import ProblemDetail from './components/ProblemDetail.jsx';
import EditorPanel from './components/EditorPanel.jsx';
import ResultPanel from './components/ResultPanel.jsx';
import CustomRunPanel from './components/CustomRunPanel.jsx';
import ExportPanel from './components/ExportPanel.jsx';
import { problems, getTagOptions, getCategoryOptions } from './problems/index.js';
import { runTests } from './lib/testRunner.js';

const STORAGE_KEY_CODE = 'js-garden-code-map';
const STORAGE_KEY_SOLVED = 'js-garden-solved-set';
const DIFFICULTY_ORDER = { Easy: 0, Medium: 1, Hard: 2 };

function useCodeStorage(initialMap) {
  const [codeMap, setCodeMap] = useState(() => {
    if (typeof window === 'undefined') return initialMap;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY_CODE);
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
      window.localStorage.setItem(STORAGE_KEY_CODE, JSON.stringify(codeMap));
    } catch (error) {
      console.warn('コードを保存できませんでした', error);
    }
  }, [codeMap]);

  return [codeMap, setCodeMap];
}

function useSolvedStorage(initialSolved) {
  const [solvedSet, setSolvedSet] = useState(() => {
    const fallback = initialSolved instanceof Set ? new Set(initialSolved) : new Set();
    if (typeof window === 'undefined') return fallback;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY_SOLVED);
      if (!stored) return fallback;
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return fallback;
      return new Set(parsed);
    } catch (error) {
      console.warn('解答状況を読み込めませんでした', error);
      return fallback;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY_SOLVED, JSON.stringify(Array.from(solvedSet)));
    } catch (error) {
      console.warn('解答状況を保存できませんでした', error);
    }
  }, [solvedSet]);

  return [solvedSet, setSolvedSet];
}

export default function App() {
  const tagOptions = useMemo(() => getTagOptions(), []);
  const categoryOptions = useMemo(() => getCategoryOptions(), []);
  const problemOrder = useMemo(() => {
    const map = new Map();
    problems.forEach((problem, index) => {
      map.set(problem.id, index);
    });
    return map;
  }, []);
  const [filters, setFilters] = useState({ query: '', difficulty: 'All', tag: 'All', category: 'All', sort: 'default' });
  const [selectedId, setSelectedId] = useState(() => {
    if (typeof window === 'undefined') return null;
    const hash = window.location.hash.replace(/^#/, '');
    return problems.some((problem) => problem.id === hash) ? hash : null;
  });
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const syncFromHash = () => {
      const raw = window.location.hash.replace(/^#/, '');
      setSelectedId((current) => {
        if (raw.length === 0) {
          return null;
        }
        if (!problems.some((item) => item.id === raw)) {
          return current;
        }
        return raw;
      });
    };
    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => {
      window.removeEventListener('hashchange', syncFromHash);
    };
  }, []);

  const updateLocationHash = (value) => {
    if (typeof window === 'undefined') return;
    const base = window.location.pathname + window.location.search;
    window.history.replaceState(null, '', value ? `${base}#${value}` : base);
  };

  useEffect(() => {
    updateLocationHash(selectedId);
  }, [selectedId]);

  const initialCodeMap = useMemo(() => {
    const map = {};
    for (const problem of problems) {
      map[problem.id] = problem.starterCode;
    }
    return map;
  }, []);
  const [codeMap, setCodeMap] = useCodeStorage(initialCodeMap);
  const [resultMap, setResultMap] = useState({});
  const [persistedSolved, setPersistedSolved] = useSolvedStorage(new Set());
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
  }, [filters.category, filters.difficulty, filters.query, filters.tag]);

  const sortedProblems = useMemo(() => {
    if (filters.sort === 'default') {
      return filteredProblems;
    }
    const items = [...filteredProblems];
    if (filters.sort === 'difficulty-asc') {
      items.sort((a, b) => {
        const diff = DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty];
        if (diff !== 0) return diff;
        return (problemOrder.get(a.id) ?? 0) - (problemOrder.get(b.id) ?? 0);
      });
    } else if (filters.sort === 'difficulty-desc') {
      items.sort((a, b) => {
        const diff = DIFFICULTY_ORDER[b.difficulty] - DIFFICULTY_ORDER[a.difficulty];
        if (diff !== 0) return diff;
        return (problemOrder.get(a.id) ?? 0) - (problemOrder.get(b.id) ?? 0);
      });
    } else if (filters.sort === 'title-asc') {
      items.sort((a, b) => {
        const diff = a.title.localeCompare(b.title, 'ja');
        if (diff !== 0) return diff;
        return (problemOrder.get(a.id) ?? 0) - (problemOrder.get(b.id) ?? 0);
      });
    } else if (filters.sort === 'title-desc') {
      items.sort((a, b) => {
        const diff = b.title.localeCompare(a.title, 'ja');
        if (diff !== 0) return diff;
        return (problemOrder.get(a.id) ?? 0) - (problemOrder.get(b.id) ?? 0);
      });
    }
    return items;
  }, [filteredProblems, filters.sort, problemOrder]);

  useEffect(() => {
    if (!selectedId) return;
    if (sortedProblems.some((item) => item.id === selectedId)) return;
    if (sortedProblems.length > 0) {
      setSelectedId(sortedProblems[0].id);
    } else {
      setSelectedId(null);
    }
  }, [selectedId, sortedProblems]);

  const currentProblem = problems.find((item) => item.id === selectedId) || null;
  const currentCode = currentProblem ? codeMap[selectedId] ?? currentProblem.starterCode : '';
  const currentResult = currentProblem ? resultMap[selectedId] ?? null : null;
  const solvedIds = useMemo(() => {
    const solved = new Set(persistedSolved instanceof Set ? persistedSolved : []);
    for (const [problemId, result] of Object.entries(resultMap)) {
      if (result && result.summary && result.summary.status === 'pass') {
        solved.add(problemId);
      } else if (result && result.summary && result.summary.status !== 'pass') {
        solved.delete(problemId);
      }
    }
    return solved;
  }, [persistedSolved, resultMap]);
  const totalProblems = problems.length;

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

  const handleResetSelection = () => {
    setSelectedId(null);
  };

  const handleReset = () => {
    if (!currentProblem) return;
    const restored = currentProblem.starterCode;
    setCodeMap({ ...codeMap, [currentProblem.id]: restored });
    setResultMap({ ...resultMap, [currentProblem.id]: null });
    setPersistedSolved((previous) => {
      if (!previous || !previous.has(currentProblem.id)) return previous;
      const next = new Set(previous);
      next.delete(currentProblem.id);
      return next;
    });
  };

  const handleRun = async () => {
    if (!currentProblem) return;
    setRunning(true);
    await new Promise((resolve) => setTimeout(resolve, 30));
    const outcome = runTests(currentProblem, currentCode);
    setResultMap({ ...resultMap, [currentProblem.id]: outcome });
    setPersistedSolved((previous) => {
      const next = new Set(previous || []);
      if (outcome && outcome.summary && outcome.summary.status === 'pass') {
        next.add(currentProblem.id);
      } else {
        next.delete(currentProblem.id);
      }
      return next;
    });
    setRunning(false);
  };

  return (
    <div className="app">
      <div className="app-shell">
        <ProblemSidebar
          problems={sortedProblems}
          selectedId={selectedId}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onSelect={handleSelect}
          onResetSelection={handleResetSelection}
          tagOptions={tagOptions}
          categoryOptions={categoryOptions}
          solvedIds={solvedIds}
          totalCount={totalProblems}
        />
        <main className="main">
          <ProblemDetail problem={currentProblem} />
          {currentProblem ? (
            <div className="code-editor">
              <EditorPanel value={currentCode} onChange={handleCodeChange} onRun={handleRun} onReset={handleReset} running={running} />
              <div className="result-stack">
                <ResultPanel result={currentResult} />
                <CustomRunPanel problem={currentProblem} code={currentCode} />
                <ExportPanel problem={currentProblem} code={currentCode} result={currentResult} />
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
