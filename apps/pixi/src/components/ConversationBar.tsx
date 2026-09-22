import React, { useEffect, useState } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  TextField,
  InputAdornment,
  // Badge,
  Divider,
  IconButton,
  Slide,
  Skeleton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ChatIcon from "@mui/icons-material/Chat";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { wsManager } from "../socket/wsManager";
import { updateUserConversation } from "../redux/user/userSlice";
import type { selectedUser } from "../types/common";

interface IConversationBarProps {
  conversationBarVisible: boolean;
  // isChatOpen: boolean;
  selectedOtherUserAvatar: selectedUser;
  setSelectedOtherUserAvatar: React.Dispatch<
    React.SetStateAction<selectedUser>
  >;
  setChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const chatData = [
  {
    id: 1,
    name: "Alice Smith",
    message: "Hey, are we still meeting?",
    time: "10:45 AM",
    unread: 2,
    avatar: "",
  },
  {
    id: 2,
    name: "Dev Team",
    message: "PR merged successfully!",
    time: "9:15 AM",
    unread: 0,
    avatar: "",
  },
  {
    id: 3,
    name: "John Doe",
    message: "Check out this new repo.",
    time: "Yesterday",
    unread: 0,
    avatar: "",
  },
];

const ConversationBar = ({
  conversationBarVisible,
  // isChatOpen,
  // selectedOtherUserAvatar,
  setSelectedOtherUserAvatar,
  // setChatOpen,
}: IConversationBarProps) => {
  const [conversationLoading, setConversationLoading] = useState<boolean>(true);

  const userData = useSelector((state: RootState) => state.user);

  const dispatch = useDispatch();

  useEffect(() => {
    const handleConversationUpdate = async (data: {
      lastMessageContent: string;
      conversationId: string;
    }) => {
      const { lastMessageContent, conversationId } = data;
      // console.log("conversationBar Data", data);
      dispatch(updateUserConversation({ lastMessageContent, conversationId }));
    };

    wsManager.subscribe("conversation_update", handleConversationUpdate);

    return () => {
      wsManager.unsubscribe("conversation_update", handleConversationUpdate);
    };
  }, []);

  useEffect(() => {
    if (userData.conversations !== null) setConversationLoading(false);
    // console.log(userData.conversations);
  }, [userData.conversations]);

  return (
    <Slide
      direction="right"
      in={conversationBarVisible}
      mountOnEnter
      unmountOnExit
    >
      <Box
        sx={{
          width: 360,
          height: "100vh",
          bgcolor: "background.paper",
          borderRight: "1px solid",
          borderColor: "divider",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Sidebar Header */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            bgcolor: "#f0f2f5",
          }}
        >
          <Avatar sx={{ cursor: "pointer" }} />
          <Box>
            <IconButton size="small" sx={{ mr: 1 }}>
              <ChatIcon />
            </IconButton>
            <IconButton size="small">
              <MoreVertIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Search Bar */}
        <Box sx={{ p: 1.5, bgcolor: "#fff" }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search or start new chat"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" fontSize="small" />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 8,
                bgcolor: "#f0f2f5",
                "& fieldset": { border: "none" },
              },
            }}
          />
        </Box>

        <Divider />

        {/* Chat List */}
        <List sx={{ width: "100%", p: 0, overflowY: "auto", flexGrow: 1 }}>
          {!conversationLoading ? (
            userData.conversations?.length! > 0 ? (
              userData.conversations?.map((conversation, index) => (
                <React.Fragment key={conversation.id}>
                  <ListItem disablePadding>
                    <ListItemButton
                      alignItems="flex-start"
                      sx={{
                        py: 1.5,
                        "&:hover": { bgcolor: "#f5f6f6" },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          alt={
                            conversation?.usernames?.filter(
                              (elem) =>
                                elem.user.username !== userData?.username,
                            )[0].user.username
                          }
                          src={""}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        onClick={() => {
                          setSelectedOtherUserAvatar({
                            userId: conversation.chatMembersIds.filter(
                              (id) => id !== userData.userId,
                            )[0],
                            username: conversation?.usernames?.filter(
                              (elem) =>
                                elem.user.username !== userData?.username,
                            )[0].user.username,
                            chatOpen: true,
                            conversationId: conversation.id,
                          });
                        }}
                        disableTypography
                        primary={
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              // component='span'
                              sx={{ fontWeight: 600, color: "#111" }}
                            >
                              {
                                conversation?.usernames.filter(
                                  (elem) =>
                                    elem.user.username !== userData.username,
                                )[0].user.username
                              }
                            </Typography>
                            {/* <Typography
                          variant="caption"
                          sx={{
                            color:
                              chat.unread > 0 ? "#25d366" : "text.secondary",
                          }}
                        >
                          {conversation.updatedAt}
                        </Typography> */}
                          </Box>
                        }
                        secondary={
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              mt: 0.5,
                            }}
                          >
                            <Typography
                              variant="body2"
                              component="span"
                              sx={{
                                color: "text.secondary",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                maxWidth: "200px",
                              }}
                            >
                              {conversation?.lastMessage?.content}
                            </Typography>
                            {/* {chat.unread > 0 && (
                          <Badge
                            badgeContent={chat.unread}
                            color="success"
                            sx={{
                              "& .MuiBadge-badge": {
                                bgcolor: "#25d366",
                                color: "#fff",
                              },
                            }}
                          />
                        )} */}
                          </Box>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                  {index < chatData.length - 1 && (
                    <Divider variant="inset" component="li" sx={{ ml: 9 }} />
                  )}
                </React.Fragment>
              ))
            ) : (
              <Typography
                sx={{ color: "gray", textAlign: "center", paddingTop: "1rem" }}
              >
                "No Conversations yet."
              </Typography>
            )
          ) : (
            <ConversationSidebarSkeleton />
          )}
        </List>
      </Box>
    </Slide>
  );
};

