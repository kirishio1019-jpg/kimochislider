'use client';

import { Category, CATEGORY_LABELS, CATEGORY_COLORS } from '@/types';

interface CategoryFilterProps {
  selectedCategory: Category | null;
  onCategoryChange: (category: Category | null) => void;
}

export default function CategoryFilter({
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  const categories: (Category | null)[] = [
    null,
    'restaurant',
    'shop',
    'culture',
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
        const label = category ? CATEGORY_LABELS[category] : 'すべて';
        const color = category ? CATEGORY_COLORS[category] : '#6B7280';
        const isSelected = selectedCategory === category;

        return (
          <button
            key={category || 'all'}
            onClick={() => onCategoryChange(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              isSelected
                ? 'text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            style={
              isSelected
                ? {
                    backgroundColor: color,
                  }
                : {}
            }
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

