'use client'

import React from 'react'
import Link from 'next/link'
import { PanelLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { tokens } from '@/components/system/tokens'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { ExamindLogo } from '@/components/brand/ExamindLogo'
import { TopPillNav } from './TopPillNav'
import { TopRightCluster } from './TopRightCluster'
import { GreetingHeader } from './GreetingHeader'
import { NavTabItem } from './types'

interface DashboardShellProps {
  navTabs?: NavTabItem[]
  activeTab?: string
  onTabChange?: (tabId: string) => void
  greetingName?: string
  greetingSubtitle?: string
  greetingAction?: React.ReactNode
  greetingVariant?: 'plain' | 'band'
  showGreeting?: boolean
  className?: string
  children: React.ReactNode
}

export function DashboardShell({
  navTabs,
  activeTab,
  onTabChange,
  greetingName,
  greetingSubtitle,
  greetingAction,
  greetingVariant = 'plain',
  showGreeting = true,
  className = '',
  children,
}: DashboardShellProps) {
  const { user } = useAuthStore()
  const { toggleSidebar, sidebarOpen } = useUiStore()

  const displayName = greetingName || user?.full_name || 'Administrator'

  return (
    <div className={cn('space-y-6 w-full font-sans', className)}>
      {/* Top Floating Header Area (Brand pill, Pill Tabs, Cluster) */}
      <header className="flex flex-col md:flex-row items-center justify-between gap-3 w-full">
        {/* Left: Mobile Drawer Trigger & Brand Lockup */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <div className="flex items-center gap-2">
            {/* Mobile Sidebar Hamburger Button */}
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label="Alihkan Sidebar Navigasi"
              aria-expanded={sidebarOpen}
              className={cn(
                'md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center p-2.5 bg-white text-slate-600 hover:text-[#150f23] transition-colors cursor-pointer',
                tokens.radius.full,
                tokens.border.default,
                tokens.shadow.subtle
              )}
            >
              <PanelLeft className="w-5 h-5" aria-hidden="true" />
            </button>

            {/* Brand Pill (Visible on mobile, and clean anchor on desktop) */}
            <Link
              href="/dashboard"
              className={cn(
                'bg-white px-3.5 py-1.5 flex items-center gap-2 hover:border-[#c9c2ec] transition-colors group',
                tokens.radius.full,
                tokens.border.default,
                tokens.shadow.subtle
              )}
            >
              <ExamindLogo variant="lockup" theme="color" className="h-5 sm:h-6 w-auto shrink-0" priority />
              <span className={cn('text-[10px] font-bold px-1.5 py-0.2 font-mono tracking-wider shrink-0', tokens.radius.xs, tokens.semantic.violet.badge)}>
                CBT
              </span>
            </Link>
          </div>


          {/* Right cluster on mobile */}
          <div className="md:hidden">
            <TopRightCluster />
          </div>
        </div>

        {/* Center: Top Pill Tab Navigation */}
        {navTabs && navTabs.length > 0 && (
          <div className="w-full md:w-auto flex justify-start md:justify-center overflow-x-auto py-1 max-w-full touch-pan-x scrollbar-none">
            <TopPillNav
              tabs={navTabs}
              activeTab={activeTab || navTabs[0]?.id || ''}
              onChange={onTabChange}
            />
          </div>
        )}

        {/* Right: Desktop Actions & User Profile Chip */}
        <div className="hidden md:flex items-center shrink-0">
          <TopRightCluster />
        </div>
      </header>

      {/* Greeting Header */}
      {showGreeting && (
        <GreetingHeader
          name={displayName}
          subtitle={greetingSubtitle}
          action={greetingAction}
          variant={greetingVariant}
        />
      )}

      {/* Main Dashboard Cards Content */}
      <div className="w-full">{children}</div>
    </div>
  )
}

export default DashboardShell
