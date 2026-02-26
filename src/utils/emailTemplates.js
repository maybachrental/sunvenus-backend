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

module.exports = { contactFormTemplate };
