export default function TobitatePage() {
  return (
    <div className="min-h-screen bg-amber-50/20">
      {/* Hero Section - Minimalist with large typography */}
      <section className="relative px-6 py-32 md:py-48 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="space-y-16">
            {/* Badge */}
            <div className="flex justify-center">
              <div className="inline-flex items-center border border-amber-600/15 bg-amber-100/30 px-6 py-2 text-xs font-light tracking-widest text-amber-900">
                トビタテ！留学JAPAN 第17期
              </div>
            </div>
            {/* Main Title */}
            <div className="space-y-8 text-center">
              <h1 className="text-6xl font-light tracking-tight text-balance md:text-7xl lg:text-8xl">桐越至恩</h1>
              <p className="text-xl font-extralight tracking-wide text-muted-foreground md:text-2xl">Kirikoshi Shion</p>
            </div>
            {/* Subtitle */}
            <div className="mx-auto max-w-3xl space-y-6 text-center">
              <p className="text-lg font-light leading-relaxed text-foreground/80 text-pretty md:text-xl">
                国際教養大学で社会学を専攻し、オーストラリアで「サードプレイス・モザイク」を研究。
              </p>
              <p className="text-lg font-light leading-relaxed text-foreground/80 text-pretty md:text-xl">
                持続可能な国際化を通じて、日本の地方創生に貢献することを目指しています。
              </p>
            </div>
            {/* Info Grid */}
            <div className="mx-auto grid max-w-2xl gap-12 pt-12 text-center md:grid-cols-3">
              <div className="space-y-2 rounded-lg bg-amber-100/20 p-6 border border-amber-200/30">
                <p className="text-xs font-light tracking-widest text-amber-700">UNIVERSITY</p>
                <p className="text-sm font-light">国際教養大学</p>
              </div>
              <div className="space-y-2 rounded-lg bg-amber-100/20 p-6 border border-amber-200/30">
                <p className="text-xs font-light tracking-widest text-amber-700">ORIGIN</p>
                <p className="text-sm font-light">秋田県能代市</p>
              </div>
              <div className="space-y-2 rounded-lg bg-amber-100/20 p-6 border border-amber-200/30">
                <p className="text-xs font-light tracking-widest text-amber-700">MAJOR</p>
                <p className="text-sm font-light">社会学（地域系）</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course & Motivation Section - Added new section for course and motivation */}
      <section className="border-t border-border px-6 py-32 lg:px-12">
        <div className="mx-auto max-w-5xl space-y-24">
          <div className="space-y-4 text-center">
            <h2 className="text-4xl font-light tracking-tight text-balance md:text-5xl lg:text-6xl">留学の背景</h2>
          </div>
          <div className="grid gap-16 lg:grid-cols-2">
            {/* Course */}
            <div className="space-y-8">
              <div className="space-y-4 border-b border-border pb-6">
                <p className="text-xs font-light tracking-widest text-muted-foreground">COURSE</p>
                <h3 className="text-2xl font-light tracking-tight">応募コース</h3>
              </div>
              <div className="space-y-6 text-sm font-light leading-relaxed text-foreground/70">
                <p className="text-lg">ダイバーシティコース</p>
                <p>
                  多様な背景を持つ学生が、グローバルな視点で社会課題に取り組むことを目指すコースです。私は社会学の視点から、都市と地方の持続可能な発展について研究します。
                </p>
              </div>
            </div>

            {/* Motivation */}
            <div className="space-y-8">
              <div className="space-y-4 border-b border-border pb-6">
                <p className="text-xs font-light tracking-widest text-muted-foreground">MOTIVATION</p>
                <h3 className="text-2xl font-light tracking-tight">留学のきっかけ</h3>
              </div>
              <div className="space-y-6 text-sm font-light leading-relaxed text-foreground/70">
                <p>
                  故郷である秋田県能代市の人口減少と地域活力の低下を目の当たりにし、持続可能な地方創生の在り方を模索してきました。
                </p>
                <p>
                  オーストラリアは多文化共生と都市計画の先進国であり、「サードプレイス」の概念が社会に根付いています。この知見を日本の地方都市に応用できると確信し、留学を決意しました。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Study Plan Section */}
      <section className="border-t border-border px-6 py-32 lg:px-12">
        <div className="mx-auto max-w-5xl space-y-24">
          {/* Section Title */}
          <div className="space-y-4 text-center">
            <h2 className="text-4xl font-light tracking-tight text-balance md:text-5xl lg:text-6xl">留学計画</h2>
            <p className="mx-auto max-w-2xl pt-6 text-base font-light leading-relaxed text-muted-foreground text-pretty">
              オーストラリアにおける「サードプレイス・モザイク」の社会学的考察と
              <br className="hidden md:inline" />
              日本地方への応用可能性の探究
            </p>
          </div>

          {/* Content Grid */}
          <div className="grid gap-16 md:grid-cols-3">
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-xs font-light tracking-widest text-muted-foreground">DESTINATION</p>
                <h3 className="text-xl font-light">留学先</h3>
              </div>
              <div className="space-y-3 text-sm font-light leading-relaxed text-foreground/70">
                <p>オーストラリア国立大学</p>
                <p className="text-xs">人文学部 都市社会学専攻</p>
                <p className="pt-2">キャンベラ、オーストラリア</p>
                <p>2026年2月〜11月（2学期間）</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-xs font-light tracking-widest text-muted-foreground">RESEARCH</p>
                <h3 className="text-xl font-light">研究内容</h3>
              </div>
              <p className="text-sm font-light leading-relaxed text-foreground/70">
                都市社会学を中心に学び、多文化社会における「サードプレイス・モザイク」の形成過程と役割を研究します。キャンベラの多様なコミュニティスペースを実地調査し、日本の地方都市における持続可能な国際化への応用可能性を探ります。
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-xs font-light tracking-widest text-muted-foreground">ACTIVITIES</p>
                <h3 className="text-xl font-light">実践活動</h3>
              </div>
              <div className="space-y-3 text-sm font-light leading-relaxed text-foreground/70">
                <p>キャンベラジャパンクラブと連携し、地域社会での日本文化理解を深める活動に参画</p>
                <p className="pt-2">月曜日〜金曜日、週5日の学修活動を予定</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Activities Section - Expanded activity descriptions and unified to 鍋パ */}
      <section className="border-t border-border px-6 py-32 lg:px-12">
        <div className="mx-auto max-w-5xl space-y-24">
          <div className="text-center">
            <h2 className="text-4xl font-light tracking-tight text-balance md:text-5xl lg:text-6xl">活動計画</h2>
          </div>
          <div className="grid gap-24 lg:grid-cols-2">
            {/* Ambassador Activity */}
            <div className="space-y-8">
              <div className="space-y-4 border-b border-border pb-6">
                <p className="text-xs font-light tracking-widest text-muted-foreground">AMBASSADOR</p>
                <h3 className="text-2xl font-light tracking-tight">アンバサダー活動</h3>
                <p className="text-xs font-light tracking-wide text-muted-foreground">国際交流・ネットワーク構築</p>
              </div>
              <div className="space-y-6 text-sm font-light leading-relaxed text-foreground/70">
                <div className="space-y-4">
                  <p className="font-normal text-foreground/90">オーストラリア国立大学の学生との鍋パ</p>
                  <p>
                    鍋パは、私が所属するALiveRallyという学生団体において、コミュニティづくりと人間関係構築に欠かせないものです。
                  </p>
                  <p>
                    ただ食事をするだけでなく、鍋を囲みながらディープな議論や対話を重ねることで、表面的ではない真の関係性を築きます。
                  </p>
                  <p>
                    この活動を通じて、オーストラリア国立大学の優秀な学生たちと将来的に友人やビジネスパートナーとしてのつながりを持ち、グローバルなネットワークを構築することを目指しています。
                  </p>
                </div>
                <div className="pt-6 border-t border-border/50 space-y-2">
                  <p className="text-xs tracking-wide text-muted-foreground">目的</p>
                  <p>
                    留学先での同世代のユースリーダーや活動領域に精通した方々と深い繋がりを持ち、将来的な協働の基盤を作る
                  </p>
                </div>
              </div>
            </div>

            {/* Evangelist Activity */}
            <div className="space-y-8">
              <div className="space-y-4 border-b border-border pb-6">
                <p className="text-xs font-light tracking-widest text-muted-foreground">EVANGELIST</p>
                <h3 className="text-2xl font-light tracking-tight">エヴァンジェリスト活動</h3>
                <p className="text-xs font-light tracking-wide text-muted-foreground">地方創生への還元</p>
              </div>
              <div className="space-y-6 text-sm font-light leading-relaxed text-foreground/70">
                <div className="space-y-4">
                  <p className="font-normal text-foreground/90">ZINEの制作と配布</p>
                  <p>
                    留学で得た持続可能な国際化の知見をZINE（小冊子）にまとめ、地域のサードプレイスへ寄付します。視覚的で親しみやすい形式で、研究成果を地域の人々と共有します。
                  </p>
                </div>
                <div className="space-y-4 pt-4">
                  <p className="font-normal text-foreground/90">「のしろ会議」でのプレゼンテーション</p>
                  <p>
                    「のしろ会議」は、能代市民であれば学生から高齢者まで誰でもプレゼンターとなれる地域イベントです。
                  </p>
                  <p>
                    私はインターンシップの際、主催場所であるコワーキングスペースで働いており、主催者とのつながりも十分にあります。
                  </p>
                  <p>
                    このイベントで留学成果を発表し、持続可能な国際化の知恵を能代市の地域活性化に深く関わる人々へ共有することで、彼らの視野を広げ、現在の活動を進化させていくことを目指します。
                  </p>
                </div>
                <div className="pt-6 border-t border-border/50 space-y-2">
                  <p className="text-xs tracking-wide text-muted-foreground">目的</p>
                  <p>研究成果を地域社会に還元し、地方創生の新たな可能性を切り拓く</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section - Expanded future vision */}
      <section className="border-t border-border px-6 py-32 lg:px-12">
        <div className="mx-auto max-w-4xl space-y-16">
          <div className="text-center">
            <h2 className="text-4xl font-light tracking-tight text-balance md:text-5xl lg:text-6xl">
              留学後のビジョン
            </h2>
          </div>
          <div className="space-y-12">
            <p className="text-base font-light leading-relaxed text-foreground/80 text-pretty md:text-lg text-center">
              オーストラリアで学んだ持続可能な国際化の手法を、日本の地方都市の活性化に応用していきます。
            </p>
            <div className="grid gap-12 md:grid-cols-2 pt-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-xs font-light tracking-widest text-muted-foreground">SHORT TERM</p>
                  <h3 className="text-xl font-light">在学中の活動</h3>
                </div>
                <div className="space-y-4 text-sm font-light leading-relaxed text-foreground/70">
                  <p>地域協力隊や地方創生に関わる人々と海外の人を巻き込み、国際交流イベントを開催します。</p>
                  <p>
                    秋田県能代市を中心に、留学で培ったネットワークを活かしながら、グローバルな視点を持った地域づくりを実践します。
                  </p>
                  <p>
                    調査で得られた知見をもとに、日本の持続可能な国際化への応用術を論文やプレゼンテーションで発表します。
                  </p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-xs font-light tracking-widest text-muted-foreground">LONG TERM</p>
                  <h3 className="text-xl font-light">将来の展望</h3>
                </div>
                <div className="space-y-4 text-sm font-light leading-relaxed text-foreground/70">
                  <p>
                    社会学の研究を深めながら、地方都市におけるサードプレイスの形成と多文化共生のモデルケースを構築します。
                  </p>
                  <p>
                    オーストラリアで築いたグローバルネットワークを活かし、国際的な視点を持ちながら日本の地方創生に長期的に貢献していきます。
                  </p>
                  <p>研究と実践の両面から、持続可能で開かれた地域コミュニティの実現を目指します。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-16 lg:px-12">
        <div className="mx-auto max-w-5xl space-y-4 text-center">
          <p className="text-xs font-light tracking-wide text-muted-foreground">
            トビタテ！留学JAPAN 新・日本代表プログラム 第17期 ダイバーシティコース
          </p>
          <p className="text-xs font-extralight text-muted-foreground">© 2026 Kirikoshi Shion. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

