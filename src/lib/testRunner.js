const STRICT_HEADER = '"use strict";';

function compileUserCode(source, functionName) {
  const wrappedSource = [STRICT_HEADER, source, 'return typeof ' + functionName + ' === "function" ? ' + functionName + ' : undefined;'].join('\n');

  try {
    const compiled = new Function(wrappedSource)();
    if (typeof compiled !== 'function') {
      throw new Error('関数 ' + functionName + ' が見つかりません。関数名が課題の指定と一致しているか確認してください。');
    }
    return compiled;
  } catch (error) {
    throw new Error('コードを評価できません: ' + error.message);
  }
}

function isObjectLike(value) {
  return typeof value === 'object' && value !== null;
}

function deepEqual(a, b) {
  if (Object.is(a, b)) {
    return true;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i += 1) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  if (isObjectLike(a) && isObjectLike(b)) {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    for (const key of aKeys) {
      if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
      if (!deepEqual(a[key], b[key])) return false;
    }
    return true;
  }

  return false;
}

export function formatValue(value) {
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'undefined') return 'undefined';
  if (typeof value === 'function') return value.toString();
  try {
    return JSON.stringify(value, null, 2);
  } catch (error) {
    return String(value);
  }
}

export function buildSolver(problem, userCode) {
  return compileUserCode(userCode, problem.functionName);
}

export function runTests(problem, userCode) {
  const tests = problem.tests;

  let solver;
  const startedAt = performance.now();
  try {
    solver = buildSolver(problem, userCode);
  } catch (error) {
    return {
      summary: {
        status: 'compile-error',
        message: error.message,
        durationMs: Number((performance.now() - startedAt).toFixed(2)),
      },
      items: [],
    };
  }

  const results = [];
  let passCount = 0;

  for (const test of tests) {
    const rawArgs = Array.isArray(test.args) ? test.args : [];
    const resultItem = {
      description: test.description,
      args: rawArgs.map((arg) => formatValue(arg)),
    };
    try {
      const output = solver.apply(null, rawArgs);
      let passed;
      if (typeof test.assert === 'function') {
        passed = Boolean(test.assert(output));
      } else {
        passed = deepEqual(output, test.expected);
      }

      resultItem.outcome = passed ? 'pass' : 'fail';
      resultItem.expected = typeof test.assert === 'function' ? 'カスタム検証を通過' : formatValue(test.expected);
      resultItem.received = formatValue(output);

      if (!passed && typeof test.assert === 'function') {
        resultItem.expected = 'assert 関数で true を返す必要があります';
      }

      if (passed) {
        passCount += 1;
      }
    } catch (error) {
      resultItem.outcome = 'error';
      resultItem.error = error.message;
      resultItem.stack = typeof error.stack === 'string' ? error.stack : '';
    }

    results.push(resultItem);
  }

  const durationMs = Number((performance.now() - startedAt).toFixed(2));
  const status = passCount === tests.length ? 'pass' : 'fail';
  const message = status === 'pass' ? 'すべてのテストを通過しました 🎉' : passCount + ' / ' + tests.length + ' 件のテストに合格しました';

  return {
    summary: {
      status: status,
      message: message,
      durationMs: durationMs,
    },
    items: results,
  };
}

export function runCustomExecution(problem, userCode, args) {
  const startedAt = performance.now();
  let solver;
  try {
    solver = buildSolver(problem, userCode);
  } catch (error) {
    return {
      status: 'compile-error',
      message: error.message,
      durationMs: Number((performance.now() - startedAt).toFixed(2)),
    };
  }

  try {
    const value = solver.apply(null, args);
    return {
      status: 'success',
      value: value,
      formatted: formatValue(value),
      durationMs: Number((performance.now() - startedAt).toFixed(2)),
    };
  } catch (error) {
    return {
      status: 'runtime-error',
      message: error.message,
      stack: typeof error.stack === 'string' ? error.stack : '',
      durationMs: Number((performance.now() - startedAt).toFixed(2)),
    };
  }
}
