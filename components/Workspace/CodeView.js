"use client";

import React, { useState } from "react";
import {
  Sandpack,
  SandpackCodeEditor,
  SandpackFileExplorer,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react";
import Lookup from "@/data/Lookup";

const CodeView = () => {
  const [files, setFiles] = useState(Lookup.DEFAULT_FILE);
  return (
    <div className="w-full flex-2/3">
      <SandpackProvider
        files={files}
        theme="dark"
        template="react"
        customSetup={{
          dependencies: { ...Lookup.DEPENDANCY },
        }}
        options={{
          externalResources: ["https://cdn.tailwindcss.com"],
        }}
      >
        <SandpackLayout>
          <SandpackFileExplorer style={{ height: "85vh" }} />
          <SandpackCodeEditor
            closableTabs
            showTabs
            style={{ height: "85vh" }}
          />
          <SandpackPreview style={{ height: "85vh" }} />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
};

export default CodeView;
