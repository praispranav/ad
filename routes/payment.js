const Stripe = require("stripe");

const express = require("express");
const app = express.Router();
const bodyParser = require("body-parser");
const axios = require("axios");
var mongoose = require("mongoose");
const Cart = require("../schema/cart");
const config = require("../config/keys");
const Product = require("../schema/categories");
const jwt = require("jsonwebtoken");
const privateKey = config.privateKey;
const Users = require("../schema/user");
const Subscriptions = require("../schema/subscriptions");

// app.use((req, res, next) => {
//   if (req.originalUrl === "/webhook") {
//     next();
//   } else {
//     bodyParser.json()(req, res, next);
//   }
// });

const tokenVerify = (token) => {
  return new Promise((resolve, rejects) => {
    jwt.verify(token, privateKey, function (err, decoded) {
      if (decoded) {
        console.log(decoded);
        resolve(decoded);
      } else {
        rejects(err);
      }
      // err
      // decoded undefined
    });
  });
};

const cart = async (token) => {
  try {
    const user = await tokenVerify(token);
    if (user.data._id) {
      const originalUserData = await Users.findOne({ _id: user.data._id });
      console.log(originalUserData);
      const result = await Cart.find({
        userId: user.data._id,
      });
      console.log(result);
      const productIds = new Array();
      result.forEach((item) => {
        productIds.push(mongoose.Types.ObjectId(item.productId));
      });
      const getRequiredProducts = await Product.find({
        _id: { $in: productIds },
      });
      const productById = new Array();
      getRequiredProducts.forEach((item) => (productById[item._id] = item));

      const cartWithProduct = result.map((item) => {
        const product = productById[item.productId];
        const obj = {
          _id: item._id,
          productId: product._id,
          userId: item.userId,
          selectedQuantity: item.selectedQuantity,
          name: product.name,
          availableQuantity: product.availableQuantity,
          initialQuantity: product.initialQuantity,
          price: product.price,
          priceUnit: product.priceUnit,
          subscription: product.subscription,
          discount: product.discount,
          category: product.category,
          status: product.status,
          description: product.description,
        };
        return obj;
      });
      let totalPrice = 0;
      cartWithProduct.forEach((item) => {
        const price =
          item.price -
          (item.price / 100) * (item.discount > 0 ? item.discount : 0);
        const localTotalPrice = price * item.selectedQuantity;
        totalPrice += localTotalPrice;
      });

      return {
        data: cartWithProduct,
        total: totalPrice,
        email: user.data.email,
        cust: originalUserData.customerId,
      };
    } else {
      return { message: "Cart Empty" };
    }
  } catch (error) {
    console.log(error);
    return { message: "Unauthorised User" };
  }
};

const stripePublishableKey =
  "pk_test_51JNw4SSG7fBqR4Ou7Smol8pSTavdAKpz4QpYC9Q2K3uWmQLdTNhD6YmZOF81IYZuYMYaAHHwwEC6QbxwRQTWFzI800BJChd9ny";
const stripeSecretKey =
  "sk_test_51JNw4SSG7fBqR4OuH9iixBz6foy3MqDD3scaaoT5mXIZXlrkYk5clSe46iZUtMyJhih32icB7WTzpBgWUUG1ZntG00IR3TjNny";
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
app.get("/", (req, res) => {
  res.send({ "Welome to": "Expo's Stripe example server!" });
});

const calculateOrderAmount = (_order) => {
  // Calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client.
  return 1400;
};

function getKeys(payment_method) {
  let secret_key = stripeSecretKey;
  let publishable_key = stripePublishableKey;

  switch (payment_method) {
    case "grabpay":
    case "fpx":
      publishable_key = stripePublishableKey;
      secret_key = stripeSecretKey;
      break;
    case "au_becs_debit":
      publishable_key = stripePublishableKey;
      secret_key = stripeSecretKey;
      break;
    case "oxxo":
      publishable_key = stripePublishableKey;
      secret_key = stripeSecretKey;
      break;
    default:
      publishable_key = stripePublishableKey;
      secret_key = stripeSecretKey;
  }

  return { secret_key, publishable_key };
}

