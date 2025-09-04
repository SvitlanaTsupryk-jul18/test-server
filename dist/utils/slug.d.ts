/**
 * Convert a string to kebab-case for use as a URL-friendly slug
 *
 * @param text The string to convert to a slug
 * @returns A URL-friendly kebab-case string
 * @example
 * createSlug("Hello World!") // "hello-world"
 * createSlug("My Awesome Track - 2023") // "my-awesome-track-2023"
 */
export declare const createSlug: (text: string) => string;
