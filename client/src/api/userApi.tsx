import axiosClient from "./axiosClient";

// 📌 Gửi email xác thực
export const sendVerificationEmail = async (data: {
  name: string;
  email: string;
}) => {
  try {
    const response = await axiosClient.post("/users/send-verification", data);
    return response.data;
  } catch (error) {
    console.error("❌ Error sending verification email:", error);
    throw error;
  }
};

// 📌 Xác minh OTP
export const verifyOTP = async (email: string, otpCode: string) => {
  try {
    const response = await axiosClient.post("/users/verify-otp", {
      email,
      otpCode,
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error verifying OTP:", error);
    throw error;
  }
};

// 📌 Gửi lại OTP
export const resendOTP = async (email: string) => {
  try {
    const response = await axiosClient.post("/users/resend-otp", { email });
    return response.data;
  } catch (error) {
    console.error("❌ Error resending OTP:", error);
    throw error;
  }
};

// 📌 Đặt mật khẩu
export const setPassword = async (data: {
  email: string;
  password: string;
}) => {
  try {
    const response = await axiosClient.post("/users/set-password", data);
    return response.data;
  } catch (error) {
    console.error("❌ Error setting password:", error);
    throw error;
  }
};

// 📌 Lấy danh sách username gợi ý (chuyển sang `POST` để tránh email lộ qua URL)
export const suggestUsernames = async (email: string) => {
  try {
    console.log("📤 Sending request:", { email });

    const response = await axiosClient.post("/users/suggest-usernames", {
      email,
    });

    console.log("📥 API Response:", response.data); // Kiểm tra dữ liệu từ server

    if (!response.data) {
      throw new Error("No data received from API.");
    }

    return response.data;
  } catch (error) {
    console.error("❌ API Request Failed:", error);
    throw error;
  }
};

// 📌 Cập nhật username
export const setUsername = async (data: {
  email: string;
  username: string;
}) => {
  try {
    const response = await axiosClient.post("/users/set-username", data);
    return response.data;
  } catch (error) {
    console.error("❌ Error setting username:", error);
    throw error;
  }
};

// 📌 Đăng nhập người dùng
export const loginUser = async ({
  email,
  username,
  password,
}: {
  email?: string;
  username?: string;
  password: string;
}) => {
  try {
    // ✅ Chỉ gửi email nếu có, hoặc username nếu có
    const response = await axiosClient.post("/users/login", {
      email: email || undefined,
      username: username || undefined,
      password,
    });

    return response.data;
  } catch (error) {
    console.error("❌ Error logging in:", error);
    throw error;
  }
};
