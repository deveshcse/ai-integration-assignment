import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";

export const llmLib = {
  chatCompletion: async (
    systemPrompt: string,
    userMessage: string
  ): Promise<string> => {
    const apiKey = process.env.GROQ_API;
    const modelName = "llama-3.3-70b-versatile";

    if (!apiKey) {
      throw new Error("Missing GROQ_API environment variable.");
    }

    const model = new ChatOpenAI({
      apiKey,
      configuration: {
        baseURL: "https://api.groq.com/openai/v1",
      },
      modelName,
      temperature: 0.2,
    });

    const parser = new StringOutputParser();
    const chain = model.pipe(parser);

    try {
      return await chain.invoke([
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ]);
    } catch (err) {
      throw new Error(`Groq LangChain execution failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  },
};

export const chatCompletion = (systemPrompt: string, userMessage: string) =>
  llmLib.chatCompletion(systemPrompt, userMessage);
