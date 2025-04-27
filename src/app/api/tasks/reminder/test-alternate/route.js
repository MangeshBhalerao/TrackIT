import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    console.log(`[Alternative Method] Attempting to send test email to: ${email}`);

    // Create a transporter using Gmail with different configuration
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // Use SSL
      auth: {
        user: 'trackitreminder@gmail.com',
        pass: 'sgihdozzfgqlcabb'  // App Password
      },
      tls: {
        rejectUnauthorized: false // Accept all certificates (development only)
      }
    });

    // Verify connection
    try {
      await transporter.verify();
      console.log('SMTP connection verified');
    } catch (verifyError) {
      console.error('SMTP verification failed:', verifyError);
      return NextResponse.json(
        { error: 'SMTP verification failed', details: verifyError.message },
        { status: 500 }
      );
    }

    // Send a test email
    console.log('Sending email via alternative method...');
    const info = await transporter.sendMail({
      from: '"TrackIT Reminder" <trackitreminder@gmail.com>',
      to: email,
      subject: "Test Reminder from TrackIT (Alternative Method)",
      text: "This is a test email to verify that TrackIT reminders are working correctly using an alternative method.",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #333;">🔔 Test Reminder from TrackIT</h2>
          <p>This is a test email to verify that your reminder system is working correctly.</p>
          <p>This email was sent using an alternative configuration method.</p>
          <p>If you received this email, your reminders are set up properly!</p>
          <div style="background-color: #f8f8f8; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <p style="margin: 0; color: #666;">This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `,
    });

    console.log('Email sent successfully:', info);

    // Return success response
    return NextResponse.json({
      message: 'Test email sent successfully (alternative method)',
      emailSentTo: email,
      messageId: info.messageId
    });
  } catch (error) {
    console.error('Error sending test email (alternative method):', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to send test email (alternative method)',
        details: error.message,
        name: error.name
      },
      { status: 500 }
    );
  }
} 