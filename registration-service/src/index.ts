import express from "express";
import { consumer, producer, ensureTopicsExist } from "./config/kafka";
import { RegistrationService } from "./services/registration.service";
import { pool } from "./config/database";

const app = express();
app.use(express.json());
const regService = new RegistrationService();

// Updated /register route to match Service parameters
app.post("/register", async (req, res) => {
    const { event_id, ...userData } = req.body;

    if (!event_id) {
        return res.status(400).json({ error: "event_id is required" });
    }

    try {
        // We pass event_id and the rest of the data separately
        const registration = await regService.registerUser(event_id, userData);
        res.status(201).json(registration);
    } catch (error: any) {
        console.error("❌ Registration Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

const start = async () => {
    let connected = false;

    // Retry loop for the "Group Coordinator" error
    while (!connected) {
        try {
            await ensureTopicsExist([
                "event-created",
                "payment-confirmed",
                "registration-created",
            ]);

            await producer.connect();
            await consumer.connect();
            console.log("✅ Kafka Connected");
            connected = true;
        } catch (error) {
            console.log("⏳ Kafka not ready (Coordinator)... retrying in 5s");
            await new Promise((resolve) => setTimeout(resolve, 5000));
        }
    }

    try {
        await consumer.subscribe({
            topics: ["event-created", "payment-confirmed"],
            fromBeginning: true,
        });

        await consumer.run({
            eachMessage: async ({ topic, message }) => {
                const payload = JSON.parse(message.value?.toString() || "{}");

                if (topic === "event-created") {
                    console.log("📅 Syncing new event from Kafka...");
                    await regService.syncEvent(payload);
                }

                if (topic === "payment-confirmed") {
                    console.log(
                        `✅ Confirming payment for Registration: ${payload.registration_id}`,
                    );
                    await pool.query(
                        "UPDATE registrations SET status = 'confirmed' WHERE id = $1",
                        [payload.registration_id],
                    );
                    console.log(
                        `🚀 Database updated: Registration ${payload.registration_id} is CONFIRMED.`,
                    );
                }
            },
        });

        app.listen(8081, () =>
            console.log("🎟️ Registration Service running on 8081"),
        );
    } catch (error) {
        console.error("❌ Registration Service Runtime Error:", error);
    }
};

start();
