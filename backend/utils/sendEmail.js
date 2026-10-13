const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ email, type, message }) => {
  console.log("Recipient:", email);
  console.log("Subject:", type);

  try {
    const { data, error } = await resend.emails.send({
      from: "ShopNest <onboarding@resend.dev>",
      to: [email],
      subject: type,
      html: message,
    });

    if (error) {
      console.error("Resend error:", error);
      throw new Error(error.message);
    }

    console.log("Resend response:", data);
    return data;
  } catch (error) {
    console.error("Email failed:", error.message);
    throw error;
  }
};

module.exports = sendEmail;
