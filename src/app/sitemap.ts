import { MetadataRoute } from 'next'

// In a real scenario, you would fetch all PUBLIC users, active events, and communities from the DB
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://yourdomain.com'

  // Core Pages
  const routes = [
    '',
    '/dapp/feed',
    '/dapp/events',
    '/dapp/communities',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // Mock fetching dynamic public profiles from DB
  const publicUsers = ['neon_dreamer', 'alice_x', 'cyber_ninja']
  
  const userRoutes = publicUsers.map((username) => ({
    url: `${baseUrl}/${username}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  return [...routes, ...userRoutes]
}
