import nodemailer from 'nodemailer';

type MailResult = {
  sent: boolean;
  devCode?: string;
};

export async function sendLoginCode(email: string, code: string): Promise<MailResult> {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM || user;

  if (!host || !from) {
    return { sent: false, devCode: code };
  }

  const message = {
    from,
    to: email,
    subject: 'Portal SSO login code',
    text: `Your portal login code is ${code}. It expires in 10 minutes.`,
  };

  try {
    await createTransporter(host, port, user, pass).sendMail(message);
  } catch (error) {
    if (port === 465) {
      throw error;
    }

    await createTransporter(process.env.SMTP_SSL_HOST || host, 465, user, pass).sendMail(message);
  }

  return { sent: true };
}

function createTransporter(host: string, port: number, user?: string, pass?: string) {
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
    tls: {
      servername: process.env.SMTP_TLS_SERVERNAME || host,
    },
  });
}
