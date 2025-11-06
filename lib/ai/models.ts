export const DEFAULT_CHAT_MODEL: string = "chat-model";

export type ChatModel = {
  id: string;
  name: string;
  description: string;
};

export const chatModels: ChatModel[] = [
  {
    id: "chat-model",
    name: "GPT-4o",
    description: "OpenAI GPT-4o via Vercel AI Gateway",
  },
  {
    id: "chat-model-reasoning",
    name: "GPT-4o-mini (Reasoning)",
    description:
      "Uses advanced chain-of-thought reasoning for complex problems",
  },
];
