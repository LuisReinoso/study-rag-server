// La ÚNICA interfaz que el resto del código conoce de un LLM. Cambiar de backend
// (llama.cpp, Ollama, LM Studio, vLLM, una API remota) = otro adaptador que implemente
// esto. Nada de lógica de negocio depende de un proveedor concreto.

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
}

export interface LLMProvider {
  /** Identificador legible (para logs/health). */
  readonly name: string;
  /** Genera una respuesta de chat. */
  chat(messages: ChatMessage[], opts?: ChatOptions): Promise<string>;
  /** Devuelve el embedding de cada texto (mismo orden que la entrada). */
  embed(texts: string[]): Promise<number[][]>;
}
