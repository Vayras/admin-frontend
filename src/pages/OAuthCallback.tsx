import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api';

export default function OAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const url = new URL(window.location.href);
        const token = url.searchParams.get('session_id') || url.searchParams.get('token');
        if (!token) return navigate('/login', { replace: true });

        localStorage.setItem('user_session_token', token);
        apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;

        ['session_id', 'token'].forEach(k => url.searchParams.delete(k));
        window.history.replaceState({}, document.title, url.pathname + url.search);

        const { data } = await apiClient.get('/users/me');
        const role = String(data?.role || '').toUpperCase();
        const destination =
          role === 'ADMIN' || role === 'TEACHING_ASSISTANT'
            ? '/select'
            : role === 'STUDENT'
              ? '/me'
              : '/me';

        navigate(destination, { replace: true });
      } catch {
        navigate('/404', { replace: true });
      }
    })();
  }, [navigate]);

  return (
    <div className="min-h-screen grid place-items-center bg-zinc-900">
      <div className="h-10 w-10 rounded-full border-2 border-indigo-500 border-b-transparent animate-spin" />
    </div>
  );
}
