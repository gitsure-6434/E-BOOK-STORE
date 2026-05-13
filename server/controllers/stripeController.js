const Stripe = require("stripe");
const Book = require("../models/bookModel");
const Transaction = require("../models/transactionModel");

let stripeClient = null;
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeClient;
};

const createCheckoutSession = async (req, res) => {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return res.status(503).json({
        message: "Stripe is not configured. Set STRIPE_SECRET_KEY in server/.env"
      });
    }

    const { bookId } = req.body;
    if (!bookId) {
      return res.status(400).json({ message: "bookId is required" });
    }

    const book = await Book.findById(bookId);
    if (!book || !book.isPublished) {
      return res.status(404).json({ message: "Book not found or not available" });
    }

    if (book.seller.toString() === req.user.id) {
      return res.status(400).json({ message: "You cannot purchase your own book" });
    }

    const clientUrl = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");
    const unitAmount = Math.round(Number(book.price) * 100);
    if (unitAmount < 50) {
      return res.status(400).json({ message: "Book price must be at least $0.50 for Stripe Checkout" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: book.title,
              description: book.description ? String(book.description).slice(0, 500) : undefined,
              images:
                book.coverImageUrl && book.coverImageUrl.startsWith("http")
                  ? [book.coverImageUrl]
                  : book.coverImageUrl
                    ? [`${clientUrl}${book.coverImageUrl.startsWith("/") ? "" : "/"}${book.coverImageUrl}`]
                    : undefined
            },
            unit_amount: unitAmount
          },
          quantity: 1
        }
      ],
      success_url: `${clientUrl}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/books/${bookId}`,
      metadata: {
        buyerId: req.user.id,
        bookId: book._id.toString()
      }
    });

    await Transaction.create({
      buyer: req.user.id,
      book: book._id,
      amount: book.price,
      currency: "usd",
      status: "pending",
      stripeCheckoutSessionId: session.id
    });

    return res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create checkout session", error: error.message });
  }
};

const getSessionStatus = async (req, res) => {
  try {
    const { session_id: sessionId } = req.query;
    if (!sessionId) {
      return res.status(400).json({ message: "session_id query is required" });
    }

    const stripe = getStripe();
    if (!stripe) {
      return res.status(503).json({ message: "Stripe is not configured" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"]
    });

    if (String(session.metadata?.buyerId) !== String(req.user.id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const tx = await Transaction.findOne({ stripeCheckoutSessionId: sessionId })
      .populate("book", "title price pdfUrl coverImageUrl description")
      .populate("buyer", "name email");

    return res.status(200).json({
      paymentStatus: session.payment_status,
      status: tx?.status,
      amountTotal: session.amount_total ? session.amount_total / 100 : null,
      currency: session.currency,
      transaction: tx
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load session", error: error.message });
  }
};

const getCheckoutReceipt = async (req, res) => {
  try {
    const { session_id: sessionId } = req.query;
    if (!sessionId) {
      return res.status(400).json({ message: "session_id query is required" });
    }

    const stripe = getStripe();
    if (!stripe) {
      return res.status(503).json({ message: "Stripe is not configured" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"]
    });

    const lineItem = session.line_items?.data?.[0];
    const bookTitle = lineItem?.description || session.metadata?.bookTitle || "Book";

    return res.status(200).json({
      paymentStatus: session.payment_status,
      amountTotal: session.amount_total ? session.amount_total / 100 : null,
      currency: session.currency,
      bookTitle
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load receipt", error: error.message });
  }
};

const handleStripeWebhook = async (req, res) => {
  const stripe = getStripe();
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("Stripe webhook not configured");
    return res.status(503).send("Stripe webhook not configured");
  }

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const sessionId = session.id;
    const paymentIntentId =
      typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id || "";

    await Transaction.findOneAndUpdate(
      { stripeCheckoutSessionId: sessionId },
      {
        status: "completed",
        stripePaymentIntentId: paymentIntentId
      }
    );
  }

  return res.json({ received: true });
};

module.exports = {
  createCheckoutSession,
  getSessionStatus,
  getCheckoutReceipt,
  handleStripeWebhook
};
