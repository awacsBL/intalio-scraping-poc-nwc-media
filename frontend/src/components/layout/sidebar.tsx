'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store';
import {
  LayoutDashboard,
  Search,
  Images,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Activity,
  Plane,
  Heart,
  Clock,
  Users,
  MessageCircle,
  FileText,
  Brain,
  Target,
  Sparkles,
  ClipboardList,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const mainNavItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Job Manager',
    href: '/scraper',
    icon: Search,
  },
  {
    title: 'Scheduler',
    href: '/jobs',
    icon: Clock,
  },
  {
    title: 'Data Explorer',
    href: '/explorer',
    icon: Images,
  },
  {
    title: 'Analysis',
    href: '/analysis',
    icon: BarChart3,
  },
  {
    title: 'AI Services',
    href: '/ai-services',
    icon: Sparkles,
  },
];

const dashboardNavItems = [
  {
    title: 'Engagement',
    href: '/dashboards/engagement',
    icon: Heart,
  },
  {
    title: 'Time Analytics',
    href: '/dashboards/time-analytics',
    icon: Clock,
  },
  {
    title: 'Authors',
    href: '/dashboards/authors',
    icon: Users,
  },
  {
    title: 'Comments',
    href: '/dashboards/comments',
    icon: MessageCircle,
  },
  {
    title: 'Content',
    href: '/dashboards/content',
    icon: FileText,
  },
  {
    title: 'AI Insights',
    href: '/dashboards/ai-insights',
    icon: Brain,
  },
  {
    title: 'Weekly Reports',
    href: '/dashboards/reports',
    icon: ClipboardList,
  },
  {
    title: 'Monitoring',
    href: '/dashboards/monitoring',
    icon: Target,
  },
];

const settingsNavItems = [
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
  {
    title: 'Targets',
    href: '/targets',
    icon: Target,
  },
];

type NavItem = {
  title: string;
  href: string;
  icon: React.ElementType;
};

function NavLink({ item, isActive, sidebarOpen }: { item: NavItem; isActive: boolean; sidebarOpen: boolean }) {
  const Icon = item.icon;

  if (!sidebarOpen) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={item.href}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className="h-5 w-5" />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">
          {item.title}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Link
      href={item.href}
      className={cn(
        'flex h-10 items-center gap-3 rounded-lg px-3 transition-colors',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{item.title}</span>
    </Link>
  );
}

function renderNavSection(items: NavItem[], pathname: string, sidebarOpen: boolean) {
  return items.map((item) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
    return (
      <NavLink
        key={item.href}
        item={item}
        isActive={isActive}
        sidebarOpen={sidebarOpen}
      />
    );
  });
}

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useAppStore();

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen border-r bg-background transition-all duration-300',
          sidebarOpen ? 'w-64' : 'w-16'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Plane className="h-5 w-5 text-primary-foreground" />
            </div>
            {sidebarOpen && (
              <span className="font-semibold text-lg">NWC Media Analytics</span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8"
          >
            {sidebarOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 p-2 overflow-y-auto max-h-[calc(100vh-8rem)]">
          {/* Main Navigation */}
          {renderNavSection(mainNavItems, pathname, sidebarOpen)}

          {/* Dashboards Section */}
          {sidebarOpen && (
            <div className="mt-4 mb-2 px-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Dashboards
              </span>
            </div>
          )}
          {!sidebarOpen && <div className="my-2 mx-2 border-t" />}
          {renderNavSection(dashboardNavItems, pathname, sidebarOpen)}

          {/* Settings Section */}
          {sidebarOpen && (
            <div className="mt-4 mb-2 px-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                System
              </span>
            </div>
          )}
          {!sidebarOpen && <div className="my-2 mx-2 border-t" />}
          {renderNavSection(settingsNavItems, pathname, sidebarOpen)}
        </nav>

        {/* Status Indicator */}
        <div className="absolute bottom-0 left-0 right-0 border-t p-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-green-500" />
            </div>
            {sidebarOpen && (
              <span className="text-sm text-muted-foreground">API Connected</span>
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
