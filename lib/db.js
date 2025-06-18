import pg from "pg";
const { Client } = pg;

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

export async function initDB() {
    await client.query(`
    CREATE EXTENSION IF NOT EXISTS vector;
    CREATE TABLE IF NOT EXISTS documents (
      id SERIAL PRIMARY KEY,
      content TEXT,
      embedding VECTOR(768)
    );
  `);
}

export async function insertEmbeddings(docs) {
    for (const doc of docs) {
        await client.query(
            "INSERT INTO documents (content, embedding) VALUES ($1, $2)",
            [doc.text, doc.embedding]
        );
    }
}

export async function searchSimilar(queryEmbedding, limit = 5) {
    const { rows } = await client.query(
        `SELECT content, embedding <#> $1 as distance
     FROM documents
     ORDER BY distance ASC
     LIMIT $2`,
        [queryEmbedding, limit]
    );
    return rows;
}
