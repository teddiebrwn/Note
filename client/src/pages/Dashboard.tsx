import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { jwtDecode, JwtPayload } from "jwt-decode";

interface DecodedToken extends JwtPayload {
  email?: string;
  name?: string;
  username?: string;
}

export const Dashboard = () => {
  const [user, setUser] = useState<{
    email?: string;
    name?: string;
    username?: string;
  } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let token = localStorage.getItem("token");

    // ✅ Kiểm tra nếu token có trên URL (dành cho OAuth)
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get("token");

    if (urlToken) {
      localStorage.setItem("token", urlToken);
      token = urlToken;
      navigate("/dashboard", { replace: true });
    }

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded: DecodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decoded.exp && decoded.exp < currentTime) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      console.log("📌 Decoded Token:", decoded); // ✅ Debugging Token

      setUser({
        email: decoded.email || "No email found",
        name: decoded.name || "No name found",
        username:
          decoded.username ||
          decoded.email?.split("@")[0] ||
          "No username found", // ✅ Nếu `username` không có, lấy phần trước `@` từ email
      });
    } catch (error) {
      console.error("❌ Error decoding token:", error);
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="dashboard-container">
      <h1>Welcome to Dashboard</h1>
      {user ? (
        <div>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Name:</strong> {user.name}
          </p>
          <p>
            <strong>Username:</strong>{" "}
            {user.username
              ? `@${user.username}`
              : user.email?.split("@")[0]
              ? `@${user.email.split("@")[0]}`
              : "No username found"}
          </p>
        </div>
      ) : (
        <p>Loading user info...</p>
      )}

      <Link to="/" onClick={() => localStorage.removeItem("token")}>
        Logout
      </Link>
    </div>
  );
};
