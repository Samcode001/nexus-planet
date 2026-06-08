import express from "express";
import { authenticateAccessToken } from "../../middleware/Authenticate";
import client from "@repo/db";
import jwt from "jsonwebtoken";
const userRouter = express.Router();

const SOCKET_SECRET = process.env.SOCKET_SECRET!;
// console.log(SOCKET_SECRET);
userRouter.get("/users", (req, res) => {
  const { id } = req.body;
  res.send({ id });
});

userRouter.get("/profile", authenticateAccessToken, async (req, res) => {
  // const userToken = (req as any).user;
  const userId = req.user?.id;
  // fetch user from DB
  const user = await client.user.findUnique({
    where: {
      id: userId,
    },
  });
  // console.log(userToken, user);
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json({
    id: user.id,
    username: user.username,
    name: user.name,
    avatarId: user.avatarId,
  });
});

userRouter.put("/set-avatar", authenticateAccessToken, async (req, res) => {
  // const userToken = (req as any).user;

  const avatarID = req.body.avatar;
  const userId = req.user?.id;
  console.log(req.user?.id, avatarID);
  const user = await client.user.findUnique({
    where: {
      id: userId,
    },
  });
  // console.log(userToken, user);
  if (!user) return res.status(404).json({ message: "User not found" });

  const userUpdate = await client.user.update({
    where: {
      id: userId,
    },
    data: {
      avatarId: avatarID,
    },
  });
  res.json({ message: "Avatar set Succesfully", user: userUpdate.avatarId });
});

userRouter.post("/socket", authenticateAccessToken, async (req, res) => {
  // const userObject = (req as any).user;
  const userId = req.user?.id;
  const username = req.user?.username;
  const token = jwt.sign({ id: userId, username: username }, SOCKET_SECRET, {
    expiresIn: "10m",
  });
  const user = await client.user.findUnique({
    where: {
      id: userId,
    },
  });
  // console.log(token, user);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({
    token,
    userId: userId,
    avatarId: user.avatarId,
    username: user.username,
  });
});

userRouter.get("/avatar", authenticateAccessToken, async (req, res) => {
  // const userToken = (req as any).user;
  const userId = req.user?.id;
  // console.log(userToken)
  // fetch user from DB
  const user = await client.user.findUnique({
    where: {
      id: userId,
    },
  });
  // console.log(userToken, user);
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json({
    avatarId: user.avatarId,
  });
});

userRouter.post("/add_friend", authenticateAccessToken, async (req, res) => {
  try {
    const { reciverId } = req.body;
    const status = await client.friend.create({
      data: {
        requesterId: req.user?.id!,
        reciverId,
      },
    });

    res.status(201).json({ message: "Friend Request Sent", status });
  } catch (error) {
    console.log(error);
    res.status(500).send(`Internal Server Error`);
  }
});
export default userRouter;
