import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { subject, content } = await req.json()
  if (!subject || !content) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const { data: subscribers } = await supabaseAdmin
    .from('subscribers')
    .select('email')
    .eq('active', true)

  if (!subscribers || subscribers.length === 0) {
    return NextResponse.json({ error: 'No subscribers' }, { status: 400 })
  }

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    return NextResponse.json({ error: 'Newsletter sending not configured yet. Add RESEND_API_KEY to environment variables.' }, { status: 503 })
  }

  const { Resend } = await import('resend')
  const resend = new Resend(resendKey)

  const emails = subscribers.map((s: any) => s.email)

  const htmlContent = content
    .replace(/^# (.*)/gm, '<h1 style="font-size:28px;font-weight:400;letter-spacing:-1px;margin:0 0 16px;font-family:Georgia,serif;">$1</h1>')
    .replace(/^## (.*)/gm, '<h2 style="font-size:20px;font-weight:600;margin:24px 0 12px;">$1</h2>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p style="margin:0 0 16px;line-height:1.8;">')

  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:Helvetica,Arial,sans-serif;color:#1e1e1a;">
      <div style="border-bottom:1px solid #e0e0d8;padding-bottom:20px;margin-bottom:32px;">
        <p style="font-size:12px;color:#b4b4a8;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">The Webmify Edit</p>
        <h1 style="font-size:24px;font-weight:600;margin:0;color:#0c0c0a;">${subject}</h1>
      </div>
      <div style="font-size:15px;line-height:1.8;">
        <p style="margin:0 0 16px;line-height:1.8;">${htmlContent}</p>
      </div>
      <div style="border-top:1px solid #e0e0d8;margin-top:40px;padding-top:20px;font-size:12px;color:#b4b4a8;">
        <p>You are receiving this because you subscribed at <a href="https://webmify.site/blog" style="color:#b8944a;">webmify.site/blog</a></p>
      </div>
    </div>
  `

  try {
    await resend.emails.send({
      from: 'Webmify <newsletter@webmify.site>',
      to: emails,
      subject,
      html,
    })
    await supabaseAdmin.from('newsletters').insert({
      subject, content, status: 'sent',
      sent_at: new Date().toISOString(),
      sent_count: emails.length
    })
    return NextResponse.json({ ok: true, sent: emails.length })
  } catch (err) {
    return NextResponse.json({ error: 'Send failed' }, { status: 500 })
  }
}
