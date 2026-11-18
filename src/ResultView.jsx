import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookmarkButton, Explanation } from './components.jsx';
import { useBookmarks } from './hooks.js';
import { APP_NAME } from './config.js';

export default function ResultView({ result, onRetry }) {
  const { ids, toggle } = useBookmarks();
  const [filter, setFilter] = useState('all');
  const [copied, setCopied] = useState(false);

  const shown = result.results.filter((r) => filter === 'all' || !r.correct);
  const shareText =
    `I scored ${result.score}/${result.totalQuestions} (${result.percentage}%) on ${result.topic} questions ` +
    `in ${APP_NAME}. Current streak: ${result.currentStreak} day(s).` +
    (import.meta.env.DEV ? '' : ` Try it: ${window.location.origin}`);

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title: APP_NAME, text: shareText });
      } else {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* user cancelled */
    }
  }

  return (
    <div>
      <section className="card">
        <div className="row">
          <div className="ring" style={{ '--pct': result.percentage }}>
            <div>{result.percentage}%</div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h1>
              {result.score} / {result.totalQuestions} correct
            </h1>
            <p className="muted">
              Topic: {result.topic}. Streak: {result.currentStreak} day(s), best {result.longestStreak}.
            </p>
            <div className="row">
              {onRetry && (
                <button type="button" className="btn" onClick={onRetry}>
                  New quiz
                </button>
              )}
              <button type="button" className="btn ghost" onClick={share}>
                {copied ? 'Copied!' : 'Share score'}
              </button>
              <Link to="/dashboard" className="btn ghost">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="row between" style={{ margin: '1rem 0 0.5rem' }}>
        <h2>Review</h2>
        <div className="tabs">
          <button type="button" className={filter === 'all' ? 'tab active' : 'tab'} onClick={() => setFilter('all')}>
            All
          </button>
          <button type="button" className={filter === 'wrong' ? 'tab active' : 'tab'} onClick={() => setFilter('wrong')}>
            Mistakes only
          </button>
        </div>
      </div>

      {shown.length === 0 && <p className="muted">Nothing to show here. Great job!</p>}

      {shown.map((r, idx) => (
        <article key={r.questionId} className="card">
          <div className="row between">
            <span className="muted small-text">Question {result.results.indexOf(r) + 1}</span>
            <BookmarkButton active={ids.has(r.questionId)} onClick={() => toggle(r.questionId)} />
          </div>
          <h3 className="question">{r.text}</h3>
          <ul className="options static">
            {r.options.map((opt, i) => {
              let cls = 'option';
              let tag = '';
              if (i === r.correctIndex) {
                cls = 'option correct';
                tag = 'Correct answer';
              }
              if (i === r.selectedIndex && !r.correct) {
                cls = 'option wrong';
                tag = 'Your answer';
              }
              if (i === r.selectedIndex && r.correct) {
                tag = 'Your answer (correct)';
              }
              return (
                <li key={i} className={cls}>
                  <span className="letter">{String.fromCharCode(65 + i)}</span>
                  {opt}
                  {tag && <span className="tag">{tag}</span>}
                </li>
              );
            })}
          </ul>
          {r.selectedIndex === null && <p className="muted small-text">You skipped this question.</p>}
          <Explanation explanation={r.explanation} explanationTa={r.explanationTa} />
        </article>
      ))}
    </div>
  );
}
