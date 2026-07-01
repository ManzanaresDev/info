import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css"; // important : les styles des animations

function App() {
  useEffect(() => {
    AOS.init({
      duration: 1000, // durée de l'animation en ms
      once: true, // joue l’animation une seule fois
      easing: "ease-in-out", // type de transition
    });
  }, []);

  return (
    <div>
      <h1 data-aos="fade-up">Bienvenue</h1>
      <p data-aos="zoom-in">Voici un paragraphe animé avec AOS.</p>
    </div>
  );
}

export default App;
