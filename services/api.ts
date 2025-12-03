import { Note, PdfFile, Link, YoutubeVideo } from '../types';

// In Vite, environment variables are accessed via import.meta.env
// PROD: If VITE_API_URL is set (e.g. on Render), use it.
// DEV: fallback to localhost:5000.
const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000';

// Helper to simulate network delay for mock mode
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to generate IDs for mock data
const generateId = () => Date.now();

// --- MOCK DATA HANDLERS (LocalStorage) ---
const getLocalStorage = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const setLocalStorage = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// --- API WRAPPERS ---

async function fetchWithFallback<T>(endpoint: string, storageKey: string): Promise<T[]> {
  try {
    const res = await fetch(`${API_URL}${endpoint}`);
    if (!res.ok) throw new Error('Backend unavailable');
    return await res.json();
  } catch (err) {
    console.warn(`Backend unreachable (${endpoint}), using LocalStorage.`);
    return getLocalStorage<T>(storageKey);
  }
}

async function postWithFallback<T>(endpoint: string, storageKey: string, data: any): Promise<T> {
  try {
    const isFormData = data instanceof FormData;
    const headers = isFormData ? {} : { 'Content-Type': 'application/json' };
    
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: isFormData ? data : JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Backend unavailable');
    return await res.json();
  } catch (err) {
    console.warn(`Backend unreachable (${endpoint}), saving to LocalStorage.`);
    const current = getLocalStorage<any>(storageKey);
    let newItem: any;
    
    if (endpoint.includes('pdf')) {
       newItem = { 
         id: generateId(), 
         title: data.get('title'), 
         file_path: '#', 
         created_at: new Date().toISOString() 
       };
    } else {
       newItem = { ...data, id: generateId(), created_at: new Date().toISOString() };
       if(endpoint.includes('youtube')) {
         const videoId = data.url.split('v=')[1]?.split('&')[0];
         newItem.thumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/0.jpg` : 'https://picsum.photos/320/180';
       }
    }
    
    setLocalStorage(storageKey, [...current, newItem]);
    await delay(500); 
    return newItem;
  }
}

async function deleteWithFallback(endpoint: string, storageKey: string, id: number): Promise<void> {
  try {
    const res = await fetch(`${API_URL}${endpoint}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Backend unavailable');
  } catch (err) {
    console.warn(`Backend unreachable (${endpoint}), deleting from LocalStorage.`);
    const current = getLocalStorage<any>(storageKey);
    setLocalStorage(storageKey, current.filter(item => item.id !== id));
    await delay(200);
  }
}

// --- EXPORTED FUNCTIONS ---

export const api = {
  pdfs: {
    getAll: () => fetchWithFallback<PdfFile>('/pdf/all', 'pdfs'),
    upload: (formData: FormData) => postWithFallback<PdfFile>('/pdf/upload', 'pdfs', formData),
    delete: (id: number) => deleteWithFallback('/pdf', 'pdfs', id),
    getDownloadUrl: (id: number) => `${API_URL}/pdf/download/${id}`
  },
  notes: {
    getAll: () => fetchWithFallback<Note>('/notes', 'notes'),
    add: (note: Omit<Note, 'id' | 'created_at'>) => postWithFallback<Note>('/notes', 'notes', note),
    delete: (id: number) => deleteWithFallback('/notes', 'notes', id),
  },
  links: {
    getAll: () => fetchWithFallback<Link>('/links', 'links'),
    add: (link: Omit<Link, 'id' | 'created_at'>) => postWithFallback<Link>('/links', 'links', link),
    delete: (id: number) => deleteWithFallback('/links', 'links', id),
  },
  youtube: {
    getAll: () => fetchWithFallback<YoutubeVideo>('/youtube', 'youtube'),
    add: (video: Omit<YoutubeVideo, 'id' | 'created_at' | 'thumbnail'>) => postWithFallback<YoutubeVideo>('/youtube', 'youtube', video),
    delete: (id: number) => deleteWithFallback('/youtube', 'youtube', id),
  }
};