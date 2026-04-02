import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../redux/hook";
import { setIsMobileVIew } from "../redux/Proximity/proximitySlice";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { useEffect } from "react";

const HomePagePage = () => {
  const navigate = useNavigate();

  const dispatch = useAppDispatch();
  const isMobileView = useSelector(
    (state: RootState) => state.proximity.isMobileView
  );
  let borderColor = !isMobileView ? "#4b00b3" : "#250059";
  let backGroundColor = !isMobileView ? "#d6ff00" : "#ffffff";
  const getDeviceView = () => {
    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    console.log(isTouchDevice, "system");
    if (!isTouchDevice) return;
    dispatch(setIsMobileVIew(true));
  };

  const handleScreen = async () => {
    if (isMobileView) {
      await document.documentElement.requestFullscreen();
      if ("orientation" in screen) {
        const orientation = screen.orientation as any;
        if (orientation.lock) {
          await orientation.lock("landscape");
        }
      }
    }
    navigate("/arena");
  };

  useEffect(() => {
    getDeviceView();
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Background video */}
      <video
        // src="/avatars/home-bg.webm"
        src={isMobileView ? "/mobile-bg.mp4" : "/avatars/home-bg.webm"}
        autoPlay
        muted
        loop
        playsInline
        disablePictureInPicture
        disableRemotePlayback
        controls={false}
        preload="auto"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          aspectRatio: "16/9",
          pointerEvents: "none", // optional: prevent hover/click detection
        }}
      />

      {/* Black overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.2)", // darker overlay
          pointerEvents: "none",
        }}
      ></div>

      {/* Content */}
      <div
        style={
          isMobileView
            ? {
                position: "absolute",
                top: "35%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 3,
                color: "white",
                textAlign: "center",
              }
            : {
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 3,
                color: "white",
                textAlign: "center",
              }
        }
      >
        <h1
          style={{ marginBottom: "20px", fontSize: "clamp(2rem, 5vw, 3rem)" }}
        >
          Welcome to Nexus Planet
        </h1>

        <button
          style={{
            background: backGroundColor,
            border: `4px solid ${borderColor}`,
            padding: "12px 32px",
            // fontFamily: "monospace",
            fontWeight: 700,
            fontSize: "clamp(0.9rem, 2vw, 1.5rem)",
            color: "#423376ff",
            textTransform: "uppercase",
            cursor: "pointer",
            borderRadius: 0,
            imageRendering: "pixelated",
            boxShadow: `4px 4px 0 ${borderColor}, 6px 6px 0 #250059`,
            transition: "0.1s ease",
          }}
          onMouseEnter={(e) => {
            const btn = e.currentTarget as HTMLButtonElement;
            btn.style.transform = "translate(-2px, -2px)";
            btn.style.boxShadow = "6px 6px 0 borderColor, 8px 8px 0 #250059";
          }}
          onMouseLeave={(e) => {
            const btn = e.currentTarget as HTMLButtonElement;
            btn.style.transform = "translate(0, 0)";
            btn.style.boxShadow = "4px 4px 0 #4b00b3, 6px 6px 0 #250059";
          }}
          onMouseDown={(e) => {
            const btn = e.currentTarget as HTMLButtonElement;
            btn.style.transform = "translate(2px, 2px)";
            btn.style.boxShadow = "2px 2px 0 #4b00b3, 4px 4px 0 #250059";
          }}
          onMouseUp={(e) => {
            const btn = e.currentTarget as HTMLButtonElement;
            btn.style.transform = "translate(-2px, -2px)";
            btn.style.boxShadow = "6px 6px 0 #4b00b3, 8px 8px 0 #250059";
          }}
          onClick={handleScreen}
        >
          ENTER THE PLANET
        </button>
      </div>
    </div>
  );
};

export default HomePagePage;
