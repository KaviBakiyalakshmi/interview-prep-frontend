import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { ErrorMessage, Spinner } from '../components.jsx';
import { formatDate } from '../hooks.js';

export default function HistoryPage() {
  const [page, setPage] = useState(0);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setData(null);
    api.history(page, 15).then(setData).catch((e) => setError(e.message));
  }, [page]);

  if (error) return <ErrorMessage message={error} />;
  if (!data) return <Spinner />;

  return (
    <div>
      <h1>Quiz history</h1>
      {data.content.length === 0 ? (
        <p className="muted">No quizzes yet. <Link to="/quiz">Take your first quiz</Link>.</p>
      ) : (
        <section className="card">
          <table>
            <thead>
              <tr><th>Topic</th><th>Score</th><th>When</th></tr>
            </thead>
            <tbody>
              {data.content.map((a) => (
                <tr key={a.id}>
                  <td>{a.completed ? <Link to={`/results/${a.id}`}>{a.topic}</Link> : <span className="muted">{a.topic} (unfinished)</span>}</td>
                  <td>{a.completed ? `${a.score}/${a.totalQuestions} (${a.percentage}%)` : '-'}</td>
                  <td className="muted small-text">{formatDate(a.startedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
      {data.totalPages > 1 && (
        <div className="row between">
          <button type="button" className="btn ghost" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button>
          <span className="muted small-text">Page {data.page + 1} of {data.totalPages}</span>
          <button type="button" className="btn ghost" disabled={page + 1 >= data.totalPages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
