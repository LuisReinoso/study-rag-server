// The only LLM contract the rest of the code depends on. A new backend is a new
// adapter implementing this; no business logic references a concrete provider.

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
}

export interface LLMProvider {
  readonly name: string;
  chat(messages: ChatMessage[], opts?: ChatOptions): Promise<string>;
  embed(texts: string[]): Promise<number[][]>;
}
