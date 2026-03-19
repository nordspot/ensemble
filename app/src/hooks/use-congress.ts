'use client';

import { useParams } from 'next/navigation';

export function useCongress() {
  const params = useParams<{ congressId?: string }>();
  const congressId = params?.congressId ?? null;

  // TODO: fetch congress data from API
  return {
    congressId,
    isLoading: false,
  };
}
