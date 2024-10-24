export interface CollectionFormData {
  title: string;
  description?: string;
  readAccess: 'public' | 'private';
  editAccess: 'public' | 'private';
  images: number[];
  headerImage?: string;
}
