export function getCurrentUtcMonthRange(now = new Date()) {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

    return { start, end };
}

export function formatUtcMonthLabel(now = new Date()) {
    return now.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
    });
}