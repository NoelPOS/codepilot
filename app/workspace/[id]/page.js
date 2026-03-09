"use client";

import CodeView from "@/components/Workspace/CodeView";
import ChatPanel from "@/components/Workspace/ChatPanel";
import React, { useState } from "react";

const Workspace = () => {
  const [layoutMode, setLayoutMode] = useState("split"); // "split" | "floating"

  return (
    <div className={`flex ${layoutMode === "split" ? "flex-col" : "flex-row relative"} max-h-[calc(100vh-5rem)] px-10 gap-4`}>
      <CodeView layoutMode={layoutMode} setLayoutMode={setLayoutMode} />
      <ChatPanel layoutMode={layoutMode} />
    </div>
  );
};

export default Workspace;
