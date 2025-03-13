import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../entities/User";
import userMiddleware from "../middlewares/user";
import authMiddleware from "../middlewares/auth";
import Sub from "../entities/Sub";
import { AppDataSource } from "../data-source";

const createSub = async (req: Request, res: Response) => {
  const { name, title, description } = req.body;

  // get user data
  //if no user data,
  const token = req.cookies.token;
  if (!token) throw new Error("Unauthenticated");

  const sub = await AppDataSource.getRepository(Sub)
    .createQueryBuilder("sub")
    .where("lower(sub.name) = :name", { name: name.toLowerCase() })
    .getOne();

  if (sub) {
    res.status(400).json({ name: "Sub exists already" });
    return;
  }

  //   const { username } = jwt.verify(token, process.env.JWT_SECRET);
  //   const user = await User.findOneBy({ username });
  const user = res.locals.user;
  if (!user) {
    res.status(500).json({ error: "Unauthenticated" });
    return;
  }

  try {
    const user: User = res.locals.user;
    sub.name = name;
    sub.title = title;
    sub.description = description;
    sub.user = user;

    await sub.save();
    res.json(sub);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
    return;
  }

  // if user data exists, create a new sub

  // return the new sub
};

const router = Router();

router.post("/", userMiddleware, authMiddleware, createSub);

export default router;
