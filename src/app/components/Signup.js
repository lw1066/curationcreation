import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { useRouter } from "next/navigation";
import classes from "./signup.module.css";
import LoadMoreButton from "./LoadMoreButton";
import Link from "next/link";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signUpError, setSignUpError] = useState(null);
  const router = useRouter();

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (error) {
      console.error("Error signing up:", error);

      setSignUpError(error);
    }
  };

  return (
    <form onSubmit={handleSignUp} className={classes.signupForm}>
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
        autoComplete="new-password"
      />
      <div
        style={{
          display: "flex",
          gap: "20px",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Link href="/Login" className={classes.yellowButton}>
          Login
        </Link>
        <LoadMoreButton
          text="Signup"
          fontSize="16px"
          width="70px"
          height="70px"
          onClick={() => {}}
        />
      </div>
      {signUpError && <p>{signUpError.message}</p>}
    </form>
  );
};

export default SignUp;
