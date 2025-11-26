import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const { sql } = await request.json();

    if (!sql) {
      return NextResponse.json(
        { error: 'SQLが提供されていません' },
        { status: 400 }
      );
    }

    // 環境変数からSupabaseの認証情報を取得
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabaseの認証情報が設定されていません' },
        { status: 500 }
      );
    }

    // サービスロールキーでSupabaseクライアントを作成（管理者権限）
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // SQLを実行（複数のステートメントを分割）
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    const results = [];
    
    for (const statement of statements) {
      if (statement.trim().startsWith('SELECT')) {
        // SELECT文の場合はデータを取得
        const { data, error } = await supabase.rpc('exec_sql', { query: statement });
        if (error) {
          results.push({ statement, error: error.message });
        } else {
          results.push({ statement, data });
        }
      } else {
        // UPDATE/DELETE/INSERT文の場合は直接実行できないため、エラーを返す
        // 実際にはPostgreSQLクライアントが必要
        results.push({ 
          statement, 
          error: 'このSQLはSupabaseのRPC関数では実行できません。SupabaseのSQL Editorで直接実行してください。' 
        });
      }
    }

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('SQL実行エラー:', error);
    return NextResponse.json(
      { error: error.message || 'SQLの実行に失敗しました' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // SQLファイルを読み込む
    const sqlPath = join(process.cwd(), 'fix-duplicate-default-maps-except-kumap.sql');
    const sqlContent = readFileSync(sqlPath, 'utf-8');
    
    return NextResponse.json({ sql: sqlContent });
  } catch (error: any) {
    console.error('SQLファイル読み込みエラー:', error);
    return NextResponse.json(
      { error: error.message || 'SQLファイルの読み込みに失敗しました' },
      { status: 500 }
    );
  }
}






