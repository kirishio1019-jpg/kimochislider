"use client"

import { LocalSpot, Category, CategoryItem, SpotComment } from '@/types';
import { useState, useEffect, useMemo } from 'react';
import { getCategories, updateSpotCategory, getSpotComments, addSpotComment, deleteSpotComment } from '@/lib/supabase';
import { MessageSquare, Send, X, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

type SortMode = 'latest' | 'trending';

interface RankingListV0Props {
  spots: LocalSpot[];
  selectedCategory: Category | null;
  onSpotClick: (spot: LocalSpot) => void;
  onSpotUpdate?: (updatedSpot: LocalSpot) => void;
  communityId?: string | null;
}

export default function RankingListV0({ spots, selectedCategory, onSpotClick, onSpotUpdate, communityId }: RankingListV0Props) {
  const [sortMode, setSortMode] = useState<SortMode>('latest');
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [editingCategorySpotId, setEditingCategorySpotId] = useState<string | null>(null);
  const [editingCommentSpotId, setEditingCommentSpotId] = useState<string | null>(null);
  const [commentTexts, setCommentTexts] = useState<Map<string, string>>(new Map());
  const [savingCommentSpotId, setSavingCommentSpotId] = useState<string | null>(null);
  const [spotComments, setSpotComments] = useState<Map<string, SpotComment[]>>(new Map());
  const [loadingComments, setLoadingComments] = useState<Set<string>>(new Set());
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [showAllCommentsSpotId, setShowAllCommentsSpotId] = useState<string | null>(null);

  // カテゴリでフィルタリングしてソート
  const filteredSpots = useMemo(() => {
    let filtered = spots.filter((spot) => !selectedCategory || spot.category === selectedCategory);
    
    // ソートモードに応じてソート
    if (sortMode === 'latest') {
      // 最新追加順（created_atの降順）
      filtered = filtered.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
    } else if (sortMode === 'trending') {
      // いまきてる順（trend_scoreの降順、同じ場合はいいね数の降順）
      filtered = filtered.sort((a, b) => {
        const scoreA = a.trend_score ?? 0;
        const scoreB = b.trend_score ?? 0;
        if (scoreB !== scoreA) {
          return scoreB - scoreA;
        }
        const likesA = a.likes ?? 0;
        const likesB = b.likes ?? 0;
        return likesB - likesA;
      });
    }
    
    return filtered;
  }, [spots, selectedCategory, sortMode]);

  // カテゴリを読み込む
  useEffect(() => {
    const loadCategories = async () => {
      if (communityId) {
        const data = await getCategories(communityId);
        setCategories(data);
      }
    };
    loadCategories();
  }, [communityId]);

  const handleCategoryChange = async (spotId: string, newCategorySlug: string) => {
    const success = await updateSpotCategory(spotId, newCategorySlug);
    if (success && onSpotUpdate) {
      const updatedSpot = spots.find(s => s.id === spotId);
      if (updatedSpot) {
        const updated = { ...updatedSpot, category: newCategorySlug };
        onSpotUpdate(updated);
      }
    }
    setEditingCategorySpotId(null);
  };

  const getCategoryName = (categorySlug: string) => {
    const category = categories.find(c => c.slug === categorySlug);
    return category ? category.name : categorySlug;
  };

  // コメントを読み込む
  const loadComments = async (spotId: string) => {
    if (loadingComments.has(spotId)) return;
    setLoadingComments(prev => new Set(prev).add(spotId));
    try {
      const comments = await getSpotComments(spotId);
      setSpotComments(prev => {
        const newMap = new Map(prev);
        newMap.set(spotId, comments);
        return newMap;
      });
    } catch (error) {
      console.error('コメントの読み込みエラー:', error);
    } finally {
      setLoadingComments(prev => {
        const newSet = new Set(prev);
        newSet.delete(spotId);
        return newSet;
      });
    }
  };

  // 日時をフォーマット
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'たった今';
    if (diffMins < 60) return `${diffMins}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 7) return `${diffDays}日前`;
    
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // コメントを追加
  const handleAddComment = async (spotId: string, comment: string) => {
    if (!comment.trim()) return;
    
    setSavingCommentSpotId(spotId);
    try {
      const newComment = await addSpotComment(spotId, comment.trim());
      if (newComment) {
        // コメント一覧を更新
        await loadComments(spotId);
        // 入力欄をクリア
        setEditingCommentSpotId(null);
        const newMap = new Map(commentTexts);
        newMap.delete(spotId);
        setCommentTexts(newMap);
      } else {
        alert('コメントの送信に失敗しました');
      }
    } catch (error) {
      console.error('コメントの送信エラー:', error);
      alert('コメントの送信中にエラーが発生しました');
    } finally {
      setSavingCommentSpotId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* ソートモード切り替えタブ */}
      <div className="flex gap-2 border-b border-border/40 pb-2">
        <button
          onClick={() => setSortMode('latest')}
          className={`px-4 py-2 rounded-lg font-serif text-sm font-medium transition-colors ${
            sortMode === 'latest'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary/50 text-muted-foreground hover:bg-secondary/70'
          }`}
        >
          最新
        </button>
        <button
          onClick={() => setSortMode('trending')}
          className={`px-4 py-2 rounded-lg font-serif text-sm font-medium transition-colors ${
            sortMode === 'trending'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary/50 text-muted-foreground hover:bg-secondary/70'
          }`}
        >
          ホット
        </button>
      </div>

      {filteredSpots.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground font-serif">
          <p className="mb-2">まだスポットがありません</p>
          <p className="text-sm">新しいスポットを追加してください</p>
        </div>
      ) : (
        filteredSpots.map((spot) => {
          const likes = spot.likes ?? 0;
          const isEditingCategory = editingCategorySpotId === spot.id;
          
          return (
            <div
              key={spot.id}
              className="group border-b border-border pb-6 transition-all duration-300"
            >
              <div className="space-y-4">
                <div 
                  className="relative overflow-hidden rounded-lg h-56 bg-secondary/10 cursor-pointer"
                  onClick={() => onSpotClick(spot)}
                >
                  {spot.image_url ? (
                    <img
                      src={spot.image_url}
                      alt={spot.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary/20">
                      <span className="text-muted-foreground font-serif">画像なし</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <h3 
                      className="font-serif text-2xl font-semibold text-foreground leading-tight cursor-pointer"
                      onClick={() => onSpotClick(spot)}
                    >
                      {spot.name}
                    </h3>
                    {isEditingCategory ? (
                      <select
                        value={spot.category}
                        onChange={(e) => handleCategoryChange(spot.id, e.target.value)}
                        onBlur={() => setEditingCategorySpotId(null)}
                        className="text-xs bg-background border border-border text-foreground px-3 py-1.5 rounded-full font-serif focus:outline-none focus:ring-2 focus:ring-primary"
                        autoFocus
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.slug}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCategorySpotId(spot.id);
                        }}
                        className="text-xs bg-secondary/40 text-foreground px-3 py-1.5 rounded-full font-serif hover:bg-secondary/60 transition-colors"
                        title="カテゴリを変更"
                      >
                        {getCategoryName(spot.category)}
                      </button>
                    )}
                  </div>

                  {spot.description && (
                    <p 
                      className="font-serif text-base text-muted-foreground leading-relaxed cursor-pointer"
                      onClick={() => onSpotClick(spot)}
                    >
                      {spot.description}
                    </p>
                  )}

                  <div className="flex items-center gap-6 text-sm text-muted-foreground font-serif pt-3">
                    <div className="flex items-center gap-2">
                      <span>❤️</span>
                      <span className="font-semibold">{likes}</span>
                    </div>
                  </div>

                  {/* コメントセクション */}
                  <div className="pt-3 border-t border-border/40">
                    {/* コメントがまだ読み込まれていない場合は読み込む */}
                    {(() => {
                      if (!spotComments.has(spot.id) && !loadingComments.has(spot.id)) {
                        loadComments(spot.id);
                      }
                      return null;
                    })()}
                    
                    {/* 最新のコメント1つだけ表示 */}
                    {(() => {
                      const comments = spotComments.get(spot.id) || [];
                      const commentCount = comments.length;
                      const latestComment = commentCount > 0 ? comments[comments.length - 1] : null;
                      
                      if (!latestComment) return null;
                      
                      return (
                        <div className="mb-3">
                          <div className="flex items-start gap-2 group">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-serif text-xs font-semibold text-foreground">
                                  {latestComment.user_id ? `ユーザー${latestComment.user_id.slice(0, 8)}` : '匿名ユーザー'}
                                </span>
                                <span className="font-serif text-xs text-muted-foreground">
                                  {formatDateTime(latestComment.created_at)}
                                </span>
                              </div>
                              <div className="px-3 py-2 bg-secondary/20 rounded-lg inline-block">
                                <p className="font-serif text-sm text-foreground whitespace-pre-wrap break-words">
                                  {latestComment.comment}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (confirm('このコメントを削除しますか？')) {
                                  setDeletingCommentId(latestComment.id);
                                  try {
                                    const success = await deleteSpotComment(latestComment.id);
                                    if (success) {
                                      await loadComments(spot.id);
                                    } else {
                                      alert('コメントの削除に失敗しました');
                                    }
                                  } catch (error) {
                                    console.error('コメントの削除エラー:', error);
                                    alert('コメントの削除中にエラーが発生しました');
                                  } finally {
                                    setDeletingCommentId(null);
                                  }
                                }
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/20 rounded"
                              title="削除"
                            >
                              {deletingCommentId === latestComment.id ? (
                                <span className="animate-spin text-xs">⏳</span>
                              ) : (
                                <Trash2 className="w-3 h-3 text-destructive" />
                              )}
                            </button>
                          </div>
                          
                          {/* コメントが2件以上ある場合は「一覧を見る」ボタンを表示 */}
                          {commentCount > 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (showAllCommentsSpotId === spot.id) {
                                  setShowAllCommentsSpotId(null);
                                } else {
                                  setShowAllCommentsSpotId(spot.id);
                                  if (!spotComments.has(spot.id)) {
                                    loadComments(spot.id);
                                  }
                                }
                              }}
                              className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline font-serif"
                            >
                              {showAllCommentsSpotId === spot.id ? (
                                <>
                                  <ChevronUp className="w-3 h-3" />
                                  <span>一覧を閉じる</span>
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-3 h-3" />
                                  <span>一覧を見る（他{commentCount - 1}件）</span>
                                </>
                              )}
                            </button>
                          )}
                          
                          {/* 一覧を展開表示 */}
                          {showAllCommentsSpotId === spot.id && commentCount > 1 && (
                            <div className="mt-3 space-y-2 max-h-64 overflow-y-auto border-t border-border/40 pt-3">
                              {spotComments.get(spot.id)!.slice(0, -1).reverse().map((comment) => (
                                <div key={comment.id} className="flex items-start gap-2 group">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-serif text-xs font-semibold text-foreground">
                                        {comment.user_id ? `ユーザー${comment.user_id.slice(0, 8)}` : '匿名ユーザー'}
                                      </span>
                                      <span className="font-serif text-xs text-muted-foreground">
                                        {formatDateTime(comment.created_at)}
                                      </span>
                                    </div>
                                    <div className="px-3 py-2 bg-secondary/20 rounded-lg inline-block">
                                      <p className="font-serif text-sm text-foreground whitespace-pre-wrap break-words">
                                        {comment.comment}
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      if (confirm('このコメントを削除しますか？')) {
                                        setDeletingCommentId(comment.id);
                                        try {
                                          const success = await deleteSpotComment(comment.id);
                                          if (success) {
                                            await loadComments(spot.id);
                                            // コメントが1件以下になったら一覧を閉じる
                                            const updatedComments = await getSpotComments(spot.id);
                                            if (updatedComments.length <= 1) {
                                              setShowAllCommentsSpotId(null);
                                            }
                                          } else {
                                            alert('コメントの削除に失敗しました');
                                          }
                                        } catch (error) {
                                          console.error('コメントの削除エラー:', error);
                                          alert('コメントの削除中にエラーが発生しました');
                                        } finally {
                                          setDeletingCommentId(null);
                                        }
                                      }
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/20 rounded"
                                    title="削除"
                                  >
                                    {deletingCommentId === comment.id ? (
                                      <span className="animate-spin text-xs">⏳</span>
                                    ) : (
                                      <Trash2 className="w-3 h-3 text-destructive" />
                                    )}
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* コメント入力欄 */}
                    {editingCommentSpotId === spot.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={commentTexts.get(spot.id) ?? ''}
                          onChange={(e) => {
                            const newMap = new Map(commentTexts);
                            newMap.set(spot.id, e.target.value);
                            setCommentTexts(newMap);
                          }}
                          placeholder="コメントを入力..."
                          rows={2}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground font-serif text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                              e.preventDefault();
                              const comment = commentTexts.get(spot.id) ?? '';
                              if (comment.trim()) {
                                handleAddComment(spot.id, comment);
                              }
                            }
                          }}
                        />
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => {
                              setEditingCommentSpotId(null);
                              const newMap = new Map(commentTexts);
                              newMap.delete(spot.id);
                              setCommentTexts(newMap);
                            }}
                            className="px-3 py-1.5 rounded font-serif text-xs bg-secondary/50 text-muted-foreground hover:bg-secondary/70 transition-colors flex items-center gap-1.5"
                          >
                            <X className="w-3 h-3" />
                            <span>キャンセル</span>
                          </button>
                          <button
                            onClick={() => {
                              const comment = commentTexts.get(spot.id) ?? '';
                              if (comment.trim()) {
                                handleAddComment(spot.id, comment);
                              }
                            }}
                            disabled={savingCommentSpotId === spot.id || !commentTexts.get(spot.id)?.trim()}
                            className="px-3 py-1.5 rounded font-serif text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                          >
                            {savingCommentSpotId === spot.id ? (
                              <>
                                <span className="animate-spin">⏳</span>
                                <span>送信中...</span>
                              </>
                            ) : (
                              <>
                                <Send className="w-3 h-3" />
                                <span>送信</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCommentSpotId(spot.id);
                          if (!commentTexts.has(spot.id)) {
                            const newMap = new Map(commentTexts);
                            newMap.set(spot.id, '');
                            setCommentTexts(newMap);
                          }
                          // コメントがまだ読み込まれていない場合は読み込む
                          if (!spotComments.has(spot.id)) {
                            loadComments(spot.id);
                          }
                        }}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-serif"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>コメントする</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}

    </div>
  );
}


