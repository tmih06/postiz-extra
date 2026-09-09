import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type {
  UserProfile,
  CustomerProfile,
  ChannelIntegration,
} from '@/api/types';
import { createApiClient, type ApiClient } from '@/api/client';

export interface ChannelStatusInfo {
  integration: ChannelIntegration;
  isAvailable: boolean;
  reason?: string;
}

export interface WorkspaceContextValue {
  api: ApiClient;
  user: UserProfile | null;
  customers: CustomerProfile[];
  integrations: ChannelIntegration[];
  selectedCustomerId: string | 'all';
  selectedChannelIds: string[];
  channelStatuses: ChannelStatusInfo[];
  isLoading: boolean;
  error: string | null;
  setSelectedCustomerId: (id: string | 'all') => void;
  toggleChannelSelection: (channelId: string) => void;
  setSelectedChannelIds: (ids: string[]) => void;
  refreshWorkspace: () => Promise<void>;
  logout: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({
  children,
  initialApi,
}: {
  children: ReactNode;
  initialApi?: ApiClient;
}) {
  const [api] = useState<ApiClient>(() => initialApi ?? createApiClient());
  const [user, setUser] = useState<UserProfile | null>(null);
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [integrations, setIntegrations] = useState<ChannelIntegration[]>([]);
  const [selectedCustomerId, setSelectedCustomerIdState] = useState<
    string | 'all'
  >('all');
  const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const self = await api.getSelf();
      setUser(self);

      const [custs, ints] = await Promise.all([
        api.getCustomers().catch((): CustomerProfile[] => []),
        api
          .getIntegrations()
          .catch((): { integrations: ChannelIntegration[] } => ({
            integrations: [],
          })),
      ]);

      setCustomers(custs);
      setIntegrations(ints.integrations);

      // Preselect first profile if available and currently 'all'
      if (custs.length > 0) {
        const firstCust = custs[0];
        setSelectedCustomerIdState(firstCust.id);
        const matchingChannels = ints.integrations
          .filter(
            (ch: ChannelIntegration) =>
              ch.customerId === firstCust.id &&
              !ch.disabled &&
              !ch.refreshNeeded &&
              !ch.inBetweenSteps
          )
          .map((ch: ChannelIntegration) => ch.id);
        setSelectedChannelIds(matchingChannels);
      } else {
        // All channels that are valid
        const validChannels = ints.integrations
          .filter(
            (ch: ChannelIntegration) =>
              !ch.disabled && !ch.refreshNeeded && !ch.inBetweenSteps
          )
          .map((ch: ChannelIntegration) => ch.id);
        setSelectedChannelIds(validChannels);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load workspace data';
      setError(msg);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const setSelectedCustomerId = useCallback(
    (id: string | 'all') => {
      setSelectedCustomerIdState(id);
      if (id === 'all') {
        const activeIds = integrations
          .filter((ch) => !ch.disabled && !ch.refreshNeeded && !ch.inBetweenSteps)
          .map((ch) => ch.id);
        setSelectedChannelIds(activeIds);
      } else {
        const matchingIds = integrations
          .filter(
            (ch) =>
              ch.customerId === id &&
              !ch.disabled &&
              !ch.refreshNeeded &&
              !ch.inBetweenSteps
          )
          .map((ch) => ch.id);
        setSelectedChannelIds(matchingIds);
      }
    },
    [integrations]
  );

  const toggleChannelSelection = useCallback((channelId: string) => {
    setSelectedChannelIds((prev) =>
      prev.includes(channelId)
        ? prev.filter((id) => id !== channelId)
        : [...prev, channelId]
    );
  }, []);

  const channelStatuses = useMemo<ChannelStatusInfo[]>(() => {
    return integrations.map((ch) => {
      if (ch.disabled) {
        return {
          integration: ch,
          isAvailable: false,
          reason: 'Channel is currently disabled',
        };
      }
      if (ch.refreshNeeded) {
        return {
          integration: ch,
          isAvailable: false,
          reason: 'Authentication expired — reconnection required',
        };
      }
      if (ch.inBetweenSteps) {
        return {
          integration: ch,
          isAvailable: false,
          reason: 'Setup incomplete — finishing connection required',
        };
      }
      return {
        integration: ch,
        isAvailable: true,
      };
    });
  }, [integrations]);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
      window.location.href = '/login';
    }
  }, [api]);

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      api,
      user,
      customers,
      integrations,
      selectedCustomerId,
      selectedChannelIds,
      channelStatuses,
      isLoading,
      error,
      setSelectedCustomerId,
      toggleChannelSelection,
      setSelectedChannelIds,
      refreshWorkspace: loadData,
      logout,
    }),
    [
      api,
      user,
      customers,
      integrations,
      selectedCustomerId,
      selectedChannelIds,
      channelStatuses,
      isLoading,
      error,
      setSelectedCustomerId,
      toggleChannelSelection,
      loadData,
      logout,
    ]
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return ctx;
}
