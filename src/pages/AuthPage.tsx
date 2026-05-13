import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Alert, Button, Divider, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { AnimatePresence, motion } from 'framer-motion';
import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { apiClient } from '../api/client';
import { useLogin, useRegister } from '../api/hooks';
import type { RoleType, UserProfile } from '../api/types';
import PageShell from '../components/PageShell';
import { useAppDispatch } from '../features/auth/hooks';
import { setTokens } from '../features/auth/authSlice';

type JwtPair = { access: string; refresh: string };

function postAuthPath(role: UserProfile['role']) {
  return role === 'author' || role === 'business' ? '/dashboard' : '/';
}

export default function AuthPage() {
  const theme = useTheme();
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
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      if (isRegister) {
        await registerMutation.mutateAsync(form);
      }
      const loginResult = (await loginMutation.mutateAsync({
        username: form.username,
        password: form.password,
      })) as JwtPair;
      dispatch(setTokens({ access: loginResult.access, refresh: loginResult.refresh }));

      let nextPath = '/';
      try {
        const profile = (await apiClient.get<UserProfile>('/auth/profile/')).data;
        nextPath = postAuthPath(profile.role);
      } catch {
        nextPath = '/';
      }
      navigate(nextPath, { replace: true });
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
    <PageShell>
      <Stack sx={{ alignItems: 'center', maxWidth: 520, mx: 'auto', textAlign: { xs: 'left', md: 'center' } }}>
        <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
          <LockOutlinedIcon color="primary" sx={{ mb: 1.5 }} fontSize="large" />
        </motion.div>
        <Typography variant="overline" color="primary.main" sx={{ letterSpacing: '0.12em', fontWeight: 780 }}>
          Blogixy
        </Typography>
        <AnimatePresence mode="wait">
          <motion.div
            key={isRegister ? 'register' : 'login'}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: '100%' }}
          >
            <Typography variant="h4" component="h1" gutterBottom sx={{ mb: { xs: 2, md: 2.5 }, fontWeight: 850, letterSpacing: '-0.03em' }}>
              {isRegister ? 'Create your account' : 'Welcome back'}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: { xs: 2.5, md: 3 }, maxWidth: 440, mx: { md: 'auto' }, lineHeight: 1.65 }}>
              {isRegister
                ? 'Register with email and role, then you are signed in automatically. Authors land on the dashboard; readers on Home.'
                : 'Sign in to continue. Authors and business accounts open the analytics dashboard; readers open the home feed.'}
            </Typography>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={isRegister ? 'form-register' : 'form-login'}
            initial={{ opacity: 0, x: isRegister ? 16 : -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRegister ? -12 : 12 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: '100%' }}
          >
            <Paper
              sx={{
                px: { xs: 2.75, md: 3.5 },
                py: { xs: 3.25, md: 3.75 },
                width: '100%',
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'light' ? 0.12 : 0.1)}`,
              }}
            >
              <form noValidate autoComplete="on" onSubmit={onSubmit}>
                <Stack spacing={2.25}>
                  <TextField
                    variant="filled"
                    label="Username"
                    autoComplete="username"
                    required
                    value={form.username}
                    onChange={(event) => setForm({ ...form, username: event.target.value })}
                  />
                  {isRegister && (
                    <>
                      <TextField
                        variant="filled"
                        label="Email"
                        autoComplete="email"
                        required
                        type="email"
                        value={form.email}
                        onChange={(event) => setForm({ ...form, email: event.target.value })}
                      />
                      <TextField
                        variant="filled"
                        label="Org role"
                        select
                        value={form.role}
                        onChange={(event) => setForm({ ...form, role: event.target.value as RoleType })}
                      >
                        <MenuItem value="reader">Reader</MenuItem>
                        <MenuItem value="author">Author</MenuItem>
                        <MenuItem value="business">Business</MenuItem>
                      </TextField>
                    </>
                  )}
                  <TextField
                    variant="filled"
                    label="Password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={form.password}
                    onChange={(event) => setForm({ ...form, password: event.target.value })}
                  />
                  {errorMessage ? (
                    <Alert severity="error" sx={{ mt: -0.5 }}>
                      {errorMessage}
                    </Alert>
                  ) : null}
                  <Button variant="contained" size="large" type="submit" sx={{ py: 1.5, mt: 0.5 }}>
                    {isRegister ? 'Create account & sign in' : 'Sign in'}
                  </Button>
                </Stack>
              </form>
              <Divider sx={{ my: 3 }} />
              <Button
                variant="text"
                fullWidth
                sx={{ typography: 'body2', fontWeight: 650 }}
                onClick={() => {
                  setErrorMessage('');
                  setIsRegister(!isRegister);
                }}
              >
                {isRegister ? 'Already have an account? Sign in' : 'New here? Create an account'}
              </Button>
            </Paper>
          </motion.div>
        </AnimatePresence>
      </Stack>
    </PageShell>
  );
}
