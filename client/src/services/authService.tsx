const API_URL = "http://localhost:4000"; // Đổi thành URL của backend nếu deploy

export const loginWithGoogle = () => {
  window.location.href = `${API_URL}/auth/google`;
};

export const loginWithGitHub = () => {
  window.location.href = `${API_URL}/auth/github`;
};

export const loginWithApple = () => {
  window.location.href = `${API_URL}/auth/apple`;
};
