import { createClient } from '@supabase/supabase-js';
import { LocalSpot, Community, Category, CategoryItem, CommunityMember, Map, SpotComment } from '@/types';
import { calculateTrendScoresForSpots } from './calculateTrendScore';

// Next.jsではNEXT_PUBLIC_プレフィックスがついた環境変数は自動的にクライアント側で利用可能
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 環境変数の検証（サーバー側のみ）
if (typeof window === 'undefined') {
  if (!supabaseUrl || supabaseUrl === '' || supabaseUrl.includes('placeholder')) {
    console.warn('⚠️ Supabase URLが設定されていません。.env.localファイルを確認してください。');
  }
  if (!supabaseAnonKey || supabaseAnonKey === '' || supabaseAnonKey.includes('placeholder')) {
    console.warn('⚠️ Supabase Anon Keyが設定されていません。.env.localファイルを確認してください。');
  }
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true, // セッションを保持して認証を有効化
    },
  }
);

export async function getLocalSpots(communityId?: string, mapId?: string): Promise<LocalSpot[]> {
  // 環境変数の検証
  if (!supabaseUrl || supabaseUrl.includes('placeholder') || !supabaseAnonKey || supabaseAnonKey.includes('placeholder')) {
    console.error('⚠️ Supabaseの環境変数が正しく設定されていません。');
    console.error('現在のURL:', supabaseUrl || '未設定');
    console.error('現在のKey:', supabaseAnonKey ? '設定済み（長さ: ' + supabaseAnonKey.length + '）' : '未設定');
    console.error('💡 解決方法:');
    console.error('1. .env.localファイルが正しいフォーマットか確認');
    console.error('2. 開発サーバーを完全に停止して再起動（Ctrl+Cで停止後、npm run dev）');
    console.error('3. .nextフォルダを削除してキャッシュをクリア');
    return [];
  }

  try {
    let query = supabase
      .from('local_spots')
      .select('*');

    // コミュニティIDでフィルタリング
    if (communityId) {
      query = query.eq('community_id', communityId);
    }
    
    // map_idでフィルタリング（オプション）
    if (mapId) {
      query = query.eq('map_id', mapId);
    }

    const { data, error } = await query.order('trend_score', { ascending: false, nullsFirst: false });

    if (error) {
      // ネットワークエラーの場合
      if (error.message?.includes('Failed to fetch') || error.message?.includes('fetch')) {
        console.error('❌ Supabaseへの接続に失敗しました。');
        console.error('考えられる原因:');
        console.error('1. SupabaseのURLが正しくない');
        console.error('2. インターネット接続の問題');
        console.error('3. Supabaseプロジェクトが存在しない、または無効');
        console.error('4. CORSの設定の問題');
        console.error('設定されているURL:', supabaseUrl);
      } else {
        // その他のSupabaseエラー
        console.error('❌ Supabaseエラー:', error.message || '不明なエラー');
        if (error.details) console.error('詳細:', error.details);
        if (error.hint) console.error('ヒント:', error.hint);
        if (error.code) console.error('コード:', error.code);
      }
      return [];
    }

    // trend_scoreを計算して更新（likesをベースに）
    const spotsWithTrendScore = calculateTrendScoresForSpots(data || []);
    
    return spotsWithTrendScore;
  } catch (error) {
    // ネットワークエラーやその他の例外
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('❌ ネットワークエラー: Supabaseへの接続に失敗しました。');
      console.error('確認事項:');
      console.error('- .env.localファイルが正しく設定されているか');
      console.error('- 開発サーバーを再起動したか（環境変数の変更後は再起動が必要）');
      console.error('- SupabaseのURLが正しいか:', supabaseUrl);
    } else {
      console.error('❌ 予期しないエラー:', error);
      if (error instanceof Error) {
        console.error('エラーメッセージ:', error.message);
      }
    }
    return [];
  }
}

/**
 * スポットのいいね数を1増やす
 * @param spotId スポットのID
 * @returns 更新後のいいね数、またはエラーの場合はnull
 */
export async function incrementLikes(spotId: string): Promise<number | null> {
  try {
    // 現在のlikesを取得
    const { data: currentData, error: fetchError } = await supabase
      .from('local_spots')
      .select('likes')
      .eq('id', spotId)
      .single();

    if (fetchError || !currentData) {
      console.error('❌ スポットの取得に失敗しました:', fetchError);
      return null;
    }

    const currentLikes = currentData.likes ?? 0;
    const newLikes = Math.max(0, currentLikes + 1); // 0未満にならないように

    // likesを更新
    const { error: updateError } = await supabase
      .from('local_spots')
      .update({ likes: newLikes })
      .eq('id', spotId);

    if (updateError) {
      console.error('❌ いいね数の更新に失敗しました:', updateError);
      return null;
    }

    return newLikes;
  } catch (error) {
    console.error('❌ いいね数の更新中にエラーが発生しました:', error);
    return null;
  }
}

/**
 * スポットのいいね数を1減らす（解除）
 * @param spotId スポットのID
 * @returns 更新後のいいね数、またはエラーの場合はnull
 */
