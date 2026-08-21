export interface LinkItem {
  id: string;
  title: string;
  url: string;
  description?: string;
  categoryId: string;
  tags: string[];
  isFavorite: boolean;
  customIcon?: string;
  clicks: number;
  createdAt: number;
  updatedAt?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
}

export type ViewMode = 'grid' | 'list' | 'compact';
export type SortOption = 'recent' | 'alphabetical' | 'clicks' | 'favorite';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  message: string;
}
