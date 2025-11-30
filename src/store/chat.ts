import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Message {
    text: string;
    sender: "user" | "bot";
}

interface ChatState {
    messages: Message[];
    addMessage: (message: Message) => void;
    setMessages: (messages: Message[]) => void;
    clearChat: () => void;
}

export const useChatStore = create<ChatState>()(
    persist(
        (set) => ({
            messages: [
                {
                    sender: "bot",
                    text: "Hi, I’m Leo, your AI health assistant. How can I help you today?",
                },
            ],
            addMessage: (message) =>
                set((state) => ({ messages: [...state.messages, message] })),
            setMessages: (messages) => set({ messages }),
            clearChat: () =>
                set({
                    messages: [
                        {
                            sender: "bot",
                            text: "Hi, I’m Leo, your AI health assistant. How can I help you today?",
                        },
                    ],
                }),
        }),
        {
            name: "lifeline-chat-v1",
        }
    )
);
