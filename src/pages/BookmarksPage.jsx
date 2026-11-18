import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { ErrorMessage, Spinner, StudyCard } from '../components.jsx';

export default function BookmarksPage() {
  const [list, setList] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.bookmarks().then(setList).catch((e) => setError(e.message));
  }, []);

  async function remove(id) {
    try {
      await api.removeBookmark(id);
      setList((prev) => prev.filter((q) => q.id !== id));
    } catch (e) {
      setError(e.message);
    }
  }

  if (error) return <ErrorMessage message={error} />;
  if (!list) return <Spinner />;

  return (
    <div>
      <h1>Saved questions</h1>
      {list.length === 0 ? (
        <p className="muted">
          Nothing saved yet. Use the Save button while studying or reviewing a quiz, or go to <Link to="/study">Study mode</Link>.
        </p>
      ) : (
        list.map((q) => <StudyCard key={q.id} q={q} bookmarked onToggle={remove} />)
      )}
    </div>
  );
}