export default ConversationBar;

const ConversationSidebarSkeleton = ({ itemCount = 6 }) => {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 320,
        height: "100%",
        borderRight: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        p: 1.5,
      }}
    >
      {/* Search Bar Skeleton */}
      <Box sx={{ mb: 2, px: 1 }}>
        <Skeleton
          variant="rounded"
          height={40}
          animation="wave"
          sx={{ borderRadius: 2 }}
        />
      </Box>

      {/* Conversation Item List Skeleton */}
      <List disablePadding>
        {Array.from({ length: 6 }).map((_, index) => (
          <React.Fragment key={index}>
            <ListItem
              alignItems="flex-start"
              sx={{
                px: 1,
                py: 1.25,
                borderRadius: 1.5,
                gap: 1.5,
              }}
            >
              {/* Avatar Skeleton */}
              <ListItemAvatar sx={{ minWidth: 0 }}>
                <Skeleton
                  variant="circular"
                  width={44}
                  height={44}
                  animation="wave"
                />
              </ListItemAvatar>

              {/* Text Lines Skeleton */}
              <ListItemText
                // margin="0"
                primary={
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 0.5,
                    }}
                  >
                    {/* User Name */}
                    <Skeleton
                      variant="text"
                      width="50%"
                      height={18}
                      animation="wave"
                    />
                    {/* Timestamp */}
                    <Skeleton
                      variant="text"
                      width="20%"
                      height={14}
                      animation="wave"
                    />
                  </Box>
                }
                secondary={
                  /* Message Snippet */
                  <Skeleton
                    variant="text"
                    width="80%"
                    height={14}
                    animation="wave"
                  />
                }
              />
            </ListItem>
            {index < itemCount - 1 && (
              <Divider
                variant="inset"
                component="li"
                sx={{ ml: 7, opacity: 0.5 }}
              />
            )}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};
