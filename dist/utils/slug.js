"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSlug = void 0;
/**
 * Convert a string to kebab-case for use as a URL-friendly slug
 *
 * @param text The string to convert to a slug
 * @returns A URL-friendly kebab-case string
 * @example
 * createSlug("Hello World!") // "hello-world"
 * createSlug("My Awesome Track - 2023") // "my-awesome-track-2023"
 */
const createSlug = (text) => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove non-word chars
        .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};
exports.createSlug = createSlug;
//# sourceMappingURL=slug.js.map