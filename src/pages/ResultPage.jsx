import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { ErrorMessage, Spinner } from '../components.jsx';
import ResultView from '../ResultView.jsx';

export default function ResultPage() {
  const { attemptId } = useParams();
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.result(attemptId).then(setResult).catch((e) => setError(e.message));
  }, [attemptId]);

  if (error) {
    return (
      <div>
        <ErrorMessage message={error} />
        <Link to="/history">Back to history</Link>
      </div>
    );
  }
  if (!result) return <Spinner />;
  return <ResultView result={result} />;
}
