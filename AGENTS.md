# Repository Guidelines

## Project Structure & Module Organization
JS Garden is a Vite-powered SPA. Runtime code lives in `src/`: `components/` houses React views, `lib/` hosts utilities such as `testRunner.js`, `problems/` stores exercises, and `styles.css` defines global styles. Static assets belong in `src/assets/`, while `index.html` bootstraps the app. Production builds land in `dist/`; avoid manual edits there and keep drafts in `exercises/`.

## Build, Test, and Development Commands
- `npm install` installs dependencies; rerun after dependency updates.
- `npm run dev` starts the Vite dev server at http://localhost:5173 with hot module reload.
- `npm run build` produces the optimized static bundle in `dist/`.
- `npm run preview` serves the latest build locally; use it to validate deployment artifacts.
- `npm audit` reports upstream advisories when dependencies change.
- Rollup の optional dependency が起因で失敗したら `rm -rf node_modules package-lock.json && npm install` の後に再ビルドします。

## Coding Style & Naming Conventions
Stick to the established 2-space indentation, single quotes, and trailing semicolons. React components use PascalCase filenames (`ProblemSidebar.jsx`) with matching exports; helper functions stay `camelCase`. Keep problem metadata concise and ensure `functionName` mirrors the function inside `starterCode`. Inline TODO hints remain Japanese. starterCode は代表的な型ガードを自動挿入するため、新しい引数を導入する際は `PARAMETER_GUARDS` を更新するか既存の名称（`input`, `values`, `items` など）を流用してください。

## UI Interaction Guidelines
- 問題選択は URL ハッシュ（例: `#/reverse-string`）と同期させ、左上ロゴでハッシュをクリアして空状態へ戻します。
- サイドバーのフィルターはチップ型レイアウトを維持し、難易度/並び替えは横並び、カテゴリ/タグは縦スクロールのグリッドで横スクロールを避けます。
- 問題リストは縦スクロール専用とし、進捗ピル（`済`）や難易度バッジで解答状況を示します。
- テスト結果カードでは `runTests` が返す入力表示を維持し、追加ケースでも可読性を意識します。

## Testing Guidelines
In-app tests drive verification. Run `npm run dev`, pick a problem, and use “テストを実行” to exercise the `tests` array processed by `runTests` in `src/lib/testRunner.js`. When adding content, seed the array with minimal, typical, and edge cases; switch to an `assert` callback if comparison needs logic. Capture bug repros as new test entries before shipping fixes.
入力値がそのまま表示されるため、配列やオブジェクトは `formatValue` で読みやすい形になるデータを選びます。

## Commit & Pull Request Guidelines
This archive omits Git history, so adopt Conventional Commits (`feat: add fibonacci practice`) for consistency. Keep commits focused, referencing problem IDs or component names when useful. Pull requests should explain learner impact, call out touched areas, and attach screenshots or clips for UI changes. Note which commands you ran (`npm run dev`, `npm run preview`) and link related issues.

## Problem Authoring Tips
Clone an existing object in `src/problems/index.js` when crafting new drills. Provide a unique `id`, a succinct `summary`, considered `difficulty`, and descriptive `tags` to keep filters accurate. Offer friendly starter code—favor readable helpers over clever tricks—and document new ideas in the summary. Add supporting assets to `src/assets/` so Vite handles bundling automatically.
starterCode の型ガードで過剰な例外が出ないよう入力前提を問題文に明記し、必要なら `PARAMETER_GUARDS` / `GUARD_TEMPLATES` を拡張してコメントも調整してください。
