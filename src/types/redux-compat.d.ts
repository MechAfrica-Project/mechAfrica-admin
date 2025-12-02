// Provide lightweight compatibility types expected by some third-party
// type definitions (e.g. recharts) when using newer `redux` versions.
// These mirror the historical types used by @types/redux and are
// sufficient for compile-time compatibility.

declare module "redux" {
  /** An empty object type used in older Redux typings */
  export type EmptyObject = Record<string, never>;

  /** CombinedState placeholder — maps to the inner state shape */
  export type CombinedState<T> = T;
}
