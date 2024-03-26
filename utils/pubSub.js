// Import the PubSub class
const { PubSub } = require("@google-cloud/pubsub");

async function publishMessage(topicName, data) {
  // Creates a client; credentials will be taken from the environment variables by default
  const pubsub = new PubSub();
  // References an existing topic
  const topic = pubsub.topic(topicName);

  try {
    // Publishes a message
    const dataBuffer = Buffer.from(JSON.stringify(data));
    const messageId = await topic.publish(dataBuffer);
    logger.info(`Message ${messageId} published to ${topicName}`, data);
  } catch (error) {
    logger.error(`Error publishing message to ${topicName}`, { error: error });
  }
}

module.exports = publishMessage;
