import { alpha, useTheme } from '@mui/material/styles';
import { MaterialDesignContent, type CustomContentProps } from 'notistack';
import { forwardRef, useMemo } from 'react';

/** Custom notistack surface: theme-aware frame + variant accent (React composition over default UI). */
const BlogixySnackbarContent = forwardRef<HTMLDivElement, CustomContentProps>(function BlogixySnackbarContent(
  props,
  ref,
) {
  const theme = useTheme();
  const accent = useMemo(() => {
    switch (props.variant) {
      case 'success':
        return theme.palette.success.main;
      case 'error':
        return theme.palette.error.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'info':
        return theme.palette.info.main;
      default:
        return theme.palette.primary.main;
    }
  }, [props.variant, theme]);

  return (
    <MaterialDesignContent
      ref={ref}
      {...props}
      style={{
        ...props.style,
        borderRadius: 14,
        border: `1px solid ${alpha(theme.palette.divider, 0.14)}`,
        boxShadow: theme.palette.mode === 'light' ? theme.shadows[6] : theme.shadows[12],
        borderLeft: `4px solid ${accent}`,
      }}
    />
  );
});

export default BlogixySnackbarContent;
