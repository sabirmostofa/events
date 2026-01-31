import { Kafka, Partitioners } from "kafkajs";

const kafka = new Kafka({
    clientId: "payment-service",
    brokers: [process.env.KAFKA_BROKER || "kafka:9092"],
    retry: {
        initialRetryTime: 300,
        retries: 10, // Increase retries to handle Kafka warm-up
    },
});

export const consumer = kafka.consumer({ groupId: "payment-group" });

// Producer
export const producer = kafka.producer({
    createPartitioner: Partitioners.LegacyPartitioner,
});

export const ensureTopicExists = async (topic: string) => {
    const admin = kafka.admin();
    await admin.connect();
    const topics = await admin.listTopics();
    if (!topics.includes(topic)) {
        console.log(`Creating topic: ${topic}`);
        await admin.createTopics({
            topics: [{ topic }],
        });
    }
    await admin.disconnect();
};
