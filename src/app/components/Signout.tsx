import { useAuth } from "../contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import LoadMoreButton from "./LoadMoreButton";

const SignOut: React.FC = () => {
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log("User signed out");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (!user) {
    return null; // Don't display the sign out button if the user is not logged in
  }

  return (
    <LoadMoreButton
      text="Sign Out"
      height="40px" // Adjust height as needed
      width="40px" // Adjust width as needed
      onClick={handleSignOut} // Link the button click to the sign out function
    />
  );
};

export default SignOut;
