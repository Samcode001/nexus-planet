import { useState } from "react";
import {
  Radio,
  FormControlLabel,
  RadioGroup,
  Button,
  Box,
  Typography,
  Paper,
} from "@mui/material";
import { useAxiosAuth } from "../api/axiosClient";
import { useNavigate } from "react-router-dom";

const Avatars = () => {
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const axiosAuth = useAxiosAuth();
  const navigate = useNavigate();

  const avatars = [
    { id: "dala", src: "/avatars/dala_the_saviour.png" },
    { id: "frank", src: "/avatars/frank_the_hood.png" },
    { id: "monk", src: "/avatars/franky_monk.png" },
    { id: "hero", src: "/avatars/hero_sprite.png" },
    { id: "mink", src: "/avatars/muscle_mink.png" },
    { id: "laila", src: "/avatars/princess_laila.png" },
  ];

  const handleSubmit = async () => {
    try {
      const res = await axiosAuth.put("user/set-avatar", {
        avatar: selectedAvatar,
      });
      if (res.status === 200) navigate("/arena");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        background: "#000",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Paper
        sx={{
          padding: "30px",
          background: "#0d0d0d",
          border: "4px solid #6a00ff",
          boxShadow: "8px 8px 0 #4b00b3",
          width: 600,
          borderRadius: 0,
        }}
        elevation={0}
      >
        <Typography
          variant="h4"
          sx={{
            fontFamily: "monospace",
            textAlign: "center",
            color: "#d6ff00",
            marginBottom: 3,
            textShadow: "2px 2px #6a00ff",
            fontWeight: 900,
          }}
        >
          CHOOSE YOUR AVATAR
        </Typography>

        <RadioGroup
          value={selectedAvatar}
          onChange={(e) => setSelectedAvatar(e.target.value)}
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 3,
            justifyItems: "center",
            alignItems: "center",
          }}
        >
          {avatars.map((avatar) => (
            <FormControlLabel
              key={avatar.id}
              value={avatar.id}
              control={<Radio sx={{ display: "none" }} />} // hide dot
              label={
                <Box
                  component="img"
                  src={avatar.src}
                  alt={avatar.id}
                  sx={{
                    width: 110,
                    height: 110,
                    borderRadius: "4px",
                    cursor: "pointer",
                    transition: "0.2s",
                    border:
                      selectedAvatar === avatar.id
                        ? "4px solid #d6ff00"
                        : "4px solid transparent",
                    boxShadow:
                      selectedAvatar === avatar.id
                        ? "0 0 15px #d6ff00, 0 0 25px #6a00ff"
                        : "0 0 0 transparent",
                    transform:
                      selectedAvatar === avatar.id ? "scale(1.08)" : "scale(1)",
                    "&:hover": {
                      transform: "scale(1.05)",
                      boxShadow: "0 0 10px #6a00ff",
                    },
                  }}
                />
              }
              sx={{ margin: 0 }}
            />
          ))}
        </RadioGroup>

        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Button
            onClick={handleSubmit}
            disabled={!selectedAvatar}
            sx={{
              background: "#d6ff00",
              color: "#000",
              fontWeight: 900,
              padding: "10px 30px",
              borderRadius: 0,
              border: "4px solid #6a00ff",
              boxShadow: "6px 6px 0 #4b00b3",
              fontFamily: "monospace",
              "&:hover": {
                background: "#b6df00",
                boxShadow: "6px 6px 0 #6a00ff",
              },
            }}
          >
            CONFIRM AVATAR
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Avatars;
