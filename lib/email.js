import nodemailer from "nodemailer";

// Create transporter for Mailtrap
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 2525,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
});
// Verify transporter configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("Email transporter verification failed:", error);
  } else {
    console.log("Email server is ready to take our messages");
  }
});

export async function sendVerificationEmail(to, username, token) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/verify-email?token=${token}`;

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || "E-Learning Platform"}" <${process.env.SMTP_USER}>`,
    to,
    subject: "Verify your email address",
    text: `Hello ${username},\n\nPlease verify your email address by clicking on the link below:\n\n${verificationUrl}\n\nThis link will expire in 24 hours.\n\nThank you,\nThe Team`,
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #011C2D; padding: 20px; text-align: center;">
          <h1 style="color: #F5F7F4; margin: 0; font-size: 24px;">Email Verification</h1>
        </div>
        
        <div style="background-color: #F5F7F4; padding: 30px; border-left: 4px solid #B42C51;">
          <h2 style="color: #011C2D; margin-top: 0;">Hello ${username},</h2>
          <p style="color: #011C2D; line-height: 1.6;">Thank you for signing up! Please verify your email address by clicking the button below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #B42C51; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Verify My Email
            </a>
          </div>
          
          <p style="color: #011C2D; line-height: 1.6;">Or copy and paste this link in your browser:</p>
          <p style="color: #B42C51; word-break: break-all;"><a href="${verificationUrl}" style="color: #B42C51;">${verificationUrl}</a></p>
          
          <div style="margin-top: 30px; padding: 15px; background-color: #fff; border-left: 4px solid #D5BA90;">
            <p style="color: #011C2D; margin: 0; font-size: 14px;"><strong>Important:</strong> This link will expire in 24 hours.</p>
          </div>
        </div>
        
        <div style="background-color: #011C2D; padding: 20px; text-align: center;">
          <p style="color: #F5F7F4; margin: 0; font-size: 14px;">
            Thank you,<br/>
            The E-Learning Platform Team
          </p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Verification email sent successfully:", info.messageId);
    console.log(info);
    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
}

export async function sendWelcomeEmail(to, username) {
  const dashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`;

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || "E-Learning Platform"}" <${process.env.SMTP_USER}>`,
    to,
    subject: "Welcome to our E-Learning Platform!",
    text: `Hello ${username},\n\nWelcome to our E-Learning Platform! We are excited to have you on board.\n\nYour account is now active and you can start exploring our courses.\n\nVisit your dashboard: ${dashboardUrl}\n\nThank you,\nThe Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #011C2D; padding: 20px; text-align: center;">
          <h1 style="color: #F5F7F4; margin: 0; font-size: 24px;">Welcome!</h1>
        </div>
        
        <div style="background-color: #F5F7F4; padding: 30px; border-left: 4px solid #B42C51;">
          <h2 style="color: #011C2D; margin-top: 0;">Hello ${username},</h2>
          <p style="color: #011C2D; line-height: 1.6;">Welcome to our E-Learning Platform! We're thrilled to have you join our community of learners.</p>
          
          <p style="color: #011C2D; line-height: 1.6;">Your email has been verified and your account is now active. You can start exploring our courses and begin your learning journey!</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardUrl}" style="background-color: #B42C51; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Go to Dashboard
            </a>
          </div>
          
          <div style="margin-top: 30px; padding: 15px; background-color: #fff; border-left: 4px solid #D5BA90;">
            <h3 style="color: #011C2D; margin-top: 0;">What's next?</h3>
            <ul style="color: #011C2D; margin: 0;">
              <li>Browse our course catalog</li>
              <li>Complete your profile</li>
              <li>Start your first course</li>
            </ul>
          </div>
        </div>
        
        <div style="background-color: #011C2D; padding: 20px; text-align: center;">
          <p style="color: #F5F7F4; margin: 0; font-size: 14px;">
            Thank you,<br/>
            The E-Learning Platform Team
          </p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Welcome email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw error;
  }
}

// Test email function for development
export async function sendTestEmail(to) {
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || "E-Learning Platform"}" <${process.env.SMTP_USER}>`,
    to,
    subject: "Test Email from E-Learning Platform",
    text: "This is a test email to verify your email configuration is working correctly.",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Email Configuration Test</h2>
        <p>If you're receiving this email, your Mailchimp/Mandrill configuration is working correctly!</p>
        <p>Sent at: ${new Date().toISOString()}</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Test email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending test email:", error);
    return { success: false, error: error.message };
  }
}
