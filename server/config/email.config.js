import nodemailer from "nodemailer";
import envConfig from "./env.config.js";

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: envConfig.EMAIL_HOST,
  port: envConfig.EMAIL_PORT,
  secure: true, // true for 465, false for other ports
  auth: {
    user: envConfig.EMAIL_USER,
    pass: envConfig.EMAIL_PASS,
  },
});

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("Email configuration error:", error);
  } else {
    console.log("Email server is ready to take our messages");
  }
});

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken, firstName = '') => {
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"SAT Platform" <${envConfig.EMAIL_USER}>`,
    to: email,
    subject: "Password Reset Request - SAT Platform",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background-color: #fff3cd; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>SAT Teaching Platform</h1>
            <p>Password Reset Request</p>
          </div>
          <div class="content">
            <h2>Hello ${firstName ? firstName : 'Student'},</h2>
            <p>We received a request to reset your password for your SAT Platform account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #2563eb;">${resetUrl}</p>
            <div class="warning">
              <strong>Important:</strong>
              <ul>
                <li>This link will expire in 1 hour</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Your password will remain unchanged until you create a new one</li>
              </ul>
            </div>
            <p>If you continue to have problems, please contact support.</p>
          </div>
          <div class="footer">
            <p>Best regards,<br>SAT Teaching Platform Team</p>
            <p>© ${new Date().getFullYear()} SAT Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Hello ${firstName ? firstName : 'Student'},

      We received a request to reset your password for your SAT Platform account.

      Please click the following link to reset your password:
      ${resetUrl}

      Important:
      - This link will expire in 1 hour
      - If you didn't request this reset, please ignore this email
      - Your password will remain unchanged until you create a new one

      If you continue to have problems, please contact support.

      Best regards,
      SAT Teaching Platform Team
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Password reset email sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return { success: false, error: error.message };
  }
};

// Send password change confirmation email
export const sendPasswordChangeConfirmation = async (email, firstName = '') => {
  const mailOptions = {
    from: `"SAT Platform" <${envConfig.EMAIL_USER}>`,
    to: email,
    subject: "Password Changed Successfully - SAT Platform",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Changed</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .alert { background-color: #fef3c7; color: #92400e; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>SAT Teaching Platform</h1>
            <p>Password Successfully Changed</p>
          </div>
          <div class="content">
            <h2>Hello ${firstName ? firstName : 'Student'},</h2>
            <p>Your password has been successfully changed for your SAT Platform account.</p>
            <p>This change was made on ${new Date().toLocaleString()}.</p>
            <div class="alert">
              <strong>Security Notice:</strong><br>
              If you did not make this change, please contact support immediately and secure your account.
            </div>
            <p>You can now log in with your new password.</p>
          </div>
          <div class="footer">
            <p>Best regards,<br>SAT Teaching Platform Team</p>
            <p>© ${new Date().getFullYear()} SAT Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Hello ${firstName ? firstName : 'Student'},

      Your password has been successfully changed for your SAT Platform account.

      This change was made on ${new Date().toLocaleString()}.

      Security Notice: If you did not make this change, please contact support immediately and secure your account.

      You can now log in with your new password.

      Best regards,
      SAT Teaching Platform Team
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Password change confirmation email sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending password change confirmation email:", error);
    return { success: false, error: error.message };
  }
};

export default transporter;