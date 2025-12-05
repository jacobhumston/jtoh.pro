/**
 * This module manages email.
 *
 * Authored by Jacob Humston
 */
import nodemailer from 'nodemailer';

import apiTokens from './tokens';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: apiTokens.emailAddress,
        pass: apiTokens.emailPassword
    }
});

/**
 * Send an email message to an address.
 * @param to The email address to send the message to.
 * @param subject The subject of this message.
 * @param message The message to send.
 */
export async function sendEmail(to: string, subject: string, message: string) {
    return await transporter.sendMail({
        to,
        from: 'noreply@jtoh.pro "jtoh.pro"',
        subject,
        text: `${message}\n\n\nThis email was sent automatically, replies to this address will not be received.\nIf you have any inquiries, please contact us at contact@jtoh.pro`
    });
}
