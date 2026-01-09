"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"

interface OtherResponse {
  x_value: number
  y_value: number
}

type AvailabilityStatus = "can" | "cannot" | "later" | null

interface FeelingSliderProps {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
  showMatrix?: boolean // マトリクスを表示するかどうか
  otherResponses?: OtherResponse[] // 他の人の回答
  xValue?: number // 外部からxValueを制御（オプション）
  yValue?: number // 外部からyValueを制御（オプション）
  onXChange?: (value: number) => void // xValue変更時のコールバック
  onYChange?: (value: number) => void // yValue変更時のコールバック
  availabilityStatus?: AvailabilityStatus // 行ける/行けない/未定
  onAvailabilityChange?: (status: AvailabilityStatus) => void // 三択変更時のコールバック
}

export function FeelingSlider({ 
  value, 
  onChange, 
  disabled = false,
  showMatrix = false,
  otherResponses = [],
  xValue: externalXValue,
  yValue: externalYValue,
  onXChange,
  onYChange,
  availabilityStatus: externalAvailabilityStatus,
  onAvailabilityChange,
}: FeelingSliderProps) {
  // 座標系の定義:
  // xValue: 0-100 (0=興味なし, 100=興味あり) - 横軸
  // yValue: 0-100 (0=行けなそう, 100=行けそう) - 縦軸（後方互換性のため残す）
  const [internalXValue, setInternalXValue] = useState(0)
  const [internalYValue, setInternalYValue] = useState(50)
  const [internalAvailabilityStatus, setInternalAvailabilityStatus] = useState<AvailabilityStatus>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isSliderDragging, setIsSliderDragging] = useState(false)

  // 外部から制御される場合はそれを使用、そうでなければ内部状態を使用
  const xValue = externalXValue !== undefined ? externalXValue : internalXValue
  const yValue = externalYValue !== undefined ? externalYValue : internalYValue
  const availabilityStatus = externalAvailabilityStatus !== undefined ? externalAvailabilityStatus : internalAvailabilityStatus

  // valueからxValueとyValueを初期化（既存データとの互換性のため）
  useEffect(() => {
    if (value !== undefined && value !== null) {
      if (externalXValue === undefined) {
        setInternalXValue(value)
      }
      if (externalYValue === undefined) {
        setInternalYValue(value)
      }
    }
  }, [value, externalXValue, externalYValue])

  // 2次元の値を1次元のスコアに変換（0-100）
  const calculateScore = useCallback((x: number, y: number): number => {
    return Math.round((x + y) / 2)
  }, [])

  // 横軸スライダーの変更ハンドラー（興味の度合い）
  const handleXChange = useCallback((newX: number) => {
    const clampedX = Math.max(0, Math.min(100, newX))
    
    if (onXChange) {
      onXChange(clampedX)
    } else {
      setInternalXValue(clampedX)
    }
    
    // 興味の度合いのみをスコアとして使用（後方互換性のため）
    onChange(clampedX)
  }, [onChange, onXChange])

  // 三択ボタンの変更ハンドラー（行ける/行けない/未定）
  const handleAvailabilityChange = useCallback((status: AvailabilityStatus) => {
    if (onAvailabilityChange) {
      onAvailabilityChange(status)
    } else {
      setInternalAvailabilityStatus(status)
    }
    
    // 三択の状態をyValueに変換（後方互換性のため）
    let yValue = 50 // デフォルト
    if (status === "can") yValue = 100
    else if (status === "cannot") yValue = 0
    else if (status === "later") yValue = 50
    
    if (onYChange) {
      onYChange(yValue)
    } else {
      setInternalYValue(yValue)
    }
  }, [onAvailabilityChange, onYChange])

  // マトリクスクリック/ドラッグハンドラー（マウスとタッチの両方に対応）
  const handleMatrixInteraction = useCallback((clientX: number, clientY: number) => {
    if (disabled || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top
    
    // 横軸: 左=0, 右=100 (興味なし→興味あり)
    const newX = Math.max(0, Math.min(100, Math.round((x / rect.width) * 100)))
    
    // 縦軸: 上=100, 下=0 (行けそう→行けなそう、反転)
    const newY = Math.max(0, Math.min(100, Math.round(100 - (y / rect.height) * 100)))
    
    if (onXChange) {
      onXChange(newX)
    } else {
      setInternalXValue(newX)
    }
    
    if (onYChange) {
      onYChange(newY)
    } else {
      setInternalYValue(newY)
    }
    
    const score = calculateScore(newX, newY)
    onChange(score)
  }, [disabled, calculateScore, onChange, onXChange, onYChange])

  const handleMatrixClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    handleMatrixInteraction(e.clientX, e.clientY)
  }, [handleMatrixInteraction])

  const handleMatrixTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (disabled) return
    e.preventDefault()
    setIsDragging(true)
    const touch = e.touches[0]
    if (touch) {
      handleMatrixInteraction(touch.clientX, touch.clientY)
    }
  }, [disabled, handleMatrixInteraction])

  const handleMatrixTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (disabled || !isDragging) return
    e.preventDefault()
    const touch = e.touches[0]
    if (touch) {
      handleMatrixInteraction(touch.clientX, touch.clientY)
    }
  }, [disabled, isDragging, handleMatrixInteraction])

  const handleMatrixDrag = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !isDragging) return
    handleMatrixInteraction(e.clientX, e.clientY)
  }, [disabled, isDragging, handleMatrixInteraction])

  const handleMouseDown = useCallback(() => {
    if (disabled) return
    setIsDragging(true)
  }, [disabled])

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false)
    const handleMouseLeave = () => setIsDragging(false)
    const handleTouchEnd = () => setIsDragging(false)
    
    if (isDragging) {
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('mouseleave', handleMouseLeave)
      window.addEventListener('touchend', handleTouchEnd)
      window.addEventListener('touchcancel', handleTouchEnd)
      return () => {
        window.removeEventListener('mouseup', handleMouseUp)
        window.removeEventListener('mouseleave', handleMouseLeave)
        window.removeEventListener('touchend', handleTouchEnd)
        window.removeEventListener('touchcancel', handleTouchEnd)
      }
    }
  }, [isDragging])

  // スライダーのドラッグハンドラー（マウスとタッチの両方に対応）
  const handleSliderMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return
    e.preventDefault()
    setIsSliderDragging(true)
  }, [disabled])

  const handleSliderTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return
    e.preventDefault()
    setIsSliderDragging(true)
    const touch = e.touches[0]
    if (touch && sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect()
      const x = touch.clientX - rect.left
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
      const newValue = Math.round(percentage)
      handleXChange(newValue)
    }
  }, [disabled, handleXChange])

  const handleSliderMove = useCallback((clientX: number) => {
    if (!isSliderDragging || !sliderRef.current || disabled) return
    
    const rect = sliderRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    const newValue = Math.round(percentage)
    handleXChange(newValue)
  }, [isSliderDragging, disabled, handleXChange])

  const handleSliderMouseMove = useCallback((e: MouseEvent) => {
    handleSliderMove(e.clientX)
  }, [handleSliderMove])

  const handleSliderTouchMove = useCallback((e: TouchEvent) => {
    if (!isSliderDragging || disabled) return
    e.preventDefault()
    const touch = e.touches[0]
    if (touch) {
      handleSliderMove(touch.clientX)
    }
  }, [isSliderDragging, disabled, handleSliderMove])

  const handleSliderMouseUp = useCallback(() => {
    setIsSliderDragging(false)
  }, [])

  const handleSliderTouchEnd = useCallback(() => {
    setIsSliderDragging(false)
  }, [])

  useEffect(() => {
    if (isSliderDragging) {
      window.addEventListener('mousemove', handleSliderMouseMove)
      window.addEventListener('mouseup', handleSliderMouseUp)
      window.addEventListener('touchmove', handleSliderTouchMove, { passive: false })
      window.addEventListener('touchend', handleSliderTouchEnd)
      window.addEventListener('touchcancel', handleSliderTouchEnd)
      return () => {
        window.removeEventListener('mousemove', handleSliderMouseMove)
        window.removeEventListener('mouseup', handleSliderMouseUp)
        window.removeEventListener('touchmove', handleSliderTouchMove)
        window.removeEventListener('touchend', handleSliderTouchEnd)
        window.removeEventListener('touchcancel', handleSliderTouchEnd)
      }
    }
  }, [isSliderDragging, handleSliderMouseMove, handleSliderMouseUp, handleSliderTouchMove, handleSliderTouchEnd])

  // マトリクス内のドットの位置計算
  const dotLeft = `${xValue}%`
  const dotTop = `${100 - yValue}%`

  return (
    <div className="flex w-full flex-col gap-6">
      {/* マトリックス（送信後に表示） */}
      {showMatrix && (
        <div className="relative flex flex-col gap-6">
          <div className="relative w-full flex justify-center">
            <div className="relative w-full max-w-md">
              <div
                ref={containerRef}
                className="relative aspect-square w-full cursor-crosshair rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-muted/40 via-primary/15 to-primary/30 backdrop-blur-sm shadow-lg overflow-hidden touch-none"
                onClick={handleMatrixClick}
                onMouseMove={handleMatrixDrag}
                onMouseDown={handleMouseDown}
                onTouchStart={handleMatrixTouchStart}
                onTouchMove={handleMatrixTouchMove}
                style={{
                  background: `
                    radial-gradient(circle at ${dotLeft} ${dotTop}, oklch(var(--primary) / 0.2) 0%, transparent 20%),
                    linear-gradient(to right, oklch(var(--muted)) 0%, oklch(var(--primary) / 0.1) 50%, oklch(var(--primary) / 0.2) 100%),
                    linear-gradient(to top, oklch(var(--muted)) 0%, oklch(var(--primary) / 0.1) 50%, oklch(var(--primary) / 0.2) 100%)
                  `
                }}
              >
                {/* 4つのコーナーのハイライト */}
                <div className="absolute inset-0">
                  <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/10 rounded-tl-full" />
                  <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-muted/20 rounded-tr-full" />
                  <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-muted/20 rounded-bl-full" />
                  <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-muted/30 rounded-br-full" />
                </div>

                {/* 他の人の回答を表示 */}
                {otherResponses.map((response, index) => {
                  const otherDotLeft = `${response.x_value}%`
                  const otherDotTop = `${100 - response.y_value}%`
                  return (
                    <div
                      key={index}
                      className="absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/30 border-2 border-primary/50 shadow-sm z-5"
                      style={{
                        left: otherDotLeft,
                        top: otherDotTop,
                        transition: 'left 0.1s ease-out, top 0.1s ease-out',
                      }}
                    />
                  )
                })}

                {/* 自分のドット（現在の位置） */}
                <div
                  className="absolute size-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-background bg-primary shadow-xl z-10 cursor-grab active:cursor-grabbing"
                  style={{
                    left: dotLeft,
                    top: dotTop,
                    borderColor: 'oklch(var(--background))',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25), 0 0 0 3px oklch(var(--primary) / 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
                    transition: 'left 0.1s ease-out, top 0.1s ease-out',
                  }}
                >
                  <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/30 to-transparent" />
                  {/* ドラッグハンドル（4つの小さな円） */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="flex flex-col gap-1">
                      <div className="flex gap-1 justify-center">
                        <div className="size-1.5 rounded-full bg-background shadow-sm" />
                        <div className="size-1.5 rounded-full bg-background shadow-sm" />
                      </div>
                      <div className="flex gap-1 justify-center">
                        <div className="size-1.5 rounded-full bg-background shadow-sm" />
                        <div className="size-1.5 rounded-full bg-background shadow-sm" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* グリッド線 */}
                <div className="absolute inset-0 opacity-25">
                  <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-primary/40" />
                  <div className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-primary/40" />
                </div>

                {/* コーナーラベル */}
                <div className="absolute inset-0 pointer-events-none p-3">
                  <div className="absolute top-2 right-2 text-xs font-light text-primary/80 bg-background/60 backdrop-blur-sm px-2 py-1 rounded-md">
                    興味あり<br />行けそう
                  </div>
                  <div className="absolute top-2 left-2 text-xs font-light text-muted-foreground/70 bg-background/60 backdrop-blur-sm px-2 py-1 rounded-md">
                    興味なし<br />行けそう
                  </div>
                  <div className="absolute bottom-2 right-2 text-xs font-light text-muted-foreground/70 bg-background/60 backdrop-blur-sm px-2 py-1 rounded-md">
                    興味あり<br />行けなそう
                  </div>
                  <div className="absolute bottom-2 left-2 text-xs font-light text-muted-foreground/70 bg-background/60 backdrop-blur-sm px-2 py-1 rounded-md">
                    興味なし<br />行けなそう
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 個別のスライダー */}
      <div className="flex flex-col gap-6">
        {/* 横軸スライダー（興味の度合い） */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-light text-muted-foreground">
              興味の度合い <span className="text-destructive">*</span>
            </label>
            <span className="text-xs font-medium text-foreground">{xValue}%</span>
          </div>
          <div className="relative">
            <div 
              ref={sliderRef}
              className="relative h-12 w-full flex items-center cursor-pointer"
              onMouseDown={(e) => {
                if (disabled) return
                const rect = sliderRef.current?.getBoundingClientRect()
                if (!rect) return
                const x = e.clientX - rect.left
                const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
                const newValue = Math.round(percentage)
                handleXChange(newValue)
              }}
            >
              {/* 背景トラック */}
              <div 
                className="absolute left-0 right-0 h-3 rounded-full bg-muted pointer-events-none" 
                style={{ 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  zIndex: 1 
                }} 
              />
              {/* フィル部分（スライドしたところまで色付け） */}
              <div
                className="absolute left-0 h-3 rounded-full pointer-events-none transition-all duration-150"
                style={{
                  width: `${xValue}%`,
                  backgroundColor: `var(--primary)`,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  borderRadius: '9999px',
                }}
              />
              {/* スライダー入力（透明、フォールバック用） */}
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={xValue}
                onChange={(e) => {
                  const newValue = Number.parseInt(e.target.value, 10)
                  handleXChange(newValue)
                }}
                onInput={(e) => {
                  const newValue = Number.parseInt((e.target as HTMLInputElement).value, 10)
                  handleXChange(newValue)
                }}
                disabled={disabled}
                className="feeling-slider absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-full bg-transparent outline-none transition-opacity disabled:cursor-not-allowed disabled:opacity-50 opacity-0"
                style={{ zIndex: 1, pointerEvents: 'none' }}
              />
              {/* カスタムハンドル（ドラッグ可能） */}
              <div
                className="absolute rounded-full cursor-grab active:cursor-grabbing transition-all duration-150 select-none touch-none"
                onMouseDown={handleSliderMouseDown}
                onTouchStart={handleSliderTouchStart}
                style={{
                  left: `clamp(0px, calc(${xValue}% - 10px), calc(100% - 20px))`,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '20px',
                  height: '20px',
                  backgroundColor: `oklch(0.45 0.15 35)`,
                  border: '2px solid oklch(var(--background))',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5), 0 0 0 3px oklch(0.45 0.15 35 / 0.4)',
                  zIndex: 50,
                  pointerEvents: 'auto',
                }}
              />
            </div>
            {/* 左右の指標 */}
            <div className="flex justify-between mt-1 px-1">
              <span className="text-xs font-light text-muted-foreground">低い</span>
              <span className="text-xs font-light text-muted-foreground">高い</span>
            </div>
          </div>
        </div>

        {/* 三択ボタン（行ける/行けない/未定） */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-light text-muted-foreground">
            現時点での参加の可否 <span className="text-destructive">*</span>
          </label>
          <div className="flex gap-2 w-full">
            <button
              type="button"
              onClick={() => handleAvailabilityChange("can")}
              disabled={disabled}
              className={`flex-1 px-4 py-3 rounded-2xl text-sm font-light transition-all duration-200 ${
                availabilityStatus === "can"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted/60 shadow-sm"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              行ける
            </button>
            <button
              type="button"
              onClick={() => handleAvailabilityChange("cannot")}
              disabled={disabled}
              className={`flex-1 px-4 py-3 rounded-2xl text-sm font-light transition-all duration-200 ${
                availabilityStatus === "cannot"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted/60 shadow-sm"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              行けない
            </button>
            <button
              type="button"
              onClick={() => handleAvailabilityChange("later")}
              disabled={disabled}
              className={`flex-1 px-4 py-3 rounded-2xl text-sm font-light transition-all duration-200 ${
                availabilityStatus === "later"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted/60 shadow-sm"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              未定
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
