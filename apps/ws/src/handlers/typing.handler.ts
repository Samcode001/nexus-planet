import type { CustomWebsocket } from "../types/index.js";

const handleTyping = (
  data: any,
  ws: CustomWebsocket,
  conversations: Record<string, Set<CustomWebsocket>>,
) => {
  const { isTypingFlag, conversationId } = data;
  const conversation = conversations[conversationId];

  conversation?.forEach((client) => {
    if (client.userId !== ws.userId)
      client.send(
        JSON.stringify({
          type: "isTyping",
          payload: {
            isTypingFlag,
          },
        }),
      );
  });
};

export default handleTyping;
