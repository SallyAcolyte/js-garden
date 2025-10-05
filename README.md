# JS Garden

ブラウザで動作する SPA 形式の JavaScript 学習ツールです。コーディングテスト対策として、文字列操作を中心とした課題を用意しています。テキストエリアでコードを編集してテストを実行し、その場で結果を確認できます。

## セットアップ

    npm install
    npm run dev

npm run dev を実行すると Vite の開発サーバーが起動します。ブラウザで http://localhost:5173 を開くとツールが利用できます。

本番ビルドは次のコマンドです。

    npm run build
    npm run preview

## 静的デプロイ

`npm run build` 実行後に生成される `dist/` ディレクトリは静的ファイルだけで構成されています。GitHub Pages や Netlify、社内の静的ホスティングにそのまま配置するだけで動作します。`vite.config.js` の `base: './'` 設定により、サブディレクトリ配下にデプロイしても相対パスで読み込めます。

ローカルでビルド結果を確認したい場合は次を実行してください。

    npm run preview

## 構成

- src/problems/index.js
  - 問題のメタ情報・テストケースを配列で定義しています。
  - functionName と starterCode に含まれる関数名は一致させてください。
  - tests には args（配列）と expected、もしくは assert（戻り値を受け取り真偽値を返す関数）を指定できます。
- src/lib/testRunner.js
  - 受け取ったコードを new Function で評価し、問題に紐付くテストを実行します。
- src/components/
  - サイドバー、問題詳細、エディタ、結果表示の各 UI コンポーネントをまとめています。
  - `EditorPanel.jsx` は CodeMirror ベースのエディタを提供します。
  - `CustomRunPanel.jsx` は任意の引数を使ったワンショット実行を扱います。

## 問題の追加方法

1. src/problems/index.js の配列にオブジェクトを追加します。
2. id（ユニーク）、title、summary、difficulty、tags、functionName、starterCode、tests などを設定します。
3. starterCode にはテンプレートとなる関数を文字列で記述します。コメントで TODO を示して学習者が編集しやすくしてください。
4. tests は args と expected の組み合わせを複数定義するか、柔軟な判定が必要な場合は assert 関数を使ってください。

## メモ

- 実装したコードはブラウザの localStorage に保存されるため、ページをリロードしても編集内容が維持されます。
- console.log などの標準的なデバッグ手法が利用できます。
- npm audit で報告される既知の moderate 脆弱性が 2 件あります。必要に応じて npm audit fix を実行してください。
- 右側パネルの「任意入力で試す」で JSON 配列を指定すると、その場でコードを実行し戻り値やエラーを確認できます。
- エディタは CodeMirror を利用しており、シンタックスハイライトやマルチキャレットなどの基本機能が利用できます。
- ユーザーコードはブラウザ内で `new Function` により評価されます。利用者自身のコードを対象としているため大きなリスクはありませんが、信頼できないコードを共有/貼り付ける際は注意してください。
