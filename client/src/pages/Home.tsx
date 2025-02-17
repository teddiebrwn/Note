import { Link } from "react-router-dom";

export const Home = () => {
  // const navigate = useNavigate();

  return (
    <>
      <p>Home</p>
      <Link to="/register">Register</Link>
      <Link to="/login">Login</Link>
    </>
  );
};
