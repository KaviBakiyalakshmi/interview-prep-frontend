import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { ErrorMessage, Spinner } from '../components.jsx';

export default function LeaderboardPage() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.leaderboard(20).then(setRows).catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorMessage message={error} />;
  if (!rows) return <Spinner />;

  return (
    <div>
      <h1>Leaderboard</h1>
      <p className="muted">Ranked by total correct answers across all quizzes.</p>
      {rows.length === 0 ? (
        <p className="muted">No scores yet. Be the first!</p>
      ) : (
        <section className="card">
          <table>
            <thead>
              <tr><th>#</th><th>Name</th><th>Correct answers</th><th>Quizzes</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.rank}>
                  <td>{r.rank}</td>
                  <td>{r.name}</td>
                  <td>{r.totalScore}</td>
                  <td>{r.attempts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
