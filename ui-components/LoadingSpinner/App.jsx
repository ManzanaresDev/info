import React, { Suspense, lazy } from "react";
import LoadingSpinner from "./components/LoadingSpinner/LoadingSpinner";
import backgroundImage from "./assets/background.jpg";
// Lazy load components
const NavBar = lazy(() => import("./components/NavBar/NavBar"));

function App() {
  return (
    <div
      className="relative min-h-screen pt-4 bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <Suspense
        fallback={
          <div className="absolute inset-0 flex justify-center items-center z-50">
            <LoadingSpinner className="h-24 w-24 border-8 border-gray-700 border-t-yellow-400" />
          </div>
        }
      >
        <div className="">
          <div className="">
            <NavBar />
          </div>
        </div>
      </Suspense>
    </div>
  );
}

export default App;
