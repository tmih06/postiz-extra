import React, { useState } from 'react';
import { useWorkspace } from '@/context/workspace.context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusPill } from '@/components/atoms/status-pill';
import {
  Settings,
  Users,
  Building,
  Bell,
  PenTool,
  Key,
  Check,
  Plus,
  Trash2,
  Mail,
  Shield,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Available navigation tabs within the workspace settings view.
 */
type SettingsTab = 'general' | 'profiles' | 'team' | 'signatures' | 'notifications' | 'api';

/**
 * Workspace settings and configuration management view.
 *
 * Houses sub-views and form controls for:
 * - **General**: Organization name, publishing timezone, and owner account info.
 * - **Brand Profiles**: Sub-brand and customer group listings with management actions.
 * - **Team Members**: Teammates, role allocations, and invitation modal trigger.
 * - **Signatures**: Default appended post footers, disclaimers, and hashtag blocks.
 * - **Notifications**: Email digests and real-time failure alert subscriptions.
 * - **API & Keys**: Developer secret tokens and programmatic access controls.
 *
 * @returns The rendered workspace settings page with side navigation and active configuration panel.
 */
export function SettingsView() {
  const { user, customers, selectedCustomer } = useWorkspace();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [saved, setSaved] = useState(false);

  // Form states
  const [orgName, setOrgName] = useState('Postiz Workspace');
  const [timezone, setTimezone] = useState('UTC (Coordinated Universal Time)');
  const [signatureText, setSignatureText] = useState('—\nFollow @postizapp for open-source social publishing');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [failureAlerts, setFailureAlerts] = useState(true);

  /**
   * Handles persisting setting modifications and triggers temporary saved state feedback.
   *
   * Sets `saved` state to true and automatically resets it back to false after 2000ms.
   */
  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs: { id: SettingsTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'profiles', label: 'Brand Profiles', icon: Building },
    { id: 'team', label: 'Team Members', icon: Users },
    { id: 'signatures', label: 'Signatures', icon: PenTool },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'api', label: 'API & Keys', icon: Key },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
          Workspace Settings
        </h1>
        <p className="text-sm text-ink-2 mt-1">
          Manage workspace preferences, brand profiles, team permissions, and automation defaults.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* Settings Navigation Tabs */}
        <aside className="w-full lg:w-56 shrink-0 rounded-card border border-line bg-surface p-2 shadow-card">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto hide-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2.5 rounded-control px-3 py-2 text-[13px] font-medium transition-colors whitespace-nowrap text-left',
                    isActive
                      ? 'bg-foreground text-background font-semibold shadow-btn'
                      : 'text-ink-2 hover:bg-hover hover:text-ink'
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content Box */}
        <div className="flex-1 w-full rounded-card border border-line bg-surface p-6 shadow-card">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-ink">General Configuration</h2>
                <p className="text-xs text-ink-3 mt-0.5">Primary workspace properties and default scheduling timezone.</p>
              </div>

              <div className="space-y-4 max-w-md">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink">Organization Name</label>
                  <Input
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="h-9 rounded-control border-line bg-page text-sm text-ink"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink">Default Publishing Timezone</label>
                  <Input
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="h-9 rounded-control border-line bg-page text-sm text-ink font-mono"
                  />
                  <p className="text-[11px] text-ink-3">All scheduled slots and queue recommendations align to this timezone.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink">Workspace Account</label>
                  <div className="rounded-control border border-line/60 bg-page/50 p-2.5 flex items-center justify-between text-xs">
                    <span className="font-mono text-ink-2">{user?.email || 'admin@postiz.com'}</span>
                    <StatusPill tone="green" dot={true}>Active Owner</StatusPill>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-line-soft flex items-center gap-2">
                <Button
                  onClick={handleSave}
                  className="rounded-control bg-foreground text-background font-semibold shadow-btn"
                >
                  {saved ? <Check className="size-4 mr-1 text-green" /> : null}
                  {saved ? 'Saved Changes' : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}

          {/* Profiles Tab */}
          {activeTab === 'profiles' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-ink">Brand Profiles & Groups</h2>
                  <p className="text-xs text-ink-3 mt-0.5">Separate identity groups for clients, sub-brands, and personal ventures.</p>
                </div>

                <Button size="sm" className="rounded-control bg-foreground text-background font-semibold shadow-btn text-xs">
                  <Plus className="size-3.5 mr-1" /> New Brand Profile
                </Button>
              </div>

              <div className="divide-y divide-line-soft">
                {customers.map((c) => (
                  <div key={c.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-control bg-line font-bold text-xs">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-semibold text-sm text-ink block">{c.name}</span>
                        <span className="text-[11px] text-ink-3 font-mono">ID: {c.id}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="h-7 text-xs border-line">
                        Edit Group
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Team Tab */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-ink">Team Members & Access</h2>
                  <p className="text-xs text-ink-3 mt-0.5">Invite teammates to collaborate on drafting, scheduling, and approving posts.</p>
                </div>

                <Button size="sm" className="rounded-control bg-foreground text-background font-semibold shadow-btn text-xs">
                  <Plus className="size-3.5 mr-1" /> Invite Teammate
                </Button>
              </div>

              <div className="rounded-control border border-line divide-y divide-line-soft overflow-hidden">
                <div className="p-3 bg-page/50 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="size-7 rounded-full bg-foreground text-background font-bold text-xs flex items-center justify-center">
                      {user?.name ? user.name.charAt(0) : 'A'}
                    </div>
                    <div>
                      <span className="font-semibold text-sm text-ink block">{user?.name || 'Administrator'}</span>
                      <span className="text-[11px] text-ink-3 font-mono">{user?.email || 'admin@postiz.com'}</span>
                    </div>
                  </div>
                  <StatusPill tone="accent" dot={false}>Workspace Owner</StatusPill>
                </div>
              </div>
            </div>
          )}

          {/* Signatures Tab */}
          {activeTab === 'signatures' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-ink">Post Signatures & Footers</h2>
                <p className="text-xs text-ink-3 mt-0.5">Reusable footers, hashtags, or disclaimers appended to post compositions.</p>
              </div>

              <div className="space-y-3 max-w-lg">
                <label className="text-xs font-semibold text-ink">Default Footer Template</label>
                <textarea
                  rows={4}
                  value={signatureText}
                  onChange={(e) => setSignatureText(e.target.value)}
                  className="w-full rounded-control border border-line bg-page p-3 text-xs font-mono text-ink placeholder:text-ink-3 focus:outline-none focus:border-line-strong"
                />
                <Button onClick={handleSave} className="rounded-control bg-foreground text-background text-xs font-semibold shadow-btn">
                  Save Signature
                </Button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-ink">Notification Preferences</h2>
                <p className="text-xs text-ink-3 mt-0.5">Manage delivery channels for publication outcomes and approval alerts.</p>
              </div>

              <div className="space-y-3 max-w-md">
                <label className="flex items-center justify-between rounded-control border border-line/70 p-3 cursor-pointer hover:bg-hover transition-colors">
                  <div>
                    <span className="text-sm font-semibold text-ink block">Email Publishing Digest</span>
                    <span className="text-xs text-ink-3">Receive a daily recap of scheduled and completed publications.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="size-4 rounded accent-foreground"
                  />
                </label>

                <label className="flex items-center justify-between rounded-control border border-line/70 p-3 cursor-pointer hover:bg-hover transition-colors">
                  <div>
                    <span className="text-sm font-semibold text-ink block">Failure & Disconnect Alerts</span>
                    <span className="text-xs text-ink-3">Immediate notifications when social tokens expire or posts fail.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={failureAlerts}
                    onChange={(e) => setFailureAlerts(e.target.checked)}
                    className="size-4 rounded accent-foreground"
                  />
                </label>
              </div>
            </div>
          )}

          {/* API Tab */}
          {activeTab === 'api' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-ink">API Access & Automation</h2>
                <p className="text-xs text-ink-3 mt-0.5">Manage API keys and developer access credentials.</p>
              </div>

              <div className="space-y-3 max-w-lg">
                <div className="rounded-control border border-line bg-page p-3 font-mono text-xs text-ink flex items-center justify-between">
                  <span>postiz_live_79a24bc109f…</span>
                  <StatusPill tone="green" dot={true}>Active Key</StatusPill>
                </div>
                <p className="text-[11.5px] text-ink-3">
                  This key grants program access to schedule posts, manage media, and query analytics.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SettingsView;
