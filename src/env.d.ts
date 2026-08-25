/// <reference types="astro/client" />

type D1Database = import('@cloudflare/workers-types').D1Database;
type R2Bucket = import('@cloudflare/workers-types').R2Bucket;
type KVNamespace = import('@cloudflare/workers-types').KVNamespace;

interface Env {
  DB: D1Database;
  MEDIA_BUCKET: R2Bucket;
  SESSION_KV: KVNamespace;
  ANALYTICS_TOKEN?: string;
  ASSETS?: import('@cloudflare/workers-types').Fetcher;
}

declare module '*.wasm' {
  const wasmModule: WebAssembly.Module;
  export default wasmModule;
}

declare module "cloudflare:workers" {
  const env: Env;
  export { env };
}

declare namespace App {
  interface Locals {
    user?: import('./lib/auth/permissions').SessionUser;
  }
}
