// ============================================================
// ZYVV — Email API Route
// File: app/api/email/route.ts
// ============================================================
// POST /api/email
// Called after a user picks a door and opts in to receive
// their reading by email.
//
// Sends a branded HTML email via Resend containing:
//   - The original roast
//   - All three doors (chosen door highlighted with its neon accent)
//   - A footer nudge toward the collective intelligence layer (Phase 3)
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import type { EmailRequest, Door, DoorType } from '@/lib/types'

export const runtime = 'edge'

const resend = new Resend(process.env.RESEND_API_KEY!)

// ── Door display metadata ────────────────────────────────────
// Mirrors DOOR_CONFIGS in types.ts but as raw hex/strings for
// inline email styles (Tailwind classes don't work in email).

const DOOR_META: Record<DoorType, { label: string; color: string; border: string; glow: string }> = {
  conventional: {
    label: 'THE CONVENTIONAL DOOR',
    color: '#00FF94',
    border: '1px solid #00FF94',
    glow: '0 0 24px rgba(0, 255, 148, 0.20)',
  },
  contrarian: {
    label: 'THE CONTRARIAN DOOR',
    color: '#FF2D55',
    border: '1px solid #FF2D55',
    glow: '0 0 24px rgba(255, 45, 85, 0.20)',
  },
  alien: {
    label: 'THE ALIEN DOOR',
    color: '#BF5AF2',
    border: '1px solid #BF5AF2',
    glow: '0 0 24px rgba(191, 90, 242, 0.20)',
  },
}

// ============================================================
// EMAIL TEMPLATE
// Pure inline-styled HTML. Table-based for broad email client
// support (Gmail, Apple Mail, Outlook). Dark background
// throughout — ZYVV's canvas is always black.
// ============================================================

function buildDoorBlock(door: Door, isChosen: boolean): string {
  const meta = DOOR_META[door.door_type]

  const containerStyle = isChosen
    ? `background:#0a0a0a; border:${meta.border}; border-radius:4px; padding:24px 28px; margin-bottom:16px; box-shadow:${meta.glow};`
    : `background:#0a0a0a; border:1px solid #222222; border-radius:4px; padding:24px 28px; margin-bottom:16px; opacity:0.6;`

  const chosenBadge = isChosen
    ? `<div style="display:inline-block; background:${meta.color}; color:#000000; font-family:'Courier New',Courier,monospace; font-size:10px; font-weight:700; letter-spacing:0.12em; padding:3px 8px; border-radius:2px; margin-bottom:12px; text-transform:uppercase;">YOUR CHOICE</div>`
    : ''

  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="${containerStyle}">
      <tr>
        <td>
          ${chosenBadge}
          <div style="font-family:'Courier New',Courier,monospace; font-size:10px; font-weight:700; letter-spacing:0.12em; color:${meta.color}; text-transform:uppercase; margin-bottom:8px;">${meta.label}</div>
          <div style="font-family:Georgia,'Times New Roman',serif; font-size:20px; font-weight:700; color:#ffffff; letter-spacing:-0.02em; line-height:1.15; margin-bottom:12px;">${door.title}</div>
          <div style="font-family:Georgia,'Times New Roman',serif; font-size:15px; color:#aaaaaa; line-height:1.65; margin-bottom:12px;">${door.description}</div>
          <div style="font-family:'Courier New',Courier,monospace; font-size:12px; color:${meta.color}; line-height:1.6; border-left:2px solid ${meta.color}; padding-left:12px; opacity:0.85;">${door.why_it_works}</div>
        </td>
      </tr>
    </table>
  `
}

function buildEmailHtml(payload: EmailRequest): string {
  const { situation, roast, doors, chosen_door } = payload

  const doorBlocks = doors
    .map((door) => buildDoorBlock(door, door.id === chosen_door.id))
    .join('')

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="dark" />
  <title>Your ZYVV Reading</title>
</head>
<body style="margin:0; padding:0; background:#000000; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%;">

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#000000; min-height:100vh;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- Card -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom:40px;">
              <div style="font-family:'Courier New',Courier,monospace; font-size:28px; font-weight:700; color:#00F5FF; letter-spacing:-0.02em;">ZYVV</div>
              <div style="font-family:'Courier New',Courier,monospace; font-size:10px; color:#555555; letter-spacing:0.14em; text-transform:uppercase; margin-top:4px;">YOUR PORTAL READING</div>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding-bottom:32px;">
              <div style="height:1px; background:#222222;"></div>
            </td>
          </tr>

          <!-- Situation -->
          <tr>
            <td style="padding-bottom:8px;">
              <div style="font-family:'Courier New',Courier,monospace; font-size:10px; font-weight:700; letter-spacing:0.12em; color:#555555; text-transform:uppercase;">THE SITUATION</div>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:32px;">
              <div style="font-family:Georgia,'Times New Roman',serif; font-size:15px; color:#777777; line-height:1.65; font-style:italic;">${situation}</div>
            </td>
          </tr>

          <!-- Roast -->
          <tr>
            <td style="padding-bottom:8px;">
              <div style="font-family:'Courier New',Courier,monospace; font-size:10px; font-weight:700; letter-spacing:0.12em; color:#00F5FF; text-transform:uppercase;">THE ROAST</div>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:40px;">
              <div style="background:#0a0a0a; border:1px solid #222222; border-left:2px solid #00F5FF; border-radius:4px; padding:20px 24px;">
                <div style="font-family:Georgia,'Times New Roman',serif; font-size:17px; color:#ffffff; line-height:1.65;">${roast}</div>
              </div>
            </td>
          </tr>

          <!-- Doors header -->
          <tr>
            <td style="padding-bottom:16px;">
              <div style="font-family:'Courier New',Courier,monospace; font-size:10px; font-weight:700; letter-spacing:0.12em; color:#555555; text-transform:uppercase;">THE THREE DOORS</div>
            </td>
          </tr>

          <!-- Door blocks -->
          <tr>
            <td style="padding-bottom:40px;">
              ${doorBlocks}
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding-bottom:32px;">
              <div style="height:1px; background:#222222;"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-bottom:8px;">
              <div style="font-family:'Courier New',Courier,monospace; font-size:12px; color:#555555; line-height:1.7;">
                Come back and tell us what happened.<br/>
                Every outcome you report makes the portal smarter for everyone.
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:40px;">
              <a href="https://zyvv.app" style="font-family:'Courier New',Courier,monospace; font-size:11px; color:#00F5FF; text-decoration:none; letter-spacing:0.08em;">ZYVV.APP →</a>
            </td>
          </tr>

          <!-- Fine print -->
          <tr>
            <td>
              <div style="font-family:'Courier New',Courier,monospace; font-size:10px; color:#333333; line-height:1.6;">
                You received this because you requested it at zyvv.app.<br/>
                No account. No tracking. No noise.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `.trim()
}

