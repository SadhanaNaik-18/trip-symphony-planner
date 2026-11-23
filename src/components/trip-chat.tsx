import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Compass, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import type { TripInput, TripResult } from "@/lib/trip-types";

export function TripChat({ input, result }: { input: TripInput; result: TripResult | null }) {
  const [draft, setDraft] = useState("");
  const textarea = useRef<HTMLTextAreaElement>(null);
  const trip = useRef({ input, result });
  useEffect(() => {
    trip.current = { input, result };
  }, [input, result]);
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat", body: () => ({ trip: trip.current }) }),
    [],
  );
  const { messages, sendMessage, status, stop, error, setMessages, clearError } = useChat({
    transport,
  });
  const busy = status === "submitted" || status === "streaming";
  useEffect(() => {
    const active = document.activeElement;
    if (
      active === document.body ||
      active === textarea.current ||
      active instanceof HTMLButtonElement
    )
      textarea.current?.focus({ preventScroll: true });
  }, [status]);
  async function ask(text: string) {
    if (busy || !text.trim()) return;
    clearError();
    setDraft("");
    textarea.current?.focus({ preventScroll: true });
    await sendMessage({ text: text.trim() });
  }
  return (
    <section id="trip-chat" className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Compass className="size-7 text-primary" />
          <h2 className="text-2xl font-bold">AI chat board</h2>
        </div>
        <Button
          size="icon"
          variant="outline"
          aria-label="Clear conversation"
          title="Clear conversation"
          disabled={busy || messages.length === 0}
          onClick={() => {
            setMessages([]);
            clearError();
            textarea.current?.focus();
          }}
        >
          <RotateCcw />
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Trip: {input.origin} → {input.destination} · {input.days} days
      </p>
      <div className="overflow-hidden rounded-lg border bg-card">
        <Conversation className="h-96">
          <ConversationContent className="p-4 sm:p-6">
            {messages.length === 0 && (
              <div className="py-6">
                <h3 className="text-xl font-bold">What would you like to know?</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    "How can I reduce my trip cost?",
                    "What should I pack?",
                    "What is the best way to travel?",
                  ].map((q) => (
                    <Button
                      key={q}
                      variant="outline"
                      size="sm"
                      className="h-auto whitespace-normal py-2 text-left"
                      onClick={() => void ask(q)}
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((message) => (
              <Message from={message.role} key={message.id}>
                <MessageContent
                  className={
                    message.role === "user"
                      ? "group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground"
                      : ""
                  }
                >
                  {message.parts.map((part, i) =>
                    part.type === "text" ? (
                      <MessageResponse key={i}>{part.text}</MessageResponse>
                    ) : part.type === "reasoning" ? (
                      <details key={i} className="text-xs text-muted-foreground">
                        <summary>Trip reasoning</summary>
                        <MessageResponse>{part.text}</MessageResponse>
                      </details>
                    ) : null,
                  )}
                </MessageContent>
              </Message>
            ))}
            {status === "submitted" && <Shimmer>Checking your trip…</Shimmer>}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
        <div className="border-t p-4">
          {error && (
            <p role="alert" className="mb-3 break-words text-sm text-destructive">
              {error.message}
            </p>
          )}
          <PromptInput onSubmit={({ text }) => ask(text)}>
            <PromptInputTextarea
              ref={textarea}
              aria-label="Ask a trip question"
              placeholder="Ask about routes, budget, places, or your travel doubts…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={3000}
            />
            <PromptInputFooter className="justify-end">
              <PromptInputSubmit
                status={status}
                onStop={() => void stop()}
                disabled={!busy && !draft.trim()}
                title={busy ? "Stop answer" : "Send question"}
              />
            </PromptInputFooter>
          </PromptInput>
          <p className="mt-3 text-xs text-muted-foreground">
            AI advice may be inaccurate. Confirm current fares, opening hours, and road conditions
            before travel.
          </p>
        </div>
      </div>
    </section>
  );
}
