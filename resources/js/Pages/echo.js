import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Create and configure the Echo instance
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

// Export the echo instance
export default echo;
