import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useWorkspace } from '@/context/workspace.context';
import { PromptBar } from '@/components/primitives/prompt-bar';
import { ThinkingState } from '@/components/primitives/thinking-state';
import { ToolChips } from '@/components/primitives/tool-chips';
import { StreamingText } from '@/components/primitives/streaming-text';
import { ApprovalCard } from '@/components/primitives/approval-card';
import { RecommendationCard } from '@/components/primitives/recommendation-card';
import { DiffTable } from '@/components/primitives/diff-table';
import { InsightCards } from '@/components/primitives/insight-cards';
import { Sparkles, Bot, Share2, Layers, CheckCircle2, RotateCcw } from 'lucide-react';
import { StatusPill } from '@/components/atoms/status-pill';

interface Message {
  id: string;
  sender: 'user' | 'agent';
  prompt?: string;
  thinkingDone?: boolean;
  streamingDone?: boolean;
  hasApproval?: boolean;
  hasDiff?: boolean;
  hasRecommendation?: boolean;
}

export function PostizHarness({
  onScheduleAction,
}: {
  onScheduleAction?: () => void;
}) {
  const { user, integrations } = useWorkspace();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial',
      sender: 'agent',
      thinkingDone: true,
      streamingDone: true,
      hasRecommendation: true,
      hasApproval: true,
    },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  const activeChannels = integrations.filter((i) => !i.disabled);

  const handlePromptSubmit = (promptText: string) => {
    setIsProcessing(true);
    const userMsgId = `user-${Date.now()}`;
    const agentMsgId = `agent-${Date.now()}`;

    setMessages((prev) => [
      ...prev,
      { id: userMsgId, sender: 'user', prompt: promptText },
      {
        id: agentMsgId,
        sender: 'agent',
        prompt: promptText,
        thinkingDone: false,
        streamingDone: false,
        hasApproval: true,
        hasDiff: true,
      },
    ]);
  };

  const handleThinkingDone = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, thinkingDone: true } : m))
    );
  };

  const handleStreamingDone = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, streamingDone: true } : m))
    );
    setIsProcessing(false);
  };

  const handleReset = () => {
    setMessages([
      {
        id: 'initial',
        sender: 'agent',
        thinkingDone: true,
        streamingDone: true,
        hasRecommendation: true,
        hasApproval: true,
      },
    ]);
    setIsProcessing(false);
  };

  return (
    <div className="flex h-[calc(100vh-2rem)] w-full gap-6">
      {/* Main Chat & Execution Canvas */}
      <div className="flex flex-1 flex-col h-full overflow-hidden rounded-window border border-line bg-surface shadow-card">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-6 py-3.5 bg-surface">
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-[8px] bg-accent/15 text-accent-ink">
              <Sparkles className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[14px] font-bold text-ink leading-tight">
                  Postiz AI Publishing Studio
                </h2>
                <StatusPill tone="green" dot={true}>
                  Agent Ready
                </StatusPill>
              </div>
              <p className="text-[11px] text-ink-3">
                Autonomous multi-channel social campaign planning, drafting, and queue orchestration
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-control border border-line bg-page px-2.5 py-1 text-[12px] font-medium text-ink-2 hover:bg-hover hover:text-ink transition-colors"
          >
            <RotateCcw className="size-3" />
            <span>Reset Session</span>
          </button>
        </div>

        {/* Scrollable Message Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => {
            if (msg.sender === 'user') {
              return (
                <div key={msg.id} className="flex justify-end">
                  <div className="max-w-md rounded-card bg-foreground px-4 py-2.5 text-[13.5px] font-medium text-background shadow-btn">
                    {msg.prompt}
                  </div>
                </div>
              );
            }

            return (
              <div key={msg.id} className="flex items-start gap-3">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-[8px] bg-foreground text-background font-bold text-xs mt-0.5">
                  P
                </div>

                <div className="flex-1 space-y-4 max-w-2xl">
                  {/* Thinking State */}
                  {!msg.thinkingDone ? (
                    <ThinkingState
                      durationSeconds={2.2}
                      onDone={() => handleThinkingDone(msg.id)}
                    />
                  ) : (
                    <ToolChips />
                  )}

                  {/* Streaming Text Output */}
                  {msg.thinkingDone && (
                    <div className="rounded-card border border-line/60 bg-page/40 p-4 shadow-hairline">
                      <StreamingText
                        text={
                          msg.prompt
                            ? `I've prepared a customized multi-platform social package for "${msg.prompt}". The copy has been tuned for algorithm reach with tailored hooks for X, LinkedIn, and Threads, and queue slots have been allocated during your audience's peak activity window.`
                            : "Welcome to Postiz AI Studio. Connected to your publishing workspace. I can craft multi-platform campaigns, optimize queue schedules, analyze top posts, or suggest viral hooks."
                        }
                        onDone={() => handleStreamingDone(msg.id)}
                      />
                    </div>
                  )}

                  {/* Interactive Primitives following completed response */}
                  {msg.streamingDone && (
                    <div className="space-y-4">
                      {msg.hasDiff && <DiffTable />}
                      {msg.hasRecommendation && <RecommendationCard />}
                      {msg.hasApproval && (
                        <ApprovalCard
                          onApprove={() => {
                            onScheduleAction?.();
                          }}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Prompt Input Bar at Bottom */}
        <div className="border-t border-line p-4 bg-surface/95 backdrop-blur-sm">
          <PromptBar onSubmit={handlePromptSubmit} disabled={isProcessing} />
        </div>
      </div>

      {/* Right Context Rail */}
      <aside className="hidden lg:flex w-80 flex-col gap-4 shrink-0 overflow-y-auto hide-scrollbar">
        {/* Insights Carousel */}
        <InsightCards />

        {/* Connected Channels status */}
        <div className="rounded-card border border-line bg-surface p-4 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Share2 className="size-4 text-ink-2" />
              <h3 className="text-[13px] font-bold text-ink">Active Destinations</h3>
            </div>
            <span className="font-mono text-[11px] text-ink-3">
              {activeChannels.length} connected
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            {activeChannels.length > 0 ? (
              activeChannels.map((ch) => (
                <div
                  key={ch.id}
                  className="flex items-center justify-between rounded-control border border-line/50 bg-page/50 px-2.5 py-1.5 text-[12.5px]"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="size-2 rounded-full bg-green" />
                    <span className="font-medium text-ink capitalize truncate">
                      {ch.providerIdentifier}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-ink-3 truncate max-w-[100px]">
                    {ch.name}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-[12px] text-ink-3 py-2 text-center">
                No active social channels connected.
              </div>
            )}
          </div>
        </div>

        {/* Queue Strategy info */}
        <div className="rounded-card border border-line bg-surface p-4 shadow-card">
          <div className="flex items-center gap-1.5 mb-2">
            <Layers className="size-4 text-accent" />
            <h3 className="text-[13px] font-bold text-ink">Autonomous Queue Rules</h3>
          </div>
          <ul className="space-y-1.5 text-[12px] text-ink-2">
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3 text-green shrink-0" />
              <span>Max 3 posts/day per channel to prevent fatigue</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3 text-green shrink-0" />
              <span>Separates video vs image scheduling slots</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3 text-green shrink-0" />
              <span>Automated UTF-8 emoji & character limit guard</span>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

export default PostizHarness;
