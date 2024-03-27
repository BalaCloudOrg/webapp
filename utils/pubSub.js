// Import the PubSub class
const { PubSub } = require("@google-cloud/pubsub");
const logger = require("./logging");

const pubSub = new PubSub();

async function publishMessage(topicName, data) {
  // Creates a client; credentials will be taken from the environment variables by default
  // References an existing topic

  try {
    // Publishes a message
    const dataBuffer = Buffer.from(JSON.stringify(data));
    const messageId = await pubSub
      .topic(topicName)
      .publishMessage({ data: dataBuffer });
    logger.info(`Message ${messageId} published to ${topicName}`, data);
  } catch (error) {
    logger.error(`Error publishing message to ${topicName}`, { error: error });
  }
}

module.exports = publishMessage;
