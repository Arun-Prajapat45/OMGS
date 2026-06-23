import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.SMTP_FROM || 'Adore Prints <noreply@adoreprints.in>',
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('Resend API error:', JSON.stringify(error));
      return { success: false, error: error.message || JSON.stringify(error) };
    }

    console.log('Email sent successfully:', data?.id);
    return { success: true, id: data?.id };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};
