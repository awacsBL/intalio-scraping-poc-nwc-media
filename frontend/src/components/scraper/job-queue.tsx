'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import {
  Play,
  Pause,
  XCircle,
  CheckCircle,
  Clock,
  Loader2,
  AlertCircle,
  RefreshCw,
  Hash,
  MessageSquare,
  Search,
  Rocket,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ScrapingJob, JobExecution } from '@/types';

interface JobQueueProps {
  jobs: ScrapingJob[];
  history?: JobExecution[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

const statusConfig = {
  queued: {
    label: 'Queued',
    icon: Clock,
    variant: 'secondary' as const,
    color: 'text-gray-500',
  },
  running: {
    label: 'Running',
    icon: Loader2,
    variant: 'default' as const,
    color: 'text-blue-500',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle,
    variant: 'default' as const,
    color: 'text-green-500',
  },
  failed: {
    label: 'Failed',
    icon: XCircle,
    variant: 'destructive' as const,
    color: 'text-red-500',
  },
};

const typeConfig = {
  hashtag: {
    label: 'Hashtag',
    icon: Hash,
  },
  comments: {
    label: 'Comments',
    icon: MessageSquare,
  },
  discovery: {
    label: 'Discovery',
    icon: Search,
  },
  full_pipeline: {
    label: 'Full Pipeline',
    icon: Rocket,
  },
};

export function JobQueue({ jobs, history = [], isLoading, onRefresh }: JobQueueProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderJobRow = (job: any, isHistory: boolean = false) => {
    const status = statusConfig[job.status as keyof typeof statusConfig] || statusConfig.queued;
    // Fallback for unknown type
    const jobType = job.type as keyof typeof typeConfig;
    const type = typeConfig[jobType] || { label: job.type || 'Unknown', icon: Clock };
    const StatusIcon = status.icon;
    const TypeIcon = type.icon;

    // Safety for date
    const dateValue = isHistory ? job.completed_at || job.started_at : job.started_at;
    const dateLabel = isHistory
      ? (job.completed_at ? 'Finished' : 'Started')
      : 'Started';

    return (
      <TableRow key={job.id}>
        <TableCell>
          <div className="flex items-center gap-2">
            <TypeIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{type.label}</span>
          </div>
        </TableCell>
        <TableCell>
          <span className="font-medium">{job.target || job.name || 'Job'}</span>
        </TableCell>
        <TableCell>
          <Badge variant={status.variant} className="gap-1">
            <StatusIcon
              className={cn(
                'h-3 w-3',
                job.status === 'running' && 'animate-spin'
              )}
            />
            {status.label}
          </Badge>
        </TableCell>
        <TableCell className="min-w-[120px]">
          {!isHistory && (
            <div className="space-y-1">
              <Progress value={job.progress || 0} className="h-2" />
              <span className="text-xs text-muted-foreground">
                {job.progress || 0}%
              </span>
            </div>
          )}
          {isHistory && job.result_summary && (
            <span className="text-xs text-muted-foreground truncate max-w-[150px] inline-block" title={JSON.stringify(job.result_summary)}>
              {Object.entries(job.result_summary).map(([k, v]) => `${k}: ${v}`).join(', ')}
            </span>
          )}
        </TableCell>
        <TableCell>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">{dateLabel}</span>
            <span className="text-sm">
              {dateValue && !isNaN(new Date(dateValue).getTime())
                ? formatDistanceToNow(new Date(dateValue), { addSuffix: true })
                : 'Pending'}
            </span>
          </div>
        </TableCell>
        <TableCell className="text-right">
          {!isHistory && (
            <TooltipProvider>
              <div className="flex justify-end gap-1">
                {job.status === 'running' && (
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Pause className="h-4 w-4" />
                  </Button>
                )}
                {job.status === 'queued' && (
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Play className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </TooltipProvider>
          )}
          {isHistory && job.error_message && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <AlertCircle className="h-4 w-4 text-destructive" />
                </TooltipTrigger>
                <TooltipContent>
                  {job.error_message}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </TableCell>
      </TableRow>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Job Queue</CardTitle>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="active" className="w-full">
          <div className="px-4 border-b">
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent">
              <TabsTrigger value="active" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">
                Active & Scheduled ({jobs.length})
              </TabsTrigger>
              <TabsTrigger value="history" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">
                Execution History ({history.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[500px]">
            <TabsContent value="active" className="m-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Timing</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <p className="text-muted-foreground">No active jobs</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    jobs.map(job => renderJobRow(job, false))
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="history" className="m-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Timing</TableHead>
                    <TableHead className="text-right">Info</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <p className="text-muted-foreground">No executed jobs found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    history.map(job => renderJobRow(job, true))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
}
