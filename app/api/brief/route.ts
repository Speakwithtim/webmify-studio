import { NextRequest, NextResponse } from 'next/server'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: cors })
}

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, service, budget, message } = await req.json()

    if (!firstName || !email || !service || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400, headers: cors })
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_Cr1cie2b_5mPSySuJW3GcsdxHHQKT7exF'

    // Email 1 — Notify you with the brief details
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Webmify Briefs <onboarding@resend.dev>',
        to: 'webmifystudios@gmail.com',
        subject: `New project brief from ${firstName} ${lastName}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1e1e1a;">
            <div style="margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid #e0e0d8;">
              <div style="font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #b8944a; margin-bottom: 8px;">New Project Brief</div>
              <h1 style="font-size: 28px; font-weight: 400; margin: 0; color: #0c0c0a; font-family: Georgia, serif;">From ${firstName} ${lastName}</h1>
            </div>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f0f0ea; font-size: 12px; font-weight: 600; color: #78786e; text-transform: uppercase; letter-spacing: 1px; width: 140px;">Name</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #f0f0ea; font-size: 15px; color: #0c0c0a;">${firstName} ${lastName}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f0f0ea; font-size: 12px; font-weight: 600; color: #78786e; text-transform: uppercase; letter-spacing: 1px;">Email</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #f0f0ea; font-size: 15px; color: #0c0c0a;"><a href="mailto:${email}" style="color: #b8944a;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f0f0ea; font-size: 12px; font-weight: 600; color: #78786e; text-transform: uppercase; letter-spacing: 1px;">Service</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #f0f0ea; font-size: 15px; color: #0c0c0a;">${service}</td>
              </tr>
              ${budget ? `<tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f0f0ea; font-size: 12px; font-weight: 600; color: #78786e; text-transform: uppercase; letter-spacing: 1px;">Budget</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #f0f0ea; font-size: 15px; color: #0c0c0a;">${budget}</td>
              </tr>` : ''}
              <tr>
                <td style="padding: 12px 0; font-size: 12px; font-weight: 600; color: #78786e; text-transform: uppercase; letter-spacing: 1px; vertical-align: top; padding-top: 16px;">Message</td>
                <td style="padding: 12px 0; padding-top: 16px; font-size: 15px; color: #0c0c0a; line-height: 1.7;">${message}</td>
              </tr>
            </table>
            <div style="margin-top: 32px; padding: 20px; background: #f8f8f5; border-radius: 8px; border: 1px solid #e0e0d8;">
              <p style="margin: 0; font-size: 13px; color: #78786e;">Reply directly to this email to respond to ${firstName}. Their email is <strong>${email}</strong>.</p>
            </div>
          </div>
        `,
        reply_to: email,
      }),
    })

    // Email 2 — Confirmation to the client
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Webmify <onboarding@resend.dev>',
        to: email,
        subject: 'We received your brief',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1e1e1a;">
            <div style="margin-bottom: 32px;">
              <div style="font-size: 20px; font-weight: 600; color: #0c0c0a; letter-spacing: -0.5px;">Webmify</div>
            </div>

            <h1 style="font-family: Georgia, serif; font-size: 32px; font-weight: 400; letter-spacing: -1px; color: #0c0c0a; margin: 0 0 16px;">Brief received, ${firstName}.</h1>
            <p style="font-size: 16px; color: #78786e; line-height: 1.75; margin: 0 0 32px;">Thank you for reaching out. We have received your project brief and will review it carefully. You will hear from us within 24 hours with a clear next step — no pitch, no pressure.</p>

            <div style="background: #f8f8f5; border: 1px solid #e0e0d8; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
              <div style="font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #b4b4a8; margin-bottom: 16px;">Your brief summary</div>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-size: 12px; color: #78786e; width: 120px;">Service</td>
                  <td style="padding: 8px 0; font-size: 13px; font-weight: 500; color: #0c0c0a;">${service}</td>
                </tr>
                ${budget ? `<tr>
                  <td style="padding: 8px 0; font-size: 12px; color: #78786e;">Budget</td>
                  <td style="padding: 8px 0; font-size: 13px; font-weight: 500; color: #0c0c0a;">${budget}</td>
                </tr>` : ''}
                <tr>
                  <td style="padding: 8px 0; font-size: 12px; color: #78786e; vertical-align: top;">Details</td>
                  <td style="padding: 8px 0; font-size: 13px; color: #0c0c0a; line-height: 1.6;">${message}</td>
                </tr>
              </table>
            </div>

            <p style="font-size: 14px; color: #78786e; line-height: 1.75; margin: 0 0 8px;">If you have anything to add before we respond, simply reply to this email.</p>
            <p style="font-size: 14px; color: #78786e; margin: 0 0 40px;">Talk soon.</p>

            <div style="font-size: 14px; font-weight: 600; color: #0c0c0a; margin-bottom: 4px;">The Webmify Team</div>
            <div style="font-size: 13px; color: #b4b4a8;">webmify.site</div>

            <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e0e0d8; font-size: 11px; color: #b4b4a8;">
              You received this email because you submitted a project brief at webmify.site.
            </div>
          </div>
        `,
      }),
    })

    return NextResponse.json({ ok: true }, { headers: cors })
  } catch (err: any) {
    console.error('Brief error:', err)
    return NextResponse.json({ error: err.message }, { status: 500, headers: cors })
  }
}
