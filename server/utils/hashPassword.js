import bcrypt from "bcryptjs";

// 📌 Mã hóa mật khẩu trước khi lưu vào database
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// 📌 So sánh mật khẩu người dùng nhập với mật khẩu đã mã hóa trong database
export const comparePassword = async (enteredPassword, hashedPassword) => {
  return await bcrypt.compare(enteredPassword, hashedPassword);
};
