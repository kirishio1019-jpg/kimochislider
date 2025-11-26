'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { LocalSpot, Category, CategoryItem } from '@/types';
import { getLocalSpots, deleteSpot as supabaseDeleteSpot, getCommunityMemberCount, getCommunityMembership, getCommunities, getCommunityMembershipRequests, updateMembershipStatus, isCommunityOwner, leaveCommunity, deleteCommunity, getCategories } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { calculateTrendScore } from '@/lib/calculateTrendScore';
import { updateLikesHistory, cleanupOldHistory } from '@/lib/likesHistory';
import { CommunityMember } from '@/types';
import Header from '@/components/Header';
import CategoryFilterV0 from '@/components/CategoryFilterV0';
import ViewToggle from '@/components/ViewToggle';
import RankingListV0 from '@/components/RankingListV0';
import MapDisplayV0 from '@/components/MapDisplayV0';
import CommunitySelector from '@/components/CommunitySelector';
import SpotAddForm from '@/components/SpotAddForm';
import CategoryManager from '@/components/CategoryManager';
import MapSelector from '@/components/MapSelector';

type ViewMode = 'split' | 'fullscreen';
type ActiveTab = 'map' | 'requests';

export default function Home() {
  const [spots, setSpots] = useState<LocalSpot[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<LocalSpot | null>(null);
  const [loading, setLoading] = useState(false); // コミュニティが選択されるまでfalse
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  
  // localStorageから復元
  // localStorageから復元（初期化時のみ）
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('selectedCommunityId');
      return saved || null;
    }
    return null;
  });
  const [selectedMapId, setSelectedMapId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('selectedMapId');
      return saved || null;
    }
    return null;
  });
  const [communitiesLoading, setCommunitiesLoading] = useState(false); // コミュニティ読み込み状態（初期値はfalse）
  const [communitiesLoadError, setCommunitiesLoadError] = useState(false); // コミュニティ読み込みエラー
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [searchMarkerLocation, setSearchMarkerLocation] = useState<{ lat: number; lng: number; name?: string } | null>(null);
  const [communityName, setCommunityName] = useState<string>('');
  const [myNickname, setMyNickname] = useState<string>('');
  const [memberCount, setMemberCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<ActiveTab>('map');
  const [membershipRequests, setMembershipRequests] = useState<CommunityMember[]>([]);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [loadingRequests, setLoadingRequests] = useState<boolean>(false);
  const [leavingCommunityId, setLeavingCommunityId] = useState<string | null>(null);
  const [deletingCommunityId, setDeletingCommunityId] = useState<string | null>(null);
  const [spotNotes, setSpotNotes] = useState<Map<string, string>>(new Map()); // spotId -> notes
  const [editingSpotId, setEditingSpotId] = useState<string | null>(null);
  const [categoriesKey, setCategoriesKey] = useState<number>(0); // カテゴリ更新のトリガー
  const [showSettingsMenu, setShowSettingsMenu] = useState<boolean>(false);

  const loadSpots = async () => {
    setLoading(true);
    let data = await getLocalSpots(selectedCommunityId || undefined, selectedMapId || undefined);
    
    // 「大学南一丁目」を自動的に削除
    const universitySouthSpots = data.filter(spot => 
      spot.name.includes('大学南一丁目') || 
      spot.name.includes('大学南') ||
      (spot.description && spot.description.includes('大学南')) ||
      spot.name.includes('南一丁目')
    );
    
    if (universitySouthSpots.length > 0) {
      console.log('🗑️ 「大学南一丁目」関連のスポットを自動削除します:', universitySouthSpots.map(s => s.name));
      
      // 各スポットをSupabaseから削除
      for (const spot of universitySouthSpots) {
        try {
          const success = await supabaseDeleteSpot(spot.id);
          if (success) {
            console.log('✅ 削除しました:', spot.name);
          } else {
            console.warn('⚠️ 削除に失敗しました:', spot.name);
          }
        } catch (error) {
          console.error('❌ 削除エラー:', spot.name, error);
        }
      }
      
      // データから除外
      data = data.filter(spot => 
        !spot.name.includes('大学南一丁目') && 
        !spot.name.includes('大学南') &&
        (!spot.description || !spot.description.includes('大学南')) &&
        !spot.name.includes('南一丁目')
      );
    }
    
    // 古い履歴をクリーンアップ
    cleanupOldHistory();
    
    // いいね数の履歴を更新（前回との比較のため）
    updateLikesHistory(data);
    
    // スポットの記録を読み込む
    const notesMap = new Map<string, string>();
    data.forEach((spot) => {
      if (spot.notes) {
        notesMap.set(spot.id, spot.notes);
      }
    });
    setSpotNotes(notesMap);
    
    setSpots(data);
    setLoading(false);
  };

  // スポットをその場で更新する関数（ローディング画面を表示しない）
  const updateSpot = (updatedSpot: LocalSpot) => {
    setSpots((prevSpots) => {
      return prevSpots.map((spot) => {
        if (spot.id === updatedSpot.id) {
          // trend_scoreを再計算
          const newTrendScore = calculateTrendScore(updatedSpot);
          const updated = {
            ...updatedSpot,
            trend_score: newTrendScore,
          };
          
          // いいね数の履歴を更新（次の読み込み時に比較できるように）
          updateLikesHistory([updated]);
          
          return updated;
        }
        return spot;
      });
    });
  };

  // スポットを削除する関数
  const deleteSpot = async (spotId: string) => {
    try {
      console.log('🗑️ スポット削除を開始:', spotId);
      
      // 削除対象のスポット情報をログに出力（デバッグ用）
      const spotToDelete = spots.find(s => s.id === spotId);
      if (spotToDelete) {
        console.log('削除対象:', spotToDelete.name, spotToDelete.id);
      }
      
      // Supabaseから削除
      const success = await supabaseDeleteSpot(spotId);
      
      console.log('削除結果:', success);
      
      if (success) {
        // クライアント側の状態からも削除
        setSpots((prevSpots) => {
          const filtered = prevSpots.filter((spot) => spot.id !== spotId);
          console.log('削除前のスポット数:', prevSpots.length);
          console.log('削除後のスポット数:', filtered.length);
          console.log('削除されたスポットID:', spotId);
          return filtered;
        });
        
        // 選択中のスポットが削除された場合はクリア
        if (selectedSpot && selectedSpot.id === spotId) {
          setSelectedSpot(null);
        }
        
        // 削除したスポットのピンもクリア
        if (selectedLocation) {
          setSelectedLocation(null);
        }
        if (searchMarkerLocation) {
          setSearchMarkerLocation(null);
        }
        
        console.log('✅ スポット削除が完了しました');
      } else {
        console.error('❌ スポットの削除に失敗しました');
        alert('スポットの削除に失敗しました。\n\n考えられる原因:\n1. SupabaseのRLSポリシーが設定されていない\n2. スポットIDが存在しない\n\nコンソール（F12）でエラー詳細を確認してください。');
      }
    } catch (error) {
      console.error('❌ スポット削除中にエラーが発生しました:', error);
      alert('スポットの削除中にエラーが発生しました: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  // コミュニティ情報を読み込む
  const loadCommunityInfo = async () => {
    if (!selectedCommunityId) return;
    
    try {
      // コミュニティ情報を取得
      const communities = await getCommunities();
      const community = communities.find(c => c.id === selectedCommunityId);
      if (community) {
        setCommunityName(community.name);
      }

      // 自分のメンバーシップ情報を取得
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const membership = await getCommunityMembership(selectedCommunityId, user.id);
        if (membership?.nickname) {
          setMyNickname(membership.nickname);
        } else {
          setMyNickname('');
        }

        // オーナーかどうか確認
        const owner = await isCommunityOwner(selectedCommunityId);
        setIsOwner(owner);
      } else {
        setMyNickname('');
        setIsOwner(false);
      }

      // メンバー数を取得
      const count = await getCommunityMemberCount(selectedCommunityId);
      setMemberCount(count);
    } catch (error) {
      console.error('コミュニティ情報の読み込みエラー:', error);
    }
  };

  // カテゴリを読み込む（カテゴリ更新のトリガー用）
  const triggerCategoryReload = () => {
    setCategoriesKey(prev => prev + 1);
  };

  // 申請一覧を読み込む
  const loadMembershipRequests = async () => {
    if (!selectedCommunityId || !isOwner) return;
    
    setLoadingRequests(true);
    try {
      const requests = await getCommunityMembershipRequests(selectedCommunityId);
      setMembershipRequests(requests);
    } catch (error) {
      console.error('申請一覧の読み込みエラー:', error);
    } finally {
      setLoadingRequests(false);
    }
  };

  // 申請を承認
  const handleApproveRequest = async (membershipId: string) => {
    try {
      const success = await updateMembershipStatus(membershipId, 'approved');
      if (success) {
        await loadMembershipRequests();
        await loadCommunityInfo(); // メンバー数を更新
      } else {
        alert('承認に失敗しました');
      }
    } catch (error) {
      console.error('承認エラー:', error);
      alert('承認中にエラーが発生しました');
    }
  };

  // 申請を拒否
  const handleRejectRequest = async (membershipId: string) => {
    try {
      const success = await updateMembershipStatus(membershipId, 'rejected');
      if (success) {
        await loadMembershipRequests();
      } else {
        alert('拒否に失敗しました');
      }
    } catch (error) {
      console.error('拒否エラー:', error);
      alert('拒否中にエラーが発生しました');
    }
  };

  // コミュニティから脱退
  const handleLeaveCommunity = async () => {
    if (!selectedCommunityId) return;
    if (!confirm('このコミュニティから脱退しますか？')) {
      return;
    }

    setLeavingCommunityId(selectedCommunityId);
    try {
      const success = await leaveCommunity(selectedCommunityId);
      if (success) {
        // コミュニティ選択を解除
        setSelectedCommunityId(null);
        setSpots([]);
        setSelectedCategory(null);
        setSelectedSpot(null);
        setCommunityName('');
        setMyNickname('');
        setMemberCount(0);
        setIsOwner(false);
      } else {
        alert('脱退に失敗しました');
      }
    } catch (error) {
      console.error('脱退エラー:', error);
      alert('脱退中にエラーが発生しました');
    } finally {
      setLeavingCommunityId(null);
    }
  };

  // コミュニティを解散
  const handleDeleteCommunity = async () => {
    if (!selectedCommunityId) return;
    if (!confirm('このコミュニティを解散しますか？\n\n注意: コミュニティを解散すると、すべてのメンバーとスポットが削除されます。この操作は取り消せません。')) {
      return;
    }

    setDeletingCommunityId(selectedCommunityId);
    try {
      const success = await deleteCommunity(selectedCommunityId);
      if (success) {
        // コミュニティ選択を解除
        setSelectedCommunityId(null);
        setSpots([]);
        setSelectedCategory(null);
        setSelectedSpot(null);
        setCommunityName('');
        setMyNickname('');
        setMemberCount(0);
        setIsOwner(false);
      } else {
        alert('コミュニティの解散に失敗しました');
      }
    } catch (error) {
      console.error('解散エラー:', error);
      alert('コミュニティの解散中にエラーが発生しました');
    } finally {
      setDeletingCommunityId(null);
    }
  };

  // コミュニティIDをlocalStorageに保存
  useEffect(() => {
    if (selectedCommunityId) {
      localStorage.setItem('selectedCommunityId', selectedCommunityId);
    } else {
      localStorage.removeItem('selectedCommunityId');
    }
  }, [selectedCommunityId]);

  // 地図IDをlocalStorageに保存
  useEffect(() => {
    if (selectedMapId) {
      localStorage.setItem('selectedMapId', selectedMapId);
    } else {
      localStorage.removeItem('selectedMapId');
    }
  }, [selectedMapId]);

  // コミュニティIDをlocalStorageに保存
  useEffect(() => {
    if (selectedCommunityId) {
      localStorage.setItem('selectedCommunityId', selectedCommunityId);
    } else {
      localStorage.removeItem('selectedCommunityId');
      localStorage.removeItem('selectedMapId'); // コミュニティが解除されたら地図IDも削除
    }
  }, [selectedCommunityId]);

  // 地図IDをlocalStorageに保存
  useEffect(() => {
    if (selectedMapId && selectedCommunityId) {
      localStorage.setItem('selectedMapId', selectedMapId);
    } else if (!selectedCommunityId) {
      localStorage.removeItem('selectedMapId');
    }
  }, [selectedMapId, selectedCommunityId]);

  // コミュニティが変更されたときにスポットとコミュニティ情報を再読み込み
  useEffect(() => {
    if (selectedCommunityId !== null) {
      // コミュニティ変更時は、保存されていた地図IDが新しいコミュニティに存在するか確認
      // 存在しない場合はnullにリセット（MapSelectorコンポーネントでデフォルト地図が選択される）
      loadSpots();
      loadCommunityInfo();
      triggerCategoryReload(); // カテゴリも再読み込み
      setActiveTab('map'); // タブをリセット
    } else {
      setCommunityName('');
      setMyNickname('');
      setMemberCount(0);
      setIsOwner(false);
      setMembershipRequests([]);
      setSelectedMapId(null);
      setActiveTab('map');
    }
  }, [selectedCommunityId]);

  // 地図が変更されたときにスポットを再読み込み
  useEffect(() => {
    if (selectedCommunityId !== null) {
      loadSpots();
    }
  }, [selectedMapId]);

  // オーナーが確認できたら申請一覧を読み込む
  useEffect(() => {
    if (isOwner && selectedCommunityId && activeTab === 'requests') {
      loadMembershipRequests();
    }
  }, [isOwner, selectedCommunityId, activeTab]);

  // 地図クリック時のハンドラ
  const handleMapClick = (latitude: number, longitude: number) => {
    if (selectedCommunityId) {
      setSelectedLocation({ lat: latitude, lng: longitude });
      setMapCenter({ lat: latitude, lng: longitude });
      setSearchMarkerLocation(null); // 地図クリック時は検索マーカーをクリア
    }
  };

  // 位置変更時のハンドラ（地図クリック時）
  const handleLocationChange = (latitude: number, longitude: number) => {
    setSelectedLocation({ lat: latitude, lng: longitude });
    setMapCenter({ lat: latitude, lng: longitude });
    setSearchMarkerLocation(null); // 検索マーカーは使用しない
  };

  // スポット作成後のコールバック
  const handleSpotCreated = () => {
    loadSpots(); // スポットリストを再読み込み
  };

  // タイムアウト: 2秒経過してもコミュニティが読み込まれない場合はエラー表示
  useEffect(() => {
    const timer = setTimeout(() => {
      if (communitiesLoading) {
        setCommunitiesLoadError(true);
        setCommunitiesLoading(false);
      }
    }, 2000); // 2秒に短縮

    return () => clearTimeout(timer);
  }, [communitiesLoading]);

  return (
    <div className="bg-background">
      {!selectedCommunityId && (
        <>
          <Header />
          {/* 用途説明セクション */}
          <section className="pt-32 pb-24 px-6 sm:px-8 md:px-12" style={{
            background: 'linear-gradient(to bottom, var(--background), oklch(0.97 0.01 70), oklch(0.96 0.015 70))'
          }}>
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light text-foreground mb-4 relative inline-block">
                  こんな場面で使えます
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
                </h2>
                <p className="text-base sm:text-lg font-serif text-foreground/60 mt-6 max-w-2xl mx-auto">
                  様々なシーンで活用できる、柔軟な地図共有プラットフォーム
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* レジャー・趣味 */}
                <div className="bg-background/60 backdrop-blur-sm border border-border/40 rounded-lg p-5 hover:bg-background/80 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-foreground">レジャー・趣味</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-foreground/80 font-serif">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>友達同士で行きたい場所を共有</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>趣味のスポット（撮影・釣り・登山）を共有</span>
                    </li>
                  </ul>
                </div>

                {/* ビジネス */}
                <div className="bg-background/60 backdrop-blur-sm border border-border/40 rounded-lg p-5 hover:bg-background/80 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-foreground">ビジネス</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-foreground/80 font-serif">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>顧客や訪問先を地図で管理</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>イベントの人気エリアを可視化</span>
                    </li>
                  </ul>
                </div>

                {/* コミュニティ */}
                <div className="bg-background/60 backdrop-blur-sm border border-border/40 rounded-lg p-5 hover:bg-background/80 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-foreground">コミュニティ</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-foreground/80 font-serif">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>コミュニティのおすすめスポットを記録</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>地域資源や課題の可視化</span>
                    </li>
                  </ul>
                </div>

                {/* 研究・活動 */}
                <div className="bg-background/60 backdrop-blur-sm border border-border/40 rounded-lg p-5 hover:bg-background/80 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-foreground">研究・活動</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-foreground/80 font-serif">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>研究やフィールドワークの記録</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>チームの活動場所や進捗をマッピング</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {communitiesLoading && !communitiesLoadError ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary mx-auto"></div>
            <p className="font-serif text-sm text-muted-foreground">読み込み中...</p>
          </div>
        </div>
      ) : !selectedCommunityId ? (
        <div className="flex items-center justify-center min-h-screen py-20 relative" style={{
          background: 'linear-gradient(to bottom, oklch(0.96 0.015 70), oklch(0.96 0.015 70))'
        }}>
          {/* 装飾的な背景要素 */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10" style={{
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3), transparent)'
            }}></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-10" style={{
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3), transparent)'
            }}></div>
          </div>
          <div className="text-center space-y-12 max-w-4xl mx-4 w-full relative z-10">
            <div className="space-y-6 pt-8">
              <h1 className="font-serif text-3xl font-semibold text-foreground">
                コミュニティを選択または作成
              </h1>
              <p className="font-serif text-base text-muted-foreground max-w-2xl mx-auto">
                地図を表示するには、コミュニティを選択するか、新しいコミュニティを作成してください。
              </p>
            </div>
            <div className="bg-background/90 backdrop-blur-sm border border-border/50 rounded-2xl p-8 sm:p-10 shadow-xl shadow-primary/5">
              <CommunitySelector
                selectedCommunityId={selectedCommunityId}
                onCommunityChange={(id) => {
                  setSelectedCommunityId(id);
                  setCommunitiesLoading(false);
                  setCommunitiesLoadError(false);
                }}
                onCommunitiesLoaded={() => {
                  setCommunitiesLoading(false);
                }}
              />
            </div>
          </div>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary mx-auto"></div>
            <p className="font-serif text-muted-foreground">スポットを読み込んでいます...</p>
          </div>
        </div>
      ) : (
        <>
          {/* コミュニティヘッダー */}
          <div className="border-b border-border/40 bg-background">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 py-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div>
                      <h1 className="font-serif text-4xl font-semibold text-foreground">
                        {communityName || 'コミュニティ'}
                      </h1>
                      {myNickname && (
                        <p className="font-serif text-sm text-muted-foreground mt-1">
                          あなたの名前: {myNickname}
                        </p>
                      )}
                      <p className="font-serif text-sm text-muted-foreground mt-1">
                        メンバー数: {memberCount}人
                      </p>
                    </div>
                    {/* 地図選択 */}
                    {selectedCommunityId && (
                      <div className="flex-1 min-w-[200px]">
            <MapSelector
              communityId={selectedCommunityId}
              selectedMapId={selectedMapId}
              onMapChange={setSelectedMapId}
              isOwner={isOwner}
            />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* 設定ボタン */}
                  <div className="relative">
                    <button
                      onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                      className="p-2 rounded-lg bg-secondary/10 hover:bg-secondary/20 transition-colors"
                      title="設定"
                    >
                      <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                    
                    {/* ドロップダウンメニュー */}
                    {showSettingsMenu && (
                      <>
                        {/* オーバーレイ（メニュー外をクリックで閉じる） */}
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowSettingsMenu(false)}
                        />
                        {/* メニュー */}
                        <div className="absolute right-0 top-full mt-2 w-48 bg-background border border-border rounded-lg shadow-lg z-50">
                          <div className="py-1">
                            {isOwner ? (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowSettingsMenu(false);
                                    handleLeaveCommunity();
                                  }}
                                  disabled={leavingCommunityId === selectedCommunityId}
                                  className="w-full px-4 py-2 text-left font-serif text-sm text-muted-foreground hover:bg-secondary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                  {leavingCommunityId === selectedCommunityId ? (
                                    <>
                                      <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      <span>脱退中...</span>
                                    </>
                                  ) : (
                                    <>
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                      </svg>
                                      <span>脱退</span>
                                    </>
                                  )}
                                </button>
                                <div className="border-t border-border/20 my-1" />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowSettingsMenu(false);
                                    handleDeleteCommunity();
                                  }}
                                  disabled={deletingCommunityId === selectedCommunityId}
                                  className="w-full px-4 py-2 text-left font-serif text-sm text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                  {deletingCommunityId === selectedCommunityId ? (
                                    <>
                                      <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      <span>解散中...</span>
                                    </>
                                  ) : (
                                    <>
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                      <span>解散</span>
                                    </>
                                  )}
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowSettingsMenu(false);
                                  handleLeaveCommunity();
                                }}
                                disabled={leavingCommunityId === selectedCommunityId}
                                className="w-full px-4 py-2 text-left font-serif text-sm text-muted-foreground hover:bg-secondary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                              >
                                {leavingCommunityId === selectedCommunityId ? (
                                  <>
                                    <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>脱退中...</span>
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    <span>脱退</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCommunityId(null);
                      setSpots([]);
                      setSelectedCategory(null);
                      setSelectedSpot(null);
                      setCommunityName('');
                      setMyNickname('');
                      setMemberCount(0);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-serif text-sm bg-secondary/50 text-foreground hover:bg-secondary/70 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m12 19-7-7 7-7" />
                      <path d="M19 12H5" />
                    </svg>
                    コミュニティ選択に戻る
                  </button>
                  <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
                </div>
              </div>
            </div>
          </div>

          {/* タブ */}
          {isOwner && (
            <div className="border-b border-border/40 bg-background">
              <div className="max-w-7xl mx-auto px-6 sm:px-8">
                <div className="flex gap-1">
                  <button
                    onClick={() => setActiveTab('map')}
                    className={`px-4 py-2 font-serif text-sm transition-colors border-b-2 ${
                      activeTab === 'map'
                        ? 'border-primary text-foreground font-semibold'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    地図
                  </button>
                  <button
                    onClick={() => setActiveTab('requests')}
                    className={`px-4 py-2 font-serif text-sm transition-colors border-b-2 relative ${
                      activeTab === 'requests'
                        ? 'border-primary text-foreground font-semibold'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    申請
                    {membershipRequests.filter(r => r.status === 'pending').length > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground rounded-full text-[10px] flex items-center justify-center">
                        {membershipRequests.filter(r => r.status === 'pending').length}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 申請タブのコンテンツ */}
          {activeTab === 'requests' && isOwner ? (
            <div className="max-w-4xl mx-auto px-6 sm:px-8 py-8">
              <div className="space-y-4">
                <h2 className="font-serif text-xl font-semibold text-foreground">メンバーシップ申請</h2>
                {loadingRequests ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary"></div>
                  </div>
                ) : membershipRequests.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="font-serif">申請はありません</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {membershipRequests.map((request) => (
                      <div
                        key={request.id}
                        className="border border-border rounded-lg p-4 bg-background"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-serif text-sm font-medium text-foreground">
                                ユーザーID: {request.user_id.substring(0, 8)}...
                              </span>
                              <span
                                className={`px-2 py-1 rounded text-[10px] font-serif ${
                                  request.status === 'pending'
                                    ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'
                                    : request.status === 'approved'
                                    ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                                    : 'bg-red-500/20 text-red-700 dark:text-red-400'
                                }`}
                              >
                                {request.status === 'pending' && '申請中'}
                                {request.status === 'approved' && '承認済み'}
                                {request.status === 'rejected' && '拒否済み'}
                              </span>
                            </div>
                            {request.nickname && (
                              <p className="font-serif text-xs text-muted-foreground mt-1">
                                ニックネーム: {request.nickname}
                              </p>
                            )}
                            {request.created_at && (
                              <p className="font-serif text-xs text-muted-foreground mt-1">
                                申請日: {new Date(request.created_at).toLocaleDateString('ja-JP')}
                              </p>
                            )}
                          </div>
                          {request.status === 'pending' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApproveRequest(request.id)}
                                className="px-3 py-1.5 rounded font-serif text-xs bg-green-500/20 text-green-700 dark:text-green-400 hover:bg-green-500/30 transition-colors"
                              >
                                承認
                              </button>
                              <button
                                onClick={() => handleRejectRequest(request.id)}
                                className="px-3 py-1.5 rounded font-serif text-xs bg-red-500/20 text-red-700 dark:text-red-400 hover:bg-red-500/30 transition-colors"
                              >
                                拒否
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* カテゴリフィルター */}
              <div className="border-b border-border/40 bg-secondary/5">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 py-4">
                  <CategoryFilterV0 
                    selectedCategory={selectedCategory} 
                    onCategoryChange={setSelectedCategory}
                    communityId={selectedCommunityId}
                    key={categoriesKey}
                  />
                </div>
              </div>

              {/* Main content area */}
              {viewMode === "split" ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                  {/* Left sidebar - Form + Spot list */}
                  <div className="lg:col-span-1 border-r border-border/40 bg-background">
                    <div className="sticky top-0 max-h-screen overflow-y-auto p-8 sm:p-10 space-y-6">
                      {/* カテゴリ管理 */}
                      {selectedCommunityId && (
                        <div className="border-b border-border/40 pb-6 mb-6">
                          <CategoryManager
                            communityId={selectedCommunityId}
                            onCategoryChange={() => {
                              // カテゴリが変更されたときに再読み込み
                              setCategoriesKey(prev => prev + 1);
                            }}
                          />
                        </div>
                      )}
                      {/* スポット追加フォーム（上部に固定） */}
                      {selectedCommunityId && (
                        <div className="border-b border-border/40 pb-6">
                          <SpotAddForm
                            communityId={selectedCommunityId}
                            mapId={selectedMapId}
                            selectedLocation={selectedLocation}
                            onSpotCreated={handleSpotCreated}
                            onLocationSelect={handleLocationChange}
                            categoriesKey={categoriesKey}
                          />
                        </div>
                      )}
                      {/* スポット一覧 */}
                      <RankingListV0
                        spots={spots}
                        selectedCategory={selectedCategory}
                        onSpotClick={setSelectedSpot}
                        onSpotUpdate={updateSpot}
                        communityId={selectedCommunityId}
                        key={categoriesKey}
                      />
                    </div>
                  </div>
                  {/* Right main area - Map display */}
                  <div className="lg:col-span-2 bg-secondary/5">
                    <div className="min-h-[600px] h-[600px]">
                      <MapDisplayV0
                        spots={spots}
                        selectedCategory={selectedCategory}
                        onSpotClick={setSelectedSpot}
                        onSpotUpdate={updateSpot}
                        onSpotDelete={deleteSpot}
                        selectedSpotFromOutside={selectedSpot}
                        onMapClick={handleMapClick}
                        centerLocation={mapCenter}
                        searchMarkerLocation={searchMarkerLocation}
                        clickedLocation={selectedLocation}
                        communityId={selectedCommunityId}
                        categoriesKey={categoriesKey}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-secondary/5 min-h-[600px] h-[600px] relative">
              <MapDisplayV0
                spots={spots}
                selectedCategory={selectedCategory}
                onSpotClick={setSelectedSpot}
                onSpotUpdate={updateSpot}
                onSpotDelete={deleteSpot}
                selectedSpotFromOutside={selectedSpot}
                onMapClick={handleMapClick}
                centerLocation={mapCenter}
                clickedLocation={selectedLocation}
                communityId={selectedCommunityId}
                categoriesKey={categoriesKey}
              />
                  {/* スポット追加フォーム（フルスクリーン時は右側にスライドイン） */}
                  {selectedCommunityId && selectedLocation && (
                    <div className="absolute top-4 right-4 z-10 w-full max-w-sm">
                      <div className="bg-background border border-border rounded-lg shadow-xl max-h-[80vh] overflow-y-auto">
                        <SpotAddForm
                          communityId={selectedCommunityId}
                          selectedLocation={selectedLocation}
                          onSpotCreated={handleSpotCreated}
                          onLocationSelect={handleLocationChange}
                          categoriesKey={categoriesKey}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 記録セクション */}
              <div className="border-t border-border/40 bg-background">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
                  <h2 className="font-serif text-xl font-semibold text-foreground mb-6">記録</h2>
                  <p className="font-serif text-sm text-muted-foreground mb-6">
                    各スポットについて、どんな場所で何がおすすめかをラフに記録してください
                  </p>
                  {spots.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {spots.map((spot) => {
                        const currentNote = spotNotes.get(spot.id) || spot.notes || '';
                        const isEditing = editingSpotId === spot.id;
                        
                        return (
                          <div
                            key={spot.id}
                            className="border border-border rounded-lg p-4 bg-secondary/5 hover:bg-secondary/10 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h3
                                className="font-serif text-sm font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                                onClick={() => setSelectedSpot(spot)}
                              >
                                {spot.name}
                              </h3>
                              {!isEditing && (
                                <button
                                  onClick={() => {
                                    setEditingSpotId(spot.id);
                                    setSpotNotes(new Map(spotNotes).set(spot.id, currentNote));
                                  }}
                                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  編集
                                </button>
                              )}
                            </div>
                            {isEditing ? (
                              <div className="space-y-2">
                                <textarea
                                  value={currentNote}
                                  onChange={(e) => {
                                    const newNotes = new Map(spotNotes);
                                    newNotes.set(spot.id, e.target.value);
                                    setSpotNotes(newNotes);
                                  }}
                                  placeholder="どんな場所で何がおすすめか、ラフに書いてください..."
                                  className="w-full min-h-[100px] px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground font-serif resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                <div className="flex gap-2 justify-end">
                                  <button
                                    onClick={() => {
                                      setEditingSpotId(null);
                                      // 元の値に戻す
                                      const newNotes = new Map(spotNotes);
                                      newNotes.set(spot.id, spot.notes || '');
                                      setSpotNotes(newNotes);
                                    }}
                                    className="px-3 py-1.5 rounded font-serif text-xs bg-secondary/50 text-muted-foreground hover:bg-secondary/70 transition-colors"
                                  >
                                    キャンセル
                                  </button>
                                  <button
                                    onClick={async () => {
                                      // Supabaseに保存（後で実装）
                                      try {
                                        const { error } = await supabase
                                          .from('local_spots')
                                          .update({ notes: currentNote })
                                          .eq('id', spot.id);
                                        
                                        if (error) {
                                          console.error('記録の保存に失敗しました:', error);
                                          alert('記録の保存に失敗しました');
                                        } else {
                                          // スポットの状態を更新
                                          setSpots((prevSpots) =>
                                            prevSpots.map((s) =>
                                              s.id === spot.id ? { ...s, notes: currentNote } : s
                                            )
                                          );
                                          setEditingSpotId(null);
                                        }
                                      } catch (error) {
                                        console.error('記録の保存中にエラーが発生しました:', error);
                                        alert('記録の保存中にエラーが発生しました');
                                      }
                                    }}
                                    className="px-3 py-1.5 rounded font-serif text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                                  >
                                    保存
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div
                                className="text-sm text-muted-foreground min-h-[60px] whitespace-pre-wrap cursor-text"
                                onClick={() => {
                                  setEditingSpotId(spot.id);
                                  setSpotNotes(new Map(spotNotes).set(spot.id, currentNote));
                                }}
                              >
                                {currentNote || (
                                  <span className="italic text-muted-foreground/50">
                                    クリックして記録を追加...
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <p className="font-serif">まだスポットがありません</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
