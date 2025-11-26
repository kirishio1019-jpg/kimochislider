'use client';

import { useState } from 'react';

const SQL_CONTENT = `-- クマップ以外のコミュニティで重複しているデフォルト地図を1つにまとめるSQL
-- SupabaseのSQL Editorで実行してください

-- ステップ1: クマップ以外のコミュニティのデフォルト地図を確認
SELECT 
  c.id as community_id,
  c.name as community_name,
  m.id as map_id,
  m.name as map_name,
  m.created_at,
  COUNT(*) OVER (PARTITION BY c.id) as map_count
FROM communities c
JOIN maps m ON m.community_id = c.id
WHERE m.name = 'デフォルト地図'
  AND c.name != 'クマップ'
ORDER BY c.id, m.created_at;

-- ステップ2: クマップ以外のコミュニティで最も古いデフォルト地図を1つ残し、残りを削除
-- 注意: この操作は不可逆です。実行前に上記のSELECTで確認してください

-- 各コミュニティ（クマップ以外）で最も古いデフォルト地図のIDを取得し、それ以外を削除
WITH default_maps AS (
  SELECT 
    m.id,
    m.community_id,
    m.created_at,
    ROW_NUMBER() OVER (PARTITION BY m.community_id ORDER BY m.created_at ASC) as rn
  FROM maps m
  JOIN communities c ON c.id = m.community_id
  WHERE m.name = 'デフォルト地図'
    AND c.name != 'クマップ'
),
maps_to_delete AS (
  SELECT id
  FROM default_maps
  WHERE rn > 1
)
-- 削除対象の地図に紐づいているスポットを、残す地図に移動
UPDATE local_spots
SET map_id = (
  SELECT dm.id
  FROM default_maps dm
  WHERE dm.community_id = local_spots.community_id
    AND dm.rn = 1
  LIMIT 1
)
WHERE map_id IN (SELECT id FROM maps_to_delete)
  AND EXISTS (
    SELECT 1 FROM communities c
    WHERE c.id = local_spots.community_id
      AND c.name != 'クマップ'
  );

-- 重複しているデフォルト地図を削除（クマップ以外）
DELETE FROM maps
WHERE id IN (
  SELECT id
  FROM (
    SELECT 
      m.id,
      ROW_NUMBER() OVER (PARTITION BY m.community_id ORDER BY m.created_at ASC) as rn
    FROM maps m
    JOIN communities c ON c.id = m.community_id
    WHERE m.name = 'デフォルト地図'
      AND c.name != 'クマップ'
  ) ranked
  WHERE rn > 1
);

-- ステップ3: 確認（クマップ以外の各コミュニティにデフォルト地図が1つだけあることを確認）
SELECT 
  c.id as community_id,
  c.name as community_name,
  COUNT(m.id) as default_map_count
FROM communities c
LEFT JOIN maps m ON m.community_id = c.id AND m.name = 'デフォルト地図'
WHERE c.name != 'クマップ'
GROUP BY c.id, c.name
HAVING COUNT(m.id) > 1
ORDER BY c.id;

-- 結果が0行であれば、重複は解消されています
`;

export default function ExecuteSQLPage() {
  const [sql, setSql] = useState(SQL_CONTENT);

  const handleCopy = () => {
    navigator.clipboard.writeText(sql).then(() => {
      alert('SQLをクリップボードにコピーしました！');
    }).catch(() => {
      // フォールバック: テキストエリアを選択してコピー
      const textarea = document.createElement('textarea');
      textarea.value = sql;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('SQLをクリップボードにコピーしました！');
    });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
          SQL実行ツール
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
          このSQLはSupabaseのSQL Editorで直接実行する必要があります。
          以下のSQLをコピーして、SupabaseのSQL Editorに貼り付けて実行してください。
        </p>

        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              SQL文
            </label>
            <textarea
              value={sql}
              onChange={(e) => setSql(e.target.value)}
              style={{
                width: '100%',
                height: '400px',
                padding: '1rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontFamily: 'monospace',
                fontSize: '0.875rem'
              }}
              placeholder="SQLを入力または貼り付け..."
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleCopy}
              style={{
                padding: '0.5rem 1.5rem',
                backgroundColor: '#4b5563',
                color: 'white',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#374151'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
            >
              SQLをコピー
            </button>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '0.5rem 1.5rem',
                backgroundColor: '#16a34a',
                color: 'white',
                borderRadius: '0.375rem',
                textDecoration: 'none',
                display: 'inline-block'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#15803d'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
            >
              Supabase SQL Editorを開く
            </a>
          </div>
        </div>

        <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fde047', borderRadius: '0.5rem', padding: '1rem' }}>
          <h3 style={{ color: '#92400e', fontWeight: '600', marginBottom: '0.5rem' }}>⚠️ 重要な注意事項</h3>
          <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', color: '#78350f' }}>
            <li>このSQLはデータベースを変更する操作を含みます</li>
            <li>実行前に必ずバックアップを取ってください</li>
            <li>SupabaseのSQL Editorで直接実行することを推奨します</li>
            <li>実行前にステップ1のSELECT文で確認してください</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

