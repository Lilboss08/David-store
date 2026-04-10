import nodemailer from 'nodemailer';

export const sendVerificationEmail = async (to, token) => {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME || process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS,
      },
    });

    if (!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD)
        throw new Error('Email sender not configured. Set EMAIL_USERNAME and EMAIL_PASSWORD in .env.');

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const verificationLink = `${frontendUrl}/verify-email?token=${encodeURIComponent(token)}`;

    const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USERNAME || process.env.EMAIL_USER,
        to,
        subject: 'Verify Your Email Address',
        html: `<p>Thank you for registering! Please click the link below to verify your email address:</p>
               <a href="${verificationLink}">Verify Email</a>
               <p>If you did not create an account, please ignore this email.</p>`,
    };

    try {
        const result = await transporter.sendMail(mailOptions);
        console.log(`verification email sent to ${to}: messageId: ${result.messageId}`);
        return result;
    } catch (error) {
        console.error(`Error sending verification email to ${to}:`, error);
        throw error;
    }
};

export default sendVerificationEmail;
