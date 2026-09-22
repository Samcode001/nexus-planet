import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  IConversation,
  IUserData,
  selectedUser,
} from "../../types/common";

const initialState: IUserData = {
  userId: null,
  username: null,
  avatarId: null,
  token: null,
  conversations: null,
  roomId: "1",
  selectedUser: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (
      state,
      action: PayloadAction<{
        userId: string;
        username: string;
        avatarId: string;
      }>,
    ) => {
      state.userId = action.payload.userId;
      state.username = action.payload.username;
      state.avatarId = action.payload.avatarId;
    },
    setUserConversations: (state, action: PayloadAction<IConversation[]>) => {
      state.conversations = action.payload;
      // console.log("actionsPayload", action.payload);
    },
    addConversation: (state, action: PayloadAction<IConversation>) => {
      state.conversations?.push(action.payload);
    },
    setUserToken: (state, action: PayloadAction<{ token: string }>) => {
      state.token = action.payload.token;
    },
    updateUserConversation: (
      state,
      action: PayloadAction<{
        lastMessageContent: string;
        conversationId: string;
      }>,
    ) => {
      if (!state.conversations) return;
      const index = state.conversations.findIndex(
        (conversation) => conversation.id === action.payload.conversationId,
      );
      if (index === -1) return console.log("no conversation found to update");
      // console.log(
      //   "userSlice Conversation",
      //   current(state.conversations[index]),
      // );
      state.conversations[index].lastMessage.content =
        action.payload.lastMessageContent;
    },
    setSelectedUser: (state, action: PayloadAction<selectedUser>) => {
      state.selectedUser = action.payload;
    },
  },
});

export const {
  setUserData,
  setUserConversations,
  addConversation,
  setUserToken,
  updateUserConversation,
  setSelectedUser,
} = userSlice.actions;
export default userSlice.reducer;
