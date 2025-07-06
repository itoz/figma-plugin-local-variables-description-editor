# Figma Local Variables Description Editor

Figmaのローカル変数の説明（description）を一覧表示し、直接編集できるプラグインです。

![Plugin Screenshot](docs/screenshot.png)

## 機能

- 📋 **変数一覧表示**: プロジェクト内のすべてのローカル変数を一覧表示
- ✏️ **インライン編集**: 変数の説明を直接編集可能
- 🎨 **カラープレビュー**: 色変数の視覚的プレビュー
- 🔗 **参照解決**: 参照変数の実際の値を表示
- 🔍 **検索機能**: 変数名でフィルタリング
- 📁 **コレクション表示**: 変数のコレクション名を表示

## インストール

### 開発環境でのセットアップ

1. リポジトリをクローン
```bash
git clone https://github.com/itoz/figma-plugin-local-variables-description-editor.git
cd figma-plugin-local-variables-description-editor
```

2. 依存関係をインストール
```bash
npm install
```

3. プラグインをビルド
```bash
npm run build
```

4. Figmaでプラグインをインポート
   - Figmaデスクトップアプリを開く
   - メニューから「Plugins」→「Development」→「Import plugin from manifest...」を選択
   - プロジェクトルートの`manifest.json`を選択

## 使い方

1. Figmaでプロジェクトを開く
2. メニューから「Plugins」→「Development」→「Local Variables Description Editor」を選択
3. プラグインウィンドウが開き、ローカル変数の一覧が表示されます
4. 説明欄をクリックして編集
5. EnterキーまたはフォーカスアウトでAutoSave

## 開発

### 必要な環境

- Node.js 16以上
- npm または yarn
- Figmaデスクトップアプリ

### 開発コマンド

```bash
# 開発モード（ファイル監視）
npm run dev

# プロダクションビルド
npm run build

# 型チェック
npm run typecheck
```

### プロジェクト構造

```
├── src/
│   ├── code.ts              # Figma側で実行されるメインコード
│   ├── ui.tsx               # React製のUI
│   ├── components/          # UIコンポーネント
│   │   ├── variables-data-table.tsx
│   │   ├── editable-cell.tsx
│   │   ├── variable-value-cell.tsx
│   │   └── ui/              # shadcn/uiコンポーネント
│   └── styles.css           # Tailwind CSS
├── manifest.json            # Figmaプラグイン設定
├── webpack.config.js        # Webpack設定
└── tsconfig.json           # TypeScript設定
```

### 技術スタック

- **Frontend**: React + TypeScript
- **UI Library**: [shadcn/ui](https://ui.shadcn.com/)
- **Styling**: Tailwind CSS
- **Build Tool**: Webpack
- **Table**: [@tanstack/react-table](https://tanstack.com/table)

## 機能詳細

### 変数タイプのサポート

- ✅ **COLOR**: カラーチップ付きで表示、参照の解決
- ✅ **FLOAT**: 数値表示（小数点以下の0は省略）
- ✅ **STRING**: テキスト表示（引用符付き）
- ✅ **BOOLEAN**: true/false表示（色分け）

### 参照の解決

色変数が他の変数を参照している場合、参照先の実際の色を表示：
- カラーチップで視覚的に表示
- 16進数カラーコードを併記

## トラブルシューティング

### ビルドエラーが発生する場合

```bash
# node_modulesを削除して再インストール
rm -rf node_modules
npm install
npm run build
```

### プラグインが表示されない場合

1. Figmaを再起動
2. manifest.jsonが正しい場所にあることを確認
3. ビルドが成功していることを確認（dist/code.js, dist/ui.htmlが存在）

## ライセンス

MIT License

## 貢献

プルリクエストを歓迎します。大きな変更の場合は、まずissueを作成して変更内容について議論してください。

### 開発ガイドライン

1. ソースコード変更後は必ず`npm run build`でビルドを確認
2. TypeScriptの型エラーがないことを確認
3. 既存のコードスタイルに従う

詳細は[CLAUDE.md](./CLAUDE.md)を参照してください。