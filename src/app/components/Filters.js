// app/components/Filters.js
export default function Filters({ course, setCourse, date, setDate, availableCourses }) {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <div>
        <label className="block text-sm font-medium">Course</label>
        <select
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">All Courses</option>
          {availableCourses.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded p-2"
        />
      </div>
    </div>
  );
}
