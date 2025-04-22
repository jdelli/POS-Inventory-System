import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, List, ListItem, ListItemText, Typography, Badge,
} from '@mui/material';
import CampaignIcon from '@mui/icons-material/Campaign';
import apiService from '../Services/ApiService';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

(window as any).Pusher = Pusher;

interface Announcement {
    id: number;
    title: string;
    content: string;
    date: string;
}

interface AnnouncementModalProps {
    onNewAnnouncement: () => void; // To update parent unread count
    unreadCount: number;
}

const AnnouncementModal: React.FC<AnnouncementModalProps> = ({ onNewAnnouncement, unreadCount }) => {
    const [open, setOpen] = useState(false);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAnnouncements = async () => {
        try {
            const response = await apiService.get('/announcements');
            setAnnouncements(response.data);
        } catch (error) {
            console.error('Error fetching announcements:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAllAsRead = async () => {
        try {
            const unreadResponse = await apiService.get('/announcements/unread');
            const unreadIds = unreadResponse.data.map((item: any) => item.announcement.id);

            // Mark each unread one
            await Promise.all(
                unreadIds.map((id: number) =>
                    apiService.patch(`/announcements/${id}/read`)
                )
            );

            // Notify parent to refresh unread count
            onNewAnnouncement();
        } catch (error) {
            console.error('Error marking announcements as read:', error);
        }
    };

    useEffect(() => {
        if (open) {
            const echo = new Echo({
                broadcaster: 'pusher',
                key: import.meta.env.VITE_REVERB_APP_KEY,
                wsHost: import.meta.env.VITE_REVERB_HOST,
                wsPort: Number(import.meta.env.VITE_REVERB_PORT),
                forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'https',
                disableStats: true,
                enabledTransports: ['ws'],
                cluster: 'mt1',
            });

            fetchAnnouncements();
            markAllAsRead();

            echo.channel('announcements').listen('.new-announcement', (data: any) => {
                console.log('📣 Received announcement:', data);
                setAnnouncements((prev) => [data.announcement, ...prev]);
                onNewAnnouncement(); // refresh unread count
            });

            return () => {
                echo.leave('announcements');
                echo.disconnect();
            };
        }
    }, [open]);

    const handleOpen = () => setOpen(true);

    const handleClose = () => {
        onNewAnnouncement(); // Notify parent when closing modal
        setOpen(false);
    };

    return (
        <>
                <Button color="inherit" onClick={handleOpen}>
            {/* Announcements */}
            <Badge
                color="error"
                badgeContent={unreadCount > 0 ? unreadCount : null} // Shows number only if unreadCount > 0
                sx={{ ml: 1 }} // Adds a margin to the left of the badge
            >
                <CampaignIcon />
            </Badge>
        </Button>


            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                <DialogTitle>Announcements</DialogTitle>
                <DialogContent>
                    {loading ? (
                        <Typography>Loading announcements...</Typography>
                    ) : announcements.length === 0 ? (
                        <Typography>No announcements available.</Typography>
                    ) : (
                        <List>
                            {announcements.map((announcement) => (
                                <ListItem key={announcement.id} divider>
                                    <ListItemText
                                        primary={announcement.title}
                                        secondary={
                                            <>
                                                <Typography variant="body2">{announcement.content}</Typography>
                                                <Typography variant="caption">
                                                    {new Date(announcement.date).toLocaleDateString()}
                                                </Typography>
                                            </>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">Close</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default AnnouncementModal;