export async function decrementLikes(spotId: string): Promise<number | null> {
  try {
    // 現在のlikesを取得
    const { data: currentData, error: fetchError } = await supabase
      .from('local_spots')
      .select('likes')
      .eq('id', spotId)
      .single();

    if (fetchError || !currentData) {
      console.error('❌ スポットの取得に失敗しました:', fetchError);
      return null;
    }

    const currentLikes = currentData.likes ?? 0;
    const newLikes = Math.max(0, currentLikes - 1); // 0未満にならないように

    // likesを更新
    const { error: updateError } = await supabase
      .from('local_spots')
      .update({ likes: newLikes })
      .eq('id', spotId);

    if (updateError) {
      console.error('❌ いいね解除の更新に失敗しました:', updateError);
      return null;
    }

    return newLikes;
  } catch (error) {
    console.error('❌ いいね解除の更新中にエラーが発生しました:', error);
    return null;
  }
}

/**
 * すべてのコミュニティを取得（最適化版）
 */
export async function getCommunities(): Promise<Community[]> {
  try {
    // 現在のユーザーIDを取得（エラーを無視して続行）
    let userId: string | undefined = undefined;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id;
    } catch (authErr) {
      // 認証エラーは無視（ログインしていなくてもコミュニティ一覧を取得可能）
      console.log('ℹ️ 認証情報が取得できませんでした（ログインしていない可能性があります）');
    }

    // 最小限のフィールドのみ取得して高速化
    let query = supabase
      .from('communities')
      .select('id, name, slug, description, is_public, owner_id')
      .order('is_public', { ascending: false }) // 公開コミュニティを先に
      .order('created_at', { ascending: false })
      .limit(100); // 最大100件まで

    const { data, error } = await query;

    if (error) {
      console.error('❌ コミュニティの取得に失敗しました:', error);
      return [];
    }

    // 非公開コミュニティも表示する（申請可能にするため）
    // ただし、メンバーシップ情報は別途取得する
    return data || [];
  } catch (error) {
    console.error('❌ コミュニティの取得中にエラーが発生しました:', error);
    return [];
  }
}

/**
 * コミュニティを作成
 */
export async function createCommunity(name: string, description?: string, isPublic: boolean = true): Promise<Community | null> {
  try {
    // 現在のユーザーIDを取得（エラーを無視して続行）
    let user: any = null;
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (!authError && authUser) {
        user = authUser;
      }
    } catch (authErr) {
      // 認証エラーは無視（ログインしていなくてもコミュニティを作成可能）
      console.log('ℹ️ 認証情報が取得できませんでした（ログインしていない可能性があります）');
    }

    // スラッグを生成（名前から自動生成）
    let slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // slugが空の場合は、ランダムな文字列を生成
    if (!slug) {
      slug = `community-${Date.now()}`;
    }

    console.log('📝 コミュニティ作成を試みます:', { name, slug, isPublic, owner_id: user?.id || null });

    // 既存のコミュニティで同じslugが存在するか確認
    const { data: existingCommunity } = await supabase
      .from('communities')
      .select('id, name, slug')
      .eq('slug', slug)
      .single();

    if (existingCommunity) {
      console.error('❌ 同じslugのコミュニティが既に存在します:', existingCommunity);
      alert(`「${existingCommunity.name}」というコミュニティが既に存在します。別の名前を試してください。`);
      return null;
    }

    // まず、テーブルの構造を確認するために、最小限のデータで試行
    const insertData: any = {
      name,
      description: description || null,
      slug,
    };

    // is_publicカラムが存在する場合のみ設定（エラーを避けるため）
    // まず、is_publicカラムがあるかどうかを確認する必要はないが、
    // エラーが発生した場合は、カラムが存在しない可能性がある
    try {
      // is_publicを設定（存在しない場合はエラーになる）
      insertData.is_public = isPublic;
    } catch (e) {
      console.warn('⚠️ is_publicカラムが存在しない可能性があります');
    }

    // owner_idが存在する場合のみ設定（カラムが存在しない場合はエラーになる可能性がある）
    if (user?.id) {
      try {
        insertData.owner_id = user.id;
      } catch (e) {
        console.warn('⚠️ owner_idカラムが存在しない可能性があります');
      }
    }

    console.log('📤 送信データ:', JSON.stringify(insertData, null, 2));

    const { data: community, error: communityError } = await supabase
      .from('communities')
      .insert(insertData)
      .select()
      .single();

    if (communityError) {
      console.error('❌ コミュニティの作成に失敗しました');
      console.error('エラーオブジェクト全体:', communityError);
      console.error('エラー詳細:', JSON.stringify(communityError, null, 2));
      console.error('エラーコード:', communityError.code);
      console.error('エラーメッセージ:', communityError.message);
      console.error('エラーヒント:', communityError.hint);
      console.error('エラー詳細情報:', communityError.details);
      console.error('送信したデータ:', JSON.stringify(insertData, null, 2));
      
      // よくあるエラーのチェック
      const errorMessage = communityError.message || '';
      const errorCode = communityError.code || '';
      
      let userMessage = 'コミュニティの作成に失敗しました。';
      
      if (errorCode === '23505' || errorMessage.includes('unique') || errorMessage.includes('duplicate')) {
        // slugの重複エラーの場合、既存のコミュニティを確認
        const { data: existing } = await supabase
          .from('communities')
          .select('name, slug')
          .eq('slug', slug)
          .single();
        
        if (existing) {
          userMessage = `「${existing.name}」というコミュニティが既に存在します。別の名前を試してください。`;
        } else {
          userMessage = 'このコミュニティ名（または類似する名前）は既に使用されています。別の名前を試してください。';
        }
      } else if (errorCode === '42501' || errorMessage.includes('permission') || errorMessage.includes('policy')) {
        userMessage = 'コミュニティを作成する権限がありません。SupabaseのRLSポリシーを確認してください。';
      } else if (errorMessage.includes('owner_id') || errorMessage.includes('column') && errorMessage.includes('owner_id')) {
        userMessage = 'owner_idカラムが存在しない可能性があります。add-community-membership.sqlを実行してください。';
      } else if (errorMessage.includes('is_public') || errorMessage.includes('column') && errorMessage.includes('is_public')) {
        userMessage = 'is_publicカラムが存在しない可能性があります。add-public-private-communities.sqlを実行してください。';
      } else if (errorMessage.includes('does not exist') || errorMessage.includes('relation')) {
        userMessage = 'communitiesテーブルが存在しない可能性があります。add-communities-feature.sqlを実行してください。';
      } else {
        userMessage = `コミュニティの作成に失敗しました: ${errorMessage || errorCode || '不明なエラー'}`;
      }
      
      alert(userMessage);
      console.error('💡 解決方法:');
      console.error('1. SupabaseのSQL Editorで以下を実行してください:');
      console.error('   - add-communities-feature.sql');
      console.error('   - add-public-private-communities.sql');
      console.error('   - add-community-membership.sql');
      console.error('2. コンソールのエラー詳細を確認してください');
      
      return null;
    }

    console.log('✅ コミュニティ作成成功:', community.id);

    // ログインしている場合、作成者をオーナーとしてメンバーに追加
    if (user?.id) {
      try {
        const { error: memberError } = await supabase
          .from('community_members')
          .insert({
            community_id: community.id,
            user_id: user.id,
            status: 'approved',
            role: 'owner',
          });

        if (memberError) {
          console.error('❌ メンバーシップの作成に失敗しました:', memberError);
          console.error('エラー詳細:', JSON.stringify(memberError, null, 2));
          // コミュニティは作成されているので、エラーを無視して続行
          console.warn('⚠️ コミュニティは作成されましたが、メンバーシップの追加に失敗しました');
        } else {
          console.log('✅ メンバーシップ作成成功');
        }
      } catch (memberErr) {
        console.warn('⚠️ メンバーシップ作成中にエラーが発生しましたが、コミュニティは作成されました:', memberErr);
      }
    }

    // デフォルト地図を自動作成（直接Supabaseにアクセスして循環参照を回避）
    try {
      const { data: defaultMap, error: mapError } = await supabase
        .from('maps')
        .insert({
          community_id: community.id,
          name: 'デフォルト地図',
          description: 'このコミュニティのデフォルト地図です',
          created_by: user?.id || null,
        })
        .select()
        .single();

      if (mapError) {
        console.warn('⚠️ デフォルト地図の作成に失敗しました:', mapError);
        console.warn('エラー詳細:', JSON.stringify(mapError, null, 2));
      } else {
        console.log('✅ デフォルト地図作成成功:', defaultMap.id);
      }
    } catch (mapErr) {
      console.warn('⚠️ デフォルト地図作成中にエラーが発生しましたが、コミュニティは作成されました:', mapErr);
    }

    return community;
  } catch (error) {
    console.error('❌ コミュニティの作成中にエラーが発生しました:', error);
    if (error instanceof Error) {
      console.error('エラーメッセージ:', error.message);
      console.error('エラースタック:', error.stack);
    }
    alert('予期しないエラーが発生しました。コンソールを確認してください。');
    return null;
  }
}

