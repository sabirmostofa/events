import { Router } from "express";
import { createEvent, getEvents } from "../controllers/event.controller";

const router = Router();

router.post("/", createEvent);
router.get("/", getEvents);

export default router;
