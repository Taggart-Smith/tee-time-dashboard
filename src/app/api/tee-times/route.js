import { MongoClient } from "mongodb";

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME;
const COLLECTION_NAME = process.env.COLLECTION_NAME;

export async function GET(request) {
  const client = new MongoClient(MONGO_URI);
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date"); // optional
  const courseParam = searchParams.get("course"); // optional

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Build query filter
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

    // Query the collection
    const teeTimes = await collection.find(filter).sort({ dateISO: 1, time: 1 }).toArray();

    // Group tee times by course and date for neat display (API returns JSON)
    const grouped = {};
    teeTimes.forEach(tt => {
      const key = `${tt.course} | ${tt.date}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(tt);
    });

    return new Response(JSON.stringify(teeTimes), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("API Error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to fetch tee times" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  } finally {
    await client.close();
  }
}
