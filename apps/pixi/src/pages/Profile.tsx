import { useEffect, useState } from "react";
import { useAxiosAuth } from "../api/axiosClient";
import {
  Button,
  CircularProgress,
  Card,
  CardContent,
  Typography,
  Divider,
  Stack,
  Box,
} from "@mui/material";
import { useAuth } from "../auth/AuthProvider";
import { useNavigate } from "react-router-dom";

export const Profile = () => {
  const axiosAuth = useAxiosAuth();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentAvatar, setCurrentAvatar] = useState<any>(null);

  const avatars = [
    { id: "dala", src: "/avatars/dala_the_saviour.png" },
    { id: "frank", src: "/avatars/frank_the_hood.png" },
    { id: "monk", src: "/avatars/franky_monk.png" },
    { id: "hero", src: "/avatars/hero_sprite.png" },
    { id: "mink", src: "/avatars/muscle_mink.png" },
    { id: "laila", src: "/avatars/princess_laila.png" },
  ];
  // Find current avatar image

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosAuth.get("user/profile");
        setProfile(res.data);

        setCurrentAvatar(
          avatars.find((avatar) => avatar.id === res.data.avatarId)
        );
      } catch (err) {
        console.error(err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading)
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        height="100vh"
        sx={{
          background: "#05060a",
        }}
      >
        <CircularProgress />
      </Stack>
    );

  if (error)
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        height="100vh"
        sx={{
          background: "#05060a",
        }}
      >
        <Typography color="error">{error}</Typography>
      </Stack>
    );

  if (!profile)
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        height="100vh"
        sx={{
          background: "#05060a",
        }}
      >
        <Typography>Not logged in</Typography>
      </Stack>
    );

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        // Neon cyberpunk background
        background: `radial-gradient(circle at center, #06121e 0%, #02070b 100%)`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Pixel-grid overlay */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url('/avatars/profile-bg.webp')", // subtle pixel grid
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          opacity: 0.25,
          pointerEvents: "none",
        }}
      />

      <Card
        sx={{
          width: 420,
          px: 3,
          py: 4,
          borderRadius: "20px",
          background: "rgba(5, 15, 25, 0.75)",
          backdropFilter: "blur(12px)",
          border: "2px solid rgba(0, 255, 255, 0.25)",
          boxShadow: `
            0 0 25px rgba(0,255,255,0.3),
            0 0 45px rgba(0,255,255,0.15),
            inset 0 0 12px rgba(0,255,255,0.1)
          `,
          transition: "0.3s ease",
          "&:hover": {
            boxShadow: `
              0 0 35px rgba(0,255,255,0.5),
              0 0 60px rgba(0,150,255,0.3),
              inset 0 0 15px rgba(0,255,255,0.2)
            `,
            transform: "scale(1.02)",
          },
        }}
      >
        <CardContent>
          <Stack spacing={2} alignItems="center">
            {/* Glowing Avatar */}
            {/* <Avatar
              sx={{
                width: 110,
                height: 110,
                bgcolor: "rgba(0,200,255,0.25)",
                border: "2px solid rgba(0,255,255,0.7)",
                boxShadow: "0 0 25px rgba(0,200,255,0.6)",
                fontSize: 40,
                fontFamily: "monospace",
              }}
            >
              {profile.username?.charAt(0).toUpperCase()}
            </Avatar> */}
            <Box
              component="img"
              src={currentAvatar?.src || "/avatars/default.png"}
              alt={profile.avatarId}
              sx={{
                width: 110,
                height: 110,
                borderRadius: "4px",
                cursor: "pointer",
                transition: "0.25s",
                border: "4px solid #d6ff00",
                boxShadow: "0 0 15px #d6ff00, 0 0 25px #6a00ff",
                transform: "scale(1.08)",
                "&:hover": {
                  transform: "scale(1.12)",
                  boxShadow: "0 0 18px #d6ff00, 0 0 30px #8b00ff",
                },
              }}
            />

            {/* Username */}
            <Typography
              variant="h4"
              sx={{
                color: "#aef6ff",
                fontFamily: "Press Start 2P, monospace",
                letterSpacing: 1,
                textShadow: "0 0 8px rgba(0,255,255,0.5)",
              }}
            >
              {profile.name.toUpperCase()}
            </Typography>

            {/* Email */}
            <Typography
              variant="body1"
              sx={{
                color: "rgba(190,240,255,0.7)",
                fontFamily: "monospace",
              }}
            >
              {profile.username || "No email provided"}
            </Typography>

            <Divider
              sx={{
                width: "100%",
                my: 2,
                borderColor: "rgba(0,255,255,0.4)",
              }}
            />

            {/* Info */}
            <Stack spacing={1} alignItems="center">
              {profile.avatarId && (
                <Typography
                  variant="body2"
                  sx={{
                    color: "#8fe9ff",
                    fontFamily: "monospace",
                    textShadow: "0 0 5px rgba(0,200,255,0.4)",
                  }}
                >
                  Avatar ID: {profile.avatarId}
                </Typography>
              )}

              {profile.userId && (
                <Typography
                  variant="body2"
                  sx={{
                    color: "#8fe9ff",
                    fontFamily: "monospace",
                    textShadow: "0 0 5px rgba(0,200,255,0.4)",
                  }}
                >
                  User ID: {profile.userId}
                </Typography>
              )}
            </Stack>

            <Divider
              sx={{
                width: "100%",
                my: 2,
                borderColor: "rgba(0,255,255,0.4)",
              }}
            />

            {/* Buttons */}
            <Stack direction="row" spacing={2} mt={1}>
              <Button
                variant="contained"
                sx={{
                  background: "linear-gradient(135deg, #00baff, #00e5ff 70%)",
                  boxShadow: "0 0 12px rgba(0,200,255,0.8)",
                  borderRadius: "10px",
                  fontFamily: "monospace",
                  px: 3,
                  "&:hover": {
                    background: "linear-gradient(135deg, #00d0ff, #00f7ff 70%)",
                    boxShadow: "0 0 18px rgba(0,220,255,1)",
                  },
                }}
                onClick={() => navigate("/avatars")}
              >
                Change Avatar
              </Button>

              <Button
                variant="outlined"
                sx={{
                  borderColor: "rgba(255,80,80,0.6)",
                  color: "rgba(255,120,120,0.9)",
                  fontFamily: "monospace",
                  px: 3,
                  "&:hover": {
                    borderColor: "rgba(255,100,100,0.9)",
                    background: "rgba(255,60,60,0.08)",
                  },
                }}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};
