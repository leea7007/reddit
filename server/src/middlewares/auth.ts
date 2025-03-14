//auth.ts checks if the user is authenticated or not. If the user is authenticated, it will proceed to the next middleware. If not, it will return an error message.
//The user is authenticated if the token is present in the cookies. The token is verified using the JWT_SECRET.

import { NextFunction, Request, Response } from "express";
import User from "../entities/User";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user: User | undefined = res.locals.user;
    if (!user) throw new Error("Unauthenticated");

    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: "Unauthenticated" });
    return;
  }
};

