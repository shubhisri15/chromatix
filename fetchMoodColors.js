export async function fetchMoodColors(colorsArray, mood) {
    const prompt = `Here is a list of 19 colors: ${colorsArray.join(", ")}. Based on the mood \"${mood}\", choose the best 5 and return only them as a JSON array.`;

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "openai/gpt-3.5-turbo",
            messages: [
                { role: "user", content: prompt }
            ]
        })
    });

    const data = await res.json();
    const reply = data.choices[0].message.content;

    try {
        return JSON.parse(reply);
    } catch {
        return reply.match(/#[0-9A-Fa-f]{6}/g) || [];
    }
}
