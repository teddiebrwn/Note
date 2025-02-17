import User from "../models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sendMail } from "../utils/mail.js";
import { generateEmailTemplate } from "../utils/emailTemplate.js";
import { generateOTP, getOtpExpiry } from "../utils/otp.js";
import { hashPassword } from "../utils/hashPassword.js";
import { generateRandomString } from "../utils/generateRandomString.js";

// 📌 BƯỚC 1: Gửi OTP đến email, KHÔNG tạo user trước khi xác minh
const otpStore = {}; // Lưu OTP tạm thời

export const sendVerificationEmail = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use." });
    }

    const otpCode = generateOTP();
    const otpExpires = getOtpExpiry(120);
    otpStore[email] = { otpCode, otpExpires, name };

    const emailHTML = generateEmailTemplate(otpCode);

    console.log(`Sending OTP ${otpCode} to ${email}`);

    await sendMail(
      email,
      `${otpCode} is your Note verification code`,
      emailHTML
    );

    res.status(200).json({ message: "OTP sent. Please verify your email." });
  } catch (error) {
    console.error("❌ Error sending email:", error);
    res.status(500).json({ error: error.message });
  }
};

// 📌 BƯỚC 2: Xác minh OTP, nếu đúng sẽ lưu user vào database
export const verifyOTP = async (req, res) => {
  try {
    const { email, otpCode } = req.body;
    const storedData = otpStore[email];

    if (!storedData) {
      return res.status(404).json({ message: "No OTP request found." });
    }

    if (storedData.otpCode !== otpCode || storedData.otpExpires < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP code" });
    }

    // ✅ Lưu trạng thái đã xác minh thay vì xóa OTP store ngay lập tức
    otpStore[email].isVerified = true;

    // ✅ Tạo defaultUsername dựa trên độ dài email
    const emailLength = email.replace(/@.*/, "").length; // Lấy độ dài trước @
    otpStore[email].username = generateRandomString(emailLength);

    res.status(200).json({
      message: "Email verified successfully. Now set your password.",
      email, // Trả về email để tiếp tục Step 3
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const setPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    const storedData = otpStore[email];
    if (!storedData || !storedData.isVerified) {
      return res.status(400).json({ message: "No verified email found." });
    }

    if (storedData.password) {
      return res.status(400).json({ message: "Password already set." });
    }

    const hashedPassword = await hashPassword(password);
    otpStore[email].password = hashedPassword; // ✅ Lưu password tạm vào OTP store

    res.status(200).json({ message: "Password set successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Kiểm tra xem email đã được yêu cầu xác minh trước đó chưa
    if (!otpStore[email]) {
      return res
        .status(400)
        .json({ message: "No OTP request found. Please register first." });
    }

    // Tạo mã OTP mới
    const newOtpCode = generateOTP();
    otpStore[email].otpCode = newOtpCode;
    otpStore[email].otpExpires = getOtpExpiry(120);

    // Gửi email chứa OTP mới
    // await sendMail(
    //   email,
    //   "Resend OTP - Verify Your Account",
    //   `Your new OTP: ${newOtpCode}`
    // );
    // Tạo mã OTP mới

    // ⚠️ Tạo lại nội dung email OTP
    const emailHTML = generateEmailTemplate(newOtpCode);

    console.log(`Resending OTP ${newOtpCode} to ${email}`);

    // Gửi email chứa OTP mới
    await sendMail(
      email,
      `${newOtpCode} is your Note verification code`,
      emailHTML
    );

    res.status(200).json({ message: "New OTP sent successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to resend OTP." });
  }
};

// export const setUsername = async (req, res) => {
//   try {
//     const { email, username } = req.body;

//     if (!email || !username) {
//       return res
//         .status(400)
//         .json({ message: "Email and username are required." });
//     }

//     const storedData = otpStore[email];
//     if (!storedData || !storedData.password) {
//       return res
//         .status(400)
//         .json({ message: "Complete all steps before setting a username." });
//     }

//     const existingUser = await User.findOne({ username });
//     if (existingUser) {
//       return res.status(400).json({ message: "Username already taken." });
//     }

//     // ✅ Khi đặt username, tạo user mới
//     const newUser = new User({
//       name: storedData.name,
//       email,
//       password: storedData.password,
//       isVerified: true,
//       username,
//     });

//     await newUser.save();
//     delete otpStore[email]; // ❌ Xóa dữ liệu OTP store sau khi lưu

//     const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
//       expiresIn: "7d",
//     });

//     res.status(201).json({
//       message: "Account created successfully.",
//       token,
//       user: { email: newUser.email, isVerified: newUser.isVerified },
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

export const setUsername = async (req, res) => {
  try {
    const { email, username, avatar } = req.body; // ✅ Nhận thêm avatar từ frontend nếu có

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const storedData = otpStore[email];
    if (!storedData || !storedData.password) {
      return res
        .status(400)
        .json({ message: "Complete all steps before setting a username." });
    }

    let finalUsername = username;

    // ✅ Nếu username trống, tạo một username ngẫu nhiên từ email
    if (!username) {
      finalUsername =
        storedData.username || `user${Math.floor(Math.random() * 10000)}`;
    }

    // ✅ Kiểm tra nếu username đã tồn tại
    let existingUser = await User.findOne({ username: finalUsername });
    let attempt = 0;

    // ✅ Nếu username bị trùng, tạo một username mới (tối đa 5 lần)
    while (existingUser && attempt < 5) {
      finalUsername = `user${Math.floor(Math.random() * 100000)}`;
      existingUser = await User.findOne({ username: finalUsername });
      attempt++;
    }

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Username is already taken, please try again." });
    }
    const cleanUsername = finalUsername.startsWith("@")
      ? finalUsername.slice(1) // ✅ Xóa ký tự @ nếu có
      : finalUsername;
    // ✅ Khi đặt username, tạo user mới
    const newUser = new User({
      name: storedData.name,
      email,
      password: storedData.password,
      isVerified: true,
      username: cleanUsername, // ✅ Đảm bảo không có @ trong DB
      avatar: avatar || "", // ✅ Nếu avatar không có, để trống hoặc đặt giá trị mặc định
    });

    await newUser.save();
    delete otpStore[email]; // ❌ Xóa dữ liệu OTP store sau khi lưu

    // ✅ Tạo token chứa đầy đủ thông tin user
    const token = jwt.sign(
      {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        username: newUser.username,
        avatar: newUser.avatar,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Account created successfully.",
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        username: finalUsername,
        isVerified: true,
        avatar: newUser.avatar,
      },
    });
  } catch (error) {
    console.error("❌ Error in setUsername:", error);
    res.status(500).json({ error: error.message });
  }
};

export const suggestUsernames = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const storedData = otpStore[email];
    if (!storedData || !storedData.isVerified) {
      return res.status(400).json({ message: "Verify your email first." });
    }

    const nameLength = storedData.name.replace(/\s+/g, "").length; // Lấy độ dài name
    const suggestions = [];

    for (let i = 0; i < 10; i++) {
      const randomUsername = generateRandomString(nameLength);
      const existingUser = await User.findOne({ username: randomUsername });

      if (!existingUser) {
        suggestions.push(randomUsername);
      }
    }

    // ✅ Trả về username mặc định và gợi ý
    res.status(200).json({
      defaultUsername: storedData.username, // Username mặc định
      suggestions,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// export const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });

//     if (!user) return res.status(400).json({ error: "User not found" });

//     // ✅ Kiểm tra xem tài khoản đã xác minh chưa
//     if (!user.isVerified) {
//       return res.status(400).json({ error: "Account is not verified. Please verify your email first." });
//     }

//     // ✅ So sánh mật khẩu đã hash
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

//     // ✅ Tạo token với đầy đủ thông tin user
//     const token = jwt.sign(
//       { id: user._id, email: user.email, name: user.name, avatar: user.avatar, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     res.status(200).json({
//       message: "Login successful",
//       token,
//       user: { id: user._id, email: user.email, name: user.name, avatar: user.avatar, role: user.role },
//     });
//   } catch (error) {
//     console.error("❌ Login Error:", error);
//     res.status(500).json({ error: error.message });
//   }
// };

export const loginUser = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // ✅ Tìm user bằng email hoặc username
    const user = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    // ✅ Kiểm tra xem tài khoản đã xác minh chưa
    if (!user.isVerified) {
      return res.status(400).json({
        error: "Account is not verified. Please verify your email first.",
      });
    }

    // ✅ So sánh mật khẩu đã hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // ✅ Tạo token với đầy đủ thông tin user
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        username: user.username,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // 🔹 Lấy tất cả users nhưng ẨN password
    res.status(200).json(users);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users." });
  }
};

export const googleAuthCallback = async (req, res) => {
  console.log("Google Auth Callback - req.user:", req.user);

  if (!req.user) {
    return res
      .status(401)
      .json({ error: "Authentication failed - No user found in request" });
  }

  const user = req.user;
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.status(200).json({
    message: "Google login successful",
    token,
    user: { id: user._id, email: user.email, name: user.name },
  });
};

export const githubAuthCallback = async (req, res) => {
  console.log("GitHub Auth Callback - req.user:", req.user);

  if (!req.user) {
    return res
      .status(401)
      .json({ error: "Authentication failed - No user found in request" });
  }

  const user = req.user;
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.status(200).json({
    message: "GitHub login successful",
    token,
    user: { id: user._id, email: user.email, name: user.name },
  });
};
