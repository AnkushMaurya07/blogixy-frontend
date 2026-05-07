import { useState } from 'react';
import axios from 'axios';
import { useLogin, useRegister } from '../api/hooks';
import { useAppDispatch } from '../features/auth/hooks';
import { setTokens } from '../features/auth/authSlice';
import type { RoleType } from '../api/types';

export default function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState<{
    username: string;
    email: string;
    password: string;
    role: RoleType;
  }>({
    username: '',
    email: '',
    password: '',
    role: 'reader',
  });
  const [errorMessage, setErrorMessage] = useState('');

  const dispatch = useAppDispatch();
  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      if (isRegister) {
        await registerMutation.mutateAsync(form);
      }
      const loginResult = await loginMutation.mutateAsync({
        username: form.username,
        password: form.password,
      });
      dispatch(setTokens(loginResult));
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const data = error.response.data as Record<string, string[] | string>;
        const firstKey = Object.keys(data)[0];
        const firstValue = data[firstKey];
        const message = Array.isArray(firstValue) ? firstValue[0] : String(firstValue);
        setErrorMessage(message || 'Request failed. Please check your details.');
      } else {
        setErrorMessage('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <div className="container" style={{ maxWidth: 520 }}>
      <h2 className="mb-3">{isRegister ? 'Register' : 'Login'}</h2>
      <form className="card card-body" onSubmit={onSubmit}>
        <input
          className="form-control mb-2"
          placeholder="Username"
          required
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        {isRegister && (
          <>
            <input
              className="form-control mb-2"
              placeholder="Email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <select
              className="form-select mb-2"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as RoleType })}
            >
              <option value="reader">Reader</option>
              <option value="author">Author</option>
              <option value="business">Business</option>
            </select>
          </>
        )}
        <input
          type="password"
          className="form-control mb-3"
          placeholder="Password"
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        {errorMessage && <div className="alert alert-danger py-2">{errorMessage}</div>}
        <button type="submit" className="btn btn-primary">
          Continue
        </button>
      </form>
      <button className="btn btn-link mt-2 p-0" onClick={() => setIsRegister((v) => !v)}>
        {isRegister ? 'Have an account? Login' : 'Need account? Register'}
      </button>
    </div>
  );
}
