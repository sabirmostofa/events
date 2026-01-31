import Stripe from "stripe";
import { pool } from "../config/database";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export class PaymentService {
    async createStripeSession(registration: any) {
        try {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ["card", "giropay", "sepa_debit"], // Good for German/French users
                line_items: [
                    {
                        price_data: {
                            currency: "eur",
                            product_data: {
                                name: `Registration: ${registration.event_title || "Tango Event"}`,
                                description: `Participant: ${registration.participant_name}`,
                            },
                            unit_amount: Math.round(
                                registration.price_euro * 100,
                            ), // Stripe uses cents
                        },
                        quantity: 1,
                    },
                ],
                mode: "payment",
                success_url: `http://localhost:3000/success?regId=${registration.id}`,
                cancel_url: `http://localhost:3000/cancel?regId=${registration.id}`,
                metadata: {
                    registration_id: registration.id,
                },
            });

            // Update local payment_db
            await pool.query(
                "INSERT INTO payments (registration_id, amount, stripe_session_id) VALUES ($1, $2, $3)",
                [registration.id, registration.price_euro, session.id],
            );

            console.log(`🔗 Stripe Session Created: ${session.url}`);
            return session.url;
        } catch (error) {
            console.error("Stripe Session Error:", error);
            throw error;
        }
    }
}
