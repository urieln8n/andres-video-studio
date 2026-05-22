// Current implementation: local filesystem under storage/ (implicit, no class)
// Future implementations:
//   - CloudflareR2StorageProvider — Cloudflare R2 via @aws-sdk/client-s3, Level 3 SaaS
//   - S3StorageProvider           — AWS S3 or compatible, Level 3 alternative
//   - NfsStorageProvider          — network-mounted volume, Level 2 VPS multi-node
//
// Paths passed to this interface are storage-relative (e.g. "storage/input/…").
// The provider resolves them to absolute local paths or remote object keys
// depending on the backend.

export interface IStorageProvider {
  /** Ensure all required storage folders / buckets exist. */
  ensureStorage(): Promise<void>;

  /** Write binary or text content to a storage path. */
  writeFile(storagePath: string, content: Buffer | string): Promise<void>;

  /** Read content from a storage path. */
  readFile(storagePath: string): Promise<Buffer>;

  /**
   * Delete a file.
   * Returns true when the file was deleted, false when it did not exist.
   */
  deleteFile(storagePath: string): Promise<boolean>;

  /** Return true when the file exists and has content. */
  fileExists(storagePath: string): Promise<boolean>;

  /**
   * Return the size of a file in bytes.
   * Returns null when the file does not exist.
   */
  getFileSize(storagePath: string): Promise<number | null>;

  /**
   * List all files whose storage path starts with the given prefix.
   * Used for cleanup routines and retention policies.
   */
  listFiles(prefix: string): Promise<string[]>;

  /**
   * Return a public URL for delivering a file to end users, or null when
   * the provider does not support direct public URLs (local filesystem).
   * At Level 3, this returns a pre-signed R2/S3 URL.
   */
  getPublicUrl(storagePath: string): string | null;

  /**
   * Return the total size in bytes of all files under a given prefix.
   * Used by the dashboard storage usage widget.
   */
  getDirectorySize(prefix: string): Promise<number>;
}
