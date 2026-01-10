"use client"

import { MapIcon, ListIcon } from "lucide-react"

interface ViewToggleProps {
  viewMode: "split" | "fullscreen";
  onViewModeChange: (mode: "split" | "fullscreen") => void;
}

export default function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div className="flex gap-1 border border-border rounded-full p-1 bg-secondary/10">
      <button
        onClick={() => onViewModeChange("split")}
        className={`px-4 py-2.5 rounded-full font-serif text-sm transition-all flex items-center gap-2 ${
          viewMode === "split" ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary/30"
        }`}
      >
        <ListIcon className="w-4 h-4" />
        <span className="hidden sm:inline">Split</span>
      </button>
      <button
        onClick={() => onViewModeChange("fullscreen")}
        className={`px-4 py-2.5 rounded-full font-serif text-sm transition-all flex items-center gap-2 ${
          viewMode === "fullscreen" ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary/30"
        }`}
      >
        <MapIcon className="w-4 h-4" />
        <span className="hidden sm:inline">Map</span>
      </button>
    </div>
  );
}























