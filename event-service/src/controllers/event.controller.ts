import { Request, Response } from "express";
import { EventService } from "../services/event.service";

const eventService = new EventService();

export const createEvent = async (req: Request, res: Response) => {
    try {
        const festival = await eventService.createNewFestival(req.body);
        res.status(201).json(festival);
    } catch (error) {
        res.status(500).json({ error: "Failed to create festival" });
    }
};

export const getEvents = async (_req: Request, res: Response) => {
    try {
        const events = await eventService.listAllFestivals();
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch festivals" });
    }
};
