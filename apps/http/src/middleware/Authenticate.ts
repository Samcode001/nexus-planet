import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!; // It can be string or undefined

export const authenticateAccessToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const auth = req.headers["authorization"];
  if (!auth) return res.status(401).json({ message: "No token" });
  const parts = (auth as string).split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer")
    return res.status(401).json({ message: "Bad token" });
  const token = parts[1];
  try {
    const payload = jwt.verify(token, ACCESS_TOKEN_SECRET) as any;
    (req as any).user = payload;
    req.user = {
      id: payload.userId,
      username: payload.username,
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
