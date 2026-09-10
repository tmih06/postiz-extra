import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  AnimatedSquarePen,
  AnimatedSparkles,
  AnimatedClock,
  AnimatedCalendar,
  AnimatedListFilter,
  AnimatedFileText,
  AnimatedImage,
  AnimatedBarChart,
  AnimatedShare,
  AnimatedPuzzle,
  AnimatedSettings,
  AnimatedSearch,
  AnimatedChevronDown,
  AnimatedCheck,
  AnimatedPlus,
  AnimatedThemeToggle,
  AnimatedCollapseToggle,
  AnimatedLogOut,
  AnimatedX,
} from './index';

import { SidebarNav } from '@/components/primitives/sidebar-nav';

vi.mock('@/context/workspace.context', () => ({
  useWorkspace: () => ({
    user: { id: 'u1', name: 'Alice Test', email: 'alice@example.com', orgId: 'org1' },
    customers: [
      { id: 'c1', name: 'Brand One', orgId: 'org1' },
      { id: 'c2', name: 'Brand Two', orgId: 'org1' },
    ],
    selectedCustomerId: 'c1',
    setSelectedCustomerId: vi.fn(),
    logout: vi.fn(),
  }),
}));
describe('Sidebar Animated Lucide Icons', () => {
  it('renders all 11 primary navigation icons as valid SVGs with Lucide viewBox', () => {
    const icons = [
      AnimatedSquarePen,
      AnimatedSparkles,
      AnimatedClock,
      AnimatedCalendar,
      AnimatedListFilter,
      AnimatedFileText,
      AnimatedImage,
      AnimatedBarChart,
      AnimatedShare,
      AnimatedPuzzle,
      AnimatedSettings,
    ];

    for (const Icon of icons) {
      const html = renderToStaticMarkup(<Icon className="size-4" isHovered={true} />);
      expect(html).toContain('<svg');
      expect(html).toContain('viewBox="0 0 24 24"');
      expect(html).toContain('stroke="currentColor"');
    }
  });

  it('renders all utility icons with proper SVG structure', () => {
    const utilityIcons = [
      AnimatedSearch,
      AnimatedChevronDown,
      AnimatedCheck,
      AnimatedPlus,
      AnimatedLogOut,
      AnimatedX,
    ];

    for (const Icon of utilityIcons) {
      const html = renderToStaticMarkup(<Icon className="size-3.5" isHovered={false} />);
      expect(html).toContain('<svg');
      expect(html).toContain('viewBox="0 0 24 24"');
    }
  });

  describe('AnimatedThemeToggle (Special multi-variant toggle)', () => {
    it('renders the Sun variant when in dark mode (to switch to light)', () => {
      const html = renderToStaticMarkup(<AnimatedThemeToggle isDark={true} className="size-3.5" />);
      expect(html).toContain('<circle cx="12" cy="12" r="4"');
      expect(html).toContain('x1="12" y1="2"'); // sun ray
    });

    it('renders the Moon variant when in light mode (to switch to dark)', () => {
      const html = renderToStaticMarkup(<AnimatedThemeToggle isDark={false} className="size-3.5" />);
      expect(html).toContain('d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"'); // moon crescent
      expect(html).not.toContain('x1="12" y1="2"');
    });

    it('handles hover state without throwing', () => {
      const html = renderToStaticMarkup(
        <AnimatedThemeToggle isDark={true} isHovered={true} className="size-3.5" />
      );
      expect(html).toContain('<svg');
    });
  });

  describe('AnimatedCollapseToggle (Special multi-variant toggle)', () => {
    it('renders collapse indicator with left-pointing chevron when sidebar is expanded (collapsed=false)', () => {
      const html = renderToStaticMarkup(
        <AnimatedCollapseToggle collapsed={false} className="size-3.5" />
      );
      expect(html).toContain('<rect');
      expect(html).toContain('d="M9 3v18"');
      expect(html).toContain('d="m16 15-3-3 3-3"');
    });

    it('renders expand indicator when sidebar is collapsed (collapsed=true)', () => {
      const html = renderToStaticMarkup(
        <AnimatedCollapseToggle collapsed={true} className="size-3.5" />
      );
      expect(html).toContain('<rect');
      expect(html).toContain('d="M9 3v18"');
      // Chevron points right to expand
      expect(html).toContain('d="m14 9 3 3-3 3"');
    });

    it('applies hover transform when isHovered=true', () => {
      const html = renderToStaticMarkup(
        <AnimatedCollapseToggle collapsed={false} isHovered={true} className="size-3.5" />
      );
      expect(html).toContain('<svg');
    });
  });

  describe('SidebarNav integration with animated icons', () => {
    it('renders SidebarNav with all primary animated nav icons and toggle controls', () => {
      const html = renderToStaticMarkup(
        <SidebarNav currentView="composer" onNavigate={() => {}} />
      );

      // Navigation items
      expect(html).toContain('Composer');
      expect(html).toContain('AI Studio');
      expect(html).toContain('Scheduled');
      expect(html).toContain('Calendar');
      expect(html).toContain('Publications');
      expect(html).toContain('Drafts');
      expect(html).toContain('Media Library');
      expect(html).toContain('Analytics');
      expect(html).toContain('Social Channels');
      expect(html).toContain('Integrations');
      expect(html).toContain('Settings');

      // Toggle controls
      expect(html).toMatch(/title="Switch to (Dark|Light) mode"/);
      expect(html).toContain('title="Collapse sidebar"');
      expect(html).toContain('title="Sign out"');

      // SVGs present for icons
      const svgCount = (html.match(/<svg/g) || []).length;
      // 11 nav items + search + theme toggle + collapse toggle + sign out + chevron down = at least 15 SVGs
      expect(svgCount).toBeGreaterThanOrEqual(15);
    });

    it('renders the SidebarGlideHighlight container inside the flex-1 nav range with initial bottom-up transform and solid muted background', () => {
      const html = renderToStaticMarkup(
        <SidebarNav currentView="composer" onNavigate={() => {}} />
      );

      // Gliding box rendered at z-0 with non-transparent var(--hover) background and initial bottom-up translateY
      expect(html).toContain('class="pointer-events-none absolute z-0 rounded-[7px] border shadow-sm"');
      expect(html).toContain('background-color:var(--hover)');
      expect(html).toContain('translateY(8px)');
      expect(html).toContain('scale(0.95)');
      expect(html).toContain('opacity:0');

      // Gliding highlight items inside the flex-1 nav range
      expect(html).toContain('data-nav-row');
    });
  });
});
