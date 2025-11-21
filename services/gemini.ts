import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { ModelIds } from '../types';

// Initialize the client outside the component or hook to avoid recreation
// The API key is accessed via process.env.API_KEY as strictly required.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export class GeminiService {
  private chat: Chat | null = null;
  private currentModel: string;

  constructor(modelId: string = ModelIds.FLASH) {
    this.currentModel = modelId;
    this.initChat();
  }

  private initChat() {
    this.chat = ai.chats.create({
      model: this.currentModel,
      config: {
        systemInstruction: "You are a helpful, concise, and intelligent AI assistant. You use Markdown formatting to make your responses readable.",
      }
    });
  }

  public setModel(modelId: string) {
    this.currentModel = modelId;
    // Re-initialize chat when model changes to ensure correct context handling for that model
    this.initChat();
  }

  public async *sendMessageStream(message: string): AsyncGenerator<string, void, unknown> {
    if (!this.chat) {
      this.initChat();
    }

    try {
      if (!this.chat) throw new Error("Chat initialization failed");

      const responseStream = await this.chat.sendMessageStream({ message });

      for await (const chunk of responseStream) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
          yield c.text;
        }
      }
    } catch (error) {
      console.error("Error in Gemini stream:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();