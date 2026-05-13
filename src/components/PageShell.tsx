import { Box, Container, type ContainerProps } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import type { PropsWithChildren } from 'react';
import { motion } from 'framer-motion';

import { useAppSelector } from '../features/auth/hooks';
import type { UIShellMaxWidth } from '../features/ui/uiSlice';

const widthMap: Record<UIShellMaxWidth, ContainerProps['maxWidth'] | false> = {
  full: false,
  xl: 'xl',
  lg: 'lg',
  md: 'md',
};

type PageShellProps = PropsWithChildren<{
  /** Merged after default `Container` padding (e.g. tighter `pt` on dense pages). */
  containerSx?: SxProps<Theme>;
}>;

export default function PageShell({ children, containerSx }: PageShellProps) {
  const shellMaxWidth = useAppSelector((s) => s.ui.shellMaxWidth);
  const maxWidth = widthMap[shellMaxWidth];

  return (
    <motion.main
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] as const }}
      style={{ width: '100%' }}
    >
      <Container maxWidth={maxWidth} sx={{ px: { xs: 2.5, sm: 3 } }}>
        <Box
          sx={
            [
              {
                maxWidth: '100%',
                /* Use explicit pt/pb (not `py`) so overrides like `pt: 0` merge reliably. */
                pt: { xs: 2.5, sm: 3 },
                pb: { xs: 2.5, sm: 3 },
              },
              ...(containerSx != null ? [containerSx] : []),
            ] as SxProps<Theme>
          }
        >
          {children}
        </Box>
      </Container>
    </motion.main>
  );
}
