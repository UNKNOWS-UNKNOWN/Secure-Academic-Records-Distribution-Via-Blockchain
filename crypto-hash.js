// crypto-hash.js
const crypto = require("crypto");

const cryptoHash = (...inputs) => {
    const hash = crypto.createHash("sha256");
    hash.update(inputs.sort().join("")); // Sort inputs and join them as a single string
    return hash.digest("hex");
};

module.exports = cryptoHash;
// To test, you can uncomment the line below:
// console.log(cryptoHash("world", "hello"));
