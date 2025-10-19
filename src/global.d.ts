/**
 * Global type declarations for Cloudflare Workers environment
 */

interface CloudflareEnv {
  D1?: D1Database
  R2_BUCKET?: R2Bucket
  CLOUDFLARE_ACCOUNT_ID?: string
  R2_ACCESS_KEY_ID?: string
  R2_SECRET_ACCESS_KEY?: string
}

interface Cloudflare {
  env: CloudflareEnv
}

declare global {
  var cloudflare: Cloudflare | undefined
}

export {}
