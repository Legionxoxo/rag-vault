import express from "express";
import multer from "multer";
import fs from "fs";
import { parseMarkdown } from "../lib/parser.js";
import { chunkText } from "../lib/chunker.js";
import { embedChunks } from "../lib/embedder.js";
import { insertEmbeddings } from "../lib/db.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// 👇 Use .array('files') instead of .single('file')
router.post("/", upload.array("files", 10), async (req, res) => {
    try {
        const results = [];

        for (const file of req.files) {
            const rawText = fs.readFileSync(file.path, "utf-8");
            const chunks = chunkText(parseMarkdown(rawText));
            const embedded = await embedChunks(chunks);
            await insertEmbeddings(embedded);
            fs.unlinkSync(file.path);
            results.push(file.originalname);
        }

        res.json({ message: "✅ Files uploaded and indexed", files: results });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Upload failed" });
    }
});

export default router;
