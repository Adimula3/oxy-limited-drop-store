import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendOrderConfirmation(order) {
  if (!order.user?.email) return

  const shippingAddr = order.shippingAddress
    ? JSON.parse(order.shippingAddress)
    : null

  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;color:#e4e4e7;font-size:14px;border-bottom:1px solid #27272a;">${item.product.name}</td>
        <td style="padding:10px 0;color:#a1a1aa;font-size:14px;text-align:center;border-bottom:1px solid #27272a;">×${item.quantity}</td>
        <td style="padding:10px 0;color:#e4e4e7;font-size:14px;text-align:right;border-bottom:1px solid #27272a;">$${(item.price / 100).toFixed(2)}</td>
      </tr>`
    )
    .join('')

  const shippingHtml = shippingAddr
    ? `<p style="margin:4px 0;color:#a1a1aa;font-size:14px;">${shippingAddr.fullName}</p>
       <p style="margin:4px 0;color:#a1a1aa;font-size:14px;">${shippingAddr.address1}${shippingAddr.address2 ? `, ${shippingAddr.address2}` : ''}</p>
       <p style="margin:4px 0;color:#a1a1aa;font-size:14px;">${shippingAddr.city}, ${shippingAddr.state} ${shippingAddr.postalCode}</p>
       <p style="margin:4px 0;color:#a1a1aa;font-size:14px;">${shippingAddr.country}</p>`
    : '<p style="color:#71717a;font-size:14px;">—</p>'

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://oxy.store'

  try {
  const result = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: process.env.NODE_ENV === 'development'
      ? 'kolawoleolayinka16@gmail.com'
      : order.user.email,
    subject: `Order Confirmed — #${order.id.slice(-8).toUpperCase()}`,
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;padding:0 16px;">
    <div style="background-color:#18181b;border:1px solid #27272a;border-radius:12px;overflow:hidden;">

      <!-- Header -->
      <div style="padding:32px;border-bottom:1px solid #27272a;text-align:center;">
        <h1 style="margin:0;font-size:32px;font-weight:900;letter-spacing:-0.05em;color:#ffffff;">OxY</h1>
      </div>

      <!-- Body -->
      <div style="padding:32px;">
        <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#ffffff;">Order Confirmed</h2>
        <p style="margin:0 0 24px;color:#a1a1aa;font-size:14px;line-height:1.6;">
          Thanks for your purchase. We'll let you know when your order ships.
        </p>

        <p style="margin:0 0 20px;font-family:monospace;font-size:12px;color:#71717a;letter-spacing:0.05em;">
          ORDER #${order.id.slice(-8).toUpperCase()}
        </p>

        <!-- Items -->
        <table style="width:100%;border-collapse:collapse;margin-bottom:8px;">
          <thead>
            <tr>
              <th style="padding:0 0 8px;text-align:left;font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:0.1em;color:#71717a;">Item</th>
              <th style="padding:0 0 8px;text-align:center;font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:0.1em;color:#71717a;">Qty</th>
              <th style="padding:0 0 8px;text-align:right;font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:0.1em;color:#71717a;">Price</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>

        <!-- Total -->
        <div style="display:flex;justify-content:space-between;padding:16px 0 28px;border-bottom:1px solid #27272a;">
          <span style="font-size:14px;font-weight:700;color:#ffffff;">Total</span>
          <span style="font-size:14px;font-weight:700;color:#ffffff;">$${(order.total / 100).toFixed(2)}</span>
        </div>

        <!-- Shipping -->
        <div style="padding-top:24px;margin-bottom:28px;">
          <p style="margin:0 0 12px;font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:0.1em;color:#71717a;">Shipping To</p>
          ${shippingHtml}
        </div>

        <!-- CTA -->
        <a href="${baseUrl}/account/orders"
           style="display:inline-block;background-color:#ffffff;color:#000000;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;">
          View My Orders
        </a>
      </div>

      <!-- Footer -->
      <div style="padding:24px 32px;border-top:1px solid #27272a;text-align:center;">
        <p style="margin:0;font-size:12px;color:#52525b;">© ${new Date().getFullYear()} OxY. All rights reserved.</p>
      </div>

    </div>
  </div>
</body>
</html>`,
  })
  console.log('[email] Resend result:', JSON.stringify(result))
  } catch (err) {
    console.error('[email] Resend error:', err)
  }
}
