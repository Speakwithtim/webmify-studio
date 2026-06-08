import { supabaseAdmin } from '@/lib/supabase'

export default async function sitemap() {
  const { data: posts } = await supabaseAdmin
    .from('posts')
    .select('slug, updated_at')
    .eq('status', 'published')

  const postUrls = (posts || []).map(post => ({
    url: `https://studio.webmify.site/blog/${post.slug}`,
    lastModified: post.updated_at,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: 'https://studio.webmify.site',
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: 'https://studio.webmify.site/blog',
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    ...postUrls,
  ]
}
