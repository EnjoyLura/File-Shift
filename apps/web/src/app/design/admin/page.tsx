'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const adminTabs = ['系统总览', '用户管理', '任务记录'] as const;

const stats = [
  { label: '总用户数', value: 1248, change: '+12%', color: 'from-blue-500 to-indigo-500' },
  { label: '今日活跃', value: 186, change: '+8%', color: 'from-emerald-500 to-green-500' },
  { label: '总转换次数', value: 8934, change: '+23%', color: 'from-violet-500 to-purple-500' },
  { label: '今日转换', value: 342, change: '+15%', color: 'from-amber-500 to-orange-500' },
  { label: '积分消耗总量', value: 24560, change: '+18%', color: 'from-rose-500 to-pink-500' },
  { label: '今日积分消耗', value: 892, change: '+5%', color: 'from-cyan-500 to-teal-500' },
  { label: '今日注册', value: 23, change: '+32%', color: 'from-indigo-500 to-blue-500' },
  { label: '邀请总数', value: 156, change: '+9%', color: 'from-pink-500 to-rose-500' },
];

const users = [
  {
    id: 1,
    email: 'alice@example.com',
    nickname: 'Alice',
    status: '正常',
    credits: 156,
    registered: '2024-10-15',
    tasks: 45,
  },
  {
    id: 2,
    email: 'bob@gmail.com',
    nickname: 'Bob',
    status: '正常',
    credits: 89,
    registered: '2024-10-20',
    tasks: 23,
  },
  {
    id: 3,
    email: 'charlie@qq.com',
    nickname: 'Charlie',
    status: '禁用',
    credits: 0,
    registered: '2024-11-01',
    tasks: 12,
  },
  {
    id: 4,
    email: 'diana@163.com',
    nickname: 'Diana',
    status: '正常',
    credits: 234,
    registered: '2024-11-05',
    tasks: 67,
  },
  {
    id: 5,
    email: 'evan@outlook.com',
    nickname: 'Evan',
    status: '正常',
    credits: 45,
    registered: '2024-11-10',
    tasks: 8,
  },
];

const taskRecords = [
  {
    id: 1,
    user: 'alice@example.com',
    type: 'PNG 转 JPG',
    file: 'photo.png',
    status: '已完成',
    time: '2024-12-05 14:32',
  },
  {
    id: 2,
    user: 'bob@gmail.com',
    type: 'PDF 转 Word',
    file: 'report.pdf',
    status: '已完成',
    time: '2024-12-05 13:18',
  },
  {
    id: 3,
    user: 'diana@163.com',
    type: 'MP4 转 AVI',
    file: 'video.mp4',
    status: '处理中',
    time: '2024-12-05 13:15',
  },
  {
    id: 4,
    user: 'charlie@qq.com',
    type: 'HEIC 转 JPG',
    file: 'img.heic',
    status: '失败',
    time: '2024-12-05 12:40',
  },
  {
    id: 5,
    user: 'evan@outlook.com',
    type: '图片压缩',
    file: 'banner.png',
    status: '已完成',
    time: '2024-12-05 11:55',
  },
];

