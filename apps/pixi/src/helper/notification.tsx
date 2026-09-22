// import { Button } from "@mui/material";
import { Graphics, Container, Text } from "@pixi/react";
import { TextStyle } from "pixi.js";
import type { IncomingMessageData } from "../types/common";
// import { useEffect, useRef } from "react";

interface NotificationProps {
  incomingMessageData: IncomingMessageData;
  setIncomingMessageData: React.Dispatch<
    React.SetStateAction<IncomingMessageData>
  >;
}
const NotificationBubble = ({
  incomingMessageData,
  setIncomingMessageData,
}: NotificationProps) => {
  const chatStyle = new TextStyle({
    fontSize: 9,
    fill: "black",
    fontFamily: ["Helvetica", "Arial", "sans-serif"],
    fontWeight: "600",
    // stroke: "#fff",
    // strokeThickness: 0.1,
    wordWrap: true,
    wordWrapWidth: 120,
    align: "center",
    lineHeight: 0.1,
  });

  const buttonStyle = new TextStyle({
    fontSize: 9,
    fill: "#fff",
    // fontFamily: ["Helvetica", "Arial", "sans-serif"],
    fontWeight: "400",
    // stroke: "#fff",
    // strokeThickness: 0.1,
    wordWrap: true,
    wordWrapWidth: 120,
    align: "center",

    // lineHeight: 0.1,
  });

  const handleShow = () => {
    console.log("Show");
    setIncomingMessageData((prev) => ({
      ...prev,
      isMessageRequestAccepted: true,
    }));
    setTimeout(() => {
      setIncomingMessageData((prev) => ({
        ...prev,
        isNotificationVisible: false,
      }));
    }, 2000);
  };
  const handleIgnore = () => {
    console.log("ginore");
    setIncomingMessageData((prev) => ({
      ...prev,
      isNotificationVisible: false,
    }));
  };

  return (
    <Container y={-25} x={25}>
      {/* BUBBLE BACKGROUND */}
      <Graphics
        draw={(g) => {
          g.clear();
          g.beginFill(0xffffff);
          g.lineStyle(1.2, "black");

          // Rounded bubble
          g.drawRoundedRect(-60, -30, 114, 40, 10);

          // Tail
          // g.moveTo(0, 0);
          //   g.lineTo(-10, 25);
          //   g.lineTo(10, 10);
          g.endFill();
        }}
      />

      {/* TEXT */}
      {incomingMessageData.isMessageRequestAccepted ? (
        <Text
          // ref={textRef}
          text={incomingMessageData.content}
          anchor={0.5}
          x={0}
          y={-18}
          style={chatStyle}
        />
      ) : (
        <Text
          // ref={textRef}
          text={`${incomingMessageData.senderUsername} sends a message.`}
          anchor={0.5}
          x={0}
          y={-18}
          style={chatStyle}
        />
      )}

      {/* <Button  > show  & ignore</Button> */}
      {incomingMessageData.isMessageRequestAccepted ? null : (
        <>
          <Graphics
            draw={(g) => {
              g.clear();
              g.beginFill("green");
              g.drawRect(0, 0, 35, 14);
              g.endFill();
            }}
            x={-45}
            y={-8}
            eventMode="static"
            cursor="pointer"
            onclick={handleShow}
          />

          <Text
            text="Show"
            style={buttonStyle}
            x={-39}
            y={-8}
            eventMode="none"
          />

          <Graphics
            draw={(g) => {
              g.clear();
              g.beginFill("red");
              g.drawRect(0, 0, 35, 14);
              g.endFill();
            }}
            x={1}
            y={-8}
            eventMode="static"
            cursor="pointer"
            onclick={handleIgnore}
          />

          <Text
            text="Ignore"
            style={buttonStyle}
            x={6}
            y={-8}
            eventMode="none"
          />
        </>
      )}
    </Container>
  );
};

export default NotificationBubble;
