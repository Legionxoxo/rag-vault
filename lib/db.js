import pg from "pg";
const { Client } = pg;

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

export async function initDB() {
    await client.query(`
        CREATE EXTENSION IF NOT EXISTS vector;

        CREATE TABLE IF NOT EXISTS documents (
            id SERIAL PRIMARY KEY,
            filename TEXT,
            content TEXT,
            embedding VECTOR(384)
        );
    `);

    // Add 'filename' column if it doesn't exist
    try {
        await client.query(`
            ALTER TABLE documents ADD COLUMN IF NOT EXISTS filename TEXT;
        `);
    } catch (err) {
        console.error("Failed to add filename column:", err.message);
    }

    // Ensure embedding vector has correct dimension
    try {
        await client.query(`
            ALTER TABLE documents ALTER COLUMN embedding TYPE vector(384);
        `);
    } catch (err) {
        if (!err.message.includes("already of type vector(384)")) {
            console.error("Failed to alter vector dimension:", err.message);
        }
    }
}

//  insert with filename
export async function insertEmbeddings(docs, filename) {
    // 1. Delete old data for this filename
    await client.query(`DELETE FROM documents WHERE filename = $1`, [filename]);

    // 2. Insert new data
    for (const doc of docs) {
        await client.query(
            `INSERT INTO documents (filename, content, embedding) VALUES ($1, $2, $3)`,
            [filename, doc.text, `[${doc.embedding.join(",")}]`]
        );
    }
}

// 🔍 Updated: return filename in search results
export async function searchSimilar(queryEmbedding, limit = 5) {
    const pgEmbedding = `[${queryEmbedding.join(",")}]`;
    const { rows } = await client.query(
        `SELECT filename, content, embedding <#> $1 AS distance
         FROM documents
         ORDER BY distance ASC
         LIMIT $2`,
        [pgEmbedding, limit]
    );
    return rows;
}
