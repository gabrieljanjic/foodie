import axios from "axios";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import API_URL from "../data/api";
import * as SecureStore from "expo-secure-store";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getMe = async () => {
      const token = await SecureStore.getItemAsync("auth_token");
      if (token) {
        try {
          const res = await axios.get(`${API_URL}/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.data.success) setUser(res.data.user);
        } catch (err) {
          await SecureStore.deleteItemAsync("auth_token");
          setUser("");
        }
      }
      setLoading(false);
    };
    getMe();
  }, []);

  //Register
  const createUser = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/register-user`, {
        username,
        password,
      });
      if (res.data.success) {
        setUser(res.data.user);
        await SecureStore.setItemAsync("auth_token", res.data.token);
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Something went wrong");
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  //Login
  const loginUser = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/login-user`, {
        username,
        password,
      });
      if (res.data.success) {
        setUser(res.data.user);
        await SecureStore.setItemAsync("auth_token", res.data.token);
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = async () => {
    await SecureStore.deleteItemAsync("auth_token");
    setUser("");
  };

  return (
    <AuthContext.Provider
      value={{
        loading,
        error,
        user,
        setUser,
        createUser,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
