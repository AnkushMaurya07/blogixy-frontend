import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import CreatePostModal from '../components/CreatePostModal';

type CreatePostModalContextValue = {
  openCreatePostModal: () => void;
  closeCreatePostModal: () => void;
};

const CreatePostModalContext = createContext<CreatePostModalContextValue | null>(null);

export function CreatePostModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openCreatePostModal = useCallback(() => setOpen(true), []);
  const closeCreatePostModal = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ openCreatePostModal, closeCreatePostModal }),
    [openCreatePostModal, closeCreatePostModal],
  );

  return (
    <CreatePostModalContext.Provider value={value}>
      {children}
      <CreatePostModal open={open} onClose={closeCreatePostModal} />
    </CreatePostModalContext.Provider>
  );
}

export function useCreatePostModal() {
  const ctx = useContext(CreatePostModalContext);
  if (!ctx) {
    throw new Error('useCreatePostModal must be used within CreatePostModalProvider');
  }
  return ctx;
}
