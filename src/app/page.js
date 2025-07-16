// app/page.js
"use client";

import { useEffect, useState } from "react";
import TeeTimeTable from "./components/TeeTimeTable";
import Filters from "./components/Filters";

export default function Home() {
  const [teeTimes, setTeeTimes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [date, setDate] = useState("");
  const [course, setCourse] = useState("");

  useEffect(() => {
    fetch("/api/tee-times")
      .then((res) => res.json())
      .then((data) => {
        setTeeTimes(data);
        setFiltered(data);
      });
  }, []);

  useEffect(() => {
    let filtered = teeTimes;
    if (course) {
      filtered = filtered.filter((t) => t.course === course);
    }
    if (date) {
      filtered = filtered.filter(
        (t) => new Date(t.dateISO).toISOString().split("T")[0] === date
      );
    }
    setFiltered(filtered);
  }, [course, date, teeTimes]);

  return (
    <main className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Tee Time Dashboard</h1>
      <Filters
        course={course}
        setCourse={setCourse}
        date={date}
        setDate={setDate}
        availableCourses={[...new Set(teeTimes.map((t) => t.course))]}
      />
      <TeeTimeTable teeTimes={filtered} />
    </main>
  );
}