app.get("/stripe-key", (req, res) => {
  const { publishable_key } = getKeys(req.query.paymentMethod);

  res.send({ publishableKey: stripePublishableKey });
});

app.post("/create-payment-intent", async (req, res) => {
  const {
    email,
    items,
    currency,
    request_three_d_secure,
    payment_method_types = [],
  } = req.body;

  const { secret_key } = getKeys(payment_method_types[0]);

  const stripe = new Stripe(secret_key, {
    apiVersion: "2020-08-27",
    typescript: true,
  });

  const customer = await stripe.customers.create({ email });
  // Create a PaymentIntent with the order amount and currency.
  const params = {
    amount: calculateOrderAmount(items),
    currency,
    customer: customer.id,
    payment_method_options: {
      card: {
        request_three_d_secure: request_three_d_secure || "automatic",
      },
      sofort: {
        preferred_language: "en",
      },
    },
    payment_method_types: payment_method_types,
  };

  try {
    const paymentIntent = await stripe.paymentIntents.create(params);
    // Send publishable key and PaymentIntent client_secret to client.
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.send({
      error: error.raw.message,
    });
  }
});

app.post("/create-payment-intent-with-payment-method", async (req, res) => {
  const { items, currency, request_three_d_secure, email } = req.body;
  const { secret_key } = getKeys();

  const stripe = new Stripe(secret_key, {
    apiVersion: "2020-08-27",
    typescript: true,
  });
  const customers = await stripe.customers.list({
    email,
  });

  // The list all Customers endpoint can return multiple customers that share the same email address.
  // For this example we're taking the first returned customer but in a production integration
  // you should make sure that you have the right Customer.
  if (!customers.data[0]) {
    res.send({
      error: "There is no associated customer object to the provided e-mail",
    });
  }
  // List the customer's payment methods to find one to charge
  const paymentMethods = await stripe.paymentMethods.list({
    customer: customers.data[0].id,
    type: "card",
  });

  if (!paymentMethods.data[0]) {
    res.send({
      error: `There is no associated payment method to the provided customer's e-mail`,
    });
  }

  const params = {
    amount: calculateOrderAmount(items),
    currency,
    payment_method_options: {
      card: {
        request_three_d_secure: request_three_d_secure || "automatic",
      },
    },
    payment_method: paymentMethods.data[0].id,
    customer: customers.data[0].id,
  };

  const paymentIntent = await stripe.paymentIntents.create(params);

  // Send publishable key and PaymentIntent client_secret to client.
  res.send({
    clientSecret: paymentIntent.client_secret,
    paymentMethodId: paymentMethods.data[0].id,
  });
});

