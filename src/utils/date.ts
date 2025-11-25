export const pad = (n: number) => String(n).padStart(2, '0');

export const formatClock = (d: Date) => {
    let h = d.getHours();
    const suffix = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    const m = pad(d.getMinutes());
    return `${pad(h)} : ${m} ${suffix}`;
};

export const formatDate = (d: Date) =>
    d.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'short',
        day: '2-digit',
    });

export const getGreeting = (d: Date) => {
    const h = d.getHours();
    if (h < 12) return 'Good Morning';
    if (h < 18) return 'Good Afternoon';
    return 'Good Evening';
};
