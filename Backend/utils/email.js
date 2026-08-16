const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

async function sendResetPasswordEmail(to, fullName, resetUrl) {
    await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject: "Yêu cầu đặt lại mật khẩu - SH MART",
        html: `
            <p>Xin chào ${fullName},</p>
            <p>Bạn (hoặc ai đó) vừa yêu cầu đặt lại mật khẩu cho tài khoản SH MART.</p>
            <p>Nhấn vào liên kết dưới đây để đặt mật khẩu mới (có hiệu lực trong 15 phút):</p>
            <p><a href="${resetUrl}">${resetUrl}</a></p>
            <p>Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.</p>
        `,
    });
}

module.exports = { sendResetPasswordEmail };