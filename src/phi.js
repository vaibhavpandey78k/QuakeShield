import OpenAI from "openai";

const client = new OpenAI({
  apiKey: import.meta.env.VITE_GITHUB_TOKEN,
  baseURL: "https://models.inference.ai.azure.com",
  dangerouslyAllowBrowser: true,
});

export async function analyzeWithPhi(report) {
  try {
    const response = await client.chat.completions.create({
      model: "Phi-4-mini-instruct",

      messages: [
        {
          role: "system",
          content: `
You are QuakeShield AI.

You extract structured disaster intelligence.

You MUST return ONLY valid JSON.

Never explain.
Never use markdown.
Never provide safety advice.
Never answer unrelated questions.

Always follow this JSON schema exactly:

{
  "category": "",
  "priority": "",
  "victims": "",
  "confidence": "",
  "action": ""
}
`,
        },

        {
          role: "user",
          content: "School collapsed in Manila. 25 children trapped.",
        },

        {
          role: "assistant",
          content: `{
  "category":"Structural Collapse",
  "priority":"Critical",
  "victims":"25",
  "confidence":"94",
  "action":"Deploy Urban Search & Rescue Team"
}`,
        },

        {
          role: "user",
          content: "Hospital overwhelmed after earthquake.",
        },

        {
          role: "assistant",
          content: `{
  "category":"Medical Emergency",
  "priority":"High",
  "victims":"Unknown",
  "confidence":"89",
  "action":"Deploy Medical Support Units"
}`,
        },

        {
          role: "user",
          content: "Major road blocked by earthquake debris.",
        },

        {
          role: "assistant",
          content: `{
  "category":"Infrastructure Damage",
  "priority":"Medium",
  "victims":"Unknown",
  "confidence":"78",
  "action":"Dispatch Road Clearance Teams"
}`,
        },

        {
          role: "user",
          content: report,
        },
      ],

      temperature: 0,
    });

    return response.choices[0].message.content;

  } catch (error) {
    console.error("Phi Error:", error);
    throw error;
  }
}