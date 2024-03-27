const { PubSub } = require("@google-cloud/pubsub");
const logger = require("./logging");

const pubSub = new PubSub();

async function publishMessage(topicName, data) {
  try {
    const messageId = await pubSub
      .topic(topicName)
      .publishMessage({ data: JSON.stringify(data) });
    logger.info(`Message ${messageId} published to ${topicName}`, data);
  } catch (error) {
    logger.error(`Error publishing message to ${topicName}`, { error: error });
  }
}

module.exports = publishMessage;
