import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Load biến môi trường
dotenv.config();

// Cấu hình SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // STARTTLS
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // Bỏ kiểm tra chứng chỉ SSL
  },
});

// Kiểm tra kết nối SMTP
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Connection Error:", error);
  } else {
    console.log("SMTP Connected Successfully!");
  }
});

// Hàm gửi email
export const sendMail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      // from: `"Note" <${process.env.SMTP_USER}>`,
      // from: `"Note" <${process.env.SMTP_FROM}>`,
      from: `"Note" <info@services.com>`,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error(`❌ Error sending email:`, error);
  }
};
