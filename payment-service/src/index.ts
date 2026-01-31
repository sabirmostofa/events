import express from "express";
import Stripe from "stripe";
import { Kafka } from "kafkajs";
import { consumer, producer, ensureTopicExists } from "./config/kafka";
import { PaymentService } from "./services/payment.service";

const app = express();
const paymentService = new PaymentService();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// 1. WEBHOOK ROUTE (Must be defined BEFORE express.json())
app.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
        const sig = req.headers["stripe-signature"]!;
        let event;

        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET!,
            );
        } catch (err: any) {
            console.error(
                `❌ Webhook Signature Verification Failed: ${err.message}`,
            );
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        // Handle the checkout.session.completed event
        if (event.type === "checkout.session.completed") {
            const session = event.data.object as any;
            const registrationId = session.metadata.registration_id;

            console.log(
                `✅ Payment successful for Registration: ${registrationId}`,
            );

            // Emit "payment-confirmed" to Kafka
            await producer.send({
                topic: "payment-confirmed",
                messages: [
                    {
                        value: JSON.stringify({
                            registration_id: registrationId,
                            status: "confirmed",
                            stripe_session_id: session.id,
                        }),
                    },
                ],
            });
        }

        res.json({ received: true });
    },
);

// 2. GENERAL MIDDLEWARE (For all other routes)
app.use(express.json());

const start = async () => {
    let connected = false;

    // --- RECOVERY LOOP FOR GROUP COORDINATOR ---
    while (!connected) {
        try {
            // Ensure topics exist first
            await ensureTopicExists("registration-created");
            await ensureTopicExists("payment-confirmed");

            await producer.connect();
            await consumer.connect();

            console.log("✅ Payment Service: Kafka Connected");
            connected = true;
        } catch (error) {
            console.log(
                "⏳ Payment Service: Waiting for Kafka Coordinator... retrying in 5s",
            );
            await new Promise((resolve) => setTimeout(resolve, 5000));
        }
    }

    try {
        await consumer.subscribe({
            topic: "registration-created",
            fromBeginning: true,
        });

        await consumer.run({
            eachMessage: async ({ message }) => {
                try {
                    const registration = JSON.parse(
                        message.value?.toString() || "{}",
                    );
                    console.log(
                        `💳 Processing: ${registration.participant_name}`,
                    );
                    const sessionUrl =
                        await paymentService.createStripeSession(registration);
                    console.log(`🔗 Payment URL generated: ${sessionUrl}`);
                } catch (err) {
                    console.error("❌ Error processing registration:", err);
                }
            },
        });

        app.listen(8082, () =>
            console.log(`💳 Payment Service running on 8082`),
        );
    } catch (error) {
        console.error("❌ Payment Service Runtime Error:", error);
    }
};

start();
