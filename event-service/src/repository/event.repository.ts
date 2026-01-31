import { pool } from "../config/database";
import { TangoEvent } from "../types/event";

export class EventRepository {
    async createEvent(event: TangoEvent): Promise<TangoEvent> {
        const query = `
      INSERT INTO events (title, description, location, start_date, end_date, price_euro, organizer_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
        const values = [
            event.title,
            event.description,
            event.location,
            event.start_date,
            event.end_date,
            event.price_euro,
            event.organizer_id,
        ];

        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    async getAllEvents(): Promise<TangoEvent[]> {
        const { rows } = await pool.query(
            "SELECT * FROM events ORDER BY id DESC",
        );
        return rows;
    }
}
