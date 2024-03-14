const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const app = express();
const mongoose = require("mongoose");
const cookieSession = require("cookie-session");
const userRoutes = require("./routes/userRoutes");
const messagesRoute = require("./routes/messagesRoute");

const User = require("./model/userModel");

const socket = require("socket.io");

require("dotenv").config();
const { MONGODB_URL } = process.env;
app.use(cors());
app.use(express.json());
mongoose
  .connect(MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connection Successful");
  })
  .catch((err) => {
    console.log(err);
  });

// Root route with a beautiful welcome message
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/welcome.html");
});

app.use("/api/auth", userRoutes);
app.use("/api/message", messagesRoute);

const server = app.listen(process.env.PORT, () => {
  console.log(`Server is running on port: ${process.env.PORT}`);
});

const io = socket(server, {
  cors: {
    origin: "http://localhost:4000",
    credentials: true,
  },
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    console.log("sendmsg", { data });
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });
});
