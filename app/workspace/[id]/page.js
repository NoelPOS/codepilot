import CodeView from "@/components/Workspace/CodeView";
import Sidebar from "@/components/Workspace/Sidebar";
import React from "react";

const Workspace = () => {
  return (
    <div className="flex flex-row max-h-[calc(100vh-5rem)] px-10 gap-4">
      <Sidebar />
      <CodeView />
    </div>
  );
};

export default Workspace;
