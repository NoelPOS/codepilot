"use client";

import { UserContext } from "@/context/UserContext";
import { api } from "@/convex/_generated/api";
import { useConvex, useMutation } from "convex/react";
import { Lightbulb } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import React, { useContext, useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import generateAI from "@/lib/gemini";
import ReactMarkdown from "react-markdown";

const Sidebar = () => {
  const workspaceId = useParams().id;
  const convex = useConvex();
  const { user, setUser } = useContext(UserContext);

  const [messages, setMessages] = useState([]);
  const [userprompt, setUserPrompt] = useState("");

  const UpdateWorkspace = useMutation(api.workspace.UpdateWorkspace);

  const executePrompt = async (prompt) => {
    if (!prompt) return;
    const newMessage = {
      role: "user",
      content: prompt,
    };
    setMessages((prev) => [...prev, newMessage]);
    await UpdateWorkspace({
      id: workspaceId,
      messages: [...messages, newMessage],
      files: null,
    });
    setUserPrompt("");
  };

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const workspace = await convex.query(api.workspace.GetWorkspaceById, {
          id: workspaceId,
        });
        if (!workspace) {
          console.error("Workspace not found");
          return;
        }
        setMessages(workspace.messages || []);
      } catch (error) {
        console.error("Error fetching workspace:", error);
      }
    };

    fetchWorkspace();
  }, [workspaceId]);

  useEffect(() => {
    const fetchAIResponse = async () => {
      if (messages[messages.length - 1]?.role == "user") {
        const result = await generateAI(messages[messages.length - 1]?.content);

        const newMessage = {
          role: "assistant",
          content: result,
        };
        setMessages((prev) => [...prev, newMessage]);
        setUserPrompt("");
        await UpdateWorkspace({
          id: workspaceId,
          messages: [...messages, newMessage],
          files: null,
        });
      }
    };
    fetchAIResponse();
  }, [messages]);

  return (
    <div className="flex flex-col w-1/4 h-full p-4 border-r border-gray-300 ">
      {/* Make the messages container scrollable with fixed height */}
      <div
        className="flex-1 overflow-y-auto mb-4 scrollbar-hide"
        style={{
          maxHeight: "calc(100vh - 13rem)",
        }}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-2 mb-4 ${message.role === "user" ? "justify-start" : "justify-end"}`}
          >
            {message.role == "user" && (
              <Image src={user.picture} width={30} height={30} alt="profile" />
            )}
            <div className="leading-8">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
      <div className="relative mt-auto">
        <Textarea
          className="h-20"
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
    </div>
  );
};

export default Sidebar;
