import { EventRepository } from "../repository/event.repository";
import { producer } from "../config/kafka";
import { TangoEvent } from "../types/event";

export class EventService {
    private repository = new EventRepository();

    async createNewFestival(data: TangoEvent) {
        // 1. Save to Database
        const newEvent = await this.repository.createEvent(data);

        // 2. Broadcast to other microservices via Kafka
        await producer.send({
            topic: "event-created",
            messages: [{ value: JSON.stringify(newEvent) }],
        });

        return newEvent;
    }

    async listAllFestivals() {
        return await this.repository.getAllEvents();
    }
}
