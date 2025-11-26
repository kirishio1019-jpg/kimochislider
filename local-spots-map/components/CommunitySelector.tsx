"use client"

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Community, CommunityMember } from '@/types';
import { 
  getCommunities, 
  createCommunity, 
  requestCommunityMembership,
  getCommunityMembership,
  joinPublicCommunity,
  getUserMemberships,
  getCommunityMemberCount,
  leaveCommunity,
  deleteCommunity,
  isCommunityOwner
} from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { Users, Plus, Loader2, Search, Check, Clock, X } from 'lucide-react';

interface CommunitySelectorProps {
  selectedCommunityId: string | null;
  onCommunityChange: (communityId: string | null) => void;
  onCommunitiesLoaded?: () => void;
}

export default function CommunitySelector({
  selectedCommunityId,
  onCommunityChange,
  onCommunitiesLoaded,
}: CommunitySelectorProps) {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCommunityName, setNewCommunityName] = useState('');
  const [newCommunityDescription, setNewCommunityDescription] = useState('');
  const [newCommunityIsPublic, setNewCommunityIsPublic] = useState(true); // デフォルトは公開
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [memberships, setMemberships] = useState<Map<string, CommunityMember>>(new Map());
  const [loadingMemberships, setLoadingMemberships] = useState<Set<string>>(new Set());
  const [user, setUser] = useState<any>(null);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [selectedCommunityForJoin, setSelectedCommunityForJoin] = useState<Community | null>(null);
  const [nickname, setNickname] = useState('');
  const [joining, setJoining] = useState(false);
  const [myCommunities, setMyCommunities] = useState<Array<{ community: Community; membership: CommunityMember; memberCount: number; isOwner: boolean }>>([]);
  const [loadingMyCommunities, setLoadingMyCommunities] = useState(false);
  const [leavingCommunityId, setLeavingCommunityId] = useState<string | null>(null);
  const [deletingCommunityId, setDeletingCommunityId] = useState<string | null>(null);
  const [communityMemberCounts, setCommunityMemberCounts] = useState<Map<string, number>>(new Map());
  const [loadingMemberCounts, setLoadingMemberCounts] = useState<Set<string>>(new Set());

  const loadMyCommunities = useCallback(async () => {
    if (!user) return;
    setLoadingMyCommunities(true);
    try {
      const memberships = await getUserMemberships(user.id);
      const membershipMap = new Map<string, CommunityMember>();
      memberships.forEach(m => membershipMap.set(m.community_id, m));
      
      // オーナーのコミュニティも含める（メンバーシップがなくても）
      const ownerCommunities = communities.filter(c => c.owner_id === user.id);
      
      const myCommunitiesData = await Promise.all(
        [
          // メンバーシップがあるコミュニティ
          ...memberships.map(async (membership) => {
            const community = communities.find(c => c.id === membership.community_id);
            if (!community) return null;
            
            // メンバー数を取得（並列化）
            const memberCount = await getCommunityMemberCount(community.id);
            
            // オーナーかどうかを確認
            const isOwner = community.owner_id === user.id;
            
            return { community, membership, memberCount, isOwner };
          }),
          // オーナーだがメンバーシップがないコミュニティ
          ...ownerCommunities
            .filter(c => !membershipMap.has(c.id))
            .map(async (community) => {
              // メンバー数を取得
              const memberCount = await getCommunityMemberCount(community.id);
              
              // ダミーのメンバーシップを作成（表示用）
              const dummyMembership: CommunityMember = {
                id: '',
                community_id: community.id,
                user_id: user.id,
                status: 'approved',
                role: 'owner',
              };
              
              return { community, membership: dummyMembership, memberCount, isOwner: true };
            })
        ]
      );
      setMyCommunities(
        myCommunitiesData.filter((item): item is { community: Community; membership: CommunityMember; memberCount: number; isOwner: boolean } => item !== null)
      );
    } catch (error) {
      console.error('参加中のコミュニティの読み込みエラー:', error);
    } finally {
      setLoadingMyCommunities(false);
    }
  }, [user, communities]);

  useEffect(() => {
    // 即座に読み込みを開始
    loadCommunities();
    loadUser();
  }, []);

  useEffect(() => {
    if (user && communities.length > 0) {
      loadMyCommunities();
    }
  }, [user, communities, loadMyCommunities]);

  // 検索結果のコミュニティのメンバー数を取得
  useEffect(() => {
    if (communities.length === 0) return;

    const loadMemberCounts = async () => {
      // 検索クエリでフィルタリング
      const filtered = searchQuery.trim()
        ? communities.filter(
            (community) =>
              community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (community.description && community.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
              (community.slug && community.slug.toLowerCase().includes(searchQuery.toLowerCase()))
          )
        : communities;

      const communitiesToLoad = filtered.filter(
        (c) => !communityMemberCounts.has(c.id) && !loadingMemberCounts.has(c.id)
      );

      if (communitiesToLoad.length === 0) return;

      setLoadingMemberCounts((prev) => {
        const next = new Set(prev);
        communitiesToLoad.forEach((c) => next.add(c.id));
        return next;
      });

      const counts = await Promise.allSettled(
        communitiesToLoad.map(async (community) => {
          try {
            const count = await getCommunityMemberCount(community.id);
            return { id: community.id, count };
          } catch (error) {
            console.error(`メンバー数の取得に失敗しました (${community.name}):`, error);
            return { id: community.id, count: 0 };
          }
        })
      );

      setCommunityMemberCounts((prev) => {
        const next = new Map(prev);
        counts.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            next.set(result.value.id, result.value.count);
          } else {
            // エラーが発生した場合は0を設定
            const community = communitiesToLoad[index];
            if (community) {
              next.set(community.id, 0);
            }
          }
        });
        return next;
      });

      setLoadingMemberCounts((prev) => {
        const next = new Set(prev);
        communitiesToLoad.forEach((c) => next.delete(c.id));
        return next;
      });
    };

    loadMemberCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communities, searchQuery]);

  const handleLeaveCommunity = async (communityId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('このコミュニティから脱退しますか？')) {
      return;
    }

    setLeavingCommunityId(communityId);
    try {
      const success = await leaveCommunity(communityId);
      if (success) {
        await loadAllMemberships();
        await loadMyCommunities();
        // 現在選択中のコミュニティの場合は選択を解除
        if (selectedCommunityId === communityId) {
          onCommunityChange(null);
        }
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

  const handleDeleteCommunity = async (communityId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('このコミュニティを解散しますか？\n\n注意: コミュニティを解散すると、すべてのメンバーとスポットが削除されます。この操作は取り消せません。')) {
      return;
    }

    setDeletingCommunityId(communityId);
    try {
      const success = await deleteCommunity(communityId);
      if (success) {
        // コミュニティリストを再読み込み
        await loadCommunities();
        await loadAllMemberships();
        await loadMyCommunities();
        // 現在選択中のコミュニティの場合は選択を解除
        if (selectedCommunityId === communityId) {
          onCommunityChange(null);
        }
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

  const loadUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user && communities.length > 0) {
        loadAllMemberships();
      }
    } catch (error) {
      // 認証エラーは無視（ログインしていない場合）
      console.log('ℹ️ 認証情報が取得できませんでした（ログインしていない可能性があります）');
      setUser(null);
    }
  };

  const loadAllMemberships = async () => {
    if (!user) return;
    
    const membershipMap = new Map<string, CommunityMember>();
    
    for (const community of communities) {
      const membership = await getCommunityMembership(community.id, user.id);
      if (membership) {
        membershipMap.set(community.id, membership);
      }
    }
    
    setMemberships(membershipMap);
    // 参加中のコミュニティリストも更新
    await loadMyCommunities();
  };

  const loadCommunities = async () => {
    try {
      setLoading(true);
      // タイムアウトを設定して高速化（5秒に延長）
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 5000); // 5秒でタイムアウト
      });
      
      const data = await Promise.race([
        getCommunities(),
        timeoutPromise
      ]) as any[];
      
      setCommunities(data || []);
      
      // メンバーシップ情報を読み込む
      if (user) {
        setTimeout(() => {
          loadAllMemberships();
        }, 100);
      }
    } catch (error) {
      console.error('コミュニティの読み込みエラー:', error);
      // タイムアウトエラーの場合は、空配列を設定して続行
      if (error instanceof Error && error.message === 'Timeout') {
        console.warn('⚠️ コミュニティの読み込みがタイムアウトしました。後で再試行してください。');
        setCommunities([]);
      } else {
        // その他のエラーも空配列を設定して続行
        setCommunities([]);
      }
    } finally {
      // 確実に読み込み状態を解除
      setLoading(false);
      // コミュニティの読み込みが完了したことを親コンポーネントに通知
      if (onCommunitiesLoaded) {
        onCommunitiesLoaded();
      }
    }
  };

  const handleCreateCommunity = async () => {
    if (!newCommunityName.trim()) {
      alert('コミュニティ名を入力してください');
      return;
    }

    setCreating(true);
    const newCommunity = await createCommunity(
      newCommunityName.trim(),
      newCommunityDescription.trim() || undefined,
      newCommunityIsPublic
    );

    if (newCommunity) {
      setCommunities([newCommunity, ...communities]);
      onCommunityChange(newCommunity.id);
      setShowCreateModal(false);
      setNewCommunityName('');
      setNewCommunityDescription('');
      setNewCommunityIsPublic(true); // デフォルトに戻す
      // メンバーシップ情報を再読み込み
      if (user) {
        await loadAllMemberships();
      }
    } else {
      alert('コミュニティの作成に失敗しました');
    }
    setCreating(false);
  };

  // 検索クエリでフィルタリング
  const filteredCommunities = useMemo(() => {
    if (!searchQuery.trim()) {
      return communities;
    }
    const query = searchQuery.toLowerCase();
    return communities.filter(
      (community) =>
        community.name.toLowerCase().includes(query) ||
        (community.description && community.description.toLowerCase().includes(query)) ||
        (community.slug && community.slug.toLowerCase().includes(query))
    );
  }, [communities, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="font-serif text-sm">読み込み中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* 参加中のコミュニティリスト */}
      {user && myCommunities.length > 0 && (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-serif text-xl font-semibold text-foreground">参加中のコミュニティ</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-2">
            {myCommunities.map(({ community, membership, memberCount, isOwner }) => {
              return (
                <div
                  key={community.id}
                  className={`group relative overflow-hidden rounded-xl font-serif transition-all duration-300 ${
                    selectedCommunityId === community.id
                      ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]'
                      : 'bg-gradient-to-br from-secondary/40 to-secondary/20 text-foreground hover:shadow-md hover:shadow-primary/10 hover:scale-[1.01] border border-border/50'
                  }`}
                >
                  <button
                    className="w-full p-5 text-left cursor-pointer"
                    onClick={() => onCommunityChange(community.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className={`font-semibold text-lg ${
                            selectedCommunityId === community.id
                              ? 'text-primary-foreground'
                              : 'text-foreground'
                          }`}>
                            {community.name}
                          </div>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            selectedCommunityId === community.id
                              ? 'bg-primary-foreground/20 text-primary-foreground'
                              : 'bg-primary/15 text-primary'
                          }`}>
                            クリックして入る
                          </span>
                        </div>
                        {membership.nickname && (
                          <div className={`text-sm flex items-center gap-1.5 ${
                            selectedCommunityId === community.id
                              ? 'text-primary-foreground/90'
                              : 'text-muted-foreground'
                          }`}>
                            <span className="text-xs">👤</span>
                            {membership.nickname}
                          </div>
                        )}
                        <div className={`text-sm flex items-center gap-1.5 ${
                          selectedCommunityId === community.id
                            ? 'text-primary-foreground/90'
                            : 'text-muted-foreground'
                        }`}>
                          <Users className={`w-3.5 h-3.5 ${
                            selectedCommunityId === community.id
                              ? 'text-primary-foreground/90'
                              : 'text-muted-foreground'
                          }`} />
                          {memberCount}人
                        </div>
                        {community.description && (
                          <div className={`text-xs mt-2 line-clamp-2 ${
                            selectedCommunityId === community.id
                              ? 'text-primary-foreground/80'
                              : 'text-muted-foreground'
                          }`}>
                            {community.description}
                          </div>
                        )}
                      </div>
                      <div className={`flex-shrink-0 transition-transform duration-300 ${
                        selectedCommunityId === community.id
                          ? 'text-primary-foreground scale-110'
                          : 'text-muted-foreground group-hover:scale-110'
                      }`}>
                        <Check className="w-5 h-5" />
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {communities.length > 0 ? (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Search className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-serif text-xl font-semibold text-foreground">コミュニティを検索・選択</h2>
          </div>
          
          {/* 検索バー */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="コミュニティ名で検索..."
                className="w-full pl-12 pr-4 py-3.5 rounded-xl font-serif text-base bg-background/80 backdrop-blur-sm text-foreground border-2 border-border/50 hover:border-primary/50 focus:border-primary transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
              />
            </div>
          </div>

          {/* 検索結果 */}
          {filteredCommunities.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-2 max-h-[500px] overflow-y-auto">
              {filteredCommunities.map((community) => {
                const isPublic = community.is_public !== false; // デフォルトは公開
                const isPrivate = !isPublic;
                const membership = memberships.get(community.id);
                const isMember = membership?.status === 'approved';
                const isPending = membership?.status === 'pending';
                const isRejected = membership?.status === 'rejected';
                const isLoading = loadingMemberships.has(community.id);
                
                const handleRequestPrivateCommunity = async (communityId: string) => {
                  setLoadingMemberships(prev => new Set(prev).add(communityId));
                  
                  try {
                    // 匿名認証でサインイン（既にログインしている場合はそのまま）
                    let currentUser = user;
                    if (!currentUser) {
                      const { data: { user: anonUser }, error: anonError } = await supabase.auth.signInAnonymously();
                      if (anonError) {
                        console.error('匿名認証エラー:', anonError);
                        alert('認証に失敗しました');
                        return;
                      }
                      currentUser = anonUser;
                      setUser(anonUser);
                    }
                    
                    const success = await requestCommunityMembership(communityId);
                    if (success) {
                      await loadAllMemberships();
                      alert('申請が完了しました。承認をお待ちください。');
                    }
                  } catch (error: any) {
                    console.error('エラー:', error);
                    const errorMessage = error?.message || 'エラーが発生しました';
                    alert(errorMessage);
                  } finally {
                    setLoadingMemberships(prev => {
                      const next = new Set(prev);
                      next.delete(communityId);
                      return next;
                    });
                  }
                };
                
                return (
                  <div
                    key={community.id}
                    className={`group relative overflow-hidden rounded-xl font-serif transition-all duration-300 ${
                      selectedCommunityId === community.id
                        ? isPublic
                          ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]'
                          : 'bg-gradient-to-br from-secondary/60 to-secondary/40 text-foreground shadow-md'
                        : isPublic
                          ? 'bg-gradient-to-br from-secondary/40 to-secondary/20 text-foreground hover:shadow-md hover:shadow-primary/10 hover:scale-[1.01] border border-border/50'
                          : 'bg-gradient-to-br from-secondary/20 to-secondary/10 text-muted-foreground border border-border/30'
                    }`}
                  >
                    <div className="w-full text-left transition-all px-5 py-4">
                      <button
                        onClick={() => {
                          if (isMember || isPending) {
                            onCommunityChange(community.id);
                          }
                        }}
                        className={`w-full text-left ${
                          isMember || isPending ? 'cursor-pointer' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <div className={`font-semibold ${isPrivate ? 'text-base' : 'text-lg'}`}>
                                {community.name}
                              </div>
                              {isPrivate && (
                                <span className="text-xs px-2.5 py-1 rounded-full bg-secondary/50 text-muted-foreground font-medium">
                                  非公開
                                </span>
                              )}
                              {isMember && (
                                <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/20 text-green-700 dark:text-green-400 flex items-center gap-1 font-medium">
                                  <Check className="w-3 h-3" />
                                  参加中
                                </span>
                              )}
                              {isPending && (
                                <span className="text-xs px-2.5 py-1 rounded-full bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 flex items-center gap-1 font-medium">
                                  <Clock className="w-3 h-3" />
                                  申請中
                                </span>
                              )}
                              {isRejected && (
                                <span className="text-xs px-2.5 py-1 rounded-full bg-red-500/20 text-red-700 dark:text-red-400 flex items-center gap-1 font-medium">
                                  <X className="w-3 h-3" />
                                  却下
                                </span>
                              )}
                            </div>
                            {community.description && (
                              <div className={`line-clamp-2 ${
                                isPrivate ? 'text-xs' : 'text-sm'
                              } ${
                                selectedCommunityId === community.id
                                  ? isPublic
                                    ? 'text-primary-foreground/80'
                                    : 'text-muted-foreground'
                                  : 'text-muted-foreground'
                              }`}>
                                {community.description}
                              </div>
                            )}
                            <div className={`text-sm flex items-center gap-1.5 mt-2 ${
                              selectedCommunityId === community.id
                                ? isPublic
                                  ? 'text-primary-foreground/90'
                                  : 'text-muted-foreground'
                                : 'text-muted-foreground'
                            }`}>
                              <Users className={`w-3.5 h-3.5 ${
                                selectedCommunityId === community.id
                                  ? isPublic
                                    ? 'text-primary-foreground/90'
                                    : 'text-muted-foreground'
                                  : 'text-muted-foreground'
                              }`} />
                              {loadingMemberCounts.has(community.id) ? (
                                <span className="text-xs">読み込み中...</span>
                              ) : (
                                <span>{communityMemberCounts.get(community.id) ?? 0}人</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                      {/* 参加・申請ボタン */}
                      {!isMember && !isPending && (
                        <div className="mt-3 pt-3 border-t border-border/20 flex justify-end">
                          {isPublic ? (
                            <button
                              onClick={() => {
                                setSelectedCommunityForJoin(community);
                                setShowNicknameModal(true);
                              }}
                              className="px-4 py-1.5 rounded-lg font-serif text-xs bg-primary/20 text-primary hover:bg-primary/30 transition-all duration-200 flex items-center gap-1.5 font-medium"
                            >
                              <Plus className="w-3 h-3" />
                              参加
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRequestPrivateCommunity(community.id)}
                              disabled={isLoading}
                              className="px-4 py-1.5 rounded-lg font-serif text-xs bg-primary/20 text-primary hover:bg-primary/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 font-medium"
                            >
                              {isLoading ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  <span>申請中...</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3 h-3" />
                                  申請
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground border border-border rounded-lg">
              <p className="font-serif text-sm">
                「{searchQuery}」に一致するコミュニティが見つかりませんでした
              </p>
            </div>
          )}

          {/* 検索結果の件数表示 */}
          {searchQuery.trim() && (
            <p className="text-xs text-muted-foreground font-serif">
              {filteredCommunities.length}件のコミュニティが見つかりました
            </p>
          )}
        </div>
      ) : (
        <div className="text-center space-y-2">
          <p className="font-serif text-sm text-muted-foreground">
            まだコミュニティがありません
          </p>
        </div>
      )}

      <div className="border-t border-border pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="w-5 h-5 text-primary" />
          <h2 className="font-serif text-xl font-semibold text-foreground">新しいコミュニティを作成</h2>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="group relative w-full px-6 py-4 rounded-xl font-serif text-base bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] font-medium"
        >
          <Plus className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" />
          <span>コミュニティを作成</span>
        </button>
      </div>

      {/* 作成モーダル */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreateModal(false)}>
          <div className="bg-background border border-border rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-serif text-xl font-semibold text-foreground mb-4">
              新しいコミュニティを作成
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block font-serif text-sm text-foreground mb-2">
                  コミュニティ名 <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={newCommunityName}
                  onChange={(e) => setNewCommunityName(e.target.value)}
                  placeholder="例: 秋田ローカル"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground font-serif focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
              </div>

              <div>
                <label className="block font-serif text-sm text-foreground mb-2">
                  説明（任意）
                </label>
                <textarea
                  value={newCommunityDescription}
                  onChange={(e) => setNewCommunityDescription(e.target.value)}
                  placeholder="このコミュニティについて説明してください"
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground font-serif focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <div>
                <label className="block font-serif text-sm text-foreground mb-2">
                  公開設定 <span className="text-destructive">*</span>
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="communityVisibility"
                      value="public"
                      checked={newCommunityIsPublic === true}
                      onChange={() => setNewCommunityIsPublic(true)}
                      className="w-4 h-4 text-primary focus:ring-primary"
                    />
                    <div className="flex-1">
                      <div className="font-serif text-sm font-semibold text-foreground">公開コミュニティ</div>
                      <div className="font-serif text-xs text-muted-foreground">誰でも参加できます</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="communityVisibility"
                      value="private"
                      checked={newCommunityIsPublic === false}
                      onChange={() => setNewCommunityIsPublic(false)}
                      className="w-4 h-4 text-primary focus:ring-primary"
                    />
                    <div className="flex-1">
                      <div className="font-serif text-sm font-semibold text-foreground">非公開コミュニティ</div>
                      <div className="font-serif text-xs text-muted-foreground">申請制で、オーナーが承認が必要です</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewCommunityName('');
                  setNewCommunityDescription('');
                  setNewCommunityIsPublic(true);
                }}
                className="flex-1 px-4 py-2 rounded-lg font-serif text-sm bg-secondary/30 text-foreground hover:bg-secondary/50 transition-colors"
                disabled={creating}
              >
                キャンセル
              </button>
              <button
                onClick={handleCreateCommunity}
                disabled={creating || !newCommunityName.trim()}
                className="flex-1 px-4 py-2 rounded-lg font-serif text-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>作成中...</span>
                  </>
                ) : (
                  '作成'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ニックネーム入力モーダル（公開コミュニティ参加用） */}
      {showNicknameModal && selectedCommunityForJoin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => {
          setShowNicknameModal(false);
          setNickname('');
          setSelectedCommunityForJoin(null);
        }}>
          <div className="bg-background border border-border rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-serif text-xl font-semibold text-foreground mb-4">
              {selectedCommunityForJoin.name}に参加
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block font-serif text-sm text-foreground mb-2">
                  ニックネーム <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="例: たろう"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground font-serif focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                  maxLength={20}
                />
                <p className="mt-1 text-xs text-muted-foreground font-serif">
                  このコミュニティでの表示名になります
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowNicknameModal(false);
                  setNickname('');
                  setSelectedCommunityForJoin(null);
                }}
                className="flex-1 px-4 py-2 rounded-lg font-serif text-sm bg-secondary/30 text-foreground hover:bg-secondary/50 transition-colors"
                disabled={joining}
              >
                キャンセル
              </button>
              <button
                onClick={async () => {
                  if (!nickname.trim()) {
                    alert('ニックネームを入力してください');
                    return;
                  }

                  setJoining(true);
                  try {
                    // 匿名認証でサインイン（既にログインしている場合はそのまま）
                    let currentUser = user;
                    if (!currentUser) {
                      console.log('📝 匿名認証を開始します...');
                      const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously({
                        options: {
                          data: {
                            nickname: nickname.trim()
                          }
                        }
                      });
                      
                      if (anonError) {
                        console.error('❌ 匿名認証エラー:', anonError);
                        console.error('エラーコード:', anonError.code);
                        console.error('エラーメッセージ:', anonError.message);
                        console.error('エラー詳細:', JSON.stringify(anonError, null, 2));
                        
                        // より詳細なエラーメッセージを表示
                        let errorMessage = '認証に失敗しました。';
                        if (anonError.message?.includes('Anonymous sign-ins are disabled')) {
                          errorMessage = '匿名認証が有効になっていません。Supabaseの設定で匿名認証を有効にしてください。';
                        } else if (anonError.message) {
                          errorMessage = `認証エラー: ${anonError.message}`;
                        }
                        alert(errorMessage);
                        setJoining(false);
                        return;
                      }
                      
                      if (!anonData.user) {
                        console.error('❌ ユーザーデータが取得できませんでした');
                        alert('認証に失敗しました。ユーザーデータが取得できませんでした。');
                        setJoining(false);
                        return;
                      }
                      
                      console.log('✅ 匿名認証成功:', anonData.user.id);
                      currentUser = anonData.user;
                      setUser(anonData.user);
                    } else {
                      console.log('📝 既にログイン済み。ニックネームを更新します...');
                      // 既にログインしている場合、ニックネームを更新
                      const { error: updateError } = await supabase.auth.updateUser({
                        data: { nickname: nickname.trim() }
                      });
                      if (updateError) {
                        console.error('❌ ニックネーム更新エラー:', updateError);
                        console.error('エラー詳細:', JSON.stringify(updateError, null, 2));
                        // ニックネーム更新に失敗しても参加は続行
                      } else {
                        console.log('✅ ニックネーム更新成功');
                      }
                    }

                    // コミュニティに参加（ニックネームを渡す）
                    console.log('📝 コミュニティに参加します:', selectedCommunityForJoin.id, 'ニックネーム:', nickname.trim());
                    const success = await joinPublicCommunity(selectedCommunityForJoin.id, nickname.trim());
                    if (success) {
                      console.log('✅ 参加成功');
                      await loadAllMemberships();
                      setShowNicknameModal(false);
                      setNickname('');
                      setSelectedCommunityForJoin(null);
                      onCommunityChange(selectedCommunityForJoin.id);
                    } else {
                      console.error('❌ 参加に失敗しました');
                      alert('参加に失敗しました。コンソールのエラー詳細を確認してください。');
                    }
                  } catch (error) {
                    console.error('エラー:', error);
                    alert('エラーが発生しました');
                  } finally {
                    setJoining(false);
                  }
                }}
                disabled={joining || !nickname.trim()}
                className="flex-1 px-4 py-2 rounded-lg font-serif text-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {joining ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>参加中...</span>
                  </>
                ) : (
                  '参加する'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
