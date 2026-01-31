import { Kafka, Producer } from "kafkajs";

const kafka = new Kafka({
    clientId: "event-service",
    brokers: [process.env.KAFKA_BROKER || "kafka:9092"],
});

export const producer: Producer = kafka.producer();

export const connectKafka = async () => {
    await producer.connect();
    console.log("✅ Kafka Producer Connected");
};
