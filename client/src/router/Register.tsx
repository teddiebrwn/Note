import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  sendVerificationEmail,
  verifyOTP,
  resendOTP,
  setPassword,
  suggestUsernames,
  setUsername,
} from "../api/userApi";

import { FaEye, FaEyeSlash } from "react-icons/fa";
// import { useValidation } from "../hooks/useValidation";
import axios from "axios";

export const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    username: "",
  });

  // const [suggestedUsernames, setSuggestedUsernames] = useState([]);
  const [showAll, setShowAll] = useState(false); // Trạng thái toggle
  const [defaultUsername, setDefaultUsername] = useState("");
  const [suggestedUsernames, setSuggestedUsernames] = useState<string[]>([]);
  const [otpCode, setOtpCode] = useState(new Array(6).fill("")); // Dùng mảng thay vì chuỗi
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  // const [email, setEmail] = useState("");
  // const { emailError, validateEmail } = useValidation();

  // const otpRefs = useRef<HTMLInputElement[]>([]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>(new Array(6).fill(null));
  const navigate = useNavigate();

  // 📌 Xử lý gửi lại OTP
  const handleResendOTP = async () => {
    setResendLoading(true);
    setResendSuccess(null);
    setResendError(null);

    try {
      await resendOTP(formData.email);
      setResendSuccess("New OTP sent successfully. Check your email.");
    } catch (err) {
      setResendError(
        err instanceof Error ? err.message : "Failed to resend OTP. Try again."
      );
    } finally {
      setResendLoading(false);
    }
  };
  const handleOtpChange = (value: string, index: number) => {
    if (/^[0-9]$/.test(value)) {
      // Kiểm tra nếu giá trị nhập vào là số
      const newOtpCode = [...otpCode];
      newOtpCode[index] = value;
      setOtpCode(newOtpCode);

      if (index < 5) {
        otpRefs.current[index + 1]?.focus(); // Di chuyển focus sang ô tiếp theo
      }
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace") {
      const newOtpCode = [...otpCode];
      if (!newOtpCode[index] && index > 0) {
        newOtpCode[index - 1] = ""; // Xóa ô trước nếu ô hiện tại trống
        otpRefs.current[index - 1]?.focus(); // Chuyển focus về ô trước
      } else {
        newOtpCode[index] = ""; // Xóa ô hiện tại
      }
      setOtpCode(newOtpCode);
    }
  };

  const handleFetchUsernames = useCallback(async () => {
    try {
      console.log("📤 Fetching usernames for:", formData.email);
      setLoading(true);

      const res = await suggestUsernames(formData.email);
      console.log("📥 API Response:", res);

      // ✅ Kiểm tra nếu `defaultUsername` có giá trị hợp lệ
      const apiUsername = res.defaultUsername?.trim() ?? "";

      // ✅ Tạo username mặc định nếu API không có username
      const generatedUsername = apiUsername
        ? `@${apiUsername}`
        : `@${formData.email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "")}`; // Loại bỏ ký tự đặc biệt

      setDefaultUsername(generatedUsername);
      setSuggestedUsernames(res.suggestions || []);

      // ✅ Không ghi đè nếu user đã nhập username trước đó
      setFormData((prev) => ({
        ...prev,
        username:
          prev.username && prev.username !== generatedUsername
            ? prev.username
            : generatedUsername,
      }));

      console.log("✅ Username updated:", generatedUsername);
    } catch (err) {
      console.error("❌ Error fetching username suggestions:", err);
      setError("Failed to fetch username suggestions.");
    } finally {
      setLoading(false);
    }
  }, [formData.email]);

  useEffect(() => {
    if (formData.email && step === 4) {
      handleFetchUsernames();
    }
  }, [step, formData.email, handleFetchUsernames]);

  // 📌 Xử lý bước tiếp theo
  const handleNext = async (isSkip = false) => {
    setLoading(true);
    setError("");

    try {
      if (step === 1) {
        if (!formData.name.trim() || !formData.email.trim()) {
          setError("Please fill in all fields.");
          return;
        }

        await sendVerificationEmail({
          name: formData.name,
          email: formData.email,
        });

        localStorage.setItem("emailForVerification", formData.email);
        setStep(2);
      } else if (step === 2) {
        if (!otpCode || otpCode.some((val) => val.trim() === "")) {
          setError("Please enter the OTP code.");
          return;
        }
        await verifyOTP(formData.email, otpCode.join(""));
        setStep(3);
      } else if (step === 3) {
        if (!formData.password.trim()) {
          setError("Please enter a password.");
          return;
        }
        if (formData.password.length < 8) {
          setError("Password must be at least 8 characters.");
          return;
        }
        await setPassword({
          email: formData.email,
          password: formData.password,
        });
        setStep(4);
      } else if (step === 4) {
        await handleFetchUsernames(); // Đợi hàm hoàn thành
        // ✅ Nếu bấm Skip, luôn dùng defaultUsername
        if (isSkip) {
          setFormData((prev) => ({
            ...prev,
            username: defaultUsername,
          }));
        }

        if (!isSkip && !formData.username.trim()) {
          setError("Username cannot be empty.");
          return;
        }

        const response = await setUsername({
          email: formData.email,
          username: isSkip ? defaultUsername : formData.username, // ✅ Kiểm tra isSkip
        });

        // console.log("✅ Step 4: Fetching usernames...");
        // setStep(5);
        // navigate("/dashboard");
        if (response.token) {
          localStorage.setItem("token", response.token); // ✅ Lưu token vào localStorage
          console.log("✅ Step 4: Fetching usernames & auto-login...");
          navigate("/dashboard"); // ✅ Chỉ navigate khi có token
        } else {
          console.error("❌ No token received, staying on register page");
        }
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "An error occurred.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* 📌 Step 1: Nhập tên & email */}
      {step === 1 && (
        <>
          <button>
            <Link to="/">&#8592;</Link>
          </button>
          <h2>Create your account</h2>
          <input
            className="border-b mx-2 py-2 border-gray-300 focus:outline-none transparent"
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <input
            className="border-b mx-2 py-2 border-gray-300 focus:outline-none transparent"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
          {error && <p style={{ color: "red" }}>{error}</p>}

          <button
            onClick={() => handleNext(true)} // ✅ Đánh dấu là Skip
            disabled={loading || !formData.name || !formData.email}
            className={`px-10 py-1 text-white uppercase text-xs transition 
              ${
                loading || !formData.name || !formData.email
                  ? // || emailError !== null
                    "bg-neutral-900 cursor-not-allowed opacity-50"
                  : "bg-black"
              }
            `}
          >
            {loading ? "Processing..." : "Next"}
          </button>
        </>
      )}
      {step === 2 && (
        <>
          <h2>We sent you a code</h2>
          <p>
            Enter it below to verify <strong>{formData.email}</strong>
          </p>
          <div>
            {otpCode.map((value, index) => (
              <input
                key={index}
                value={value}
                onChange={(e) => handleOtpChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                // ref={(el) => (otpRefs.current[index] = el!)}
                ref={(el) => {
                  otpRefs.current[index] = el;
                }} // ✅ Sửa lỗi ref
                type="tel"
                style={{
                  width: "40px",
                  height: "40px",
                  margin: "0 5px",
                  fontSize: "20px",
                  textAlign: "center",
                  borderBottom: value ? "1px solid #fff" : "1px solid #3C3C3C", // ✅ Đổi màu khi có giá trị
                  outline: "none",
                  backgroundColor: "transparent",
                  color: "#fff",
                }}
                maxLength={1}
                autoFocus={index === 0} // Auto-focus vào ô đầu tiên
              />
            ))}
          </div>

          <p>Didn’t receive email?</p>
          <button onClick={handleResendOTP} disabled={resendLoading}>
            {resendLoading ? "Resending..." : "Resend OTP"}
          </button>
          {resendSuccess && <p style={{ color: "green" }}>{resendSuccess}</p>}
          {resendError && <p style={{ color: "red" }}>{resendError}</p>}

          <button
            onClick={() => handleNext(true)} // ✅ Đánh dấu là Skip
            disabled={loading || otpCode.some((val) => val === "")}
            className={`px-10 py-1 text-white uppercase text-xs transition 
        ${
          loading || otpCode.some((val) => val === "")
            ? "bg-neutral-900 cursor-not-allowed opacity-50"
            : "bg-black"
        }`}
          >
            {loading ? "Verifying..." : "Next"}
          </button>
        </>
      )}

      {/* 📌 Step 3: Nhập mật khẩu + Con mắt ẩn/hiện */}
      {step === 3 && (
        <>
          <h2>You'll need a password</h2>
          <p>Make sure it's 8 characters or more</p>
          <div style={{ position: "relative", width: "fit-content" }}>
            <input
              className="border-b mx-2 py-2 border-white focus:outline-none transparent"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              style={{ paddingRight: "35px" }}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
              }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {error && <p style={{ color: "red" }}>{error}</p>}
          <button
            onClick={() => handleNext(true)} // ✅ Đánh dấu là Skip
            disabled={loading || !formData.password}
            className={`px-10 py-1 text-white uppercase text-xs transition 
            ${
              loading || !formData.name || !formData.email
                ? "bg-neutral-900 cursor-not-allowed"
                : "bg-black"
              // hover:bg-black
            }`}
          >
            {loading ? "Processing..." : "Next"}
          </button>
        </>
      )}

      {step === 4 && (
        <>
          <h2>What should we call you?</h2>
          <p>Your @username is unique. You can always change it later</p>
          {/* Hiển thị username */}
          <label htmlFor="username">Username</label>
          <input
            className={`border-b mx-2 py-2 focus:outline-none text-blue-400 ${
              error ? "border-red-500" : "border-white"
            }`}
            type="text"
            value={formData.username} // ✅ Hiển thị giá trị hiện tại
            onChange={(e) => {
              const value = e.target.value;
              if (value.startsWith("@")) {
                setFormData({ ...formData, username: value }); // ✅ Cho phép nhập bình thường
              } else {
                setFormData({ ...formData, username: `@${value}` }); // ✅ Nếu xoá, giữ lại @
              }
            }}
            onBlur={() => {
              if (!formData.username.trim() || formData.username === "@") {
                setFormData({
                  ...formData,
                  username: defaultUsername, // ✅ Đảm bảo không giữ giá trị nhập bừa
                });
              }
            }}
          />
          {/* Gợi ý username */}
          <div className="mt-2 text-blue-400">
            {suggestedUsernames
              .slice(0, showAll ? suggestedUsernames.length : 2)
              .map((u, index) => (
                <span
                  key={u}
                  className="cursor-pointer hover:text-blue-500"
                  onClick={() =>
                    setFormData({ ...formData, username: `@${u}` })
                  }
                >
                  @{u}
                  {index < suggestedUsernames.length - 1 && ", "}
                </span>
              ))}

            {/* Chỉ hiển thị nút Show more nếu có hơn 2 gợi ý */}
            {suggestedUsernames.length > 2 && (
              <button
                className="text-blue-400 underline cursor-pointer ml-2"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? "Show less" : "Show more"}
              </button>
            )}
          </div>
          {/* Hiển thị lỗi nếu chưa nhập username */}
          {error && <p className="text-red-500">{error}</p>}
          {/* Nút Skip for now */}
          <span
            onClick={() => handleNext(true)} // ✅ Đánh dấu là Skip
            className="text-white underline cursor-pointer"
          >
            Skip for now
          </span>

          <button
            onClick={() => handleNext(false)} // ✅ Không Skip, kiểm tra username
            disabled={
              !formData.username || // 🔹 Nếu username trống
              formData.username.trim() === "@" || // 🔹 Nếu chỉ có dấu @
              formData.username.trim() === defaultUsername // 🔹 Nếu vẫn là defaultUsername
            }
            className={`px-5 py-1 ml-2 text-white uppercase text-xs transition 
            ${
              !formData.username ||
              formData.username.trim() === "@" ||
              formData.username.trim() === defaultUsername
                ? "bg-neutral-900 cursor-not-allowed opacity-50"
                : "bg-black hover:bg-gray-800"
            }`}
          >
            Next
          </button>
        </>
      )}
    </div>
  );
};
