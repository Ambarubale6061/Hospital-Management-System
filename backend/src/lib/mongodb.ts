import { MongoClient, Db, Collection } from "mongodb";

const uri = process.env.MONGODB_URI;
let available: boolean | null = null;
let client: MongoClient | null = null;
let db: Db | null = null;

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`MongoDB timeout after ${ms}ms`)), ms)
    ),
  ]);
}

async function connect(): Promise<Db | null> {
  if (!uri) { available = false; return null; }
  if (available === false) return null;
  if (db) return db;

  try {
    const c = new MongoClient(uri, {
      serverSelectionTimeoutMS: 4000,
      connectTimeoutMS: 4000,
    });
    await withTimeout(c.connect(), 4500);
    client = c;
    db = c.db("hms");
    available = true;
    return db;
  } catch {
    available = false;
    return null;
  }
}

export async function getCollection(name: string): Promise<Collection | null> {
  const database = await connect();
  return database ? database.collection(name) : null;
}

export function isMongoAvailable() {
  return available !== false;
}
