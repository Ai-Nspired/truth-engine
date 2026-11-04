console.log('[network.js] Loaded and executing (ESM)');

const RESOLVE_PATH = '/api/truth/resolve';

function getClient() {
    const client = window.TRUTH_ENGINE;
    if (!client || typeof client.apiFetch !== 'function') {
        throw new Error('config.js must be loaded before network.js');
    }
    return client;
}

function normalizeCitations(meta) {
    if (!meta || !Array.isArray(meta.citations)) return [];
    return meta.citations
        .filter(c => c && c.url)
        .map(c => ({ title: c.title || c.url, url: c.url }));
}

export async function queryTruth(input) {
    const client = getClient();
    const resp = await client.apiFetch(RESOLVE_PATH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input })
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok || !data.answer) {
        throw new Error(data.error || `Truth Engine returned ${resp.status}`);
    }

    return {
        answer: data.answer,
        layer: data.layer || null,
        id: data.id || null,
        provisional: Boolean(data.provisional),
        verified: Boolean(data.verified),
        citations: normalizeCitations(data.meta)
    };
}

export async function executeQuery(input, { onChunk, onComplete, onError } = {}) {
    try {
        const result = await queryTruth(input);
        const text = (result.provisional ? '[provisional] ' : '') + result.answer;

        if (onChunk) onChunk(text);
        if (onComplete) onComplete(text, Object.assign({ isDone: true }, result));
        return result;
    } catch (err) {
        const message = err && err.message ? err.message : String(err);
        if (onError) {
            onError(message);
            return null;
        }
        throw err;
    }
}
