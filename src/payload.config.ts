// storage-adapter-import-placeholder
import { sqliteD1Adapter } from '@payloadcms/db-d1-sqlite'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { s3Storage } from '@payloadcms/storage-s3'

import {
    BoldFeature,
    EXPERIMENTAL_TableFeature,
    IndentFeature,
    ItalicFeature,
    LinkFeature,
    OrderedListFeature,
    UnderlineFeature,
    UnorderedListFeature,
    lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from '@/collections/Categories'
import { Media } from '@/collections/Media'
import { Pages } from '@/collections/Pages'
import { Users } from '@/collections/Users'
import { Footer } from '@/globals/Footer'
import { Header } from '@/globals/Header'
import { plugins } from './plugins'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Validate environment
if (!process.env.PAYLOAD_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('PAYLOAD_SECRET environment variable is required in production')
}

export default buildConfig({
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below and the import `BeforeLogin` statement on line 15.
      beforeLogin: ['@/components/BeforeLogin#BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below and the import `BeforeDashboard` statement on line 15.
      beforeDashboard: ['@/components/BeforeDashboard#BeforeDashboard'],
    },
    user: Users.slug,
  },
  collections: [Users, Pages, Categories, Media],
  db: globalThis.cloudflare?.env?.D1
    ? sqliteD1Adapter({
        binding: globalThis.cloudflare.env.D1,
      })
    : sqliteAdapter({
        client: {
          url: `file:${path.resolve(process.cwd(), 'payload.db')}`,
        },
      }),
  editor: lexicalEditor({
    features: () => {
      return [
        UnderlineFeature(),
        BoldFeature(),
        ItalicFeature(),
        OrderedListFeature(),
        UnorderedListFeature(),
        LinkFeature({
          enabledCollections: ['pages'],
          fields: ({ defaultFields }) => {
            const defaultFieldsWithoutUrl = defaultFields.filter((field) => {
              if ('name' in field && field.name === 'url') return false
              return true
            })

            return [
              ...defaultFieldsWithoutUrl,
              {
                name: 'url',
                type: 'text',
                admin: {
                  condition: ({ linkType }) => linkType !== 'internal',
                },
                label: ({ t }) => t('fields:enterURL'),
                required: true,
              },
            ]
          },
        }),
        IndentFeature(),
        EXPERIMENTAL_TableFeature(),
      ]
    },
  }),
  //email: nodemailerAdapter(),
  endpoints: [],
  globals: [Header, Footer],
  plugins: [
    ...plugins,
    // Only add R2 storage adapter in Cloudflare Workers environment
    ...(globalThis.cloudflare?.env?.R2_BUCKET &&
    globalThis.cloudflare?.env?.CLOUDFLARE_ACCOUNT_ID &&
    globalThis.cloudflare?.env?.R2_ACCESS_KEY_ID &&
    globalThis.cloudflare?.env?.R2_SECRET_ACCESS_KEY
      ? [
          s3Storage({
            bucket: globalThis.cloudflare.env.R2_BUCKET.name,
            config: {
              region: 'auto',
              endpoint: `https://${globalThis.cloudflare.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
              credentials: {
                accessKeyId: globalThis.cloudflare.env.R2_ACCESS_KEY_ID,
                secretAccessKey: globalThis.cloudflare.env.R2_SECRET_ACCESS_KEY,
              },
            },
            collections: {
              media: true,
            },
          }),
        ]
      : []),
  ],
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // Sharp is now an optional dependency -
  // if you want to resize images, crop, set focal point, etc.
  // make sure to install it and pass it to the config.
  // sharp,
})
