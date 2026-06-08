const Blockchain = require("./blockchain");
const blockchain = new Blockchain();

blockchain.addBlock({ data: "new data" });
console.log(blockchain.chain[blockchain.chain.length - 1]);

let prevTimestamp, nextTimestamp, nextBlock, timeDiff, averageTime;

const times = [];
let totalTime = 0;

for (let i = 0; i < 1000; i++) {
  prevTimestamp = blockchain.chain[blockchain.chain.length - 1].timestamp;

  blockchain.addBlock({ data: `block ${i}` });
  nextBlock = blockchain.chain[blockchain.chain.length - 1];
  nextTimestamp = nextBlock.timestamp;

  timeDiff = nextTimestamp - prevTimestamp;
  times.push(timeDiff);

  totalTime += timeDiff;
  averageTime = totalTime / times.length;

  console.log(
    `Time to mine block: ${timeDiff}ms | Difficulty: ${nextBlock.difficulty} | Average time: ${averageTime}ms`
  );
}
