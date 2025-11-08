export interface Content {
  id: string;
  type: ContentType;
  title: string;
  description?: string;
  url?: string;
  contentText?: string;
  metadata: Record<string, any>;
  tags: string[];
  category?: string;
  priority: number;
  thumbnailUrl?: string;
  filePath?: string;
  source?: string;
  isFavorite: boolean;
  isArchived: boolean;
  accessCount: number;
  createdAt: string;
  updatedAt: string;
  accessedAt?: string;
}

export type ContentType =
  | 'URL'
  | 'ARTICLE'
  | 'PRODUCT'
  | 'VIDEO'
  | 'IMAGE'
  | 'NOTE'
  | 'TODO'
  | 'CODE'
  | 'PDF'
  | 'SCREENSHOT'
  | 'HANDWRITTEN'
  | 'AUDIO'
  | 'BOOKMARK';

export interface Collection {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  visibility: string;
  createdAt: string;
  updatedAt: string;
  items?: CollectionItem[];
  _count?: {
    items: number;
  };
}

export interface CollectionItem {
  id: string;
  collectionId: string;
  contentId: string;
  order: number;
  addedAt: string;
  content: Content;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  usageCount: number;
  createdAt: string;
}
