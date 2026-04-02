import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { Typography } from "@mui/material";
import { memo, useEffect } from "react";

type CallPopup = {
  caller: { from: string; username: string };
  visible: boolean;
  x: number;
  y: number;
  setOfferVisible: React.Dispatch<React.SetStateAction<boolean>>;
  avatarId: string;
};

const IncomingCallPopup = ({
  x,
  y,
  caller,
  visible,
  setOfferVisible,
  avatarId,
}: CallPopup) => {
  const isMobileView = useSelector(
    (state: RootState) => state.proximity.isMobileView
  );
  const USER_ID = useSelector((state: RootState) => state.socket.userId);

  const liftByDevice = !isMobileView ? -15 : -6;
  const leftDevice = !isMobileView ? 50 : 20;
  const lift = visible ? liftByDevice : -10;

  const handleAnswer = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("answer");
    setOfferVisible(false);
  };

  const handleReject = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("reject");
    setOfferVisible(false);
  };

  useEffect(() => {
    console.log(avatarId, USER_ID);
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        left: leftDevice,
        top: -30,
        transform: `translate3d(${Math.round(x)}px, ${Math.round(
          y + lift
        )}px, 0)`,
        opacity: visible ? 1 : 0,
        pointerEvents: "none",
        zIndex: 9999,
        transition:
          "transform 180ms cubic-bezier(.2,.9,.2,1), opacity 140ms ease-out",
        willChange: "transform, opacity",
      }}
    >
      {/* TITLE */}
      <div
        style={{
          transform: "translate(-30%,-10%)",
          marginBottom: 6,
          fontSize: 16,
          color: "#fff",
          textShadow: "0 2px 6px rgba(0,0,0,0.6)",
          whiteSpace: "nowrap",
        }}
      >
        <strong>{caller.username.toUpperCase()}</strong> is calling
      </div>

      {/* ACTIONS */}
      <div
        style={{
          pointerEvents: "auto",
          transform: "translateX(-50%)",
          position: "relative",
          width: 0,
          height: 0,
        }}
      >
        {/*  ANSWER – TOP RIGHT */}
        <div
          onClick={handleAnswer}
          style={{
            position: "absolute",
            transform: visible
              ? "translate(22px, -1px) scale(1)"
              : "translate(0px, 0px) scale(0.7)",
            opacity: visible ? 1 : 0,
            transition:
              "transform 220ms cubic-bezier(.2,.9,.2,1), opacity 160ms ease-out",
            padding: "4px 10px",
            fontSize: 12,
            borderRadius: 8,
            background: "rgba(20,120,20,0.9)",
            color: "#fff",
            boxShadow: "0 6px 14px rgba(0,0,0,0.35)",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          <Typography fontSize={12}>Answer</Typography>
        </div>

        {/*  REJECT – TOP LEFT */}
        <div
          onClick={handleReject}
          style={{
            position: "absolute",
            transform: visible
              ? "translate(-42px, -1px) scale(1)"
              : "translate(0px, 0px) scale(0.7)",
            opacity: visible ? 1 : 0,
            transition:
              "transform 220ms cubic-bezier(.2,.9,.2,1), opacity 160ms ease-out",
            padding: "4px 10px",
            fontSize: 12,
            borderRadius: 8,
            background: "rgba(140,20,20,0.9)",
            color: "#fff",
            boxShadow: "0 6px 14px rgba(0,0,0,0.35)",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          <Typography fontSize={12}>Reject</Typography>
        </div>
      </div>
    </div>
  );
};

export default memo(IncomingCallPopup);
