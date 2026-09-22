import {
  Remove as MinimizeIcon,
  Close as CloseIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import {
  Avatar,
  Badge,
  Box,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useAxiosAuth } from "../api/axiosClient";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import type {
  ICursor,
  IMessage,
  IncomingMessageData,
  selectedUser,
} from "../types/common";
import { wsManager } from "../socket/wsManager";

interface FloatingCHatProps {
  isChatOpen: boolean | undefined;
  selectedOtherUserAvatar: selectedUser;
  setSelectedOtherUserAvatar: React.Dispatch<
    React.SetStateAction<selectedUser>
  >;
  chatInput: string;
  setUserChat: React.Dispatch<React.SetStateAction<string>>;
  setUserChatVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setChatInput: React.Dispatch<React.SetStateAction<string>>;
  setIncomingMessageData: React.Dispatch<
    React.SetStateAction<IncomingMessageData>
  >;
}

const FloatingChatWidget = ({
  isChatOpen,
  selectedOtherUserAvatar,
  setSelectedOtherUserAvatar,
  chatInput,
  setUserChat,
  setUserChatVisible,
  setChatInput,
  setIncomingMessageData,
}: FloatingCHatProps) => {
  const bubbleTimer = import.meta.env.VITE_CHAT_BUBBLE_TIMEOUT;

  const [messages, setMessages] = useState<IMessage[]>();
  const [cursorId, setCursorId] = useState<string>("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIstyping] = useState(false);
  const [isTypingDebounceFlag, setIsTypingDebounceFlag] = useState(false);
  const [isMessagesLoading, setIsMessagesLoading] = useState<boolean>(true);

  const cursorRef = useRef<ICursor>({});
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const typingDebounceRef = useRef<boolean>(false);

  const axiosAuth = useAxiosAuth();
  const userData = useSelector((state: RootState) => state.user);
  const socket = useSelector((state: RootState) => state.socket.socket);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim().length === 0) return;

    setIstyping(false);

    setUserChat(chatInput);
    setUserChatVisible(true);
    setTimeout(() => {
      setUserChatVisible(false);
    }, bubbleTimer);

    // emiiting the chatmessage to other users
    if (!socket) return;
    setChatInput("");

    const date = new Date();

    const tempMesssage: IMessage = {
      id: `tempId_${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      content: chatInput,
      userId: userData.userId!,
      conversationId: selectedOtherUserAvatar?.conversationId!,
      createdAt: date,
      updatedAt: date,
      seenAt: null,
    };

    setMessages((prev) => {
      if (!prev) tempMesssage;
      else return [...prev, tempMesssage];
    });

    // console.log("selectedOtherAvatarUser", selectedOtherUserAvatar);

    if (!selectedOtherUserAvatar?.conversationId)
      wsManager.sendMessage({
        type: "proximity_message",
        payload: {
          content: chatInput,
          receiverId: selectedOtherUserAvatar?.userId!,
          roomId: userData.roomId,
        },
      });
    else
      wsManager.sendMessage({
        type: "chat_message",
        payload: {
          tempMessageId: tempMesssage.id,
          content: chatInput,
          // receiverId: selectedOtherUserAvatar[0]?.username!,
          conversationId: selectedOtherUserAvatar.conversationId,
        },
      });
  };

  const getConversationMessages = async () => {
    // const query = cursorRef.current[selectedOtherUserAvatar?.conversationId!]
    //   ? `?cursorId=${cursorRef.current[selectedOtherUserAvatar?.conversationId!]}`
    //   : "";
    if (!selectedOtherUserAvatar?.conversationId) {
      setIsMessagesLoading(false);
      setMessages([]);
      return;
    }

    let query = "";

    const { data: messagesData } = await axiosAuth.get(
      `chat/${selectedOtherUserAvatar?.conversationId}/messages${query}`,
    );

    if (messagesData) {
      setMessages(messagesData.messages.reverse());
      setCursorId(messagesData.updatedCursorId);
    }
  };

  useEffect(() => {
    if (!cursorId) return;
    cursorRef.current[selectedOtherUserAvatar?.conversationId!] = cursorId;
  }, [cursorId]);

  useEffect(() => {
    requestAnimationFrame(async () => {
      const el = scrollRef.current;
      if (!isChatOpen && !el) return;
      await getConversationMessages();
      setTimeout(() => {
        el?.scrollTo({
          top: el.scrollHeight,
          behavior: "smooth",
        });
      }, 200);
    });
  }, [isChatOpen, selectedOtherUserAvatar?.userId]);

  useEffect(() => {
    const handleChatMessage = async (data: {
      senderId: string;
      senderUsername: string;
      conversationId: string;
      content: string;
      message: IMessage;
      tempMessageId: string;
    }) => {
      const { senderId, senderUsername, content, message, tempMessageId } =
        data;
      setIstyping(false);

      setMessages((prev) => {
        if (!prev) message;
        else {
          let clone = [...prev];
          let updatedClone = clone.filter((msg) => msg.id !== tempMessageId);
          // console.log(updatedClone, message);
          return [...updatedClone, message];
        }
      });

      setIncomingMessageData((prev) => ({
        ...prev,
        senderId,
        senderUsername,
        content,
        isBubbleVisible: true,
      }));

      setTimeout(() => {
        setIncomingMessageData((prev) => ({
          ...prev,
          isBubbleVisible: false,
        }));
      }, bubbleTimer);
    };

    const handleIsTyping = async (data: { isTypingFlag: boolean }) => {
      const { isTypingFlag } = data;
      setIstyping(isTypingFlag);
      requestAnimationFrame(() => {
        const el = scrollRef.current;
        if (el)
          el.scrollTo({
            top: el.scrollHeight,
            behavior: "smooth",
          });
      });
      setTimeout(() => {
        setIstyping(false);
      }, 3800);
    };

    wsManager.subscribe("chat_message", handleChatMessage);
    wsManager.subscribe("isTyping", handleIsTyping);

    return () => {
      wsManager.unsubscribe("chat_message", handleChatMessage);
      wsManager.unsubscribe("isTyping", handleIsTyping);
    };
  }, []);

  // responsible for auto scroll to bottom when new mssg appears
  useEffect(() => {
    // console.log(messages);
    if (messages) {
      setIsMessagesLoading(false);
    }

    const el = scrollRef.current;
    if (!el) return;

    requestAnimationFrame(() => {
      // requestAnimationFrame Wait until browser  finished rendering and painting the latest DOM changes,
      const isNearBottom =
        el.scrollHeight - (el.scrollTop + el.clientHeight) < 100;

      if (isNearBottom) {
        el.scrollTo({
          top: el.scrollHeight,
          behavior: "smooth",
        });
      }
    });
  }, [messages]);

  useEffect(() => {
    if (typingDebounceRef.current) {
      setTimeout(() => {
        typingDebounceRef.current = false;
      }, 1000);
    }
  }, [isTypingDebounceFlag]);

  return (
    <>
      {isChatOpen ? (
        <>
          <Box
            sx={{
              position: "fixed",
              bottom: 10,
              right: 24,
              width: 320,
              zIndex: 1300,
              boxShadow: 6,
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              overflow: "hidden",
              backgroundColor: "#fff",
            }}
          >
            {/* chat Header */}
            <Box
              sx={{
                backgroundColor: "#ffffff",
                borderBottom: "1px solid #e0e0e0",
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Badge
                  variant="dot"
                  overlap="circular"
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  sx={{
                    "& .MuiBadge-badge": {
                      color: "#44b700",
                      backgroundColor: "#44b700",
                      boxShadow: "0 0 0 2px #fff",
                    },
                  }}
                >
                  <Avatar sx={{ width: 32, height: 32 }} />
                </Badge>
                <Typography
                  variant="subtitle1"
                  sx={{ color: "#1c1e21", fontWeight: 600 }}
                >
                  {selectedOtherUserAvatar?.username}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={0} alignContent="center">
                <IconButton
                  size="small"
                  onClick={() => {
                    setIsMinimized((prev) => !prev);
                  }}
                >
                  <MinimizeIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => {
                    setSelectedOtherUserAvatar((prev) => ({
                      ...prev!,
                      chatOpen: !prev?.chatOpen,
                    }));
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Box>

            {/* Chat Body Collapsable */}
            {!isMinimized ? (
              <>
                {/* Message Box */}
                <Box
                  sx={{
                    height: 180,
                    overflowY: "auto",
                    padding: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    backgroundColor: "#f9f9f9",
                    /* Modern standard fallback */
                    scrollbarWidth: "thin",
                    scrollbarColor: "#ccc transparent",

                    /* WebKit Scrollbar Fixes */
                    "&::-webkit-scrollbar": {
                      width:
                        "6px" /* Crucial: sets width so webkit styling applies correctly */,
                    },
                    "&::-webkit-scrollbar-button": {
                      display:
                        "none" /* Removes retro up/down arrows in Chromium/Brave */,
                    },
                    "&::-webkit-scrollbar-track": {
                      backgroundColor: "transparent",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: "rgba(0, 0, 0, 0.2)",
                      borderRadius: "3px",
                      "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.4)",
                      },
                    },
                  }}
                  ref={scrollRef}
                >
                  {!isMessagesLoading ? (
                    messages?.length! > 0 ? (
                      messages?.map((msg) => (
                        <Box
                          key={msg.id}
                          sx={{
                            display: "flex",
                            justifyContent:
                              msg.userId !== selectedOtherUserAvatar?.userId
                                ? "flex-end"
                                : "flex-start",
                          }}
                        >
                          <Paper
                            elevation={2}
                            sx={{
                              maxWidth: "70%",
                              width: "fit-content",
                              overflowWrap: "anywhere",
                              wordBreak: "break-word",
                              padding: "6px 10px",
                              borderRadius: 2,
                              backgroundColor:
                                msg.userId === selectedOtherUserAvatar?.userId
                                  ? "#0084ff"
                                  : "#e4e6eb",
                              color:
                                msg.userId === selectedOtherUserAvatar?.userId
                                  ? "#fff"
                                  : "#050505",
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: "0.875rem",
                                whiteSpace: "pre-line",
                                // maxWidth:'75%'
                                // outline:'1px solid red',
                              }}
                            >
                              {msg.content}
                            </Typography>
                          </Paper>
                        </Box>
                      ))
                    ) : (
                      <Typography
                        sx={{
                          color: "gray",
                          textAlign: "center",
                          marginTop: "4rem",
                        }}
                      >
                        Start the conversation.
                      </Typography>
                    )
                  ) : (
                    <ChatSkeleton />
                  )}

                  {/* Typing Indicator Bubble */}
                  {isTyping && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-start",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Avatar sx={{ width: 20, height: 20 }} />
                      <Paper
                        elevation={0}
                        sx={{
                          padding: "8px 12px",
                          borderRadius: 2,
                          backgroundColor: "#e4e6eb",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          width: "fit-content",
                        }}
                      >
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            backgroundColor: "#65676b",
                            borderRadius: "50%",
                            animation: "pulse 1.4s infinite ease-in-out both",
                            "@keyframes pulse": {
                              "0%, 80%, 100%": { transform: "scale(0)" },
                              "40%": { transform: "scale(1.0)" },
                            },
                            animationDelay: "0s",
                          }}
                        />
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            backgroundColor: "#65676b",
                            borderRadius: "50%",
                            animation: "pulse 1.4s infinite ease-in-out both",
                            animationDelay: "0.2s",
                          }}
                        />
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            backgroundColor: "#65676b",
                            borderRadius: "50%",
                            animation: "pulse 1.4s infinite ease-in-out both",
                            animationDelay: "0.4s",
                          }}
                        />
                      </Paper>
                    </Box>
                  )}
                </Box>

                {/* Input section */}
                <Box
                  component="form"
                  onSubmit={handleSubmit}
                  sx={{
                    padding: "8px 12px",
                    borderTop: "1px solid #e0e0e0",
                    backgroundColor: "#fff",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Type..."
                    value={chatInput}
                    onChange={(e) => {
                      setChatInput(e.target.value);
                      if (!typingDebounceRef.current) {
                        typingDebounceRef.current = true;
                        setIsTypingDebounceFlag((prev) => !prev);
                        wsManager.sendMessage({
                          type: "isTyping",
                          payload: {
                            isTypingFlag: true,
                            conversationId:
                              selectedOtherUserAvatar?.conversationId!,
                          },
                        });
                      }
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 4,
                        backgroundColor: "#f0f2f5",
                        "& .fieldset": { border: "none" },
                      },
                      // borderRadius:4
                    }}
                  />

                  <IconButton size="small" type="submit" color="primary">
                    <SendIcon fontSize="small" />
                  </IconButton>
                </Box>
              </>
            ) : null}
          </Box>
        </>
      ) : null}
    </>
  );
};

export default FloatingChatWidget;

function ChatSkeleton() {
  // Mock array representing message bubble widths and alignment
  const skeletonMessages = [
    { isUser: false, width: "60%" },
    { isUser: true, width: "45%" },
    { isUser: false, width: "75%" },
    { isUser: true, width: "30%" },
    { isUser: false, width: "50%" },
  ];

  return (
    // <Box sx={{ maxWidth: 600, margin: "0 auto", p: 2 }}>
    //   <Paper
    //     elevation={2}
    //     sx={{ p: 3, borderRadius: 3, bgcolor: "background.paper" }}
    //   >
    <Stack spacing={2.5}>
      {skeletonMessages.map((msg, index) => (
        <Box
          key={index}
          sx={{
            display: "flex",
            flexDirection: msg.isUser ? "row-reverse" : "row",
            alignItems: "flex-end",
            gap: 1.5,
          }}
        >
          {/* Avatar Skeleton */}
          {/* <Skeleton
            variant="circular"
            width={36}
            height={36}
            animation="wave"
            sx={{ flexShrink: 0 }}
          /> */}

          {/* Message Content Container */}
          <Box
            sx={{
              maxWidth: msg.width,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: msg.isUser ? "flex-end" : "flex-start",
            }}
          >
            {/* Bubble Skeleton */}
            <Skeleton
              variant="rounded"
              height={28}
              animation="wave"
              sx={{
                width: "100%",
                borderRadius: msg.isUser
                  ? "18px 18px 4px 18px"
                  : "18px 18px 18px 4px",
              }}
            />

            {/* Timestamp Skeleton */}
            <Skeleton
              variant="text"
              width={40}
              height={14}
              animation="wave"
              sx={{ mt: 0.5 }}
            />
          </Box>
        </Box>
      ))}
    </Stack>
    /* </Paper>
    </Box> */
  );
}
