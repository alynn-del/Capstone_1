async function askGemini(prompt, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      const overloaded = err.status === 503 || err.status === 429;
      if (overloaded && attempt < retries) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1))); // wait 1s, then 2s
        continue; // try again
      }
      throw err; // out of retries, or a real error — let the route handle it
    }
  }
}