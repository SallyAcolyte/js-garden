const PARAMETER_GUARDS = {
  input: 'string',
  text: 'string',
  path: 'string',
  words: 'array',
  values: 'array',
  items: 'array',
  pairs: 'array',
  intervals: 'array',
  matrix: 'array',
  source: 'array',
  other: 'array',
  keys: 'array',
  mapping: 'object',
  object: 'object',
  settings: 'object',
  defaults: 'object',
};

const GUARD_TEMPLATES = {
  string: (name) => [
    `  if (typeof ${name} !== 'string') {`,
    `    throw new TypeError('${name} は文字列で受け取ってください');`,
    '  }',
    '',
  ],
  array: (name) => [
    `  if (!Array.isArray(${name})) {`,
    `    throw new TypeError('${name} は配列で受け取ってください');`,
    '  }',
    '',
  ],
  object: (name) => [
    `  if (${name} === null || typeof ${name} !== 'object') {`,
    `    throw new TypeError('${name} はオブジェクトで受け取ってください');`,
    '  }',
    '',
  ],
};

function starter(signature, comment) {
  const guardLines = [];
  const match = signature.match(/^[^(]+\(([^)]*)\)$/);
  if (match) {
    const params = match[1]
      .split(',')
      .map((param) => param.trim())
      .filter((param) => param.length > 0);
    for (const param of params) {
      const guardType = PARAMETER_GUARDS[param];
      if (guardType && GUARD_TEMPLATES[guardType]) {
        guardLines.push(...GUARD_TEMPLATES[guardType](param));
      }
    }
  }

  return [
    `function ${signature} {`,
    ...guardLines,
    `  // TODO: ${comment}`,
    '',
    '}',
    '',
  ].join('\n');
}

function prompt(lines) {
  return lines.join('\n');
}

function clone(value) {
  if (value === null || typeof value !== 'object') {
    return value;
  }
  return JSON.parse(JSON.stringify(value));
}

function createProblem(category, definition) {
  const { promptLines, signature, comment, samples, solution, ...rest } = definition;
  const tests = Array.isArray(samples)
    ? samples.map((sample, index) => {
      const cloneArgs = sample.args.map((arg) => clone(arg));
      const expected = solution ? solution(...cloneArgs) : sample.expected;
      return {
        description: sample.description || 'ケース ' + (index + 1),
        args: sample.args,
        expected,
      };
    })
    : definition.tests;

  return {
    ...rest,
    category: category,
    prompt: promptLines ? prompt(promptLines) : definition.prompt,
    starterCode: signature ? starter(signature, comment) : definition.starterCode,
    tests: tests,
  };
}

function createProblems(category, definitions) {
  return definitions.map((definition) => createProblem(category, definition));
}

