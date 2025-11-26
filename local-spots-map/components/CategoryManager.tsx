"use client"

import { useState, useEffect } from 'react';
import { CategoryItem } from '@/types';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/lib/supabase';
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react';

interface CategoryManagerProps {
  communityId: string | null;
  onCategoryChange?: () => void;
}

export default function CategoryManager({ communityId, onCategoryChange }: CategoryManagerProps) {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#6B7280');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, [communityId]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories(communityId || undefined);
      setCategories(data);
    } catch (error) {
      console.error('カテゴリの読み込みエラー:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      alert('カテゴリ名を入力してください');
      return;
    }

    setSaving(true);
    try {
      const newCategory = await createCategory(
        newCategoryName.trim(),
        newCategoryColor,
        communityId || undefined
      );

      if (newCategory) {
        await loadCategories();
        setShowCreateModal(false);
        setNewCategoryName('');
        setNewCategoryColor('#6B7280');
        if (onCategoryChange) onCategoryChange();
      } else {
        // エラーメッセージはcreateCategory内で表示される
        console.error('カテゴリの作成に失敗しました');
      }
    } catch (error) {
      console.error('カテゴリ作成中のエラー:', error);
      alert('カテゴリの作成中にエラーが発生しました');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !newCategoryName.trim()) {
      return;
    }

    setSaving(true);
    const updated = await updateCategory(
      editingCategory.id,
      newCategoryName.trim(),
      newCategoryColor
    );

    if (updated) {
      await loadCategories();
      setEditingCategory(null);
      setNewCategoryName('');
      setNewCategoryColor('#6B7280');
      if (onCategoryChange) onCategoryChange();
    } else {
      alert('カテゴリの更新に失敗しました');
    }
    setSaving(false);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('このカテゴリを削除してもよろしいですか？')) {
      return;
    }

    const success = await deleteCategory(categoryId);
    if (success) {
      await loadCategories();
      if (onCategoryChange) onCategoryChange();
    } else {
      alert('カテゴリの削除に失敗しました');
    }
  };

  const startEdit = (category: CategoryItem) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryColor(category.color);
    setShowCreateModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground font-serif">読み込み中...</span>
      </div>
    );
  }

  // カテゴリが0件の場合でも、追加ボタンは表示する

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-semibold text-foreground">カテゴリ管理</h3>
        <button
          onClick={() => {
            setEditingCategory(null);
            setNewCategoryName('');
            setNewCategoryColor('#6B7280');
            setShowCreateModal(true);
          }}
          className="px-4 py-2 rounded-lg font-serif text-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>追加</span>
        </button>
      </div>

      {/* 作成/編集フォーム（左側サイドバー内に表示） */}
      {showCreateModal && (
        <div className="bg-secondary/30 border border-border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-serif text-base font-semibold text-foreground">
              {editingCategory ? 'カテゴリを編集' : '新しいカテゴリを作成'}
            </h4>
            <button
              onClick={() => {
                setShowCreateModal(false);
                setEditingCategory(null);
                setNewCategoryName('');
                setNewCategoryColor('#6B7280');
              }}
              className="text-muted-foreground hover:text-foreground transition-colors"
              disabled={saving}
            >
              ×
            </button>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block font-serif text-xs text-foreground mb-1">
                カテゴリ名 <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="例: カフェ"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground font-serif text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
                disabled={saving}
              />
            </div>

            <div>
              <label className="block font-serif text-xs text-foreground mb-1">
                色 <span className="text-destructive">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={newCategoryColor}
                  onChange={(e) => setNewCategoryColor(e.target.value)}
                  className="w-12 h-8 rounded border border-border cursor-pointer"
                  disabled={saving}
                />
                <input
                  type="text"
                  value={newCategoryColor}
                  onChange={(e) => setNewCategoryColor(e.target.value)}
                  placeholder="#6B7280"
                  className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground font-serif text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={saving}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowCreateModal(false);
                setEditingCategory(null);
                setNewCategoryName('');
                setNewCategoryColor('#6B7280');
              }}
              className="flex-1 px-3 py-2 rounded-lg font-serif text-xs bg-secondary/50 text-foreground hover:bg-secondary/70 transition-colors"
              disabled={saving}
            >
              キャンセル
            </button>
            <button
              onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}
              disabled={saving || !newCategoryName.trim()}
              className="flex-1 px-3 py-2 rounded-lg font-serif text-xs bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>保存中...</span>
                </>
              ) : (
                editingCategory ? '更新' : '作成'
              )}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground font-serif">カテゴリがありません</p>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: category.color }}
                />
                <span className="font-serif text-sm text-foreground">{category.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => startEdit(category)}
                  className="p-2 hover:bg-secondary/50 rounded transition-colors"
                  title="編集"
                >
                  <Edit2 className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="p-2 hover:bg-secondary/50 rounded transition-colors"
                  title="削除"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

