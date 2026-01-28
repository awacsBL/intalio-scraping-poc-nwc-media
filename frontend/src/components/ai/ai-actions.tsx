'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Loader2, FileText, Smile, Meh, Frown, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SummarizeButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'default' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  className?: string;
  showLabel?: boolean;
}

export function SummarizeButton({
  onClick,
  isLoading = false,
  disabled = false,
  size = 'sm',
  variant = 'outline',
  className,
  showLabel = true,
}: SummarizeButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onClick}
            disabled={disabled || isLoading}
            size={size}
            variant={variant}
            className={cn('gap-2', className)}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            {showLabel && (isLoading ? 'Summarizing...' : 'Summarize')}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Generate AI summary</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface AnalyzeSentimentButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'default' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  className?: string;
  showLabel?: boolean;
}

export function AnalyzeSentimentButton({
  onClick,
  isLoading = false,
  disabled = false,
  size = 'sm',
  variant = 'outline',
  className,
  showLabel = true,
}: AnalyzeSentimentButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onClick}
            disabled={disabled || isLoading}
            size={size}
            variant={variant}
            className={cn('gap-2', className)}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {showLabel && (isLoading ? 'Analyzing...' : 'Analyze Sentiment')}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Analyze sentiment with AI</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface SentimentBadgeProps {
  label: 'positive' | 'neutral' | 'negative';
  score?: number;
  showScore?: boolean;
  size?: 'sm' | 'default';
  className?: string;
}

const sentimentConfig = {
  positive: {
    icon: Smile,
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    label: 'Positive',
  },
  neutral: {
    icon: Meh,
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    label: 'Neutral',
  },
  negative: {
    icon: Frown,
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    label: 'Negative',
  },
};

export function SentimentBadge({
  label,
  score,
  showScore = false,
  size = 'default',
  className,
}: SentimentBadgeProps) {
  const config = sentimentConfig[label];
  const Icon = config.icon;

  return (
    <Badge
      variant="secondary"
      className={cn(
        'gap-1 font-medium',
        config.className,
        size === 'sm' && 'text-xs px-2 py-0.5',
        className
      )}
    >
      <Icon className={cn('h-3 w-3', size === 'sm' && 'h-2.5 w-2.5')} />
      {config.label}
      {showScore && score !== undefined && (
        <span className="ml-1 opacity-70">({(score * 100).toFixed(0)}%)</span>
      )}
    </Badge>
  );
}

interface AIResultCardProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function AIResultCard({ title, children, icon, className }: AIResultCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 p-4',
        className
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        {icon || <Sparkles className="h-4 w-4 text-purple-500" />}
        <h4 className="font-medium text-sm">{title}</h4>
      </div>
      {children}
    </div>
  );
}

interface SummaryDisplayProps {
  summary: string;
  className?: string;
}

export function SummaryDisplay({ summary, className }: SummaryDisplayProps) {
  return (
    <div
      className={cn(
        'text-sm text-muted-foreground leading-relaxed',
        // Support RTL for Arabic text
        'dir-auto',
        className
      )}
      dir="auto"
    >
      {summary}
    </div>
  );
}
