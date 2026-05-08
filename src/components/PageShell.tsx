import { Box, Container, type ContainerProps } from '@mui/material';
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

const pyMap = { comfortable: { xs: 4, md: 6 }, standard: { xs: 3, md: 5 }, compact: { xs: 2.5, md: 4 } };

export default function PageShell({ children }: PropsWithChildren) {
  const density = useAppSelector((s) => s.ui.layoutDensity);
  const shellMaxWidth = useAppSelector((s) => s.ui.shellMaxWidth);
  const maxWidth = widthMap[shellMaxWidth];

  const py = density === 'comfortable' ? pyMap.comfortable : density === 'compact' ? pyMap.compact : pyMap.standard;

  return (
    <motion.main
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
      style={{ width: '100%' }}
    >
      <Container maxWidth={maxWidth} sx={{ py, px: { xs: 2.5, sm: 3 } }}>
        <Box sx={{ pb: density === 'compact' ? { xs: 4, md: 5 } : { xs: 6, md: 9 } }}>{children}</Box>
      </Container>
    </motion.main>
  );
}
