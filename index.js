// index.js

//const bodyParser = require("body-parser");
const PDFDocument = require("pdfkit");
const cryptoHash = require("./crypto-hash");
const cenv = require("cross-env");
const path = require("path");
const multer = require("multer");
const express = require("express");
const request = require("request");
const Blockchain = require("./blockchain");
const PubSub = require("./publishsubscribe");

//decalaring region
const REGION = process.env.REGION ||"unknown";

//status indicator port sync
const peers = [];

const upload = multer({
  storage: multer.memoryStorage() // keeps file in memory
});

const app = express();
const blockchain = new Blockchain();
const pubsub = new PubSub({ blockchain });
(async () => {
  await pubsub.connect();

  // anything that depends on Redis goes AFTER this
})();

const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

setTimeout(() => pubsub.broadcastChain(), 1000);

app.use(express.json());

app.get("/api/blocks", (req, res) => {
  res.json(blockchain.chain);
});
// static pages
app.use(express.static(path.join(__dirname,"public")));

app.post("/api/mine", upload.single("file"), (req, res) => {
  if (!req.body) {
  return res.status(400).json({ error: "req.body is undefined" });
}
  //const { data } = req.body;
  const fileHash = cryptoHash(req.file.buffer);

  const data = {
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
    //content: req.file.buffer.toString("utf-8"), // or keep as Buffer
    region: REGION,
    uploadedAt: new Date().toISOString(),
    hash: fileHash,
  };

  blockchain.addBlock(data);
  pubsub.broadcastChain();

  res.redirect("/");
  //console.log("REGION= ",process.env.REGION);
});

//explorer
app.get("/explorer", (req, res) => {
  res.sendFile(path.join(__dirname,"public", "explorer.html"));
});

//status indicator
app.get("/api/status", (req, res) => {
  res.json({
    region: process.env.REGION || "UNKNOWN",
    height: blockchain.chain.length,
    lastBlockHash: blockchain.chain[blockchain.chain.length - 1].hash,
    timestamp: Date.now()
  });
});

app.post("/api/register-node", (req, res) => {
  const { region, url } = req.body;

  if (!peers.find(p => p.url === url)) {
    peers.push({ region, url });
  }

  res.json({ status: "registered" });
});
app.get("/api/nodes", async (req, res) => {
  const results = [];

  for (const peer of peers) {
    try {
      await new Promise((resolve, reject) => {
        request(
          { url: `${peer.url}/api/status`, json: true, timeout: 1500 },
          (err, response, body) => {
            if (err) return reject(err);

            results.push({
              region: body.region,
              height: body.height,
              lastBlockHash: body.lastBlockHash,
              online: true
            });
            resolve();
          }
        );
      });
    } catch {
      results.push({
        region: peer.region,
        online: false
      });
    }
  }

  res.json({ nodes: results });
});


//const path = require("path");

/**
 * DOWNLOAD BLOCKCHAIN PROOF REPORT (PDF)
 * URL: /api/proof/:index
 */
app.get("/api/proof/:index", (req, res) => {
  const index = parseInt(req.params.index, 10);
  const block = blockchain.chain[index];

  if (!block || !block.data) {
    return res.status(404).send("Invalid block index");
  }

  const data = block.data;

  // Create PDF
  const doc = new PDFDocument({ margin: 50 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=proof_block_${index}.pdf`
  );

  doc.pipe(res);

  /* ===========================
     HEADER
  ============================ */
  doc
    .fontSize(20)
    .text("SECURE ACADEMIC RECORD DISTRIBUTION", { align: "center" })
    .moveDown(0.5);

  doc
    .fontSize(14)
    .text("Blockchain Verification Proof", { align: "center" });

  doc.moveDown();
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

  /* ===========================
     INSTITUTION INFO
  ============================ */
  doc.moveDown();
  doc.fontSize(12).text(`Institution Name      : ABC University`);
  doc.text(`Blockchain Network    : Academic Record Blockchain`);
  doc.text(`Total Regions         : 3 (North, South, East)`);
  doc.text(`Verification Type     : Decentralized Proof`);

  /* ===========================
     FILE DETAILS
  ============================ */
  doc.moveDown();
  doc.fontSize(14).text("File Details", { underline: true });
  doc.moveDown(0.3);

  doc.fontSize(12);
  doc.text(`File Name        : ${data.originalName}`);
  doc.text(`Uploaded Region  : ${data.region}`);
  doc.text(
    `Uploaded On      : ${new Date(data.uploadedAt).toLocaleString()}`
  );

  /* ===========================
     FILE HASH
  ============================ */
  doc.moveDown();
  doc.fontSize(14).text("File Hash (SHA-256)", { underline: true });
  doc.moveDown(0.3);

  doc
    .font("Courier")
    .fontSize(10)
    .text(data.hash, { width: 500 });

  doc.font("Helvetica");

  /* ===========================
     BLOCKCHAIN DETAILS
  ============================ */
  doc.moveDown();
  doc.fontSize(14).text("Blockchain Record Details", {
    underline: true,
  });
  doc.moveDown(0.3);

  doc.fontSize(12);
  doc.text(`Block Index         : ${index}`);
  doc.text(
    `Block Timestamp     : ${new Date(
      block.timestamp
    ).toLocaleString()}`
  );
  doc.text(`Previous Block Hash : ${block.prevHash}`);
  doc.text(`Current Block Hash  : ${block.hash}`);

  /* ===========================
     VERIFICATION STATUS
  ============================ */
  doc.moveDown(2);
  doc
    .fontSize(16)
    .fillColor("green")
    .text("✔ VERIFIED ON BLOCKCHAIN", { align: "center" });

  doc.fillColor("black");

  doc.moveDown();
  doc
    .fontSize(11)
    .text(
      "This academic record has been successfully verified and permanently stored in the blockchain ledger shared across multiple regional nodes.",
      { align: "center" }
    );

  /* ===========================
     FOOTER
  ============================ */
  doc.moveDown(2);
  doc.fontSize(9).text(
    `Generated On : ${new Date().toLocaleString()}\nSystem : Secure Academic Record Distribution via Blockchain`,
    { align: "center" }
  );

  doc.end();
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

const synChains = () => {
  request(
    { url: `${ROOT_NODE_ADDRESS}/api/blocks` },
    (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const rootChain = JSON.parse(body);
        console.log("Replace chain on sync with", rootChain);
        blockchain.replaceChain(rootChain);
      }
    }
  );
};

let PEER_PORT;

if (process.env.GENERATE_PEER_PORT === "true") {
  PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = PEER_PORT || DEFAULT_PORT;

app.listen(PORT, () => {
  console.log(`listening to PORT:${PORT}`);
    synChains();
    const ROOT_NODE = "http://localhost:3000";

fetch(`${ROOT_NODE}/api/register-node`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    region: process.env.REGION,
    url: `http://localhost:${PORT}`
  })
});

});
