import { pool } from "../config/database";
import { producer } from "../config/kafka";

export class RegistrationService {
    async registerUser(eventId: string, userData: any) {
        const client = await pool.connect();

        try {
            await client.query("BEGIN"); // Start Transaction

            // Fetch event price if not provided in userData
            let price = userData.price_euro;
            if (!price) {
                const eventRes = await client.query(
                    "SELECT price_euro FROM available_events WHERE id = $1",
                    [eventId],
                );
                price = eventRes.rows[0]?.price_euro || 0;
            }

            // 1. Get current counts for this specific event
            const countQuery = `
        SELECT 
          COUNT(*) FILTER (WHERE role = 'leader') as leaders,
          COUNT(*) FILTER (WHERE role = 'follower') as followers
        FROM registrations 
        WHERE event_id = $1;
      `;
            const counts = await client.query(countQuery, [eventId]);
            const leaders = parseInt(counts.rows[0].leaders);
            const followers = parseInt(counts.rows[0].followers);

            // 2. Perform the Balance Check
            if (userData.role === "follower") {
                // Example: allow max 10% more followers than leaders
                const maxAllowedFollowers = Math.ceil(leaders * 1.1) + 5;
                if (followers >= maxAllowedFollowers) {
                    throw new Error(
                        "Follower limit reached. Waiting for more Leaders to register!",
                    );
                }
            }

            // 3. If check passes, insert the registration
            const insertQuery = `
        INSERT INTO registrations (event_id, participant_name, participant_email, role, status)
        VALUES ($1, $2, $3, $4, 'pending') 
        RETURNING *;
      `;
            const { rows } = await client.query(insertQuery, [
                eventId,
                userData.name,
                userData.email,
                userData.role,
            ]);

            const registration = rows[0];

            // NEW: Trigger the Payment Service via Kafka
            await producer.send({
                topic: "registration-created",
                messages: [
                    {
                        value: JSON.stringify({
                            id: registration.id,
                            participant_name: registration.participant_name,
                            participant_email: registration.participant_email,
                            price_euro: userData.price_euro, // Passed from the frontend/sync
                        }),
                    },
                ],
            });

            await client.query("COMMIT");
            return registration;
        } catch (error) {
            await client.query("ROLLBACK"); // Cancel if anything failed
            throw error;
        } finally {
            client.release();
        }
    }

    // Kafka sync logic remains the same...
    async syncEvent(event: any) {
        const query = `INSERT INTO available_events (id, title, price_euro) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING;`;
        await pool.query(query, [event.id, event.title, event.price_euro]);
    }
}
