// middleware is for checking if the user is authenticated or not
// user.ts is for checking if the user is authenticated or not

import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../entities/User";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;

    if (!token) throw new Error("Unauthenticated");

    const { username }: any = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOneBy({ username });
    res.locals.user = user;
    next();
    return;
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: "Unauthenticated" });
    return;
  }
};
