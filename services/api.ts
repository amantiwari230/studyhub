
import { Note, PdfFile, Link, YoutubeVideo } from '../types';

// VITE_API_BASE should be set in .env.local for production (e.g., https://my-app.onrender.com/api)
// For local dev, it falls back to localhost:5000/api
const API_BASE = (import.meta as any).env.VITE_API_BASE || 'http://localhost:5000/api';

async function fetchJson<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`);
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error ${res.status}: ${errorText}`);
  }
  return res.json();
}

async function postJson<T>(endpoint: string, data: any): Promise<T> {
  const isFormData = data instanceof FormData;
  const headers = isFormData ? {} : { 'Content-Type': 'application/json' };
  
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers,
    body: isFormData ? data : JSON.stringify(data),
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error ${res.status}: ${errorText}`);
  }
  return res.json();
}

async function deleteItem(endpoint: string, id: number): Promise<void> {
  const res = await fetch(`${API_BASE}${endpoint}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete item');
}

export const api = {
  pdfs: {
    // The backend now returns full absolute URLs in the response
    getAll: () => fetchJson<PdfFile[]>('/pdf/all'),
    upload: (formData: FormData) => postJson<PdfFile>('/pdf/upload', formData),
    delete: (id: number) => deleteItem('/pdf', id),
  },
  notes: {
    getAll: () => fetchJson<Note[]>('/notes'),
    add: (note: Omit<Note, 'id' | 'created_at'>) => postJson<Note>('/notes', note),
    delete: (id: number) => deleteItem('/notes', id),
  },
  links: {
    getAll: () => fetchJson<Link[]>('/links'),
    add: (link: Omit<Link, 'id' | 'created_at'>) => postJson<Link>('/links', link),
    delete: (id: number) => deleteItem('/links', id),
  },
  youtube: {
    getAll: () => fetchJson<YoutubeVideo[]>('/youtube'),
    add: (video: Omit<YoutubeVideo, 'id' | 'created_at' | 'thumbnail'>) => postJson<YoutubeVideo>('/youtube', video),
    delete: (id: number) => deleteItem('/youtube', id),
  }
};
