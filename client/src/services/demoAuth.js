/* === [DEMO LOGIN FEATURE: client/src/services/demoAuth.js] ===
 * To remove demo login completely: delete this file.
 */
import { login } from '../store/slices/authSlice';

/**
 * Service to execute 1-Click Demo Login for visitors
 * @param {string} role - 'student' | 'tutor' | 'teacher' | 'admin'
 * @param {Function} dispatch - Redux dispatch
 * @param {Function} navigate - React Router navigate
 * @returns {Promise<Object>} Response data
 */
export const loginAsDemo = async ({ role, dispatch, navigate }) => {
  const normalizedRole = role === 'teacher' ? 'tutor' : role;

  const res = await fetch('/api/auth/demo-login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ role: normalizedRole })
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Unable to start demo visit session.');
  }

  if (data.token) {
    localStorage.setItem('vidyanest_token', data.token);
  }

  if (data.user) {
    dispatch(login({
      user: data.user,
      role: data.user.role
    }));
  }

  if (navigate) {
    if (normalizedRole === 'admin') {
      navigate('/admin/portal', { replace: true });
    } else if (normalizedRole === 'tutor') {
      navigate('/tutor/dashboard', { replace: true });
    } else {
      navigate('/student/dashboard', { replace: true });
    }
  }

  return data;
};