app.post("/pay-without-webhooks", async (req, res) => {
  const {
    paymentMethodId,
    paymentIntentId,
    items,
    currency,
    useStripeSdk,
    cvcToken,
    email,
  } = req.body;

  const orderAmount = calculateOrderAmount(items);
  const { secret_key } = getKeys();

  const stripe = new Stripe(secret_key, {
    apiVersion: "2020-08-27",
    typescript: true,
  });

  try {
    if (cvcToken && email) {
      const customers = await stripe.customers.list({
        email,
      });

      // The list all Customers endpoint can return multiple customers that share the same email address.
      // For this example we're taking the first returned customer but in a production integration
      // you should make sure that you have the right Customer.
      if (!customers.data[0]) {
        res.send({
          error:
            "There is no associated customer object to the provided e-mail",
        });
      }

      const paymentMethods = await stripe.paymentMethods.list({
        customer: customers.data[0].id,
        type: "card",
      });

      if (!paymentMethods.data[0]) {
        res.send({
          error: `There is no associated payment method to the provided customer's e-mail`,
        });
      }

      const params = {
        amount: orderAmount,
        confirm: true,
        confirmation_method: "manual",
        currency,
        payment_method: paymentMethods.data[0].id,
        payment_method_options: {
          card: {
            cvc_token: cvcToken,
          },
        },
        use_stripe_sdk: useStripeSdk,
        customer: customers.data[0].id,
      };
      const intent = await stripe.paymentIntents.create(params);
      res.send(generateResponse(intent));
    } else if (paymentMethodId) {
      // Create new PaymentIntent with a PaymentMethod ID from the client.
      const params = {
        amount: orderAmount,
        confirm: true,
        confirmation_method: "manual",
        currency,
        payment_method: paymentMethodId,
        // If a mobile client passes `useStripeSdk`, set `use_stripe_sdk=true`
        // to take advantage of new authentication features in mobile SDKs.
        use_stripe_sdk: useStripeSdk,
      };
      const intent = await stripe.paymentIntents.create(params);
      // After create, if the PaymentIntent's status is succeeded, fulfill the order.
      res.send(generateResponse(intent));
    } else if (paymentIntentId) {
      // Confirm the PaymentIntent to finalize payment after handling a required action
      // on the client.
      const intent = await stripe.paymentIntents.confirm(paymentIntentId);
      // After confirm, if the PaymentIntent's status is succeeded, fulfill the order.
      res.send(generateResponse(intent));
    }
  } catch (e) {
    // Handle "hard declines" e.g. insufficient funds, expired card, etc
    // See https://stripe.com/docs/declines/codes for more.
    res.send({ error: e.message });
  }
});

app.post("/create-setup-intent", async (req, res) => {
  const { email, payment_method_types = [] } = req.body;
  const { secret_key } = getKeys(payment_method_types[0]);

  const stripe = new Stripe(secret_key, {
    apiVersion: "2020-08-27",
    typescript: true,
  });
  const customer = await stripe.customers.create({ email });
  const setupIntent = await stripe.setupIntents.create({
    customer: customer.id,
    payment_method_types,
  });

  // Send publishable key and SetupIntent details to client
  res.send({
    publishableKey: stripePublishableKey,
    clientSecret: setupIntent.client_secret,
  });
});

