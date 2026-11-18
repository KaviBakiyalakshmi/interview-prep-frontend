import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { TAGLINE } from '../config.js';
import { Badge, ErrorMessage, Explanation, QuestionBadges } from '../components.jsx';

function DailyQuestion() {
  const [q, setQ] = useState(null);
  const [picked, setPicked] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.daily().then(setQ).catch(() => {});
  }, []);

  if (!q) return null;

  async function choose(i) {
    if (result) return;
    setPicked(i);
    setError('');
    try {
      setResult(await api.check(q.id, i));
    } catch (e) {
      setError(e.message);
      setPicked(null);
    }
  }

  const cls = (i) => {
    if (!result) return 'option';
    if (i === result.correctIndex) return 'option correct';
    if (i === picked) return 'option wrong';
    return 'option';
  };

  return (
    <section className="card">
      <div className="row between">
        <h2>Question of the day</h2>
        <Badge tone="accent">same for everyone</Badge>
      </div>
      <QuestionBadges q={q} />
      <h3 className="question">{q.text}</h3>
      <div className="options">
        {q.options.map((opt, i) => (
          <button key={i} type="button" className={cls(i)} onClick={() => choose(i)} disabled={!!result}>
            <span className="letter">{String.fromCharCode(65 + i)}</span>
            {opt}
          </button>
        ))}
      </div>
      <ErrorMessage message={error} />
      {result && (
        <>
          <p>
            <strong>{result.correct ? 'Correct!' : 'Not quite.'}</strong>
          </p>
          <Explanation explanation={result.explanation} explanationTa={result.explanationTa} />
        </>
      )}
    </section>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [topics, setTopics] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.topics().then(setTopics).catch((e) => setError(e.message));
  }, []);

  return (
    <div>
      <section className="hero">
        <h1>Crack your next Java and Spring Boot interview</h1>
        <p>{TAGLINE}. Practice real production scenarios, not just definitions, with explanations in English and Tanglish.</p>
        <div className="row">
          {user ? (
            <Link to="/quiz" className="btn">Start a quiz</Link>
          ) : (
            <>
              <Link to="/register" className="btn">Start free</Link>
              <Link to="/login" className="btn ghost">I already have an account</Link>
            </>
          )}
        </div>
      </section>

      <ErrorMessage message={error} />
      <DailyQuestion />

      {topics.length > 0 && (
        <section className="card">
          <h2>Topics</h2>
          <div className="grid cols-2">
            {topics.map((t) => (
              <Link key={t.topic} to={`/quiz?topic=${encodeURIComponent(t.topic)}`} className="row between">
                <span>{t.topic}</span>
                <span className="muted small-text">{t.total} questions</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
