const SHA256 = require('crypto-js/sha256');

class Block {
  constructor(index, timestamp, data, previousHash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return SHA256(
      this.index +
      this.timestamp +
      JSON.stringify(this.data) +
      this.previousHash
    ).toString();
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
  }

  createGenesisBlock() {
    return new Block(0, new Date().toISOString(), "Genesis Block", "0");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(newBlock) {
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.hash = newBlock.calculateHash();
    this.chain.push(newBlock);
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const curr = this.chain[i];
      const prev = this.chain[i - 1];

      if (curr.hash !== curr.calculateHash()) return false;
      if (curr.previousHash !== prev.hash) return false;
    }
    return true;
  }
}

// Test Case: Supply Chain
const supplyChain = new Blockchain();

supplyChain.addBlock(
  new Block(1, new Date().toISOString(), {
    step: "example_academy_1",
    location: "Rajasthan"
  })
);

supplyChain.addBlock(
  new Block(2, new Date().toISOString(), {
    step: "example_academy_2",
    location: "Delhi"
  })
);

supplyChain.addBlock(
  new Block(3, new Date().toISOString(), {
    step: "example_academy_3",
    location: "Mumbai"
  })
);

console.log(JSON.stringify(supplyChain, null, 2));
console.log("Blockchain valid?", supplyChain.isChainValid());
