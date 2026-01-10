export default function TestPage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>テストページ</h1>
      <p>このページが表示されれば、Next.jsは正常に動作しています。</p>
      <p>現在の時刻: {new Date().toLocaleString('ja-JP')}</p>
      <a href="/" style={{ color: 'blue', textDecoration: 'underline' }}>
        メインページに戻る
      </a>
      <br />
      <a href="/execute-sql" style={{ color: 'blue', textDecoration: 'underline' }}>
        SQL実行ページ
      </a>
    </div>
  );
}

















