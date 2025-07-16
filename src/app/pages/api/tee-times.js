// pages/api/tee-times.js
import clientPromise from '../../lib/mongo';

export default async function handler(req, res) {
  const { course, date } = req.query;

  const client = await clientPromise;
  const db = client.db('tee-times');
  const collection = db.collection('tee_times_2.0');

  const query = {};
  if (course) query.course = course;
  if (date) query.dateISO = new Date(date);

  const teeTimes = await collection.find(query).sort({ dateISO: 1, time: 1 }).toArray();

  res.json(teeTimes);
}
