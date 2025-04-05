import "./App.css";
import { useState, useMemo, useCallback } from "react";
import { createEditor, Editor, Transforms, Text } from "slate";
import { Slate, Editable, withReact, ReactEditor } from "slate-react";
import { withHistory } from "slate-history";

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
const Toolbar = ({ editor, currentStyles }) => {
  const colors = ["#000000", "#FF0000", "#00FF00", "#0000FF", "#800080"];
  const fonts = ["Arial", "Times New Roman", "Courier New", "Patrick Hand"];
  const sizeOptions = [
    { label: "S", value: 16 },
    { label: "M", value: 20 },
    { label: "L", value: 24 },
    { label: "XL", value: 28 },
  ];

  const alignments = ["left", "center", "right"];

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

  return (
    <div className="toolbar">
      {/* Font Family */}
      <div className="toolbar-section">
        <label>Font:</label>
        <div className="option-buttons">
          {fonts.map((font) => (
            <button
              key={font}
              style={{
                fontFamily:
                  font === "Patrick Hand" ? "'Patrick Hand', cursive" : font,
              }}
              className={currentStyles.font === font ? "active" : ""}
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
        <div className="option-buttons">
          {sizeOptions.map(({ label, value }) => (
            <button
              key={label}
              className={currentStyles.size === value ? "active" : ""}
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
          {colors.map((color) => (
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
        </div>
      </div>

      {/* Alignment */}
      <div className="toolbar-section">
        <label>Alignment:</label>
        <div className="option-buttons">
          {alignments.map((align) => (
            <button
              key={align}
              className={currentStyles.align === align ? "active" : ""}
              onMouseDown={(e) => {
                e.preventDefault();
                applyAlignment(align);
              }}
            >
              {align.charAt(0).toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Bold / Italic */}
      <div className="toolbar-section">
        <label>Style:</label>
        <div className="style-buttons">
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              CustomEditor.toggleBoldMark(editor);
            }}
            className={currentStyles.bold ? "active" : ""}
          >
            B
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              CustomEditor.toggleItalicMark(editor);
            }}
            className={currentStyles.italic ? "active" : ""}
          >
            I
          </button>
        </div>
      </div>
    </div>
  );
};

// Leaf rendering component
const Leaf = ({ attributes, children, leaf }) => {
  const style = {
    color: leaf.color || "#000000",
    fontFamily:
      leaf.font === "Patrick Hand"
        ? "'Patrick Hand', cursive"
        : leaf.font || "Arial",
    fontSize: `${leaf.size || 16}px`,
    fontWeight: leaf.bold ? "bold" : "normal",
    fontStyle: leaf.italic ? "italic" : "normal",
  };
  return (
    <span {...attributes} style={style}>
      {children}
    </span>
  );
};

// Element rendering component
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
      children: [{ text: "Start typing your notes here..." }],
    },
  ];

  const [value, setValue] = useState(() => initialValue);

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
      font: marks.font || "Arial",
      size: marks.size || 16,
      align: match ? match[0].align || "left" : "left",
    };
  }, [editor]);

  const [currentStyles, setCurrentStyles] = useState(() => getCurrentStyles());

  const handleEditorChange = (newValue) => {
    if (newValue && Array.isArray(newValue) && newValue.length > 0) {
      setValue(newValue);
    } else {
      setValue(initialValue);
    }
    setCurrentStyles(getCurrentStyles());
  };

  return (
    <div className="App">
      <Toolbar editor={editor} currentStyles={currentStyles} />
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
                    align: "left",
                    children: [{ text: "" }],
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
