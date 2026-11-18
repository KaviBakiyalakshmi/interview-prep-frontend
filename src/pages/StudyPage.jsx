import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { ErrorMessage, Spinner, StudyCard } from '../components.jsx';
import { useBookmarks } from '../hooks.js';

export default function StudyPage() {
  const { ids, toggle } = useBookmarks();
  const [topics, setTopics] = useState([]);
  const [filters, setFilters] = useState({ topic: '', difficulty: '', level: '', type: '', q: '' });
  const [applied, setApplied] = useState(filters);
  const [page, setPage] = useState(0);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.topics().then(setTopics).catch(() => {});
  }, []);

  useEffect(() => {
    setData(null);
    api.questions({ ...applied, page, size: 10 })
      .then(setData)
      .catch((e) => setError(e.message));
  }, [applied, page]);

  const setF = (key, value) => setFilters((f) => ({ ...f, [key]: value }));

  function apply(e) {
    e.preventDefault();
    setError('');
    setPage(0);
    setApplied(filters);
  }

  return (
    <div>
      <h1>Study mode</h1>
      <p className="muted">Browse questions, think of your answer first, then reveal the explanation.</p>

      <form className="card" onSubmit={apply}>
        <div className="grid cols-2">
          <div className="field">
            <label htmlFor="s-topic">Topic</label>
            <select id="s-topic" value={filters.topic} onChange={(e) => setF('topic', e.target.value)}>
              <option value="">All topics</option>
              {topics.map((t) => (
                <option key={t.topic} value={t.topic}>{t.topic}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="s-type">Type</label>
            <select id="s-type" value={filters.type} onChange={(e) => setF('type', e.target.value)}>
              <option value="">Any</option>
              <option value="CONCEPT">Concept</option>
              <option value="SCENARIO">Scenario</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="s-diff">Difficulty</label>
            <select id="s-diff" value={filters.difficulty} onChange={(e) => setF('difficulty', e.target.value)}>
              <option value="">Any</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="s-level">Level</label>
            <select id="s-level" value={filters.level} onChange={(e) => setF('level', e.target.value)}>
              <option value="">Any</option>
              <option value="JUNIOR">0-2 years</option>
              <option value="MID">2-5 years</option>
              <option value="SENIOR">5+ years</option>
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor="s-q">Search in question text</label>
          <input id="s-q" value={filters.q} onChange={(e) => setF('q', e.target.value)} placeholder="e.g. transaction" />
        </div>
        <button className="btn">Apply filters</button>
      </form>

      <ErrorMessage message={error} />
      {!data && !error && <Spinner />}
      {data && data.content.length === 0 && <p className="muted">No questions match these filters.</p>}
      {data && data.content.map((q) => (
        <StudyCard key={q.id} q={q} bookmarked={ids.has(q.id)} onToggle={toggle} />
      ))}

      {data && data.totalPages > 1 && (
        <div className="row between">
          <button type="button" className="btn ghost" disabled={page === 0} onClick={() => setPage(page - 1)}>
            Previous
          </button>
          <span className="muted small-text">
            Page {data.page + 1} of {data.totalPages} ({data.totalElements} questions)
          </span>
          <button type="button" className="btn ghost" disabled={page + 1 >= data.totalPages} onClick={() => setPage(page + 1)}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
