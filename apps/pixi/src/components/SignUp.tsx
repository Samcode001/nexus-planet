import React, { useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  createTheme,
  ThemeProvider,
  Link,
} from "@mui/material";
import { IoEyeOutline } from "react-icons/io5";
import { IoEyeOffOutline } from "react-icons/io5";

const pixelTheme = createTheme({
  typography: { fontFamily: "monospace" },
  palette: {
    error: {
      main: "#ff0033",
      dark: "#b80026",
      light: "#ff3359",
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#1a1a1a",
            color: "white",
            borderRadius: "0px",
            border: "3px solid #6a00ff",
            boxShadow: "4px 4px 0 #4b00b3",
            "& fieldset": { border: "none" },
            "&:hover": { boxShadow: "6px 6px 0 #4b00b3" },
            "&.Mui-focused": {
              boxShadow: "6px 6px 0 #250059",
              border: "3px solid #d6ff00",
            },
            "& input": {
              fontWeight: "bold",
              fontSize: "16px",
            },
          },
          "& label": {
            color: "#d6ff00",
            fontWeight: "bold",
            fontSize: "14px",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          background: "#d6ff00",
          color: "#1a1a1a",
          borderRadius: 0,
          padding: "12px 32px",
          border: "4px solid #6a00ff",
          fontFamily: "monospace",
          fontWeight: 700,
          fontSize: "20px",
          textTransform: "uppercase",
          boxShadow: "4px 4px 0 #4b00b3, 6px 6px 0 #250059",
          "&:hover": {
            background: "#e4ff4e",
            transform: "translate(-2px, -2px)",
            boxShadow: "6px 6px 0 #4b00b3, 8px 8px 0 #250059",
          },
          "&:active": {
            transform: "translate(2px, 2px)",
            boxShadow: "2px 2px 0 #4b00b3, 4px 4px 0 #250059",
          },
        },
      },
    },
    // MuiLink: {
    //   styleOverrides: {
    //     root: {
    //       color: "#d6ff00",
    //       "&:hover": {
    //         background: "#e4ff4e",
    //         transform: "translate(-2px, -2px)",
    //         boxShadow: "6px 6px 0 #4b00b3, 8px 8px 0 #250059",
    //         padding: "2px 3px",
    //       },
    //       "&:active": {
    //         transform: "translate(2px, 2px)",
    //         boxShadow: "2px 2px 0 #4b00b3, 4px 4px 0 #250059",
    //         padding: "2px 3px",
    //       },
    //     },
    //   },
    // },
  },
});

interface IUserData {
  name: string;
  username: string;
  password: string;
}

const SignUp = () => {
  const [userData, setUserData] = useState<IUserData>({
    name: "",
    username: "",
    password: "",
  });

  const [error, setError] = useState<{ [key: string]: string[] }>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError({}); // reset error
    setLoading(true);

    try {
      const success = await signUp(
        userData.name,
        userData.username,
        userData.password
      );

      if (success) {
        navigate("/avatars");
        setLoading(false);
      }
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.errors) {
        setError(err.response.data.errors);
        setTimeout(()=>setError({}),5000)
        setLoading(false);
      }
    }

    setUserData({ name: "", username: "", password: "" });
  };

  return (
    <form onSubmit={handleSubmit} method="post">
      <ThemeProvider theme={pixelTheme}>
        <Box
          sx={{
            width: "100vw",
            height: "100vh",
            background: "#000",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 2,
            backgroundImage:
              'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url("/avatars/signin-bg.jpg")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <Paper
            className={error ? "shake" : ""}
            elevation={0}
            sx={{
              background: "transparent",
              padding: "40px",
              border: "4px solid #6a00ff",
              boxShadow: "8px 8px 0 #4b00b3",
              width: 420,
              borderRadius: 0,
            }}
          >
            {/* ERROR ALERT */}
            {/* {error && (
              <Box
                sx={{
                  background: "#ff0033",
                  color: "white",
                  padding: "12px",
                  border: "4px solid #b80026",
                  boxShadow: "6px 6px 0 #70001a",
                  fontFamily: "monospace",
                  fontSize: "18px",
                  textAlign: "center",
                  textTransform: "uppercase",
                  mb: 2,
                }}
              >
                {error}
              </Box>
            )} */}
            {error &&
              Object.entries(error).map(([field, messages]) => {
                return (
                  <Box
                    key={field}
                    sx={{
                      background: "#ff0033",
                      color: "white",
                      padding: "12px",
                      border: "4px solid #b80026",
                      boxShadow: "6px 6px 0 #70001a",
                      fontFamily: "monospace",
                      fontSize: "16px",
                      marginBottom: "10px",
                      textTransform: "uppercase",
                    }}
                  >
                    <strong>{field}:</strong>
                    <ul style={{ margin: 0, paddingLeft: "20px" }}>
                      {messages.map((msg, i) => (
                        <li key={i}>{msg}</li>
                      ))}
                    </ul>
                  </Box>
                );
              })}

            <Typography
              variant="h4"
              sx={{
                fontFamily: "monospace",
                fontWeight: 900,
                textAlign: "center",
                color: "#d6ff00",
                marginBottom: 3,
                textShadow: "2px 2px #6a00ff",
              }}
            >
              CREATE ACCOUNT
            </Typography>

            <TextField
              fullWidth
              label="Name"
              margin="normal"
              placeholder="Name"
              value={userData.name}
              onChange={(e) =>
                setUserData({ ...userData, name: e.target.value })
              }
              error={!!error}
            />

            <TextField
              fullWidth
              label="Username"
              margin="normal"
              placeholder="Username"
              value={userData.username}
              onChange={(e) =>
                setUserData({ ...userData, username: e.target.value })
              }
              error={!!error}
            />

            <Box sx={{ position: "relative" }}>
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? "text" : "password"}
                margin="normal"
                value={userData.password}
                onChange={(e) =>
                  setUserData({ ...userData, password: e.target.value })
                }
                error={!!error}
              />
              {showPassword ? (
                <IoEyeOffOutline
                  style={{
                    position: "absolute",
                    top: "35px",
                    right: "20px",
                    cursor: "pointer",
                  }}
                  size={"25px"}
                  color="#d4ff00cb"
                  onClick={() => setShowPassword((prev) => !prev)}
                />
              ) : (
                <IoEyeOutline
                  style={{
                    position: "absolute",
                    top: "35px",
                    right: "20px",
                    cursor: "pointer",
                  }}
                  size={"25px"}
                  color="#d4ff00cb"
                  onClick={() => setShowPassword((prev) => !prev)}
                />
              )}
            </Box>
            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Button type="submit">
                {loading ? "Processing..." : "Sign Up"}
              </Button>
            </Box>

            <Box sx={{ textAlign: "center", mt: 3, color: "whitesmoke" }}>
              Already have account?{" "}
              <Link
                component={RouterLink}
                to="/signIn"
                sx={{
                  color: "#d6ff00",
                  cursor: "pointer",
                  fontWeight: 600,
                  textDecoration: "none", // Optional: removes the underline
                  "&:hover": {
                    textDecoration: "underline",
                    // color: "#f0ff00",
                  },
                }}
              >
                Login
              </Link>
            </Box>
          </Paper>
        </Box>
      </ThemeProvider>
    </form>
  );
};

export default SignUp;
