export async function embedChunks(chunks) {
    const res = await fetch("http://localhost:5005/embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts: chunks }),
    });

    const data = await res.json();
    const embeddings = data.embeddings.map((embedding, i) => ({
        text: chunks[i],
        embedding,
    }));

    return embeddings;
}
