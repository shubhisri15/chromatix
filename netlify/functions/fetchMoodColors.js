exports.handler = async function (event, context) {
  try {
    const { colorsArray, mood } = JSON.parse(event.body);

    if (!colorsArray || !Array.isArray(colorsArray) || !mood) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing or invalid parameters" })
      };
    }

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

    let parsed;
    try {
      parsed = JSON.parse(reply);
    } catch {
      parsed = reply.match(/#[0-9A-Fa-f]{6}/g) || [];
    }

    return {
      statusCode: 200,
      body: JSON.stringify(parsed)
    };

  } catch (error) {
    console.error("Error in fetchMoodColors function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error" })
    };
  }
};