const stringProblems = [
  {
    id: 'reverse-string',
    title: '文字列を反転する',
    summary: '与えられた文字列を逆順に並べ替えて返します。',
    difficulty: 'Easy',
    tags: ['string', 'fundamental'],
    functionName: 'reverseString',
    prompt: prompt([
      '文字列 `input` を逆順に並べ替えて返してください。',
      '配列に変換しても文字列メソッドを利用しても構いません。',
    ]),
    starterCode: starter('reverseString(input)', '文字列を逆順にして返す'),
    constraints: ['文字列の長さは 0 〜 10^5', 'UTF-16 ベースの文字列として扱って構いません'],
    tests: [
      { description: '基本ケース', args: ['garden'], expected: 'nedrag' },
      { description: '日本語の文字列にも対応', args: ['たけやぶやけた'], expected: 'たけやぶやけた' },
      { description: '空文字列を処理', args: [''], expected: '' },
    ],
  },
  {
    id: 'is-palindrome',
    title: '英数字のみで回文判定',
    summary: '英数字以外を無視して前後対称かを判定します。',
    difficulty: 'Medium',
    tags: ['string', 'two-pointers'],
    functionName: 'isSanitizedPalindrome',
    prompt: prompt([
      '文字列 `input` から英数字以外を取り除き、小文字化した結果が回文かを判定してください。',
      '空文字や記号のみの文字列も扱えるようにします。',
    ]),
    starterCode: starter('isSanitizedPalindrome(input)', '英数字のみを使って回文判定を行う'),
    constraints: ['入力文字列の長さは 0 〜 10^4', '正規表現や配列メソッドの利用は自由'],
    tests: [
      { description: '記号を取り除いた場合は回文', args: ['A man, a plan, a canal: Panama'], expected: true },
      { description: '大文字小文字を無視', args: ['No lemon, no melon'], expected: true },
      { description: '非回文のケース', args: ['OpenAI'], expected: false },
    ],
  },
  {
    id: 'count-characters',
    title: '文字数の集計',
    summary: '文字の出現回数をオブジェクトで返します。',
    difficulty: 'Medium',
    tags: ['string', 'hash-map'],
    functionName: 'countCharacters',
    prompt: prompt([
      '文字列 `input` に含まれる各文字の出現回数を集計し、キーが文字、値が個数のオブジェクトを返してください。',
      '大文字小文字は区別します。',
    ]),
    starterCode: starter('countCharacters(input)', '文字ごとの頻度を求める'),
    constraints: ['Unicode 文字を UTF-16 のコードユニット単位で扱う', '入力の長さは最大 10^4'],
    tests: [
      { description: 'シンプルなケース', args: ['hello'], expected: { h: 1, e: 1, l: 2, o: 1 } },
      { description: '空白を含むケース', args: ['a a'], expected: { a: 2, ' ': 1 } },
      { description: '空文字列', args: [''], expected: {} },
    ],
  },
  {
    id: 'camelize',
    title: 'ハイフン区切りをキャメルケースに変換',
    summary: 'kebab-case の文字列を lowerCamelCase に変換します。',
    difficulty: 'Easy',
    tags: ['string', 'array'],
    functionName: 'camelize',
    prompt: prompt([
      'ハイフンで区切られた文字列 `input` を lowerCamelCase に変換してください。',
      '連続するハイフンは 1 つの区切りとして扱い、最初の単語は小文字のままにします。',
    ]),
    starterCode: starter('camelize(input)', 'ハイフン区切りを lowerCamelCase へ変換する'),
    constraints: ['入力は英字とハイフンのみ', '連続したハイフンは 1 つの区切りとして扱う'],
    tests: [
      { description: '基本ケース', args: ['background-color'], expected: 'backgroundColor' },
      { description: '1 単語のケース', args: ['border'], expected: 'border' },
      { description: '複数のハイフン', args: ['--leading--dash'], expected: 'leadingDash' },
    ],
  },
  {
    id: 'string-anagram-check',
    title: 'アナグラム判定',
    summary: '2 つの文字列が同じ文字構成かを判定します。',
    difficulty: 'Easy',
    tags: ['string', 'sorting'],
    functionName: 'areAnagrams',
    prompt: prompt([
      '文字列 `a` と `b` がアナグラムかどうかを判定してください。',
      '空白は無視し、大小区別もしません。',
    ]),
    starterCode: starter('areAnagrams(a, b)', '大小区別を無視してアナグラムかを判定する'),
    constraints: ['文字列の長さはそれぞれ 0 〜 10^5'],
    tests: [
      { description: '基本のアナグラム', args: ['listen', 'silent'], expected: true },
      { description: '大文字小文字を無視', args: ['Dormitory', 'dirty room'], expected: true },
      { description: '一致しないケース', args: ['apple', 'pale'], expected: false },
    ],
  },
  {
    id: 'remove-vowels',
    title: '母音の削除',
    summary: '文字列から母音を取り除きます。',
    difficulty: 'Easy',
    tags: ['string', 'filter'],
    functionName: 'removeVowels',
    prompt: prompt([
      '英字の母音 (a, i, u, e, o) および大文字を全て削除した文字列を返してください。',
      '日本語などの非英字はそのまま残します。',
    ]),
    starterCode: starter('removeVowels(input)', '母音を除外した文字列を返す'),
    constraints: ['入力の長さは 0 〜 10^5'],
    tests: [
      { description: '単純なケース', args: ['hello'], expected: 'hll' },
      { description: '大文字を含む', args: ['AIUEO'], expected: '' },
      { description: '日本語には影響なし', args: ['あいうえお'], expected: 'あいうえお' },
    ],
  },
  {
    id: 'count-vowels',
    title: '母音の数を数える',
    summary: '英字の母音がいくつ含まれるかを数えます。',
    difficulty: 'Easy',
    tags: ['string', 'counting'],
    functionName: 'countVowels',
    prompt: prompt([
      '英字の母音 (a, i, u, e, o) の出現回数を数えて数値で返してください。',
      '大文字小文字は区別しません。',
    ]),
    starterCode: starter('countVowels(input)', '英字母音の出現回数を返す'),
    constraints: ['入力の長さは最大 10^5'],
    tests: [
      { description: '通常ケース', args: ['programming'], expected: 3 },
      { description: '大文字を含む', args: ['AEIOU'], expected: 5 },
      { description: '母音を含まない', args: ['rhythm'], expected: 0 },
    ],
  },
  {
    id: 'longest-common-prefix',
    title: '最長共通接頭辞',
    summary: '複数の文字列に共通する最長の接頭辞を求めます。',
    difficulty: 'Medium',
    tags: ['string', 'array'],
    functionName: 'longestCommonPrefix',
    prompt: prompt([
      '配列 `words` に含まれる全ての文字列に共通する最長の接頭辞を返してください。',
      '共通部分が存在しない場合は空文字を返します。',
    ]),
    starterCode: starter('longestCommonPrefix(words)', '配列内の最長共通接頭辞を求める'),
    constraints: ['words.length は 0 〜 10^4', '各文字列の長さは 0 〜 200'],
    tests: [
      { description: '共通接頭辞あり', args: [['flower', 'flow', 'flight']], expected: 'fl' },
      { description: '共通部分なし', args: [['dog', 'racecar', 'car']], expected: '' },
      { description: '単一要素', args: [['solo']], expected: 'solo' },
    ],
  },
  {
    id: 'capitalize-words',
    title: '単語の頭文字を大文字化',
    summary: '各単語の先頭文字を大文字にします。',
    difficulty: 'Easy',
    tags: ['string', 'formatting'],
    functionName: 'capitalizeWords',
    prompt: prompt([
      '空白で区切られた単語の先頭文字を大文字にし、残りは小文字に整えて返してください。',
      '単語と単語の間に複数の空白がある場合はスペース 1 個に揃えます。',
    ]),
    starterCode: starter('capitalizeWords(input)', '各単語の先頭を大文字にする'),
    constraints: ['入力の長さは 0 〜 10^4'],
    tests: [
      { description: '基本ケース', args: ['hello world'], expected: 'Hello World' },
      { description: '混在ケース', args: ['jAVASCRIPT review'], expected: 'Javascript Review' },
      { description: '空文字', args: [''], expected: '' },
    ],
  },
  {
    id: 'swap-case',
    title: '大文字小文字反転',
    summary: '各文字の大文字と小文字を入れ替えます。',
    difficulty: 'Easy',
    tags: ['string', 'transform'],
    functionName: 'swapCase',
    prompt: prompt([
      '英字の大文字と小文字を互い違いに入れ替えた文字列を返してください。',
      '非英字はそのまま残します。',
    ]),
    starterCode: starter('swapCase(input)', '英字の大文字小文字を入れ替える'),
    constraints: ['入力の長さは 0 〜 10^5'],
    tests: [
      { description: '英字のみ', args: ['AbC'], expected: 'aBc' },
      { description: '混在', args: ['Hello, 世界'], expected: 'hELLO, 世界' },
      { description: '空文字', args: [''], expected: '' },
    ],
  },
  {
    id: 'run-length-encode',
    title: 'ランレングス圧縮',
    summary: '連続した文字の回数を表すエンコードを実装します。',
    difficulty: 'Medium',
    tags: ['string', 'compression'],
    functionName: 'runLengthEncode',
    prompt: prompt([
      '連続する同じ文字を `<文字><回数>` の形式で圧縮した文字列を返してください。',
      '1 回のみの出現は数字を付けずにそのまま出力します。',
    ]),
    starterCode: starter('runLengthEncode(input)', '文字列をランレングス圧縮する'),
    constraints: ['入力の長さは最大 10^4'],
    tests: [
      { description: '基本ケース', args: ['aaabbc'], expected: 'a3b2c' },
      { description: '単独文字', args: ['abcd'], expected: 'abcd' },
      { description: '数字を含む', args: ['112233'], expected: '122232' },
    ],
  },
  {
    id: 'is-isogram',
    title: 'イソグラム判定',
    summary: '同じ文字が重複していないかを確認します。',
    difficulty: 'Easy',
    tags: ['string', 'set'],
    functionName: 'isIsogram',
    prompt: prompt([
      '文字列に同じ英字が 2 回以上登場しない場合に true を返してください。',
      '大文字小文字は区別しません。ハイフンやスペースは無視します。',
    ]),
    starterCode: starter('isIsogram(input)', '重複しない文字列か判定する'),
    constraints: ['入力の長さは 0 〜 10^4'],
    tests: [
      { description: 'イソグラムの例', args: ['machine'], expected: true },
      { description: '重複あり', args: ['Alphabet'], expected: false },
      { description: '空文字', args: [''], expected: true },
    ],
  },
  {
    id: 'first-unique-char',
    title: '最初のユニーク文字',
    summary: '最初に一度しか現れない文字の位置を返します。',
    difficulty: 'Medium',
    tags: ['string', 'hash-map'],
    functionName: 'firstUniqueCharacter',
    prompt: prompt([
      '文字列 `input` において一度しか現れない最初の文字のインデックスを返してください。',
      '該当する文字が無ければ -1 を返します。',
    ]),
    starterCode: starter('firstUniqueCharacter(input)', '最初のユニーク文字の位置を探す'),
    constraints: ['入力の長さは最大 10^5'],
    tests: [
      { description: 'ユニーク文字あり', args: ['leetcode'], expected: 0 },
      { description: 'ユニーク文字が中央', args: ['loveleetcode'], expected: 2 },
      { description: 'ユニーク文字なし', args: ['aabb'], expected: -1 },
    ],
  },
  {
    id: 'slugify',
    title: 'スラグ化',
    summary: '文字列を URL フレンドリーなスラグに変換します。',
    difficulty: 'Easy',
    tags: ['string', 'regex'],
    functionName: 'slugify',
    prompt: prompt([
      '文字列を小文字に変換し、英数字とハイフンのみで構成されるスラグを生成してください。',
      '不要な記号や日本語は削除し、連続したハイフンはまとめます。',
    ]),
    starterCode: starter('slugify(input)', '文字列を URL 用スラグに整形する'),
    constraints: ['入力の長さは 0 〜 10^4'],
    tests: [
      { description: '基本ケース', args: ['Hello World!'], expected: 'hello-world' },
      { description: 'ハイフン連続', args: ['--JS  Basics??'], expected: 'js-basics' },
      { description: '日本語は削除', args: ['日本語 Slug'], expected: 'slug' },
    ],
  },
  {
    id: 'truncate-text',
    title: '指定長でトリム',
    summary: '指定した最大長で末尾に省略記号を付けて切り詰めます。',
    difficulty: 'Easy',
    tags: ['string', 'formatting'],
    functionName: 'truncateText',
    prompt: prompt([
      '文字列 `text` が `maxLength` を超える場合、末尾を `...` に置き換えて収まるようにしてください。',
      '既に短い場合はそのまま返します。',
    ]),
    starterCode: starter('truncateText(text, maxLength)', '指定長を超える場合は末尾を省略する'),
    constraints: ['maxLength は 0 〜 10^4', 'text の長さは 0 〜 10^5'],
    tests: [
      { description: '短い文字列', args: ['hello', 10], expected: 'hello' },
      { description: 'ちょうどの長さ', args: ['hello', 5], expected: 'hello' },
      { description: '省略が必要', args: ['JavaScript', 5], expected: 'Ja...' },
    ],
  },
  {
    id: 'repeat-every-k',
    title: '指定間隔で文字を繰り返す',
    summary: '文字列の各文字を k 回繰り返します。',
    difficulty: 'Easy',
    tags: ['string', 'loop'],
    functionName: 'repeatEveryK',
    prompt: prompt([
      '文字列 `input` の各文字を `k` 回ずつ繰り返して連結した文字列を返してください。',
      'k は 1 以上の整数とします。',
    ]),
    starterCode: starter('repeatEveryK(input, k)', '各文字を k 回繰り返した文字列を作る'),
    constraints: ['k は 1 〜 10^3 の整数', '入力の長さは 0 〜 10^4'],
    tests: [
      { description: '基本ケース', args: ['abc', 2], expected: 'aabbcc' },
      { description: 'k = 1', args: ['xyz', 1], expected: 'xyz' },
      { description: '数字を含む', args: ['1a', 3], expected: '111aaa' },
    ],
  },
  {
    id: 'compress-whitespace',
    title: '空白の圧縮',
    summary: '連続した空白を 1 つにまとめます。',
    difficulty: 'Easy',
    tags: ['string', 'regex'],
    functionName: 'compressWhitespace',
    prompt: prompt([
      '文字列中の連続した空白文字 (スペース、タブ) を 1 つのスペースに置き換えてください。',
      '前後の空白も削除します。',
    ]),
    starterCode: starter('compressWhitespace(input)', '余分な空白を圧縮して整形する'),
    constraints: ['入力の長さは 0 〜 10^4'],
    tests: [
      { description: '基本ケース', args: ['Hello   world'], expected: 'Hello world' },
      { description: '先頭末尾の空白', args: ['   trim   me   '], expected: 'trim me' },
      { description: 'タブ混在', args: ['a\t\tb'], expected: 'a b' },
    ],
  },
  {
    id: 'count-words',
    title: '単語数をカウント',
    summary: '空白で区切られた単語の個数を数えます。',
    difficulty: 'Easy',
    tags: ['string', 'counting'],
    functionName: 'countWords',
    prompt: prompt([
      '文字列 `input` に含まれる単語の個数を数えてください。',
      '単語は空白で区切られ、余分な空白は無視します。',
    ]),
    starterCode: starter('countWords(input)', '空白区切りの単語数を数える'),
    constraints: ['入力の長さは 0 〜 10^5'],
    tests: [
      { description: '基本ケース', args: ['the quick brown fox'], expected: 4 },
      { description: '余分な空白を無視', args: ['  hello   world  '], expected: 2 },
      { description: '空文字', args: [''], expected: 0 },
    ],
  },
  {
    id: 'remove-digits',
    title: '数字の除去',
    summary: '文字列から数字を取り除きます。',
    difficulty: 'Easy',
    tags: ['string', 'filter'],
    functionName: 'removeDigits',
    prompt: prompt([
      '文字列 `input` から 0〜9 の数字をすべて削除した文字列を返してください。',
      '英字や記号などその他の文字はそのまま保持します。',
    ]),
    starterCode: starter('removeDigits(input)', '数字を取り除いた文字列を返す'),
    constraints: ['入力の長さは 0 〜 10^5'],
    tests: [
      { description: '数字と文字が混在', args: ['abc123'], expected: 'abc' },
      { description: '数字のみの文字列', args: ['2023'], expected: '' },
      { description: '数字が無いケース', args: ['garden'], expected: 'garden' },
    ],
  },
  {
    id: 'mask-vowels',
    title: '母音をアスタリスクに置換',
    summary: '英字の母音を * に置き換えます。',
    difficulty: 'Easy',
    tags: ['string', 'transform'],
    functionName: 'maskVowels',
    prompt: prompt([
      '英字の母音 (a, i, u, e, o) とその大文字をアスタリスク (*) に置き換えた文字列を返してください。',
      'その他の文字は変更しません。',
    ]),
    starterCode: starter('maskVowels(input)', '母音を * に置き換えて返す'),
    constraints: ['入力の長さは 0 〜 10^5'],
    tests: [
      { description: '小文字の母音', args: ['hello'], expected: 'h*ll*' },
      { description: '大文字を含む', args: ['JAVASCRIPT'], expected: 'J*V*SCR*PT' },
      { description: '母音が無い', args: ['rhythm'], expected: 'rhythm' },
    ],
  },
  {
    id: 'find-longest-word',
    title: '最も長い単語を取得',
    summary: '最長の単語を 1 つ取り出します。',
    difficulty: 'Easy',
    tags: ['string', 'search'],
    functionName: 'findLongestWord',
    prompt: prompt([
      '文字列 `input` を空白で区切られた単語とみなし、最も長い単語を返してください。',
      '複数候補がある場合は最初に現れたものを返し、単語が無ければ空文字を返します。',
    ]),
    starterCode: starter('findLongestWord(input)', '最も長い単語を 1 つ返す'),
    constraints: ['入力の長さは 0 〜 10^5'],
    tests: [
      { description: '基本ケース', args: ['The quick brown fox'], expected: 'quick' },
      { description: '同じ長さの単語', args: ['jumped over lazy dogs'], expected: 'jumped' },
      { description: '単語がない', args: ['   '], expected: '' },
    ],
  },
  {
    id: 'strip-prefix',
    title: '指定プレフィックスを削除',
    summary: '先頭の一致部分を 1 度だけ取り除きます。',
    difficulty: 'Easy',
    tags: ['string', 'formatting'],
    functionName: 'stripPrefix',
    prompt: prompt([
      '文字列 `input` が `prefix` で始まる場合、先頭からその部分を取り除いた文字列を返してください。',
      '該当しない場合は `input` をそのまま返します。',
    ]),
    starterCode: starter('stripPrefix(input, prefix)', '先頭の指定文字列を取り除く'),
    constraints: ['prefix の長さは 0 〜 10^4'],
    tests: [
      { description: 'プレフィックスが一致', args: ['unhappy', 'un'], expected: 'happy' },
      { description: '繰り返しにはならない', args: ['redo', 're'], expected: 'do' },
      { description: '一致しない', args: ['garden', 'pre'], expected: 'garden' },
    ],
  },
  {
    id: 'strip-suffix',
    title: '指定サフィックスを削除',
    summary: '末尾の一致部分を 1 度だけ取り除きます。',
    difficulty: 'Easy',
    tags: ['string', 'formatting'],
    functionName: 'stripSuffix',
    prompt: prompt([
      '文字列 `input` が `suffix` で終わる場合、末尾からその部分を取り除いた文字列を返してください。',
      '該当しない場合は `input` をそのまま返します。',
    ]),
    starterCode: starter('stripSuffix(input, suffix)', '末尾の指定文字列を取り除く'),
    constraints: ['suffix の長さは 0 〜 10^4'],
    tests: [
      { description: 'サフィックスが一致', args: ['readme.md', '.md'], expected: 'readme' },
      { description: '別の末尾', args: ['holiday', 'day'], expected: 'holi' },
      { description: '一致しない', args: ['script', '.ts'], expected: 'script' },
    ],
  },
  {
    id: 'count-substring',
    title: '部分文字列の出現数',
    summary: '非重複での出現回数を数えます。',
    difficulty: 'Easy',
    tags: ['string', 'counting'],
    functionName: 'countSubstring',
    prompt: prompt([
      '文字列 `input` の中で部分文字列 `target` が左から順に何回現れるかを、重ならないように数えてください。',
      '`target` は空文字列ではないとします。',
    ]),
    starterCode: starter('countSubstring(input, target)', '重ならないように部分文字列の出現数を数える'),
    constraints: ['target の長さは 1 〜 10^4', '入力の長さは 0 〜 10^5'],
    tests: [
      { description: '複数回出現', args: ['hello hello', 'lo'], expected: 2 },
      { description: '重なりは数えない', args: ['aaaa', 'aa'], expected: 2 },
      { description: '見つからない', args: ['abcdef', 'gh'], expected: 0 },
    ],
  },
  {
    id: 'join-characters-with',
    title: '文字の間に区切りを挿入',
    summary: '各文字の間に指定した文字列を差し込みます。',
    difficulty: 'Easy',
    tags: ['string', 'formatting'],
    functionName: 'joinCharactersWith',
    prompt: prompt([
      '文字列 `input` の各文字の間に区切り文字列 `separator` を挟んで連結した文字列を返してください。',
      '入力が空の場合は空文字を返します。',
    ]),
    starterCode: starter('joinCharactersWith(input, separator)', '各文字の間に区切りを挟んで結合する'),
    constraints: ['separator の長さは 0 〜 10^3', '入力の長さは 0 〜 10^5'],
    tests: [
      { description: '基本ケース', args: ['abc', '-'], expected: 'a-b-c' },
      { description: '区切りが空文字', args: ['abc', ''], expected: 'abc' },
      { description: '1 文字の入力', args: ['A', '*'], expected: 'A' },
    ],
  },
  {
    id: 'middle-character',
    title: '中央の文字を取得',
    summary: '文字列の中央にある文字を返します。',
    difficulty: 'Easy',
    tags: ['string', 'indexing'],
    functionName: 'middleCharacter',
    prompt: prompt([
      '文字列 `input` の長さが奇数なら中央の 1 文字を、偶数なら中央 2 文字を連結して返してください。',
      '入力が空の場合は空文字を返します。',
    ]),
    starterCode: starter('middleCharacter(input)', '中央の文字または 2 文字を返す'),
    constraints: ['入力の長さは 0 〜 10^5'],
    tests: [
      { description: '奇数長の文字列', args: ['guide'], expected: 'i' },
      { description: '偶数長の文字列', args: ['test'], expected: 'es' },
      { description: '空文字', args: [''], expected: '' },
    ],
  },
  {
    id: 'extract-vowels',
    title: '母音のみ抽出',
    summary: '母音を順番に取り出した文字列を返します。',
    difficulty: 'Easy',
    tags: ['string', 'filter'],
    functionName: 'extractVowels',
    prompt: prompt([
      '文字列 `input` から英字の母音 (a, i, u, e, o) とその大文字だけを取り出して順番に連結した文字列を返してください。',
      '母音が存在しない場合は空文字を返します。',
    ]),
    starterCode: starter('extractVowels(input)', '母音だけを集めて返す'),
    constraints: ['入力の長さは 0 〜 10^5'],
    tests: [
      { description: '小文字のみ', args: ['hello world'], expected: 'eoo' },
      { description: '大文字を含む', args: ['JAVASCRIPT'], expected: 'AAI' },
      { description: '母音が無い', args: ['rhythm'], expected: '' },
    ],
  },
  {
    id: 'rotate-string',
    title: '文字列の回転',
    summary: '右方向に k 文字回転した結果を求めます。',
    difficulty: 'Easy',
    tags: ['string', 'array'],
    functionName: 'rotateString',
    prompt: prompt([
      '文字列 `input` を右方向に `k` 文字ローテーションした結果を返してください。',
      'k が長さを超える場合は余りを用いて計算します。',
    ]),
    starterCode: starter('rotateString(input, k)', '右方向に k 文字回転した文字列を返す'),
    constraints: ['k は 0 以上で input.length 以上でもよい'],
    tests: [
      { description: '基本ケース', args: ['abcdef', 2], expected: 'efabcd' },
      { description: 'k が長さを超える', args: ['hello', 7], expected: 'lohel' },
      { description: '空文字', args: ['', 10], expected: '' },
    ],
  },
  {
    id: 'reverse-words',
    title: '単語を逆順に並べ替える',
    summary: '文字列内の単語順を逆にします。',
    difficulty: 'Easy',
    tags: ['string', 'array'],
    functionName: 'reverseWords',
    prompt: prompt([
      '文字列を空白で区切られる単語ごとに分割し、逆順に並べ替えて返してください。',
      '余分な空白はトリムして 1 つにまとめます。',
    ]),
    starterCode: starter('reverseWords(input)', '単語の順番を逆に並べ替える'),
    constraints: ['入力の長さは 0 〜 10^5'],
    tests: [
      { description: '基本ケース', args: ['the sky is blue'], expected: 'blue is sky the' },
      { description: '余分な空白', args: ['  hello   world  '], expected: 'world hello' },
      { description: '単一単語', args: ['solo'], expected: 'solo' },
    ],
  },
  {
    id: 'maskify-string',
    title: '末尾 4 桁以外をマスク',
    summary: 'クレジットカード風に文字列をマスクします。',
    difficulty: 'Easy',
    tags: ['string', 'formatting'],
    functionName: 'maskifyString',
    prompt: prompt([
      '文字列の末尾 4 文字だけを残し、それ以外を # に置き換えてください。',
      '入力が 4 文字以下の場合はそのまま返します。',
    ]),
    starterCode: starter('maskifyString(input)', '末尾 4 文字以外を # に置き換える'),
    constraints: ['入力の長さは 0 〜 10^5'],
    tests: [
      { description: 'クレジットカード', args: ['1234567812345678'], expected: '############5678' },
      { description: '短い文字列', args: ['abc'], expected: 'abc' },
      { description: '記号混在', args: ['ID-0987'], expected: '###0987' },
    ],
  },
  {
    id: 'initials-from-words',
    title: '頭文字の抽出',
    summary: '文章の頭文字を集めて略称を作ります。',
    difficulty: 'Easy',
    tags: ['string', 'formatting'],
    functionName: 'extractInitials',
    prompt: prompt([
      '文章を単語に分割し、各単語の頭文字を大文字で連結した文字列を返してください。',
      '空白や記号を適切に扱います。',
    ]),
    starterCode: starter('extractInitials(input)', '単語の頭文字を取り出して大文字で結合する'),
    constraints: ['入力の長さは 0 〜 10^4'],
    tests: [
      { description: '基本ケース', args: ['JavaScript Garden'], expected: 'JG' },
      { description: '余分な空白', args: ['  hyper  text  markup  language  '], expected: 'HTML' },
      { description: '単一単語', args: ['python'], expected: 'P' },
    ],
  },
  {
    id: 'strip-html',
    title: 'HTML タグの除去',
    summary: '文字列から単純な HTML タグを取り除きます。',
    difficulty: 'Medium',
    tags: ['string', 'regex'],
    functionName: 'stripHTMLTags',
    prompt: prompt([
      '入力文字列から簡単な HTML タグを取り除き、中身だけを抽出してください。',
      'タグに含まれる属性などもまとめて削除します。',
    ]),
    starterCode: starter('stripHTMLTags(input)', '簡易的に HTML タグを除去する'),
    constraints: ['入力の長さは最大 10^5'],
    tests: [
      { description: '基本タグ', args: ['<p>Hello</p>'], expected: 'Hello' },
      { description: '属性付き', args: ['<a href="#">link</a>'], expected: 'link' },
      { description: 'タグがない', args: ['plain text'], expected: 'plain text' },
    ],
  },
  {
    id: 'remove-duplicate-letters',
    title: '重複文字の削除',
    summary: '文字列から重複する文字を 1 度目以降削除します。',
    difficulty: 'Easy',
    tags: ['string', 'set'],
    functionName: 'dedupeCharacters',
    prompt: prompt([
      '文字列に含まれる文字を最初に登場した順に 1 度だけ残し、それ以降の重複は取り除いてください。',
      '記号や数字も文字として扱います。',
    ]),
    starterCode: starter('dedupeCharacters(input)', '重複を削除して最初の出現順を保つ'),
    constraints: ['入力の長さは最大 10^5'],
    tests: [
      { description: '重複の削除', args: ['banana'], expected: 'ban' },
      { description: '記号を含む', args: ['112233!!'], expected: '123!' },
      { description: '空文字', args: [''], expected: '' },
    ],
  },
  {
    id: 'expand-tabs',
    title: 'タブをスペースに展開',
    summary: 'タブ文字を指定幅のスペースに置換します。',
    difficulty: 'Easy',
    tags: ['string', 'formatting'],
    functionName: 'expandTabs',
    prompt: prompt([
      '文字列に含まれるタブ文字 (\t) を指定された個数のスペースに置き換えてください。',
      '他の文字は変更しません。',
    ]),
    starterCode: starter('expandTabs(input, tabSize)', 'タブ文字を指定数のスペースに置換する'),
    constraints: ['tabSize は 1 〜 8', '入力の長さは最大 10^5'],
    tests: [
      { description: '基本ケース', args: ['a\tb', 4], expected: 'a    b' },
      { description: '複数タブ', args: ['\t\t', 2], expected: '    ' },
      { description: 'タブなし', args: ['abc', 4], expected: 'abc' },
    ],
  },
  {
    id: 'pad-string',
    title: '文字列のパディング',
    summary: '左右にパディング文字を追加します。',
    difficulty: 'Easy',
    tags: ['string', 'formatting'],
    functionName: 'padString',
    prompt: prompt([
      '文字列を `targetLength` に揃えるため、パディング文字 `padChar` を左右に交互で追加してください。',
      '長さが足りない分だけ追加し、超えている場合はそのまま返します。',
    ]),
    starterCode: starter('padString(input, targetLength, padChar)', '指定長に達するまで左右をパディングする'),
    constraints: ['padChar は 1 文字', 'targetLength は 0 〜 10^4'],
    tests: [
      { description: '短い文字列', args: ['42', 5, '0'], expected: '00420' },
      { description: 'すでに十分な長さ', args: ['hello', 3, '*'], expected: 'hello' },
      { description: '奇数パディング', args: ['a', 4, '-'], expected: '--a-' },
    ],
  },
  {
    id: 'split-every-n',
    title: '指定長で分割',
    summary: '文字列を n 文字ずつ分割して配列にします。',
    difficulty: 'Easy',
    tags: ['string', 'array'],
    functionName: 'splitEveryN',
    prompt: prompt([
      '文字列を左から順に `n` 文字ずつ切り出し、配列に格納して返してください。',
      '最後の要素は残りの文字をそのまま含めます。',
    ]),
    starterCode: starter('splitEveryN(input, n)', '文字列を n 文字ずつ配列に分割する'),
    constraints: ['n は 1 〜 10^4'],
    tests: [
      { description: '基本ケース', args: ['abcdef', 2], expected: ['ab', 'cd', 'ef'] },
      { description: '余りが出る', args: ['abcdefg', 3], expected: ['abc', 'def', 'g'] },
      { description: 'n=1', args: ['abc', 1], expected: ['a', 'b', 'c'] },
    ],
  },
  {
    id: 'string-to-char-codes',
    title: '文字コード配列化',
    summary: '各文字の UTF-16 コードを配列で返します。',
    difficulty: 'Easy',
    tags: ['string', 'mapping'],
    functionName: 'stringToCharCodes',
    prompt: prompt([
      '文字列の各文字に対し `charCodeAt` で得られるコード値を配列にまとめて返してください。',
      '空文字列の場合は空配列を返します。',
    ]),
    starterCode: starter('stringToCharCodes(input)', '各文字のコード値を配列で返す'),
    constraints: ['入力の長さは 0 〜 10^5'],
    tests: [
      { description: '英文字', args: ['ABC'], expected: [65, 66, 67] },
      { description: '数字混在', args: ['A1'], expected: [65, 49] },
      { description: '空文字', args: [''], expected: [] },
    ],
  },
  {
    id: 'string-min-window-cover',
    title: '最短カバーサブストリング',
    summary: 'target の全ての文字を含む最短の部分文字列を探します。',
    difficulty: 'Hard',
    tags: ['string', 'sliding-window'],
    functionName: 'minWindowSubstring',
    prompt: prompt([
      '文字列 `text` の中から、`target` に含まれる全ての文字を必要回数そろえて含む最短の部分文字列を求めてください。',
      '条件を満たす部分文字列が存在しない場合は空文字列を返します。',
    ]),
    starterCode: starter('minWindowSubstring(text, target)', 'target をすべて含む最短部分文字列を返す'),
    constraints: ['text の長さは 0 〜 10^5', 'target の長さは 1 〜 10^4'],
    tests: [
      { description: '典型ケース', args: ['ADOBECODEBANC', 'ABC'], expected: 'BANC' },
      { description: '重複する文字が必要', args: ['aa', 'aa'], expected: 'aa' },
      { description: '対象が含まれない', args: ['hello', 'xyz'], expected: '' },
    ],
  },
  {
    id: 'string-min-palindrome-cuts',
    title: '最小回文分割数',
    summary: '文字列を回文に分割するときの最小カット数を求めます。',
    difficulty: 'Hard',
    tags: ['string', 'dynamic-programming', 'palindrome'],
    functionName: 'minPalindromeCuts',
    prompt: prompt([
      '文字列 `text` を 1 つ以上の連続した回文部分文字列に分割する際の最小カット数を求めてください。',
      'すでに回文である場合は 0 を返し、空文字列の場合も 0 とします。',
    ]),
    starterCode: starter('minPalindromeCuts(text)', '文字列を回文分割するときの最小カット数を求める'),
    constraints: ['text の長さは 0 〜 10^3'],
    tests: [
      { description: '回文にまとまる', args: ['aab'], expected: 1 },
      { description: '既に回文', args: ['racecar'], expected: 0 },
      { description: '複数回の分割が必要', args: ['abccbc'], expected: 2 },
    ],
  },
  {
    id: 'string-minimal-rotation',
    title: '辞書順最小回転',
    summary: '円環文字列として辞書順が最小になる回転を求めます。',
    difficulty: 'Hard',
    tags: ['string', 'lexicographical'],
    functionName: 'minimalRotation',
    prompt: prompt([
      '文字列 `input` を円環とみなし、文字列を回転させることで得られる候補のうち辞書順が最小のものを返してください。',
      '空文字列の場合は空文字列を返し、同値の回転が複数ある場合は最初に現れるものを返します。',
    ]),
    starterCode: starter('minimalRotation(input)', '辞書順が最小になるように回転した文字列を返す'),
    constraints: ['input の長さは 0 〜 10^5'],
    tests: [
      { description: '基本ケース', args: ['baca'], expected: 'abac' },
      { description: '同一文字が多い', args: ['zzza'], expected: 'azzz' },
      { description: '長めの単語', args: ['cabbage'], expected: 'abbagec' },
    ],
  },
];

