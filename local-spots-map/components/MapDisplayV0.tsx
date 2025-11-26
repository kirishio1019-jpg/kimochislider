"use client"

import { LocalSpot, Category } from '@/types';
import Map from './Map';

interface MapDisplayV0Props {
  spots: LocalSpot[];
  selectedCategory: Category | null;
  onSpotClick: (spot: LocalSpot) => void;
  onSpotUpdate?: (updatedSpot: LocalSpot) => void;
  onSpotDelete?: (spotId: string) => void;
  selectedSpotFromOutside?: LocalSpot | null;
  onMapClick?: (latitude: number, longitude: number) => void;
  centerLocation?: { lat: number; lng: number } | null;
  searchMarkerLocation?: { lat: number; lng: number; name?: string } | null;
  clickedLocation?: { lat: number; lng: number } | null;
}

export default function MapDisplayV0({
  spots,
  selectedCategory,
  onSpotClick,
  onSpotUpdate,
  onSpotDelete,
  selectedSpotFromOutside,
  onMapClick,
  centerLocation,
  searchMarkerLocation,
  clickedLocation,
  communityId,
  categoriesKey,
}: MapDisplayV0Props) {
  return (
    <div className="w-full h-full">
      <Map
        spots={spots}
        selectedCategory={selectedCategory}
        onSpotClick={onSpotClick}
        onSpotUpdate={onSpotUpdate}
        onSpotDelete={onSpotDelete}
        selectedSpotFromOutside={selectedSpotFromOutside}
        onMapClick={onMapClick}
        centerLocation={centerLocation}
        searchMarkerLocation={searchMarkerLocation}
        clickedLocation={clickedLocation}
        communityId={communityId}
        key={categoriesKey} // カテゴリが更新されたときに再マウント
      />
    </div>
  );
}

