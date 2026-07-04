import { useCallback, useState } from 'react';

export function useAdminFilterPending() {
    const [isPending, setIsPending] = useState(false);

    const onStart = useCallback(() => setIsPending(true), []);
    const onFinish = useCallback(() => setIsPending(false), []);

    return { isPending, onStart, onFinish };
}
