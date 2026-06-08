const fs = require("fs");
const path = require("path");
const cryptoHash = require("./crypto-hash");

const DATA_PATH = path.join(__dirname, "data", "chain.json");

class Blockchain {
  constructor() {
    this.chain = [];
    this.loadChain();
  }

  // Genesis Block
  createGenesisBlock() {
    return {
      index: 0,
      timestamp: 1,
      prevHash: "0x000",
      hash: "genesis-hash",
      data: {}
    };
  }

  // Load from file
  loadChain() {
    try {
      if (!fs.existsSync(DATA_PATH)) {
        fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
        fs.writeFileSync(DATA_PATH, JSON.stringify([]));
      }

      const fileData = fs.readFileSync(DATA_PATH, "utf-8");
      const parsedData = JSON.parse(fileData);

      if (parsedData.length === 0) {
        this.chain = [this.createGenesisBlock()];
        this.saveChain();
      } else {
        this.chain = parsedData;
      }

      console.log(" Blockchain loaded");
    } catch (err) {
      console.error(" Load error:", err);
      this.chain = [this.createGenesisBlock()];
      this.saveChain();
    }
  }

  // Save to file
  saveChain() {
    fs.writeFileSync(DATA_PATH, JSON.stringify(this.chain, null, 2));
  }

  // Get last block
  getLastBlock() {
    return this.chain[this.chain.length - 1];
  }

  // Add block
  addBlock(data) {
    const prevBlock = this.getLastBlock();

    const newBlock = {
      index: this.chain.length,
      timestamp: Date.now(),
      prevHash: prevBlock.hash,
      hash: cryptoHash(
        prevBlock.hash,
        JSON.stringify(data),
        Date.now().toString()
      ),
      data
    };

    this.chain.push(newBlock);
    this.saveChain();

    return newBlock;
  }

  // VALIDATION FUNCTION
  static isValidChain(chain) {
    // 1. Validate Genesis Block
    const genesis = chain[0];
    const realGenesis = {
      index: 0,
      timestamp: 1,
      prevHash: "0x000",
      hash: "genesis-hash",
      data: {}
    };

    if (JSON.stringify(genesis) !== JSON.stringify(realGenesis)) {
      console.log("Invalid Genesis Block");
      return false;
    }

    // 2. Validate rest of chain
    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      const prevBlock = chain[i - 1];

      // 🔹 Check previous hash link
      if (block.prevHash !== prevBlock.hash) {
        console.log("Invalid prevHash at index", i);
        return false;
      }

      // 🔹 Recalculate hash
      const validatedHash = cryptoHash(
        prevBlock.hash,
        JSON.stringify(block.data),
        block.timestamp.toString()
      );

      if (block.hash !== validatedHash) {
        console.log("Invalid hash at index", i);
        return false;
      }
    }

    return true;
  }

  // Replace chain (with validation)
  replaceChain(newChain) {
    if (newChain.length <= this.chain.length) {
      console.log("Incoming chain is shorter");
      return;
    }

    if (!Blockchain.isValidChain(newChain)) {
      console.log("Incoming chain invalid");
      return;
    }

    this.chain = newChain;
    this.saveChain();

    console.log("Chain replaced successfully");
  }
}

module.exports = Blockchain;