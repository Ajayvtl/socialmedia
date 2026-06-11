import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Safely parse JSON strings with type-safe fallbacks
 */
export function safeParse<T>(value: any, fallback: T): T {
    if (value === null || value === undefined) return fallback;
    if (typeof value !== 'string') return value as T;
    try {
        return JSON.parse(value) as T;
    } catch {
        return fallback;
    }
}

/**
 * Ensures returned value is a valid array
 */
export function safeArray<T>(value: any): T[] {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return safeParse<T[]>(value, []);
}

/**
 * Ensures returned value is a valid object
 */
export function safeObject<T extends object>(value: any): T {
    if (!value) return {} as T;
    if (typeof value === 'object' && !Array.isArray(value)) return value as T;
    return safeParse<T>(value, {} as T);
}

/**
 * Safe number conversion
 */
export function safeNumber(value: any, fallback = 0): number {
    const num = Number(value);
    return isNaN(num) ? fallback : num;
}

/**
 * Safe boolean conversion
 */
export function safeBoolean(value: any): boolean {
    if (value === 'true' || value === 1 || value === true) return true;
    return false;
}

/**
 * Safe date parsing to ISO string or empty string
 */
export function safeDate(value: any): string {
    if (!value) return '';
    const date = new Date(value);
    return isNaN(date.getTime()) ? '' : date.toISOString();
}

/**
 * Ensures returned value is a safe, clean string
 */
export function safeString(value: any, fallback = ''): string {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'object') {
        try {
            return JSON.stringify(value);
        } catch {
            return fallback;
        }
    }
    return String(value);
}

/**
 * Ensures returned value is a member of an allowed enum set
 */
export function safeEnum<T>(value: any, allowedValues: readonly T[] | T[], fallback: T): T {
    if (allowedValues.includes(value)) {
        return value as T;
    }
    return fallback;
}


