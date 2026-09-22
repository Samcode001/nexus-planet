import {
  createContext,
  useState,
  useContext,
  type ReactNode,
  useEffect,
} from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUserToken } from "../redux/user/userSlice";

const API = import.meta.env.VITE_AUTH_API_URL;
// const API = "http://localhost:3000/v1";

type AuthContextType = {
  accessToken: string | null;
  loading: boolean | null;
  signUp: (
    name: string,
    username: string,
    password: string,
  ) => Promise<Boolean>;
  login: (username: string, password: string) => Promise<Boolean>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();

  const signUp = async (name: string, username: string, password: string) => {
    const res = await axios.post(
      `${API}/signup`,
      { name, username, password },
      { withCredentials: true },
    );
    if (res.status === 200) {
      setAccessToken(res.data.accessToken);
      dispatch(setUserToken({ token: res.data.accessToken }));
    } else {
      throw new Error("Invalid username or password");
    }
    return res.status === 200 ? true : false;
  };

  const login = async (username: string, password: string) => {
    // call login endpoint; server sets refresh cookie
    const res = await axios.post(
      `${API}/signin`,
      { username, password },
      { withCredentials: true },
    );
    if (res.status === 200) {
      setAccessToken(res.data.accessToken);
      dispatch(setUserToken({ token: res.data.accessToken }));
    } else {
      throw new Error("Invalid username or password");
    }
    return res.status === 200 ? true : false;
  };

  const logout = async () => {
    await axios.post(`${API}/logout`, {}, { withCredentials: true });
    setAccessToken(null);
  };

  const refreshAccessToken = async (): Promise<string | null> => {
    try {
      const res = await axios.post(
        `${API}/refresh`,
        {},
        { withCredentials: true },
      );
      const newToken = res.data.accessToken;
      setAccessToken(newToken);
      dispatch(setUserToken({ token: newToken }));

      return newToken;
    } catch (err) {
      setAccessToken(null);
      return null;
    }
  };

  useEffect(() => {
    const init = async () => {
      await refreshAccessToken(); // gets a new access token (if refresh cookie is valid)
      setLoading(false); // tell app that refresh attempt is done
    };
    init();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        loading,
        signUp,
        login,
        logout,
        refreshAccessToken,
        // setAccessToken, // optional if you want manual setting
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
