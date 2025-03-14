import { Router, Request, Response } from "express";
import User from "../entities/User";
import { validate } from "class-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import dotenv from "dotenv";
import userMiddleware from "../middlewares/user";
import authMiddleware from "../middlewares/auth";

dotenv.config();

// me function is for checking if the user is authenticated or not
const me = async (req: Request, res: Response) => {
  res.json(res.locals.user);
  return;
};

const register = async (req: Request, res: Response) => {
  const { email, username, password } = req.body;
  try {
    let errors: any = {};
    // Check if the email is already in use
    const emailUser = await User.findOneBy({ email });
    const usernameUser = await User.findOneBy({ username });

    // If the email is already in use, return an error
    if (emailUser) errors.email = "Email is already taken";
    if (usernameUser) errors.username = "Username is already taken";

    // If there are any errors, return them
    if (Object.keys(errors).length > 0) {
      res.status(400).json(errors);
      return;
    }
    // Create the user
    const user = new User();
    user.email = email;
    user.username = username;
    user.password = password;

    // validity check under Entity
    errors = await validate(user);
    // 'validate' is a function for checking the validity of the entity.
    await user.save();
    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
    return;
    //500 is a server error.
  }
  console.log(email, username, password);
};
// reason using rea as : Resquest and Response is because of TypeScript's type inference.
// TypeScript can infer the type of the request and response objects based on the context in which they are used.

const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    if (username.trim() === "") {
      res.status(400).json({ username: "Username must not be empty" });
      return;
    }
    if (password === "") {
      res.status(400).json({ password: "Password must not be empty" });
      return;
    }

    // Find the user
    const user = await User.findOneBy({ username });
    if (!user) {
      res.status(404).json({ username: "User" + username + "not found" });
      return;
    }
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      res.status(401).json({ password: "Password is incorrect" });
      return;
    }
    // If the user is found, produce token and return the user
    const token = jwt.sign({ username }, process.env.JWT_SECRET);

    // Send the token in a HTTP-only cookie
    // res.cookie("token", token, {
    //   httpOnly: true,
    //   // secure: true, // for https
    //   // sameSite: "none", // for https
    // });

    res.cookie("token", token, {
      httpOnly: true, // 클라이언트에서 쿠키 읽기 방지
      maxAge: 60 * 60 * 24 * 7, // 1주일 (밀리초 단위)
      secure: process.env.NODE_ENV === "production", // HTTPS에서만 작동 (프로덕션 환경)
      path: "/", // 전체 사이트에서 쿠키 사용 가능
    });
    res.json({ user, token });
    return;
  } catch (err) {
    res.status(500).json(err);
    return;
  }
};

const logout = async (req: Request, res: Response) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });

  //   res.set(
  //     "Set-Cookie",
  //     cookie.serialize("token", "", {
  //       httpOnly: true,
  //       secure: process.env.NODE_ENV === "production",
  //       sameSite: "none",
  //       expires: new Date(0),
  //     }
  //   ))
};

// router.post("/register", (req, res) => {
//   res.send("Register route");
// })
const router = Router();
router.post("/register", register);
router.post("/login", login);
router.get("/me", userMiddleware, authMiddleware, me);
router.post("/logout", userMiddleware, authMiddleware, logout);

export default router;
