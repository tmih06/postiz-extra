import React from 'react';
import { useWorkspace } from '@/context/workspace.context';
import type { ChannelIntegration, CustomerProfile } from '@/api/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users, Briefcase } from 'lucide-react';

/**
 * Workspace brand profile dropdown selector.
 *
 * Allows filtering destinations and workspace context by individual customer profile or
 * switching to `'all'` to view all connected brand integrations with channel count badges.
 */
export function ProfileSelector() {
  const {
    customers,
    integrations,
    selectedCustomerId,
    setSelectedCustomerId,
  } = useWorkspace();

  /**
   * Computes the number of connected channel integrations mapped to a specific customer profile.
   *
   * @param customerId - Unique identifier of the brand customer profile.
   * @returns Total count of associated channel integrations.
   */
  const getChannelCount = (customerId: string) => {
    return integrations.filter((ch: ChannelIntegration) => ch.customerId === customerId).length;
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
        <Briefcase className="size-3.5" />
        Brand Profile
      </label>
      <Select
        value={selectedCustomerId}
        onValueChange={(val: string) => setSelectedCustomerId(val)}
      >
        <SelectTrigger className="w-full bg-background font-medium">
          <SelectValue placeholder="Select a profile" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <div className="flex items-center justify-between w-full gap-4">
              <span className="flex items-center gap-2">
                <Users className="size-4 text-muted-foreground" />
                <span>All Profiles</span>
              </span>
              <Badge variant="outline" className="font-mono text-[10px]">
                {integrations.length} ch
              </Badge>
            </div>
          </SelectItem>

          {customers.map((cust: CustomerProfile) => (
            <SelectItem key={cust.id} value={cust.id}>
              <div className="flex items-center justify-between w-full gap-4">
                <span className="font-medium truncate">{cust.name}</span>
                <Badge variant="secondary" className="font-mono text-[10px]">
                  {getChannelCount(cust.id)} ch
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
