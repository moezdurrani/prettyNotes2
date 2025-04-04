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
  const colors = ["#000000", "#FF0000", "#00FF00", "#0000FF"];
  const fonts = ["Arial", "Times New Roman", "Courier New"];
  const sizes = [12, 16, 20, 24];
  const alignments = ["left", "center", "right"];

  const applyMark = (key, value) => {
    if (editor.selection) {
      Editor.addMark(editor, key, value);
      console.log(`Applied mark to selection: ${key} = ${value}`);
    } else {
      Editor.addMark(editor, key, value);
      console.log(
        `No selection. Mark ${key} = ${value} will apply to next text typed.`
      );
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
      console.log(`Applied alignment: ${align}`);
    } else {
      console.warn("No paragraph node found to apply alignment.");
    }
    ReactEditor.focus(editor);
  };

  return (
    <div className="toolbar">
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

      <select
        value={currentStyles.color || "#000000"}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => applyMark("color", e.target.value)}
      >
        {colors.map((color) => (
          <option key={color} value={color}>
            {color}
          </option>
        ))}
      </select>

      <select
        value={currentStyles.font || "Arial"}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => applyMark("font", e.target.value)}
      >
        {fonts.map((font) => (
          <option key={font} value={font}>
            {font}
          </option>
        ))}
      </select>

      <select
        value={currentStyles.size || 16}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => applyMark("size", parseInt(e.target.value))}
      >
        {sizes.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>

      <select
        value={currentStyles.align || "left"}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => applyAlignment(e.target.value)}
      >
        {alignments.map((align) => (
          <option key={align} value={align}>
            {align}
          </option>
        ))}
      </select>
    </div>
  );
};

// Leaf rendering component
const Leaf = ({ attributes, children, leaf }) => {
  const style = {
    color: leaf.color || "#000000",
    fontFamily: leaf.font || "Arial",
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
      <div className="container">
        <Slate
          editor={editor}
          initialValue={initialValue}
          value={value}
          onChange={handleEditorChange}
        >
          <Toolbar editor={editor} currentStyles={currentStyles} />
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
            onSelect={() => {
              setCurrentStyles(getCurrentStyles());
            }}
          />
        </Slate>
      </div>
    </div>
  );
};

export default App;
