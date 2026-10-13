import { useEffect } from 'react';

export function useTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · Sudos` : 'Sudos · Modern Menswear';
  }, [title]);
}
