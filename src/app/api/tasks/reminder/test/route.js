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

    console.log(`Attempting to send test email to: ${email}`);

    // Create a transporter using Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'trackitreminder@gmail.com',
        pass: 'sgihdozzfgqlcabb'  // App Password
      },
      debug: true, // Enable debug logs
      logger: true // Log to console
    });

    // Verify SMTP connection configuration
    console.log('Verifying SMTP connection...');
    const verification = await transporter.verify();
    console.log('SMTP Connection verified:', verification);

    // Send a test email
    console.log('Sending email...');
    const info = await transporter.sendMail({
      from: '"TrackIT Reminder" <trackitreminder@gmail.com>',
      to: email,
      subject: "Test Reminder from TrackIT",
      text: "This is a test email to verify that TrackIT reminders are working correctly.",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #333;">🔔 Test Reminder from TrackIT</h2>
          <p>This is a test email to verify that your reminder system is working correctly.</p>
          <p>If you received this email, your reminders are set up properly!</p>
          <div style="background-color: #f8f8f8; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <p style="margin: 0; color: #666;">This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `,
    });

    console.log('Email sent successfully:', info);
    console.log('Message ID:', info.messageId);

    // Return success response (no preview URL for real emails)
    return NextResponse.json({
      message: 'Test email sent successfully',
      emailSentTo: email,
      messageId: info.messageId
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    
    // More detailed error response
    return NextResponse.json(
      { 
        error: 'Failed to send test email',
        details: error.message,
        stack: error.stack,
        name: error.name
      },
      { status: 500 }
    );
  }
} 