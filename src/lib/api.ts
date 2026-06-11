import axios from 'axios';
import { securityService } from './securityService';

const api = axios.create({
    // Use the rewrite proxy if deployed, otherwise fallback to local backend or direct
    baseURL: typeof window !== 'undefined' ? '/api' : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'),
});

api.interceptors.request.use((config) => {
    const method = String(config.method || 'get').toLowerCase();
    
    // Prevent duplicate request spamming via client-side rate throttling
    const endpoint = config.url || '';
    if (method !== 'get' && securityService.shouldThrottleRequest(endpoint)) {
        return Promise.reject(new Error('Throttled: Duplicate request rate limit exceeded.'));
    }

    const resolvedUrl = (() => {
        try {
            return new URL(config.url || '', config.baseURL || undefined);
        } catch {
            return null;
        }
    })();

    const hostname = resolvedUrl?.hostname || '';
    const isLocaLtHost = hostname.endsWith('loca.lt');
    const isTunnelHost =
        isLocaLtHost ||
        hostname.endsWith('ngrok.io') ||
        hostname.endsWith('ngrok-free.app') ||
        hostname.endsWith('trycloudflare.com');

    const isPublicSettingsRequest =
        method === 'get' && String(config.url || '').includes('/settings/public');

    // 1. Inject Token
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Inject Active Hotel Context (For SaaS Data Isolation)
    let isTenantContext = false;
    const currentHotel = localStorage.getItem('currentHotel');
    if (currentHotel && currentHotel !== 'undefined' && currentHotel !== 'null') {
        try {
            const hotel = JSON.parse(currentHotel);
            if (hotel && hotel.hotel_id) {
                config.headers['x-hotel-id'] = hotel.hotel_id;
                isTenantContext = true;
            }
        } catch (e) {
            console.error('Failed to parse currentHotel for header injection', e);
        }
    }

    // Explicitly signal system-scope requests when no active tenant is selected.
    // Keep GET requests "simple" to avoid unnecessary CORS preflight.
    if (!isTenantContext && method !== 'get') {
        config.headers['x-app-scope'] = 'system';
    }

    // Tunnel reminder-bypass headers can force CORS preflight. Avoid them for
    // simple/public GET endpoints and only add for tunneled non-GET requests.
    if (isLocaLtHost) {
        config.headers['Bypass-Tunnel-Reminder'] = 'true';
    }

    if (isTunnelHost && method !== 'get' && !isPublicSettingsRequest) {
        config.headers['Bypass-Tunnel-Reminder'] = 'true';
        config.headers['ngrok-skip-browser-warning'] = 'true';
    }

    return config;
});

// Setup rate-limit interceptor for 429 response errors
securityService.setupRateLimitInterceptor(api);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const isBrowser = typeof window !== 'undefined';
            if (isBrowser) {
                const path = window.location.pathname || '';
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('availableHotels');
                localStorage.removeItem('currentHotel');

                if (path.startsWith('/dapp')) {
                    window.location.href = '/dapp/login';
                } else if (path !== '/login' && path !== '/developer/login') {
                    window.location.href = '/developer/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

let globalCacheBuster = '';
if (typeof window !== 'undefined') {
    if (!(window as any).__mediaCacheBuster) {
        (window as any).__mediaCacheBuster = Date.now().toString(36);
    }
    globalCacheBuster = (window as any).__mediaCacheBuster;
}

export const getMediaUrl = (url: string | null | undefined) => {
    if (!url) return '';
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace('/api', '');
    
    let finalUrl = url;
    if (url.startsWith('http')) {
        try {
            const parsedUrl = new URL(url);
            if (parsedUrl.hostname === 'localhost' && parsedUrl.port === '5000') {
                 const currentBaseUrl = new URL(baseUrl);
                 parsedUrl.hostname = currentBaseUrl.hostname;
                 parsedUrl.port = currentBaseUrl.port;
                 parsedUrl.protocol = currentBaseUrl.protocol;
                 finalUrl = parsedUrl.toString();
            }
        } catch (e) {}
    } else {
        finalUrl = `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    }

    // Append session cache-buster to prevent stale DP/images
    if (globalCacheBuster && typeof window !== 'undefined') {
        try {
            const u = new URL(finalUrl);
            if (!u.searchParams.has('cb')) {
                u.searchParams.set('cb', globalCacheBuster);
            }
            return u.toString();
        } catch(e) {
            return finalUrl;
        }
    }

    return finalUrl;
};

export default api;

