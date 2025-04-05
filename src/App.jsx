import "./App.css";
import { useState, useMemo, useCallback, useRef } from "react";
import { createEditor, Editor, Transforms } from "slate";
import { Slate, Editable, withReact, ReactEditor } from "slate-react";
import { withHistory } from "slate-history";
import { Infinity } from "lucide-react";
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";

// Custom editor utilities
const CustomEditor = {
  isBoldMarkActive(editor) {
    const marks = Editor.marks(editor);
    return marks ? marks.bold === true : false;
  },
  isItalicMarkActive(editor) {
    const marks = Editor.marks(editor);
    return marks ? marks.italic === true : false;
  },
  toggleBoldMark(editor) {
    const isActive = CustomEditor.isBoldMarkActive(editor);
    if (isActive) {
      Editor.removeMark(editor, "bold");
    } else {
      Editor.addMark(editor, "bold", true);
    }
  },
  toggleItalicMark(editor) {
    const isActive = CustomEditor.isItalicMarkActive(editor);
    if (isActive) {
      Editor.removeMark(editor, "italic");
    } else {
      Editor.addMark(editor, "italic", true);
    }
  },
};

// Toolbar component
const Toolbar = ({ editor, currentStyles, isLightMode, setIsLightMode }) => {
  const baseColors = ["#000000", "#c9170e", "#529c4f", "#0000ff", "#e29134"]; // Removed the last color (#800080)
  const fonts = [
    "Arial",
    "Times New Roman",
    "Courier New",
    "Patrick Hand",
    "Indie Flower",
  ];
  const sizeOptions = [
    { label: "S", value: 16 },
    { label: "M", value: 20 },
    { label: "L", value: 24 },
    { label: "XL", value: 28 },
  ];
  const alignments = ["left", "center", "right"];

  // State to track the custom color selected by the color picker
  const [customColor, setCustomColor] = useState("#800080"); // Default to the previous purple color

  const applyMark = (key, value) => {
    if (editor.selection) {
      Editor.addMark(editor, key, value);
    }
    ReactEditor.focus(editor);
  };

  const applyAlignment = (align) => {
    const [match] = Editor.nodes(editor, {
      match: (n) => n.type === "paragraph",
      mode: "lowest",
    });

    if (match) {
      Transforms.setNodes(
        editor,
        { align },
        { match: (n) => n.type === "paragraph", mode: "lowest" }
      );
    }
    ReactEditor.focus(editor);
  };

  const toggleLightMode = () => {
    const app = document.querySelector(".App");
    const container = document.querySelector(".container");
    const editorEl = document.querySelector(".editor");

    const newMode = !isLightMode;
    setIsLightMode(newMode);

    const bgColor = newMode ? "white" : "rgb(242, 244, 247)";
    app.style.backgroundColor = bgColor;
    container.style.backgroundColor = bgColor;

    if (editorEl) {
      if (newMode) {
        editorEl.style.border = "none";
        editorEl.style.boxShadow = "none";
      } else {
        editorEl.style.border = "1px solid #ccc";
        editorEl.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.1)";
      }
    }
  };

  const handleColorPickerChange = (e) => {
    const selectedColor = e.target.value;
    setCustomColor(selectedColor); // Update the custom color state
    applyMark("color", selectedColor); // Apply the selected color to the editor
  };

  return (
    <div className="toolbar">
      {/* Font Family */}
      <div className="toolbar-section">
        <label>Font:</label>
        <div className="font-container">
          {fonts.map((font) => (
            <button
              key={font}
              style={{
                fontFamily:
                  font === "Patrick Hand"
                    ? "'Patrick Hand', cursive"
                    : font === "Indie Flower"
                    ? "'Indie Flower', cursive"
                    : font,
              }}
              className={`font-button ${
                currentStyles.font === font ? "active" : ""
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                applyMark("font", font);
              }}
            >
              {font}
            </button>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div className="toolbar-section">
        <label>Size:</label>
        <div className="size-container">
          {sizeOptions.map(({ label, value }) => (
            <button
              key={label}
              className={`size-button ${
                currentStyles.size === value ? "active" : ""
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                applyMark("size", value);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Font Color */}
      <div className="toolbar-section">
        <label>Color:</label>
        <div className="color-swatches">
          {baseColors.map((color) => (
            <button
              key={color}
              style={{ backgroundColor: color }}
              className={`swatch ${
                currentStyles.color === color ? "active" : ""
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                applyMark("color", color);
              }}
            />
          ))}
          {/* Custom Color Button with Color Picker */}
          <div className="color-picker-wrapper">
            <button
              style={{ backgroundColor: customColor }}
              className={`swatch ${
                currentStyles.color === customColor ? "active" : ""
              }`}
              onMouseDown={(e) => e.preventDefault()} // Prevent Slate from losing focus
            />
            <input
              type="color"
              value={customColor}
              onChange={handleColorPickerChange}
              className="color-picker-overlay"
              onMouseDown={(e) => e.preventDefault()} // Prevent Slate from losing focus
            />
          </div>
        </div>
      </div>

      {/* Alignment */}
      <div className="toolbar-section">
        <label>Alignment:</label>
        <div className="align-container">
          {alignments.map((align) => {
            const Icon =
              align === "left"
                ? AlignLeft
                : align === "center"
                ? AlignCenter
                : AlignRight;

            return (
              <button
                key={align}
                className={`align-button ${
                  currentStyles.align === align ? "active" : ""
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  applyAlignment(align);
                }}
              >
                <Icon size={18} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Style Buttons */}
      <div className="toolbar-section">
        <label>Style:</label>
        <div className="style-container">
          <button
            className={`style-button ${currentStyles.bold ? "active" : ""}`}
            onMouseDown={(e) => {
              e.preventDefault();
              CustomEditor.toggleBoldMark(editor);
            }}
          >
            B
          </button>
          <button
            className={`style-button ${currentStyles.italic ? "active" : ""}`}
            onMouseDown={(e) => {
              e.preventDefault();
              CustomEditor.toggleItalicMark(editor);
            }}
          >
            I
          </button>
          <button
            className={`style-button ${isLightMode ? "active" : ""}`}
            onMouseDown={(e) => {
              e.preventDefault();
              toggleLightMode();
            }}
          >
            <Infinity size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Leaf Component
const Leaf = ({ attributes, children, leaf }) => {
  const style = {
    color: leaf.color || "#000000",
    fontFamily:
      leaf.font === "Patrick Hand"
        ? "'Patrick Hand', cursive"
        : leaf.font === "Indie Flower"
        ? "'Indie Flower', cursive"
        : leaf.font || "Indie Flower",
    fontSize: `${leaf.size || 20}px`,
    fontWeight: leaf.bold ? "bold" : "normal",
    fontStyle: leaf.italic ? "italic" : "normal",
  };
  return (
    <span {...attributes} style={style}>
      {children}
    </span>
  );
};

// Element Component
const Element = ({ attributes, children, element }) => {
  return (
    <p {...attributes} style={{ textAlign: element.align || "left" }}>
      {children}
    </p>
  );
};

const App = () => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  const initialValue = [
    {
      type: "paragraph",
      align: "left",
      children: [{ text: "" }],
    },
  ];

  const [value, setValue] = useState(() => initialValue);
  const [isLightMode, setIsLightMode] = useState(false);

  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);
  const renderElement = useCallback((props) => <Element {...props} />, []);

  const getCurrentStyles = useCallback(() => {
    const marks = Editor.marks(editor) || {};
    const [match] = Editor.nodes(editor, {
      match: (n) => n.type === "paragraph",
      mode: "lowest",
    });

    return {
      bold: marks.bold || false,
      italic: marks.italic || false,
      color: marks.color || "#000000",
      font: marks.font || "Indie Flower",
      size: marks.size || 20,
      align: match ? match[0].align || "left" : "left",
    };
  }, [editor]);

  const [currentStyles, setCurrentStyles] = useState(() => getCurrentStyles());

  const handleEditorChange = (newValue) => {
    if (newValue && Array.isArray(newValue)) {
      setValue(newValue);
      setCurrentStyles(getCurrentStyles());
    }
  };

  return (
    <div className="App">
      <Toolbar
        editor={editor}
        currentStyles={currentStyles}
        isLightMode={isLightMode}
        setIsLightMode={setIsLightMode}
      />
      <div className="container">
        <Slate
          editor={editor}
          initialValue={initialValue}
          value={value}
          onChange={handleEditorChange}
        >
          <div className="editor-layout">
            <Editable
              className="editor"
              renderLeaf={renderLeaf}
              renderElement={renderElement}
              placeholder="Start typing your notes here..."
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  Transforms.insertNodes(editor, {
                    type: "paragraph",
                    align: currentStyles.align || "left",
                    children: [
                      {
                        text: "",
                        font: currentStyles.font || "Indie Flower",
                        size: currentStyles.size || 20,
                        color: currentStyles.color || "#000000",
                      },
                    ],
                  });
                }
              }}
              onSelect={() => setCurrentStyles(getCurrentStyles())}
            />
          </div>
        </Slate>
      </div>
    </div>
  );
};

export default App;
