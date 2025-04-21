import React, { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  TextField,
  Button,
  Paper,
} from '@mui/material';
import axios from 'axios';

// Interface for Announcement
interface Announcement {
  id: number;
  title: string;
  content: string;
  date: string; // Date in YYYY-MM-DD format
}

const Announcement = () => {
  // State for announcements and form fields
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch announcements from backend
  useEffect(() => {
    axios
      .get('/api/announcements')
      .then((res) => setAnnouncements(res.data))
      .catch((err) => console.error('Error fetching announcements:', err));
  }, []);

  // Handle posting a new announcement
  const handlePostAnnouncement = async () => {
    if (newTitle.trim() === '' || newContent.trim() === '') return;

    setLoading(true);

    try {
      const response = await axios.post('/api/announcements', {
        title: newTitle,
        content: newContent,
      });

      // Add the new announcement to the top of the list
      setAnnouncements([response.data, ...announcements]);

      // Clear the form fields
      setNewTitle('');
      setNewContent('');
    } catch (error) {
      console.error('Failed to post announcement:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Announcements</h2>}>
      <Head title="Announcements" />
      <Box p={2}>
        {/* Form for Posting New Announcements */}
        <Paper elevation={3} sx={{ p: 2, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Post New Announcement
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Content"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              multiline
              rows={4}
              fullWidth
              required
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handlePostAnnouncement}
              disabled={loading}
            >
              {loading ? 'Posting...' : 'Post Announcement'}
            </Button>
          </Stack>
        </Paper>

        {/* Display Existing Announcements */}
        <Stack spacing={2}>
          {announcements.length === 0 ? (
            <Typography>No announcements yet.</Typography>
          ) : (
            announcements.map((announcement) => (
              <Card key={announcement.id} variant="outlined">
                <CardContent>
                  <Typography variant="h6">{announcement.title}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {/* Safely parse and display the date */}
                    {announcement.date
                      ? new Date(announcement.date).toLocaleDateString()
                      : 'Invalid Date'}
                  </Typography>
                  <Typography variant="body1" mt={1}>
                    {announcement.content}
                  </Typography>
                </CardContent>
              </Card>
            ))
          )}
        </Stack>
      </Box>
    </AdminLayout>
  );
};

export default Announcement;