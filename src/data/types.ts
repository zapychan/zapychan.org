export interface Artwork {
  id: string;
  title: string;
  year: number;
  medium: string;
  dimensions?: string;
  thumbnail: string;
  fullImage: string;
  description?: string;
  date?: string; // ISO date string (YYYY-MM-DD) from file metadata
}
