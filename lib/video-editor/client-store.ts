import { randomUUID } from "node:crypto";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  isValidClientId,
  normalizeClientInput,
} from "@/lib/video-editor/client-utils";
import type { VideoEditorClient } from "@/lib/video-editor/client-types";

const clientsRoot = path.join(process.cwd(), "storage", "clients");
const clientLogosRoot = path.join(clientsRoot, "logos");

export async function ensureClientStorage() {
  await Promise.all([
    mkdir(clientsRoot, { recursive: true }),
    mkdir(clientLogosRoot, { recursive: true }),
  ]);
}

export async function listClients() {
  await ensureClientStorage();
  const entries = await readdir(clientsRoot, { withFileTypes: true });
  const clients = await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
      .map(async (entry) => readClient(path.basename(entry.name, ".json"))),
  );

  return clients
    .filter((client): client is VideoEditorClient => Boolean(client))
    .sort((left, right) => left.businessName.localeCompare(right.businessName, "es"));
}

export async function readClient(clientId: string) {
  if (!isValidClientId(clientId)) {
    return null;
  }

  try {
    const value = JSON.parse(
      await readFile(getClientAbsolutePath(clientId), "utf8"),
    ) as VideoEditorClient;

    return value.id === clientId ? value : null;
  } catch (error) {
    if (isMissing(error)) {
      return null;
    }

    throw error;
  }
}

export async function createClient(value: unknown) {
  const id = randomUUID();
  const client = {
    id,
    ...normalizeClientInput(value),
  } satisfies VideoEditorClient;

  await writeClient(client);
  return client;
}

export async function updateClient(clientId: string, value: unknown) {
  const current = await readClient(clientId);

  if (!current) {
    return null;
  }

  const client = {
    id: current.id,
    ...normalizeClientInput(value, current),
  } satisfies VideoEditorClient;

  await writeClient(client);
  return client;
}

export async function deleteClient(clientId: string) {
  const client = await readClient(clientId);

  if (!client) {
    return null;
  }

  const filePath = path.resolve(getClientAbsolutePath(clientId));
  const root = path.resolve(clientsRoot);

  if (!isInsideRoot(root, filePath)) {
    return null;
  }

  await rm(filePath, { force: true });
  return client;
}

async function writeClient(client: VideoEditorClient) {
  await ensureClientStorage();
  await writeFile(getClientAbsolutePath(client.id), JSON.stringify(client, null, 2), "utf8");
}

function getClientAbsolutePath(clientId: string) {
  return path.join(clientsRoot, `${path.basename(clientId)}.json`);
}

function isInsideRoot(root: string, candidate: string) {
  const relative = path.relative(root, candidate);

  return relative.length > 0 && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function isMissing(error: unknown): error is NodeJS.ErrnoException {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}
