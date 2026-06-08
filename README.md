# Secure Academic Records Distribution via Blockchain

## Overview

A decentralized blockchain-based platform developed using Node.js to securely store, verify, and distribute academic records across distributed network nodes. The system leverages blockchain technology to ensure record integrity, transparency, and protection against unauthorized modifications.

## Features

* Tamper-resistant academic record storage
* Decentralized blockchain architecture
* Real-time node synchronization using Redis Pub/Sub
* Persistent data storage and recovery mechanism
* Fault-tolerant distributed network
* Record verification and transaction tracking

## Technologies Used

* Node.js
* Express.js
* Redis
* JavaScript
* Blockchain Concepts
* JSON Data Persistence

## System Architecture

The application consists of multiple blockchain nodes that communicate through Redis Pub/Sub channels. New transactions and blocks are propagated across the network in real time, ensuring ledger consistency and synchronization.

## Security Features

* Immutable blockchain records
* Transaction verification
* Distributed ledger architecture
* Protection against unauthorized data modification
* Data integrity validation

## Installation

1. Clone the repository
2. Install dependencies

npm install

3. Start Redis server

### Redis Setup (Windows)

This project uses Redis Pub/Sub for real-time communication and synchronization between blockchain nodes.

#### 1. Install Redis

Download and install Redis for Windows.

#### 2. Start the Redis Server

After installation, start the Redis service using:

```bash
redis-server
```

Alternatively, if Redis is installed as a Windows service:

```bash
net start Redis
```

#### 3. Verify Redis is Running

Open a new terminal and run:

```bash
redis-cli ping
```

Expected output:

```text
PONG
```

If you receive `PONG`, Redis is running successfully and the blockchain nodes can communicate with each other.


4. Run the application

## Running the Project

This project simulates a decentralized blockchain network consisting of three nodes:

* South Node (Root Node)
* East Node
* North Node

### Start the Nodes

Open three separate terminal windows and execute the following commands:

```bash
npm run start:south
```

```bash
npm run start:east
```

```bash
npm run start:north
```

### Node Configuration

* The South node acts as the root node and always runs on port `3000`.
* The East and North nodes are assigned random ports between `3001` and `3999` during startup.
* The assigned port number for each node is displayed in the terminal when the node starts.

### Access the Application

After all nodes are running, open your browser and navigate to:

```text
http://localhost:<port>
```

Replace `<port>` with the port number displayed in the corresponding terminal window.

### Example

```text
South Node : http://localhost:3000
East Node  : http://localhost:3512
North Node : http://localhost:3874
```

Once all nodes are active, transactions and blockchain updates are synchronized across the network using Redis Pub/Sub, enabling real-time communication between distributed nodes.


## Future Enhancements

* User authentication and authorization
* Digital signatures
* Database integration or Cloud integration
* Smart contract implementation

## Screenshots

Add screenshots of:

* Blockchain node interface
* Transaction creation
* Record verification process
* Network synchronization

## Author

Yogeeswaran D

