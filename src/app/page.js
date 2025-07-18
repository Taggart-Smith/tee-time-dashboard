"use client";

import { useEffect, useState } from "react";

const formatDate = (date) => date.toISOString().split("T")[0];

const normalizeTime = (rawTime) => {
  const [time, meridiem] = rawTime.trim().split(" ");
  const [hour, minute] = time.split(":").map(Number);
  const h = hour % 12;
  const normalizedHour = h === 0 ? 12 : h;
  return `${normalizedHour.toString().padStart(2, "0")}:${minute
    .toString()
    .padStart(2, "0")} ${meridiem}`;
};

// Helper: Given a time string like "7:03 AM", returns the slot label like "7:00 AM"
function getSlotLabel(timeStr) {
  const [hourMin, suffix] = timeStr.trim().split(" ");
  let [hour, min] = hourMin.split(":").map(Number);

  // Convert to 24-hour time for math
  if (suffix === "PM" && hour !== 12) hour += 12;
  if (suffix === "AM" && hour === 12) hour = 0;

  // Round down minutes to nearest 10
  min = Math.floor(min / 10) * 10;

  // Format back to slot label
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const displayMin = min.toString().padStart(2, "0");
  const displaySuffix = hour >= 12 ? "PM" : "AM";
  return `${displayHour}:${displayMin} ${displaySuffix}`;
}

const generateTimeSlots = () => {
  const times = [];
  const current = new Date();
  current.setHours(7, 0, 0, 0);
  const end = new Date();
  end.setHours(20, 0, 0, 0);

  while (current <= end) {
    const h = current.getHours();
    const m = current.getMinutes();
    const suffix = h >= 12 ? "PM" : "AM";
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    const displayMin = m.toString().padStart(2, "0");
    times.push(`${displayHour}:${displayMin} ${suffix}`);
    current.setMinutes(current.getMinutes() + 10);
  }
  return times;
};

const timeSlots = generateTimeSlots();

export default function Home() {
  const [teeTimesByTime, setTeeTimesByTime] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCourse, setSelectedCourse] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [courseSearch, setCourseSearch] = useState(""); // NEW

  useEffect(() => {
    const formattedDate = formatDate(selectedDate);

    const url = new URL("/api/tee-times", window.location.origin);
    url.searchParams.append("date", formattedDate);

    if (selectedCourse && selectedCourse !== "All") {
      url.searchParams.append("course", selectedCourse);
    }

    fetch(url.toString())
      .then((res) => res.json())
      .then((data) => {
        const grouped = {};
        const courseSet = new Set();

        data.forEach((tt) => {
          courseSet.add(tt.course);
          const slotLabel = getSlotLabel(tt.time);
          if (!grouped[slotLabel]) grouped[slotLabel] = {};
          if (!grouped[slotLabel][tt.course]) grouped[slotLabel][tt.course] = [];
          grouped[slotLabel][tt.course].push(tt);
        });

        setTeeTimesByTime(grouped);
        setAllCourses(Array.from(courseSet));
      })
      .catch((err) => console.error("Error fetching tee times:", err));
  }, [selectedDate, selectedCourse]);

  // Filtered courses for the search bar
  const filteredCourses = allCourses.filter((course) =>
    course.toLowerCase().includes(courseSearch.toLowerCase())
  );

  return (
    <main className="p-2 sm:p-4 max-w-6xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">Tee Sheet</h1>

      <div className="flex flex-col sm:flex-row flex-wrap gap-2 mb-4 items-center">
        <input
          type="date"
          value={formatDate(selectedDate)}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
          className="w-full sm:w-auto px-4 py-2 border rounded-md shadow-sm text-base sm:text-lg"
        />
        <div className="flex-1 min-w-[180px] sm:min-w-[220px] relative w-full">
          <input
            type="text"
            placeholder="Search courses..."
            value={courseSearch}
            onChange={(e) => setCourseSearch(e.target.value)}
            className="w-full px-4 py-2 border rounded-md shadow-sm text-base sm:text-lg"
            autoComplete="off"
          />
          {courseSearch && filteredCourses.filter(c => !selectedCourse.includes(c)).length > 0 && (
            <div className="absolute z-10 bg-white border rounded shadow-md mt-1 w-full max-h-40 overflow-y-auto">
              {filteredCourses
                .filter((course) => !selectedCourse.includes(course))
                .map((course, idx) => (
                  <div
                    key={idx}
                    className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                    onClick={() => {
                      setSelectedCourse([...selectedCourse, course]);
                      setCourseSearch(""); // clear search after selection
                    }}
                  >
                    {course}
                  </div>
                ))}
            </div>
          )}
        </div>
        <button
          className="px-2 py-1 border rounded text-xs"
          onClick={() => setSelectedCourse([])}
          type="button"
        >
          None
        </button>
      </div>

      {/* Selected courses as tags */}
      <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
        {selectedCourse.map((course, idx) => (
          <span
            key={idx}
            className="bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm flex items-center"
          >
            {course}
            <button
              className="ml-2 text-blue-500 hover:text-blue-700"
              onClick={() =>
                setSelectedCourse(selectedCourse.filter((c) => c !== course))
              }
              title="Remove"
              type="button"
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border text-xs sm:text-base">
          <thead>
            <tr>
              <th className="border px-2 py-1 bg-gray-50 sticky left-0 bg-white z-10">Time</th>
              {allCourses.map((course) => (
                <th key={course} className="border px-2 py-1 bg-gray-50 whitespace-nowrap">
                  {course}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((time, index) => (
              <tr key={index}>
                <td className="border px-2 py-1 font-semibold text-gray-700 text-center sticky left-0 bg-white z-10">
                  {time}
                </td>
                {allCourses.map((course) => (
                  <td key={course} className="border px-2 py-1 min-w-[120px] align-top">
                    {(teeTimesByTime[time]?.[course] || []).map((tt, i) => (
                      <div
                        key={i}
                        className="bg-gray-100 p-2 mb-1 rounded shadow-sm hover:bg-blue-50 cursor-pointer"
                        onClick={() => alert(`Booked ${tt.course} at ${time}`)}
                      >
                        <div className="text-blue-700 font-bold">{tt.course}</div>
                        <div className="text-xs sm:text-sm text-gray-600">
                          ${tt.price != null ? tt.price.toFixed(2) : "N/A"} • Players:{" "}
                          {tt.minPlayers} - {tt.maxPlayers}
                        </div>
                      </div>
                    ))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
