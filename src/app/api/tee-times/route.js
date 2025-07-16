import { MongoClient } from "mongodb";

const MONGO_URI = "mongodb+srv://smithtaggart15:3U8pODunzZu9luDh@cluster0.f4y4i0g.mongodb.net/";
const DB_NAME = "golf";
const COLLECTION_NAME = "tee_times";

export async function GET() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    const teeTimes = await collection.find().sort({ dateISO: 1 }).toArray();

    return new Response(JSON.stringify(teeTimes), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("API Error:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch tee times" }), {
      status: 500,
    });
  } finally {
    await client.close();
  }
}
