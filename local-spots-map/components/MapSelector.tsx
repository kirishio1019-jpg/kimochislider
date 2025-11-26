"use client"

import { useState, useEffect, useCallback } from 'react';
import { Map } from '@/types';
import { getMaps, createMap, updateMap, deleteMap } from '@/lib/supabase';
import { Plus, Edit2, Trash2, Loader2, X, Check, ChevronDown, ChevronUp } from 'lucide-react';

interface MapSelectorProps {
  communityId: string | null;
  selectedMapId: string | null;
  onMapChange: (mapId: string | null) => void;
  isOwner?: boolean; // コミュニティオーナーかどうか
}

export default function MapSelector({
  communityId,
  selectedMapId,
  onMapChange,
  isOwner = false,
}: MapSelectorProps) {
  const [maps, setMaps] = useState<Map[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMap, setEditingMap] = useState<Map | null>(null);
  const [newMapName, setNewMapName] = useState('');
  const [newMapDescription, setNewMapDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deletingMapId, setDeletingMapId] = useState<string | null>(null);
  const [showAllMaps, setShowAllMaps] = useState(false); // すべての地図を表示するかどうか

  const loadMaps = useCallback(async () => {
    if (!communityId) return;
    setLoading(true);
    try {
      const data = await getMaps(communityId);
      // 地図が存在しない場合、またはデフォルト地図が存在しない場合のみデフォルト地図を自動作成
      const hasDefaultMap = data.some(m => m.name === 'デフォルト地図');
      if (data.length === 0 || !hasDefaultMap) {
        try {
          console.log('📝 デフォルト地図を作成します...', { communityId, existingMaps: data.length, hasDefaultMap });
          const defaultMap = await createMap(communityId, 'デフォルト地図', 'このコミュニティのデフォルト地図です');
          if (defaultMap) {
            console.log('✅ デフォルト地図作成成功:', defaultMap.id);
            // 既存の地図と新しいデフォルト地図を結合
            const updatedMaps = [...data, defaultMap];
            setMaps(updatedMaps);
            // デフォルト地図を選択
            onMapChange(defaultMap.id);
            return;
          } else {
            console.warn('⚠️ デフォルト地図の作成に失敗しました（nullが返されました）');
            console.warn('💡 解決方法: SupabaseのSQL Editorで fix-maps-create-policy.sql を実行してください');
          }
        } catch (createError) {
          console.error('❌ デフォルト地図の作成エラー:', createError);
          console.error('💡 解決方法: SupabaseのSQL Editorで fix-maps-create-policy.sql を実行してください');
        }
      }
      setMaps(data);
      
      // selectedMapIdが既に設定されていて、その地図が存在する場合はそれを選択
      if (selectedMapId) {
        const savedMap = data.find(m => m.id === selectedMapId);
        if (savedMap) {
          // 保存されていた地図が存在する場合はそれを選択（変更しない）
          return;
        }
      }
      
      // selectedMapIdがnullまたは存在しない地図IDの場合は、デフォルト地図を選択
      const defaultByName = data.find(m => m.name === 'デフォルト地図');
      const defaultMap = defaultByName || data.reduce((oldest, current) => {
        const oldestDate = oldest.created_at ? new Date(oldest.created_at).getTime() : 0;
        const currentDate = current.created_at ? new Date(current.created_at).getTime() : 0;
        return currentDate < oldestDate ? current : oldest;
      });
      
      // デフォルト地図を選択（selectedMapIdがnullの場合のみ）
      if (defaultMap && !selectedMapId) {
        onMapChange(defaultMap.id);
      } else if (data.length > 0 && !selectedMapId) {
        // デフォルト地図が見つからない場合は最初の地図を選択
        onMapChange(data[0].id);
      }
    } catch (error) {
      console.error('地図の読み込みエラー:', error);
    } finally {
      setLoading(false);
    }
  }, [communityId, selectedMapId, onMapChange]);

  useEffect(() => {
    if (communityId) {
      loadMaps();
    } else {
      setMaps([]);
      onMapChange(null);
    }
  }, [communityId, loadMaps, onMapChange]);

  const handleCreateMap = async () => {
    if (!communityId || !newMapName.trim()) return;
    setCreating(true);
    try {
      const newMap = await createMap(communityId, newMapName.trim(), newMapDescription.trim() || undefined);
      if (newMap) {
        await loadMaps();
        setNewMapName('');
        setNewMapDescription('');
        setShowCreateModal(false);
        onMapChange(newMap.id);
      }
    } catch (error) {
      console.error('地図の作成エラー:', error);
      alert('地図の作成に失敗しました');
    } finally {
      setCreating(false);
    }
  };

  const handleEditMap = async () => {
    if (!editingMap || !newMapName.trim()) return;
    setUpdating(true);
    try {
      const success = await updateMap(editingMap.id, newMapName.trim(), newMapDescription.trim() || undefined);
      if (success) {
        await loadMaps();
        setShowEditModal(false);
        setEditingMap(null);
        setNewMapName('');
        setNewMapDescription('');
      }
    } catch (error) {
      console.error('地図の更新エラー:', error);
      alert('地図の更新に失敗しました');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteMap = async (mapId: string) => {
    if (!confirm('この地図を削除しますか？地図内のスポットは削除されませんが、地図との紐づきが解除されます。')) {
      return;
    }
    setDeletingMapId(mapId);
    try {
      const success = await deleteMap(mapId);
      if (success) {
        await loadMaps();
        // 削除された地図が選択されていた場合はnullに設定
        if (selectedMapId === mapId) {
          onMapChange(null);
        }
      }
    } catch (error) {
      console.error('地図の削除エラー:', error);
      alert('地図の削除に失敗しました');
    } finally {
      setDeletingMapId(null);
    }
  };

  const openEditModal = (map: Map) => {
    setEditingMap(map);
    setNewMapName(map.name);
    setNewMapDescription(map.description || '');
    setShowEditModal(true);
  };

  // デフォルト地図を取得（最初に作成された地図、または名前が「デフォルト地図」のもの）
  const getDefaultMap = (): Map | null => {
    if (maps.length === 0) return null;
    // まず名前が「デフォルト地図」のものを探す
    const defaultByName = maps.find(m => m.name === 'デフォルト地図');
    if (defaultByName) return defaultByName;
    // なければ、作成日時が最も古いものをデフォルトとする
    return maps.reduce((oldest, current) => {
      const oldestDate = oldest.created_at ? new Date(oldest.created_at).getTime() : 0;
      const currentDate = current.created_at ? new Date(current.created_at).getTime() : 0;
      return currentDate < oldestDate ? current : oldest;
    });
  };

  const defaultMap = getDefaultMap();

  // デフォルト地図以外の地図をソート（作成日時の古い順）
  const sortedMaps = [...maps]
    .filter(map => !defaultMap || map.id !== defaultMap.id)
    .sort((a, b) => {
      const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
      return aDate - bDate;
    });

  // 表示する地図の数（デフォルト地図を含めて最大3つ）
  const MAX_DISPLAY_MAPS = 3;
  const displayMaps = showAllMaps ? sortedMaps : sortedMaps.slice(0, MAX_DISPLAY_MAPS - (defaultMap ? 1 : 0));
  const remainingMapsCount = sortedMaps.length - displayMaps.length;

  if (!communityId) {
    return null;
  }

  return (
    <div className="mb-4">
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          {/* デフォルト地図ボタン（一番左に配置） */}
          {defaultMap && (
            <button
              onClick={() => onMapChange(defaultMap.id)}
              className={`px-3 py-2 rounded-lg border transition-colors font-serif text-sm flex items-center gap-2 ${
                selectedMapId === defaultMap.id
                  ? 'bg-primary/20 border-primary text-primary'
                  : 'border-border bg-secondary/5 hover:bg-secondary/10 text-muted-foreground hover:text-foreground'
              }`}
              title="デフォルト地図に移動"
            >
              <span>デフォルト</span>
            </button>
          )}
          {/* 各地図ボタン（デフォルト地図を除く、最大表示数まで） */}
          {displayMaps.map((map) => (
            <div
              key={map.id}
              className={`relative group px-3 py-2 rounded-lg border transition-colors cursor-pointer ${
                selectedMapId === map.id
                  ? 'bg-primary/20 border-primary text-primary'
                  : 'bg-secondary/5 border-border hover:bg-secondary/10'
              }`}
              onClick={() => onMapChange(map.id)}
            >
              <div className="flex items-center gap-2">
                <span className="font-serif text-sm">{map.name}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(map);
                    }}
                    className="p-1 hover:bg-secondary/20 rounded transition-colors"
                    title="編集"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  {maps.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMap(map.id);
                      }}
                      disabled={deletingMapId === map.id}
                      className="p-1 hover:bg-destructive/20 rounded transition-colors disabled:opacity-50"
                      title="削除"
                    >
                      {deletingMapId === map.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {/* 残りの地図を表示するボタン */}
          {remainingMapsCount > 0 && (
            <button
              onClick={() => setShowAllMaps(!showAllMaps)}
              className="px-3 py-2 rounded-lg border border-border bg-secondary/5 hover:bg-secondary/10 transition-colors font-serif text-sm text-muted-foreground hover:text-foreground flex items-center gap-2"
            >
              {showAllMaps ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  <span>一覧を閉じる</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  <span>一覧を見る（他{remainingMapsCount}件）</span>
                </>
              )}
            </button>
          )}
          {/* 新規地図作成ボタン（オーナーのみ表示） */}
          {isOwner && (
            <button
              onClick={() => {
                setNewMapName('');
                setNewMapDescription('');
                setShowCreateModal(true);
              }}
              className="px-3 py-2 rounded-lg border border-dashed border-border bg-secondary/5 hover:bg-secondary/10 transition-colors font-serif text-sm text-muted-foreground hover:text-foreground flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>新規作成</span>
            </button>
          )}
        </div>
      )}

      {/* 地図作成モーダル */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border border-border rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-semibold text-foreground">新規地図を作成</h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewMapName('');
                  setNewMapDescription('');
                }}
                className="p-1 hover:bg-secondary/20 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block font-serif text-sm font-medium text-foreground mb-1">
                  地図名 <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={newMapName}
                  onChange={(e) => setNewMapName(e.target.value)}
                  placeholder="例: 秋田市観光マップ"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground font-serif focus:outline-none focus:ring-2 focus:ring-primary"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newMapName.trim()) {
                      handleCreateMap();
                    }
                  }}
                />
              </div>
              <div>
                <label className="block font-serif text-sm font-medium text-foreground mb-1">
                  説明（任意）
                </label>
                <textarea
                  value={newMapDescription}
                  onChange={(e) => setNewMapDescription(e.target.value)}
                  placeholder="この地図の説明を入力..."
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground font-serif resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewMapName('');
                    setNewMapDescription('');
                  }}
                  className="px-4 py-2 rounded font-serif text-sm bg-secondary/50 text-muted-foreground hover:bg-secondary/70 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleCreateMap}
                  disabled={!newMapName.trim() || creating}
                  className="px-4 py-2 rounded font-serif text-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>作成中...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>作成</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 地図編集モーダル */}
      {showEditModal && editingMap && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border border-border rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-semibold text-foreground">地図を編集</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingMap(null);
                  setNewMapName('');
                  setNewMapDescription('');
                }}
                className="p-1 hover:bg-secondary/20 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block font-serif text-sm font-medium text-foreground mb-1">
                  地図名 <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={newMapName}
                  onChange={(e) => setNewMapName(e.target.value)}
                  placeholder="例: 秋田市観光マップ"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground font-serif focus:outline-none focus:ring-2 focus:ring-primary"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newMapName.trim()) {
                      handleEditMap();
                    }
                  }}
                />
              </div>
              <div>
                <label className="block font-serif text-sm font-medium text-foreground mb-1">
                  説明（任意）
                </label>
                <textarea
                  value={newMapDescription}
                  onChange={(e) => setNewMapDescription(e.target.value)}
                  placeholder="この地図の説明を入力..."
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground font-serif resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingMap(null);
                    setNewMapName('');
                    setNewMapDescription('');
                  }}
                  className="px-4 py-2 rounded font-serif text-sm bg-secondary/50 text-muted-foreground hover:bg-secondary/70 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleEditMap}
                  disabled={!newMapName.trim() || updating}
                  className="px-4 py-2 rounded font-serif text-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {updating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>更新中...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>更新</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

