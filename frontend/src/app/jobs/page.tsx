'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useJobs, useUpdateJobSchedule } from '@/hooks/useApi';
import { toast } from 'sonner';
import {
    Clock,
    Calendar,
    PlayCircle,
    PauseCircle,
    RefreshCw,
    Settings,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function JobsPage() {
    const { data: jobs, isLoading } = useJobs();
    const updateSchedule = useUpdateJobSchedule();

    const [selectedJob, setSelectedJob] = useState<any>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form state
    const [scheduleType, setScheduleType] = useState<'interval' | 'specific_time'>('interval');
    const [intervalMinutes, setIntervalMinutes] = useState(60);
    const [hour, setHour] = useState(0);
    const [minute, setMinute] = useState(0);
    const [dayOfWeek, setDayOfWeek] = useState('*');
    const [isActive, setIsActive] = useState(true);

    const handleEditClick = (job: any) => {
        setSelectedJob(job);
        setScheduleType(job.schedule_type || 'interval');
        setIntervalMinutes(job.interval_minutes || 60);
        setHour(job.config?.hour ?? 0);
        setMinute(job.config?.minute ?? 0);
        setDayOfWeek(job.config?.day_of_week || '*');
        setIsActive(job.is_active);
        setIsDialogOpen(true);
    };

    const handleSave = () => {
        if (!selectedJob) return;

        const data: any = {
            is_active: isActive,
            schedule_type: scheduleType,
        };

        if (scheduleType === 'interval') {
            data.interval_minutes = intervalMinutes;
        } else {
            data.hour = hour;
            data.minute = minute;
            data.day_of_week = dayOfWeek;
        }

        updateSchedule.mutate(
            { jobId: selectedJob.id, data },
            {
                onSuccess: () => {
                    toast.success('Schedule updated successfully');
                    setIsDialogOpen(false);
                },
                onError: () => {
                    toast.error('Failed to update schedule');
                },
            }
        );
    };

    const getNextRunText = (isoString?: string) => {
        if (!isoString) return 'Not scheduled';
        return new Date(isoString).toLocaleString();
    };

    return (
        <>
            <Header
                title="Job Scheduler"
                subtitle="Manage automated scraping and analysis jobs"
            />
            <div className="p-6 space-y-6 max-w-6xl">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {isLoading && <p>Loading jobs...</p>}
                    {jobs?.map((job) => (
                        <Card key={job.id} className={!job.is_active ? 'opacity-75 border-dashed' : ''}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {job.name}
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <Badge variant={job.status === 'running' ? 'default' : 'secondary'}>
                                        {job.status}
                                    </Badge>
                                    {!job.is_active && <Badge variant="destructive">Inactive</Badge>}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold mb-4">
                                    {job.schedule_type === 'interval' ? (
                                        <span className="flex items-center gap-2 text-lg">
                                            <RefreshCw className="h-5 w-5 text-muted-foreground" />
                                            Every {job.interval_minutes && job.interval_minutes >= 60
                                                ? `${job.interval_minutes / 60} hours`
                                                : `${job.interval_minutes} minutes`}
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2 text-lg">
                                            <Clock className="h-5 w-5 text-muted-foreground" />
                                            At {String(job.config?.hour).padStart(2, '0')}:{String(job.config?.minute).padStart(2, '0')}
                                            {job.config?.day_of_week !== '*' && ` on ${job.config?.day_of_week}`}
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Next run: {getNextRunText(job.next_run)}
                                    </div>

                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => handleEditClick(job)}
                                    >
                                        <Settings className="h-4 w-4 mr-2" />
                                        Configure Schedule
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Configure Schedule: {selectedJob?.name}</DialogTitle>
                            <DialogDescription>
                                Set when this job should run automatically.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="active-mode">Enable Job</Label>
                                <Switch
                                    id="active-mode"
                                    checked={isActive}
                                    onCheckedChange={setIsActive}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Schedule Type</Label>
                                <Tabs value={scheduleType} onValueChange={(v: any) => setScheduleType(v)}>
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="interval">Interval</TabsTrigger>
                                        <TabsTrigger value="specific_time">Specific Time</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="interval" className="space-y-4 pt-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Every (hours)</Label>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    value={intervalMinutes >= 60 ? intervalMinutes / 60 : intervalMinutes}
                                                    onChange={(e) => setIntervalMinutes(parseFloat(e.target.value) * 60)}
                                                />
                                            </div>
                                            <div className="pt-8 text-sm text-muted-foreground">
                                                = {intervalMinutes} minutes
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="specific_time" className="space-y-4 pt-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Hour (0-23)</Label>
                                                <Input
                                                    type="number"
                                                    min={0} max={23}
                                                    value={hour}
                                                    onChange={(e) => setHour(parseInt(e.target.value))}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Minute (0-59)</Label>
                                                <Input
                                                    type="number"
                                                    min={0} max={59}
                                                    value={minute}
                                                    onChange={(e) => setMinute(parseInt(e.target.value))}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Frequency</Label>
                                            <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="*">Every Day</SelectItem>
                                                    <SelectItem value="mon">Every Monday</SelectItem>
                                                    <SelectItem value="tue">Every Tuesday</SelectItem>
                                                    <SelectItem value="wed">Every Wednesday</SelectItem>
                                                    <SelectItem value="thu">Every Thursday</SelectItem>
                                                    <SelectItem value="fri">Every Friday</SelectItem>
                                                    <SelectItem value="sat">Every Saturday</SelectItem>
                                                    <SelectItem value="sun">Every Sunday</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSave}>Save Changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}
