'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addTargets } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface AddTargetModalProps {
    type: 'hashtag' | 'user' | 'place';
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function AddTargetModal({ type, isOpen, onClose, onSuccess }: AddTargetModalProps) {
    const [loading, setLoading] = useState(false);
    const [inputVal, setInputVal] = useState(''); // comma separated for hashtags/users
    const [placeId, setPlaceId] = useState('');
    const [placeName, setPlaceName] = useState('');
    const [priority, setPriority] = useState('5');
    const [notes, setNotes] = useState('');

    // Reset form when type changes or modal opens (handled roughly by key or effect usually, but let's keep it simple)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const p = parseInt(priority);

            if (type === 'hashtag') {
                const hashtags = inputVal.split(',').map(s => s.trim().replace(/^#/, '')).filter(s => s.length > 0);
                if (hashtags.length === 0) {
                    toast.error('Please enter at least one hashtag');
                    setLoading(false);
                    return;
                }
                await addTargets({ hashtags, priority: p, notes });
            } else if (type === 'user') {
                const usernames = inputVal.split(',').map(s => s.trim().replace(/^@/, '')).filter(s => s.length > 0);
                if (usernames.length === 0) {
                    toast.error('Please enter at least one username');
                    setLoading(false);
                    return;
                }
                await addTargets({ usernames, priority: p, notes });
            } else if (type === 'place') {
                if (!placeId || !placeName) {
                    toast.error('Please enter Place ID and Name');
                    setLoading(false);
                    return;
                }
                await addTargets({
                    places: [{ place_id: placeId, place_name: placeName }],
                    priority: p,
                    notes
                });
            }

            toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} added successfully!`);
            setInputVal('');
            setPlaceId('');
            setPlaceName('');
            setNotes('');
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Failed to add target');
        } finally {
            setLoading(false);
        }
    };

    const getTitle = () => {
        switch (type) {
            case 'hashtag': return 'Add Hashtags';
            case 'user': return 'Add Users';
            case 'place': return 'Add Place';
        }
    };

    const getDescription = () => {
        switch (type) {
            case 'hashtag': return 'Enter hashtags separated by commas.';
            case 'user': return 'Enter usernames separated by commas.';
            case 'place': return 'Enter the Place ID and Name (e.g. from Instagram URL).';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{getTitle()}</DialogTitle>
                    <DialogDescription>{getDescription()}</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">

                    {type !== 'place' ? (
                        <div className="space-y-2">
                            <Label htmlFor="input">{type === 'hashtag' ? 'Hashtags' : 'Usernames'}</Label>
                            <Textarea
                                id="input"
                                placeholder={type === 'hashtag' ? 'nwc_media, water' : 'nwc_media, sustainability'}
                                value={inputVal}
                                onChange={(e) => setInputVal(e.target.value)}
                            />
                        </div>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="placeName">Place Name</Label>
                                <Input
                                    id="placeName"
                                    placeholder="King  Khalid International Airport"
                                    value={placeName}
                                    onChange={(e) => setPlaceName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="placeId">Place ID</Label>
                                <Input
                                    id="placeId"
                                    placeholder="123456789"
                                    value={placeId}
                                    onChange={(e) => setPlaceId(e.target.value)}
                                />
                            </div>
                        </>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select value={priority} onValueChange={setPriority}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">High (10)</SelectItem>
                                <SelectItem value="5">Normal (5)</SelectItem>
                                <SelectItem value="1">Low (1)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Input
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
