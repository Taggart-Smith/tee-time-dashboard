import { MongoClient } from "mongodb";

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME;
const COLLECTION_NAME = process.env.COLLECTION_NAME;

// ✅ Force Node runtime (not Edge)
export const runtime = 'nodejs';

export async function GET(request) {
  // ✅ EXPLICIT TLS
  const client = new MongoClient(MONGO_URI, {
    tls: true,
  });

  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date");
  const courseParam = searchParams.get("course");

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    const filter = {};
    if (courseParam && courseParam !== "All" && courseParam !== "All Courses") {
      filter.course = courseParam;
    }

    if (dateParam) {
      const dateObj = new Date(dateParam);
      const nextDay = new Date(dateObj);
      nextDay.setDate(dateObj.getDate() + 1);
      filter.dateISO = { $gte: dateObj, $lt: nextDay };
    }

    const teeTimes = await collection.find(filter).sort({ dateISO: 1, time: 1 }).toArray();

    return new Response(JSON.stringify(teeTimes), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("API Error:", err);

    return new Response(
      JSON.stringify({
        error: "Failed to fetch tee times",
        message: err.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  } finally {
    await client.close();
  }
}
