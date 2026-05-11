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

export default function PageShell({ children }: PropsWithChildren) {
  const shellMaxWidth = useAppSelector((s) => s.ui.shellMaxWidth);
  const maxWidth = widthMap[shellMaxWidth];

  return (
    <motion.main
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
      style={{ width: '100%' }}
    >
      <Container maxWidth={maxWidth} sx={{ py: '10px', px: { xs: 2.5, sm: 3 } }}>
        <Box>{children}</Box>
      </Container>
    </motion.main>
  );
}
