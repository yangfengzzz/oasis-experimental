export function Clamp(a: number, low: number, high: number): number {
    return Math.max(low, Math.min(a, high));
}

export function Random(lo: number, hi: number): number {
    let r = Math.random();
    r = (hi - lo) * r + lo;
    return r;
}