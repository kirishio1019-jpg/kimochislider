'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { LocalSpot, Category, CategoryItem } from '@/types';
import { incrementLikes, decrementLikes, getCategories, updateSpotCategory } from '@/lib/supabase';
import { hasLikedSpot, markSpotAsLiked, unmarkSpotAsLiked } from '@/lib/likesStorage';

// Map型の衝突を避けるため、JavaScriptのMapを明示的に使用
type MarkerMap = globalThis.Map<string, HTMLDivElement>;

interface MapProps {
  spots: LocalSpot[];
  selectedCategory: Category | null;
  onSpotClick: (spot: LocalSpot) => void;
  onSpotUpdate?: (updatedSpot: LocalSpot) => void; // スポット更新時のコールバック（その場で更新）
  onSpotDelete?: (spotId: string) => void; // スポット削除時のコールバック
  selectedSpotFromOutside?: LocalSpot | null; // 外部から選択されたスポット（ランキングから）
  onMapClick?: (latitude: number, longitude: number) => void; // 地図クリック時のコールバック
  centerLocation?: { lat: number; lng: number } | null; // 地図の中心位置（検索結果選択時など）
  searchMarkerLocation?: { lat: number; lng: number; name?: string } | null; // 検索結果のマーカー位置
  clickedLocation?: { lat: number; lng: number } | null; // 地図クリック位置（ピン表示用）
  communityId?: string | null; // コミュニティID（カテゴリ取得用）
}

