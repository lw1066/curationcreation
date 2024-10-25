import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { useRouter } from "next/navigation";
import classes from "./login.module.css";
import { useExhibition } from "../contexts/ExhibitionContext"; // Import context
import LoadMoreButton from "./LoadMoreButton";
import { showUserFeedback } from "../utils/showUserFeedback";
import Link from "next/link";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const [loginError, setLoginError] = useState<string | null>(null);
  const router = useRouter();
  const { fetchItems } = useExhibition();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);

      // Fetch exhibition items and update context
      fetchItems();
      router.push("/Exhibition");
    } catch (error) {
      console.error("Error logging in:", error);
      if (error instanceof Error) {
        showUserFeedback(error.message);
      } else {
        showUserFeedback("An unknown error occurred.");
      }
    }
  };

  return (
    <form onSubmit={handleLogin} className={classes.loginForm}>
      <label htmlFor="email" className={classes.label}>
        Email
      </label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        autoComplete="email"
      />
      <label htmlFor="password" className={classes.label}>
        Password
      </label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        autoComplete="current-password"
      />
      <div
        style={{
          display: "flex",
          gap: "20px",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <LoadMoreButton
          text="Login"
          fontSize="16px"
          width="70px"
          height="70px"
          onClick={() => {}}
        />
        <Link href="/Signup" className={classes.yellowButton}>
          Signup
        </Link>
      </div>

      {/* {loginError && <p className="text-red-500 text-sm">{loginError}</p>} */}
    </form>
  );
};

export default Login;
