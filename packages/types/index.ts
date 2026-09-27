// the dicriminated union used bot on sending and recieving side of ws
//Dicriminated Union for Message
export type SendMessage =
  | { type: "join_conversation"; payload: IJoinConversation }
  | { type: "chat_message"; payload: IChatMessagePayload }
  | {
      type: "proximity_message";
      payload: IProximityMessagePayload;
    }
  | {
      type: "join_room";
      payload: IJoinRoom;
    }
  | {
      type: "move_avatar";
      payload: IMoveAvatar;
    }
  | {
      type: "message_request_accepted";
      payload: IMessageRequestAccept;
    }
  | {
      type: "isTyping";
      payload: ITyping;
    }
  | {
      type: "voice_ice";
      payload: IVoiceIce;
    }
  | {
      type: "voice_offer_recieved";
      payload: IVoiceOfferRecieved;
    }
  | {
      type: "voice_offer";
      payload: IVoiceOffer;
    }
  | {
      type: "voice_answer";
      payload: IVoiceAnswer;
    };

interface ITyping {
  isTypingFlag: boolean;
  conversationId: string;
}
interface IJoinRoom {
  roomId: string;
}

interface IJoinConversation {
  conversationId: string;
}

interface IMessageRequestAccept {
  senderId: string;
  conversation: IConversation;
  roomId: string;
}

interface IProximityMessagePayload {
  // senderId: string;
  content: string;
  receiverId: string;
  roomId: string;
  conversationId?: string;
}

interface IChatMessagePayload {
  // senderId: string;
  // receiverId: string;
  tempMessageId: string;
  conversationId: string;
  content: string;
}

interface IMoveAvatar {
  userId: string;
  username: string;
  x: number;
  y: number;
  direction: string;
  avatar: string;
  roomId: string;
}

type IConversation = {
  id: string;
  name: string;
  updatedAt: string;
  lastmessage: IConversationLastMessage;
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

interface IVoiceIce {
  candidate: RTCIceCandidate;
  recieverId: string;
  conversationId: string;
}

interface IVoiceOfferRecieved {
  recieverId: string;
  conversationId: string;
}

interface IVoiceOffer {
  offer: any;
  recieverId: string;
  conversationId: string;
}
interface IVoiceAnswer {
  answer: any;
  senderId: string;
  conversationId: string;
}
