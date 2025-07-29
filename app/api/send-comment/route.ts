import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  const { subject, message } = await req.json();

  const transporter = nodemailer.createTransport({
    host: 'mail2.vru.ac.ir',
    port: 587,
    secure: false,
    auth: {
      user: 'comments@vru.ac.ir',
      pass: process.env.EMAIL_HOST_PASSWORD || '', // Set this in .env.local
    },
    tls: {
      rejectUnauthorized: false, // Use with caution
    },
  });

  try {
    await transporter.sendMail({
      from: '"پیشنهادات" <comments@vru.ac.ir>',
      to: ['m.jafari@tordilla.ir', 'h.vosoughi@tordilla.ir'],
      bcc: 'mojtaba.sabbagh@tordilla.ir',
      subject: subject,
      text: message,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    return NextResponse.json({ success: false, error: 'Email failed' }, { status: 500 });
  }
}
