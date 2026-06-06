'use client';

import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

const toolCategories = [
  {
    title: '图片转换',
    desc: 'PNG、JPG、WebP、HEIC 等格式互转',
    icon: '🖼️',
    count: 7,
    color: 'from-emerald-500 to-green-500',
    span: 'md:col-span-2 md:row-span-2',
    tools: ['PNG ↔ JPG', 'PNG/JPG → WebP', 'HEIC → JPG', 'PNG → ICO'],
  },
  {
    title: '文档转换',
    desc: 'PDF、Word、Excel、PPT 格式互转',
    icon: '📄',
    count: 7,
    color: 'from-rose-500 to-pink-500',
    span: 'md:col-span-2',
    tools: ['PDF → Word', 'Word → PDF', 'PDF → Excel'],
  },
  {
    title: '音视频转换',
    desc: 'MP4、AVI、MP3、WAV 等格式互转',
    icon: '🎬',
    count: 5,
    color: 'from-violet-500 to-purple-500',
    span: 'md:col-span-2',
    tools: ['MP4 ↔ AVI', 'MP3 ↔ WAV', '视频提取音频'],
  },
  {
    title: 'PDF 工具',
    desc: '合并、拆分、水印',
    icon: '📕',
    count: 4,
    color: 'from-amber-500 to-orange-500',
    span: 'md:col-span-1',
    tools: ['PDF合并', 'PDF拆分'],
  },
  {
    title: '图片工具',
    desc: '裁剪、旋转、水印、压缩',
    icon: '✂️',
    count: 4,
    color: 'from-cyan-500 to-teal-500',
    span: 'md:col-span-1',
    tools: ['图片裁剪', '图片压缩'],
  },
  {
    title: '音视频工具',
    desc: '裁剪、截图、GIF制作、压缩',
    icon: '🎵',
    count: 6,
    color: 'from-indigo-500 to-blue-500',
    span: 'md:col-span-2',
    tools: ['GIF制作', '视频压缩', '视频裁剪'],
  },
];

const advantages = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
    title: '极速处理',
    desc: '秒级转换，不排队等待',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
    ),
    title: '隐私安全',
    desc: '文件24h自动清理，不存储内容',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
    ),
    title: '多端适配',
    desc: '电脑、平板、手机无缝使用',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    title: '积分灵活',
    desc: '按需付费，注册即送50积分',
  },
];

export default function DesignHomePage() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative gradient-hero text-white">
        {/* 装饰光斑 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"
            style={{ animation: 'float 8s ease-in-out infinite' }}
          />
          <div
            className="absolute top-20 -left-20 w-60 h-60 bg-blue-400/20 rounded-full blur-3xl"
            style={{ animation: 'float 6s ease-in-out infinite 2s' }}
          />
          <div
            className="absolute bottom-0 right-1/4 w-40 h-40 bg-indigo-400/15 rounded-full blur-2xl"
            style={{ animation: 'float 10s ease-in-out infinite 1s' }}
          />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 py-24 md:py-32 lg:py-40 text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div
              custom={0}
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-1.5 text-sm mb-8"
            >
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              34+ 文件处理工具，一站搞定
            </motion.div>

            <motion.h1
              custom={1}
              variants={fadeUp}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight"
            >
              文件格式转换
              <br />
              <span className="bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">
                从未如此简单
              </span>
            </motion.h1>

            <motion.p
              custom={2}
              variants={fadeUp}
              className="mt-6 text-lg md:text-xl text-blue-100/80 max-w-2xl mx-auto"
            >
              文档、图片、音视频格式转换，压缩，裁剪，水印……一个平台解决所有文件处理需求
            </motion.p>

            <motion.div
              custom={3}
              variants={fadeUp}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href="/design/auth/register"
                className="w-full sm:w-auto rounded-xl bg-white text-blue-900 px-8 py-3.5 text-base font-semibold transition-all hover:bg-blue-50 hover:shadow-lg hover:shadow-white/20 active:scale-[0.98]"
              >
                免费开始 — 送50积分
              </Link>
              <Link
                href="/design/convert"
                className="w-full sm:w-auto rounded-xl border border-white/30 backdrop-blur-sm px-8 py-3.5 text-base font-medium transition-all hover:bg-white/10 active:scale-[0.98]"
              >
                浏览所有工具 →
              </Link>
            </motion.div>

            {/* 数字亮点 */}
            <motion.div
              custom={4}
              variants={fadeUp}
              className="mt-16 grid grid-cols-3 gap-8 max-w-md mx-auto"
            >
              {[
                { num: '34+', label: '处理工具' },
                { num: '50', label: '注册赠送积分' },
                { num: '<3s', label: '平均转换时间' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl md:text-3xl font-bold">{stat.num}</p>
                  <p className="text-sm text-blue-200/70 mt-1">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* 底部波浪分割 */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full">
            <path
              d="M0 60L60 50C120 40 240 20 360 15C480 10 600 20 720 28C840 36 960 42 1080 40C1200 38 1320 28 1380 23L1440 18V60H0Z"
              className="fill-background"
            />
          </svg>
        </div>
      </section>

      {/* Bento Grid 功能区 */}
      <section className="mx-auto max-w-6xl px-4 py-20 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            一个平台，<span className="gradient-text">所有工具</span>
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            覆盖文档、图片、音视频三大类，34+ 种专业工具
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={stagger}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[180px]"
        >
          {toolCategories.map((cat, i) => (
            <motion.div
              key={cat.title}
              custom={i}
              variants={fadeUp}
              className={`${cat.span} group relative rounded-2xl border border-border bg-background p-5 md:p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 cursor-pointer overflow-hidden`}
            >
              {/* hover 渐变背景 */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`}
              />

              <div className="relative">
                <div className="flex items-start justify-between">
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-lg shadow-sm`}
                  >
                    {cat.icon}
                  </div>
                  <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                    {cat.count} 种工具
                  </span>
                </div>
                <h3 className="mt-4 font-semibold text-base">{cat.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{cat.desc}</p>

                {/* 工具列表 */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {cat.tools.slice(0, 3).map((tool) => (
                    <span
                      key={tool}
                      className="text-xs bg-muted/50 dark:bg-muted rounded-md px-2 py-0.5 text-muted-foreground"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 优势区域 */}
      <section className="bg-muted/30 dark:bg-muted/10">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {advantages.map((adv, i) => (
              <motion.div
                key={adv.title}
                custom={i}
                variants={fadeUp}
                className="text-center space-y-3"
              >
                <div className="w-14 h-14 rounded-2xl gradient-brand-subtle dark:bg-primary/5 mx-auto flex items-center justify-center text-primary">
                  {adv.icon}
                </div>
                <h3 className="font-semibold">{adv.title}</h3>
                <p className="text-sm text-muted-foreground">{adv.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA 区域 */}
      <section className="mx-auto max-w-6xl px-4 py-20 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl gradient-hero overflow-hidden p-10 md:p-16 text-center text-white"
        >
          {/* 装饰 */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl" />

          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">注册即送 50 积分</h2>
            <p className="mt-3 text-blue-100/80 text-lg">
              足够完成 25+ 次文件转换，深度体验所有功能
            </p>
            <Link
              href="/design/auth/register"
              className="mt-8 inline-block rounded-xl bg-white text-blue-900 px-10 py-3.5 text-base font-semibold transition-all hover:bg-blue-50 hover:shadow-lg hover:shadow-white/20 active:scale-[0.98]"
            >
              立即免费注册
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold gradient-text">FileShift</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors">
                关于我们
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                隐私政策
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                使用条款
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                联系我们
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">© 2024 FileShift</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
