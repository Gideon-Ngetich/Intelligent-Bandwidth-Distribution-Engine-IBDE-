const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const DynamicAllocator = require("./engine/dynamicAllocator");
const dotenv = require("dotenv");
dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("App connected to DB")
    })
    .catch((err) => {
        console.error(err)
    })

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

app.post("/api/allocate/:clientType", async (req, res) => {
  const { clientType } = req.params;
  const allocator = new DynamicAllocator();
  await allocator.analyzeAndAllocate(clientType);
  io.emit("update", { message: "Allocation updated" });
  res.json({ success: true });
});

app.post("/api/rules", async (req, res) => {
  const rule = new BandwidthRule(req.body);
  await rule.save();
  res.json(rule);
});

app.get("/api/logs", async (req, res) => {
  const logs = await TrafficLog.find().sort({ timestamp: -1 }).limit(50);
  res.json(logs);
});

io.on("connection", (socket) => {
  console.log("Dashboard connected");
  setInterval(async () => {
    const allocator = new DynamicAllocator();
    const stats = await allocator.mikroTik.getClientStats();
    socket.emit("traffic", stats);
  }, 30000);
});

server.listen(process.env.PORT, () =>
  console.log(`Server on ${process.env.PORT}`)
);
