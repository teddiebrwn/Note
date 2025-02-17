import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/userApi";
import { AxiosError } from "axios";
import { Link } from "react-router-dom";
import React from "react";
import {
  loginWithGoogle,
  loginWithGitHub,
  // loginWithApple,
} from "../services/authService";

export const Login = () => {
  const [identifier, setIdentifier] = useState(""); // ✅ Dùng chung cho username hoặc email
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // ✅ Xử lý khi OAuth callback trả về token trên URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      localStorage.setItem("token", token);
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // ✅ Kiểm tra nếu user nhập email hay username
      const response = await loginUser({
        email: identifier.includes("@") ? identifier : undefined,
        username: identifier.includes("@") ? undefined : identifier,
        password,
      });

      localStorage.setItem("token", response.token); // ✅ Lưu token vào localStorage
      navigate("/dashboard"); // ✅ Chuyển hướng vào Dashboard ngay lập tức
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        setError(
          err.response?.data?.message ||
            "Invalid credentials. Please try again."
        );
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button>
        <Link to="/">&#8592;</Link>
      </button>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        {/* ✅ Chỉ 1 ô input cho cả email và username */}
        <input
          type="text"
          placeholder="Enter your email or username"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p>{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <div className="login-container">
        <hr />
        <button onClick={loginWithGoogle} className="oauth-btn google">
          Login with Google
        </button>
        <button onClick={loginWithGitHub} className="oauth-btn github">
          Login with GitHub
        </button>
        {/* <button onClick={loginWithApple} className="oauth-btn apple">
          Login with Apple
        </button> */}
      </div>
    </>
  );
};
