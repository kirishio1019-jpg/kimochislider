"use client"

const countries = [
  { name: "オーストラリア", reviews: 48, avgCost: "350k", rating: 4.4 },
  { name: "カナダ", reviews: 42, avgCost: "320k", rating: 4.2 },
  { name: "イギリス", reviews: 38, avgCost: "380k", rating: 4.5 },
  { name: "アメリカ", reviews: 35, avgCost: "400k", rating: 4.1 },
  { name: "ニュージーランド", reviews: 28, avgCost: "340k", rating: 4.3 },
]

export default function CountryStatsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {countries.map((country) => (
        <div
          key={country.name}
          className="group bg-card border border-border rounded-xl p-5 hover:shadow-md hover:border-primary/40 transition-all duration-300 cursor-pointer"
        >
          <h3 className="font-semibold text-foreground mb-4 group-hover:text-primary transition-colors">
            {country.name}
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-xs font-medium">レビュー数</span>
              <span className="font-semibold text-foreground bg-muted/40 px-2 py-1 rounded-md">{country.reviews}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-xs font-medium">平均費用</span>
              <span className="font-semibold text-foreground bg-muted/40 px-2 py-1 rounded-md">¥{country.avgCost}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-xs font-medium">平均評価</span>
              <span className="font-semibold text-accent">{country.rating}★</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}



