import { createFileRoute } from "@tanstack/react-router";
import { handleTripChat } from "@/lib/chat.server";

export const Route = createFileRoute("/api/chat")({
  server: { handlers: { POST: ({ request }) => handleTripChat(request) } },
});
