/**
 * Abstraction over file storage (local filesystem, S3-compatible such as MinIO).
 * Implementations must be substitutable: callers never know which backend is in use.
 * Stored bytes are always client-side ciphertext.
 */
export interface BlobStore {
  put(key: string, data: Uint8Array): Promise<void>;
  get(key: string): Promise<Uint8Array | null>;
  delete(key: string): Promise<void>;
  signedUrl(key: string, expiresInSeconds: number): Promise<string>;
}
