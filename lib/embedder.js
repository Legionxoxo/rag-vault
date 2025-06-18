const MODEL = "embedding-001";
const API_URL = `https://generativelanguage.googleapis.com/v1/models/${MODEL}:embedText`;

export async function embedChunks(chunks) {
    const embeddings = [];

    for (const chunk of chunks) {
        const res = await fetch(
            `${API_URL}?key=${process.env.GOOGLE_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: chunk }),
            }
        );

        const raw = await res.text(); // only read once
        let data;

        try {
            data = JSON.parse(raw);
        } catch (e) {
            console.error("❌ Could not parse JSON from Gemini:\n", raw);
            throw new Error("Invalid JSON from Gemini API");
        }

        if (!data.embedding || !data.embedding.values) {
            console.error("❌ Unexpected Gemini response structure:\n", data);
            throw new Error("Gemini did not return embedding");
        }

        embeddings.push({ text: chunk, embedding: data.embedding.values });
    }

    return embeddings;
}
