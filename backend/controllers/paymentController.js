
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const paymentOrder = async (req, res) => {
  const { amount } = req.body;

  // Step 1: Validate amount (in paise)
  if (!Number.isInteger(amount) || amount < 1) {
    return res.status(400).json({
      success: false,
      message: "A valid amount in paise is required.",
    });
  }

  try {
    // Step 2: Create PaymentIntent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "inr",
      description: "ShopNest ecommerce product order",
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Step 3: Validate Stripe response
    if (
      !paymentIntent ||
      !paymentIntent.id ||
      !paymentIntent.client_secret
    ) {
      return res.status(502).json({
        success: false,
        message: "Invalid response received from Stripe.",
      });
    }

    // Step 4: Return PaymentIntent details to frontend
    return res.status(200).json({
      success: true,
      message: "Payment initialized successfully.",
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      paymentStatus: paymentIntent.status,
    });
  } catch (error) {
    // Step 5: Handle Stripe errors
    console.error("Stripe payment failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Payment initialization failed.",
    });
  }
};

module.exports = { paymentOrder };
