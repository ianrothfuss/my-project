import { defineCloudflareConfig } from '@opennextjs/cloudflare/config'

// OpenNext Cloudflare configuration
// Note: Native modules (sharp, better-sqlite3, etc.) are automatically excluded
// by marking sharp as optional in Next.js config (images.unoptimized: true)
// and removing @payloadcms/db-sqlite from dependencies
export default defineCloudflareConfig({})
