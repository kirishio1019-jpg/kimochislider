# Supabase設定の確認手順（詳細版）

## ステップ1: NEXT_PUBLIC_SUPABASE_URLの確認

### 1-1. Vercel Dashboardで環境変数を確認

1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. プロジェクト `kimochislider` を選択
3. 左側のメニューから「**Settings**」をクリック
4. 「**Environment Variables**」をクリック
5. 環境変数の一覧から「**NEXT_PUBLIC_SUPABASE_URL**」を探す

#### ✅ 正しい形式の例：
```
https://abcdefghijklmnop.supabase.co
```
- `https://`で始まる
- `.supabase.co`で終わる
- プロジェクトID（ランダムな文字列）が含まれている

#### ❌ 間違った形式の例：
```
http://abcdefghijklmnop.supabase.co  ← httpではなくhttps
https://abcdefghijklmnop.supabase.com  ← .coではなく.com
abcdefghijklmnop.supabase.co  ← https://がない
```

### 1-2. Supabase Dashboardで正しいURLを確認

1. [Supabase Dashboard](https://supabase.com/dashboard)にアクセス
2. プロジェクトを選択
3. 左側のメニューから「**Settings**」（歯車アイコン）をクリック
4. 「**API**」をクリック
5. 「**Project URL**」セクションを確認
   - ここに表示されているURLをコピー
   - 例: `https://abcdefghijklmnop.supabase.co`

### 1-3. 2つのURLを比較

- **Vercel Dashboard**の`NEXT_PUBLIC_SUPABASE_URL`の値
- **Supabase Dashboard**の「Project URL」の値

**これらが完全に一致している必要があります。**

#### 一致していない場合の修正方法：

1. Supabase Dashboardで「Project URL」をコピー
2. Vercel Dashboard → Settings → Environment Variables
3. `NEXT_PUBLIC_SUPABASE_URL`を編集
4. コピーしたURLを貼り付け
5. 「Save」をクリック
6. **再デプロイを実行**（重要！）

---

## ステップ2: Redirect URLの確認と登録

### 2-1. 実際のRedirect URLを確認

#### 方法A: ブラウザのコンソールで確認（推奨）

1. 本番環境のURL（`https://kimochislider.vercel.app`）にアクセス
2. F12キーで開発者ツールを開く
3. 「Console」タブを選択
4. Googleログインボタンをクリック
5. コンソールに表示される以下のログを確認：

```
🔵 Redirect URL: https://kimochislider.vercel.app/auth/callback
```

この`Redirect URL`の値をコピーしてください。

#### 方法B: 手動で計算

1. Vercel Dashboardで実際のデプロイURLを確認
   - プロジェクト → 「Deployments」タブ
   - 最新のデプロイのURLを確認
   - 例: `https://kimochislider-xxxxx.vercel.app` または `https://kimochislider.vercel.app`
2. そのURLの末尾に`/auth/callback`を追加
   - 例: `https://kimochislider.vercel.app/auth/callback`

### 2-2. Supabase DashboardでRedirect URLを登録

1. [Supabase Dashboard](https://supabase.com/dashboard)にアクセス
2. プロジェクトを選択
3. 左側のメニューから「**Authentication**」をクリック
4. 「**URL Configuration**」をクリック
5. 「**Redirect URLs**」セクションを確認

#### 現在登録されているURLを確認

- リストに表示されているURLをすべて確認
- コンソールで確認した`Redirect URL`が**完全一致**で登録されているか確認

#### Redirect URLを追加する手順

1. 「**Redirect URLs**」セクションで「**Add URL**」ボタンをクリック
2. テキストボックスに以下を**正確に**入力：
   ```
   https://kimochislider.vercel.app/auth/callback
   ```
   ⚠️ **重要**：
   - `https://`で始める
   - 末尾に`/auth/callback`を追加
   - **末尾にスラッシュ（`/`）を追加しない**
   - 大文字小文字に注意（通常は小文字）

3. 「**Save**」ボタンをクリック
4. **30秒待つ**（設定が反映されるまで）

### 2-3. Site URLも設定

1. 「**Site URL**」セクションを確認
2. テキストボックスに以下を入力：
   ```
   https://kimochislider.vercel.app
   ```
   ⚠️ **重要**：
   - `https://`で始める
   - **末尾にスラッシュ（`/`）を追加しない**
   - `/auth/callback`は不要（Site URLには含めない）

3. 「**Save**」ボタンをクリック
4. **30秒待つ**

---

## ステップ3: よくある間違いの確認

### ❌ 間違った設定例

#### 1. Redirect URLの末尾にスラッシュがある
```
❌ https://kimochislider.vercel.app/auth/callback/
✅ https://kimochislider.vercel.app/auth/callback
```

#### 2. httpとhttpsが混在している
```
❌ http://kimochislider.vercel.app/auth/callback
✅ https://kimochislider.vercel.app/auth/callback
```

#### 3. Redirect URLが登録されていない
- Supabase Dashboardに登録されていない
- または、登録されているが形式が一致していない

#### 4. Site URLに/auth/callbackが含まれている
```
❌ Site URL: https://kimochislider.vercel.app/auth/callback
✅ Site URL: https://kimochislider.vercel.app
```

#### 5. 複数のURLが登録されている場合の混乱
- 開発環境用: `http://localhost:3000/auth/callback`
- 本番環境用: `https://kimochislider.vercel.app/auth/callback`
- 両方が登録されていても問題ありませんが、**本番環境用のURLが正確に登録されているか確認**

---

## ステップ4: 設定の確認チェックリスト

### NEXT_PUBLIC_SUPABASE_URL
- [ ] Vercel Dashboardで`NEXT_PUBLIC_SUPABASE_URL`が設定されている
- [ ] `https://`で始まっている
- [ ] `.supabase.co`で終わっている
- [ ] Supabase Dashboardの「Project URL」と完全に一致している

### Redirect URL
- [ ] ブラウザのコンソールで`Redirect URL`を確認した
- [ ] `https://`で始まっている
- [ ] 末尾が`/auth/callback`になっている
- [ ] 末尾にスラッシュ（`/`）がない
- [ ] Supabase Dashboardの「Redirect URLs」に**完全一致**で登録されている

### Site URL
- [ ] Supabase Dashboardの「Site URL」が設定されている
- [ ] `https://`で始まっている
- [ ] 末尾にスラッシュ（`/`）がない
- [ ] `/auth/callback`が含まれていない

### 設定の反映
- [ ] Supabase Dashboardで「Save」をクリックした
- [ ] 設定後、30秒待った
- [ ] Vercel Dashboardで環境変数を変更した場合は、再デプロイを実行した

---

## ステップ5: デバッグ方法

### ブラウザのコンソールで確認

1. 本番環境のURLにアクセス
2. F12キーで開発者ツールを開く
3. 「Console」タブを選択
4. Googleログインボタンをクリック
5. 以下のログを確認：

```
🔵 === Google Login Debug ===
🔵 App URL: https://kimochislider.vercel.app
🔵 Redirect URL: https://kimochislider.vercel.app/auth/callback
🔵 --- Supabase Configuration ---
🔵 NEXT_PUBLIC_SUPABASE_URL: https://abcdefghijklmnop.supabase.co
🔵 Supabase URL valid: true
🔵 ========================
```

### 確認ポイント

1. **`🔵 Redirect URL:`** の値
   - この値がSupabase Dashboardの「Redirect URLs」に登録されているか確認

2. **`🔵 NEXT_PUBLIC_SUPABASE_URL:`** の値
   - `https://`で始まっているか
   - `.supabase.co`で終わっているか
   - Supabase Dashboardの「Project URL」と一致しているか

3. **`🔵 Supabase URL valid: true`** が表示されているか
   - `false`の場合は、Supabase URLの形式が間違っています

---

## ステップ6: エラーが発生した場合

### 404エラーが発生する場合

1. **Redirect URLが登録されていない**
   - Supabase Dashboard → Authentication → URL Configuration
   - 「Redirect URLs」にコンソールで確認した`Redirect URL`を追加
   - 「Save」をクリック
   - 30秒待つ

2. **Redirect URLの形式が一致していない**
   - 末尾のスラッシュ、大文字小文字、プロトコル（https）を確認
   - 完全一致で登録されているか確認

3. **Supabase URLが間違っている**
   - Vercel Dashboardで`NEXT_PUBLIC_SUPABASE_URL`を確認
   - Supabase Dashboardの「Project URL」と一致しているか確認
   - 間違っている場合は修正して再デプロイ

### 設定を変更した後

1. **Supabase Dashboardで設定を変更した場合**
   - 「Save」をクリック
   - **30秒待つ**（設定が反映されるまで）

2. **Vercel Dashboardで環境変数を変更した場合**
   - 「Save」をクリック
   - **再デプロイを実行**（重要！）
   - デプロイ完了後（1-3分）、再度試す

---

## まとめ

### 確認すべき3つのポイント

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Vercel Dashboardで設定されている
   - `https://`で始まり、`.supabase.co`で終わる
   - Supabase Dashboardの「Project URL」と完全一致

2. **Redirect URL**
   - ブラウザのコンソールで確認
   - Supabase Dashboardの「Redirect URLs」に完全一致で登録されている

3. **Site URL**
   - Supabase Dashboardで設定されている
   - `https://`で始まり、末尾にスラッシュがない

### 設定変更後の確認

- Supabase Dashboardで設定を変更した場合：30秒待つ
- Vercel Dashboardで環境変数を変更した場合：再デプロイを実行
