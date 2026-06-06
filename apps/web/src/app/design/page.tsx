import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FileShift Design System',
  description: '设计系统总览 - 色彩、字体、组件、动效',
};

export default function DesignSystemPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 space-y-16">
      {/* 标题 */}
      <section>
        <h1 className="text-4xl font-bold tracking-tight gradient-text">FileShift Design System</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          极简灵动风格 — 蓝紫渐变品牌色、Bento Grid 布局、精致微动画
        </p>
      </section>

      {/* 色彩系统 */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">色彩系统</h2>

        {/* 品牌色 */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            品牌渐变
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl p-6 gradient-brand text-white space-y-2">
              <p className="text-sm opacity-80">Brand Gradient</p>
              <p className="text-2xl font-bold">Blue → Purple</p>
              <p className="text-xs font-mono opacity-70">#3B82F6 → #8B5CF6</p>
            </div>
            <div className="rounded-2xl p-6 gradient-hero text-white space-y-2">
              <p className="text-sm opacity-80">Hero Gradient</p>
              <p className="text-2xl font-bold">Deep Blue → Violet</p>
              <p className="text-xs font-mono opacity-70">#1E3A8A → #5B21B6 → #7C3AED</p>
            </div>
            <div className="rounded-2xl p-6 gradient-brand-subtle border border-border space-y-2">
              <p className="text-sm text-muted-foreground">Subtle Gradient</p>
              <p className="text-2xl font-bold">Light Background</p>
              <p className="text-xs font-mono text-muted-foreground">#EEF1FE → #F3F0FF</p>
            </div>
          </div>
        </div>

        {/* 语义色 */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            语义色彩
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { name: 'Primary', class: 'bg-primary', text: '主色' },
              { name: 'Success', class: 'bg-emerald-500', text: '成功' },
              { name: 'Warning', class: 'bg-amber-500', text: '警告' },
              { name: 'Error', class: 'bg-rose-500', text: '错误' },
              { name: 'Info', class: 'bg-indigo-500', text: '信息' },
            ].map((color) => (
              <div key={color.name} className="space-y-2">
                <div className={`h-16 rounded-xl ${color.class}`} />
                <p className="text-sm font-medium">{color.text}</p>
                <p className="text-xs text-muted-foreground">{color.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 功能分类色 */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            功能分类色
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { name: '图片类', color: '#10B981', class: 'bg-emerald-500' },
              { name: '文档类', color: '#F43F5E', class: 'bg-rose-500' },
              { name: '音视频', color: '#8B5CF6', class: 'bg-violet-500' },
              { name: '压缩类', color: '#F59E0B', class: 'bg-amber-500' },
              { name: '工具类', color: '#06B6D4', class: 'bg-cyan-500' },
            ].map((cat) => (
              <div key={cat.name} className="space-y-2">
                <div className={`h-12 rounded-lg ${cat.class}`} />
                <p className="text-sm font-medium">{cat.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{cat.color}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 中性色 */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            中性色阶
          </h3>
          <div className="flex gap-1 h-16 rounded-xl overflow-hidden">
            {[
              'bg-gray-50',
              'bg-gray-100',
              'bg-gray-200',
              'bg-gray-300',
              'bg-gray-400',
              'bg-gray-500',
              'bg-gray-600',
              'bg-gray-700',
              'bg-gray-800',
              'bg-gray-900',
            ].map((c) => (
              <div key={c} className={`flex-1 ${c}`} />
            ))}
          </div>
        </div>
      </section>

      {/* 字体系统 */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">字体系统</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-border p-6 space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              字号层级
            </h3>
            <p className="text-5xl font-extrabold tracking-tight">Display 3rem</p>
            <p className="text-4xl font-bold tracking-tight">H1 - 2.25rem</p>
            <p className="text-3xl font-bold">H2 - 1.875rem</p>
            <p className="text-2xl font-semibold">H3 - 1.5rem</p>
            <p className="text-xl font-medium">H4 - 1.25rem</p>
            <p className="text-base">Body - 1rem 正文文字</p>
            <p className="text-sm text-muted-foreground">Small - 0.875rem 辅助说明</p>
            <p className="text-xs text-muted-foreground">Tiny - 0.75rem 标签徽章</p>
          </div>
          <div className="rounded-2xl border border-border p-6 space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              字重
            </h3>
            <p className="font-extrabold text-lg">ExtraBold (800) — Display 标题</p>
            <p className="font-bold text-lg">Bold (700) — 主标题、重要数字</p>
            <p className="font-semibold text-lg">Semibold (600) — 按钮、小标题</p>
            <p className="font-medium text-lg">Medium (500) — 导航、标签</p>
            <p className="font-normal text-lg">Regular (400) — 正文</p>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider pt-4">
              渐变色文字
            </h3>
            <p className="text-3xl font-bold gradient-text">FileShift 文件格式转换</p>
          </div>
        </div>
      </section>

      {/* 圆角与阴影 */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">圆角 & 阴影</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-border p-6 space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              圆角梯度
            </h3>
            <div className="flex gap-3 flex-wrap">
              {[
                { label: 'sm (4px)', cls: 'rounded-sm' },
                { label: 'md (6px)', cls: 'rounded-md' },
                { label: 'lg (12px)', cls: 'rounded-lg' },
                { label: 'xl (16px)', cls: 'rounded-xl' },
                { label: '2xl (20px)', cls: 'rounded-2xl' },
                { label: 'full', cls: 'rounded-full' },
              ].map((r) => (
                <div
                  key={r.label}
                  className={`w-16 h-16 bg-primary/10 border-2 border-primary/30 ${r.cls} flex items-center justify-center`}
                >
                  <span className="text-xs text-primary font-medium">{r.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-border p-6 space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              阴影层次
            </h3>
            <div className="flex gap-4 flex-wrap">
              {[
                { label: 'xs', cls: 'shadow-xs' },
                { label: 'sm', cls: 'shadow-sm' },
                { label: 'md', cls: 'shadow-md' },
                { label: 'lg', cls: 'shadow-lg' },
                { label: 'glow', cls: 'shadow-glow' },
              ].map((s) => (
                <div
                  key={s.label}
                  className={`w-20 h-20 rounded-xl bg-background border border-border ${s.cls} flex items-center justify-center`}
                >
                  <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 组件预览 */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">组件预览</h2>

        {/* 按钮 */}
        <div className="rounded-2xl border border-border p-6 space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            按钮 Buttons
          </h3>
          <div className="flex flex-wrap gap-3">
            <button className="gradient-brand text-white rounded-lg px-6 py-2.5 text-sm font-medium transition-all hover:opacity-90 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]">
              渐变主按钮
            </button>
            <button className="bg-primary text-primary-foreground rounded-lg px-6 py-2.5 text-sm font-medium transition-all hover:bg-primary/90 active:scale-[0.98]">
              主色按钮
            </button>
            <button className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium transition-all hover:bg-accent active:scale-[0.98]">
              次要按钮
            </button>
            <button className="text-primary rounded-lg px-6 py-2.5 text-sm font-medium transition-all hover:bg-primary/5">
              幽灵按钮
            </button>
            <button className="rounded-lg bg-rose-500 text-white px-6 py-2.5 text-sm font-medium transition-all hover:bg-rose-600 active:scale-[0.98]">
              危险按钮
            </button>
            <button className="rounded-lg bg-muted text-muted-foreground px-6 py-2.5 text-sm font-medium cursor-not-allowed opacity-50">
              禁用状态
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="gradient-brand text-white rounded-lg px-8 py-3 text-base font-semibold transition-all hover:opacity-90 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]">
              Large
            </button>
            <button className="gradient-brand text-white rounded-lg px-6 py-2.5 text-sm font-medium transition-all hover:opacity-90 active:scale-[0.98]">
              Medium
            </button>
            <button className="gradient-brand text-white rounded-lg px-4 py-1.5 text-xs font-medium transition-all hover:opacity-90 active:scale-[0.98]">
              Small
            </button>
          </div>
        </div>

        {/* 输入框 */}
        <div className="rounded-2xl border border-border p-6 space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            输入框 Inputs
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            <div className="space-y-2">
              <label className="text-sm font-medium">邮箱</label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">密码</label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 徽章 */}
        <div className="rounded-2xl border border-border p-6 space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            状态徽章 Badges
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              {
                label: '成功',
                cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
              },
              {
                label: '失败',
                cls: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
              },
              {
                label: '处理中',
                cls: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
              },
              {
                label: '排队中',
                cls: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
              },
              {
                label: '已过期',
                cls: 'bg-gray-100 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400',
              },
            ].map((b) => (
              <span
                key={b.label}
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${b.cls}`}
              >
                {b.label}
              </span>
            ))}
          </div>
        </div>

        {/* 卡片 */}
        <div className="rounded-2xl border border-border p-6 space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            卡片 Cards
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-border p-6 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20">
              <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center text-white text-lg mb-4">
                📄
              </div>
              <h4 className="font-semibold">基础卡片</h4>
              <p className="text-sm text-muted-foreground mt-1">hover 上浮 + 阴影 + 边框高亮</p>
            </div>
            <div className="rounded-2xl p-6 gradient-brand-subtle border border-primary/10 transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-white/80 dark:bg-white/10 flex items-center justify-center text-lg mb-4">
                🖼️
              </div>
              <h4 className="font-semibold">渐变底色卡片</h4>
              <p className="text-sm text-muted-foreground mt-1">subtle gradient 背景</p>
            </div>
            <div className="rounded-2xl glass p-6 transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg mb-4">
                ✨
              </div>
              <h4 className="font-semibold">毛玻璃卡片</h4>
              <p className="text-sm text-muted-foreground mt-1">glassmorphism 效果</p>
            </div>
          </div>
        </div>

        {/* 进度条 */}
        <div className="rounded-2xl border border-border p-6 space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            进度条 Progress
          </h3>
          <div className="space-y-4 max-w-lg">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>上传中...</span>
                <span className="text-muted-foreground">67%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full gradient-brand shimmer"
                  style={{ width: '67%' }}
                />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>转换中...</span>
                <span className="text-muted-foreground">35%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 shimmer"
                  style={{ width: '35%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 动效说明 */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">动效规范</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'Fade Up', desc: '入场动画', time: '600ms', demo: 'animate-fade-up' },
            { name: 'Scale In', desc: '缩放进入', time: '300ms', demo: 'animate-scale-in' },
            { name: 'Bounce In', desc: '弹性进入', time: '600ms', demo: 'animate-bounce-in' },
            {
              name: 'Slide Right',
              desc: '右侧滑入',
              time: '500ms',
              demo: 'animate-slide-in-right',
            },
          ].map((a) => (
            <div
              key={a.name}
              className={`rounded-2xl border border-border p-6 text-center ${a.demo}`}
            >
              <div className="w-12 h-12 rounded-xl gradient-brand mx-auto mb-3" />
              <h4 className="font-semibold text-sm">{a.name}</h4>
              <p className="text-xs text-muted-foreground mt-1">
                {a.desc} · {a.time}
              </p>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          更复杂的动效（hover 交互、布局动画、手势等）使用 framer-motion
          库实现，请在各页面原型中体验。
        </p>
      </section>
    </div>
  );
}
