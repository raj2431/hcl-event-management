
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

type JsonArray = unknown[];

const writeQueues = new Map<string, Promise<void>>();

async function withWriteLock<T>(
  filePath: string,
  operation: () => Promise<T>,
): Promise<T> {
  const key = resolve(filePath);
  const previous = writeQueues.get(key) ?? Promise.resolve();

  let release!: () => void;
  const gate = new Promise<void>((resolveGate) => {
    release = resolveGate;
  });

  const queued = previous.then(() => gate);
  writeQueues.set(key, queued);

  await previous;

  try {
    return await operation();
  } finally {
    release();

    if (writeQueues.get(key) === queued) {
      writeQueues.delete(key);
    }
  }
}

export async function initializeJsonFile(
  filePath: string,
): Promise<void> {
  const target = resolve(filePath);

  await mkdir(dirname(target), { recursive: true });

  try {
    await writeFile(target, "[]\n", {
      encoding: "utf8",
      flag: "wx",
    });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "EEXIST"
    ) {
      return;
    }

    throw new Error("Unable to initialize JSON storage", {
      cause: error,
    });
  }
}

export async function readJsonFile<T>(
  filePath: string,
): Promise<T[]> {
  const target = resolve(filePath);

  let content: string;

  try {
    content = await readFile(target, "utf8");
  } catch (error: unknown) {
    throw new Error("Unable to read JSON storage", {
      cause: error,
    });
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(content) as unknown;
  } catch (error: unknown) {
    throw new Error("JSON storage contains malformed JSON", {
      cause: error,
    });
  }

  if (!Array.isArray(parsed)) {
    throw new Error("JSON storage must contain an array");
  }

  return parsed as T[];
}

export async function writeJsonFile<T>(
  filePath: string,
  data: T[],
): Promise<void> {
  await withWriteLock(filePath, async () => {
    await atomicWrite(filePath, data);
  });
}

export async function updateJsonFile<T>(
  filePath: string,
  updater: (current: T[]) => T[] | Promise<T[]>,
): Promise<T[]> {
  return withWriteLock(filePath, async () => {
    const current = await readJsonFile<T>(filePath);
    const updated = await updater(current);

    if (!Array.isArray(updated)) {
      throw new Error("JSON storage updates must produce an array");
    }

    await atomicWrite(filePath, updated);

    return updated;
  });
}

async function atomicWrite<T>(
  filePath: string,
  data: T[],
): Promise<void> {
  const target = resolve(filePath);
  const temporary = `${target}.${randomUUID()}.tmp`;

  try {
    await mkdir(dirname(target), { recursive: true });

    await writeFile(
      temporary,
      `${JSON.stringify(data, null, 2)}\n`,
      {
        encoding: "utf8",
        flag: "wx",
      },
    );

    await rename(temporary, target);
  } catch (error: unknown) {
    try {
      await rm(temporary, { force: true });
    } catch {
      // Preserve the original storage error.
    }

    throw new Error("Unable to persist JSON storage", {
      cause: error,
    });
  }
}
