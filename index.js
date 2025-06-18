import "dotenv/config";
import express from "express";
import morgan from "morgan";
import uploadRoute from "./routes/upload.js";
import searchRoute from "./routes/search.js";
import { initDB } from "./lib/db.js";

const app = express();
app.use(morgan("dev"));
app.use(express.json());

app.use("/upload", uploadRoute);
app.use("/search", searchRoute);

await initDB();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
    console.log(`🚀 Server running on http://localhost:${PORT}`)
);