/**
 * スラッグからコミュニティを取得
 */
export async function getCommunityBySlug(slug: string): Promise<Community | null> {
  try {
    const { data, error } = await supabase
      .from('communities')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('❌ コミュニティの取得に失敗しました:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('❌ コミュニティの取得中にエラーが発生しました:', error);
    return null;
  }
}

/**
 * スポットを削除
 */
export async function deleteSpot(spotId: string): Promise<boolean> {
  try {
    console.log('🗑️ Supabase削除処理開始:', spotId);
    
    const { error, data } = await supabase
      .from('local_spots')
      .delete()
      .eq('id', spotId)
      .select(); // 削除された行を返す（デバッグ用）

    if (error) {
      console.error('❌ スポットの削除に失敗しました:', error);
      console.error('エラーコード:', error.code);
      console.error('エラーメッセージ:', error.message);
      console.error('エラー詳細:', JSON.stringify(error, null, 2));
      
      // RLSポリシーエラーの場合
      if (error.code === '42501' || error.message?.includes('policy') || error.message?.includes('permission')) {
        console.error('⚠️ RLSポリシーが設定されていません。enable-spot-delete.sqlを実行してください。');
      }
      
      return false;
    }

    if (data && data.length > 0) {
      console.log('✅ スポットを削除しました:', spotId);
      console.log('削除されたデータ:', data);
      return true;
    } else {
      console.warn('⚠️ 削除された行がありません（既に削除されているか、IDが存在しません）:', spotId);
      // 既に削除されている場合は成功として扱う
      return true;
    }
  } catch (error) {
    console.error('❌ スポットの削除中にエラーが発生しました:', error);
    return false;
  }
}

/**
 * 新しいスポットを作成
 */
export async function createSpot(
  name: string,
  description: string,
  category: Category,
  latitude: number,
  longitude: number,
  communityId: string,
  imageUrl?: string,
  openingHours?: string,
  mapId?: string
): Promise<LocalSpot | null> {
  try {
    const { data, error } = await supabase
      .from('local_spots')
      .insert({
        name,
        description,
        category,
        latitude,
        longitude,
        community_id: communityId,
        map_id: mapId || null,
        image_url: imageUrl || null,
        opening_hours: openingHours || null,
        likes: 0,
        trend_score: 50,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ スポットの作成に失敗しました:', error);
      return null;
    }

    return data as LocalSpot;
  } catch (error) {
    console.error('❌ スポットの作成中にエラーが発生しました:', error);
    return null;
  }
}

/**
 * すべてのカテゴリを取得
 */
export async function getCategories(communityId?: string): Promise<CategoryItem[]> {
  try {
    let query = supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    // コミュニティIDでフィルタリング（nullの場合はグローバルカテゴリ）
    if (communityId) {
      query = query.or(`community_id.eq.${communityId},community_id.is.null`);
    } else {
      query = query.is('community_id', null);
    }

    const { data, error } = await query;

    if (error) {
      // エラーオブジェクトの詳細を取得
      const errorDetails = {
        code: (error as any)?.code || '不明',
        message: (error as any)?.message || 'エラーメッセージがありません',
        details: (error as any)?.details || '詳細情報がありません',
        hint: (error as any)?.hint || 'ヒントがありません',
        rawError: error,
      };
      
      console.error('❌ カテゴリの取得に失敗しました');
      console.error('エラーコード:', errorDetails.code);
      console.error('エラーメッセージ:', errorDetails.message);
      console.error('エラー詳細:', errorDetails.details);
      console.error('エラーヒント:', errorDetails.hint);
      console.error('エラーオブジェクト全体:', errorDetails.rawError);
      
      // テーブルが存在しない場合のエラーコードをチェック
      const errorMessage = String(errorDetails.message).toLowerCase();
      const errorCode = String(errorDetails.code).toLowerCase();
      
      // テーブルが存在しない場合のみエラーをスロー
      if (
        errorCode === 'pgrst116' || 
        errorCode === '42p01' ||
        errorMessage.includes('relation') || 
        errorMessage.includes('does not exist') ||
        errorMessage.includes('不存在') ||
        errorMessage.includes('table') ||
        errorMessage.includes('テーブル')
      ) {
        console.warn('⚠️ categoriesテーブルが存在しません。');
        console.warn('💡 解決方法: SupabaseのSQL Editorで add-categories-feature.sql を実行してください。');
        return [];
      }
      
      // RLSポリシーのエラーの場合
      if (errorCode === '42501' || errorMessage.includes('permission') || errorMessage.includes('policy')) {
        console.warn('⚠️ RLSポリシーの問題です。');
        console.warn('💡 解決方法: add-categories-feature.sql のRLSポリシー設定を確認してください。');
        return [];
      }
      
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('❌ カテゴリの取得中に予期しないエラーが発生しました:', error);
    
    // エラーの型に応じて詳細を表示
    if (error instanceof Error) {
      console.error('エラーメッセージ:', error.message);
      console.error('エラースタック:', error.stack);
    } else if (typeof error === 'object' && error !== null) {
      console.error('エラーオブジェクト:', JSON.stringify(error, null, 2));
    } else {
      console.error('エラー値:', String(error));
    }
    
    return [];
  }
}

/**
 * カテゴリを作成
 */
export async function createCategory(
  name: string,
  color: string,
  communityId?: string
): Promise<CategoryItem | null> {
  try {
    // スラッグを生成（名前から自動生成）
    // 日本語の場合は、UUIDベースのスラッグを生成
    let slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g, '-') // 日本語文字も許可
      .replace(/^-+|-+$/g, '');

    // スラッグが空の場合、または日本語のみの場合はUUIDベースのスラッグを生成
    if (!slug || /^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+$/.test(name)) {
      // UUIDの短縮版を生成（8文字）
      const uuidShort = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
      slug = `category-${uuidShort}`;
    }

    console.log('📝 カテゴリ作成を試みます:', { name, slug, color, communityId });

    const insertData: any = {
      name,
      slug,
      color,
    };

    // community_idが指定されている場合のみ追加
    if (communityId) {
      insertData.community_id = communityId;
    } else {
      insertData.community_id = null;
    }

    console.log('📤 送信データ:', JSON.stringify(insertData, null, 2));

    const { data, error } = await supabase
      .from('categories')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('❌ カテゴリの作成に失敗しました');
      console.error('エラーコード:', error.code);
      console.error('エラーメッセージ:', error.message);
      console.error('エラーヒント:', error.hint);
      console.error('エラー詳細:', JSON.stringify(error, null, 2));
      console.error('送信したデータ:', JSON.stringify(insertData, null, 2));
      
      // よくあるエラーのチェック
      if (error.code === '23505') {
        // 重複エラー
        alert('同じ名前またはスラッグのカテゴリが既に存在します。別の名前を試してください。');
      } else if (error.code === '42501') {
        // RLSポリシーエラー
        console.error('💡 RLSポリシーで拒否されました');
        console.error('💡 解決方法: add-categories-feature.sqlを実行してください');
        alert('カテゴリの作成が許可されていません。データベースの設定を確認してください。');
      } else if (error.code === '42P01') {
        // テーブルが存在しない
        console.error('💡 categoriesテーブルが存在しません');
        console.error('💡 解決方法: add-categories-feature.sqlを実行してください');
        alert('categoriesテーブルが存在しません。データベースの設定を確認してください。');
      } else {
        alert(`カテゴリの作成に失敗しました: ${error.message || '不明なエラー'}`);
      }
      return null;
    }

    console.log('✅ カテゴリ作成成功:', data);
    return data;
  } catch (error) {
    console.error('❌ カテゴリの作成中にエラーが発生しました:', error);
    alert('カテゴリの作成中にエラーが発生しました: ' + (error instanceof Error ? error.message : String(error)));
    return null;
  }
}

/**
 * カテゴリを更新
 */
export async function updateCategory(
  categoryId: string,
  name: string,
  color: string
): Promise<CategoryItem | null> {
  try {
    // スラッグを生成（名前から自動生成）
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const { data, error } = await supabase
      .from('categories')
      .update({
        name,
        slug,
        color,
        updated_at: new Date().toISOString(),
      })
      .eq('id', categoryId)
      .select()
      .single();

    if (error) {
      console.error('❌ カテゴリの更新に失敗しました:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('❌ カテゴリの更新中にエラーが発生しました:', error);
    return null;
  }
}

/**
 * カテゴリを削除
 */
export async function deleteCategory(categoryId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      console.error('❌ カテゴリの削除に失敗しました:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ カテゴリの削除中にエラーが発生しました:', error);
    return false;
  }
}

/**
 * スポットのカテゴリを更新
 */
export async function updateSpotCategory(spotId: string, categorySlug: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('local_spots')
      .update({ category: categorySlug })
      .eq('id', spotId);

    if (error) {
      console.error('❌ スポットのカテゴリ更新に失敗しました:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ スポットのカテゴリ更新中にエラーが発生しました:', error);
    return false;
  }
}

/**
 * スポットのコメント一覧を取得
 */
export async function getSpotComments(spotId: string): Promise<SpotComment[]> {
  try {
    const { data, error } = await supabase
      .from('spot_comments')
      .select('*')
      .eq('spot_id', spotId)
      .order('created_at', { ascending: true }); // 古い順（LINE形式）

    if (error) {
      console.error('❌ コメントの取得に失敗しました:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('❌ コメントの取得中にエラーが発生しました:', error);
    return [];
  }
}

/**
 * スポットにコメントを追加
 */
export async function addSpotComment(spotId: string, comment: string): Promise<SpotComment | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('spot_comments')
      .insert({
        spot_id: spotId,
        user_id: user?.id || null,
        comment: comment,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ コメントの追加に失敗しました:', error);
      console.error('エラー詳細:', JSON.stringify(error, null, 2));
      return null;
    }

    return data;
  } catch (error) {
    console.error('❌ コメントの追加中にエラーが発生しました:', error);
    return null;
  }
}

/**
 * コメントを削除
 */
export async function deleteSpotComment(commentId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('spot_comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error('❌ コメントの削除に失敗しました:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ コメントの削除中にエラーが発生しました:', error);
    return false;
  }
}

/**
 * コミュニティへのメンバーシップ申請を作成
 */
export async function requestCommunityMembership(communityId: string): Promise<boolean> {
  try {
    let user: any = null;
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      user = authUser;
    } catch (authErr) {
      console.log('ℹ️ 認証情報が取得できませんでした');
    }
    
    if (!user) {
      console.error('❌ ログインが必要です');
      alert('申請するにはログインが必要です');
      return false;
    }

    const { error } = await supabase
      .from('community_members')
      .insert({
        community_id: communityId,
        user_id: user.id,
        status: 'pending',
        role: 'member',
      });

    if (error) {
      if (error.code === '23505') { // 重複エラー
        console.error('❌ 既に申請済みです');
        throw new Error('既に申請済みです');
      } else {
        console.error('❌ メンバーシップ申請に失敗しました:', error);
        throw new Error('申請に失敗しました');
      }
    }

    return true;
  } catch (error) {
    console.error('❌ メンバーシップ申請中にエラーが発生しました:', error);
    throw error; // エラーを再スローして、呼び出し元で処理できるようにする
  }
}

/**
 * コミュニティのメンバーシップ状態を取得
 */
export async function getCommunityMembership(communityId: string, userId?: string): Promise<CommunityMember | null> {
  try {
    let user: any = null;
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      user = authUser;
    } catch (authErr) {
      // 認証エラーは無視（ログインしていない場合はnullを返す）
      return null;
    }
    
    const targetUserId = userId || user?.id;
    if (!targetUserId) {
      return null;
    }

    const { data, error } = await supabase
      .from('community_members')
      .select('*')
      .eq('community_id', communityId)
      .eq('user_id', targetUserId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // レコードが見つからない
        return null;
      }
      console.error('❌ メンバーシップ情報の取得に失敗しました:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('❌ メンバーシップ情報の取得中にエラーが発生しました:', error);
    return null;
  }
}

/**
 * ユーザーが参加しているすべてのコミュニティのメンバーシップ情報を取得
 */
export async function getUserMemberships(userId?: string): Promise<CommunityMember[]> {
  try {
    let user: any = null;
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      user = authUser;
    } catch (authErr) {
      console.log('ℹ️ 認証情報が取得できませんでした');
    }
    
    const targetUserId = userId || user?.id;
    if (!targetUserId) {
      return [];
    }

    const { data, error } = await supabase
      .from('community_members')
      .select('*')
      .eq('user_id', targetUserId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ メンバーシップ情報の取得に失敗しました:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('❌ メンバーシップ情報の取得中にエラーが発生しました:', error);
    return [];
  }
}

/**
 * コミュニティのメンバー数を取得
 */
export async function getCommunityMemberCount(communityId: string): Promise<number> {
  try {
    console.log('📊 メンバー数取得開始:', communityId);
    
    // まず、コミュニティ情報を取得してオーナーかどうかを確認
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .select('id, owner_id, is_public')
      .eq('id', communityId)
      .single();

    if (communityError || !community) {
      console.error('❌ コミュニティ情報の取得に失敗しました:', communityError);
      return 0;
    }

    console.log('📊 コミュニティ情報:', {
      id: community.id,
      owner_id: community.owner_id,
      is_public: community.is_public
    });

    // 現在のユーザーを取得
    const { data: { user } } = await supabase.auth.getUser();
    const isOwner = user && community.owner_id === user.id;

    console.log('📊 ユーザー情報:', {
      user_id: user?.id,
      isOwner,
      community_owner_id: community.owner_id
    });

    // オーナーまたは公開コミュニティの場合は、すべての承認済みメンバーをカウント
    if (isOwner || community.is_public) {
      console.log('📊 オーナーまたは公開コミュニティ - すべてのメンバーをカウント');
      
      const { count, error } = await supabase
        .from('community_members')
        .select('*', { count: 'exact', head: true })
        .eq('community_id', communityId)
        .eq('status', 'approved');

      if (error) {
        console.error('❌ メンバー数の取得に失敗しました:', error);
        console.error('エラー詳細:', JSON.stringify(error, null, 2));
        // エラーが発生した場合でも、オーナーがいる場合は最低1人と表示
        if (community.owner_id) {
          console.log('⚠️ エラーが発生しましたが、オーナーがいるため1人と表示します');
          return 1;
        }
        return 0;
      }

      const memberCount = count || 0;
      console.log('✅ メンバー数取得成功:', memberCount);
      
      // オーナーがいるのにメンバー数が0の場合、オーナーをカウントして1人と表示
      if (memberCount === 0 && community.owner_id) {
        console.log('⚠️ メンバー数が0ですが、オーナーがいるため1人と表示します');
        return 1;
      }
      
      return memberCount;
    } else {
      // 非公開コミュニティでオーナーでない場合、自分のメンバーシップのみをカウント
      console.log('📊 非公開コミュニティ（オーナーでない） - 自分のメンバーシップのみをカウント');
      
      // ただし、オーナーがいる場合は最低1人と表示
      if (community.owner_id) {
        console.log('⚠️ 非公開コミュニティですが、オーナーがいるため1人と表示します');
        return 1;
      }
      
      if (user) {
        const { count, error } = await supabase
          .from('community_members')
          .select('*', { count: 'exact', head: true })
          .eq('community_id', communityId)
          .eq('user_id', user.id)
          .eq('status', 'approved');

        if (error) {
          console.error('❌ メンバー数の取得に失敗しました:', error);
          return 0;
        }

        console.log('✅ メンバー数取得成功（自分のみ）:', count || 0);
        return count || 0;
      }
      console.log('⚠️ ユーザーがログインしていません');
      return 0;
    }
  } catch (error) {
    console.error('❌ メンバー数の取得中にエラーが発生しました:', error);
    return 0;
  }
}

/**
 * コミュニティから脱退する
 */
export async function leaveCommunity(communityId: string): Promise<boolean> {
  try {
    let user: any = null;
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      user = authUser;
    } catch (authErr) {
      console.log('ℹ️ 認証情報が取得できませんでした');
    }
    
    if (!user) {
      console.error('❌ ログインが必要です');
      return false;
    }

    console.log('📝 コミュニティから脱退します:', { communityId, userId: user.id });

    const { data, error } = await supabase
      .from('community_members')
      .delete()
      .eq('community_id', communityId)
      .eq('user_id', user.id)
      .select();

    if (error) {
      console.error('❌ 脱退に失敗しました');
      console.error('エラーコード:', error.code);
      console.error('エラーメッセージ:', error.message);
      console.error('エラーヒント:', error.hint);
      console.error('エラー詳細:', JSON.stringify(error, null, 2));
      
      if (error.code === '42501') {
        console.error('❌ RLSポリシーで拒否されました');
        console.error('💡 解決方法: enable-member-leave.sqlを実行してください');
      }
      return false;
    }

    console.log('✅ 脱退成功:', data);
    return true;
  } catch (error) {
    console.error('❌ 脱退中にエラーが発生しました:', error);
    return false;
  }
}

/**
 * コミュニティを解散する（オーナーのみ）
 */
export async function deleteCommunity(communityId: string): Promise<boolean> {
  try {
    let user: any = null;
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      user = authUser;
    } catch (authErr) {
      console.log('ℹ️ 認証情報が取得できませんでした');
    }
    
    if (!user) {
      console.error('❌ ログインが必要です');
      return false;
    }

    console.log('📝 コミュニティを解散します:', { communityId, userId: user.id });

    // オーナーかどうか確認
    const { data: community, error: fetchError } = await supabase
      .from('communities')
      .select('owner_id')
      .eq('id', communityId)
      .single();

    if (fetchError || !community) {
      console.error('❌ コミュニティの取得に失敗しました:', fetchError);
      console.error('エラー詳細:', JSON.stringify(fetchError, null, 2));
      return false;
    }

    console.log('📝 コミュニティ情報:', { owner_id: community.owner_id, current_user_id: user.id });

    if (community.owner_id !== user.id) {
      console.error('❌ オーナーのみがコミュニティを解散できます');
      console.error('オーナーID:', community.owner_id, '現在のユーザーID:', user.id);
      return false;
    }

    // コミュニティを削除（CASCADEでメンバーシップとスポットも削除される）
    const { data, error } = await supabase
      .from('communities')
      .delete()
      .eq('id', communityId)
      .select();

    if (error) {
      console.error('❌ コミュニティの削除に失敗しました');
      console.error('エラーコード:', error.code);
      console.error('エラーメッセージ:', error.message);
      console.error('エラーヒント:', error.hint);
      console.error('エラー詳細:', JSON.stringify(error, null, 2));
      
      if (error.code === '42501') {
        console.error('❌ RLSポリシーで拒否されました');
        console.error('💡 解決方法: enable-community-delete.sqlを実行してください');
      }
      return false;
    }

    console.log('✅ コミュニティ解散成功:', data);
    return true;
  } catch (error) {
    console.error('❌ コミュニティ削除中にエラーが発生しました:', error);
    return false;
  }
}

