import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Alert, Button, Divider, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useLogin, useRegister } from '../api/hooks';
import type { RoleType } from '../api/types';
import PageShell from '../components/PageShell';
import { useAppDispatch } from '../features/auth/hooks';
import { setTokens } from '../features/auth/authSlice';

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
      const loginResult = await loginMutation.mutateAsync({
        username: form.username,
        password: form.password,
      });
      dispatch(setTokens(loginResult));
      navigate('/', { replace: true });
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
        <LockOutlinedIcon color="primary" sx={{ mb: 1.5 }} fontSize="large" />
        <Typography variant="overline" color="primary.main" sx={{ letterSpacing: 3, fontWeight: 740 }}>
          BlogXy Passport
        </Typography>
        <Typography variant="h4" gutterBottom sx={{ mb: { xs: 2, md: 3 }, fontWeight: 900 }}>
          {isRegister ? 'Join the authoring collective' : 'Welcome back storyteller'}
        </Typography>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Paper sx={{ px: { xs: 3, md: 4 }, py: { xs: 4, md: 4.5 }, width: '100%', borderRadius: 4 }}>
            <form noValidate autoComplete="on" onSubmit={onSubmit}>
              <Stack spacing={2}>
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
                    <TextField variant="filled" label="Org role" select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as RoleType })}>
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
                  <Alert severity="error" sx={{ mt: -0.75 }}>
                    {errorMessage}
                  </Alert>
                ) : null}
                <Button variant="contained" size="large" type="submit" sx={{ py: 1.5 }}>
                  {isRegister ? 'Create account & sign in' : 'Continue securely'}
                </Button>
              </Stack>
            </form>
            <Divider sx={{ my: 3 }} />
            <Button variant="text" fullWidth sx={{ typography: 'body2', fontWeight: 600 }} onClick={() => setIsRegister(!isRegister)}>
              {isRegister ? 'Already wielding credentials? Jump to login' : 'Fresh join? Elevate into register mode'}
            </Button>
          </Paper>
        </motion.div>
      </Stack>
    </PageShell>
  );
}
