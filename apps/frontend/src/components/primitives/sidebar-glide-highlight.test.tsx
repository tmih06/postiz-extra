import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SidebarGlideHighlight } from './sidebar-glide-highlight';

describe('SidebarGlideHighlight Component', () => {
  it('renders initial muted background box with zero opacity and bottom-up transform', () => {
    const fakeRef = React.createRef<HTMLElement>();
    const html = renderToStaticMarkup(
      <SidebarGlideHighlight containerRef={fakeRef} />
    );

    // Initial render is hidden with bottom-up translateY(8px) and scale(0.95)
    expect(html).toContain('class="pointer-events-none absolute z-0 rounded-[7px] border shadow-sm"');
    expect(html).toContain('background-color:var(--hover)');
    expect(html).toContain('opacity:0');
    expect(html).toContain('translateY(8px)');
    expect(html).toContain('scale(0.95)');
  });

  it('accepts custom className and renders without errors', () => {
    const fakeRef = React.createRef<HTMLElement>();
    const html = renderToStaticMarkup(
      <SidebarGlideHighlight containerRef={fakeRef} className="custom-glide-highlight" />
    );

    expect(html).toContain('custom-glide-highlight');
  });
});