/**
 * コミュニティのメンバーシップ申請一覧を取得（オーナー用）
 */
export async function getCommunityMembershipRequests(communityId: string): Promise<CommunityMember[]> {
  try {
    let user: any = null;
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      user = authUser;
    } catch (authErr) {
      // 認証エラーは無視（ログインしていない場合は空配列を返す）
      return [];
    }
    
    if (!user) {
      return [];
    }

    // オーナーかどうか確認
    const { data: community } = await supabase
      .from('communities')
      .select('owner_id')
      .eq('id', communityId)
      .single();

    if (!community || community.owner_id !== user.id) {
      console.error('❌ オーナーのみが申請一覧を閲覧できます');
      return [];
    }

    const { data, error } = await supabase
      .from('community_members')
      .select('*')
      .eq('community_id', communityId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ 申請一覧の取得に失敗しました:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('❌ 申請一覧の取得中にエラーが発生しました:', error);
    return [];
  }
}

/**
 * メンバーシップ申請を承認/非承認
 */
export async function updateMembershipStatus(
  membershipId: string,
  status: 'approved' | 'rejected'
): Promise<boolean> {
  try {
    let user: any = null;
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      user = authUser;
    } catch (authErr) {
      console.log('ℹ️ 認証情報が取得できませんでした');
    }
    
    if (!user) {
      console.error('❌ ログインが必要です');
      return false;
    }

    // メンバーシップ情報を取得
    const { data: membership, error: fetchError } = await supabase
      .from('community_members')
      .select('*, communities!inner(owner_id)')
      .eq('id', membershipId)
      .single();

    if (fetchError || !membership) {
      console.error('❌ メンバーシップ情報の取得に失敗しました:', fetchError);
      return false;
    }

    // オーナーかどうか確認
    if (membership.communities.owner_id !== user.id) {
      console.error('❌ オーナーのみが承認/非承認できます');
      return false;
    }

    const { error } = await supabase
      .from('community_members')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', membershipId);

    if (error) {
      console.error('❌ ステータスの更新に失敗しました:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ ステータス更新中にエラーが発生しました:', error);
    return false;
  }
}

