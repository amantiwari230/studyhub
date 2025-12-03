export interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

export interface PdfFile {
  id: number;
  title: string;
  file_path: string;
  created_at: string;
}

export interface Link {
  id: number;
  title: string;
  url: string;
  created_at: string;
}

export interface YoutubeVideo {
  id: number;
  title: string;
  url: string;
  thumbnail: string;
  created_at: string;
}

export enum Tab {
  PDFS = 'PDFS',
  NOTES = 'NOTES',
  LINKS = 'LINKS',
  YOUTUBE = 'YOUTUBE'
}