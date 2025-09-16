import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Email configuration
const createTransporter = () => {
    // For development - using Gmail SMTP
    // For production, you can switch to SendGrid, Mailgun, or AWS SES
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER || 'your-email@gmail.com',
            pass: process.env.EMAIL_PASSWORD || 'your-app-password'
        }
    });
};

// Generate verification token
export const generateVerificationToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Send verification email
export const sendVerificationEmail = async (email, verificationToken, userName) => {
    try {
        const transporter = createTransporter();
        
        // Create verification URL - point to backend API route
        const backendUrl = process.env.BACKEND_URL || 'https://demak-ventures.onrender.com';
        const verificationUrl = `${backendUrl}/api/v1/auth/verify?token=${verificationToken}`;
        
        const mailOptions = {
            from: 'Demak Ventures <noreply@demakventures.com>',
            to: email,
            subject: 'Verify Your Account - Demak Ventures',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333; text-align: center;">Welcome to Demak Ventures!</h2>
                    <p>Hi ${userName},</p>
                    <p>Thank you for signing up! Please verify your email address to complete your registration and start shopping with us.</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationUrl}" 
                           style="background-color: #007bff; color: white; padding: 12px 30px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block;">
                            Verify Email Address
                        </a>
                    </div>
                    
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
                    
                    <p>This link will expire in 24 hours for security reasons.</p>
                    
                    <p>If you didn't create an account, please ignore this email.</p>
                    
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                    <p style="color: #666; font-size: 12px;">
                        This is an automated message from Demak Ventures. Please do not reply to this email.
                    </p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Verification email sent successfully');
        return true;
    } catch (error) {
        console.error('Error sending verification email:', error);
        return false;
    }
};

// Send password reset email (bonus feature)
export const sendPasswordResetEmail = async (email, resetToken, userName) => {
    try {
        const transporter = createTransporter();
        
        // Create password reset URL - point to frontend reset password page
        const frontendUrl = process.env.FRONTEND_URL || 'https://demakgh.com';
        const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
        
        const mailOptions = {
            from: 'Demak Ventures <noreply@demakventures.com>',
            to: email,
            subject: 'Password Reset - Demak Ventures',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
                    <p>Hi ${userName},</p>
                    <p>We received a request to reset your password. Click the button below to reset your password:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" 
                           style="background-color: #dc3545; color: white; padding: 12px 30px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block;">
                            Reset Password
                        </a>
                    </div>
                    
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="color: #666; word-break: break-all;">${resetUrl}</p>
                    
                    <p>This link will expire in 1 hour for security reasons.</p>
                    
                    <p>If you didn't request a password reset, please ignore this email.</p>
                    
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                    <p style="color: #666; font-size: 12px;">
                        This is an automated message from Demak Ventures. Please do not reply to this email.
                    </p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Password reset email sent successfully');
        return true;
    } catch (error) {
        console.error('Error sending password reset email:', error);
        return false;
    }
};
