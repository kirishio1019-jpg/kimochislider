export default function Header() {
  return (
    <header className="relative overflow-hidden bg-background">
      <div className="relative h-[450px] sm:h-[550px] md:h-[650px] overflow-hidden">
        {/* 背景グラデーション */}
        <div className="w-full h-full bg-gradient-to-br from-primary/5 via-secondary/3 to-primary/5" />
        
        {/* シャボン玉風の装飾的な丸（背景レイヤー） */}
        {/* 特大サイズのシャボン玉 */}
        <div className="absolute bottom-20 left-10 w-[600px] h-[600px] rounded-full blur-3xl animate-pulse z-0 border border-primary/10" style={{ 
          background: 'radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.25), rgba(59, 130, 246, 0.1), transparent)',
          animationDelay: '2s',
          animationDuration: '6s'
        }} />
        <div className="absolute top-10 right-10 w-[520px] h-[520px] rounded-full blur-3xl animate-pulse z-0 border border-primary/10" style={{ 
          background: 'radial-gradient(circle at 30% 30%, rgba(59, 130, 246, 0.22), rgba(59, 130, 246, 0.08), transparent)',
          animationDelay: '0s',
          animationDuration: '4s'
        }} />
        {/* 大きなシャボン玉 */}
        <div className="absolute top-32 right-1/4 w-96 h-96 rounded-full blur-2xl animate-pulse z-0 border border-secondary/15" style={{ 
          background: 'radial-gradient(circle at 40% 40%, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.08), transparent)',
          animationDelay: '1s',
          animationDuration: '5s'
        }} />
        <div className="absolute bottom-40 left-1/3 w-[380px] h-[380px] rounded-full blur-2xl animate-pulse z-0 border border-secondary/15" style={{ 
          background: 'radial-gradient(circle at 35% 35%, rgba(139, 92, 246, 0.18), rgba(139, 92, 246, 0.06), transparent)',
          animationDelay: '0.5s',
          animationDuration: '4.5s'
        }} />
        {/* 中サイズのシャボン玉 */}
        <div className="absolute top-1/2 left-1/4 w-80 h-80 rounded-full blur-2xl animate-pulse z-0 border border-primary/12" style={{ 
          background: 'radial-gradient(circle at 30% 30%, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.08), transparent)',
          animationDelay: '1.5s',
          animationDuration: '5s'
        }} />
        <div className="absolute top-1/3 right-1/3 w-72 h-72 rounded-full blur-xl animate-pulse z-0 border border-secondary/18" style={{ 
          background: 'radial-gradient(circle at 40% 40%, rgba(139, 92, 246, 0.18), rgba(139, 92, 246, 0.06), transparent)',
          animationDelay: '2.5s',
          animationDuration: '4s'
        }} />
        <div className="absolute top-1/4 left-1/2 w-64 h-64 rounded-full blur-xl animate-pulse z-0 border border-primary/15" style={{ 
          background: 'radial-gradient(circle at 35% 35%, rgba(59, 130, 246, 0.22), rgba(59, 130, 246, 0.08), transparent)',
          animationDelay: '3.5s',
          animationDuration: '5.5s'
        }} />
        {/* 小さなシャボン玉 */}
        <div className="absolute top-20 left-1/2 w-56 h-56 rounded-full blur-xl animate-pulse z-0 border border-primary/18" style={{ 
          background: 'radial-gradient(circle at 35% 35%, rgba(59, 130, 246, 0.25), rgba(59, 130, 246, 0.1), transparent)',
          animationDelay: '3s',
          animationDuration: '3.5s'
        }} />
        <div className="absolute bottom-1/3 right-20 w-52 h-52 rounded-full blur-xl animate-pulse z-0 border border-secondary/20" style={{ 
          background: 'radial-gradient(circle at 30% 30%, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.08), transparent)',
          animationDelay: '1.2s',
          animationDuration: '4.5s'
        }} />
        <div className="absolute top-2/3 right-1/2 w-48 h-48 rounded-full blur-xl animate-pulse z-0 border border-primary/15" style={{ 
          background: 'radial-gradient(circle at 40% 40%, rgba(59, 130, 246, 0.18), rgba(59, 130, 246, 0.06), transparent)',
          animationDelay: '2.2s',
          animationDuration: '5.5s'
        }} />
        {/* より小さなシャボン玉 */}
        <div className="absolute top-16 right-1/2 w-36 h-36 rounded-full blur-lg animate-pulse z-0 border border-secondary/20" style={{ 
          background: 'radial-gradient(circle at 35% 35%, rgba(139, 92, 246, 0.22), rgba(139, 92, 246, 0.08), transparent)',
          animationDelay: '1.8s',
          animationDuration: '3.8s'
        }} />
        <div className="absolute bottom-1/4 left-1/5 w-40 h-40 rounded-full blur-lg animate-pulse z-0 border border-primary/18" style={{ 
          background: 'radial-gradient(circle at 30% 30%, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.07), transparent)',
          animationDelay: '2.8s',
          animationDuration: '4.2s'
        }} />
        <div className="absolute top-3/4 left-2/3 w-44 h-44 rounded-full blur-lg animate-pulse z-0 border border-secondary/18" style={{ 
          background: 'radial-gradient(circle at 40% 40%, rgba(139, 92, 246, 0.19), rgba(139, 92, 246, 0.07), transparent)',
          animationDelay: '0.8s',
          animationDuration: '4.8s'
        }} />
        {/* 最小サイズのシャボン玉 */}
        <div className="absolute top-12 left-1/3 w-28 h-28 rounded-full blur-md animate-pulse z-0 border border-primary/20" style={{ 
          background: 'radial-gradient(circle at 35% 35%, rgba(59, 130, 246, 0.24), rgba(59, 130, 246, 0.09), transparent)',
          animationDelay: '3.2s',
          animationDuration: '3.2s'
        }} />
        <div className="absolute bottom-16 right-1/4 w-32 h-32 rounded-full blur-md animate-pulse z-0 border border-secondary/22" style={{ 
          background: 'radial-gradient(circle at 30% 30%, rgba(139, 92, 246, 0.21), rgba(139, 92, 246, 0.08), transparent)',
          animationDelay: '1.6s',
          animationDuration: '3.6s'
        }} />
        
        {/* グリッドパターン */}
        <div className="absolute inset-0 opacity-[0.02] z-0" style={{
          backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          color: 'currentColor'
        }} />

        {/* オーバーレイ（シャボン玉の上に配置） */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent z-[1]" />

        <div className="absolute inset-0 flex items-center justify-center px-6 sm:px-8 md:px-12">
          <div className="text-center space-y-6 max-w-4xl relative z-10">
            <div className="inline-block relative">
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif font-light text-foreground leading-tight tracking-tighter transform transition-transform hover:scale-105 duration-300 relative">
                今日はどこで過ごす？
                {/* タイトル下のアクセント線 */}
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent rounded-full" />
              </h1>
            </div>
            <p className="text-base sm:text-lg md:text-xl font-serif text-foreground/70 pt-4 max-w-2xl mx-auto leading-relaxed">
              みんなのお気に入りスポットを参考にして、新たな魅力を見つけよう。
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}


