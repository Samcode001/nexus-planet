import { Stage } from "@pixi/react";
import useDimensions from "../hook/useDimensions";
import { useEffect, useRef, useState } from "react";
import { useAxiosAuth } from "../api/axiosClient";
import MainContainer from "./MainContainer";
import { Box } from "@mui/material";
// import ChatInput from "./ChatInput";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { useAppDispatch } from "../redux/hook";
import type {
  Direction,
  IAvatar,
  IConversation,
  IncomingMessageData,
  selectedUser,
} from "../types/common";
import { setJoyDirection } from "../redux/Proximity/proximitySlice";
import useJoyStick from "../hook/useJoyStick";
import AvatarPrompts from "./AvatarPrompts";
// import IncomingCallPopup from "./IncomigCallPopup";
import { addConversation, setUserConversations } from "../redux/user/userSlice";
import { wsManager } from "../socket/wsManager";
import FloatingChatWidget from "./FloatingChatWidget";
import ConversationBar from "./ConversationBar";

const Arena = ({
  socket,
  mobileView,
  setIsUserPermisssion,
  conversationBarVisible,
}: any) => {
  const isNearby = useSelector((state: RootState) => state.proximity.isNearby);
  const canvasSize = useDimensions();
  const [userSprite, setUserSprite] = useState<string>("/avatars/hero.png");
  const [userChat, setUserchat] = useState("");
  // const [userChatId, setUserChatId] = useState<Record<string, boolean>>({});
  const [userChatVisible, setUserchatVisible] = useState(false);
  const [usersAvatars, setUsersAvatars] = useState<IAvatar[]>([]);
  const [nearbyPlayers, setNearbyPlayers] = useState<string[]>([]);
  const [screenPos, setScreenPos] = useState<
    Record<string, { x: number; y: number }>
  >({});
  const [selectedOtherUserAvatar, setSelectedOtherUserAvatar] =
    useState<selectedUser>(null);
  const [multiplePopupsVisible, setMultiplePopupsVisible] = useState<
    Record<string, boolean>
  >({});

  // ------ Chat States ---------------------------------------
  const [chatInput, setChatInput] = useState("");
  const [_, setChatOpen] = useState(false);
  const [incomingMessageData, setIncomingMessageData] =
    useState<IncomingMessageData>({
      senderId: "",
      senderUsername: "",
      content: "",
      isBubbleVisible: false,
      isNotificationVisible: false,
      isMessageRequestAccepted: false,
      messageRequestId: "",
    });

  const onScreenPos = useRef<Record<string, { x: number; y: number }>>({});
  // const multiplePopupsVisibleRef = useRef<boolean>(false);
  const dispatch = useAppDispatch();

  const userData = useSelector((state: RootState) => state.user);
  const axiosAuth = useAxiosAuth();

  // console.log(socketToken, socketUserId);

  const getuserAvatar = async () => {
    const res = await axiosAuth.get("user/avatar");
    if (res.status === 200 && res.data.avatarId) {
      let avatar = `/avatars/${res.data.avatarId}.png`;
      setUserSprite(avatar);
    }
  };

  const getUserConversations = async () => {
    try {
      const { data } = await axiosAuth.get("chat/conversation");

      // console.log("conversations", data, data.conversations);
      dispatch(setUserConversations(data.conversations));
      const conversationsId = data.conversations.map(
        (elem: IConversation) => elem.id,
      );

      if (conversationsId.length > 0)
        // wsManager.joinConversations(conversationsId);
        wsManager.setConversations(conversationsId);
    } catch (error) {
      console.log("Error on getting conversations", error);
    }
  };

  const getOtherUserPostions = () => {
    // let otherUser = usersAvatars[0];
    // xRef.current = otherUser.x;
    // yRef.current = otherUser.y;
    // console.log(usersAvatars);
  };

  // const hanldePosChange = (avatar: IAvatar) => {
  //   multiplePopupsVisibleRef.current =
  //     selectedOtherUserAvatar?.username === avatar.username && isNearby;
  // };
  // const { socket, socketUserId, socketAvatarId } = Socket();
  useEffect(() => {
    getuserAvatar();
    getUserConversations();

    let raf: number;
    let last = 0;

    const loop = (t: number) => {
      if (t - last > 33) {
        // ~30fps
        setScreenPos((prev) => {
          const next = onScreenPos.current;

          // prevent useless renders
          for (const k in next) {
            if (
              !prev[k] ||
              prev[k].x !== next[k].x ||
              prev[k].y !== next[k].y
            ) {
              return { ...next };
            }
          }
          return prev;
        });
        last = t;
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    // console.log("SeleceddOtherUSeravatar", selectedOtherUserAvatar);
    // console.log("multiplePopupsVisible", multiplePopupsVisible);
    // console.log("userData", userData);
  }, [userData]);

  useEffect(() => {
    if (usersAvatars.length === 0) return;
    getOtherUserPostions();
  }, [usersAvatars, isNearby]);
  // console.log(useBootStore.getState().ready);

  // the accepting of a request message send by a another user
  useEffect(() => {
    const handleMessageRequestAccepted = async () => {
      try {
        if (!incomingMessageData.isMessageRequestAccepted) return;

        console.log(
          "incoming message accepted initiating conversation creation .",
        );

        const { data } = await axiosAuth.post(
          `chat/message-request/${incomingMessageData.messageRequestId}/accept`,
          {
            name: `${incomingMessageData.senderUsername}&${userData.username}`,
          },
        );

        if (data.conversation) {
          console.log("conversation created");
          dispatch(addConversation(data.conversation));

          wsManager.sendMessage({
            type: "join_conversation",
            payload: {
              conversationId: data.conversation.id,
            },
          });

          wsManager.sendMessage({
            type: "message_request_accepted",
            payload: {
              senderId: incomingMessageData.senderId,
              conversation: data.conversation,
              roomId: userData.roomId,
            },
          });
        }
      } catch (error) {
        console.log("Error on creating conversation", error);
      }
    };

    handleMessageRequestAccepted();
  }, [incomingMessageData.isMessageRequestAccepted]);

  //sender side function when reciver accepts the message ,sender recive the conversation to join it
  useEffect(() => {
    const handleConversationCreated = async (data: {
      conversation: IConversation;
      senderId: string;
    }) => {
      // console.log("entered MessageRequestAccept funtion",data);

      dispatch(addConversation(data.conversation));

      // joining conversation which created by reciver who accepts the message
      wsManager.sendMessage({
        type: "join_conversation",
        payload: {
          conversationId: data.conversation.id,
        },
      });

      setSelectedOtherUserAvatar((prev) => {
        // console.log("prev", prev, "data", data);
        // if (prev?.userId !== data.senderId) return prev;
        return {
          ...prev!,
          conversationId: data.conversation.id,
        };
      });
      console.log("Conversation joined");
    };

    wsManager.subscribe("message_request_accepted", handleConversationCreated);

    return () => {
      wsManager.unsubscribe(
        "message_request_accepted",
        handleConversationCreated,
      );
    };
  }, []);

  // ------------ Joy stick movments

  let lastSent = 0;

  const joystickMovements = (direction: Direction) => {
    const now = performance.now();
    if (now - lastSent < 20) return;
    lastSent = now;
    // console.log(joystickDirection);
    // joyStickDirectionRef.current = direction;
    // console.log(direction);
    dispatch(setJoyDirection(direction));
    // useControls("joy", direction);
    // setJoystickDirection(direction);
  };

  const { getJoystickDirection } = useJoyStick(mobileView, joystickMovements);

  return (
    <>
      <Box sx={{ position: "relative", padding: 0, minWidth: "0px" }}>
        <Stage
          height={canvasSize.height}
          width={canvasSize.width}
          options={{ backgroundAlpha: 0 }}
          // style={{ pointerEvents: "none" }}
        >
          <MainContainer
            canvasSize={canvasSize}
            userSprite={userSprite}
            socket={socket}
            userData={userData}
            chatInput={chatInput}
            userChat={userChat}
            userChatVisible={userChatVisible}
            dispatch={dispatch}
            isNearby={isNearby}
            getJoystickDirection={getJoystickDirection}
            setNearbyPlayers={setNearbyPlayers}
            nearbyPlayers={nearbyPlayers}
            setUsersAvatars={setUsersAvatars}
            usersAvatars={usersAvatars}
            onScreenPos={onScreenPos}
            setSelectedOtherUserAvatar={setSelectedOtherUserAvatar}
            setMultiplePopupsVisible={setMultiplePopupsVisible}
            multiplePopupsVisible={multiplePopupsVisible}
            incomingMessageData={incomingMessageData}
            setIncomingMessageData={setIncomingMessageData}
          />
        </Stage>
        {/* {selectedOtherUserAvatar.map((avatar) => (
        ))} */}
        {/* <ChatInput
          // key={sel?.id}
          chatInput={chatInput}
          setChatInput={setChatInput}
          chatOpen={selectedOtherUserAvatar?.chatOpen!}
          setUserchat={setUserchat}
          setUserchatVisible={setUserchatVisible}
          selectedOtherUserAvatar={selectedOtherUserAvatar}
          // setChatOpen={setChatOpen}
          avatarUsername={selectedOtherUserAvatar?.username!}
          setSelectedOtherUserAvatar={setSelectedOtherUserAvatar}
        /> */}
        <Box sx={{ position: "fixed", top: 0, zIndex: 1300 }}>
          <ConversationBar
            conversationBarVisible={conversationBarVisible}
            // isChatOpen={selectedOtherUserAvatar?.chatOpen}
            selectedOtherUserAvatar={selectedOtherUserAvatar}
            setSelectedOtherUserAvatar={setSelectedOtherUserAvatar}
            setChatOpen={setChatOpen}
          />
        </Box>

        <FloatingChatWidget
          isChatOpen={selectedOtherUserAvatar?.chatOpen}
          selectedOtherUserAvatar={selectedOtherUserAvatar}
          setSelectedOtherUserAvatar={setSelectedOtherUserAvatar}
          setUserChat={setUserchat}
          setUserChatVisible={setUserchatVisible}
          setChatInput={setChatInput}
          chatInput={chatInput}
          setIncomingMessageData={setIncomingMessageData}
        />
        {usersAvatars.map((avatar) => {
          const pos = screenPos[avatar.username];
          if (!pos) return null;
          return (
            <Box key={avatar.userId}>
              <AvatarPrompts
                x={pos.x}
                y={pos.y}
                selectedOtherUserAvatar={selectedOtherUserAvatar}
                visible={multiplePopupsVisible[avatar.username] ?? false}
                setIsUserPermisssion={setIsUserPermisssion}
                avatarId={avatar.userId}
                avatarUsername={avatar.username}
                setChatOpen={setChatOpen}
                setSelectedOtherUserAvatar={setSelectedOtherUserAvatar}
                setMultiplePopupsVisible={setMultiplePopupsVisible}
              />
              {/* <IncomingCallPopup
                x={pos.x}
                y={pos.y}
                visible={offerVisible}
                setOfferVisible={setOfferVisible}
                caller={{ from: avatar.username, username: avatar.username }}
                avatarId={avatar.userId}
              /> */}
            </Box>
          );
        })}
      </Box>
    </>
  );
};

export default Arena;
