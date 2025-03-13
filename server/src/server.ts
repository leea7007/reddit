import express from "express";
import morgan from "morgan";
import { AppDataSource } from "./data-source";
import path from "path"; // path 모듈을 가져옵니다.
import "reflect-metadata";
import authRoutes from "./routes/auth";
import subRoutes from "./routes/subs";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();
const app = express();
const port = 4000;
const origin = process.env.ORIGIN;

app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(
  cors({
    origin: origin,
    credentials: true,
  })
);

// 정적 파일 제공 (예: React 빌드 파일)
app.use(express.static(path.join(__dirname, "../client/src/pages"))); // public 폴더를 정적 파일 경로로 설정

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.use("/api/auth", authRoutes);
app.use("/api/subs", subRoutes);

// app.get("/register", (req, res) => {
//   res.sendFile(path.join(__dirname, "../client/src/pages", "register.tsx")); // 모든 경로에서 React 앱을 반환
// });

app.listen(port, async () => {
  console.log(`Server is running on http://localhost:${port}`);

  AppDataSource.initialize()
    .then(() => {
      console.log("Data Source has been initialized!");
    })
    .catch((err) => {
      console.error("Error during Data Source initialization:", err);
    });
});
