import { useState, useEffect } from "react";

import MindMateAI from "./mindmate-ai";
import MindMateAuth from "./components/MindmateAuth";

function App() {

  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {

    const savedAuth =
      localStorage.getItem("mindmate-auth");

    if (savedAuth === "true") {
      setAuthenticated(true);
    }

  }, []);

  return (
    <>
      {!authenticated ? (
        <MindMateAuth
          onSuccess={() => {
            localStorage.setItem(
              "mindmate-auth",
              "true"
            );

            setAuthenticated(true);
          }}
        />
      ) : (
        <MindMateAI />
      )}
    </>
  );
}

export default App;