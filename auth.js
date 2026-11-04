const ACCESS_PHRASES = {
    master: ["funk_yeah", "i_am_dno", "hey_babes"].map(p => p.toLowerCase()),
    admin: ["add_ming", "paid_up", "yooo"].map(p => p.toLowerCase()),
    standard: ["level-one", "i-am-the-one", "pancakes"].map(p => p.toLowerCase())
};

export const GUEST_DAILY_LIMIT = 3;

export function verifyAccess(input) {
    const phrase = String(input || '').trim().toLowerCase();
    if (!phrase) {
        return { level: null, message: 'Enter an access phrase.' };
    }

    if (phrase === 'guest') {
        return {
            level: 'guest',
            message: `Guest access granted. ${GUEST_DAILY_LIMIT} queries per day.`
        };
    }

    for (const level of ['master', 'admin', 'standard']) {
        if (ACCESS_PHRASES[level].includes(phrase)) {
            return { level, message: `<b>${level.toUpperCase()}</b> access confirmed.` };
        }
    }

    return { level: null, message: 'Incorrect phrase.' };
}
