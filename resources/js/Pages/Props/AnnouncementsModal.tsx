import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, List, ListItem, ListItemText, Typography, Badge,
    Drawer, IconButton, Box, Paper, CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
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
    const [pagination, setPagination] = useState({
        total: 0,
        currentPage: 1,
        lastPage: 1,
        perPage: 10,
    });
    const [loading, setLoading] = useState(true);

    const fetchAnnouncements = async (page = 1, limit = 10) => {
        setLoading(true);

        try {
            const response = await apiService.get('/announcements', {
                params: { page, limit },
            });

            setAnnouncements(response.data.data); // Update announcements list
            setPagination((prev) => ({
                ...prev,
                total: response.data.pagination.total,
                currentPage: response.data.pagination.currentPage,
                lastPage: response.data.pagination.lastPage,
                perPage: response.data.pagination.perPage,
            }));
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

            fetchAnnouncements(pagination.currentPage, pagination.perPage);
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
    }, [open, pagination.currentPage]);

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

            <Drawer
                anchor="right"
                open={open}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        width: 400,
                        padding: 3,
                        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
                        display: "flex",
                        flexDirection: "column",
                    },
                }}
            >
                {/* Header */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" fontWeight="bold">
                        📢 Announcements
                    </Typography>
                    <IconButton onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* Content */}
                <Box
                    sx={{
                        flexGrow: 1,
                        overflowY: "auto",
                        pr: 1,
                    }}
                >
                    {loading ? (
                        <Box display="flex" justifyContent="center" mt={4}>
                            <CircularProgress />
                        </Box>
                    ) : announcements.length === 0 ? (
                        <Typography color="text.secondary">No announcements available.</Typography>
                    ) : (
                        announcements.map((announcement) => (
                            <Paper
                                key={announcement.id}
                                elevation={2}
                                sx={{
                                    padding: 2,
                                    marginBottom: 2,
                                    borderRadius: 2,
                                    backgroundColor: "#f9f9f9",
                                    transition: "all 0.3s ease",
                                    ":hover": {
                                        backgroundColor: "#f1f1f1",
                                    },
                                }}
                            >
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                    {announcement.title}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    {announcement.content}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {new Date(announcement.date).toLocaleDateString()}
                                </Typography>
                            </Paper>
                        ))
                    )}
                </Box>

                {/* Pagination Controls */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Button
                        variant="outlined"
                        disabled={pagination.currentPage === 1}
                        onClick={() =>
                            fetchAnnouncements(pagination.currentPage - 1, pagination.perPage)
                        }
                    >
                        Previous
                    </Button>

                    <Typography sx={{ mx: 2 }}>
                        Page {pagination.currentPage} of {pagination.lastPage}
                    </Typography>

                    <Button
                        variant="outlined"
                        disabled={pagination.currentPage === pagination.lastPage}
                        onClick={() =>
                            fetchAnnouncements(pagination.currentPage + 1, pagination.perPage)
                        }
                    >
                        Next
                    </Button>
                </Box>

                {/* Footer */}
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleClose}
                    fullWidth
                    sx={{ mt: 2 }}
                >
                    Close
                </Button>
            </Drawer>
        </>
    );
};

export default AnnouncementModal;