// Expose a endpoint as a webhook handler for asynchronous events.
// Configure your webhook in the stripe developer dashboard:
// https://dashboard.stripe.com/test/webhooks
app.post(
  "/webhook",
  // Use body-parser to retrieve the raw body as a buffer.
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event;
    const { secret_key } = getKeys();

    const stripe = new Stripe(secret_key, {
      apiVersion: "2020-08-27",
      typescript: true,
    });
    // console.log('webhook!', req);
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        req.headers["stripe-signature"] || [],
        stripeWebhookSecret
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`);
      res.sendStatus(400);
      return;
    }

    // Extract the data from the event.
    const data = event.data;
    const eventType = event.type;

    if (eventType === "payment_intent.succeeded") {
      // Cast the event into a PaymentIntent to make use of the types.
      const pi = data.object;

      // Funds have been captured
      // Fulfill any orders, e-mail receipts, etc
      // To cancel the payment after capture you will need to issue a Refund (https://stripe.com/docs/api/refunds).
      console.log(`🔔  Webhook received: ${pi.object} ${pi.status}!`);
      console.log("💰 Payment captured!");
    }
    if (eventType === "payment_intent.payment_failed") {
      // Cast the event into a PaymentIntent to make use of the types.
      const pi = data.object;
      console.log(`🔔  Webhook received: ${pi.object} ${pi.status}!`);
      console.log("❌ Payment failed.");
    }

    if (eventType === "setup_intent.setup_failed") {
      console.log(`🔔  A SetupIntent has failed the to setup a PaymentMethod.`);
    }

    if (eventType === "setup_intent.succeeded") {
      console.log(
        `🔔  A SetupIntent has successfully setup a PaymentMethod for future use.`
      );
    }

    if (eventType === "setup_intent.created") {
      const setupIntent = data.object;
      console.log(`🔔  A new SetupIntent is created. ${setupIntent.id}`);
    }

    res.sendStatus(200);
  }
);

// An endpoint to charge a saved card
// In your application you may want a cron job / other internal process
app.post("/charge-card-off-session", async (req, res) => {
  let paymentIntent, customer;

  const { secret_key } = getKeys();

  const stripe = new Stripe(secret_key, {
    apiVersion: "2020-08-27",
    typescript: true,
  });

  try {
    // You need to attach the PaymentMethod to a Customer in order to reuse
    // Since we are using test cards, create a new Customer here
    // You would do this in your payment flow that saves cards
    customer = await stripe.customers.list({
      email: req.body.email,
    });

    // List the customer's payment methods to find one to charge
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customer.data[0].id,
      type: "card",
    });

    // Create and confirm a PaymentIntent with the order amount, currency,
    // Customer and PaymentMethod ID
    paymentIntent = await stripe.paymentIntents.create({
      amount: calculateOrderAmount(),
      currency: "usd",
      payment_method: paymentMethods.data[0].id,
      customer: customer.data[0].id,
      off_session: true,
      confirm: true,
    });

    res.send({
      succeeded: true,
      clientSecret: paymentIntent.client_secret,
      publicKey: stripePublishableKey,
    });
  } catch (err) {
    if (err.code === "authentication_required") {
      // Bring the customer back on-session to authenticate the purchase
      // You can do this by sending an email or app notification to let them know
      // the off-session purchase failed
      // Use the PM ID and client_secret to authenticate the purchase
      // without asking your customers to re-enter their details
      res.send({
        error: "authentication_required",
        paymentMethod: err.raw.payment_method.id,
        clientSecret: err.raw.payment_intent.client_secret,
        publicKey: stripePublishableKey,
        amount: calculateOrderAmount(),
        card: {
          brand: err.raw.payment_method.card.brand,
          last4: err.raw.payment_method.card.last4,
        },
      });
    } else if (err.code) {
      // The card was declined for other reasons (e.g. insufficient funds)
      // Bring the customer back on-session to ask them for a new payment method
      res.send({
        error: err.code,
        clientSecret: err.raw.payment_intent.client_secret,
        publicKey: stripePublishableKey,
      });
    } else {
      console.log("Unknown error occurred", err);
    }
  }
});

// This example sets up an endpoint using the Express framework.
// Watch this video to get started: https://youtu.be/rPR2aJ6XnAc.

app.post("/payment-sheet", async (req, res) => {
  const { secret_key } = getKeys();
  const token = req.body.token;
  // const fetchOrderDetails = async () => {
    try {
      const { total, email, cust } = await cart(token);

      const stripe = new Stripe(secret_key, {
        apiVersion: "2020-08-27",
        typescript: true,
      });

      const ephemeralKey = await stripe.ephemeralKeys.create(
        { customer: cust },
        { apiVersion: "2020-08-27" }
      );
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Number(total.toString() + "00"),
        currency: "inr",
        customer: cust,
      });
      res.status(200).json({
        paymentIntent: paymentIntent.client_secret,
        ephemeralKey: ephemeralKey.secret,
        customer: cust,
      });
    } catch (error) {
      console.log(error);
      // return res.json({ message: "Order Verification Failed"})
    }
  // };
  // fetchOrderDetails();
});

const generateResponse = (intent) => {
  // Generate a response based on the intent's status
  switch (intent.status) {
    case "requires_action":
      // Card requires authentication
      return {
        clientSecret: intent.client_secret,
        requiresAction: true,
        status: intent.status,
      };
    case "requires_payment_method":
      // Card was not properly authenticated, suggest a new payment method
      return {
        error: "Your card was denied, please provide a new payment method",
      };
    case "succeeded":
      // Payment is complete, authentication not required
      // To cancel the payment after capture you will need to issue a Refund (https://stripe.com/docs/api/refunds).
      console.log("💰 Payment received!");
      return { clientSecret: intent.client_secret, status: intent.status };
  }

  return {
    error: "Failed",
  };
};

module.exports = app;
