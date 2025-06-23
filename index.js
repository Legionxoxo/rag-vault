import "dotenv/config";
import express from "express";
import morgan from "morgan";
import uploadRoute from "./routes/upload.js";
import searchRoute from "./routes/search.js";
import { initDB } from "./lib/db.js";
import cors from "cors";

const app = express();
app.use(morgan("dev"));

app.use(
    cors({
        origin: "http://localhost:3001",
        credentials: true,
    })
);
app.use(express.json());

app.use("/upload", uploadRoute);
app.use("/search", searchRoute);

await initDB();

const PORT = 3000;
app.listen(PORT, () =>
    console.log(`🚀 Server running on http://localhost:${PORT}`)
);
