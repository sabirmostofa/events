import express from "express";
import router from "./routes/event.routes";

import { connectKafka } from "./config/kafka";

const app = express();
app.use(express.json());

app.use("/events", router);

const start = async () => {
    try {
        await connectKafka();
        app.listen(8080, () =>
            console.log("🚀 Event Service listening on port 8080"),
        );
    } catch (err) {
        console.error("Critical failure:", err);
        process.exit(1);
    }
};

start();
