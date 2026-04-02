import { Box, Typography } from "@mui/material";
import { memo, useEffect } from "react";
import { MdRecordVoiceOver } from "react-icons/md";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import type { selectedAvatar } from "../types/common";

interface Props {
  x: number;
  y: number;
  selectedOtherUserAvatar: selectedAvatar;
  setIsUserPermisssion: React.Dispatch<
    React.SetStateAction<{ permission: boolean; userStream: any }>
  >;
  visible: boolean;
  avatarId: string;
  setChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedOtherUserAvatar: React.Dispatch<
    React.SetStateAction<selectedAvatar>
  >;
  setMultiplePopupsVisible: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  avatarUsername: string;
}

const AvatarVoicePrompt = ({
  x,
  y,
  selectedOtherUserAvatar,
  setIsUserPermisssion,
  visible,
  avatarId,
  setChatOpen,
  setSelectedOtherUserAvatar,
  setMultiplePopupsVisible,
  avatarUsername,
}: Props) => {
  const isMobileView = useSelector(
    (state: RootState) => state.proximity.isMobileView,
  );
  const liftByDevice = !isMobileView ? -15 : -6;
  const leftDevice = !isMobileView ? 50 : 20;
  const lift = visible ? liftByDevice : -10; // goes up when near, down when far

  const hanldeUserClick = async (e: any) => {
    e.stopPropagation();
    console.log("speak Clicked");
    setMultiplePopupsVisible((prev) => ({ ...prev, [avatarUsername]: false }));
    // setIsUserPermisssion((prev) => ({
    //   ...prev,
    //   permission: !prev.permission,
    // }));
    // const stream = await navigator.mediaDevices.getUserMedia({
    // audio: true,
    // });
    // setIsUserPermisssion((prev) => ({ ...prev, userStream: stream }));
  };

  useEffect(() => {
    console.log(selectedOtherUserAvatar, visible, avatarId);
  }, [selectedOtherUserAvatar]);

  return (
    <div
      style={{
        position: "absolute",
        left: leftDevice,
        top: -30,
        transform: `translate3d(${Math.round(x)}px, ${Math.round(
          y + lift,
        )}px, 0)`,
        opacity: visible ? 1 : 0,
        pointerEvents: "none",
        zIndex: 9999,
        transition:
          "transform 180ms cubic-bezier(.2,.9,.2,1), opacity 140ms ease-out",
        willChange: "transform, opacity",
        cursor: "pointer",
      }}
    >
      {/* ACTION LIST */}
      <div
        style={{
          pointerEvents: "auto",
          transform: "translateX(-50%)",
          position: "relative",
          width: 0,
          height: 0,
        }}
      >
        {/*  VOICE – TOP RIGHT */}
        <div
          onClick={hanldeUserClick}
          style={{
            position: "absolute",
            transform: visible
              ? "translate(30px, -1px) scale(1)"
              : "translate(0px, 0px) scale(0.8)",
            opacity: visible ? 1 : 0,
            transition:
              "transform 200ms cubic-bezier(.2,.9,.2,1), opacity 140ms ease-out",
            padding: "4px 10px",
            fontSize: 12,
            borderRadius: 8,
            background: "rgba(20,20,20,0.85)",
            color: "#fff",
            boxShadow: "0 6px 14px rgba(0,0,0,0.35)",
            backdropFilter: "blur(4px)",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <Typography>Speak</Typography>
            <MdRecordVoiceOver size={18} />
          </Box>
        </div>

        <div
          onClick={(e) => {
            e.stopPropagation();
            console.log("chat clicked");
            setChatOpen((prev) => !prev);
            setSelectedOtherUserAvatar(null);
          }}
          style={{
            position: "absolute",
            transform: visible
              ? "translate(-30px, -1px) scale(1)"
              : "translate(0px, 0px) scale(0.8)",
            opacity: visible ? 1 : 0,
            transition:
              "transform 200ms cubic-bezier(.2,.9,.2,1), opacity 140ms ease-out",
            padding: "4px 10px",
            fontSize: 12,
            borderRadius: 8,
            background: "rgba(20,20,20,0.85)",
            color: "#fff",
            boxShadow: "0 6px 14px rgba(0,0,0,0.35)",
            backdropFilter: "blur(4px)",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          <Typography>Chat</Typography>
        </div>
      </div>
    </div>
  );
};

export default memo(AvatarVoicePrompt);
