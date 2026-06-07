export type Post = {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  cover_image: string | null
  category: string
  tags: string[]
  status: 'draft' | 'published'
  seo_title: string | null
  seo_description: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

export type Subscriber = {
  id: string
  email: string
  name: string | null
  subscribed_at: string
  active: boolean
}

export type Newsletter = {
  id: string
  subject: string
  content: string
  sent_at: string | null
  sent_count: number
  status: 'draft' | 'sent'
  created_at: string
}
