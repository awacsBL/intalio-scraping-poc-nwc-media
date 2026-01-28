'use client';

import { useState, useEffect } from 'react';
import { TargetUser, TargetHashtag, TargetPlace } from '@/types';
import { getTargetUsers, getTargetHashtags, getTargetPlaces, deleteTarget, activateTarget, deactivateTarget } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, RefreshCw, Trash2, Play, Pause } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { AddTargetModal } from '@/components/targets/add-target-modal';

export default function TargetsPage() {
    const [activeTab, setActiveTab] = useState('hashtags');
    const [users, setUsers] = useState<TargetUser[]>([]);
    const [hashtags, setHashtags] = useState<TargetHashtag[]>([]);
    const [places, setPlaces] = useState<TargetPlace[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    // Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addTargetType, setAddTargetType] = useState<'hashtag' | 'user' | 'place'>('hashtag');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersData, hashtagsData, placesData] = await Promise.all([
                getTargetUsers(),
                getTargetHashtags(),
                getTargetPlaces()
            ]);
            setUsers(usersData);
            setHashtags(hashtagsData);
            setPlaces(placesData);
        } catch (error) {
            toast({
                title: "Error fetching targets",
                description: "Could not load target data.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAdd = (type: 'hashtag' | 'user' | 'place') => {
        setAddTargetType(type);
        setIsAddModalOpen(true);
    };

    const handleToggleActive = async (type: 'hashtag' | 'user' | 'place', id: string, currentState: boolean) => {
        try {
            if (currentState) {
                await deactivateTarget(type, id);
            } else {
                await activateTarget(type, id);
            }
            toast({
                title: "Success",
                description: `Target ${currentState ? 'deactivated' : 'activated'} successfully.`,
            });
            fetchData();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update target status.",
                variant: "destructive"
            });
        }
    };

    const handleDelete = async (type: 'hashtag' | 'user' | 'place', id: string) => {
        try {
            await deleteTarget(type, id);
            toast({
                title: "Success",
                description: "Target deleted successfully.",
            });
            fetchData();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete target.",
                variant: "destructive"
            });
        }
    };

    const renderStatus = (isActive: boolean) => (
        <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
        </Badge>
    );

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Target Management</h1>
                    <p className="text-muted-foreground mt-2">Manage your scraping targets (Hashtags, Users, Places)</p>
                </div>
                <Button onClick={fetchData} variant="outline" size="sm">
                    <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            <Tabs defaultValue="hashtags" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="hashtags">Hashtags ({hashtags.length})</TabsTrigger>
                    <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
                    <TabsTrigger value="places">Places ({places.length})</TabsTrigger>
                </TabsList>

                {/* Hashtags Content */}
                <TabsContent value="hashtags">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Hashtags</CardTitle>
                                    <CardDescription>Monitor these hashtags for new posts</CardDescription>
                                </div>
                                <Button size="sm" onClick={() => handleAdd('hashtag')}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Hashtag
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Hashtag</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Posts</TableHead>
                                        <TableHead>Priority</TableHead>
                                        <TableHead>Last Scraped</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {hashtags.map((tag) => (
                                        <TableRow key={tag.id}>
                                            <TableCell className="font-medium">#{tag.hashtag}</TableCell>
                                            <TableCell>{renderStatus(tag.is_active)}</TableCell>
                                            <TableCell>{tag.post_count || 0}</TableCell>
                                            <TableCell>{tag.priority || 5}</TableCell>
                                            <TableCell>{tag.last_scraped_at ? new Date(tag.last_scraped_at).toLocaleDateString() : 'Never'}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleToggleActive('hashtag', tag.hashtag, tag.is_active)}
                                                >
                                                    {tag.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive"
                                                    onClick={() => handleDelete('hashtag', tag.hashtag)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {hashtags.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                No hashtags found. Add one to start scraping.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Users Content */}
                <TabsContent value="users">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Users</CardTitle>
                                    <CardDescription>Monitor specific user accounts</CardDescription>
                                </div>
                                <Button size="sm" onClick={() => handleAdd('user')}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add User
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Username</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Followers</TableHead>
                                        <TableHead>Priority</TableHead>
                                        <TableHead>Last Scraped</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">@{user.username}</TableCell>
                                            <TableCell>{renderStatus(user.is_active)}</TableCell>
                                            <TableCell>{user.follower_count?.toLocaleString() || '-'}</TableCell>
                                            <TableCell>{user.priority || 5}</TableCell>
                                            <TableCell>{user.last_scraped_at ? new Date(user.last_scraped_at).toLocaleDateString() : 'Never'}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleToggleActive('user', user.username, user.is_active)}
                                                >
                                                    {user.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive"
                                                    onClick={() => handleDelete('user', user.username)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {users.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                No users found. Add one to start scraping.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Places Content */}
                <TabsContent value="places">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Places</CardTitle>
                                    <CardDescription>Monitor location-based posts</CardDescription>
                                </div>
                                <Button size="sm" onClick={() => handleAdd('place')}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Place
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Place Name</TableHead>
                                        <TableHead>City/Country</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Calculated Posts</TableHead>
                                        <TableHead>Priority</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {places.map((place) => (
                                        <TableRow key={place.id}>
                                            <TableCell className="font-medium">{place.place_name}</TableCell>
                                            <TableCell>{place.city}{place.city && place.country ? ', ' : ''}{place.country}</TableCell>
                                            <TableCell>{renderStatus(place.is_active)}</TableCell>
                                            <TableCell>{place.post_count || 0}</TableCell>
                                            <TableCell>{place.priority || 5}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleToggleActive('place', place.place_id, place.is_active)}
                                                >
                                                    {place.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive"
                                                    onClick={() => handleDelete('place', place.place_id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {places.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                No places found. Use Discovery to find places.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

            </Tabs>

            <AddTargetModal
                type={addTargetType}
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchData}
            />
        </div>
    );
}
