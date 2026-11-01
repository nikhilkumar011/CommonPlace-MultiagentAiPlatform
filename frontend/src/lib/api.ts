export interface User {
  id: string;
  name: string;
  email: string;
  profilePic: string;
}

export interface Conversation {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageAttachment {
  name: string;
  mimeType: string;
  data: string;
}

export interface ChatMessage {
  _id: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  attachment?: MessageAttachment;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new ApiError(
      response.ok
        ? "The server returned an unreadable response."
        : `The request failed with status ${response.status}.`,
      response.status,
    );
  }

  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "message" in payload &&
      typeof payload.message === "string"
        ? payload.message
        : `The request failed with status ${response.status}.`;
    throw new ApiError(message, response.status);
  }

  return payload as T;
}
