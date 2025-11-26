"use client"

import UserMenu from "@/components/auth/user-menu"

interface NavigationProps {
  currentPage: string
  onPageChange: (page: string) => void
}

export default function Navigation({ currentPage, onPageChange }: NavigationProps) {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 min-w-0">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-baseline gap-2 min-w-0">
            <button
              onClick={() => onPageChange("home")}
              className="font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hover:opacity-75 transition-opacity flex items-baseline gap-1 flex-wrap min-w-0"
            >
              <span className="text-responsive-3xl break-words">Sappy</span>
              <span className="text-responsive-sm text-muted-foreground font-normal ml-2 break-words">- Study Abroad Platform -</span>
            </button>
            <span className="text-responsive-sm text-muted-foreground font-normal break-words hidden sm:inline">
              ALiveRally
            </span>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-1 flex-wrap min-w-0">
            {[
              { id: "home", label: "ホーム" },
              { id: "search", label: "検索" },
              { id: "comparison", label: "比較" },
              { id: "questions", label: "質問" },
              { id: "my-reviews", label: "マイレビュー" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`px-2 sm:px-3 py-2 text-responsive-sm font-medium transition-all duration-200 rounded-md whitespace-nowrap break-words ${
                  currentPage === item.id
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Right side: User Menu and CTA Button */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink-0">
            <UserMenu />
            <button
              onClick={() => onPageChange("post-review")}
              className="px-3 sm:px-4 py-2 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 font-medium text-responsive-sm whitespace-nowrap"
            >
              レビュー投稿
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}


