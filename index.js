const express = require("express");
require("dotenv").config();
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

let posts = [];

app.get("/posts", (req, res) => {
  res.json(posts);
});

app.post("/posts", (req, res) => {
  const { username, content } = req.body;
  const regex = /^[^a-zA-Z]*receba[^a-zA-Z]*$/i;
  if (!regex.test(content))
    return res
      .status(400)
      .json({ error: "Content must contain the word 'receba'" });
  if (username) {
    const newPost = {
      id: Date.now(),
      username,
      timestamp: new Date().toISOString(),
      content: req.body.content,
    };
    posts.unshift(newPost);
    io.emit("newPost", newPost);
    res.status(201).json(newPost);
  } else {
    res.status(400).json({ error: "Username is required" });
  }
});

io.on("connection", (socket) => {
  console.log("New client connected");
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
