import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { ErrorMessage } from '../components.jsx';

const emptyForm = {
  topic: '',
  type: 'SCENARIO',
  difficulty: 'MEDIUM',
  level: 'MID',
  text: '',
  options: ['', '', '', ''],
  correctIndex: 0,
  explanation: '',
  explanationTa: '',
};

const SAMPLE_BULK = `[
  {
    "topic": "Java",
    "type": "CONCEPT",
    "difficulty": "EASY",
    "level": "JUNIOR",
    "text": "Which keyword prevents a class from being extended?",
    "options": ["static", "final", "abstract", "private"],
    "correctIndex": 1,
    "explanation": "A final class cannot be subclassed.",
    "explanationTa": "final class-a extend panna mudiyaadhu."
  }
]`;

export default function AdminPage() {
  const [form, setForm] = useState(emptyForm);
  const [topics, setTopics] = useState([]);
  const [bulk, setBulk] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const loadTopics = () => api.topics().then(setTopics).catch(() => {});
  useEffect(() => {
    loadTopics();
  }, []);

  const setF = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const setOption = (i, value) =>
    setForm((f) => ({ ...f, options: f.options.map((o, idx) => (idx === i ? value : o)) }));

  async function addQuestion(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const created = await api.createQuestion({
        ...form,
        correctIndex: Number(form.correctIndex),
        explanation: form.explanation || null,
        explanationTa: form.explanationTa || null,
      });
      setMessage(`Question #${created.id} added.`);
      setForm({ ...emptyForm, topic: form.topic, type: form.type, difficulty: form.difficulty, level: form.level });
      loadTopics();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function onFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    file.text().then(setBulk).catch(() => setError('Could not read that file.'));
    e.target.value = '';
  }

  async function addBulk(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const parsed = JSON.parse(bulk);
      if (!Array.isArray(parsed)) throw new Error('Bulk upload must be a JSON array of questions.');
      const res = await api.bulkQuestions(parsed);
      setMessage(`${res.created} question(s) added.`);
      setBulk('');
      loadTopics();
    } catch (err) {
      setError(err instanceof SyntaxError ? 'That is not valid JSON.' : err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1>Admin: add questions</h1>
      <p className="muted">The more good scenario questions you add, the more useful the app becomes.</p>

      {message && <div className="alert success">{message}</div>}
      <ErrorMessage message={error} />

      <form className="card" onSubmit={addQuestion}>
        <h2>Add one question</h2>
        <div className="grid cols-2">
          <div className="field">
            <label htmlFor="a-topic">Topic</label>
            <input id="a-topic" list="topic-list" value={form.topic} onChange={(e) => setF('topic', e.target.value)} required />
            <datalist id="topic-list">
              {topics.map((t) => (
                <option key={t.topic} value={t.topic} />
              ))}
            </datalist>
          </div>
          <div className="field">
            <label htmlFor="a-type">Type</label>
            <select id="a-type" value={form.type} onChange={(e) => setF('type', e.target.value)}>
              <option value="CONCEPT">Concept</option>
              <option value="SCENARIO">Scenario</option>
              <option value="CODING">Coding</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="a-diff">Difficulty</label>
            <select id="a-diff" value={form.difficulty} onChange={(e) => setF('difficulty', e.target.value)}>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="a-level">Level</label>
            <select id="a-level" value={form.level} onChange={(e) => setF('level', e.target.value)}>
              <option value="JUNIOR">0-2 years</option>
              <option value="MID">2-5 years</option>
              <option value="SENIOR">5+ years</option>
            </select>
          </div>
        </div>

        <div className="field">
          <label htmlFor="a-text">Question</label>
          <textarea id="a-text" value={form.text} onChange={(e) => setF('text', e.target.value)} required />
        </div>

        <label>Options (select the correct one)</label>
        {form.options.map((opt, i) => (
          <div key={i} className="row" style={{ marginBottom: '0.5rem', flexWrap: 'nowrap' }}>
            <input
              type="radio"
              name="correct"
              style={{ width: 'auto' }}
              checked={Number(form.correctIndex) === i}
              onChange={() => setF('correctIndex', i)}
              aria-label={`Option ${i + 1} is correct`}
            />
            <input value={opt} onChange={(e) => setOption(i, e.target.value)} placeholder={`Option ${String.fromCharCode(65 + i)}`} required />
          </div>
        ))}

        <div className="field">
          <label htmlFor="a-exp">Explanation (English)</label>
          <textarea id="a-exp" value={form.explanation} onChange={(e) => setF('explanation', e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="a-exp-ta">Explanation (Tanglish)</label>
          <textarea id="a-exp-ta" value={form.explanationTa} onChange={(e) => setF('explanationTa', e.target.value)} />
        </div>
        <button className="btn" disabled={busy}>{busy ? 'Saving...' : 'Add question'}</button>
      </form>

      <form className="card" onSubmit={addBulk}>
        <h2>Bulk upload (JSON array)</h2>
        <p className="muted small-text">
          Choose a .json file or paste a JSON array below. Upload each file only once to avoid duplicate questions.
        </p>
        <div className="field">
          <input type="file" accept=".json,application/json" onChange={onFile} />
        </div>
        <div className="field">
          <textarea style={{ minHeight: 160, fontFamily: 'monospace' }} value={bulk} onChange={(e) => setBulk(e.target.value)} placeholder={SAMPLE_BULK} required />
        </div>
        <button className="btn" disabled={busy}>{busy ? 'Uploading...' : 'Upload questions'}</button>
      </form>
    </div>
  );
}
