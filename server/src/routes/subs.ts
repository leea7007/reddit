import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../entities/User";
import userMiddleware from "../middlewares/user";
import authMiddleware from "../middlewares/auth";
import Sub from "../entities/Sub";
import { AppDataSource } from "../data-source";
import Post from "../entities/Post";
import user from "../middlewares/user";

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
  console.log("res.locals.user", res.locals.user);
  const user = res.locals.user;
  if (!user) {
    res.status(500).json({ error: "Unauthenticated" });
    return;
  }

  try {
    const user: User = res.locals.user;
    const sub = new Sub(); // create a new sub instance
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

const topSubs = async (req: Request, res: Response) => {
  try {
    const imageUrlExp = `COALESCE('${process.env.APP_URL}/images/' || s."imageUrn", 'https://www.gravatar.com/avatar?d=mp&f=y')`;
    // COALESCE is a function that returns the first non-null value in a list of arguments.
    const subs = await AppDataSource.createQueryBuilder()
      .select(
        `s.title, s.name, ${imageUrlExp} as "imageUrl", count(p.id) as "postCount"`
      )
      .from(Sub, "s")
      .leftJoin(Post, "p", `s.name = p."subName"`)
      .groupBy('s.title, s.name, "imageUrl"')
      .orderBy(`"postCount"`, "DESC") // order by post count in descending order(more posts, higher rank)
      .limit(5)
      .execute();

    res.json(subs);
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
    return;
  }
};

const getSub = async (req: Request, res: Response) => {
  const name = req.params.name;

  try {
    const sub = await Sub.findOne({ where: { name } });

    if (!sub) {
      res.status(404).json({ error: "Community not found" });
      return;
    }
    res.json(sub);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const router = Router();

router.post("/", userMiddleware, authMiddleware, createSub);
router.get("/sub/topSubs", topSubs);
// router.post("/sub/topSubs", topSubs);
// sub/topSubs is a route for getting the top subs, auth is not required
router.get("/:name", userMiddleware, getSub);

export default router;
