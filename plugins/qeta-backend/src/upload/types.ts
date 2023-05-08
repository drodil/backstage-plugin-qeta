export interface File {
  name: string;
  path: string;
  buffer: Buffer;
  mimeType: string;
  ext: string;
  size: number;
}