export default function Map({ spots, selectedCategory, onSpotClick, onSpotUpdate, onSpotDelete, selectedSpotFromOutside, onMapClick, centerLocation, searchMarkerLocation, clickedLocation, communityId }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const customPopupsRef = useRef<HTMLDivElement[]>([]);
  const clickedPopupRef = useRef<HTMLDivElement | null>(null);
  const markerElementsRef = useRef<MarkerMap>(new globalThis.Map<string, HTMLDivElement>()); // マーカー要素を保存
  const [clickedSpot, setClickedSpot] = useState<LocalSpot | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(10); // 現在のズームレベル
  const [pinClickCount, setPinClickCount] = useState<number>(0); // ピンを刺した回数（三段階の拡大レベル用）
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const hasInitializedBounds = useRef<boolean>(false);
  const searchMarkerRef = useRef<mapboxgl.Marker | null>(null); // 検索結果のマーカー
  const clickedLocationMarkerRef = useRef<mapboxgl.Marker | null>(null); // 地図クリック位置のマーカー

  useEffect(() => {
    if (!mapContainer.current) return;

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!mapboxToken || mapboxToken === 'your_mapbox_access_token') {
      console.error('Mapboxトークンが設定されていません。.env.localファイルにNEXT_PUBLIC_MAPBOX_TOKENを設定してください。');
      return;
    }

    mapboxgl.accessToken = mapboxToken;

    // 地図の初期化（秋田県の中心座標）
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [140.1025, 39.7186], // 秋田県の中心座標
      zoom: 10,
    });

    // ズーム設定はデフォルトのまま（Mapboxの標準設定）
    
    // ズームレベル変更時に状態を更新
    const handleZoom = () => {
      if (map.current) {
        setZoomLevel(map.current.getZoom());
      }
    };
    
    map.current.on('zoom', handleZoom);
    map.current.on('zoomend', handleZoom);

    // 地図クリックイベント
    if (onMapClick) {
      const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
        // マーカーやポップアップをクリックした場合は無視
        const target = e.originalEvent.target as HTMLElement;
        if (target.closest('.mapboxgl-marker') || target.closest('.spot-popup')) {
          return;
        }
        onMapClick(e.lngLat.lat, e.lngLat.lng);
      };
      map.current.on('click', handleMapClick);
    }

    return () => {
      if (map.current) {
        map.current.off('zoom', handleZoom);
        map.current.off('zoomend', handleZoom);
        if (onMapClick) {
          map.current.off('click');
        }
      }
      map.current?.remove();
    };
  }, [onMapClick]);

  // ズームレベル変更時にマーカーのサイズを更新
  useEffect(() => {
    if (!map.current) return;
    
    // すべてのマーカー要素のサイズを更新
    markerElementsRef.current.forEach((el: HTMLDivElement, spotId: string) => {
      const spot = spots.find(s => s.id === spotId);
      if (!spot) return;
      
      const trendScore = spot.trend_score ?? 50;
      const baseSize = 20 + (trendScore / 100) * 30; // 基準サイズ（拡大時の上限）
      
      // ズームレベルが基準（10）より小さい場合のみ縮小
      // 拡大時はbaseSizeを上限として、それ以上大きくしない
      let size: number;
      if (zoomLevel < 10) {
        // 縮小時: ズームレベルに比例して小さくする
        const zoomScale = Math.pow(2, (zoomLevel - 10) / 2);
        size = baseSize * zoomScale;
      } else {
        // 拡大時: 基準サイズを上限とする
        size = baseSize;
      }
      
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
    });
  }, [zoomLevel, spots]);

  useEffect(() => {
    if (!map.current) return;

    // 既存のマーカーとポップアップを削除
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
    customPopupsRef.current.forEach((popup) => {
      if (popup.parentNode) {
        popup.parentNode.removeChild(popup);
      }
    });
    customPopupsRef.current = [];
    markerElementsRef.current.clear();

    // フィルターされたスポットを取得
    const filteredSpots = selectedCategory
      ? spots.filter((spot) => spot.category === selectedCategory)
      : spots;

    if (filteredSpots.length === 0) return;

    // マーカーを作成
    filteredSpots.forEach((spot) => {
      // ラッパー要素を作成（位置を固定するため）
      const wrapper = document.createElement('div');
      wrapper.style.cssText = `
        position: relative;
        width: 0;
        height: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      `;

      // マーカー要素を作成
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.setAttribute('data-spot-id', spot.id); // 識別用の属性を追加

      // trend_scoreに基づいてベースサイズを計算
      // trend_scoreが0-100の範囲で、大きいほど丸が大きくなる
      const trendScore = spot.trend_score ?? 50; // デフォルトは50（普通サイズ）
      
      // trend_scoreをベースサイズに変換: 0-100を20px-50pxの範囲にスケール
      const baseSize = 20 + (trendScore / 100) * 30; // 20px〜50pxの範囲
      
      // ズームレベルに応じてサイズを調整
      // ズームレベルが基準（10）より小さい場合のみ縮小
      // 拡大時はbaseSizeを上限として、それ以上大きくしない
      let size: number;
      if (zoomLevel < 10) {
        // 縮小時: ズームレベルに比例して小さくする
        const zoomScale = Math.pow(2, (zoomLevel - 10) / 2);
        size = baseSize * zoomScale;
      } else {
        // 拡大時: 基準サイズを上限とする
        size = baseSize;
      }

      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      
      // マーカー要素を保存（ズーム時にサイズを更新するため）
      markerElementsRef.current.set(spot.id, el);
      el.style.borderRadius = '50%';
      // カテゴリの色を取得（categories stateから）
      const categoryItem = categories.find(cat => cat.slug === spot.category);
      const categoryColor = categoryItem?.color || '#6B7280'; // デフォルト色
      el.style.backgroundColor = categoryColor;
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      el.style.cursor = 'pointer';
      el.style.transition = 'transform 0.2s ease-out';
      el.style.position = 'absolute';
      el.style.left = '50%';
      el.style.top = '50%';
      el.style.transform = 'translate(-50%, -50%)';
      el.style.transformOrigin = 'center center';
      el.style.willChange = 'transform';

      wrapper.appendChild(el);

      // ポップアップカードのHTMLを作成
      const popupContent = document.createElement('div');
      popupContent.className = 'spot-popup-card';
      popupContent.style.cssText = `
        padding: 0;
        margin: 0;
        min-width: 200px;
        max-width: 250px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        overflow: hidden;
        animation: fadeIn 0.2s ease-out;
      `;

      // 画像部分
      const imageContainer = document.createElement('div');
      imageContainer.style.cssText = `
        width: 100%;
        height: 120px;
        background: #f3f4f6;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      `;

      if (spot.image_url) {
        const img = document.createElement('img');
        img.src = spot.image_url;
        img.alt = spot.name;
        img.style.cssText = `
          width: 100%;
          height: 100%;
          object-fit: cover;
        `;
        imageContainer.appendChild(img);
      } else {
        imageContainer.innerHTML = '<span style="color: #9ca3af; font-size: 14px;">画像なし</span>';
      }

      // テキスト部分
      const textContainer = document.createElement('div');
      textContainer.style.cssText = `
        padding: 12px;
      `;
      const nameElement = document.createElement('div');
      nameElement.textContent = spot.name;
      nameElement.style.cssText = `
        font-weight: 600;
        font-size: 14px;
        color: #333;
        margin-bottom: 4px;
      `;
      textContainer.appendChild(nameElement);

      popupContent.appendChild(imageContainer);
      popupContent.appendChild(textContainer);

      // カスタムポップアップ要素を作成（マップを動かさない）
      const customPopup = document.createElement('div');
      customPopup.className = 'custom-popup';
      customPopup.style.cssText = `
        position: absolute;
        z-index: 1000;
        pointer-events: none;
        display: none;
      `;
      customPopup.appendChild(popupContent);
      // マップコンテナに追加（相対位置で配置するため）
      if (mapContainer.current) {
        mapContainer.current.appendChild(customPopup);
      }

      // マーカーを作成（ラッパー要素を使用）
      const marker = new mapboxgl.Marker({
        element: wrapper, // ラッパー要素を使用
        anchor: 'center', // マーカーの中心を基準点にする
        draggable: false, // ドラッグを無効化
      })
        .setLngLat([spot.longitude, spot.latitude])
        .addTo(map.current!);

      // ポップアップの位置を更新する関数
      const updatePopupPosition = () => {
        if (!map.current || !mapContainer.current || customPopup.style.display === 'none') return;
        
        const point = map.current.project([spot.longitude, spot.latitude]);
        const size = 20 + ((spot.trend_score ?? 50) / 100) * 30;
        
        // マップコンテナの位置を取得
        const containerRect = mapContainer.current.getBoundingClientRect();
        
        // マーカーの上にポップアップを配置
        customPopup.style.left = `${point.x - 125}px`; // ポップアップの幅の半分を引く
        customPopup.style.top = `${point.y - size / 2 - 140}px`; // マーカーの上に配置
      };

      // ホバーイベント（ラッパー要素ではなく、マーカー要素に設定）
      el.addEventListener('mouseenter', (e) => {
        e.stopPropagation(); // イベントの伝播を停止
        e.preventDefault(); // デフォルト動作を防ぐ
        // transform-originを中心に設定してからスケール
        el.style.transform = 'translate(-50%, -50%) scale(1.2)';
        // カスタムポップアップを表示（マップは動かさない）
        customPopup.style.display = 'block';
        updatePopupPosition();
      });

      el.addEventListener('mouseleave', (e) => {
        e.stopPropagation(); // イベントの伝播を停止
        e.preventDefault(); // デフォルト動作を防ぐ
        el.style.transform = 'translate(-50%, -50%) scale(1)';
        // カスタムポップアップを非表示
        customPopup.style.display = 'none';
      });
      
      // マウスイベントでマップのパンを防ぐ
      wrapper.addEventListener('mousedown', (e) => {
        e.stopPropagation(); // マップのパンを防ぐ
      });
      
      wrapper.addEventListener('mouseup', (e) => {
        e.stopPropagation(); // マップのパンを防ぐ
      });
      
      wrapper.addEventListener('click', (e) => {
        e.stopPropagation(); // マップのクリックイベントを防ぐ
      });

      // マップが動いたときにポップアップの位置を更新
      if (map.current) {
        map.current.on('move', updatePopupPosition);
        map.current.on('zoom', updatePopupPosition);
      }

      el.addEventListener('click', () => {
        // クリックされたスポットを設定
        setClickedSpot(spot);
        
        // マップをそのスポットの位置に移動・拡大
        if (map.current) {
          const currentZoom = map.current.getZoom();
          const newZoom = Math.min(currentZoom + 2, 18); // 現在のズームレベルより2段階拡大（最大18まで）
          
          map.current.easeTo({
            center: [spot.longitude, spot.latitude],
            zoom: newZoom,
            duration: 500, // 500msでアニメーション
          });
        }
      });

      markersRef.current.push(marker);
      customPopupsRef.current.push(customPopup);
      
      // マーカー要素を保存（ズーム時にサイズを更新するため）
      markerElementsRef.current.set(spot.id, el);
    });

    // すべてのスポットが表示されるように地図を調整（初回読み込み時のみ）
    if (filteredSpots.length > 0 && !hasInitializedBounds.current) {
      const bounds = new mapboxgl.LngLatBounds();
      filteredSpots.forEach((spot) => {
        bounds.extend([spot.longitude, spot.latitude]);
      });
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15,
      });
      hasInitializedBounds.current = true;
    }
  }, [spots, selectedCategory, categories, onSpotClick, clickedSpot, zoomLevel]);

  // カテゴリを読み込む（communityIdが変更されたとき、または親コンポーネントから再マウントされたとき）
  useEffect(() => {
    const loadCategories = async () => {
      if (communityId) {
        const data = await getCategories(communityId);
        setCategories(data);
      }
    };
    loadCategories();
  }, [communityId]);

  // クリックされたスポットの吹き出しを表示
  useEffect(() => {
    if (!map.current || !mapContainer.current || !clickedSpot) {
      // 既存の吹き出しを削除
      if (clickedPopupRef.current && clickedPopupRef.current.parentNode) {
        clickedPopupRef.current.parentNode.removeChild(clickedPopupRef.current);
        clickedPopupRef.current = null;
      }
      return;
    }

    // 既存の吹き出しを削除
    if (clickedPopupRef.current && clickedPopupRef.current.parentNode) {
      clickedPopupRef.current.parentNode.removeChild(clickedPopupRef.current);
    }

    // 吹き出しのHTMLを作成
    const popupContent = document.createElement('div');
    popupContent.className = 'clicked-spot-popup';
    popupContent.style.cssText = `
      padding: 0;
      margin: 0;
      min-width: 200px;
      max-width: 250px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      overflow: hidden;
      animation: fadeIn 0.3s ease-out;
      position: relative;
    `;
    
    // 吹き出しの矢印を追加（ピンから伸びる）
    const arrow = document.createElement('div');
    arrow.className = 'popup-arrow';
    arrow.style.cssText = `
      position: absolute;
      top: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 10px solid transparent;
      border-right: 10px solid transparent;
      border-bottom: 10px solid white;
      filter: drop-shadow(0 -2px 4px rgba(0,0,0,0.1));
    `;

    // 閉じるボタン
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: rgba(0,0,0,0.5);
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      line-height: 1;
      z-index: 10;
      transition: background 0.2s;
    `;
    closeButton.addEventListener('mouseenter', () => {
      closeButton.style.background = 'rgba(0,0,0,0.7)';
    });
    closeButton.addEventListener('mouseleave', () => {
      closeButton.style.background = 'rgba(0,0,0,0.5)';
    });
    closeButton.addEventListener('click', (e) => {
      e.stopPropagation();
      setClickedSpot(null);
    });

    // 画像部分
    const imageContainer = document.createElement('div');
    imageContainer.style.cssText = `
      width: 100%;
      height: 120px;
      background: #f3f4f6;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    `;

    if (clickedSpot.image_url) {
      const img = document.createElement('img');
      img.src = clickedSpot.image_url;
      img.alt = clickedSpot.name;
      img.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
      `;
      imageContainer.appendChild(img);
    } else {
      imageContainer.innerHTML = '<span style="color: #9ca3af; font-size: 14px;">画像なし</span>';
    }

    // テキスト部分
    const textContainer = document.createElement('div');
    textContainer.style.cssText = `
      padding: 12px;
    `;
    const nameElement = document.createElement('div');
    nameElement.textContent = clickedSpot.name;
    nameElement.style.cssText = `
      font-weight: 600;
      font-size: 14px;
      color: #111827;
      margin-bottom: 8px;
    `;
    textContainer.appendChild(nameElement);

    // カテゴリ選択部分
    const categoryContainer = document.createElement('div');
    categoryContainer.style.cssText = `
      margin-bottom: 8px;
    `;
    const categoryLabel = document.createElement('label');
    categoryLabel.textContent = 'カテゴリ: ';
    categoryLabel.style.cssText = `
      font-size: 12px;
      color: #6B7280;
      margin-right: 4px;
    `;
    const categorySelect = document.createElement('select');
    categorySelect.style.cssText = `
      font-size: 12px;
      padding: 4px 8px;
      border: 1px solid #D1D5DB;
      border-radius: 4px;
      background: white;
      color: #111827;
      cursor: pointer;
    `;
    categories.forEach((cat) => {
      const option = document.createElement('option');
      option.value = cat.slug;
      option.textContent = cat.name;
      if (cat.slug === clickedSpot.category) {
        option.selected = true;
      }
      categorySelect.appendChild(option);
    });
    categorySelect.addEventListener('change', async (e) => {
      const newCategorySlug = (e.target as HTMLSelectElement).value;
      const success = await updateSpotCategory(clickedSpot.id, newCategorySlug);
      if (success && onSpotUpdate) {
        const updatedSpot = { ...clickedSpot, category: newCategorySlug };
        setClickedSpot(updatedSpot);
        onSpotUpdate(updatedSpot);
      }
    });
    categoryContainer.appendChild(categoryLabel);
    categoryContainer.appendChild(categorySelect);
    textContainer.appendChild(categoryContainer);

    // いいねボタン部分
    const likesContainer = document.createElement('div');
    likesContainer.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 8px;
    `;

    const likesButton = document.createElement('button');
    const currentLikes = clickedSpot.likes ?? 0;
    let alreadyLiked = hasLikedSpot(clickedSpot.id); // 既にいいねを押したかチェック（状態を更新可能にする）
    let isLiking = false; // 連続クリックを防ぐフラグ

    // ボタンの初期表示を設定
    const updateButtonDisplay = (liked: boolean, likes: number) => {
      if (liked) {
        // いいね済みの状態
        likesButton.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#dc2626" stroke="#dc2626" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          <span style="margin-left: 4px;">${likes}</span>
        `;
        likesButton.style.cssText = `
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px 12px;
          background: #fee2e2;
          border: 1px solid #fca5a5;
          border-radius: 20px;
          cursor: pointer;
          font-size: 14px;
          color: #dc2626;
          transition: all 0.2s;
          font-weight: 500;
        `;
      } else {
        // いいね未済みの状態
        likesButton.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          <span style="margin-left: 4px;">${likes}</span>
        `;
        likesButton.style.cssText = `
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px 12px;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          cursor: pointer;
          font-size: 14px;
          color: #374151;
          transition: all 0.2s;
          font-weight: 500;
        `;
      }
    };

    // 初期表示を設定
    updateButtonDisplay(alreadyLiked, currentLikes);

    // ホバーイベント（最新の状態を確認）
    likesButton.addEventListener('mouseenter', () => {
      if (!isLiking) {
        const currentLikedState = hasLikedSpot(clickedSpot.id);
        if (currentLikedState) {
          // いいね済みの場合：解除できることを示す
          likesButton.style.background = '#f3f4f6';
          likesButton.style.borderColor = '#e5e7eb';
          likesButton.style.color = '#374151';
        } else {
          // いいね未済みの場合：いいねできることを示す
          likesButton.style.background = '#fee2e2';
          likesButton.style.borderColor = '#fca5a5';
          likesButton.style.color = '#dc2626';
        }
      }
    });

    likesButton.addEventListener('mouseleave', () => {
      if (!isLiking) {
        const currentLikedState = hasLikedSpot(clickedSpot.id);
        if (currentLikedState) {
          likesButton.style.background = '#fee2e2';
          likesButton.style.borderColor = '#fca5a5';
          likesButton.style.color = '#dc2626';
        } else {
          likesButton.style.background = '#f3f4f6';
          likesButton.style.borderColor = '#e5e7eb';
          likesButton.style.color = '#374151';
        }
      }
    });

    // クリックイベント（いいね/解除の切り替え）
    likesButton.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (isLiking) return; // 連続クリックを防ぐ

      isLiking = true;
      likesButton.style.cursor = 'wait';
      likesButton.style.opacity = '0.6';

      let newLikes: number | null = null;

      if (alreadyLiked) {
        // いいねを解除
        newLikes = await decrementLikes(clickedSpot.id);
        if (newLikes !== null) {
          unmarkSpotAsLiked(clickedSpot.id);
        }
      } else {
        // いいねを追加
        newLikes = await incrementLikes(clickedSpot.id);
        if (newLikes !== null) {
          markSpotAsLiked(clickedSpot.id);
        }
      }

      if (newLikes !== null) {
        // いいね状態を更新
        alreadyLiked = !alreadyLiked;

        // ボタンの表示を更新
        updateButtonDisplay(alreadyLiked, newLikes);

        // スポットデータを更新
        const updatedSpot = { ...clickedSpot, likes: newLikes };
        setClickedSpot(updatedSpot);

        // 親コンポーネントに更新を通知（その場で更新、再読み込みなし）
        if (onSpotUpdate) {
          onSpotUpdate(updatedSpot);
        }
      } else {
        alert(alreadyLiked ? 'いいね解除に失敗しました。もう一度お試しください。' : 'いいねの更新に失敗しました。もう一度お試しください。');
      }

      isLiking = false;
      likesButton.style.cursor = 'pointer';
      likesButton.style.opacity = '1';
    });

    likesContainer.appendChild(likesButton);

    // 削除ボタン
    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      <span style="margin-left: 4px;">削除</span>
    `;
    deleteButton.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 6px 12px;
      background: #dc2626;
      border: 1px solid #b91c1c;
      border-radius: 20px;
      cursor: pointer;
      font-size: 14px;
      color: white;
      transition: all 0.2s;
      font-weight: 500;
      margin-left: 8px;
    `;
    deleteButton.addEventListener('mouseenter', () => {
      deleteButton.style.background = '#b91c1c';
    });
    deleteButton.addEventListener('mouseleave', () => {
      deleteButton.style.background = '#dc2626';
    });
    deleteButton.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (!onSpotDelete) return;

      // 確認ダイアログ
      if (!confirm(`「${clickedSpot.name}」を削除してもよろしいですか？`)) {
        return;
      }

      // 削除処理中はボタンを無効化
      deleteButton.disabled = true;
      deleteButton.style.opacity = '0.5';
      deleteButton.style.cursor = 'wait';

      try {
        // 親コンポーネントのdeleteSpot関数を呼び出す（Supabase削除と状態更新を一元管理）
        await onSpotDelete(clickedSpot.id);
        setClickedSpot(null); // ポップアップを閉じる
      } catch (error) {
        console.error('削除処理中にエラーが発生しました:', error);
        alert('削除処理中にエラーが発生しました');
      } finally {
        // ボタンを再有効化
        deleteButton.disabled = false;
        deleteButton.style.opacity = '1';
        deleteButton.style.cursor = 'pointer';
      }
    });

    likesContainer.appendChild(deleteButton);
    textContainer.appendChild(likesContainer);

    popupContent.appendChild(arrow);
    popupContent.appendChild(closeButton);
    popupContent.appendChild(imageContainer);
    popupContent.appendChild(textContainer);

    // 吹き出しコンテナを作成
    const clickedPopup = document.createElement('div');
    clickedPopup.className = 'clicked-popup-container';
    clickedPopup.style.cssText = `
      position: absolute;
      z-index: 2000;
      pointer-events: auto;
    `;
    clickedPopup.appendChild(popupContent);
    
    if (mapContainer.current) {
      mapContainer.current.appendChild(clickedPopup);
      clickedPopupRef.current = clickedPopup;
    }

    // 吹き出しの位置を更新する関数
    const updateClickedPopupPosition = () => {
      if (!map.current || !clickedPopup || !clickedSpot) return;
      
      const point = map.current.project([clickedSpot.longitude, clickedSpot.latitude]);
      const size = 20 + ((clickedSpot.trend_score ?? 50) / 100) * 30;
      const popupWidth = 250; // ポップアップの幅
      const popupHeight = 200; // ポップアップの高さ（概算）
      const offset = 20; // ピンからのオフセット
      
      // マーカーの下に吹き出しを配置（ピンが見えるように）
      clickedPopup.style.left = `${point.x - popupWidth / 2}px`; // ポップアップの中央をマーカーの位置に
      clickedPopup.style.top = `${point.y + size / 2 + offset}px`; // マーカーの下に配置
    };

    // 初期位置を設定
    updateClickedPopupPosition();

    // マップが動いたときに吹き出しの位置を更新
    const moveHandler = () => updateClickedPopupPosition();
    const zoomHandler = () => updateClickedPopupPosition();
    
    map.current.on('move', moveHandler);
    map.current.on('zoom', zoomHandler);

    // クリーンアップ
    return () => {
      if (map.current) {
        map.current.off('move', moveHandler);
        map.current.off('zoom', zoomHandler);
      }
      if (clickedPopup && clickedPopup.parentNode) {
        clickedPopup.parentNode.removeChild(clickedPopup);
      }
    };
  }, [clickedSpot, onSpotUpdate]);

  // 外部から選択されたスポット（ランキングから）をズーム
  useEffect(() => {
    if (!map.current || !selectedSpotFromOutside) return;

    // 外部から選択されたスポットをクリックされたスポットとして設定
    setClickedSpot(selectedSpotFromOutside);

    // マップをそのスポットの位置に移動・拡大
    const currentZoom = map.current.getZoom();
    const newZoom = Math.min(currentZoom + 2, 18);

    map.current.easeTo({
      center: [selectedSpotFromOutside.longitude, selectedSpotFromOutside.latitude],
      zoom: newZoom,
      duration: 500,
    });
  }, [selectedSpotFromOutside]);

  // 検索結果選択時などに地図の中心を移動し、ピンを表示
  useEffect(() => {
    if (!map.current) return;

    // 既存の検索マーカーを削除
    if (searchMarkerRef.current) {
      searchMarkerRef.current.remove();
      searchMarkerRef.current = null;
    }

    if (searchMarkerLocation) {
      // 検索結果の位置にピンを表示
      const markerElement = document.createElement('div');
      markerElement.className = 'search-marker';
      markerElement.style.width = '24px';
      markerElement.style.height = '24px';
      markerElement.style.borderRadius = '50%';
      markerElement.style.backgroundColor = '#3B82F6'; // 青色
      markerElement.style.border = '3px solid white';
      markerElement.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
      markerElement.style.cursor = 'pointer';
      markerElement.title = searchMarkerLocation.name || '選択された場所';

      const marker = new mapboxgl.Marker({
        element: markerElement,
        anchor: 'center',
      })
        .setLngLat([searchMarkerLocation.lng, searchMarkerLocation.lat])
        .addTo(map.current);

      searchMarkerRef.current = marker;

      // 地図をその位置に移動
      map.current.easeTo({
        center: [searchMarkerLocation.lng, searchMarkerLocation.lat],
        zoom: Math.max(map.current.getZoom(), 15), // 最低15倍までズーム
        duration: 500,
      });
    } else if (centerLocation) {
      // centerLocationのみが設定されている場合（地図クリック時など）
      // この場合は移動のみで、ズームは変更しない（ピンは別のuseEffectで処理される）
      const bounds = map.current.getBounds();
      const isInViewport = bounds.contains([centerLocation.lng, centerLocation.lat]);
      
      // ビューポート外の場合のみ移動
      if (!isInViewport) {
        map.current.easeTo({
          center: [centerLocation.lng, centerLocation.lat],
          duration: 500,
        });
      }
    }

    // クリーンアップ
    return () => {
      if (searchMarkerRef.current) {
        searchMarkerRef.current.remove();
        searchMarkerRef.current = null;
      }
    };
  }, [searchMarkerLocation, centerLocation]);

  // 地図クリック位置にピンを表示
  useEffect(() => {
    if (!map.current) return;

    // 既存のクリック位置マーカーを削除
    if (clickedLocationMarkerRef.current) {
      clickedLocationMarkerRef.current.remove();
      clickedLocationMarkerRef.current = null;
    }

    if (clickedLocation) {
      // クリック位置にピンを表示
      const markerElement = document.createElement('div');
      markerElement.className = 'clicked-location-marker';
      markerElement.style.width = '32px';
      markerElement.style.height = '32px';
      markerElement.style.borderRadius = '50%';
      markerElement.style.backgroundColor = '#10B981'; // 緑色
      markerElement.style.border = '4px solid white';
      markerElement.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
      markerElement.style.cursor = 'pointer';
      markerElement.title = '選択された位置';

      const marker = new mapboxgl.Marker({
        element: markerElement,
        anchor: 'center',
      })
        .setLngLat([clickedLocation.lng, clickedLocation.lat])
        .addTo(map.current);

      clickedLocationMarkerRef.current = marker;

      // 地図をその位置に移動・ズーム（ピンを刺すたびに中央に配置して三段階で拡大）
      // フラッシュを防ぐため、スムーズなアニメーションで段階的に拡大
      const currentZoom = map.current.getZoom();
      
      // ピンを刺した回数をカウント（三段階の拡大レベル用）
      const newPinClickCount = pinClickCount + 1;
      setPinClickCount(newPinClickCount);
      
      // 三段階の拡大レベルを設定
      let zoomIncrement: number;
      let minZoom: number;
      
      if (newPinClickCount === 1) {
        // 1回目：中程度の拡大（+2レベル、最低12倍）
        zoomIncrement = 2;
        minZoom = 12;
      } else if (newPinClickCount === 2) {
        // 2回目：さらに拡大（+3レベル、最低15倍）
        zoomIncrement = 3;
        minZoom = 15;
      } else {
        // 3回目以降：最大拡大（+4レベル、最低17倍、最大18倍）
        zoomIncrement = 4;
        minZoom = 17;
      }
      
      // ピンを刺すたびに：
      // 1. ピンを画面の中央に配置
      // 2. 段階的に拡大（1回目→2回目→3回目で拡大レベルが上がる）
      // 3. フラッシュを防ぐため、スムーズなアニメーションで実行
      const targetZoom = Math.min(Math.max(currentZoom + zoomIncrement, minZoom), 18);
      
      // スムーズなアニメーションで地図をスライド（フラッシュしないように）
      // アニメーション時間を長めにして、連続的な動きを実現
      map.current.easeTo({
        center: [clickedLocation.lng, clickedLocation.lat], // ピンを中央に配置
        zoom: targetZoom, // 段階的に拡大
        duration: 1200, // アニメーション時間を長めにしてスムーズに（フラッシュを防ぐ）
        essential: true, // アニメーションを確実に実行
      });
    }

    // クリーンアップ
    return () => {
      if (clickedLocationMarkerRef.current) {
        clickedLocationMarkerRef.current.remove();
        clickedLocationMarkerRef.current = null;
      }
    };
  }, [clickedLocation]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-full overflow-hidden relative"
    />
  );
}

