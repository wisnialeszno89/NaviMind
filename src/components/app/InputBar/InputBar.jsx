"use client";

import { useContext, useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { UIContext } from "@/context/UIContext";
import {
  createChatGlobal,
  addMessageToGlobalChat,
  createChatForTopic,
  addMessageToTopicChat,
} from "@/firebase/chatStore";
import { db } from "@/firebase/config";
import { auth } from "@/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { ChatContext } from "@/context/ChatContext";
import { doc, getDoc } from "firebase/firestore";

import Tooltip from "@/components/common/Tooltip";
import FilePreview from "./FilePreview";
import AIModelSelector from "./AIModelSelector";

const FILES_LIMIT = 5;

export default function InputBar() {
  const { isSidebarOpen, inputText, setInputText } = useContext(UIContext);
  const pathname = usePathname();
const topicIdFromURL =
  pathname && pathname.startsWith("/app/projects/")
    ? pathname.split("/app/projects/")[1]?.split("/")[0] || null
    : null;


  const {
    sendMessage,
    projectChatSessions,
    activeProject,
    activeChatId,
    addCustomProject,
    setProjectChatSessions,
    setActiveProject,
    setActiveChatId,
  } = useContext(ChatContext);

  const [inputValue, setInputValue] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [fileAlert, setFileAlert] = useState("");
  const inputRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const { isFullscreen } = useContext(UIContext);


  /* ───────── USER AUTH ───────── */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  /* ───────── TEXTAREA AUTO-RESIZE ───────── */
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(
        inputRef.current.scrollHeight,
        168
      )}px`;
    }
  }, [inputValue]);

  /////////////////////////////////////////////////////
  useEffect(() => {
  if (inputText) {
    setInputValue(inputText);
    setIsActive(true); 
    setInputText(""); 

    // 🖊️ фокусим textarea, чтобы Enter работал сразу
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }
}, [inputText]);


  /* ───────── HANDLERS ───────── */
 const handleSend = async () => {
  if (!inputValue.trim()) return;

  // ✅ если мы на странице топика — тут реальный topicId
  const topicId = topicIdFromURL || null;
  const inTopic = Boolean(topicId);

  let chatId = activeChatId;

  try {
    // 1) если чата ещё нет — создаём там, где находимся (топик/глобал)
    if (!chatId) {
      if (inTopic) {
        // --- ЧАТ ВНУТРИ ТОПИКА ---
        const created = await createChatForTopic({
          uid: currentUser?.uid,
          topicId,
          messageText: inputValue,
        });

        chatId = created.chatId;
        setActiveProject(topicId);    // фиксируем активный топик
        setActiveChatId(chatId);

        // подтянем createdAt из Firestore
        const docRef = doc(
          db,
          "users",
          currentUser.uid,
          "topics",
          topicId,
          "chats",
          chatId
        );
        const snap = await getDoc(docRef);
        const data = snap.exists() ? snap.data() : null;

        const newChatObj = {
          chatId,
          createdAt: data?.createdAt?.toMillis?.() ?? Date.now(),
          messages: [{ role: "user", content: inputValue }],
          title: inputValue.slice(0, 30),
        };

        // кладём локально строго под topicId (с анти-дубликатом)
        setProjectChatSessions((prev) => {
          const updated = { ...prev };
          const arr = updated[topicId] || [];
          updated[topicId] = [newChatObj, ...arr.filter(x => x.chatId !== chatId)];
          return updated;
        });
      } else {
        // --- ГЛОБАЛЬНЫЙ ЧАТ ---
        const created = await createChatGlobal({
          uid: currentUser?.uid,
          messageText: inputValue,
        });

        chatId = created.chatId;
        setActiveProject(null);       // выходим из топика на всякий случай
        setActiveChatId(chatId);

        const docRef = doc(db, "users", currentUser.uid, "chats", chatId);
        const snap = await getDoc(docRef);
        const data = snap.exists() ? snap.data() : null;

        const newChatObj = {
          chatId,
          createdAt: data?.createdAt?.toMillis?.() ?? Date.now(),
          messages: [{ role: "user", content: inputValue }],
          title: inputValue.slice(0, 30),
        };

        setProjectChatSessions((prev) => {
          const updated = { ...prev };
          const arr = updated.global || [];
          updated.global = [newChatObj, ...arr.filter(x => x.chatId !== chatId)];
          return updated;
        });
      }
    }

    // 2) добавляем сообщение строго по текущему контексту
    if (inTopic) {
      await addMessageToTopicChat(topicId, chatId, inputValue);
    } else {
      await addMessageToGlobalChat(chatId, inputValue);
    }

    setInputValue("");
    setIsActive(false);
  } catch (err) {
    console.error("[InputBar.handleSend] error:", {
      message: err?.message || String(err),
      topicId,
      chatId,
    });
  }
};

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    if (uploadedFiles.length + files.length > FILES_LIMIT) {
      setFileAlert(`You can upload up to ${FILES_LIMIT} files`);
      setTimeout(() => setFileAlert(""), 7000);
      return;
    }

    setUploadedFiles((prev) => [...prev, ...files]);
    e.target.value = ""; 
  };

  const removeFile = (filename) => {
    setUploadedFiles((prev) => prev.filter((f) => f.name !== filename));

    if (uploadedFiles.length <= FILES_LIMIT) setFileAlert("");
  };

  /* ───────── RENDER ───────── */
  return (
    <>
      {/* Input Bar Container */}
      <div
  className={`w-full bg-transparent transition-all ${
    isFullscreen
      ? "px-4 sm:px-6 mb-9" 
      : "px-1 sm:px-4 pb-1"
  }`}
>
        <div className="w-full md:max-w-[896px] mx-auto">
          <div
  className={`rounded-2xl p-1 md:p-2 flex flex-col transition duration-500
  border border-white/10 
  shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_6px_rgba(0,0,0,0.4)]
  backdrop-blur-sm
  ${isActive ? "border-blue-500 animate-glow" : ""}`}
>
            {/* INPUT ROW */}
            <div className="flex items-start w-full">
              <textarea
  ref={inputRef}
  rows={1}
  value={inputValue}
  onChange={(e) => {
    setInputValue(e.target.value);
    if (e.target.value.trim()) setIsActive(true);
  }}
  onFocus={() => setIsActive(true)}
  onBlur={() => {
    if (!inputValue.trim()) setIsActive(false);
  }}
  onKeyDown={handleKeyDown}
                className="flex-1 w-full resize-none bg-transparent outline-none text-base placeholder-gray-400 dark:placeholder-gray-500 min-h-[48px] max-h-[168px] overflow-y-auto custom-scroll py-3 px-4"
                placeholder="Ask anything in your language..."
                style={{ minWidth: 0 }}
              />
            </div>

            {/* ICON ROW */}
            <div className="flex items-center justify-between mt-1 w-full gap-1 px-0 md:px-1">
              <div className="flex items-center gap-1">
                {/* 📎 Attach File */}
                <Tooltip content="Add photos & files" position="bottom">
                  <label className="relative cursor-pointer p-1 md:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded min-w-[38px] min-h-[38px] md:min-w-[40px] md:min-h-[40px] flex items-center justify-center">
                    <img
                      src="/Attach_File.svg"
                      alt="Attach"
                      className="h-5 w-5 md:h-5 md:w-5"
                    />
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                </Tooltip>

                {/* 🤖 AI Model Selector */}
                <AIModelSelector />
              </div>

              {/* ⬆ Send Button */}
              <Tooltip content="Send" position="bottom">
                <button
                  onClick={handleSend}
                  className="p-1 md:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded min-w-[32px] min-h-[32px] md:min-w-[40px] md:min-h-[40px] flex items-center justify-center"
                  disabled={!inputValue.trim()}
                >
                  <img
                    src="/Arrow_Send.svg"
                    alt="Send"
                    className="h-5 w-5 md:h-5 md:w-5"
                  />
                </button>
              </Tooltip>
            </div>

            {/* Uploaded Files Preview */}
            {fileAlert && (
              <div className="mx-auto my-2 px-4 py-2 rounded-lg flex items-center gap-2 bg-red-600 text-white shadow font-medium w-fit min-w-[160px] max-w-full animate-fade-in">
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M12 8v4m0 4h.01"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="flex-1">{fileAlert}</span>
                <button
                  onClick={() => setFileAlert("")}
                  className="ml-2 flex items-center justify-center text-white hover:text-gray-200 transition"
                  tabIndex={0}
                  aria-label="Close alert"
                  type="button"
                  style={{ lineHeight: 1 }}
                >
                  ✕
                </button>
              </div>
            )}

            <FilePreview files={uploadedFiles} onRemove={removeFile} />
          </div>
        </div>
      </div>

      {/* Footer — скрываем на мобильных, только md и выше */}
      <div className="w-full px-1 sm:px-4 pb-2 max-w-full overflow-x-hidden hidden md:block">
        <div className="w-full max-w-full md:max-w-[896px] mx-auto text-center">
          <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 leading-tight px-1 break-words text-center">
            <span className="inline-block">Powered by advanced AI</span>{" "}
            <span className="inline-block">
              — enhanced with verified maritime sources such as IMO, SOLAS, and
              ISM.
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
