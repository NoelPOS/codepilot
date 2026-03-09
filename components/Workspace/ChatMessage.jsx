import React from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";

/**
 * ChatMessage — renders a single chat message bubble.
 *
 * Reusable component extracted from the inline JSX in Sidebar.js.
 * Supports both user messages (with avatar) and assistant messages.
 *
 * @param {object}  props
 * @param {object}  props.message      { role: "user"|"assistant", content: string }
 * @param {string}  [props.userPicture] URL of the user's profile picture (shown for user messages)
 */
const ChatMessage = ({ message, userPicture }) => {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-2 mb-4 ${isUser ? "justify-start" : "justify-end"}`}
    >
      {isUser && userPicture && (
        <Image
          src={userPicture}
          width={28}
          height={28}
          alt="profile"
          className="rounded-full shrink-0 mt-1"
        />
      )}
      <div className="leading-7 text-sm max-w-[85%]">
        <ReactMarkdown>{message.content}</ReactMarkdown>
      </div>
    </div>
  );
};

export default ChatMessage;
