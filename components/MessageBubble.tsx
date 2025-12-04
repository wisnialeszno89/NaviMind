"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";

type Props = {
  content: string;
  role: "user" | "assistant";
};

export default function MessageBubble({ content, role }: Props) {
  return (
    <div
      className={`max-w-[80%] p-4 rounded-2xl whitespace-pre-wrap shadow leading-relaxed
        ${role === "assistant"
          ? "bg-[#151515] border border-[#333] text-gray-200"
          : "bg-blue-600 ml-auto text-white"}
      `}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
        components={{
          code({ inline, className, children, ...props }: any) {
            return !inline ? (
              <pre className="rounded-xl p-3 bg-black/40 border border-gray-700 overflow-x-auto">
                <code {...props} className={className}>
                  {children}
                </code>
              </pre>
            ) : (
              <code
                {...props}
                className="px-1 py-0.5 rounded bg-black/40 border border-gray-700"
              >
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}