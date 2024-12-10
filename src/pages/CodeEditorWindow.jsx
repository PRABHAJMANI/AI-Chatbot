import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import "../styles/CodeEditorWindow.css"; // Adjust the import path if necessary

const CodeEditorWindow = ({ onChange, code }) => {
  const [value, setValue] = useState(code || "");
  const [language, setLanguage] = useState("javascript");
  const [theme, setTheme] = useState("vs-dark");
  const [font, setFont] = useState("Courier New");

  const handleEditorChange = (value) => {
    setValue(value);
    onChange("code", value);
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleThemeChange = (e) => {
    setTheme(e.target.value);
  };

  const handleFontChange = (e) => {
    setFont(e.target.value);
  };

  return (
    <div className="code-editor-window">
      <div className="options">
        <label htmlFor="language">Language:</label>
        <select id="language" value={language} onChange={handleLanguageChange}>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
          <option value="c">C</option>
          {/* Add more language options as needed */}
        </select>

        <label htmlFor="theme">Theme:</label>
        <select id="theme" value={theme} onChange={handleThemeChange}>
          <option value="vs-dark">Dark</option>
          <option value="vs-light">Light</option>
          <option value="hc-black">High Contrast</option>
          {/* Add more theme options as needed */}
        </select>

        <label htmlFor="font">Font:</label>
        <select id="font" value={font} onChange={handleFontChange}>
          <option value="Courier New">Courier New</option>
          <option value="Consolas">Consolas</option>
          <option value="Monaco">Monaco</option>
          <option value="Arial">Arial</option>
          {/* Add more font options as needed */}
        </select>
      </div>
      <div className="editor">
        <Editor
          height="72.5vh"
          width="100%"
          language={language}
          value={value}
          theme={theme}
          options={{
            fontFamily: font,
          }}
          defaultValue="// Explain the code to the AI interview agent"
          onChange={handleEditorChange}
        />
      </div>
    </div>
  );
};

export default CodeEditorWindow;