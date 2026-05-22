import type { VideoEditorClient } from "@/lib/video-editor/client-types";

// Current implementation: lib/video-editor/client-store.ts  (local JSON files)
// Future implementations:
//   - SupabaseClientStore — Supabase/Postgres with tenant isolation, Level 3 SaaS
//   - PostgresClientStore — direct pg, Level 2 VPS
//
// At Level 3 each client row will carry a user_id / org_id foreign key for
// multi-tenant isolation. The interface remains the same; the store enforces
// the scope internally.

export interface IClientStore {
  /** Return all clients sorted alphabetically by business name. */
  listClients(): Promise<VideoEditorClient[]>;

  /**
   * Read a single client by ID.
   * Returns null when the client does not exist or the ID is invalid.
   */
  readClient(clientId: string): Promise<VideoEditorClient | null>;

  /**
   * Create a new client from raw input.
   * The store is responsible for assigning a UUID and validating fields.
   */
  createClient(value: unknown): Promise<VideoEditorClient>;

  /**
   * Update an existing client with partial raw input.
   * Returns null when the client does not exist.
   */
  updateClient(
    clientId: string,
    value: unknown,
  ): Promise<VideoEditorClient | null>;

  /**
   * Permanently delete a client record.
   * Returns the deleted client, or null when it did not exist.
   */
  deleteClient(clientId: string): Promise<VideoEditorClient | null>;
}
