// Hàm tạo mã OTP 6 số
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Hàm tạo thời gian hết hạn OTP (mặc định 10 phút)
export const getOtpExpiry = (minutes = 10) => {
  return new Date(Date.now() + minutes * 60 * 1000);
};
