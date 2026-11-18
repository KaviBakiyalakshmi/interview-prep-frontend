import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { ErrorMessage, Spinner } from '../components.jsx';
import { formatDate } from '../hooks.js';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.stats(), api.history(0, 5)])
      .then(([s, h]) => {
        setStats(s);
        setRecent(h.content);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorMessage message={error} />;
  if (!stats) return <Spinner />;

  return (
    <div>
      <div className="row between">
        <h1>Hi, {user.name}</h1>
        <Link to="/quiz" className="btn">Start a quiz</Link>
      </div>

      <div className="grid cols-4" style={{ margin: '1rem 0' }}>
        <div className="card stat">
          <div className="value">{stats.currentStreak}</div>
          <div className="label">day streak (best {stats.longestStreak})</div>
        </div>
        <div className="card stat">
          <div className="value">{stats.accuracyPercent}%</div>
          <div className="label">accuracy</div>
        </div>
        <div className="card stat">
          <div className="value">{stats.totalAttempts}</div>
          <div className="label">quizzes taken</div>
        </div>
        <div className="card stat">
          <div className="value">{stats.totalCorrect}</div>
          <div className="label">correct answers</div>
        </div>
      </div>

      {stats.focusAreas.length > 0 && (
        <section className="card">
          <h2>Practice these next</h2>
          <p className="muted">Your accuracy is lowest in these topics.</p>
          {stats.focusAreas.map((t) => (
            <Link key={t} className="chip" to={`/quiz?topic=${encodeURIComponent(t)}`}>{t}</Link>
          ))}
        </section>
      )}

      <section className="card">
        <h2>Accuracy by topic</h2>
        {stats.topics.length === 0 ? (
          <p className="muted">Take your first quiz to see your progress here.</p>
        ) : (
          <div className="stack">
            {stats.topics.map((t) => (
              <div key={t.topic}>
                <div className="row between small-text">
                  <span>{t.topic}</span>
                  <span className="muted">{t.correct}/{t.answered} ({t.accuracyPercent}%)</span>
                </div>
                <div className="bar"><div style={{ width: `${t.accuracyPercent}%` }} /></div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <div className="row between">
          <h2>Recent quizzes</h2>
          <Link to="/history" className="small-text">See all</Link>
        </div>
        {recent.length === 0 ? (
          <p className="muted">No quizzes yet.</p>
        ) : (
          <table>
            <tbody>
              {recent.map((a) => (
                <tr key={a.id}>
                  <td>{a.completed ? <Link to={`/results/${a.id}`}>{a.topic}</Link> : <span className="muted">{a.topic} (unfinished)</span>}</td>
                  <td>{a.completed ? `${a.score}/${a.totalQuestions}` : '-'}</td>
                  <td className="muted small-text">{formatDate(a.startedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
