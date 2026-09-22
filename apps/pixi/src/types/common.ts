export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT" | undefined;

export type ReadyKey = "SOCKET" | "AVATARS" | "PIXI";

export interface IPosition {
  x: number;
  y: number;
}

export interface IAvatar {
  userId: string;
  x: number;
  y: number;
  direction: Direction;
  avatar: string;
  username: string;
}

export type selectedUser = {
  userId: string;
  username: string;
  avatarId?: string;
  chatOpen: boolean;
  conversationId?: string | null;
} | null;

export interface IUserData {
  userId: string | null;
  username: string | null;
  avatarId: string | null;
  token: string | null;
  conversations: IConversation[] | null;
  roomId: string;
  selectedUser: selectedUser;
}

export type IConversation = {
  id: string;
  name: string;
  updatedAt: string;
  lastMessage: IConversationLastMessage;
  usernames: IConversationUsernames[];
  chatMembersIds: string[];
};

interface IConversationUsernames {
  user: {
    id: string;
    username: string;
  };
}
interface IConversationLastMessage {
  user: {
    id: string;
    username: string;
  };
  content: string;
}

export interface IncomingMessageData {
  senderId: string;
  senderUsername: string;
  content: string;
  messageRequestId: string;
  // conversationId: string | null;
  isBubbleVisible: boolean;
  isNotificationVisible: boolean;
  isMessageRequestAccepted: boolean;
}
export interface ICursor {
  [key: string]: string;
}

export interface IMessage {
  id: string;
  userId: string;
  conversationId: string;
  createdAt: Date;
  content: string;
  seenAt: Date | null;
  updatedAt: Date;
}
