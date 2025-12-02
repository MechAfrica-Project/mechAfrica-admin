// Minimal declaration to satisfy editors/TypeScript when importing from
// `next/server` in environments where Next's built-in types are not resolved
// (e.g. some editor TS servers). This mirrors the small surface we use.
declare module "next/server" {
  export class NextResponse {
    static json(body: unknown, init?: ResponseInit): Response;
  }
}
