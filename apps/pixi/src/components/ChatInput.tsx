import { Box, Button, TextField } from "@mui/material";
import React, { type PropsWithChildren } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import type { selectedAvatar } from "../types/common";
import CloseIcon from "@mui/icons-material/Close";
import { wsManager } from "../socket/wsManager";

interface IChatInput {
  chatInput: string;
  setChatInput: React.Dispatch<React.SetStateAction<string>>;
  setUserchat: React.Dispatch<React.SetStateAction<string>>;
  chatOpen: boolean;
  setUserchatVisible: React.Dispatch<React.SetStateAction<boolean>>;
  selectedOtherUserAvatar: selectedAvatar[];
  setChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
  avatarUsername: string;
  setSelectedOtherUserAvatar: React.Dispatch<
    React.SetStateAction<selectedAvatar[]>
  >;
}

const ChatInput = ({
  chatInput,
  setChatInput,
  setUserchat,
  chatOpen,
  setUserchatVisible,
  selectedOtherUserAvatar,
  setChatOpen,
  avatarUsername,
  setSelectedOtherUserAvatar,
}: PropsWithChildren<IChatInput>) => {
  const socket = useSelector((state: RootState) => state.socket.socket);
  const socketUserId = useSelector((state: RootState) => state.socket.userId);
  const socketUsername = useSelector(
    (state: RootState) => state.socket.username,
  );

  const bubbleTimer = import.meta.env.VITE_CHAT_BUBBLE_TIMEOUT;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // This is for the user to show his message in bubble
    setUserchat(chatInput);
    setUserchatVisible(true);
    setTimeout(() => {
      setUserchatVisible(false);
    }, bubbleTimer);

    // emiiting the chatmessage to other users
    if (!socket) return;
    setChatInput("");
    socket.emit("chat-message", {
      id: socketUserId,
      chat: chatInput,
    });
    wsManager.sendMessage({
      id: socketUserId,
      chat: chatInput,
    });
  };
  return (
    <>
      <form onSubmit={handleSubmit}>
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            right: 0,

            width: "22vw",
            minWidth: 250,

            backgroundColor: "#0a0a0a",
            border: "3px solid #7b2ff7",
            boxShadow: "0 0 12px #7b2ff7",
            padding: 2,
            borderRadius: "4px",

            display: "flex",
            flexDirection: "column",
            gap: 1,

            fontFamily: "'Press Start 2P', monospace",

            // --- Animation ---
            transform: chatOpen ? "translateY(0)" : "translateX(-120%)",
            opacity: chatOpen ? 1 : 0,
            transition:
              "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.25s ease-in-out",
            pointerEvents: chatOpen ? "auto" : "none", // prevents clicking while hidden
          }}
        >
          <CloseIcon
            sx={{
              color: "#d9ff00",
              position: "absolute",
              top: "-5px",
              right: "8px",
              cursor: "pointer",
              outline: "2px solid #d9ff00",
              borderRadius: "5px",
              backgroundColor: "black",
              ":hover": {
                color: "whitesmoke",
                outline: "2px solid whitesmoke",
                borderRadius: "5px",
              },
            }}
            onClick={() => {
              setSelectedOtherUserAvatar((prev) => {
                return prev.map((elem) =>
                  elem?.username === avatarUsername
                    ? { ...elem, chatOpen: !elem.chatOpen }
                    : elem,
                );
              });
            }}
          />
          <Box
            sx={{
              color: "#d9ff00",
              textAlign: "center",
              mb: 1,
              fontSize: "10px",
              textShadow: "0px 0px 4px #d9ff00",
            }}
          >
            {/* CHAT WINDOW ({selectedOtherUserAvatar?.username.toUpperCase()}) */}
            CHAT WINDOW {avatarUsername}
          </Box>

          {/* <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
        /> */}
          <TextField
            variant="outlined"
            placeholder="Type message..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            InputProps={{
              sx: {
                fontFamily: "'Press Start 2P', monospace",
                fontSize: "10px",
                color: "#fff",
                background: "#0f0f0f",
                borderRadius: "3px",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#7b2ff7",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#d9ff00",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#d9ff00",
                },
              },
            }}
          />

          <Button
            variant="contained"
            type="submit"
            //   onClick={handleSend}
            sx={{
              mt: 1,
              backgroundColor: "#d9ff00",
              color: "#000",
              fontFamily: "'Press Start 2P', monospace",
              fontSize: "10px",
              border: "2px solid #7b2ff7",
              boxShadow: "3px 3px 0px #7b2ff7",
              "&:hover": {
                backgroundColor: "#e5ff33",
                boxShadow: "1px 1px 0px #7b2ff7",
              },
            }}
          >
            SEND
          </Button>
        </Box>
      </form>
    </>
  );
};

export default ChatInput;
