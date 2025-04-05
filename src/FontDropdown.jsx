// FontDropdown.jsx
import React, { useState } from "react";
import "./FontDropdown.css";

const allFonts = [
  "Playwrite DE Grund",
  "Arial",
  "Comfortaa",
  "Times New Roman",
  "Courier New",
  "Georgia",
];

const FontDropdown = ({ applyFont, currentFont, fonts = allFonts }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredFonts = fonts.filter((font) =>
    font.toLowerCase().includes(search.toLowerCase())
  );

  const getFontStyle = (font) => {
    if (["Arial", "Georgia", "Times New Roman", "Courier New"].includes(font)) {
      return font; // system font
    }
    return `'${font}', cursive`; // Google/custom fonts
  };

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
                style={{ fontFamily: getFontStyle(font) }}
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
