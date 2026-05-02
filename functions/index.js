const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Initialize Stripe with your newly provided Secret Key
const STRIPE_SECRET_KEY = "sk_test_51TS944Pmx7v25Gti6GCIMKiKfaEMHe16rJdS81qZv8tAR3hcvV2reOWc3m9ecPwegHm0UXJg1XRJ93bN5EwrkjMq00SWftbLBq".trim();
const stripe = require("stripe")(STRIPE_SECRET_KEY);

exports.createPaymentIntent = onRequest(async (req, res) => {
  try {
    const { amount, currency } = req.body;

    // Safety check for amount
    if (!amount || amount <= 0) {
      return res.status(400).send({ error: "A valid amount is required." });
    }

    // 1. Create a Customer
    const customer = await stripe.customers.create();

    // 2. Create Ephemeral Key for the mobile SDK
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: '2022-11-15' }
    );

    // 3. Create the Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency || 'pkr',
      customer: customer.id,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // 4. Return keys to the mobile app
    res.json({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
    });
    
  } catch (error) {
    logger.error("Stripe Error:", error);
    res.status(500).send({ error: error.message });
  }
});