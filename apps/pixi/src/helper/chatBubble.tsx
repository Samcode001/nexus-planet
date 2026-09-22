import { Graphics, Container, Text } from "@pixi/react";
import { TextStyle } from "pixi.js";

const ChatBubble = ({ message }: { message: string }) => {
  const chatStyle = new TextStyle({
    fontSize: 10,
    fill: "#ffffff",
    stroke: "#000000",
    strokeThickness: 2,
    wordWrap: true,
    wordWrapWidth: 120,
    align: "center",
  });


  return (
    <Container y={-20} x={45}>
      {/* BUBBLE BACKGROUND */}
      <Graphics
        draw={(g) => {
          g.clear();
          g.beginFill(0xffffff);
          g.lineStyle(2, 0x000000);

          // Rounded bubble
          g.drawRoundedRect(-60, -30, 120, 40, 10);

          // Tail
          g.moveTo(0, 0);
          g.lineTo(-10, 25);
          g.lineTo(10, 10);
          g.endFill();
        }}
      />

      {/* TEXT */}
      <Text
        text={message}
        anchor={0.5}
        x={0}
        y={-10}
        style={chatStyle}
      />
    </Container>
  );
};

export default ChatBubble;
