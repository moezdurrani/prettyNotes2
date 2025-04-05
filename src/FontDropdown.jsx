// FontDropdown.jsx
import React, { useState } from "react";
import "./FontDropdown.css";

const fonts = [
  "Gamja Flower",
  "Playwrite DE Grund",
  "Patrick Hand",
  "Indie Flower",
];

const FontDropdown = ({ applyFont, currentFont }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredFonts = fonts.filter((font) =>
    font.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="custom-font-dropdown">
      <button
        className="font-dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        {currentFont || "Choose font..."}
      </button>

      {isOpen && (
        <div className="font-dropdown-menu">
          <input
            type="text"
            placeholder="Search font"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="font-dropdown-search"
          />
          <div className="font-dropdown-options">
            {filteredFonts.map((font) => (
              <div
                key={font}
                className={`font-option ${
                  currentFont === font ? "selected" : ""
                }`}
                style={{ fontFamily: `'${font}', cursive` }}
                onClick={() => {
                  applyFont(font);
                  setIsOpen(false);
                }}
              >
                {font}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FontDropdown;
