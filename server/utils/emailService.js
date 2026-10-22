import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

/**
 * Brevo (formerly Sendinblue) Transactional Email Service for VidyaNest
 * Powered by Brevo v3 Transactional Email REST API with Nodemailer fallback
 */

const sendViaNodemailer = async ({ toEmail, toName, subject, htmlContent, senderEmail, senderName, pass }) => {
  console.log(`📡 [Nodemailer Fallback] Sending email to ${toEmail} via Gmail SMTP...`);
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: senderEmail,
      pass: pass
    }
  });

  const info = await transporter.sendMail({
    from: `"${senderName}" <${senderEmail}>`,
    to: toName ? `"${toName}" <${toEmail}>` : toEmail,
    subject,
    html: htmlContent
  });

  console.log(`✓ [Nodemailer] Email successfully delivered to ${toEmail}. Message ID: ${info.messageId}`);
  return {
    success: true,
    messageId: info.messageId
  };
};

export const sendBrevoEmail = async ({ toEmail, toName, subject, htmlContent }) => {
  // Dynamically load latest environment variables from .env
  dotenv.config();

  const apiKey = (process.env.BREVO_API_KEY || '').trim();
  const senderEmail = (process.env.BREVO_SENDER_EMAIL || '').trim();
  const senderName = (process.env.BREVO_SENDER_NAME || 'VidyaNest').trim();
  const gmailAppPass = (process.env.GMAIL_APP_PASSWORD || '').trim();

  // Try Brevo first if API key is provided
  if (apiKey && !apiKey.includes('your_brevo_api_key')) {
    console.log(`📡 [Brevo API] Sending email to ${toEmail} via Brevo REST API v3...`);
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': apiKey,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: {
            name: senderName,
            email: senderEmail
          },
          to: [
            {
              email: toEmail.toLowerCase().trim(),
              name: toName || toEmail
            }
          ],
          subject,
          htmlContent
        })
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        console.log(`✓ [Brevo] Real email successfully delivered to ${toEmail}. Message ID: ${data.messageId || 'OK'}`);
        return {
          success: true,
          messageId: data.messageId
        };
      }

      console.error(`❌ [Brevo API Error ${response.status}]:`, data);

      // If Gmail App Password is provided, failover immediately
      if (gmailAppPass) {
        console.warn('⚠️ Brevo API failed. Switching to Gmail SMTP fallback...');
        return await sendViaNodemailer({ toEmail, toName, subject, htmlContent, senderEmail, senderName, pass: gmailAppPass });
      }

      // Handle Brevo's IP whitelist security restriction
      if (data.message && data.message.includes('unrecognised IP address')) {
        const ipMatch = data.message.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/);
        const blockedIp = ipMatch ? ipMatch[0] : 'your IP address';
        throw new Error(
          `Brevo IP Security Block: Brevo detected an unrecognised IP address (${blockedIp}). Please check the authorization email sent by Brevo to ${senderEmail} or visit https://app.brevo.com/security/authorised_ips to add IP ${blockedIp}.`
        );
      }

      const errorMsg = data.message || `Brevo HTTP error ${response.status}: ${response.statusText}`;
      throw new Error(errorMsg);
    } catch (err) {
      if (gmailAppPass) {
        console.warn('⚠️ Brevo error. Switching to Gmail SMTP fallback...');
        return await sendViaNodemailer({ toEmail, toName, subject, htmlContent, senderEmail, senderName, pass: gmailAppPass });
      }
      throw err;
    }
  }

  // If no Brevo API key, check if Gmail App Password is configured
  if (gmailAppPass && senderEmail) {
    return await sendViaNodemailer({ toEmail, toName, subject, htmlContent, senderEmail, senderName, pass: gmailAppPass });
  }

  console.error('❌ [Email Service] No valid email service configured in server/.env');
  throw new Error('Email service configuration error: BREVO_API_KEY is missing in server/.env. Please configure your Brevo API key.');
};

/**
 * Generate a modern, branded VidyaNest HTML template for Email OTPs
 */
function getEmailTemplate({ title, greeting, subtitle, otp, warningText, buttonLabel = null }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f5f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2d2a26;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f5f0; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 540px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e7e3dc;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #2b3a4a 0%, #1e2832 100%); padding: 32px 30px; text-align: center;">
              <h1 style="margin: 0; font-family: Georgia, serif; font-size: 26px; color: #ffffff; letter-spacing: 0.5px;">
                Vidya<span style="color: #e07a5f;">Nest</span>
              </h1>
              <p style="margin: 6px 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #d1d5db; font-weight: 600;">
                Trusted In-Home Tuition Network
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 32px 28px;">
              <h2 style="margin: 0 0 12px; font-size: 20px; font-weight: 700; color: #1e2832;">
                ${title}
              </h2>
              
              <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #57534e;">
                ${greeting}
              </p>

              <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #57534e;">
                ${subtitle}
              </p>

              <!-- OTP Code Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0 26px;">
                <tr>
                  <td align="center" style="background: #faf7f2; border: 2px dashed #e07a5f; border-radius: 14px; padding: 22px;">
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #8c827a; margin-bottom: 8px;">
                      Your One-Time Verification Code
                    </div>
                    <div style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; color: #2b3a4a; letter-spacing: 8px;">
                      ${otp}
                    </div>
                    <div style="font-size: 12px; color: #e07a5f; margin-top: 8px; font-weight: 600;">
                      ⏳ Valid for 10 minutes only
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Warning Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px; padding: 12px 14px; margin-bottom: 24px;">
                <tr>
                  <td style="font-size: 12px; color: #92400e; line-height: 1.5;">
                    <strong>Security Notice:</strong> ${warningText}
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 13px; color: #78716c; line-height: 1.5;">
                If you did not request this verification code, please ignore this email or contact support immediately.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f7f5f0; padding: 20px 32px; text-align: center; border-top: 1px solid #e7e3dc;">
              <p style="margin: 0 0 4px; font-size: 12px; color: #78716c;">
                © 2026 VidyaNest Education Technologies Pvt. Ltd.
              </p>
              <p style="margin: 0; font-size: 11px; color: #a8a29e;">
                Sector 62, Noida, Uttar Pradesh 201309 | India
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
}

/**
 * Send OTP for New User Registration
 */
export const sendRegistrationOtpEmail = async ({ email, name, otp }) => {
  const htmlContent = getEmailTemplate({
    title: 'Verify Your Email Address',
    greeting: `Hello ${name || 'Learner / Educator'},`,
    subtitle: 'Thank you for signing up with VidyaNest. To verify your email and complete your registration, please enter the one-time password (OTP) below:',
    otp,
    warningText: 'Never share this code with anyone. VidyaNest staff will never ask for your verification code.'
  });

  return await sendBrevoEmail({
    toEmail: email,
    toName: name || 'VidyaNest User',
    subject: `${otp} is your VidyaNest registration code`,
    htmlContent
  });
};

/**
 * Send OTP for Password Reset
 */
export const sendPasswordResetOtpEmail = async ({ email, name, otp }) => {
  const htmlContent = getEmailTemplate({
    title: 'Reset Your Account Password',
    greeting: `Hello ${name || 'VidyaNest Member'},`,
    subtitle: 'We received a request to reset the password for your VidyaNest account. Please use the verification code below to set a new password:',
    otp,
    warningText: 'If you did not initiate this password reset, please secure your email account immediately. This OTP cannot be used once expired.'
  });

  return await sendBrevoEmail({
    toEmail: email,
    toName: name || 'VidyaNest User',
    subject: `${otp} is your VidyaNest password reset code`,
    htmlContent
  });
};
