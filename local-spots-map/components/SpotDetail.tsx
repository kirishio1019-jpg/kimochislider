'use client';

import { LocalSpot, CATEGORY_LABELS } from '@/types';
import Image from 'next/image';

interface SpotDetailProps {
  spot: LocalSpot | null;
  onClose: () => void;
}

export default function SpotDetail({ spot, onClose }: SpotDetailProps) {
  if (!spot) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
          {spot.image_url ? (
            <Image
              src={spot.image_url}
              alt={spot.name}
              width={400}
              height={250}
              className="w-full h-48 object-cover rounded-t-lg"
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
              <span className="text-gray-400">画像なし</span>
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
            aria-label="閉じる"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-900">{spot.name}</h2>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {CATEGORY_LABELS[spot.category]}
            </span>
          </div>
          <p className="text-gray-600 mb-4">{spot.description}</p>
          {spot.opening_hours && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-1">営業時間</h3>
              <p className="text-gray-600">{spot.opening_hours}</p>
              {spot.is_open_now !== undefined && (
                <span
                  className={`inline-block mt-2 px-2 py-1 rounded text-sm ${
                    spot.is_open_now
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {spot.is_open_now ? '営業中' : '営業時間外'}
                </span>
              )}
            </div>
          )}
          <div className="flex gap-4 text-sm text-gray-500">
            {spot.hotness_score !== undefined && (
              <div>
                <span className="font-semibold">ホットネス: </span>
                {spot.hotness_score}/100
              </div>
            )}
            {spot.accessibility_score !== undefined && (
              <div>
                <span className="font-semibold">アクセシビリティ: </span>
                {spot.accessibility_score}/100
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}