const statusColor: Record<string, string> = {
  正常: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  禁用: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
  已完成: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  处理中: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  失败: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
const stagger = { visible: { transition: { staggerChildren: 0.06 } } };

export default function DesignAdminPage() {
  const [activeTab, setActiveTab] = useState<string>('系统总览');
  const [search, setSearch] = useState('');
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedUser, setSelectedUser] = useState<(typeof users)[0] | null>(null);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold tracking-tight mb-8"
      >
        管理后台
      </motion.h1>

      {/* Tab 导航 */}
      <div className="flex items-center gap-1 border-b border-border mb-8">
        {adminTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="relative px-5 py-3 text-sm font-medium transition-colors"
            style={{
              color: activeTab === tab ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
            }}
          >
            {tab}
            {activeTab === tab && (
              <motion.div
                layoutId="admin-tab"
                className="absolute bottom-0 left-0 right-0 h-0.5 gradient-brand rounded-full"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* 系统总览 */}
        {activeTab === '系统总览' && (
          <motion.div
            key="overview"
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
            variants={stagger}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {stats.map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={fadeUp}
                  className="group rounded-2xl border border-border bg-background p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5"
                >
                  <div
                    className={`w-1 h-8 rounded-full bg-gradient-to-b ${stat.color} absolute top-4 left-0`}
                  />
                  <p className="text-xs text-muted-foreground mb-2">{stat.label}</p>
                  <p className="text-2xl font-bold group-hover:scale-105 transition-transform origin-left">
                    {stat.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-emerald-500 mt-1 font-medium">{stat.change}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 用户管理 */}
        {activeTab === '用户管理' && (
          <motion.div
            key="users"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {/* 搜索 */}
            <div className="relative w-full sm:w-80 mb-6">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索用户..."
                className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* 表格 */}
            <div className="rounded-2xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                        用户
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">
                        状态
                      </th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                        积分
                      </th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">
                        任务数
                      </th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">
                        注册时间
                      </th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users
                      .filter(
                        (u) =>
                          !search ||
                          u.email.includes(search) ||
                          u.nickname.toLowerCase().includes(search.toLowerCase()),
                      )
                      .map((user) => (
                        <tr
                          key={user.id}
                          className="border-t border-border transition-colors hover:bg-accent/30"
                        >
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium">{user.nickname}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[user.status]}`}
                            >
                              {user.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-medium">{user.credits}</td>
                          <td className="px-4 py-3 text-right text-muted-foreground hidden md:table-cell">
                            {user.tasks}
                          </td>
                          <td className="px-4 py-3 text-right text-muted-foreground hidden lg:table-cell">
                            {user.registered}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowDrawer(true);
                              }}
                              className="text-primary text-xs font-medium hover:underline"
                            >
                              管理
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* 任务记录 */}
        {activeTab === '任务记录' && (
          <motion.div
            key="tasks"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="rounded-2xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                        用户
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                        类型
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">
                        文件
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                        状态
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">
                        时间
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {taskRecords.map((record) => (
                      <tr
                        key={record.id}
                        className="border-t border-border transition-colors hover:bg-accent/30"
                      >
                        <td className="px-4 py-3 text-muted-foreground">{record.user}</td>
                        <td className="px-4 py-3 font-medium">{record.type}</td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                          {record.file}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[record.status]}`}
                          >
                            {record.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                          {record.time}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drawer 侧滑面板 */}
      <AnimatePresence>
        {showDrawer && selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 dark:bg-black/50 z-40"
              onClick={() => setShowDrawer(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border z-50 p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">用户管理</h2>
                <button
                  onClick={() => setShowDrawer(false)}
                  className="rounded-lg p-2 hover:bg-accent transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* 用户信息 */}
                <div className="rounded-2xl border border-border p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center text-white font-bold">
                      {selectedUser.nickname.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold">{selectedUser.nickname}</p>
                      <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-lg bg-muted/50 p-2">
                      <p className="text-xs text-muted-foreground">状态</p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[selectedUser.status]}`}
                      >
                        {selectedUser.status}
                      </span>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-2">
                      <p className="text-xs text-muted-foreground">积分</p>
                      <p className="font-medium">{selectedUser.credits}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-2">
                      <p className="text-xs text-muted-foreground">任务数</p>
                      <p className="font-medium">{selectedUser.tasks}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-2">
                      <p className="text-xs text-muted-foreground">注册时间</p>
                      <p className="font-medium">{selectedUser.registered}</p>
                    </div>
                  </div>
                </div>

                {/* 积分调整 */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">积分调整</h3>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="输入积分数（正数增加，负数减少）"
                      className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    <button className="gradient-brand text-white rounded-xl px-5 py-2.5 text-sm font-medium">
                      确认
                    </button>
                  </div>
                </div>

                {/* 账号操作 */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">账号操作</h3>
                  <div className="flex gap-2">
                    <button
                      className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                        selectedUser.status === '正常'
                          ? 'border-rose-300 text-rose-600 hover:bg-rose-50 dark:border-rose-500/30 dark:hover:bg-rose-500/5'
                          : 'border-emerald-300 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-500/30 dark:hover:bg-emerald-500/5'
                      }`}
                    >
                      {selectedUser.status === '正常' ? '禁用账号' : '启用账号'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