/**
 * 現在のユーザーがコミュニティのオーナーかどうか確認
 */
export async function isCommunityOwner(communityId: string): Promise<boolean> {
  try {
    let user: any = null;
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      user = authUser;
    } catch (authErr) {
      // 認証エラーは無視（ログインしていない場合はfalseを返す）
      return false;
    }
    
    if (!user) {
      console.log('⚠️ isCommunityOwner: ユーザーが取得できませんでした');
      return false;
    }

    const { data, error } = await supabase
      .from('communities')
      .select('owner_id')
      .eq('id', communityId)
      .single();

    if (error || !data) {
      console.error('⚠️ isCommunityOwner: コミュニティの取得に失敗しました', { error, communityId });
      return false;
    }

    const isOwner = data.owner_id === user.id;
    console.log('🔍 isCommunityOwner:', {
      communityId,
      owner_id: data.owner_id,
      user_id: user.id,
      isOwner
    });

    return isOwner;
  } catch (error) {
    console.error('⚠️ isCommunityOwner: エラーが発生しました', error);
    return false;
  }
}

/**
 * 公開コミュニティに自動参加（承認不要）
 * @param communityId コミュニティID
 * @param nickname コミュニティ内でのニックネーム（オプション）
 */
export async function joinPublicCommunity(communityId: string, nickname?: string): Promise<boolean> {
  try {
    let user: any = null;
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      user = authUser;
    } catch (authErr) {
      console.log('ℹ️ 認証情報が取得できませんでした');
    }
    
    // 匿名認証でも参加可能にするため、ユーザーがいない場合は匿名認証を試行
    if (!user) {
      console.log('📝 匿名認証を開始します...');
      const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();
      if (anonError) {
        console.error('❌ 匿名認証に失敗しました:', anonError);
        console.error('エラーコード:', anonError.code);
        console.error('エラーメッセージ:', anonError.message);
        console.error('エラー詳細:', JSON.stringify(anonError, null, 2));
        return false;
      }
      if (!anonData.user) {
        console.error('❌ ユーザーデータが取得できませんでした');
        return false;
      }
      console.log('✅ 匿名認証成功:', anonData.user.id);
      user = anonData.user;
    }

    // コミュニティが公開か確認
    console.log('📝 コミュニティ情報を確認します:', communityId);
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .select('is_public')
      .eq('id', communityId)
      .single();

    if (communityError) {
      console.error('❌ コミュニティの取得に失敗しました:', communityError);
      console.error('エラーコード:', communityError.code);
      console.error('エラーメッセージ:', communityError.message);
      console.error('エラー詳細:', JSON.stringify(communityError, null, 2));
      return false;
    }

    if (!community || community.is_public === false) {
      console.error('❌ 公開コミュニティのみ自動参加できます');
      console.error('コミュニティ情報:', community);
      return false;
    }

    console.log('✅ 公開コミュニティを確認しました');
    console.log('📝 メンバーシップを作成します:', {
      community_id: communityId,
      user_id: user.id,
      user_email: user.email,
      user_is_anonymous: user.is_anonymous,
      status: 'approved',
      role: 'member'
    });

    // 現在の認証状態を確認
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    console.log('🔐 現在の認証ユーザー:', {
      id: currentUser?.id,
      email: currentUser?.email,
      is_anonymous: currentUser?.is_anonymous,
      user_metadata: currentUser?.user_metadata
    });

    // ニックネームを取得（user_metadataから、または引数から）
    const memberNickname = nickname || currentUser?.user_metadata?.nickname || null;

    const { data: memberData, error } = await supabase
      .from('community_members')
      .insert({
        community_id: communityId,
        user_id: user.id,
        status: 'approved',
        role: 'member',
        nickname: memberNickname,
      })
      .select();

    if (error) {
      console.error('❌ メンバーシップ作成に失敗しました');
      console.error('エラーコード:', error.code);
      console.error('エラーメッセージ:', error.message);
      console.error('エラーヒント:', error.hint);
      console.error('エラー詳細:', JSON.stringify(error, null, 2));
      console.error('送信データ:', {
        community_id: communityId,
        user_id: user.id,
        status: 'approved',
        role: 'member'
      });
      
      if (error.code === '23505') { // 重複エラー
        console.error('❌ 既に参加済みです');
        // 既に参加済みの場合は成功として扱う
        return true;
      } else if (error.code === '42501') { // 権限エラー
        console.error('❌ RLSポリシーで拒否されました');
        console.error('💡 解決方法: add-community-membership.sqlのRLSポリシーを確認してください');
      }
      return false;
    }

    console.log('✅ メンバーシップ作成成功:', memberData);
    return true;
  } catch (error) {
    console.error('❌ 参加中にエラーが発生しました:', error);
    return false;
  }
}

