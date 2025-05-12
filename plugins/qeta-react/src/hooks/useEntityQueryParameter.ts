import { useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

export function useEntityQueryParameter(entity?: string) {
  const [searchParams] = useSearchParams();
  const [entityRef, setEntityRef] = useState<string | undefined>(entity);

  useEffect(() => {
    setEntityRef(searchParams.get('entity') ?? undefined);
  }, [searchParams, setEntityRef]);

  return entityRef;
}
