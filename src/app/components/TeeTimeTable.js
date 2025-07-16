// app/components/TeeTimeTable.js
export default function TeeTimeTable({ teeTimes }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Time</th>
            <th className="p-2 border">Course</th>
            <th className="p-2 border">Players</th>
            <th className="p-2 border">Price</th>
          </tr>
        </thead>
        <tbody>
          {teeTimes.map((t, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="p-2 border">{new Date(t.dateISO).toLocaleDateString()}</td>
              <td className="p-2 border">{t.time}</td>
              <td className="p-2 border">{t.course}</td>
              <td className="p-2 border">
                {t.minPlayers}–{t.maxPlayers}
              </td>
              <td className="p-2 border">${t.price?.toFixed(2) ?? "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
