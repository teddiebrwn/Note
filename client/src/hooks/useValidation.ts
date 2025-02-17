import { useState } from "react";

export const useValidation = () => {
  const [emailError, setEmailError] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    if (!email) {
      setEmailError("PLEASE ADD YOUR EMAIL ADDRESS");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setEmailError(
        "INVALID EMAIL FORMAT. PLEASE TRY AGAIN, EXAMPLE 'JOHN.SMITH@EMAIL.COM'."
      );
      return false;
    }

    setEmailError(null);
    return true;
  };

  return {
    emailError,
    validateEmail,
  };
};
