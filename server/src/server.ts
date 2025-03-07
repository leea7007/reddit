import express from "express";
import morgan from "morgan";
import { AppDataSource } from "./data-source";
import "reflect-metadata";

const app = express();
const port = 5432;

app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

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
