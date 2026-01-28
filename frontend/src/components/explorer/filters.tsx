'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/store';
import { usePostTypes } from '@/hooks/useApi';
import { Filter, X, Search, Calendar } from 'lucide-react';
import type { PostFilters } from '@/types';

interface FiltersProps {
  onFilterChange: (filters: PostFilters) => void;
}

export function Filters({ onFilterChange }: FiltersProps) {
  const { postFilters, setPostFilters, clearFilters } = useAppStore();
  const { data: postTypes, isLoading: postTypesLoading } = usePostTypes();

  const updateFilter = (key: keyof PostFilters, value: string | number | boolean | undefined) => {
    const newFilters = { ...postFilters, [key]: value };
    if (value === '' || value === undefined) {
      delete newFilters[key];
    }
    setPostFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClear = () => {
    clearFilters();
    onFilterChange({});
  };

  const activeFilterCount = Object.keys(postFilters).filter(
    (key) => postFilters[key as keyof PostFilters] !== undefined
  ).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary">{activeFilterCount}</Badge>
            )}
          </CardTitle>
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClear}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <Label>Search</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search captions, usernames..."
              value={postFilters.search || ''}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <Separator />

        {/* Sentiment */}
        <div className="space-y-2">
          <Label>Sentiment</Label>
          <Select
            value={postFilters.sentiment || 'all'}
            onValueChange={(value) =>
              updateFilter('sentiment', value === 'all' ? undefined : value as 'positive' | 'negative' | 'neutral')
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All sentiments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sentiments</SelectItem>
              <SelectItem value="positive">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  Positive
                </div>
              </SelectItem>
              <SelectItem value="neutral">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-gray-500" />
                  Neutral
                </div>
              </SelectItem>
              <SelectItem value="negative">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  Negative
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Post Type */}
        <div className="space-y-2">
          <Label>Post Type</Label>
          <Select
            value={postFilters.postType || 'all'}
            onValueChange={(value) =>
              updateFilter('postType', value === 'all' ? undefined : value)
            }
            disabled={postTypesLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={postTypesLoading ? 'Loading...' : 'All types'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {postTypes?.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Source */}
        <div className="space-y-2">
          <Label>Source</Label>
          <Select
            value={postFilters.source || 'all'}
            onValueChange={(value) =>
              updateFilter('source', value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              <SelectItem value="hashtag">Hashtag</SelectItem>
              <SelectItem value="user_profile">User Profile</SelectItem>
              <SelectItem value="mentions">Mentions</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Date Range */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Date Range
          </Label>
          <div className="space-y-2">
            <div>
              <Label className="text-xs text-muted-foreground">From</Label>
              <Input
                type="date"
                value={postFilters.dateFrom || ''}
                onChange={(e) => updateFilter('dateFrom', e.target.value || undefined)}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">To</Label>
              <Input
                type="date"
                value={postFilters.dateTo || ''}
                onChange={(e) => updateFilter('dateTo', e.target.value || undefined)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Engagement */}
        <div className="space-y-2">
          <Label>Min. Likes</Label>
          <Input
            type="number"
            placeholder="0"
            value={postFilters.minLikes || ''}
            onChange={(e) =>
              updateFilter('minLikes', e.target.value ? parseInt(e.target.value) : undefined)
            }
          />
        </div>

        {/* Comments Filter */}
        <div className="space-y-2">
          <Label>Comments Count</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">Min</Label>
              <Input
                type="number"
                placeholder="0"
                value={postFilters.minComments || ''}
                onChange={(e) =>
                  updateFilter('minComments', e.target.value ? parseInt(e.target.value) : undefined)
                }
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Max</Label>
              <Input
                type="number"
                placeholder="Any"
                value={postFilters.maxComments || ''}
                onChange={(e) =>
                  updateFilter('maxComments', e.target.value ? parseInt(e.target.value) : undefined)
                }
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* AI Results */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="has-ai"
            checked={postFilters.hasAiResults || false}
            onCheckedChange={(checked) =>
              updateFilter('hasAiResults', checked ? true : undefined)
            }
          />
          <Label htmlFor="has-ai" className="text-sm cursor-pointer">
            Only show AI-analyzed posts
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}
