"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Lightbulb } from "lucide-react";
import Lookup from "@/data/Lookup";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/context/UserContext";
import { PromptContext } from "@/context/PromptContext";
import { SignInDiaglog } from "@/components/Home/SignInDiaglog";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";

export default function Home() {
  const [userprompt, setUserPrompt] = useState("");
  const { user, setUser } = useContext(UserContext);
  const { prompt, setPrompt } = useContext(PromptContext);
  const [showDialog, setShowDialog] = useState(false);

  const CreateWorkspace = useMutation(api.workspace.CreateWorkspace);
  const router = useRouter();

  const executePrompt = async (prompt) => {
    setUserPrompt("");
    if (!prompt) {
      alert("Please enter a prompt");
      return;
    }

    if (!user) {
      setShowDialog(true);
      return;
    }

    setPrompt(prompt);
    const messages = [
      {
        role: "user",
        content: prompt,
      },
    ];
    const files = null; // Assuming files are not needed for now
    const userId = JSON.parse(localStorage.getItem("user")).id;

    const result = await CreateWorkspace({ user: userId, messages, files });

    if (result) {
      console.log("Workspace created successfully");
      setPrompt(prompt);
      router.push(`/workspace/${result}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-5rem)] px-4">
      <div className="max-w-3xl w-full">
        <h1>Welcome to Code Pilot!</h1>
        <p className="text-gray-500">
          Your AI-powered coding assistant. Let's build something amazing
          together!
        </p>
        <div className="relative">
          <Textarea
            className="h-40"
            placeholder="Enter your prompt here..."
            value={userprompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                executePrompt(userprompt);
              }
            }}
          />
          <Button
            className="absolute bottom-0 right-0"
            onClick={() => executePrompt(userprompt)}
          >
            <Lightbulb />
          </Button>
        </div>
        <div className=" hidden md:flex flex-wrap justify-center">
          {Lookup.SUGGSTIONS.map((item, index) => {
            return (
              <Button
                key={index}
                className="m-2"
                onClick={() => executePrompt(item)}
              >
                {item}
              </Button>
            );
          })}
        </div>
      </div>
      <SignInDiaglog open={showDialog} onOpenChange={setShowDialog} />
    </div>
  ); // height calculate -> 100vh - header height ->
}
