let visitorIdPromise: Promise<string> | null = null;

export async function getVisitorId(): Promise<string> {
    if (visitorIdPromise) return visitorIdPromise;

    visitorIdPromise = (async () => {
        if (typeof window === 'undefined') {
            return 'server-render';
        }
        const fpModule = await import('@fingerprintjs/fingerprintjs');
        const fp = await fpModule.load();
        const result = await fp.get();
        return result.visitorId;
    })();

    return visitorIdPromise;
}