const stringProblemsWithCategory = stringProblems.map((problem) => ({
  ...problem,
  category: 'Strings',
}));

const arrayTemplates = [
  {
    id: 'array-sum',
    title: '配列の合計',
    summary: '数値の配列の合計値を返します。',
    difficulty: 'Easy',
    tags: ['array', 'math'],
    functionName: 'sumArray',
    signature: 'sumArray(values)',
    comment: '配列内の数値をすべて足し合わせる',
    promptLines: [
      '数値のみからなる配列 `values` の要素を合計して返してください。',
      '空配列の場合は 0 を返します。',
    ],
    constraints: ['values.length は 0 〜 10^5', 'values の各要素は有限の数値'],
    samples: [
      { description: '基本ケース', args: [[1, 2, 3, 4]] },
      { description: '負の数を含む', args: [[-3, 7, 2]] },
      { description: '空配列', args: [[]] },
    ],
    solution: (values) => values.reduce((sum, value) => sum + value, 0),
  },
  {
    id: 'array-max',
    title: '最大値の取得',
    summary: '配列の中で最大の値を求めます。',
    difficulty: 'Easy',
    tags: ['array', 'math'],
    functionName: 'maxOfArray',
    signature: 'maxOfArray(values)',
    comment: '配列内の最大値を返す',
    promptLines: [
      '数値配列 `values` の中で最大の値を返してください。',
      '要素が存在しない場合は null を返します。',
    ],
    constraints: ['values.length は 0 〜 10^5'],
    samples: [
      { description: '昇順配列', args: [[1, 3, 5, 7]] },
      { description: '負の値を含む', args: [[-5, -2, -9]] },
      { description: '空配列', args: [[]] },
    ],
    solution: (values) => (values.length === 0 ? null : values.reduce((max, value) => (value > max ? value : max), values[0])),
  },
  {
    id: 'array-min',
    title: '最小値の取得',
    summary: '配列の中で最小の値を求めます。',
    difficulty: 'Easy',
    tags: ['array', 'math'],
    functionName: 'minOfArray',
    signature: 'minOfArray(values)',
    comment: '配列内の最小値を返す',
    promptLines: [
      '数値配列 `values` の中で最小の値を返してください。',
      '配列が空の場合は null を返します。',
    ],
    constraints: ['values.length は 0 〜 10^5'],
    samples: [
      { description: '標準ケース', args: [[8, 3, 5]] },
      { description: '負の値のみ', args: [[-5, -2, -9]] },
      { description: '空配列', args: [[]] },
    ],
    solution: (values) => (values.length === 0 ? null : values.reduce((min, value) => (value < min ? value : min), values[0])),
  },
  {
    id: 'array-average',
    title: '平均値の計算',
    summary: '配列内の平均値を求めます。',
    difficulty: 'Easy',
    tags: ['array', 'math'],
    functionName: 'averageArray',
    signature: 'averageArray(values)',
    comment: '数値配列の平均値を求める',
    promptLines: [
      '数値配列 `values` の平均値を算出して返してください。',
      '配列が空の場合は null を返します。',
    ],
    constraints: ['values.length は 0 〜 10^5'],
    samples: [
      { description: '偶数個の要素', args: [[2, 4, 6, 8]] },
      { description: '負の値を含む', args: [[-2, 4]] },
      { description: '空配列', args: [[]] },
    ],
    solution: (values) => (values.length === 0 ? null : values.reduce((sum, value) => sum + value, 0) / values.length),
  },
  {
    id: 'array-flatten-once',
    title: '1 階層のフラット化',
    summary: '配列を 1 階層だけ平坦化します。',
    difficulty: 'Easy',
    tags: ['array', 'transform'],
    functionName: 'flattenOnce',
    signature: 'flattenOnce(values)',
    comment: '入れ子配列を 1 階層だけ平坦化する',
    promptLines: [
      '配列 `values` に含まれる配列要素を 1 階層だけ展開した配列を返してください。',
      '深い入れ子はそのまま残します。',
    ],
    constraints: ['values.length は 0 〜 10^4'],
    samples: [
      { description: '単純な入れ子', args: [[1, [2, 3], 4]] },
      { description: '複数の入れ子', args: [[[1], [2, 3], 4]] },
      { description: '空配列', args: [[]] },
    ],
    solution: (values) => values.reduce((acc, item) => {
      if (Array.isArray(item)) {
        acc.push(...item);
      } else {
        acc.push(item);
      }
      return acc;
    }, []),
  },
  {
    id: 'array-chunk',
    title: 'チャンク分割',
    summary: '配列を指定サイズで分割します。',
    difficulty: 'Easy',
    tags: ['array', 'slicing'],
    functionName: 'chunkArray',
    signature: 'chunkArray(values, size)',
    comment: '配列を size ごとの小配列に分割する',
    promptLines: [
      '配列 `values` を `size` 個ずつの小さな配列に分割して返してください。',
      '`size` は 1 以上の整数であるとします。',
    ],
    constraints: ['values.length は 0 〜 10^4', 'size は 1 〜 10^4 の整数'],
    samples: [
      { description: 'ぴったり割り切れる', args: [[1, 2, 3, 4], 2] },
      { description: '余りが出る', args: [[1, 2, 3, 4, 5], 3] },
      { description: '空配列', args: [[], 3] },
    ],
    solution: (values, size) => {
      const result = [];
      for (let index = 0; index < values.length; index += size) {
        result.push(values.slice(index, index + size));
      }
      return result;
    },
  },
  {
    id: 'array-unique',
    title: '重複の除去',
    summary: '配列から重複要素を取り除いた結果を返します。',
    difficulty: 'Easy',
    tags: ['array', 'set'],
    functionName: 'uniqueArray',
    signature: 'uniqueArray(values)',
    comment: '先に現れた順序を保って重複を除去する',
    promptLines: [
      '配列 `values` の重複要素を除き、最初に現れた順序を維持した配列を返してください。',
    ],
    constraints: ['values.length は 0 〜 10^5'],
    samples: [
      { description: '重複あり', args: [[1, 2, 2, 3, 1]] },
      { description: '文字列ケース', args: [['a', 'b', 'a', 'c']] },
      { description: 'ユニークのみ', args: [[4, 5, 6]] },
    ],
    solution: (values) => {
      const seen = new Set();
      const result = [];
      for (const value of values) {
        if (!seen.has(value)) {
          seen.add(value);
          result.push(value);
        }
      }
      return result;
    },
  },
  {
    id: 'array-rotate-left',
    title: '左回転',
    summary: '配列を左方向に回転させます。',
    difficulty: 'Medium',
    tags: ['array', 'rotation'],
    functionName: 'rotateLeft',
    signature: 'rotateLeft(values, k)',
    comment: '配列を左方向に k 回転する',
    promptLines: [
      '配列 `values` を左方向に `k` 回転させた新しい配列を返してください。',
      '`k` は 0 以上の整数で、配列長を超えていても構いません。',
    ],
    constraints: ['values.length は 0 〜 10^5'],
    samples: [
      { description: '基本ケース', args: [[1, 2, 3, 4], 1] },
      { description: 'k が長さを超える', args: [[1, 2, 3], 5] },
      { description: '空配列', args: [[], 7] },
    ],
    solution: (values, k) => {
      const length = values.length;
      if (length === 0) return [];
      const offset = ((k % length) + length) % length;
      return values.slice(offset).concat(values.slice(0, offset));
    },
  },
  {
    id: 'array-rotate-right',
    title: '右回転',
    summary: '配列を右方向に回転させます。',
    difficulty: 'Medium',
    tags: ['array', 'rotation'],
    functionName: 'rotateRight',
    signature: 'rotateRight(values, k)',
    comment: '配列を右方向に k 回転する',
    promptLines: [
      '配列 `values` を右方向に `k` 回転させた配列を返してください。',
    ],
    constraints: ['values.length は 0 〜 10^5'],
    samples: [
      { description: '基本ケース', args: [[1, 2, 3, 4], 1] },
      { description: '複数回転', args: [[1, 2, 3], 4] },
      { description: '空配列', args: [[], 3] },
    ],
    solution: (values, k) => {
      const length = values.length;
      if (length === 0) return [];
      const offset = ((k % length) + length) % length;
      if (offset === 0) return values.slice();
      const cut = length - offset;
      return values.slice(cut).concat(values.slice(0, cut));
    },
  },
  {
    id: 'array-zip',
    title: '配列のジップ',
    summary: '2 つの配列を同じ位置同士で結合します。',
    difficulty: 'Easy',
    tags: ['array', 'transform'],
    functionName: 'zipArrays',
    signature: 'zipArrays(a, b)',
    comment: '同じインデックスの要素をペアにする',
    promptLines: [
      '配列 `a`, `b` の同じインデックスの要素を `[a[i], b[i]]` の形で結合した新しい配列を返してください。',
      '長さが異なる場合は短い方に合わせます。',
    ],
    constraints: ['a.length, b.length は 0 〜 10^4'],
    samples: [
      { description: '同じ長さ', args: [[1, 2], ['a', 'b']] },
      { description: '異なる長さ', args: [[1, 2, 3], [4]] },
      { description: '空配列', args: [[], [1, 2]] },
    ],
    solution: (a, b) => {
      const length = Math.min(a.length, b.length);
      const result = [];
      for (let index = 0; index < length; index += 1) {
        result.push([a[index], b[index]]);
      }
      return result;
    },
  },
  {
    id: 'array-interleave',
    title: '交互結合',
    summary: '2 つの配列の要素を交互に並べます。',
    difficulty: 'Easy',
    tags: ['array', 'merge'],
    functionName: 'interleaveArrays',
    signature: 'interleaveArrays(a, b)',
    comment: '交互に要素を配置する',
    promptLines: [
      '配列 `a` と `b` の要素を交互に並べた配列を返してください。',
      'どちらかが先に尽きた場合は残りを末尾にそのまま追加します。',
    ],
    constraints: ['a.length, b.length は 0 〜 10^4'],
    samples: [
      { description: '同じ長さ', args: [[1, 3, 5], [2, 4, 6]] },
      { description: '第二引数が短い', args: [[1, 2, 3], ['a']] },
      { description: '空の一方', args: [[1, 2], []] },
    ],
    solution: (a, b) => {
      const maxLength = Math.max(a.length, b.length);
      const result = [];
      for (let index = 0; index < maxLength; index += 1) {
        if (index < a.length) result.push(a[index]);
        if (index < b.length) result.push(b[index]);
      }
      return result;
    },
  },
  {
    id: 'array-difference',
    title: '差集合',
    summary: '片方にしか含まれない要素を求めます。',
    difficulty: 'Easy',
    tags: ['array', 'set'],
    functionName: 'differenceArray',
    signature: 'differenceArray(source, other)',
    comment: 'source から other に含まれる要素を除外する',
    promptLines: [
      '配列 `source` から配列 `other` に含まれる要素を取り除いた配列を返してください。',
      '順序は `source` の出現順を保ちます。',
    ],
    constraints: ['source.length, other.length は 0 〜 10^4'],
    samples: [
      { description: '単純なケース', args: [[1, 2, 3, 4], [2, 4]] },
      { description: '重複あり', args: [[1, 1, 2], [1]] },
      { description: '除外なし', args: [[1, 2], [3]] },
    ],
    solution: (source, other) => {
      const otherSet = new Set(other);
      return source.filter((value) => !otherSet.has(value));
    },
  },
  {
    id: 'array-intersection',
    title: '共通要素の抽出',
    summary: '2 つの配列に共通する要素を求めます。',
    difficulty: 'Medium',
    tags: ['array', 'set'],
    functionName: 'intersectionArray',
    signature: 'intersectionArray(a, b)',
    comment: '共通の要素を先に現れた順序で返す',
    promptLines: [
      '配列 `a` と `b` の両方に含まれる要素を、`a` での出現順に重複なく返してください。',
    ],
    constraints: ['a.length, b.length は 0 〜 10^4'],
    samples: [
      { description: '基本ケース', args: [[1, 2, 3, 2], [2, 4, 1]] },
      { description: '共通なし', args: [[1, 2], [3, 4]] },
      { description: '全て共通', args: [[5, 5], [5, 5, 5]] },
    ],
    solution: (a, b) => {
      const setB = new Set(b);
      const seen = new Set();
      const result = [];
      for (const value of a) {
        if (setB.has(value) && !seen.has(value)) {
          seen.add(value);
          result.push(value);
        }
      }
      return result;
    },
  },
  {
    id: 'array-split-at',
    title: '位置で分割',
    summary: '指定位置で配列を 2 つに分割します。',
    difficulty: 'Easy',
    tags: ['array', 'slicing'],
    functionName: 'splitAt',
    signature: 'splitAt(values, index)',
    comment: 'index で左右に分割する',
    promptLines: [
      '配列 `values` を `index` 位置で `[左側, 右側]` に分割した配列を返してください。',
      '`index` が範囲外の場合は 0 と length に切り詰めます。',
    ],
    constraints: ['values.length は 0 〜 10^5'],
    samples: [
      { description: '中央で分割', args: [[1, 2, 3, 4], 2] },
      { description: '負の index', args: [[1, 2, 3], -1] },
      { description: '長さ以上', args: [[1, 2], 10] },
    ],
    solution: (values, index) => {
      const length = values.length;
      const clamped = Math.min(Math.max(index, 0), length);
      return [values.slice(0, clamped), values.slice(clamped)];
    },
  },
  {
    id: 'array-window-sums',
    title: 'ウィンドウ合計',
    summary: '固定長ウィンドウの合計を並べます。',
    difficulty: 'Medium',
    tags: ['array', 'sliding-window'],
    functionName: 'windowSums',
    signature: 'windowSums(values, size)',
    comment: 'スライディングウィンドウの合計を求める',
    promptLines: [
      '配列 `values` から長さ `size` の連続領域の合計値をすべて計算した配列を返してください。',
      '`size` が配列長より大きい場合は空配列を返します。',
    ],
    constraints: ['values.length は 0 〜 10^5', 'size は 1 〜 10^4'],
    samples: [
      { description: '長さ 3', args: [[1, 2, 3, 4, 5], 3] },
      { description: '長さ 2', args: [[5, 5, 5], 2] },
      { description: 'size が長さ以上', args: [[1, 2], 5] },
    ],
    solution: (values, size) => {
      if (size <= 0 || size > values.length) return [];
      const result = [];
      let windowSum = 0;
      for (let index = 0; index < values.length; index += 1) {
        windowSum += values[index];
        if (index >= size) {
          windowSum -= values[index - size];
        }
        if (index >= size - 1) {
          result.push(windowSum);
        }
      }
      return result;
    },
  },
  {
    id: 'array-running-total',
    title: '累積和',
    summary: '各位置までの合計値を求めます。',
    difficulty: 'Easy',
    tags: ['array', 'prefix-sum'],
    functionName: 'runningTotal',
    signature: 'runningTotal(values)',
    comment: '左からの累積和を返す',
    promptLines: [
      '配列 `values` の各位置について、先頭からその位置までの合計を並べた配列を返してください。',
    ],
    constraints: ['values.length は 0 〜 10^5'],
    samples: [
      { description: '正の数のみ', args: [[1, 2, 3]] },
      { description: '負の数を含む', args: [[3, -1, 4]] },
      { description: '空配列', args: [[]] },
    ],
    solution: (values) => {
      const result = [];
      let sum = 0;
      for (const value of values) {
        sum += value;
        result.push(sum);
      }
      return result;
    },
  },
  {
    id: 'array-pairwise-adjacent',
    title: '隣接ペアの抽出',
    summary: '隣り合う要素のペアを列挙します。',
    difficulty: 'Easy',
    tags: ['array', 'transform'],
    functionName: 'pairwiseAdjacent',
    signature: 'pairwiseAdjacent(values)',
    comment: '隣接する要素ペアを列挙する',
    promptLines: [
      '配列 `values` の隣り合う要素を `[values[i], values[i+1]]` の形で列挙した配列を返してください。',
      '要素数が 1 以下の場合は空配列を返します。',
    ],
    constraints: ['values.length は 0 〜 10^5'],
    samples: [
      { description: '標準ケース', args: [[1, 2, 3]] },
      { description: '要素 1', args: [[42]] },
      { description: '文字列のペア', args: [['a', 'b', 'c']] },
    ],
    solution: (values) => {
      const result = [];
      for (let index = 0; index < values.length - 1; index += 1) {
        result.push([values[index], values[index + 1]]);
      }
      return result;
    },
  },
  {
    id: 'array-drop-every-nth',
    title: '指定間隔での削除',
    summary: 'n 番目ごとの要素を取り除きます。',
    difficulty: 'Medium',
    tags: ['array', 'filter'],
    functionName: 'dropEveryNth',
    signature: 'dropEveryNth(values, n)',
    comment: 'n 個ごとの要素を除去する',
    promptLines: [
      '配列 `values` から 1 始まりで `n` 番目ごとの要素を取り除いた配列を返してください。',
      '`n` は 1 以上の整数です。',
    ],
    constraints: ['values.length は 0 〜 10^5', 'n は 1 〜 10^4'],
    samples: [
      { description: '3 番目ごとに削除', args: [[1, 2, 3, 4, 5, 6], 3] },
      { description: 'n = 1', args: [[1, 2, 3], 1] },
      { description: 'n が大きい', args: [[1, 2, 3], 10] },
    ],
    solution: (values, n) => values.filter((_, index) => ((index + 1) % n) !== 0),
  },
  {
    id: 'array-flatten-unique',
    title: 'フラット化して重複除去',
    summary: '1 階層のフラット化後に重複を除去します。',
    difficulty: 'Medium',
    tags: ['array', 'transform'],
    functionName: 'flattenAndUnique',
    signature: 'flattenAndUnique(values)',
    comment: '1 階層平坦化の後にユニーク化する',
    promptLines: [
      '配列 `values` を 1 階層だけ平坦化した後、重複を除去した配列を返してください。',
      '順序は元の出現順を維持します。',
    ],
    constraints: ['values.length は 0 〜 10^4'],
    samples: [
      { description: '重複あり', args: [[1, [2, 3], 2, [3, 4]]] },
      { description: '入れ子なし', args: [[1, 1, 2]] },
      { description: '空配列', args: [[]] },
    ],
    solution: (values) => {
      const flattened = values.reduce((acc, item) => {
        if (Array.isArray(item)) {
          acc.push(...item);
        } else {
          acc.push(item);
        }
        return acc;
      }, []);
      const seen = new Set();
      const result = [];
      for (const value of flattened) {
        if (!seen.has(value)) {
          seen.add(value);
          result.push(value);
        }
      }
      return result;
    },
  },
  {
    id: 'array-group-by-length',
    title: '文字列長でグループ化',
    summary: '文字列の配列を長さごとに分類します。',
    difficulty: 'Easy',
    tags: ['array', 'grouping'],
    functionName: 'groupByLength',
    signature: 'groupByLength(words)',
    comment: '文字列を長さごとにまとめる',
    promptLines: [
      '文字列配列 `words` を、文字列の長さをキーとしたオブジェクトにグループ化してください。',
    ],
    constraints: ['words.length は 0 〜 10^4'],
    samples: [
      { description: 'さまざまな長さ', args: [['a', 'to', 'tea', 'at']] },
      { description: '同じ長さのみ', args: [['no', 'go']] },
      { description: '空配列', args: [[]] },
    ],
    solution: (words) => {
      const groups = {};
      for (const word of words) {
        const key = String(word.length);
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(word);
      }
      return groups;
    },
  },
];
const numberTemplates = [
  {
    id: 'math-factorial',
    title: '階乗の計算',
    summary: '非負整数の階乗を求めます。',
    difficulty: 'Easy',
    tags: ['math', 'recursion'],
    functionName: 'factorial',
    signature: 'factorial(n)',
    comment: 'n! を計算する',
    promptLines: [
      '非負整数 `n` の階乗を返してください。',
      '0! は 1 と定義します。',
    ],
    constraints: ['0 ≤ n ≤ 12'],
    samples: [
      { description: '3 の階乗', args: [3] },
      { description: '0 の階乗', args: [0] },
      { description: '5 の階乗', args: [5] },
    ],
    solution: (n) => {
      let result = 1;
      for (let i = 2; i <= n; i += 1) {
        result *= i;
      }
      return result;
    },
  },
  {
    id: 'math-is-prime',
    title: '素数判定',
    summary: '与えられた整数が素数かどうかを返します。',
    difficulty: 'Medium',
    tags: ['math', 'prime'],
    functionName: 'isPrime',
    signature: 'isPrime(n)',
    comment: '素数であれば true を返す',
    promptLines: [
      '整数 `n` が素数であれば true、そうでなければ false を返してください。',
      '2 未満の数は素数ではありません。',
    ],
    constraints: ['|n| ≤ 10^6'],
    samples: [
      { description: '素数', args: [13] },
      { description: '合成数', args: [12] },
      { description: '1 は素数ではない', args: [1] },
    ],
    solution: (n) => {
      if (n < 2) return false;
      if (n % 2 === 0) return n === 2;
      const limit = Math.floor(Math.sqrt(n));
      for (let i = 3; i <= limit; i += 2) {
        if (n % i === 0) return false;
      }
      return true;
    },
  },
  {
    id: 'math-gcd',
    title: '最大公約数',
    summary: '2 数の最大公約数を計算します。',
    difficulty: 'Easy',
    tags: ['math', 'gcd'],
    functionName: 'gcd',
    signature: 'gcd(a, b)',
    comment: 'ユークリッドの互除法で最大公約数を求める',
    promptLines: [
      '整数 `a`, `b` の最大公約数を返してください。',
      '引数は正負どちらでも構いません。',
    ],
    constraints: ['|a|, |b| ≤ 10^9'],
    samples: [
      { description: '一般ケース', args: [24, 18] },
      { description: '片方が 0', args: [0, 9] },
      { description: '負の値', args: [-21, 14] },
    ],
    solution: (a, b) => {
      let x = Math.abs(a);
      let y = Math.abs(b);
      while (y !== 0) {
        const temp = x % y;
        x = y;
        y = temp;
      }
      return x;
    },
  },
  {
    id: 'math-lcm',
    title: '最小公倍数',
    summary: '2 数の最小公倍数を求めます。',
    difficulty: 'Easy',
    tags: ['math', 'gcd'],
    functionName: 'lcm',
    signature: 'lcm(a, b)',
    comment: '最大公約数を利用して最小公倍数を求める',
    promptLines: [
      '整数 `a`, `b` の最小公倍数を返してください。',
      'どちらかが 0 の場合は 0 を返します。',
    ],
    constraints: ['|a|, |b| ≤ 10^9'],
    samples: [
      { description: '標準ケース', args: [6, 8] },
      { description: '一方が 0', args: [0, 5] },
      { description: '負の値', args: [-4, 6] },
    ],
    solution: (a, b) => {
      if (a === 0 || b === 0) return 0;
      const gcdValue = ((x, y) => {
        let m = Math.abs(x);
        let n = Math.abs(y);
        while (n !== 0) {
          const t = m % n;
          m = n;
          n = t;
        }
        return m;
      })(a, b);
      return Math.abs(a / gcdValue * b);
    },
  },
  {
    id: 'math-fibonacci',
    title: 'フィボナッチ数',
    summary: 'フィボナッチ数列の n 番目を返します。',
    difficulty: 'Easy',
    tags: ['math', 'sequence'],
    functionName: 'fibonacci',
    signature: 'fibonacci(n)',
    comment: 'フィボナッチ数列の n 番目を計算する',
    promptLines: [
      'フィボナッチ数列 (0, 1, 1, 2, 3, ...) の n 番目の値を返してください。',
      '0 番目は 0、1 番目は 1 とします。',
    ],
    constraints: ['0 ≤ n ≤ 40'],
    samples: [
      { description: '0 番目', args: [0] },
      { description: '1 番目', args: [1] },
      { description: '10 番目', args: [10] },
    ],
    solution: (n) => {
      if (n === 0) return 0;
      if (n === 1) return 1;
      let prev = 0;
      let curr = 1;
      for (let i = 2; i <= n; i += 1) {
        const next = prev + curr;
        prev = curr;
        curr = next;
      }
      return curr;
    },
  },
  {
    id: 'math-sum-range',
    title: '1 から n の合計',
    summary: '1 から n までの総和を求めます。',
    difficulty: 'Easy',
    tags: ['math', 'series'],
    functionName: 'sumRange',
    signature: 'sumRange(n)',
    comment: '1 から n までの合計を求める',
    promptLines: [
      '1 から `n` までの整数をすべて合計した値を返してください。',
      'n が 0 以下の場合は 0 を返します。',
    ],
    constraints: ['n は -10^9 〜 10^9'],
    samples: [
      { description: 'n = 5', args: [5] },
      { description: 'n = 1', args: [1] },
      { description: '0 以下', args: [0] },
    ],
    solution: (n) => {
      if (n <= 0) return 0;
      return (n * (n + 1)) / 2;
    },
  },
  {
    id: 'math-digital-root',
    title: 'デジタルルート',
    summary: '桁和を 1 桁になるまで繰り返します。',
    difficulty: 'Medium',
    tags: ['math', 'digits'],
    functionName: 'digitalRoot',
    signature: 'digitalRoot(n)',
    comment: '桁を繰り返し合計して 1 桁にする',
    promptLines: [
      '非負整数 `n` の桁を合計し、結果が 1 桁になるまで繰り返した値を返してください。',
    ],
    constraints: ['0 ≤ n ≤ 10^15'],
    samples: [
      { description: '38 のデジタルルート', args: [38] },
      { description: '0 の場合', args: [0] },
      { description: '大きな数', args: [9999] },
    ],
    solution: (n) => {
      if (n === 0) return 0;
      return 1 + ((n - 1) % 9);
    },
  },
  {
    id: 'math-count-digits',
    title: '桁数を数える',
    summary: '整数の桁数を返します。',
    difficulty: 'Easy',
    tags: ['math', 'digits'],
    functionName: 'countDigits',
    signature: 'countDigits(n)',
    comment: '絶対値の桁数を返す',
    promptLines: [
      '整数 `n` の桁数を返してください。',
      '負の数は符号を無視します。',
    ],
    constraints: ['|n| ≤ 10^15'],
    samples: [
      { description: '正の数', args: [12345] },
      { description: '負の数', args: [-900] },
      { description: 'ゼロ', args: [0] },
    ],
    solution: (n) => {
      const value = Math.abs(n);
      if (value === 0) return 1;
      return Math.floor(Math.log10(value)) + 1;
    },
  },
  {
    id: 'math-is-power-of-two',
    title: '2 の累乗判定',
    summary: '2 の累乗かどうかを判定します。',
    difficulty: 'Easy',
    tags: ['math', 'bit'],
    functionName: 'isPowerOfTwo',
    signature: 'isPowerOfTwo(n)',
    comment: 'n が 2 の累乗なら true',
    promptLines: [
      '整数 `n` が 2 の累乗であれば true、そうでなければ false を返してください。',
      'n が 1 より小さい場合は false とします。',
    ],
    constraints: ['|n| ≤ 10^12'],
    samples: [
      { description: '2 の累乗', args: [1024] },
      { description: '累乗ではない', args: [12] },
      { description: '負の値', args: [-2] },
    ],
    solution: (n) => n > 0 && (n & (n - 1)) === 0,
  },
  {
    id: 'math-triangular-number',
    title: '三角数',
    summary: 'n 番目の三角数を求めます。',
    difficulty: 'Easy',
    tags: ['math', 'series'],
    functionName: 'triangularNumber',
    signature: 'triangularNumber(n)',
    comment: 'n 番目の三角数を返す',
    promptLines: [
      '`n` 番目の三角数 (1 から n までの合計) を返してください。',
      'n が 0 以下のときは 0 を返します。',
    ],
    constraints: ['n は -10^9 〜 10^9'],
    samples: [
      { description: 'n = 4', args: [4] },
      { description: 'n = 1', args: [1] },
      { description: '負の値', args: [-3] },
    ],
    solution: (n) => {
      if (n <= 0) return 0;
      return (n * (n + 1)) / 2;
    },
  },
  {
    id: 'math-clamp',
    title: '範囲制限',
    summary: '値を最小値と最大値の範囲に制限します。',
    difficulty: 'Easy',
    tags: ['math', 'utility'],
    functionName: 'clamp',
    signature: 'clamp(value, min, max)',
    comment: '値を指定範囲に収める',
    promptLines: [
      '数値 `value` を `min` と `max` の範囲に収めて返してください。',
      'min ≤ max が保証されています。',
    ],
    constraints: ['value, min, max は有限の数値'],
    samples: [
      { description: '範囲内', args: [5, 0, 10] },
      { description: '下限より小さい', args: [-3, 0, 5] },
      { description: '上限より大きい', args: [20, 0, 10] },
    ],
    solution: (value, min, max) => Math.min(Math.max(value, min), max),
  },
  {
    id: 'math-to-binary',
    title: '2 進数への変換',
    summary: '整数を 2 進文字列に変換します。',
    difficulty: 'Easy',
    tags: ['math', 'bit'],
    functionName: 'toBinaryString',
    signature: 'toBinaryString(n)',
    comment: '非負整数を 2 進数文字列に変換する',
    promptLines: [
      '非負整数 `n` を 2 進数表現の文字列に変換して返してください。',
    ],
    constraints: ['0 ≤ n ≤ 10^9'],
    samples: [
      { description: '0 の場合', args: [0] },
      { description: '小さな数', args: [5] },
      { description: '大きな数', args: [1024] },
    ],
    solution: (n) => n.toString(2),
  },
  {
    id: 'math-from-binary',
    title: '2 進数からの変換',
    summary: '2 進表現の文字列を数値に変換します。',
    difficulty: 'Easy',
    tags: ['math', 'bit'],
    functionName: 'fromBinaryString',
    signature: 'fromBinaryString(text)',
    comment: '2 進数の文字列を 10 進数に戻す',
    promptLines: [
      '2 進数表現の文字列 `text` を受け取り、対応する 10 進数の整数を返してください。',
      '文字列は 0 と 1 のみで構成されます。',
    ],
    constraints: ['text.length は 1 〜 32'],
    samples: [
      { description: '101', args: ['101'] },
      { description: '0', args: ['0'] },
      { description: '11111111', args: ['11111111'] },
    ],
    solution: (text) => parseInt(text, 2),
  },
  {
    id: 'math-sum-of-squares',
    title: '平方和',
    summary: '1 から n までの平方和を求めます。',
    difficulty: 'Medium',
    tags: ['math', 'series'],
    functionName: 'sumOfSquares',
    signature: 'sumOfSquares(n)',
    comment: '1^2 から n^2 までの総和を求める',
    promptLines: [
      '1 から `n` までの各整数の平方を合計した値を返してください。',
      'n が 0 以下の場合は 0 を返します。',
    ],
    constraints: ['n は -10^4 〜 10^4'],
    samples: [
      { description: 'n = 3', args: [3] },
      { description: 'n = 1', args: [1] },
      { description: '0 以下', args: [0] },
    ],
    solution: (n) => {
      if (n <= 0) return 0;
      return (n * (n + 1) * (2 * n + 1)) / 6;
    },
  },
  {
    id: 'math-is-perfect-number',
    title: '完全数判定',
    summary: '完全数かどうかを判定します。',
    difficulty: 'Medium',
    tags: ['math', 'divisors'],
    functionName: 'isPerfectNumber',
    signature: 'isPerfectNumber(n)',
    comment: '真の約数の合計が元の数に等しいか判定する',
    promptLines: [
      '正の整数 `n` が完全数であれば true を返してください。',
      '完全数とは真の約数の合計が元の数に等しい数です。',
    ],
    constraints: ['1 ≤ n ≤ 10^7'],
    samples: [
      { description: '6 は完全数', args: [6] },
      { description: '28 も完全数', args: [28] },
      { description: '非完全数', args: [12] },
    ],
    solution: (n) => {
      if (n <= 1) return false;
      let sum = 1;
      const limit = Math.floor(Math.sqrt(n));
      for (let i = 2; i <= limit; i += 1) {
        if (n % i === 0) {
          sum += i;
          const pair = n / i;
          if (pair !== i) sum += pair;
        }
      }
      return sum === n;
    },
  },
  {
    id: 'math-count-bits',
    title: '立っているビット数',
    summary: '2 進数で 1 になっているビットの数を数えます。',
    difficulty: 'Easy',
    tags: ['math', 'bit'],
    functionName: 'countBits',
    signature: 'countBits(n)',
    comment: '2 進数表現で 1 の個数を数える',
    promptLines: [
      '非負整数 `n` の 2 進数表現に含まれる 1 の個数を返してください。',
    ],
    constraints: ['0 ≤ n ≤ 10^9'],
    samples: [
      { description: '0', args: [0] },
      { description: '5 (101)', args: [5] },
      { description: '大きな数', args: [1023] },
    ],
    solution: (n) => {
      let count = 0;
      let value = n >>> 0;
      while (value !== 0) {
        count += value & 1;
        value >>>= 1;
      }
      return count;
    },
  },
  {
    id: 'math-sum-of-multiples',
    title: '倍数の総和',
    summary: '指定した数の倍数を合計します。',
    difficulty: 'Medium',
    tags: ['math', 'series'],
    functionName: 'sumOfMultiples',
    signature: 'sumOfMultiples(limit, divisor)',
    comment: 'divisor の倍数を合計する',
    promptLines: [
      '`limit` 以下の `divisor` の倍数をすべて合計した値を返してください。',
      'divisor が 0 の場合は 0 を返します。',
    ],
    constraints: ['limit は 0 〜 10^9', 'divisor は -10^6 〜 10^6'],
    samples: [
      { description: '10 以下の 3 の倍数', args: [10, 3] },
      { description: '負の倍数', args: [12, -4] },
      { description: 'divisor が 0', args: [100, 0] },
    ],
    solution: (limit, divisor) => {
      if (divisor === 0 || limit < 0) return 0;
      const count = Math.floor(limit / Math.abs(divisor));
      const first = divisor;
      const last = divisor * count;
      return (first + last) * count / 2;
    },
  },
  {
    id: 'math-count-factors',
    title: '約数の個数',
    summary: '正の約数の個数を数えます。',
    difficulty: 'Medium',
    tags: ['math', 'divisors'],
    functionName: 'countFactors',
    signature: 'countFactors(n)',
    comment: '正の約数の個数を数える',
    promptLines: [
      '正の整数 `n` の正の約数の個数を返してください。',
    ],
    constraints: ['1 ≤ n ≤ 10^7'],
    samples: [
      { description: '12 の約数', args: [12] },
      { description: '素数', args: [13] },
      { description: '平方数', args: [36] },
    ],
    solution: (n) => {
      let count = 0;
      const limit = Math.floor(Math.sqrt(n));
      for (let i = 1; i <= limit; i += 1) {
        if (n % i === 0) {
          count += 2;
        }
      }
      if (limit * limit === n) count -= 1;
      return count;
    },
  },
  {
    id: 'math-is-armstrong-number',
    title: 'アームストロング数判定',
    summary: 'アームストロング数かどうかを判定します。',
    difficulty: 'Medium',
    tags: ['math', 'digits'],
    functionName: 'isArmstrongNumber',
    signature: 'isArmstrongNumber(n)',
    comment: '各桁の d 乗の和が自身と等しいか判定する',
    promptLines: [
      '整数 `n` がアームストロング数 (各桁を桁数乗した和が元の数) であれば true を返してください。',
    ],
    constraints: ['0 ≤ n ≤ 10^9'],
    samples: [
      { description: '153 はアームストロング数', args: [153] },
      { description: '9474 もアームストロング数', args: [9474] },
      { description: '非アームストロング数', args: [100] },
    ],
    solution: (n) => {
      const digits = String(Math.abs(n)).split('');
      const power = digits.length;
      const sum = digits.reduce((total, digit) => total + Math.pow(Number(digit), power), 0);
      return sum === Math.abs(n);
    },
  },
  {
    id: 'math-nearest-power-of-two',
    title: '直近の 2 の累乗',
    summary: 'n 以下で最大の 2 の累乗を求めます。',
    difficulty: 'Easy',
    tags: ['math', 'bit'],
    functionName: 'nearestPowerOfTwo',
    signature: 'nearestPowerOfTwo(n)',
    comment: 'n 以下で最大の 2 の累乗を返す',
    promptLines: [
      '正の整数 `n` 以下で最大の 2 の累乗を返してください。',
      'n が 1 未満の場合は null を返します。',
    ],
    constraints: ['n は -10^12 〜 10^12'],
    samples: [
      { description: 'n = 15', args: [15] },
      { description: 'n = 1', args: [1] },
      { description: 'n が 0 以下', args: [0] },
    ],
    solution: (n) => {
      if (n < 1) return null;
      let power = 1;
      while (power * 2 <= n) {
        power *= 2;
      }
      return power;
    },
  },
];
const collectionTemplates = [
  {
    id: 'collection-pick-keys',
    title: '特定のキーを抽出',
    summary: 'オブジェクトから指定のキーだけを取り出します。',
    difficulty: 'Easy',
    tags: ['object', 'utility'],
    functionName: 'pickKeys',
    signature: 'pickKeys(object, keys)',
    comment: '許可されたキーだけを含む新しいオブジェクトを作る',
    promptLines: [
      'オブジェクト `object` から、配列 `keys` に含まれるキーだけを持つ新しいオブジェクトを返してください。',
      '存在しないキーは無視します。',
    ],
    constraints: ['keys.length は 0 〜 100'],
    samples: [
      { description: '基本ケース', args: [{ name: 'JS', level: 'intermediate', score: 90 }, ['name', 'score']] },
      { description: '存在しないキーを含む', args: [{ id: 1, role: 'admin' }, ['role', 'email']] },
      { description: 'キーが空', args: [{ id: 1 }, []] },
    ],
    solution: (object, keys) => {
      const result = {};
      for (const key of keys) {
        if (Object.prototype.hasOwnProperty.call(object, key)) {
          result[key] = object[key];
        }
      }
      return result;
    },
  },
  {
    id: 'collection-omit-keys',
    title: '指定キーの除外',
    summary: '不要なキーを取り除いたオブジェクトを返します。',
    difficulty: 'Easy',
    tags: ['object', 'utility'],
    functionName: 'omitKeys',
    signature: 'omitKeys(object, keys)',
    comment: '指定されたキーを除いたオブジェクトを作る',
    promptLines: [
      'オブジェクト `object` から配列 `keys` に含まれるキーを除外した新しいオブジェクトを返してください。',
    ],
    constraints: ['keys.length は 0 〜 100'],
    samples: [
      { description: 'ID を除外', args: [{ id: 7, name: 'Alice', role: 'admin' }, ['id']] },
      { description: '複数除外', args: [{ a: 1, b: 2, c: 3 }, ['a', 'c']] },
      { description: '除外なし', args: [{ ready: true }, []] },
    ],
    solution: (object, keys) => {
      const blacklist = new Set(keys);
      const result = {};
      for (const key of Object.keys(object)) {
        if (!blacklist.has(key)) {
          result[key] = object[key];
        }
      }
      return result;
    },
  },
  {
    id: 'collection-merge-defaults',
    title: 'デフォルト値とのマージ',
    summary: 'デフォルト設定で不足を補います。',
    difficulty: 'Easy',
    tags: ['object', 'merge'],
    functionName: 'mergeDefaults',
    signature: 'mergeDefaults(settings, defaults)',
    comment: 'defaults を基に settings を上書きする',
    promptLines: [
      'オブジェクト `defaults` を基に `settings` を上書きした新しいオブジェクトを返してください。',
      '設定されていないキーは defaults の値を利用し、設定済みのキーは settings を優先します。',
    ],
    constraints: ['keys は 50 個以内'],
    samples: [
      { description: '不足分を補う', args: [{ theme: 'dark' }, { theme: 'light', locale: 'ja-JP' }] },
      { description: '全て指定済み', args: [{ retries: 3, timeout: 1000 }, { retries: 5, timeout: 2000 }] },
      { description: '空の設定', args: [{}, { mode: 'compact' }] },
    ],
    solution: (settings, defaults) => ({ ...defaults, ...settings }),
  },
  {
    id: 'collection-rename-keys',
    title: 'キー名の変換',
    summary: 'キー名をリネームしたオブジェクトを返します。',
    difficulty: 'Medium',
    tags: ['object', 'transform'],
    functionName: 'renameKeys',
    signature: 'renameKeys(object, mapping)',
    comment: 'mapping のルールでキーをリネームする',
    promptLines: [
      'オブジェクト `object` のキーを `mapping` に従ってリネームした新しいオブジェクトを返してください。',
      'mapping に載っていないキーはそのまま残します。',
    ],
    constraints: ['mapping のキー数は 0 〜 50'],
    samples: [
      { description: '単純なリネーム', args: [{ id: 1, name: 'JS' }, { id: 'identifier' }] },
      { description: '複数リネーム', args: [{ first: 'Ada', last: 'Lovelace' }, { first: 'givenName', last: 'familyName' }] },
      { description: 'マッピングなし', args: [{ active: true }, {}] },
    ],
    solution: (object, mapping) => {
      const result = {};
      for (const key of Object.keys(object)) {
        const renamed = Object.prototype.hasOwnProperty.call(mapping, key) ? mapping[key] : key;
        result[renamed] = object[key];
      }
      return result;
    },
  },
  {
    id: 'collection-pluck-property',
    title: 'プロパティの取り出し',
    summary: '配列内のオブジェクトから特定プロパティを取り出します。',
    difficulty: 'Easy',
    tags: ['collection', 'array'],
    functionName: 'pluckProperty',
    signature: 'pluckProperty(items, key)',
    comment: '指定プロパティの値だけを配列として返す',
    promptLines: [
      'オブジェクト配列 `items` から、各要素の `key` プロパティの値を取り出した配列を返してください。',
      'プロパティが存在しない場合は undefined を入れます。',
    ],
    constraints: ['items.length は 0 〜 10^4'],
    samples: [
      { description: '名前一覧', args: [[{ name: 'JS' }, { name: 'TS' }], 'name'] },
      { description: '存在しないキー', args: [[{ id: 1 }, { id: 2 }], 'name'] },
      { description: '空配列', args: [[], 'id'] },
    ],
    solution: (items, key) => items.map((item) => item[key]),
  },
  {
    id: 'collection-group-by-property',
    title: 'プロパティでグループ化',
    summary: 'プロパティ値をキーにしてグループ化します。',
    difficulty: 'Medium',
    tags: ['collection', 'grouping'],
    functionName: 'groupByProperty',
    signature: 'groupByProperty(items, key)',
    comment: '指定キーの値ごとに要素をまとめる',
    promptLines: [
      'オブジェクト配列 `items` を、`key` プロパティの値をキーとしたオブジェクトにグループ化してください。',
    ],
    constraints: ['items.length は 0 〜 10^4'],
    samples: [
      { description: 'カテゴリでグループ', args: [[{ id: 1, category: 'A' }, { id: 2, category: 'B' }, { id: 3, category: 'A' }], 'category'] },
      { description: '値が未定義', args: [[{ id: 1 }, { id: 2, group: null }], 'group'] },
      { description: '空配列', args: [[], 'type'] },
    ],
    solution: (items, key) => {
      const result = {};
      for (const item of items) {
        const value = item[key];
        const groupKey = String(value);
        if (!result[groupKey]) {
          result[groupKey] = [];
        }
        result[groupKey].push(item);
      }
      return result;
    },
  },
  {
    id: 'collection-count-by-property',
    title: 'プロパティごとの件数',
    summary: '指定プロパティごとに件数を数えます。',
    difficulty: 'Easy',
    tags: ['collection', 'count'],
    functionName: 'countByProperty',
    signature: 'countByProperty(items, key)',
    comment: '指定プロパティの値ごとに件数を集計する',
    promptLines: [
      'オブジェクト配列 `items` の `key` プロパティを基に件数をカウントし、オブジェクトで返してください。',
    ],
    constraints: ['items.length は 0 〜 10^4'],
    samples: [
      { description: '役職ごとに集計', args: [[{ role: 'admin' }, { role: 'user' }, { role: 'admin' }], 'role'] },
      { description: '未定義を含む', args: [[{ type: 'A' }, {}], 'type'] },
      { description: '空配列', args: [[], 'type'] },
    ],
    solution: (items, key) => {
      const counts = {};
      for (const item of items) {
        const value = item[key];
        const groupKey = String(value);
        counts[groupKey] = (counts[groupKey] || 0) + 1;
      }
      return counts;
    },
  },
  {
    id: 'collection-index-by-property',
    title: 'プロパティをキーにインデックス化',
    summary: 'プロパティの値をキーとする辞書を作成します。',
    difficulty: 'Easy',
    tags: ['collection', 'mapping'],
    functionName: 'indexByProperty',
    signature: 'indexByProperty(items, key)',
    comment: '指定プロパティの値をキーにして要素をマッピングする',
    promptLines: [
      'オブジェクト配列 `items` の各要素を、`key` プロパティの値をキーとしたオブジェクトにマッピングしてください。',
      '同じキーが複数ある場合は後勝ちとします。',
    ],
    constraints: ['items.length は 0 〜 10^4'],
    samples: [
      { description: 'ID をキーに', args: [[{ id: 'A', value: 1 }, { id: 'B', value: 2 }], 'id'] },
      { description: '重複キー', args: [[{ id: 1, value: 'first' }, { id: 1, value: 'second' }], 'id'] },
      { description: 'キーが存在しない', args: [[{ name: 'foo' }], 'id'] },
    ],
    solution: (items, key) => {
      const result = {};
      for (const item of items) {
        const value = item[key];
        result[String(value)] = item;
      }
      return result;
    },
  },
  {
    id: 'collection-filter-by-property',
    title: 'プロパティでフィルタリング',
    summary: '指定プロパティが特定値の要素だけを残します。',
    difficulty: 'Easy',
    tags: ['collection', 'filter'],
    functionName: 'filterByPropertyValue',
    signature: 'filterByPropertyValue(items, key, value)',
    comment: 'key が value と一致する要素だけを残す',
    promptLines: [
      'オブジェクト配列 `items` から、`key` プロパティが `value` と一致する要素だけを残した配列を返してください。',
    ],
    constraints: ['items.length は 0 〜 10^4'],
    samples: [
      { description: '一致する要素のみ', args: [[{ status: 'done' }, { status: 'pending' }], 'status', 'done'] },
      { description: '一致なし', args: [[{ status: 'done' }], 'status', 'open'] },
      { description: '空配列', args: [[], 'type', 'A'] },
    ],
    solution: (items, key, value) => items.filter((item) => item[key] === value),
  },
  {
    id: 'collection-unique-by-property',
    title: 'プロパティで一意化',
    summary: '特定プロパティの重複を除去します。',
    difficulty: 'Medium',
    tags: ['collection', 'set'],
    functionName: 'uniqueByProperty',
    signature: 'uniqueByProperty(items, key)',
    comment: '指定プロパティの値が重複しないように先に現れた要素だけ残す',
    promptLines: [
      'オブジェクト配列 `items` から、`key` プロパティの値が重複しないように先に登場した要素だけを残した配列を返してください。',
    ],
    constraints: ['items.length は 0 〜 10^4'],
    samples: [
      { description: 'メールアドレスで一意化', args: [[{ email: 'a@example.com' }, { email: 'b@example.com' }, { email: 'a@example.com' }], 'email'] },
      { description: '重複なし', args: [[{ id: 1 }, { id: 2 }], 'id'] },
      { description: '空配列', args: [[], 'id'] },
    ],
    solution: (items, key) => {
      const seen = new Set();
      const result = [];
      for (const item of items) {
        const value = item[key];
        if (!seen.has(value)) {
          seen.add(value);
          result.push(item);
        }
      }
      return result;
    },
  },
  {
    id: 'collection-sort-by-property',
    title: 'プロパティでソート',
    summary: '特定プロパティを基準に昇順ソートします。',
    difficulty: 'Easy',
    tags: ['collection', 'sorting'],
    functionName: 'sortByProperty',
    signature: 'sortByProperty(items, key)',
    comment: '指定プロパティで昇順ソートした新しい配列を返す',
    promptLines: [
      'オブジェクト配列 `items` を `key` プロパティで昇順ソートした新しい配列を返してください。',
      '元の配列は変更しないでください。',
    ],
    constraints: ['items.length は 0 〜 10^4'],
    samples: [
      { description: 'スコアでソート', args: [[{ score: 42 }, { score: 10 }, { score: 100 }], 'score'] },
      { description: '文字列キー', args: [[{ name: 'Charlie' }, { name: 'Alice' }], 'name'] },
      { description: '空配列', args: [[], 'value'] },
    ],
    solution: (items, key) => {
      const copy = items.slice();
      copy.sort((a, b) => {
        const left = a[key];
        const right = b[key];
        if (left === right) return 0;
        return left < right ? -1 : 1;
      });
      return copy;
    },
  },
  {
    id: 'collection-partition-by-truthy',
    title: '真偽値で分割',
    summary: '指定プロパティの真偽で要素を分割します。',
    difficulty: 'Easy',
    tags: ['collection', 'partition'],
    functionName: 'partitionByProperty',
    signature: 'partitionByProperty(items, key)',
    comment: '指定プロパティが truthy か falsy かで分ける',
    promptLines: [
      'オブジェクト配列 `items` を、`key` プロパティが truthy か falsy かで `{ truthy: [], falsy: [] }` に分割して返してください。',
    ],
    constraints: ['items.length は 0 〜 10^4'],
    samples: [
      { description: 'アクティブユーザー', args: [[{ active: true }, { active: false }, { active: 1 }], 'active'] },
      { description: '全て falsy', args: [[{ active: 0 }, { active: '' }], 'active'] },
      { description: '空配列', args: [[], 'flag'] },
    ],
    solution: (items, key) => {
      const truthy = [];
      const falsy = [];
      for (const item of items) {
        if (item[key]) {
          truthy.push(item);
        } else {
          falsy.push(item);
        }
      }
      return { truthy, falsy };
    },
  },
  {
    id: 'collection-object-from-pairs',
    title: 'ペアからオブジェクト生成',
    summary: 'キーと値のペア配列からオブジェクトを作ります。',
    difficulty: 'Easy',
    tags: ['object', 'mapping'],
    functionName: 'objectFromPairs',
    signature: 'objectFromPairs(pairs)',
    comment: 'entries からオブジェクトを生成する',
    promptLines: [
      '`[key, value]` の形をした配列 `pairs` からオブジェクトを生成して返してください。',
      '同じキーが現れた場合は後勝ちとします。',
    ],
    constraints: ['pairs.length は 0 〜 10^4'],
    samples: [
      { description: '基本ケース', args: [[['a', 1], ['b', 2]]] },
      { description: '重複キー', args: [[['id', 1], ['id', 2]]] },
      { description: '空配列', args: [[]] },
    ],
    solution: (pairs) => {
      const result = {};
      for (const [key, value] of pairs) {
        result[key] = value;
      }
      return result;
    },
  },
  {
    id: 'collection-pairs-from-object',
    title: 'オブジェクトをペア化',
    summary: 'オブジェクトを [key, value] の配列に変換します。',
    difficulty: 'Easy',
    tags: ['object', 'transform'],
    functionName: 'pairsFromObject',
    signature: 'pairsFromObject(object)',
    comment: 'オブジェクトの entries を作る',
    promptLines: [
      'オブジェクト `object` の各プロパティを `[key, value]` の配列として列挙した配列を返してください。',
      'キーの並び順は `Object.keys` と同じとします。',
    ],
    constraints: ['キー数は 0 〜 10^4'],
    samples: [
      { description: '単純なオブジェクト', args: [{ a: 1, b: 2 }] },
      { description: '空オブジェクト', args: [{}] },
      { description: '文字列キーのみ', args: [{ foo: 'bar' }] },
    ],
    solution: (object) => Object.keys(object).map((key) => [key, object[key]]),
  },
  {
    id: 'collection-shallow-equal',
    title: '浅い比較',
    summary: '2 つのオブジェクトが浅い意味で等しいかを判定します。',
    difficulty: 'Medium',
    tags: ['object', 'comparison'],
    functionName: 'shallowEqual',
    signature: 'shallowEqual(a, b)',
    comment: 'キーと値が全て一致するか比較する',
    promptLines: [
      'オブジェクト `a` と `b` が浅い比較で等しい場合に true を返してください。',
      'キーの数・キーの集合・それぞれの値がすべて一致したら等しいとみなします。',
    ],
    constraints: ['キー数は 0 〜 100'],
    samples: [
      { description: '完全一致', args: [{ id: 1, name: 'JS' }, { id: 1, name: 'JS' }] },
      { description: '値が異なる', args: [{ id: 1 }, { id: 2 }] },
      { description: 'キー集合が異なる', args: [{ id: 1 }, { id: 1, name: 'JS' }] },
    ],
    solution: (a, b) => {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      if (keysA.length !== keysB.length) return false;
      for (const key of keysA) {
        if (!Object.prototype.hasOwnProperty.call(b, key) || a[key] !== b[key]) {
          return false;
        }
      }
      return true;
    },
  },
  {
    id: 'collection-intersection-keys',
    title: '共通キー',
    summary: '2 つのオブジェクトに共通するキーを列挙します。',
    difficulty: 'Easy',
    tags: ['object', 'set'],
    functionName: 'intersectionKeys',
    signature: 'intersectionKeys(a, b)',
    comment: '共通キーを昇順で返す',
    promptLines: [
      'オブジェクト `a`, `b` に共通するキーを昇順 (辞書順) に並べた配列を返してください。',
    ],
    constraints: ['キー数は 0 〜 100'],
    samples: [
      { description: '共通のキーがある', args: [{ id: 1, name: 'A' }, { id: 2, role: 'user' }] },
      { description: '共通キーなし', args: [{ a: 1 }, { b: 2 }] },
      { description: '複数共通', args: [{ a: 1, b: 2 }, { b: 3, a: 4 }] },
    ],
    solution: (a, b) => {
      const keysA = new Set(Object.keys(a));
      const result = [];
      for (const key of Object.keys(b)) {
        if (keysA.has(key)) {
          result.push(key);
        }
      }
      result.sort();
      return result;
    },
  },
  {
    id: 'collection-difference-keys',
    title: '差分キー',
    summary: '片方にしかないキーを列挙します。',
    difficulty: 'Easy',
    tags: ['object', 'set'],
    functionName: 'differenceKeys',
    signature: 'differenceKeys(a, b)',
    comment: 'a に存在し b に存在しないキーを昇順で返す',
    promptLines: [
      'オブジェクト `a` に存在し、`b` に存在しないキーを昇順 (辞書順) で並べた配列を返してください。',
    ],
    constraints: ['キー数は 0 〜 100'],
    samples: [
      { description: '一部差分あり', args: [{ id: 1, name: 'A' }, { id: 1 }] },
      { description: '全て差分', args: [{ a: 1, b: 2 }, {}] },
      { description: '差分なし', args: [{ a: 1 }, { a: 2, b: 3 }] },
    ],
    solution: (a, b) => {
      const keysB = new Set(Object.keys(b));
      const result = [];
      for (const key of Object.keys(a)) {
        if (!keysB.has(key)) {
          result.push(key);
        }
      }
      result.sort();
      return result;
    },
  },
  {
    id: 'collection-compact-object',
    title: 'null/undefined を除外',
    summary: 'null または undefined の値を取り除きます。',
    difficulty: 'Easy',
    tags: ['object', 'cleanup'],
    functionName: 'compactObject',
    signature: 'compactObject(object)',
    comment: 'null や undefined のプロパティを削除した新しいオブジェクトを返す',
    promptLines: [
      'オブジェクト `object` から値が null または undefined のキーを取り除いた新しいオブジェクトを返してください。',
    ],
    constraints: ['キー数は 0 〜 100'],
    samples: [
      { description: 'null を除外', args: [{ name: 'JS', description: null }] },
      { description: 'undefined を除外', args: [{ a: undefined, b: 0, c: false }] },
      { description: '除外なし', args: [{ ready: true }] },
    ],
    solution: (object) => {
      const result = {};
      for (const key of Object.keys(object)) {
        const value = object[key];
        if (value !== null && value !== undefined) {
          result[key] = value;
        }
      }
      return result;
    },
  },
  {
    id: 'collection-deep-get',
    title: 'ネスト値の取得',
    summary: 'パスで指定されたネスト値を取得します。',
    difficulty: 'Medium',
    tags: ['object', 'path'],
    functionName: 'deepGet',
    signature: 'deepGet(object, path)',
    comment: 'パスで示されたネスト値を取得する',
    promptLines: [
      'オブジェクト `object` から、キー配列 `path` で指定されたネストされた値を取得して返してください。',
      '途中で値が存在しない場合は undefined を返します。',
    ],
    constraints: ['path.length は 0 〜 20'],
    samples: [
      { description: 'ネストした値', args: [{ user: { profile: { name: 'JS' } } }, ['user', 'profile', 'name']] },
      { description: '存在しないパス', args: [{ settings: {} }, ['settings', 'locale']] },
      { description: '空のパス', args: [{ value: 1 }, []] },
    ],
    solution: (object, path) => {
      let current = object;
      for (const key of path) {
        if (current == null || typeof current !== 'object' || !(key in current)) {
          return undefined;
        }
        current = current[key];
      }
      return current;
    },
  },
  {
    id: 'collection-ensure-key',
    title: 'キーのデフォルト設定',
    summary: '存在しないキーにデフォルト値を設定します。',
    difficulty: 'Easy',
    tags: ['object', 'defaults'],
    functionName: 'ensureKey',
    signature: 'ensureKey(object, key, defaultValue)',
    comment: 'キーが存在しなければ defaultValue を設定する',
    promptLines: [
      'オブジェクト `object` にキー `key` が存在しない場合は `defaultValue` を設定した新しいオブジェクトを返してください。',
      '既にキーが存在する場合は元の値を保持します。',
    ],
    constraints: ['キー数は 0 〜 100'],
    samples: [
      { description: '存在しないキーを追加', args: [{ count: 1 }, 'limit', 10] },
      { description: '既に存在する場合は変更しない', args: [{ limit: 5 }, 'limit', 10] },
      { description: '空オブジェクト', args: [{}, 'enabled', true] },
    ],
    solution: (object, key, defaultValue) => {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        return { ...object };
      }
      return { ...object, [key]: defaultValue };
    },
  },
];
const algorithmTemplates = [
  {
    id: 'algo-binary-search',
    title: '二分探索',
    summary: 'ソート済み配列から二分探索で値を探します。',
    difficulty: 'Easy',
    tags: ['algorithm', 'search'],
    functionName: 'binarySearch',
    signature: 'binarySearch(values, target)',
    comment: '二分探索でターゲットのインデックスを返す',
    promptLines: [
      '昇順にソートされた数値配列 `values` から、`target` のインデックスを二分探索で探してください。',
      '見つからない場合は -1 を返します。',
    ],
    constraints: ['values.length は 0 〜 10^5'],
    samples: [
      { description: '存在する要素', args: [[1, 3, 5, 7, 9], 5] },
      { description: '存在しない要素', args: [[2, 4, 6, 8], 7] },
      { description: '空配列', args: [[], 10] },
    ],
    solution: (values, target) => {
      let left = 0;
      let right = values.length - 1;
      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const value = values[mid];
        if (value === target) return mid;
        if (value < target) {
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      }
      return -1;
    },
  },
  {
    id: 'algo-two-sum-indices',
    title: '2 数の和 (インデックス)',
    summary: '和がターゲットになる 2 要素のインデックスを返します。',
    difficulty: 'Easy',
    tags: ['algorithm', 'hash-map'],
    functionName: 'twoSumIndices',
    signature: 'twoSumIndices(values, target)',
    comment: '和が target になる 2 要素のインデックスを返す',
    promptLines: [
      '配列 `values` から合計が `target` になる 2 つの異なるインデックスを `[i, j]` (i < j) の形で返してください。',
      '存在しない場合は null を返します。',
    ],
    constraints: ['values.length は 0 〜 10^5'],
    samples: [
      { description: 'シンプルなケース', args: [[2, 7, 11, 15], 9] },
      { description: '重複値を利用', args: [[3, 3, 4], 6] },
      { description: '存在しない', args: [[1, 2, 3], 10] },
    ],
    solution: (values, target) => {
      const map = new Map();
      for (let index = 0; index < values.length; index += 1) {
        const value = values[index];
        const pairIndex = map.get(target - value);
        if (pairIndex !== undefined) {
          return [pairIndex, index];
        }
        if (!map.has(value)) {
          map.set(value, index);
        }
      }
      return null;
    },
  },
  {
    id: 'algo-max-subarray-sum',
    title: '最大部分和',
    summary: '連続部分配列の最大合計値を求めます。',
    difficulty: 'Medium',
    tags: ['algorithm', 'dynamic-programming'],
    functionName: 'maxSubarraySum',
    signature: 'maxSubarraySum(values)',
    comment: 'Kadane のアルゴリズムで最大部分和を求める',
    promptLines: [
      '数値配列 `values` に対して、連続する部分配列の合計値の最大値を返してください。',
      '配列は少なくとも 1 要素を持つとします。',
    ],
    constraints: ['values.length は 1 〜 10^5'],
    samples: [
      { description: '正と負の混在', args: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]] },
      { description: '全て負数', args: [[-3, -2, -5]] },
      { description: '単一要素', args: [[5]] },
    ],
    solution: (values) => {
      let best = values[0];
      let current = values[0];
      for (let index = 1; index < values.length; index += 1) {
        const value = values[index];
        current = Math.max(value, current + value);
        best = Math.max(best, current);
      }
      return best;
    },
  },
  {
    id: 'algo-product-except-self',
    title: '自分以外の積',
    summary: '自分以外すべての積を求めます。',
    difficulty: 'Medium',
    tags: ['algorithm', 'prefix-suffix'],
    functionName: 'productExceptSelf',
    signature: 'productExceptSelf(values)',
    comment: '各位置で自分以外の要素の積を求める',
    promptLines: [
      '配列 `values` の各要素について、自分以外の全ての要素の積を要素とした配列を返してください。',
      '割り算は使用しないでください。',
    ],
    constraints: ['values.length は 1 〜 10^5'],
    samples: [
      { description: '基本ケース', args: [[1, 2, 3, 4]] },
      { description: '0 を含む', args: [[-1, 1, 0, -3, 3]] },
      { description: '単一要素', args: [[5]] },
    ],
    solution: (values) => {
      const length = values.length;
      const result = new Array(length).fill(1);
      let prefix = 1;
      for (let i = 0; i < length; i += 1) {
        result[i] = prefix;
        prefix *= values[i];
      }
      let suffix = 1;
      for (let i = length - 1; i >= 0; i -= 1) {
        result[i] *= suffix;
        suffix *= values[i];
      }
      return result;
    },
  },
  {
    id: 'algo-move-zeroes',
    title: 'ゼロを末尾へ移動',
    summary: '0 を末尾に移動しつつ順序を保ちます。',
    difficulty: 'Easy',
    tags: ['algorithm', 'two-pointers'],
    functionName: 'moveZeroes',
    signature: 'moveZeroes(values)',
    comment: '0 を末尾に送り、非ゼロ要素の順序は維持する',
    promptLines: [
      '配列 `values` の中で、0 をすべて末尾に移動させた新しい配列を返してください。',
      '非ゼロ要素の順序は保持してください。',
    ],
    constraints: ['values.length は 0 〜 10^5'],
    samples: [
      { description: 'ゼロを末尾に移動', args: [[0, 1, 0, 3, 12]] },
      { description: 'ゼロなし', args: [[1, 2, 3]] },
      { description: '全てゼロ', args: [[0, 0, 0]] },
    ],
    solution: (values) => {
      const nonZero = values.filter((value) => value !== 0);
      const zeroCount = values.length - nonZero.length;
      return nonZero.concat(new Array(zeroCount).fill(0));
    },
  },
  {
    id: 'algo-count-pairs-with-sum',
    title: '和がターゲットのペア数',
    summary: '和が特定値になるペアの個数を求めます。',
    difficulty: 'Medium',
    tags: ['algorithm', 'hash-map'],
    functionName: 'countPairsWithSum',
    signature: 'countPairsWithSum(values, target)',
    comment: '和が target となるペアの個数を数える',
    promptLines: [
      '配列 `values` から、合計が `target` になる (i < j) のペア数を求めて返してください。',
    ],
    constraints: ['values.length は 0 〜 10^5'],
    samples: [
      { description: '基本ケース', args: [[1, 5, 3, 3, 3], 6] },
      { description: 'ペアなし', args: [[1, 2, 3], 100] },
      { description: '負の値を含む', args: [[-1, 0, 1, 2], 1] },
    ],
    solution: (values, target) => {
      const counts = new Map();
      let total = 0;
      for (const value of values) {
        const complement = target - value;
        if (counts.has(complement)) {
          total += counts.get(complement);
        }
        counts.set(value, (counts.get(value) || 0) + 1);
      }
      return total;
    },
  },
  {
    id: 'algo-lis-length',
    title: '最長増加部分列の長さ',
    summary: '最長増加部分列の長さを求めます。',
    difficulty: 'Hard',
    tags: ['algorithm', 'dynamic-programming'],
    functionName: 'longestIncreasingSubsequenceLength',
    signature: 'longestIncreasingSubsequenceLength(values)',
    comment: '最長増加部分列の長さを求める',
    promptLines: [
      '整数配列 `values` の最長増加部分列 (Strictly increasing subsequence) の長さを返してください。',
    ],
    constraints: ['values.length は 0 〜 10^4'],
    samples: [
      { description: '標準ケース', args: [[10, 9, 2, 5, 3, 7, 101, 18]] },
      { description: '完全に減少', args: [[5, 4, 3, 2, 1]] },
      { description: '空配列', args: [[]] },
    ],
    solution: (values) => {
      if (values.length === 0) return 0;
      const tails = [];
      for (const value of values) {
        let left = 0;
        let right = tails.length;
        while (left < right) {
          const mid = Math.floor((left + right) / 2);
          if (tails[mid] < value) {
            left = mid + 1;
          } else {
            right = mid;
          }
        }
        tails[left] = value;
      }
      return tails.length;
    },
  },
  {
    id: 'algo-merge-sorted-arrays',
    title: '2 つのソート配列のマージ',
    summary: '2 つのソート済み配列をマージします。',
    difficulty: 'Easy',
    tags: ['algorithm', 'merge'],
    functionName: 'mergeSortedArrays',
    signature: 'mergeSortedArrays(a, b)',
    comment: '昇順ソートされた 2 配列をマージする',
    promptLines: [
      '昇順にソートされた数値配列 `a` と `b` を結合し、昇順の配列として返してください。',
    ],
    constraints: ['a.length, b.length は 0 〜 10^5'],
    samples: [
      { description: '同じ長さ', args: [[1, 3, 5], [2, 4, 6]] },
      { description: '片方が空', args: [[1, 2], []] },
      { description: '重複を含む', args: [[1, 1, 2], [1, 3]] },
    ],
    solution: (a, b) => {
      const result = [];
      let i = 0;
      let j = 0;
      while (i < a.length && j < b.length) {
        if (a[i] <= b[j]) {
          result.push(a[i]);
          i += 1;
        } else {
          result.push(b[j]);
          j += 1;
        }
      }
      while (i < a.length) result.push(a[i++]);
      while (j < b.length) result.push(b[j++]);
      return result;
    },
  },
  {
    id: 'algo-is-valid-parentheses',
    title: '括弧の整合性',
    summary: '括弧の並びが正しいか判定します。',
    difficulty: 'Easy',
    tags: ['algorithm', 'stack'],
    functionName: 'isValidParentheses',
    signature: 'isValidParentheses(text)',
    comment: '括弧が正しくネストされているか判定する',
    promptLines: [
      '文字列 `text` が (), [], {} の括弧で正しくネストされている場合 true を返してください。',
      'その他の文字は存在しないとします。',
    ],
    constraints: ['text.length は 0 〜 10^4'],
    samples: [
      { description: '正しい並び', args: ['({[]})'] },
      { description: '誤った並び', args: ['([)]'] },
      { description: '空文字', args: [''] },
    ],
    solution: (text) => {
      const stack = [];
      const pairs = { ')': '(', ']': '[', '}': '{' };
      for (const char of text) {
        if (char === '(' || char === '[' || char === '{') {
          stack.push(char);
        } else {
          if (stack.pop() !== pairs[char]) {
            return false;
          }
        }
      }
      return stack.length === 0;
    },
  },
  {
    id: 'algo-find-peak',
    title: 'ピーク要素の探索',
    summary: '隣より大きい要素のインデックスを返します。',
    difficulty: 'Medium',
    tags: ['algorithm', 'binary-search'],
    functionName: 'findPeakElement',
    signature: 'findPeakElement(values)',
    comment: '隣接より大きいピーク要素のインデックスを返す',
    promptLines: [
      '配列 `values` から、隣接要素よりも大きいピーク要素のいずれかのインデックスを返してください。',
      '両端は片側のみと比較します。',
    ],
    constraints: ['values.length は 1 〜 10^5'],
    samples: [
      { description: '中央にピーク', args: [[1, 3, 2]] },
      { description: '単調増加', args: [[1, 2, 3, 4]] },
      { description: '単一要素', args: [[10]] },
    ],
    solution: (values) => {
      let left = 0;
      let right = values.length - 1;
      while (left < right) {
        const mid = Math.floor((left + right) / 2);
        if (values[mid] < values[mid + 1]) {
          left = mid + 1;
        } else {
          right = mid;
        }
      }
      return left;
    },
  },
  {
    id: 'algo-majority-element',
    title: '過半数要素',
    summary: '配列に過半数で現れる要素を探します。',
    difficulty: 'Easy',
    tags: ['algorithm', 'array'],
    functionName: 'majorityElement',
    signature: 'majorityElement(values)',
    comment: '過半数要素を返し、存在しなければ null',
    promptLines: [
      '配列 `values` に要素数の半分より多く現れる要素があれば返し、存在しなければ null を返してください。',
    ],
    constraints: ['values.length は 0 〜 10^5'],
    samples: [
      { description: '過半数あり', args: [[3, 2, 3]] },
      { description: '過半数なし', args: [[1, 2, 3, 4]] },
      { description: '大きな配列', args: [[2, 2, 1, 1, 1, 2, 2]] },
    ],
    solution: (values) => {
      if (values.length === 0) return null;
      let candidate = null;
      let count = 0;
      for (const value of values) {
        if (count === 0) {
          candidate = value;
          count = 1;
        } else if (value === candidate) {
          count += 1;
        } else {
          count -= 1;
        }
      }
      if (candidate === null) return null;
      const occurrences = values.filter((value) => value === candidate).length;
      return occurrences > values.length / 2 ? candidate : null;
    },
  },
  {
    id: 'algo-transpose-matrix',
    title: '行列の転置',
    summary: '行列を転置します。',
    difficulty: 'Easy',
    tags: ['algorithm', 'matrix'],
    functionName: 'transposeMatrix',
    signature: 'transposeMatrix(matrix)',
    comment: '行列を転置した新しい行列を返す',
    promptLines: [
      '2 次元配列 `matrix` を転置した結果を返してください。',
    ],
    constraints: ['matrix のサイズは 0 〜 200 行 × 200 列'],
    samples: [
      { description: '正方行列', args: [[[1, 2], [3, 4]]] },
      { description: '長方行列', args: [[[1, 2, 3], [4, 5, 6]]] },
      { description: '1 行行列', args: [[[7, 8, 9]]] },
    ],
    solution: (matrix) => {
      if (matrix.length === 0) return [];
      const rows = matrix.length;
      const cols = matrix[0].length;
      const result = Array.from({ length: cols }, () => Array(rows));
      for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          result[c][r] = matrix[r][c];
        }
      }
      return result;
    },
  },
  {
    id: 'algo-spiral-order',
    title: 'スパイラル順走査',
    summary: '行列を渦巻き順で走査します。',
    difficulty: 'Medium',
    tags: ['algorithm', 'matrix'],
    functionName: 'spiralOrder',
    signature: 'spiralOrder(matrix)',
    comment: '行列をスパイラル順に読み出す',
    promptLines: [
      '2 次元配列 `matrix` の要素を、左上から時計回りの渦巻き順に並べた配列を返してください。',
    ],
    constraints: ['matrix のサイズは 0 〜 100 行 × 100 列'],
    samples: [
      { description: '正方行列', args: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]] },
      { description: '長方行列', args: [[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]] },
      { description: '1 行行列', args: [[[1, 2, 3]]] },
    ],
    solution: (matrix) => {
      const result = [];
      if (matrix.length === 0) return result;
      let top = 0;
      let bottom = matrix.length - 1;
      let left = 0;
      let right = matrix[0].length - 1;
      while (top <= bottom && left <= right) {
        for (let c = left; c <= right; c += 1) result.push(matrix[top][c]);
        top += 1;
        for (let r = top; r <= bottom; r += 1) result.push(matrix[r][right]);
        right -= 1;
        if (top <= bottom) {
          for (let c = right; c >= left; c -= 1) result.push(matrix[bottom][c]);
          bottom -= 1;
        }
        if (left <= right) {
          for (let r = bottom; r >= top; r -= 1) result.push(matrix[r][left]);
          left += 1;
        }
      }
      return result;
    },
  },
  {
    id: 'algo-diagonal-difference',
    title: '対角線の差',
    summary: '正方行列の 2 つの対角線の差を求めます。',
    difficulty: 'Easy',
    tags: ['algorithm', 'matrix'],
    functionName: 'diagonalDifference',
    signature: 'diagonalDifference(matrix)',
    comment: '主対角線と副対角線の差の絶対値を返す',
    promptLines: [
      '正方行列 `matrix` の主対角線と副対角線の合計の差の絶対値を返してください。',
    ],
    constraints: ['matrix は n × n (1 ≤ n ≤ 500)'],
    samples: [
      { description: '3×3 行列', args: [[[11, 2, 4], [4, 5, 6], [10, 8, -12]]] },
      { description: '2×2 行列', args: [[[1, 2], [3, 4]]] },
      { description: '1×1 行列', args: [[[7]]] },
    ],
    solution: (matrix) => {
      let main = 0;
      let secondary = 0;
      const n = matrix.length;
      for (let i = 0; i < n; i += 1) {
        main += matrix[i][i];
        secondary += matrix[i][n - 1 - i];
      }
      return Math.abs(main - secondary);
    },
  },
  {
    id: 'algo-merge-intervals',
    title: '区間のマージ',
    summary: '重なる区間を結合します。',
    difficulty: 'Medium',
    tags: ['algorithm', 'interval'],
    functionName: 'mergeIntervals',
    signature: 'mergeIntervals(intervals)',
    comment: '区間のリストから重複を統合する',
    promptLines: [
      '`[start, end]` 形式の区間配列 `intervals` から、重なる区間を結合した配列を返してください。',
      '戻り値も start の昇順になるようにしてください。',
    ],
    constraints: ['intervals.length は 0 〜 10^4'],
    samples: [
      { description: '重なりあり', args: [[[1, 3], [2, 6], [8, 10], [15, 18]]] },
      { description: '入れ子', args: [[[1, 4], [2, 3]]] },
      { description: '重なりなし', args: [[[1, 2], [3, 4]]] },
    ],
    solution: (intervals) => {
      if (intervals.length === 0) return [];
      const sorted = intervals.slice().sort((a, b) => a[0] - b[0]);
      const merged = [sorted[0].slice()];
      for (let i = 1; i < sorted.length; i += 1) {
        const last = merged[merged.length - 1];
        const current = sorted[i];
        if (current[0] <= last[1]) {
          last[1] = Math.max(last[1], current[1]);
        } else {
          merged.push(current.slice());
        }
      }
      return merged;
    },
  },
  {
    id: 'algo-longest-unique-substring',
    title: '最長部分文字列 (重複なし)',
    summary: '重複文字を含まない最長部分文字列の長さを求めます。',
    difficulty: 'Medium',
    tags: ['algorithm', 'sliding-window'],
    functionName: 'lengthOfLongestSubstring',
    signature: 'lengthOfLongestSubstring(text)',
    comment: '重複なし部分文字列の最長長を求める',
    promptLines: [
      '文字列 `text` の中で、同じ文字を含まない最長部分文字列の長さを返してください。',
    ],
    constraints: ['text.length は 0 〜 10^5'],
    samples: [
      { description: '基本ケース', args: ['abcabcbb'] },
      { description: '全て同じ文字', args: ['bbbbb'] },
      { description: '空文字', args: [''] },
    ],
    solution: (text) => {
      const seen = new Map();
      let left = 0;
      let best = 0;
      for (let right = 0; right < text.length; right += 1) {
        const char = text[right];
        if (seen.has(char) && seen.get(char) >= left) {
          left = seen.get(char) + 1;
        }
        seen.set(char, right);
        best = Math.max(best, right - left + 1);
      }
      return best;
    },
  },
  {
    id: 'algo-min-subarray-length',
    title: '目標を達成する最小部分配列',
    summary: '合計が目標以上となる最小部分配列の長さを求めます。',
    difficulty: 'Medium',
    tags: ['algorithm', 'sliding-window'],
    functionName: 'minSubarrayLength',
    signature: 'minSubarrayLength(target, values)',
    comment: '合計が target 以上の最小長の連続部分配列を求める',
    promptLines: [
      '正の整数配列 `values` から、合計が `target` 以上となる最小の連続部分配列の長さを返してください。',
      '存在しない場合は 0 を返します。',
    ],
    constraints: ['values.length は 0 〜 10^5'],
    samples: [
      { description: '基本ケース', args: [7, [2, 3, 1, 2, 4, 3]] },
      { description: '単一要素で達成', args: [4, [1, 4, 4]] },
      { description: '達成不能', args: [15, [1, 2, 3, 4]] },
    ],
    solution: (target, values) => {
      let left = 0;
      let sum = 0;
      let best = Infinity;
      for (let right = 0; right < values.length; right += 1) {
        sum += values[right];
        while (sum >= target) {
          best = Math.min(best, right - left + 1);
          sum -= values[left];
          left += 1;
        }
      }
      return best === Infinity ? 0 : best;
    },
  },
  {
    id: 'algo-search-matrix',
    title: '行列の二分探索',
    summary: '行列内にターゲットが存在するか判定します。',
    difficulty: 'Medium',
    tags: ['algorithm', 'binary-search'],
    functionName: 'searchMatrix',
    signature: 'searchMatrix(matrix, target)',
    comment: '行列を一次元に見立てて二分探索する',
    promptLines: [
      '各行が昇順、かつ行の先頭が前の行の末尾より大きい行列 `matrix` 内に `target` が存在するかを判定してください。',
    ],
    constraints: ['matrix のサイズは 0 〜 10^3 行 × 10^3 列'],
    samples: [
      { description: '存在する要素', args: [[[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 3] },
      { description: '存在しない要素', args: [[[1, 3, 5], [7, 9, 11]], 8] },
      { description: '空行列', args: [[], 1] },
    ],
    solution: (matrix, target) => {
      if (matrix.length === 0 || matrix[0].length === 0) return false;
      const rows = matrix.length;
      const cols = matrix[0].length;
      let left = 0;
      let right = rows * cols - 1;
      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const value = matrix[Math.floor(mid / cols)][mid % cols];
        if (value === target) return true;
        if (value < target) {
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      }
      return false;
    },
  },
  {
    id: 'algo-rotate-matrix',
    title: '正方行列の回転',
    summary: '正方行列を 90 度回転させます。',
    difficulty: 'Medium',
    tags: ['algorithm', 'matrix'],
    functionName: 'rotateMatrixClockwise',
    signature: 'rotateMatrixClockwise(matrix)',
    comment: '正方行列を時計回りに 90 度回転させる',
    promptLines: [
      '正方行列 `matrix` を時計回りに 90 度回転させた新しい行列を返してください。',
    ],
    constraints: ['matrix は n × n (0 ≤ n ≤ 200)'],
    samples: [
      { description: '2×2', args: [[[1, 2], [3, 4]]] },
      { description: '3×3', args: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]] },
      { description: '1×1', args: [[[5]]] },
    ],
    solution: (matrix) => {
      const n = matrix.length;
      const result = Array.from({ length: n }, () => Array(n).fill(null));
      for (let r = 0; r < n; r += 1) {
        for (let c = 0; c < n; c += 1) {
          result[c][n - 1 - r] = matrix[r][c];
        }
      }
      return result;
    },
  },
  {
    id: 'algo-kth-largest',
    title: 'k 番目に大きい要素',
    summary: '配列で k 番目に大きい値を返します。',
    difficulty: 'Easy',
    tags: ['algorithm', 'sorting'],
    functionName: 'kthLargest',
    signature: 'kthLargest(values, k)',
    comment: 'k 番目に大きい要素を求める',
    promptLines: [
      '数値配列 `values` から k 番目に大きい値を返してください。',
      'k は 1 以上 `values.length` 以下であると保証します。',
    ],
    constraints: ['values.length は 1 〜 10^5'],
    samples: [
      { description: '基本ケース', args: [[3, 2, 1, 5, 6, 4], 2] },
      { description: '最大値を取得', args: [[7, 7, 7], 1] },
      { description: '最小値を取得', args: [[9, 8, 7], 3] },
    ],
    solution: (values, k) => {
      const copy = values.slice().sort((a, b) => b - a);
      return copy[k - 1];
    },
  },
];

const arrayProblems = createProblems('Arrays', arrayTemplates);
const numberProblems = createProblems('Numbers', numberTemplates);
const collectionProblems = createProblems('Collections', collectionTemplates);
const algorithmProblems = createProblems('Algorithms', algorithmTemplates);

const allProblems = [
  ...stringProblemsWithCategory,
  ...arrayProblems,
  ...numberProblems,
  ...collectionProblems,
  ...algorithmProblems,
];

export const problems = allProblems;

export function getTagOptions() {
  const tags = new Set();
  for (const problem of allProblems) {
    for (const tag of problem.tags) {
      tags.add(tag);
    }
  }
  const options = Array.from(tags).sort();
  return ['All', ...options];
}

const CATEGORY_ORDER = ['Strings', 'Arrays', 'Numbers', 'Collections', 'Algorithms'];

export function getCategoryOptions() {
  const existing = CATEGORY_ORDER.filter((category) => allProblems.some((problem) => problem.category === category));
  return ['All', ...existing];
}
