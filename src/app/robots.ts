import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      // Allow indexing of the main site and public profiles
      allow: '/',
      // Prevent indexing of internal dashboards, settings, and backend routes
      disallow: ['/admin/', '/developer/', '/dapp/settings/', '/dapp/inbox/', '/api/'],
    },
    sitemap: 'https://yourdomain.com/sitemap.xml', // To be replaced with dynamic env variable
  }
}
