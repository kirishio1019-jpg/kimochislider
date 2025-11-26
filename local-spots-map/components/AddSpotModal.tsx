"use client"

import { useState, useEffect } from 'react';
import { Category, CATEGORY_LABELS } from '@/types';
import { createSpot } from '@/lib/supabase';
import { Loader2, X, Search, MapPin } from 'lucide-react';

interface AddSpotModalProps {
  isOpen: boolean;
  onClose: () => void;
  latitude: number;
  longitude: number;
  communityId: string;
  onSpotCreated: () => void;
  onLocationChange?: (latitude: number, longitude: number) => void;
}

interface SearchResult {
  place_name: string;
  center: [number, number]; // [longitude, latitude]
}

export default function AddSpotModal({
  isOpen,
  onClose,
  latitude: initialLatitude,
  longitude: initialLongitude,
  communityId,
  onSpotCreated,
  onLocationChange,
}: AddSpotModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('culture');
  const [imageUrl, setImageUrl] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [latitude, setLatitude] = useState(initialLatitude);
  const [longitude, setLongitude] = useState(initialLongitude);

  const categories: Category[] = ['restaurant', 'shop', 'culture'];

  // モーダルが開かれたときに位置をリセット
  useEffect(() => {
    if (isOpen) {
      setLatitude(initialLatitude);
      setLongitude(initialLongitude);
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [isOpen, initialLatitude, initialLongitude]);

  // 場所検索
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!mapboxToken) {
        console.error('Mapboxトークンが設定されていません');
        return;
      }

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxToken}&country=jp&language=ja&limit=5`
      );

      if (!response.ok) {
        throw new Error('検索に失敗しました');
      }

      const data = await response.json();
      setSearchResults(data.features || []);
    } catch (error) {
      console.error('場所検索エラー:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // 検索結果を選択
  const handleSelectResult = (result: SearchResult) => {
    const [lng, lat] = result.center;
    setLatitude(lat);
    setLongitude(lng);
    setSearchQuery(result.place_name);
    setSearchResults([]);
    
    if (onLocationChange) {
      onLocationChange(lat, lng);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('スポット名を入力してください');
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
      openingHours.trim() || undefined
    );

    if (newSpot) {
      // フォームをリセット
      setName('');
      setDescription('');
      setCategory('culture');
      setImageUrl('');
      setOpeningHours('');
      setSearchQuery('');
      setSearchResults([]);
      onSpotCreated();
      onClose();
    } else {
      alert('スポットの作成に失敗しました');
    }
    setCreating(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-background border border-border rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-xl font-semibold text-foreground">
            新しいスポットを追加
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            disabled={creating}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 場所検索 */}
          <div>
            <label className="block font-serif text-sm text-foreground mb-2">
              場所を検索 <span className="text-muted-foreground text-xs">（地図上でクリックしても選択できます）</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                placeholder="例: 秋田市 国際教養大学"
                className="w-full px-4 py-2 pl-10 rounded-lg border border-border bg-background text-foreground font-serif focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={creating}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              {searching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
            {searchResults.length > 0 && (
              <div className="mt-2 border border-border rounded-lg bg-background max-h-48 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelectResult(result)}
                    className="w-full px-4 py-2 text-left hover:bg-secondary/30 transition-colors border-b border-border last:border-b-0 flex items-start gap-2"
                  >
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="font-serif text-sm text-foreground">{result.place_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 説明 */}
          <div className="bg-secondary/30 border border-border rounded-lg p-3">
            <p className="font-serif text-xs text-foreground flex items-start gap-2">
              <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <span>地図上でクリックした位置、または検索で選択した場所にスポットが追加されます。</span>
            </p>
          </div>

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
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground font-serif focus:outline-none focus:ring-2 focus:ring-primary"
              required
              disabled={creating}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
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

          <div className="pt-2">
            <p className="text-xs text-muted-foreground font-serif mb-2">
              位置: 緯度 {latitude.toFixed(6)}, 経度 {longitude.toFixed(6)}
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg font-serif text-sm bg-secondary/30 text-foreground hover:bg-secondary/50 transition-colors"
              disabled={creating}
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={creating || !name.trim()}
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
        </form>
      </div>
    </div>
  );
}

