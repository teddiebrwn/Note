import { useState, useRef, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import {
  sendVerificationEmail,
  verifyOTP,
  resendOTP,
  setPassword,
  suggestUsernames,
  setUsername,
} from "../api/userApi";

import { FaEye, FaEyeSlash } from "react-icons/fa";

enum Step {
  EnterNameAndEmail = 1,
  VerifyEmail,
  SetPassword,
  SetUsername,
}

const Register: React.FC = () => {
  const [step, setStep] = useState<Step>(Step.EnterNameAndEmail);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    username: "",
  });
  const [showAll, setShowAll] = useState(false);
  const [defaultUsername, setDefaultUsername] = useState("");
  const [suggestedUsernames, setSuggestedUsernames] = useState<string[]>([]);
  const [otpCode, setOtpCode] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>(new Array(6).fill(null));
  const navigate = useNavigate();

  useEffect(() => {
    if (formData.email && step === Step.SetUsername) {
      handleFetchUsernames();
    }
  }, [step, formData.email, handleFetchUsernames]);

  // Handle next
  const handleNext = useCallback(
    async (isSkip: boolean) => {
      setLoading(true);
      setError("");

      try {
        switch (step) {
          case Step.EnterNameAndEmail:
            await handleEnterNameAndEmail();
            break;
          case Step.VerifyEmail:
            await handleVerifyEmail();
            break;
          case Step.SetPassword:
            await handleSetPassword();
            break;
          case Step.SetUsername:
            await handleSetUsername(isSkip);
            break;
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
    },
    [step, formData, otpCode]
  );

  // Handle Enter Name and Email
  const handleEnterNameAndEmail = useCallback(async () => {
    if (!formData.name || !formData.email) {
      return;
    }

    await sendVerificationEmail(formData.email);
    setStep(Step.VerifyEmail);
  }, [formData.name, formData.email]);

  // Handle Verify Email
  const handleVerifyEmail = useCallback(async () => {
    const otpCodeValue = otpCode.join("");
    if (!otpCodeValue) {
      return;
    }

    await verifyOTP(formData.email, otpCodeValue);
    setStep(Step.SetPassword);
  }, [formData.email, otpCode]);

  // Handle Set Password
  const handleSetPassword = useCallback(async () => {
    if (!formData.password) {
      return;
    }

    await setPassword(formData.email, formData.password);
    setStep(Step.SetUsername);
  }, [formData.email, formData.password]);

  // Handle Set Username
  const handleSetUsername = useCallback(
    async (isSkip: boolean) => {
      let username = isSkip ? defaultUsername : formData.username;

      if (!username || username === "@") {
        username = defaultUsername;
      }

      await setUsername(username);
      navigate("/login");
    },
    [formData.username, defaultUsername]
  );

  // Handle OTP Change
  const handleOtpChange = useCallback(
    (value: string, index: number) => {
      if (/^[0-9]$/.test(value)) {
        const newOtpCode = [...otpCode];
        newOtpCode[index] = value;
        setOtpCode(newOtpCode);

        if (index < 5) {
          otpRefs.current[index + 1]?.focus();
        }
      }
    },
    [otpCode]
  );

  // Handle Key Down
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
      if (e.key === "Backspace") {
        const newOtpCode = [...otpCode];
        if (!newOtpCode[index] && index > 0) {
          newOtpCode[index - 1] = "";
          otpRefs.current[index - 1]?.focus();
        } else {
          newOtpCode[index] = "";
        }
        setOtpCode(newOtpCode);
      }
    },
    [otpCode]
  );

  // Fetch Usernames
  const handleFetchUsernames = useCallback(async () => {
    try {
      console.log("Fetching usernames for:", formData.email);
      setLoading(true);

      const res = await suggestUsernames(formData.email);

      const apiUsername = res.defaultUsername?.trim() ?? "";
      const generatedUsername = apiUsername
        ? `@${apiUsername}`
        : `@${formData.email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "")}`;

      setDefaultUsername(generatedUsername);
      setSuggestedUsernames(res.suggestions || []);

      setFormData((prev) => ({
        ...prev,
        username:
          prev.username && prev.username !== generatedUsername
            ? prev.username
            : generatedUsername,
      }));

      console.log("Username updated:", generatedUsername);
    } catch (err) {
      console.error("Error fetching username suggestions:", err);
      setError("Failed to fetch username suggestions.");
    } finally {
      setLoading(false);
    }
  }, [formData.email]);

  // Handle Resend OTP
  const handleResendOTP = useCallback(async () => {
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
  }, [formData.email]);

  // Render steps
  const renderStep1 = () => (
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
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button
        onClick={() => handleNext(true)}
        disabled={loading || !formData.name || !formData.email}
        className={`px-10 py-1 text-white uppercase text-xs transition 
          ${
            loading || !formData.name || !formData.email
              ? "bg-neutral-900 cursor-not-allowed opacity-50"
              : "bg-black"
          }
        `}
      >
        {loading ? "Processing..." : "Next"}
      </button>
    </>
  );

  const renderStep2 = () => (
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
            ref={(el) => {
              otpRefs.current[index] = el;
            }}
            type="tel"
            style={{
              width: "40px",
              height: "40px",
              margin: "0 5px",
              fontSize: "20px",
              textAlign: "center",
              borderBottom: value ? "1px solid #fff" : "1px solid #3C3C3C",
              outline: "none",
              backgroundColor: "transparent",
              color: "#fff",
            }}
            maxLength={1}
            autoFocus={index === 0}
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
        onClick={() => handleNext(true)}
        disabled={loading || otpCode.some((val) => val === "")}
        className={`px-10 py-1 text-white uppercase text-xs transition 
          ${
            loading || otpCode.some((val) => val === "")
              ? "bg-neutral-900 cursor-not-allowed opacity-50"
              : "bg-black"
          }
        `}
      >
        {loading ? "Verifying..." : "Next"}
      </button>
    </>
  );

  const renderStep3 = () => (
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
        onClick={() => handleNext(true)}
        disabled={loading || !formData.password}
        className={`px-10 py-1 text-white uppercase text-xs transition 
          ${
            loading || !formData.name || !formData.email
              ? "bg-neutral-900 cursor-not-allowed"
              : "bg-black"
          }
        `}
      >
        {loading ? "Processing..." : "Next"}
      </button>
    </>
  );

  const renderStep4 = () => (
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
        value={formData.username}
        onChange={(e) => {
          const value = e.target.value;
          if (value.startsWith("@")) {
            setFormData({ ...formData, username: value });
          } else {
            setFormData({ ...formData, username: `@${value}` });
          }
        }}
        onBlur={() => {
          if (!formData.username.trim() || formData.username === "@") {
            setFormData({
              ...formData,
              username: defaultUsername,
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
              onClick={() => setFormData({ ...formData, username: `@${u}` })}
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
      {/* Thông báo lỗi */}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div className="flex justify-between mt-2">
        <button
          onClick={() => setStep(Step.SetPassword)}
          className="text-blue-400 underline cursor-pointer"
        >
          Go Back
        </button>
        <button
          onClick={() => handleNext(false)}
          disabled={loading || !formData.username}
          className={`px-10 py-1 text-white uppercase text-xs transition 
            ${
              loading || !formData.username
                ? "bg-neutral-900 cursor-not-allowed opacity-50"
                : "bg-black"
            }
        `}
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="font-bold text-2xl">Register</h1>

      {step === Step.EnterNameAndEmail && renderStep1()}
      {step === Step.VerifyEmail && renderStep2()}
      {step === Step.SetPassword && renderStep3()}
      {step === Step.SetUsername && renderStep4()}

      {/* Hiển thị loading */}
      <p className="mt-2">{loading ? "Loading..." : ""}</p>
    </div>
  );
};

export default Register;
