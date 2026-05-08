import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import ViewQuiltRoundedIcon from '@mui/icons-material/ViewQuiltRounded';
import {
  Box,
  Button,
  Chip,
  Paper,
  Slider,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { type ReactNode, useEffect, useState } from 'react';

import PageShell from '../components/PageShell';

import {
  resetUiPreferences,
  setLayoutDensity,
  setPrimaryMain,
  setShellMaxWidth,
  setThemeMode,
  type UILayoutDensity,
  type UIShellMaxWidth,
} from '../features/ui/uiSlice';

import { useAppDispatch, useAppSelector } from '../features/auth/hooks';
import { Link as RouterLink } from 'react-router-dom';

const PRESETS = ['#2563eb', '#7c3aed', '#0891b2', '#059669', '#eab308', '#ea580c', '#be123c', '#9333ea'];

export default function SettingsPage() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.accessToken);
  const ui = useAppSelector((state) => state.ui);
  const [hexDraft, setHexDraft] = useState(ui.primaryMain);

  const applyDraft = () => dispatch(setPrimaryMain(hexDraft));

  const widthMarks = [
    ['md', 'Narrow rails'],
    ['lg', 'Comfort'],
    ['xl', 'Spacious rails'],
    ['full', 'Full bleed hero'],
  ] as const satisfies Readonly<Array<[UIShellMaxWidth, string]>>;

  const widthIndex = Math.max(0, widthMarks.findIndex(([w]) => w === ui.shellMaxWidth));

  useEffect(() => {
    setHexDraft(ui.primaryMain);
  }, [ui.primaryMain]);

  return (
    <PageShell>
      <Stack spacing={4}>
        <Stack spacing={1}>
          <Typography variant="overline" color="primary.main" sx={{ letterSpacing: 3, fontWeight: 780 }}>
            Control center
          </Typography>
          <Typography variant="h4">Settings & layout personality</Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Theme colors, density, and content shell widths sync instantly—preferences persist locally for each browser.
          </Typography>
        </Stack>

        {token ? (
          <Paper sx={{ borderRadius: 4, overflow: 'hidden' }}>
            <Stack direction="row" spacing={2} sx={{ bgcolor: alpha(theme.palette.success.main ?? '#16a34a', 0.1), px: 4, py: 3 }}>
              <PersonOutlineRoundedIcon color="success" />
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6">Account & privacy</Typography>
                <Typography variant="caption" color="text.secondary">
                  Manage your profile; server-side privacy controls (DM scope, visibility) ship in a dedicated release.
                </Typography>
              </Box>
              <Button component={RouterLink} to="/profile" variant="contained" color="success" size="medium">
                Open profile
              </Button>
            </Stack>
            <Stack spacing={1.5} sx={{ p: { xs: 3, md: 4 } }}>
              <Typography variant="body2" color="text.secondary">
                Use your profile to review public fields (title, bio). Follow requests and messaging respect current auth; granular
                privacy toggles will appear here when the backend exposes them.
              </Typography>
            </Stack>
          </Paper>
        ) : null}

        <GridTwoColumn>
          <motion.div layout>
            <Paper sx={{ borderRadius: 4, overflow: 'hidden' }}>
              <Stack direction="row" spacing={2} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.12), px: 4, py: 3 }}>
                <PaletteOutlinedIcon color="primary" />
                <Box>
                  <Typography variant="h6">Color system</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Harmonized with BlogXy’s enterprise chrome.
                  </Typography>
                </Box>
              </Stack>
              <Stack spacing={3} sx={{ p: { xs: 3, md: 4 } }}>
                <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} sx={{ justifyContent: 'space-between' }}>
                  <Stack spacing={2} sx={{ flex: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Palette presets
                    </Typography>
                    <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
                      {PRESETS.map((color) => (
                        <Chip
                          clickable
                          key={color}
                          label={color}
                          sx={{
                            bgcolor: alpha(color, ui.primaryMain.toLowerCase() === color.toLowerCase() ? 0.46 : 0.15),
                            color:
                              ui.primaryMain.toLowerCase() === color.toLowerCase()
                                ? theme.palette.getContrastText(color)
                                : 'inherit',
                            fontWeight: 700,
                          }}
                          onClick={() => {
                            dispatch(setPrimaryMain(color));
                            setHexDraft(color);
                          }}
                        />
                      ))}
                    </Stack>
                  </Stack>
                  <Stack spacing={2} sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Custom hex code
                    </Typography>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                      <TextField
                        fullWidth
                        variant="filled"
                        label="#RRGGBB"
                        value={hexDraft}
                        onChange={(ev) => setHexDraft(ev.target.value)}
                      />
                      <Button variant="contained" onClick={() => applyDraft()} sx={{ minWidth: 160 }}>
                        Apply color
                      </Button>
                    </Stack>
                  </Stack>
                </Stack>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 720 }}>
                    Light / dark surface
                  </Typography>
                  <ToggleButtonGroup exclusive value={ui.themeMode} onChange={(_, value) => value && dispatch(setThemeMode(value))}>
                    <ToggleButton value="light" sx={{ px: 2.5 }}>
                      <LightModeRoundedIcon sx={{ mr: 1 }} /> Studio light
                    </ToggleButton>
                    <ToggleButton value="dark" sx={{ px: 2.5 }}>
                      <DarkModeRoundedIcon sx={{ mr: 1 }} /> Twilight deck
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Stack>
              </Stack>
            </Paper>
          </motion.div>

          <motion.div layout>
            <Paper sx={{ borderRadius: 4 }}>
              <Stack direction="row" spacing={2} sx={{ bgcolor: alpha(theme.palette.info.main ?? '#0ea5e9', 0.12), px: 4, py: 3 }}>
                <ViewQuiltRoundedIcon color="secondary" />
                <Box>
                  <Typography variant="h6">Layout density & shell width</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Matches every page shell—including navigation alignment.
                  </Typography>
                </Box>
              </Stack>
              <Stack spacing={3} sx={{ p: { xs: 3, md: 4 } }}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 720 }}>
                    Spacing calibration
                  </Typography>
                  <ToggleButtonGroup
                    exclusive
                    fullWidth
                    value={ui.layoutDensity}
                    onChange={(_, next) => next && dispatch(setLayoutDensity(next as UILayoutDensity))}
                  >
                    <ToggleButton value="compact">Compact</ToggleButton>
                    <ToggleButton value="standard">Standard</ToggleButton>
                    <ToggleButton value="comfortable">Comfortable</ToggleButton>
                  </ToggleButtonGroup>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                    Comfortable widens gutters for long-form authoring sessions.
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 720 }}>
                    Shell max-width
                  </Typography>
                  <Slider
                    aria-label="content width"
                    value={widthIndex < 0 ? 0 : widthIndex}
                    min={0}
                    max={3}
                    marks
                    step={1}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(v) => widthMarks[v]?.[1] ?? ''}
                    onChange={(_, v) =>
                      dispatch(setShellMaxWidth(widthMarks[typeof v === 'number' ? v : 0]![0]))
                    }
                  />
                  <Typography variant="caption" color="text.secondary">
                    {widthMarks[widthIndex]?.[1] ?? widthMarks[0]![1]} — Navbar width tracks the shell for pixel-perfect grids.
                  </Typography>
                </Box>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 1 }}>
                  <Chip icon={<AutoAwesomeRoundedIcon />} label="Keeps animations + motion deltas stable" variant="filled" sx={{ mr: 'auto' }} />
                  <Button variant="text" color="inherit" startIcon={<RestartAltRoundedIcon />} onClick={() => dispatch(resetUiPreferences())}>
                    Reset preferences
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </motion.div>
        </GridTwoColumn>
      </Stack>
    </PageShell>
  );
}

function GridTwoColumn({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: { xs: 3, xl: 3.5 },
        gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
      }}
    >
      {children}
    </Box>
  );
}
