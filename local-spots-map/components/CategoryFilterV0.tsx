"use client"

import { useState, useEffect } from 'react';
import { Category, CategoryItem } from '@/types';
import { getCategories } from '@/lib/supabase';

interface CategoryFilterV0Props {
  selectedCategory: Category | null;
  onCategoryChange: (category: Category | null) => void;
  communityId?: string | null;
}

export default function CategoryFilterV0({ selectedCategory, onCategoryChange, communityId }: CategoryFilterV0Props) {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      if (communityId) {
        setLoading(true);
        try {
          const data = await getCategories(communityId);
          setCategories(data);
        } catch (error) {
          console.error('カテゴリの読み込みエラー:', error);
          setCategories([]);
        } finally {
          setLoading(false);
        }
      } else {
        setCategories([]);
      }
    };
    loadCategories();
  }, [communityId]);

  return (
    <div className="flex gap-3 flex-wrap">
      {/* すべて */}
      <button
        onClick={() => onCategoryChange(null)}
        className={`px-5 py-2 rounded-full font-serif text-xs transition-all duration-300 ${
          selectedCategory === null
            ? "bg-primary text-primary-foreground"
            : "bg-secondary/30 text-foreground hover:bg-secondary/50"
        }`}
      >
        すべて
      </button>
      {/* 動的カテゴリ */}
      {loading ? (
        <div className="px-5 py-2 text-xs text-muted-foreground">読み込み中...</div>
      ) : (
        categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.slug)}
            className={`px-5 py-2 rounded-full font-serif text-xs transition-all duration-300 ${
              selectedCategory === category.slug
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/30 text-foreground hover:bg-secondary/50"
            }`}
            style={{
              borderColor: selectedCategory === category.slug ? category.color : undefined,
            }}
          >
            {category.name}
          </button>
        ))
      )}
    </div>
  );
}


