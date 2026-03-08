const contactFormTemplate = (firstName, lastName, email, phone, service, message) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <title>New Contact Form Submission</title>
    </head>
    <body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding:40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.05);">
              
              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(90deg,#4f46e5,#7c3aed); padding:30px; text-align:center;">
                  <h1 style="color:#ffffff; margin:0; font-size:24px;">New Contact Request</h1>
                  <p style="color:#e0e7ff; margin:8px 0 0; font-size:14px;">
                    You’ve received a new inquiry from your website
                  </p>
                </td>
              </tr>
    
              <!-- Body -->
              <tr>
                <td style="padding:30px;">
                  
                  <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px; color:#374151;">
                    
                    <tr>
                      <td style="padding:12px 0; border-bottom:1px solid #e5e7eb;">
                        <strong style="color:#6b7280;">Full Name</strong><br/>
                        ${firstName} ${lastName}
                      </td>
                    </tr>
    
                    <tr>
                      <td style="padding:12px 0; border-bottom:1px solid #e5e7eb;">
                        <strong style="color:#6b7280;">Email Address</strong><br/>
                        ${email}
                      </td>
                    </tr>
    
                    <tr>
                      <td style="padding:12px 0; border-bottom:1px solid #e5e7eb;">
                        <strong style="color:#6b7280;">Phone Number</strong><br/>
                        ${phone || "Not Provided"}
                      </td>
                    </tr>
    
                    <tr>
                      <td style="padding:12px 0; border-bottom:1px solid #e5e7eb;">
                        <strong style="color:#6b7280;">Service Interest</strong><br/>
                        ${service || "General Inquiry"}
                      </td>
                    </tr>
    
                    <tr>
                      <td style="padding:16px 0;">
                        <strong style="color:#6b7280;">Message</strong>
                        <div style="margin-top:10px; padding:15px; background:#f9fafb; border-radius:6px; line-height:1.6; color:#111827;">
                          ${message}
                        </div>
                      </td>
                    </tr>
    
                  </table>
    
                </td>
              </tr>
    
              <!-- Footer -->
              <tr>
                <td style="background:#f9fafb; padding:20px; text-align:center; font-size:12px; color:#9ca3af;">
                  This email was generated automatically from your website contact form.
                </td>
              </tr>
    
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;
  return html;
};

