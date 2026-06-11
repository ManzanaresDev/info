import React, { useState } from "react";

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const Menu = [
    { name: "Skills", href: "#Skills" },
    { name: "Services", href: "#Services" },
    { name: "About me", href: "#About" },
    { name: "Projects", href: "#Projects" },
    { name: "Testimonials", href: "#Testimonials" },
    { name: "Contact", href: "#Contact" },
  ];

  const scrollIntoSection = (href) => {
    setIsMenuOpen(false);
    const section = document.querySelector(href);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="z-20">
      <nav className="flex justify-center">
        <div className="flex items-center relative bg-white w-[90%] md:w-4/5 p-3 justify-between rounded-3xl shadow-md">
          {/* Logo */}
          <div className="text-3xl font-bold flex items-center">
            Logo
            <img
              src="https://img.icons8.com/material-outlined/24/F9E400/filled-circle--v1.png"
              alt="Filled circle"
              className="w-2 h-3 ml-2"
            />
          </div>

          {/* Bouton menu hamburger (mobile seulement) */}
          <div className="md:hidden z-30">
            {!isMenuOpen && (
              <button
                type="button"
                className="block focus:outline-none"
                onClick={() => setIsMenuOpen(true)}
              >
                <img
                  src="https://img.icons8.com/ios-filled/50/000000/menu--v1.png"
                  alt="menu"
                  width={40}
                  height={40}
                />
              </button>
            )}
          </div>

          {/* Menu responsive */}
          <div
            className={`${
              isMenuOpen ? "flex" : "hidden"
            } fixed inset-0 z-20 flex-col items-center justify-center bg-black/90
            md:static md:z-auto md:flex md:flex-row md:space-x-8 md:bg-transparent`}
          >
            {/* Bouton "croix" visible uniquement sur mobile */}
            <button
              onClick={() => setIsMenuOpen(false)}
              className="absolute top-5 right-5 md:hidden"
            >
              <img
                src="https://img.icons8.com/ios-filled/50/ffffff/delete-sign.png"
                alt="close"
                width={35}
                height={35}
              />
            </button>

            <ul className="flex flex-col items-center space-y-6 md:flex-row md:space-x-8 md:space-y-0 font-medium">
              {Menu.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className="block text-white md:text-black hover:text-yellow-400 transition-all duration-200"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollIntoSection(item.href);
                    }}
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>

            <button className="mt-8 md:mt-0 bg-yellow-400 font-bold py-2 px-5 border border-b-4 border-black rounded-3xl hover:text-black hover:border-yellow-300">
              Let's talk
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default NavBar;
