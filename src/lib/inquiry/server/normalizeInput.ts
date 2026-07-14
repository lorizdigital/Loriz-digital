import {
  normalizeMultiline,
  normalizeSingleLine,
} from "../normalize";

const MAX_DEPTH = 12;
const MAX_NODES = 500;
const MAX_ARRAY_ITEMS = 30;
const MAX_UNTRUSTED_STRING_LENGTH = 2_000;
const MAX_LINKS = 8;

/** Normalizes untrusted JSON before the strict Zod schema validates its shape. */
function normalizeValue(
  input: unknown,
  path: string[],
  depth: number,
  state: { nodes: number; links: number },
): unknown {
  state.nodes += 1;
  if (depth > MAX_DEPTH || state.nodes > MAX_NODES) {
    throw new RangeError("Inquiry input is too deeply nested or complex.");
  }
  if (typeof input === "string") {
    if (input.length > MAX_UNTRUSTED_STRING_LENGTH) {
      throw new RangeError("Inquiry input contains an overlong string.");
    }
    state.links += input.match(/(?:https?:\/\/|www\.)/giu)?.length ?? 0;
    if (state.links > MAX_LINKS) {
      throw new RangeError("Inquiry input contains too many links.");
    }
    const normalized = path.at(-1) === "additionalMessage"
      ? normalizeMultiline(input)
      : normalizeSingleLine(input);
    return path.at(-1) === "email" ? normalized.toLowerCase() : normalized;
  }
  if (Array.isArray(input)) {
    if (input.length > MAX_ARRAY_ITEMS) {
      throw new RangeError("Inquiry input contains too many array items.");
    }
    return input.map((value, index) =>
      normalizeValue(value, [...path, String(index)], depth + 1, state),
    );
  }
  if (input && typeof input === "object") {
    return Object.fromEntries(
      Object.entries(input).map(([key, value]) => [
        key,
        normalizeValue(value, [...path, key], depth + 1, state),
      ]),
    );
  }
  return input;
}

export function normalizeInquiryInput(input: unknown): unknown {
  return normalizeValue(input, [], 0, { nodes: 0, links: 0 });
}
