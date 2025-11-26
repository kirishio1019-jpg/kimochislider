"use client"

import { useState, useEffect } from 'react';
import { Category, CategoryItem, DEFAULT_CATEGORY_LABELS } from '@/types';
import { createSpot, getCategories } from '@/lib/supabase';
import { Loader2, MapPin, Plus } from 'lucide-react';

interface SpotAddFormProps {
  communityId: string | null;
  mapId?: string | null;
  selectedLocation: { lat: number; lng: number } | null;
  onSpotCreated: () => void;
  onLocationSelect?: (latitude: number, longitude: number, name?: string) => void;
  categoriesKey?: number; // カテゴリが変更されたときに再読み込みするためのキー
}

export default function SpotAddForm({
  communityId,
  mapId,
  selectedLocation,
  onSpotCreated,
  onLocationSelect,
  categoriesKey,
}: SpotAddFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('');
  const [imageUrl, setImageUrl] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [creating, setCreating] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // カテゴリを読み込む
  useEffect(() => {
    const loadCategories = async () => {
      if (communityId) {
        try {
          setLoadingCategories(true);
          const data = await getCategories(communityId);
          setCategories(data);
          // カテゴリが更新された場合、選択中のカテゴリが存在するか確認
          if (data.length > 0) {
            const selectedCategoryExists = data.some(cat => cat.slug === category);
            if (!category || !selectedCategoryExists) {
              setCategory(data[0].slug); // 最初のカテゴリを選択
            }
          } else {
            setCategory(''); // カテゴリがない場合は空にする
          }
        } catch (error) {
          console.error('カテゴリの読み込みエラー:', error);
          setCategories([]);
        } finally {
          setLoadingCategories(false);
        }
      }
    };
    loadCategories();
  }, [communityId, categoriesKey]);

  // 選択された位置が変更されたときに更新
  useEffect(() => {
    if (selectedLocation) {
      setLatitude(selectedLocation.lat);
      setLongitude(selectedLocation.lng);
      setShowForm(true);
    }
  }, [selectedLocation]);

  // 位置が選択されたときにフォームを表示
  useEffect(() => {
    if (latitude !== null && longitude !== null) {
      setShowForm(true);
    }
  }, [latitude, longitude]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!communityId) {
      alert('コミュニティを選択してください');
      return;
    }

    if (!name.trim()) {
      alert('スポット名を入力してください');
      return;
    }

    if (latitude === null || longitude === null) {
      alert('場所を選択してください。地図上をクリックして位置を選択してください。');
      return;
    }

    setCreating(true);
    const newSpot = await createSpot(
      name.trim(),
      description.trim(),
      category,
      latitude,
      longitude,
      communityId,
      imageUrl.trim() || undefined,
      openingHours.trim() || undefined,
      mapId || undefined
    );

    if (newSpot) {
      // フォームをリセット
      setName('');
      setDescription('');
      setCategory('culture');
      setImageUrl('');
      setOpeningHours('');
      setLatitude(null);
      setLongitude(null);
      setShowForm(false);
      onSpotCreated();
    } else {
      alert('スポットの作成に失敗しました');
    }
    setCreating(false);
  };

  if (!communityId) {
    return (
      <div className="bg-secondary/30 border border-border rounded-lg p-4">
        <p className="font-serif text-sm text-muted-foreground">
          コミュニティを選択すると、スポットを追加できます。
        </p>
      </div>
    );
  }

  return (
    <div className="bg-background border border-border rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-semibold text-foreground">
          新しいスポットを追加
        </h3>
        {showForm && (
          <button
            onClick={() => {
              setShowForm(false);
              setName('');
              setDescription('');
              setCategory('culture');
              setImageUrl('');
              setOpeningHours('');
              setLatitude(null);
              setLongitude(null);
            }}
            className="text-muted-foreground hover:text-foreground transition-colors font-serif text-sm"
          >
            キャンセル
          </button>
        )}
      </div>

      {/* 説明 */}
      <div className="bg-secondary/30 border border-border rounded-lg p-3">
        <p className="font-serif text-xs text-foreground flex items-start gap-2">
          <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <span>地図上でクリックした位置にスポットが追加されます。</span>
        </p>
      </div>

      {/* 位置表示 */}
      {latitude !== null && longitude !== null && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
          <p className="font-serif text-xs text-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
            <span>選択された位置: 緯度 {latitude.toFixed(6)}, 経度 {longitude.toFixed(6)}</span>
          </p>
        </div>
      )}

      {/* フォーム */}
      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-border">
          <div>
            <label className="block font-serif text-sm text-foreground mb-2">
              スポット名 <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 国際教養大学"
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground font-serif focus:outline-none focus:ring-2 focus:ring-primary"
              required
              disabled={creating}
            />
          </div>

          <div>
            <label className="block font-serif text-sm text-foreground mb-2">
              説明
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="このスポットについて説明してください"
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground font-serif focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              disabled={creating}
            />
          </div>

          <div>
            <label className="block font-serif text-sm text-foreground mb-2">
              カテゴリ <span className="text-destructive">*</span>
            </label>
            {loadingCategories ? (
              <div className="w-full px-4 py-2 rounded-lg border border-border bg-secondary/30 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground font-serif">読み込み中...</span>
              </div>
            ) : categories.length === 0 ? (
              <div className="w-full px-4 py-2 rounded-lg border border-border bg-secondary/30">
                <span className="text-sm text-muted-foreground font-serif">カテゴリがありません。カテゴリ管理から追加してください。</span>
              </div>
            ) : (
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground font-serif focus:outline-none focus:ring-2 focus:ring-primary"
                required
                disabled={creating}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block font-serif text-sm text-foreground mb-2">
              画像URL（任意）
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground font-serif focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={creating}
            />
          </div>

          <div>
            <label className="block font-serif text-sm text-foreground mb-2">
              営業時間（任意）
            </label>
            <input
              type="text"
              value={openingHours}
              onChange={(e) => setOpeningHours(e.target.value)}
              placeholder="例: 9:00-18:00"
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground font-serif focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={creating}
            />
          </div>

          <button
            type="submit"
            disabled={creating || !name.trim() || latitude === null || longitude === null}
            className="w-full px-4 py-2 rounded-lg font-serif text-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>作成中...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>スポットを追加</span>
              </>
            )}
          </button>
        </form>
      )}

      {!showForm && latitude === null && longitude === null && (
        <div className="text-center py-4">
          <p className="font-serif text-sm text-muted-foreground">
            地図上をクリックして位置を選択してください
          </p>
        </div>
      )}
    </div>
  );
}