// ============================================================
// PLAIN TEXT FALLBACK
// Required for deliverability. Mirrors the HTML content.
// ============================================================

function buildEmailText(payload: EmailRequest): string {
  const { situation, roast, doors, chosen_door } = payload

  const doorLines = doors.map((door) => {
    const meta = DOOR_META[door.door_type]
    const chosen = door.id === chosen_door.id ? ' [YOUR CHOICE]' : ''
    return [
      `${meta.label}${chosen}`,
      `${door.title}`,
      `${door.description}`,
      `Why it works: ${door.why_it_works}`,
    ].join('\n')
  }).join('\n\n---\n\n')

  return [
    'ZYVV — YOUR PORTAL READING',
    '==========================',
    '',
    'THE SITUATION',
    situation,
    '',
    'THE ROAST',
    roast,
    '',
    'THE THREE DOORS',
    '---------------',
    doorLines,
    '',
    '==========================',
    'Come back and tell us what happened.',
    'Every outcome you report makes the portal smarter for everyone.',
    '',
    'https://zyvv.app',
  ].join('\n')
}

// ============================================================
// ROUTE HANDLER
// ============================================================

export async function POST(req: NextRequest) {
  try {
    // ── Parse + validate ───────────────────────────────────────
    const body = (await req.json()) as EmailRequest

    const { email, situation, roast, doors, chosen_door } = body

    if (!email || !situation || !roast || !doors || !chosen_door) {
      return NextResponse.json(
        { error: 'email, situation, roast, doors, and chosen_door are required' },
        { status: 400 }
      )
    }

    // Basic email format check — Resend will hard-reject malformed addresses,
    // but catching it here gives a cleaner error message to the client.
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address.' },
        { status: 400 }
      )
    }

    if (!Array.isArray(doors) || doors.length !== 3) {
      return NextResponse.json(
        { error: 'doors must be an array of three items' },
        { status: 400 }
      )
    }

    // ── Build + send ───────────────────────────────────────────
    const { data, error } = await resend.emails.send({
      from: 'ZYVV <onboarding@resend.dev>',
      to: [email],
      subject: 'Your portal is open.',
      html: buildEmailHtml(body),
      text: buildEmailText(body),
    })

    if (error) {
      console.error('[/api/email] Resend error:', error)
      return NextResponse.json(
        { error: 'Email could not be sent. Try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ sent: true, id: data?.id }, { status: 200 })
  } catch (err) {
    console.error('[/api/email] Error:', err)
    return NextResponse.json(
      { error: 'Something went wrong sending your reading.' },
      { status: 500 }
    )
  }
}
