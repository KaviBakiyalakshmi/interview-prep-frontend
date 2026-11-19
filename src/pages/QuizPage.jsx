import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { ErrorMessage, QuestionBadges, QuestionText } from '../components.jsx';
import ResultView from '../ResultView.jsx';

export default function QuizPage() {
  const [params] = useSearchParams();
  const { refreshUser } = useAuth();

  const [topics, setTopics] = useState([]);
  const [filters, setFilters] = useState({
    topic: params.get('topic') || '',
    difficulty: '',
    level: '',
    type: params.get('type') || '',
    count: 10,
  });
  const [phase, setPhase] = useState('setup'); // setup | play | result
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.topics().then(setTopics).catch(() => {});
  }, []);

  const setF = (key, value) => setFilters((f) => ({ ...f, [key]: value }));

  async function start(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await api.startQuiz({
        topic: filters.topic || null,
        difficulty: filters.difficulty || null,
        level: filters.level || null,
        type: filters.type || null,
        count: Number(filters.count) || 10,
      });
      setQuiz(res);
      setAnswers({});
      setIndex(0);
      setPhase('play');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    const unanswered = quiz.questions.length - Object.keys(answers).length;
    if (unanswered > 0 && !window.confirm(`${unanswered} question(s) are unanswered. Submit anyway?`)) {
      return;
    }
    setBusy(true);
    setError('');
    try {
      const payload = quiz.questions.map((q) => ({
        questionId: q.id,
        selectedIndex: answers[q.id] ?? null,
      }));
      const res = await api.submitQuiz(quiz.attemptId, payload);
      setResult(res);
      setPhase('result');
      refreshUser();
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setPhase('setup');
    setQuiz(null);
    setResult(null);
    setAnswers({});
    setError('');
  }

  // ---------------------------------------------------------------- result
  if (phase === 'result' && result) {
    return <ResultView result={result} onRetry={reset} />;
  }

  // ---------------------------------------------------------------- play
  if (phase === 'play' && quiz) {
    const total = quiz.questions.length;
    const q = quiz.questions[index];
    const last = index === total - 1;
    const answered = Object.keys(answers).length;

    return (
      <div>
        <div className="row between small-text muted">
          <span>
            Question {index + 1} of {total}
          </span>
          <span>{answered} answered</span>
        </div>
        <div className="progress">
          <div style={{ width: `${((index + 1) / total) * 100}%` }} />
        </div>

        <section className="card">
          <QuestionBadges q={q} />
          <QuestionText text={q.text} />
          <div className="options">
            {q.options.map((opt, i) => (
              <button
                key={i}
                type="button"
                className={answers[q.id] === i ? 'option selected' : 'option'}
                onClick={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
              >
                <span className="letter">{String.fromCharCode(65 + i)}</span>
                {opt}
              </button>
            ))}
          </div>
          <ErrorMessage message={error} />
          <div className="row between">
            <button type="button" className="btn ghost" disabled={index === 0} onClick={() => setIndex(index - 1)}>
              Previous
            </button>
            {last ? (
              <button type="button" className="btn" disabled={busy} onClick={submit}>
                {busy ? 'Submitting...' : 'Submit quiz'}
              </button>
            ) : (
              <button type="button" className="btn" onClick={() => setIndex(index + 1)}>
                {answers[q.id] === undefined ? 'Skip' : 'Next'}
              </button>
            )}
          </div>
        </section>

        <div className="row small-text muted" style={{ flexWrap: 'wrap' }}>
          {quiz.questions.map((item, i) => (
            <button
              key={item.id}
              type="button"
              className={i === index ? 'tab active' : answers[item.id] !== undefined ? 'tab saved-dot' : 'tab'}
              onClick={() => setIndex(i)}
              aria-label={`Go to question ${i + 1}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------- setup
  return (
    <div>
      <h1>Start a quiz</h1>
      <p className="muted">All filters are optional. Leave everything empty for a mix of all topics.</p>
      <form className="card" onSubmit={start}>
        <div className="grid cols-2">
          <div className="field">
            <label htmlFor="topic">Topic</label>
            <select id="topic" value={filters.topic} onChange={(e) => setF('topic', e.target.value)}>
              <option value="">All topics</option>
              {topics.map((t) => (
                <option key={t.topic} value={t.topic}>
                  {t.topic} ({t.total})
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="type">Question type</label>
            <select id="type" value={filters.type} onChange={(e) => setF('type', e.target.value)}>
              <option value="">Any</option>
              <option value="CONCEPT">Concept</option>
              <option value="SCENARIO">Scenario (real-world)</option>
              <option value="CODING">Coding (what happens?)</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="difficulty">Difficulty</label>
            <select id="difficulty" value={filters.difficulty} onChange={(e) => setF('difficulty', e.target.value)}>
              <option value="">Any</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="level">Experience level</label>
            <select id="level" value={filters.level} onChange={(e) => setF('level', e.target.value)}>
              <option value="">Any</option>
              <option value="JUNIOR">0-2 years</option>
              <option value="MID">2-5 years</option>
              <option value="SENIOR">5+ years</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="count">Number of questions</label>
            <select id="count" value={filters.count} onChange={(e) => setF('count', e.target.value)}>
              {[5, 10, 15, 20].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>
        <ErrorMessage message={error} />
        <button className="btn" disabled={busy}>
          {busy ? 'Starting...' : 'Start quiz'}
        </button>
      </form>
    </div>
  );
}
