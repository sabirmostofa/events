import { Kafka, Partitioners } from "kafkajs";

const kafka = new Kafka({
    clientId: "registration-service",
    brokers: ["kafka:9092"],
});

export const producer = kafka.producer({
    // This removes the "switched default partitioner" warning
    createPartitioner: Partitioners.LegacyPartitioner,
});

export const consumer = kafka.consumer({ groupId: "registration-group" });

// This function ensures topics exist BEFORE the service starts
export const ensureTopicsExist = async (topics: string[]) => {
    const admin = kafka.admin();
    try {
        await admin.connect();
        const existingTopics = await admin.listTopics();
        const topicsToCreate = topics
            .filter((t) => !existingTopics.includes(t))
            .map((t) => ({ topic: t, numPartitions: 1, replicationFactor: 1 }));

        if (topicsToCreate.length > 0) {
            console.log(
                `📡 Creating missing topics: ${topicsToCreate.map((t) => t.topic)}`,
            );
            await admin.createTopics({
                topics: topicsToCreate,
                waitForLeaders: true, // This tells Kafka to wait until partitions have leaders
            });

            // Crucial: Give the broker a second to update its metadata cache
            console.log("⏳ Waiting for metadata propagation...");
            await new Promise((resolve) => setTimeout(resolve, 2000));
        }
    } catch (err) {
        console.error("❌ Failed to verify/create topics:", err);
        throw err; // Throw so the start() retry loop catches it
    } finally {
        await admin.disconnect();
    }
};