const carRentalConfirmationTemplate = ({
  customerName,
  bookingId,
  carName,
  carCategory,
  pickupDate,
  pickupTime,
  returnDate,
  returnTime,
  pickupLocation,
  dropoffLocation,
  rentalDays,
  basePrice,
  insuranceFee,
  airportSurcharge,
  taxAmount,
  totalAmount,
  currency = "₹",
}) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <title>Booking Confirmation – ${bookingId}</title>
    </head>
    <body style="margin:0; padding:0; background-color:#f0f2f5; font-family:Arial, sans-serif;">

      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f2f5; padding:40px 0;">
        <tr>
          <td align="center">
            <table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.08);">

              <!-- ── HEADER ── -->
              <tr>
                <td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 60%,#0f3460 100%); padding:36px 40px; text-align:center;">
                  <!-- Logo Row -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding-bottom:24px;">
                        <span style="display:inline-block; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:8px 20px;">
                          <span style="font-size:18px;">🚗</span>
                          <span style="color:#ffffff; font-size:17px; font-weight:700; letter-spacing:1px; vertical-align:middle; margin-left:8px;">Sun<span style="color:#f0c040;">venus</span></span>
                        </span>
                      </td>
                    </tr>
                  </table>
                  <!-- Badge -->
                  <div style="display:inline-block; background:rgba(240,192,64,0.15); border:1px solid rgba(240,192,64,0.4); color:#f0c040; font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; padding:5px 16px; border-radius:50px; margin-bottom:16px;">
                    ✓ &nbsp;Booking Confirmed
                  </div>
                  <h1 style="color:#ffffff; margin:0 0 10px; font-size:30px; font-weight:700; line-height:1.2;">
                    Your ride is <em style="color:#f0c040; font-style:italic;">reserved!</em>
                  </h1>
                  <p style="color:#a0aec0; margin:0; font-size:14px; line-height:1.6;">
                    Hi <strong style="color:#e2e8f0;">${customerName}</strong>, your booking is confirmed.<br/>All the details are below — enjoy your journey!
                  </p>
                </td>
              </tr>

              <!-- ── BOOKING ID BANNER ── -->
              <tr>
                <td style="background:#1a1a2e; padding:18px 40px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="border:1px dashed rgba(240,192,64,0.4); border-radius:10px; padding:14px 20px;">
                    <tr>
                      <td>
                        <span style="font-size:10px; letter-spacing:1.5px; text-transform:uppercase; color:#718096;">Booking Reference</span><br/>
                        <span style="font-size:22px; font-weight:700; color:#f0c040; letter-spacing:3px; font-family:'Courier New', monospace;">${bookingId}</span>
                      </td>
                      <td align="right" style="font-size:30px;">🎫</td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- ── VEHICLE CARD ── -->
              <tr>
                <td style="background:#f8fafc; padding:28px 40px;">
                  <p style="margin:0 0 4px; font-size:10px; letter-spacing:2px; text-transform:uppercase; color:#f0c040; font-weight:700;">Your Vehicle</p>
                  <h2 style="margin:0 0 4px; font-size:24px; color:#1a202c;">${carName}</h2>
                  <p style="margin:0 0 20px; font-size:13px; color:#718096;">${carCategory}</p>
                  <!-- Spec pills -->
                </td>
              </tr>

              <!-- ── BOOKING DETAILS ── -->
              <tr>
                <td style="padding:28px 40px 0;">
                  <p style="margin:0 0 16px; font-size:10px; letter-spacing:2px; text-transform:uppercase; color:#f0c040; font-weight:700;">Booking Details</p>
                  <table width="100%" cellpadding="0" cellspacing="0">

                    <!-- Pick-up / Return row -->
                    <tr>
                      <td width="50%" style="padding:0 8px 12px 0; vertical-align:top;">
                        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:16px 18px;">
                          <p style="margin:0 0 5px; font-size:10px; letter-spacing:1px; text-transform:uppercase; color:#a0aec0;">Pick-up Date</p>
                          <p style="margin:0; font-size:15px; color:#2d3748; font-weight:600;">${pickupDate}</p>

                        </div>
                      </td>
                      <td width="50%" style="padding:0 0 12px 8px; vertical-align:top;">
                        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:16px 18px;">
                          <p style="margin:0 0 5px; font-size:10px; letter-spacing:1px; text-transform:uppercase; color:#a0aec0;">Return Date</p>
                          <p style="margin:0; font-size:15px; color:#2d3748; font-weight:600;">${returnDate}</p>
                        </div>
                      </td>
                    </tr>

                    <!-- Pick-up Location -->
                    <tr>
                      <td colspan="2" style="padding-bottom:12px;">
                        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:16px 18px;">
                          <p style="margin:0 0 5px; font-size:10px; letter-spacing:1px; text-transform:uppercase; color:#a0aec0;">Pick-up Location</p>
                          <p style="margin:0; font-size:14px; color:#2d3748; font-weight:600;">${pickupLocation}</p>
                        </div>
                      </td>
                    </tr>

                    <!-- Drop-off Location -->
                    <tr>
                      <td colspan="2" style="padding-bottom:12px;">
                        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:16px 18px;">
                          <p style="margin:0 0 5px; font-size:10px; letter-spacing:1px; text-transform:uppercase; color:#a0aec0;">Drop-off Location</p>
                          <p style="margin:0; font-size:14px; color:#2d3748; font-weight:600;">${dropoffLocation}</p>
                        </div>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>

              <!-- ── PRICE BREAKDOWN ── -->
              <tr>
                <td style="padding:8px 40px 28px;">
                  <p style="margin:0 0 16px; font-size:10px; letter-spacing:2px; text-transform:uppercase; color:#f0c040; font-weight:700;">Price Breakdown</p>
                  <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px; color:#4a5568;">

                    <tr>
                      <td style="padding:10px 0; border-bottom:1px solid #f0f0f0;">${carName}</td>
                      <td align="right" style="padding:10px 0; border-bottom:1px solid #f0f0f0;">${currency}${basePrice}</td>
                    </tr>
                    <tr>
                      <td style="padding:10px 0; border-bottom:1px solid #f0f0f0;">Insurance &amp; Protection</td>
                      <td align="right" style="padding:10px 0; border-bottom:1px solid #f0f0f0;">${currency}${insuranceFee}</td>
                    </tr>
                    <tr>
                      <td style="padding:10px 0; border-bottom:1px solid #f0f0f0;">Taxes &amp; Fees (GST)</td>
                      <td align="right" style="padding:10px 0; border-bottom:1px solid #f0f0f0;">${currency}${taxAmount}</td>
                    </tr>

                  </table>

                  <!-- Total -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px; background:linear-gradient(135deg,#1a1a2e,#16213e); border-radius:10px;">
                    <tr>
                      <td style="padding:18px 22px;">
                        <span style="font-size:16px; color:#e2e8f0; font-weight:600;">Total Charged</span>
                      </td>
                      <td align="right" style="padding:18px 22px;">
                        <span style="font-size:24px; color:#f0c040; font-weight:700;">${currency}${totalAmount}</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- ── WHAT TO BRING ── -->
              <tr>
                <td style="background:#f8fafc; padding:28px 40px; border-top:1px solid #edf2f7;">
                  <p style="margin:0 0 16px; font-size:10px; letter-spacing:2px; text-transform:uppercase; color:#f0c040; font-weight:700;">What to Bring</p>
                  <table width="100%" cellpadding="0" cellspacing="0">

                    <tr>
                      <td style="padding-bottom:12px;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff; border:1px solid #e2e8f0; border-radius:10px;">
                          <tr>
                            <td width="52" style="padding:16px 0 16px 18px; font-size:22px; vertical-align:middle;">🪪</td>
                            <td style="padding:16px 16px 16px 0;">
                              <p style="margin:0 0 3px; font-size:12px; color:#a0aec0; text-transform:uppercase; letter-spacing:0.5px;">Valid ID &amp; License</p>
                              <p style="margin:0; font-size:13px; color:#4a5568; line-height:1.5;">Bring your original driver's license and a government-issued photo ID.</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <tr>
                      <td style="padding-bottom:12px;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff; border:1px solid #e2e8f0; border-radius:10px;">
                          <tr>
                            <td width="52" style="padding:16px 0 16px 18px; font-size:22px; vertical-align:middle;">💳</td>
                            <td style="padding:16px 16px 16px 0;">
                              <p style="margin:0 0 3px; font-size:12px; color:#a0aec0; text-transform:uppercase; letter-spacing:0.5px;">Payment Card</p>
                              <p style="margin:0; font-size:13px; color:#4a5568; line-height:1.5;">Carry the same card used for booking. A security deposit will be held at pickup.</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <tr>
                      <td>
                        <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff; border:1px solid #e2e8f0; border-radius:10px;">
                          <tr>
                            <td width="52" style="padding:16px 0 16px 18px; font-size:22px; vertical-align:middle;">📄</td>
                            <td style="padding:16px 16px 16px 0;">
                              <p style="margin:0 0 3px; font-size:12px; color:#a0aec0; text-transform:uppercase; letter-spacing:0.5px;">This Confirmation</p>
                              <p style="margin:0; font-size:13px; color:#4a5568; line-height:1.5;">Show this email at the rental counter with booking ID: <strong style="color:#f0c040;">${bookingId}</strong></p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>

              <!-- ── CTA ── -->
              <tr>
                <td style="padding:28px 40px; text-align:center; border-top:1px solid #edf2f7;">
                  <a href="https://sunvenus.co.in/" style="display:inline-block; background:linear-gradient(135deg,#f0c040,#d4a017); color:#1a1a2e; font-size:14px; font-weight:700; letter-spacing:1px; text-transform:uppercase; text-decoration:none; padding:15px 48px; border-radius:50px;">
                    Manage My Booking
                  </a>
                  <p style="margin:14px 0 0; font-size:12px; color:#a0aec0;">Need to modify or cancel? You can do so up to 24 hours before pick-up at no charge.</p>
                </td>
              </tr>

              <!-- ── FOOTER ── -->
              <tr>
                <td style="background:#f8fafc; padding:24px 40px; text-align:center; border-top:1px solid #edf2f7;">
                  <p style="margin:0 0 10px; font-size:13px; color:#4a5568;">
                    <a href="#" style="color:#718096; text-decoration:none; margin:0 10px;">Help Center</a> |
                    <a href="#" style="color:#718096; text-decoration:none; margin:0 10px;">Privacy Policy</a> |
                    <a href="#" style="color:#718096; text-decoration:none; margin:0 10px;">Terms of Service</a>
                  </p>
                  <p style="margin:0; font-size:12px; color:#a0aec0; line-height:1.7;">
                    © ${new Date().getFullYear()} <strong style="color:#f0c040;">Sunvenus</strong> — Luxury Car Rentals<br/>
                    Prestige Tower, Bandra Kurla Complex, Mumbai, MH 400051<br/>
                    support@driveluxe.com · +91 1800 123 4567
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>

    </body>
    </html>
  `;
  return html;
};


module.exports = { contactFormTemplate, carRentalConfirmationTemplate };
