import { AppBar, Toolbar, Button, Box } from "@mui/material";
import { Link } from "react-router-dom";

interface IGameNavbarProps {
  setConversationBarVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function GameNavbar({
  setConversationBarVisible,
}: IGameNavbarProps) {
  return (
    <AppBar
      position="absolute"
      sx={{
        top: 1,
        left: "50%",
        transform: "translateX(-50%) translateY(-30%)",
        width: "100%%",
        // height: "50px",
        // borderRadius: "14px",
        background: "linear-gradient(180deg, #ffffff 0%, #e7e7e7 100%)",
        // background: "transparent",
        // border: "2px solid #000",
        boxShadow: `
          0px 4px 0px #000,
          0px 0px 10px #d6ff00,
         0px 0px 18px #6a00ff
        `,
        zIndex: 99,
        // paddingX: 1,
        // paddingY: 2,
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          // paddingY: "2px",
        }}
      >
        {/* LEFT SIDE (Home) */}
        <Box>
          <NavButton text="Home" to="/" strong />
        </Box>

        {/* RIGHT SIDE BUTTONS */}

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
          color="secondary"
            sx={{
              fontFamily: "'Press Start 2P', monospace",
              textTransform: "none",
              fontSize: "12px",
              paddingX: 2,
              // paddingY: 1.4,
              borderRadius: "8px",
              border: "3px solid #000",
              color: "#000",
              backgroundColor: "#bf8151b1",
              transform: "translateY(8px)",
              boxShadow: "0px 0px 6px #000",
              transition: "0.12s ease-in-out",
              "&:hover": {
                transform: "translateY(0px) scale(1.06)",
                boxShadow:
                  "0px 0px 18px #d6ff00, 0px 0px 26px #6a00ff, 0px 4px 0px #000",
                color: "#fff",
              },
              "&:active": {
                transform: "translateY(1px) scale(0.96)",
                boxShadow: "none",
              },
            }}
            onClick={() => {
              setConversationBarVisible((prev) => !prev);
            }}
          >
            Chats
          </Button>
          <NavButton text="Controls" to="/controls" />
          <NavButton text="👤" to="/profile" />
        </Box>
        {/* <NavButton text="🧩 Avatars" to="/avatars" /> */}
      </Toolbar>
    </AppBar>
  );
}

function NavButton({
  text,
  to,
  strong = false,
}: {
  text: string;
  to: string;
  strong?: boolean;
}) {
  return (
    <Button
      component={Link}
      to={to}
      sx={{
        fontFamily: "'Press Start 2P', monospace",
        textTransform: "none",
        fontSize: strong ? "13px" : "12px",
        paddingX: strong ? 2.6 : 2,
        // paddingY: 1.4,
        borderRadius: "8px",
        border: "3px solid #000",
        color: "#000",
        backgroundColor: "#bf8151b1",
        transform: "translateY(8px)",
        boxShadow: strong
          ? "0px 0px 14px #d6ff00, 0px 0px 22px #6a00ff"
          : "0px 0px 6px #000",
        transition: "0.12s ease-in-out",
        "&:hover": {
          transform: "translateY(0px) scale(1.06)",
          boxShadow:
            "0px 0px 18px #d6ff00, 0px 0px 26px #6a00ff, 0px 4px 0px #000",
          color: "#fff",
        },
        "&:active": {
          transform: "translateY(1px) scale(0.96)",
          boxShadow: "none",
        },
      }}
    >
      {text}
    </Button>
  );
}
