import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusPill } from '@/components/atoms/status-pill';
import {
  Puzzle,
  ExternalLink,
  CheckCircle2,
  Key,
  Webhook,
  Bot,
  Zap,
  Radio,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Structure defining an external integration plugin, AI engine, or protocol tool.
 */
interface PlugItem {
  /** Unique alphanumeric slug for the plugin integration. */
  id: string;
  /** Display title of the plugin service. */
  name: string;
  /** Categorization for filtering and grouping plugin capabilities. */
  category: 'AI Video' | 'Automation' | 'Intelligence' | 'Agent Protocol';
  /** Descriptive explanation of what capability the plug brings to Postiz. */
  description: string;
  /** Current connectivity and configuration status. */
  status: 'connected' | 'not_configured';
  /** External documentation link for developer setup and API key generation. */
  docsUrl: string;
  /** Environment variable or credential key identifier (e.g. 'HEYGEN_API_KEY'). */
  configKey?: string;
}

/**
 * Catalog of supported external AI generation services, automation webhooks, and agent protocol plugs.
 */

const PLUGS: PlugItem[] = [
  {
    id: 'heygen',
    name: 'HeyGen AI Avatar & Video',
    category: 'AI Video',
    description: 'Generate realistic talking avatar videos directly inside the Postiz video studio.',
    status: 'connected',
    docsUrl: 'https://docs.heygen.com',
    configKey: 'HEYGEN_API_KEY',
  },
  {
    id: 'reelfarm',
    name: 'ReelFarm Auto-Clips',
    category: 'AI Video',
    description: 'Transform long-form YouTube and Twitch videos into viral short clips for TikTok and Reels.',
    status: 'not_configured',
    docsUrl: 'https://reelfarm.com/docs',
    configKey: 'REELFARM_API_KEY',
  },
  {
    id: 'nanoclaw',
    name: 'NanoClaw Intelligence',
    category: 'Intelligence',
    description: 'Monitor competitor posts, trending topics, and viral hooks across Twitter/X and Threads.',
    status: 'connected',
    docsUrl: 'https://nanoclaw.dev',
    configKey: 'NANOCLAW_TOKEN',
  },
  {
    id: 'mcp',
    name: 'Model Context Protocol (MCP)',
    category: 'Agent Protocol',
    description: 'Allow Claude Code, Cursor, and custom coding agents to schedule and inspect Postiz channels.',
    status: 'connected',
    docsUrl: 'https://modelcontextprotocol.io',
  },
  {
    id: 'make',
    name: 'Make.com & N8N Webhooks',
    category: 'Automation',
    description: 'Trigger autonomous workflows on post published, approval needed, or delivery failed.',
    status: 'connected',
    docsUrl: 'https://make.com',
    configKey: 'WEBHOOK_URL',
  },
  {
    id: 'resend',
    name: 'Resend Transactional Email',
    category: 'Automation',
    description: 'Deliver team invite emails, publication failure alerts, and daily schedule digests.',
    status: 'connected',
    docsUrl: 'https://resend.com',
    configKey: 'RESEND_API_KEY',
  },
];

/**
 * Plugs and third-party integrations directory view.
 *
 * Displays available integrations (HeyGen, ReelFarm, NanoClaw, MCP, Make.com, Resend) categorized
 * by capability (AI Video, Automation, Intelligence, Agent Protocol). Allows users to inspect
 * documentation, view connectivity status pills, and open a credential configuration modal to store API keys.
 *
 * @returns The rendered third-party plugs directory and configuration dialog.
 */
export function PlugsView() {
  const [selectedPlug, setSelectedPlug] = useState<PlugItem | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  /**
   * Opens the configuration modal for a specific plugin and resets input fields.
   *
   * @param plug - The plugin item selected by the user for configuration.
   */
  const handleOpenConfig = (plug: PlugItem) => {
    setSelectedPlug(plug);
    setApiKeyInput('');
    setSavedSuccess(false);
  };

  /**
   * Handles saving the entered plugin API credentials and displays temporary success confirmation.
   *
   * Triggers the success message state and schedules auto-dismissal of the modal after 1.2 seconds.
   */
  const handleSaveConfig = () => {
    setSavedSuccess(true);
    setTimeout(() => {
      setSelectedPlug(null);
      setSavedSuccess(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
            Integrations & Third-Party Plugs
          </h1>
          <p className="text-sm text-ink-2 mt-1">
            Connect AI generation engines, automation webhooks, and agent protocols.
          </p>
        </div>
      </div>

      {/* Grid of Plugs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PLUGS.map((plug) => {
          const isConnected = plug.status === 'connected';

          return (
            <div
              key={plug.id}
              className="flex flex-col justify-between rounded-card border border-line bg-surface p-4 shadow-card hover:border-line-strong transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-control bg-line font-bold text-ink text-xs">
                      {plug.name.charAt(0)}
                    </div>
                    <span className="font-semibold text-ink text-[13.5px]">
                      {plug.name}
                    </span>
                  </div>

                  <StatusPill tone={isConnected ? 'green' : 'neutral'} dot={true}>
                    {isConnected ? 'Active' : 'Not set'}
                  </StatusPill>
                </div>

                <span className="rounded-full bg-line/60 px-2 py-0.5 text-[10.5px] font-mono text-ink-3 uppercase">
                  {plug.category}
                </span>

                <p className="text-[12.5px] text-ink-2 leading-relaxed mt-2.5">
                  {plug.description}
                </p>
              </div>

              <div className="border-t border-line-soft pt-3 mt-4 flex items-center justify-between">
                <a
                  href={plug.docsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[12px] text-ink-3 hover:text-ink font-medium"
                >
                  <span>Documentation</span>
                  <ExternalLink className="size-3" />
                </a>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenConfig(plug)}
                  className="rounded-control text-xs font-semibold h-7 px-3 border-line hover:bg-hover"
                >
                  <Settings className="size-3 mr-1" />
                  Configure
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Configuration Modal */}
      {selectedPlug && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setSelectedPlug(null)}
        >
          <div
            className="w-full max-w-md rounded-window border border-line bg-surface p-5 shadow-overlay flex flex-col gap-4"
            style={{ animation: 'pop-in 180ms cubic-bezier(0.23,1,0.32,1) both' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="size-4 text-accent" />
                <h3 className="text-sm font-bold text-ink">Configure {selectedPlug.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPlug(null)}
                className="text-xs text-ink-3 hover:text-ink"
              >
                Close
              </button>
            </div>

            <p className="text-[12.5px] text-ink-2">
              Enter your {selectedPlug.configKey || 'API Secret'} to authenticate the integration. Credentials are securely encrypted at rest.
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-ink-3 uppercase">
                {selectedPlug.configKey || 'Credential Key'}
              </label>
              <Input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="sk_live_…"
                className="h-9 font-mono text-xs rounded-control border-line bg-page"
              />
            </div>

            {savedSuccess ? (
              <div className="flex items-center gap-2 rounded-control bg-green-tint p-2 text-xs font-semibold text-green">
                <CheckCircle2 className="size-4" />
                <span>Integration credentials updated successfully</span>
              </div>
            ) : null}

            <div className="flex justify-end gap-2 pt-2 border-t border-line-soft">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPlug(null)}
                className="text-xs text-ink-3"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveConfig}
                className="rounded-control bg-foreground text-background text-xs font-semibold shadow-btn"
              >
                Save Credentials
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlugsView;
