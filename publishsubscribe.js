const redis = require("redis");

const CHANNELS = {
  TEST: "TEST",
  BLOCKCHAIN: "BLOCKCHAIN",
};

class PubSub {
  constructor({ blockchain }) {
    this.blockchain = blockchain;

    this.publisher = redis.createClient();
    this.subscriber = redis.createClient();
  }

  async connect() {
    await this.publisher.connect();
    await this.subscriber.connect();

    await this.subscriber.subscribe(CHANNELS.TEST, (message) => {
      this.handleMessage(CHANNELS.TEST, message);
    });

    await this.subscriber.subscribe(CHANNELS.BLOCKCHAIN, (message) => {
      this.handleMessage(CHANNELS.BLOCKCHAIN, message);
    });

    console.log("Redis PubSub connected");
  }

  handleMessage(channel, message) {
    console.log(
      `Message received. Channel: ${channel} Message: ${message}`
    );

    const parsedMessage = JSON.parse(message);

    if (channel === CHANNELS.BLOCKCHAIN) {
      this.blockchain.replaceChain(parsedMessage);
    }
  }

  async publish({ channel, message }) {
    if (!this.publisher.isOpen) {
      throw new Error("Redis publisher is closed");
    }

    await this.publisher.publish(channel, message);
  }

  broadcastChain() {
    this.publish({
      channel: CHANNELS.BLOCKCHAIN,
      message: JSON.stringify(this.blockchain.chain),
    });
  }
}

module.exports = PubSub;
