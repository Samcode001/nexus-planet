import type { CustomWebsocket } from "../types/index.js";

const handleJoinConversation = (
  data: any,
  ws: CustomWebsocket,
  conversations: Record<string, Set<CustomWebsocket>>,
) => {
  const { conversationId } = data;

  if (!conversations[conversationId]) conversations[conversationId] = new Set();

  conversations[conversationId].add(ws);
};

export default handleJoinConversation;