// ==================== 地図管理機能 ====================

/**
 * コミュニティの地図一覧を取得
 */
export async function getMaps(communityId: string): Promise<Map[]> {
  try {
    const { data, error } = await supabase
      .from('maps')
      .select('*')
      .eq('community_id', communityId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('地図の取得エラー:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('地図の取得中にエラーが発生しました:', error);
    return [];
  }
}

/**
 * 地図を作成
 */
export async function createMap(communityId: string, name: string, description?: string): Promise<Map | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('認証が必要です');
      return null;
    }

    const { data, error } = await supabase
      .from('maps')
      .insert({
        community_id: communityId,
        name,
        description,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ 地図の作成エラー');
      console.error('エラーオブジェクト全体:', error);
      console.error('エラーオブジェクト（JSON）:', JSON.stringify(error, null, 2));
      console.error('エラーメッセージ:', error.message);
      console.error('エラーコード:', error.code);
      console.error('エラーヒント:', error.hint);
      console.error('エラー詳細:', error.details);
      console.error('コミュニティID:', communityId);
      console.error('地図名:', name);
      console.error('ユーザーID:', user.id);
      
      // RLSポリシーエラーの場合のヒント
      if (error.code === '42501' || error.message?.includes('permission') || error.message?.includes('policy') || error.message?.includes('RLS')) {
        console.error('💡 RLSポリシーエラーの可能性があります');
        console.error('解決方法:');
        console.error('SupabaseのSQL Editorで以下を実行してください:');
        console.error('fix-maps-create-policy.sql（地図作成のRLSポリシーを修正）');
      }
      
      // テーブルが存在しない場合のヒント
      if (error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('does not exist') || error.message?.includes('table')) {
        console.error('💡 mapsテーブルが存在しない可能性があります');
        console.error('解決方法:');
        console.error('SupabaseのSQL Editorで以下を実行してください:');
        console.error('add-maps-feature.sql（mapsテーブルとRLSポリシーを作成）');
      }
      
      return null;
    }

    console.log('✅ 地図作成成功:', data);
    return data;
  } catch (error) {
    console.error('❌ 地図の作成中にエラーが発生しました:', error);
    if (error instanceof Error) {
      console.error('エラーメッセージ:', error.message);
      console.error('エラースタック:', error.stack);
    }
    return null;
  }
}

/**
 * 地図を更新
 */
export async function updateMap(mapId: string, name: string, description?: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('maps')
      .update({
        name,
        description,
        updated_at: new Date().toISOString(),
      })
      .eq('id', mapId)
      .select();

    if (error) {
      console.error('地図の更新エラー:', error);
      return false;
    }

    return data && data.length > 0;
  } catch (error) {
    console.error('地図の更新中にエラーが発生しました:', error);
    return false;
  }
}

/**
 * 地図を削除
 */
export async function deleteMap(mapId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('maps')
      .delete()
      .eq('id', mapId);

    if (error) {
      console.error('地図の削除エラー:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('地図の削除中にエラーが発生しました:', error);
    return false;
  }
}

