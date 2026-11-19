import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './auth.jsx';

export const levelLabel = (level) => ({ JUNIOR: '0-2 yrs', MID: '2-5 yrs', SENIOR: '5+ yrs' }[level] || level);

export function QuestionText({ text }) {
  const parts = [];
  const re = /```[a-zA-Z]*\n([\s\S]*?)```/g;
  let last = 0;
  let match;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) parts.push({ code: false, value: text.slice(last, match.index) });
    parts.push({ code: true, value: match[1].replace(/\n$/, '') });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ code: false, value: text.slice(last) });
  return (
    <div className="question">
      {parts.map((part, i) =>
        part.code ? (
          <pre key={i} className="code">
            <code>{part.value}</code>
          </pre>
        ) : part.value.trim() ? (
          <p key={i}>{part.value.trim()}</p>
        ) : null
      )}
    </div>
  );
}

export function Spinner({ text = 'Loading...' }) {
  return <div className="center muted">{text}</div>;
}

export function ErrorMessage({ message }) {
  if (!message) return null;
  return (
    <div className="alert error" role="alert">
      {message}
    </div>
  );
}

export function ProtectedRoute({ children, admin = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  if (admin && user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return children;
}

export function Badge({ children, tone = 'neutral' }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

export function QuestionBadges({ q }) {
  return (
    <div className="badges">
      <Badge>{q.topic}</Badge>
      <Badge tone={q.type === 'SCENARIO' ? 'accent' : 'neutral'}>{q.type.toLowerCase()}</Badge>
      <Badge>{q.difficulty.toLowerCase()}</Badge>
      <Badge>{levelLabel(q.level)}</Badge>
    </div>
  );
}

/** English / Tanglish explanation with a tab switch. */
export function Explanation({ explanation, explanationTa }) {
  const [lang, setLang] = useState('en');
  if (!explanation && !explanationTa) return null;
  const text = lang === 'ta' && explanationTa ? explanationTa : explanation || explanationTa;
  return (
    <div className="explanation">
      <div className="tabs">
        <button type="button" className={lang === 'en' ? 'tab active' : 'tab'} onClick={() => setLang('en')}>
          English
        </button>
        {explanationTa && (
          <button type="button" className={lang === 'ta' ? 'tab active' : 'tab'} onClick={() => setLang('ta')}>
            Tanglish
          </button>
        )}
      </div>
      <p>{text}</p>
    </div>
  );
}

export function BookmarkButton({ active, onClick }) {
  return (
    <button type="button" className={active ? 'btn small ghost saved' : 'btn small ghost'} onClick={onClick}>
      {active ? 'Saved' : 'Save'}
    </button>
  );
}

/** Study card: question, options, and a "show answer" reveal. */
export function StudyCard({ q, bookmarked, onToggle }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <article className="card">
      <div className="row between">
        <QuestionBadges q={q} />
        {onToggle && <BookmarkButton active={bookmarked} onClick={() => onToggle(q.id)} />}
      </div>
      <QuestionText text={q.text} />
      <ul className="options static">
        {q.options.map((opt, i) => (
          <li key={i} className={revealed && i === q.correctIndex ? 'option correct' : 'option'}>
            <span className="letter">{String.fromCharCode(65 + i)}</span>
            {opt}
          </li>
        ))}
      </ul>
      {revealed ? (
        <Explanation explanation={q.explanation} explanationTa={q.explanationTa} />
      ) : (
        <button type="button" className="btn small" onClick={() => setRevealed(true)}>
          Show answer
        </button>
      )}
    </article>
  );
}
