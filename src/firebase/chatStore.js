
import { db, auth } from "@/firebase/config";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  doc,
  deleteDoc,
  updateDoc,
  setDoc
} from "firebase/firestore";

// ─────────── CHAT (GLOBAL) ───────────

export async function createUserChat() {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const chatData = {
  title: "",
  createdAt: serverTimestamp(),
  ownerId: user.uid,
};

  const ref = collection(db, "users", user.uid, "chats");
  const docRef = await addDoc(ref, chatData);

  return {
    chatId: docRef.id,
    ...chatData,
  };
}

export async function addMessageToChat(chatId, messageContent) {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const uid = user.uid;
  const chatRef = doc(db, "users", uid, "chats", chatId);
  const messagesRef = collection(db, "users", uid, "chats", chatId, "messages");

  // ✅ гарантируем существование документа чата (если его ещё нет, создастся)
  await setDoc(
  chatRef,
  { ownerId: uid, createdAt: serverTimestamp() },
  { merge: true }
);

  const message = {
    role: "user",
    content: messageContent,
    timestamp: serverTimestamp(),
  };

  await addDoc(messagesRef, message);

  // если это первое сообщение — формируем заголовок
  const snapshot = await getDocs(messagesRef);
  if (snapshot.size === 1) {
    const titleWords = messageContent.trim().split(/\s+/).slice(0, 8).join(" ");
    const title = titleWords.charAt(0).toUpperCase() + titleWords.slice(1);
    await updateDoc(chatRef, { title });
  }
}

export async function loadUserChats(uid) {
  const chatRef = collection(db, "users", uid, "chats");
  const snap = await getDocs(chatRef);
  return snap.docs.map(doc => ({ chatId: doc.id, ...doc.data() }));
}

export function subscribeToUserChats(uid, callback) {
  const ref = collection(db, "users", uid, "chats");
  const q = query(ref, orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const chats = snapshot.docs.map(doc => ({ chatId: doc.id, ...doc.data() }));
    callback(chats);
  });
}

export function subscribeToMessages(uid, chatId, callback) {
  const ref = collection(db, "users", uid, "chats", chatId, "messages");
  const q = query(ref, orderBy("timestamp", "asc"));
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(messages);
  });
}

export async function deleteChatFromFirestore(uid, chatId) {
  try {
    const chatRef = doc(db, "users", uid, "chats", chatId);
    const messagesRef = collection(chatRef, "messages");
    const snapshot = await getDocs(messagesRef);
    const deletions = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletions);
    await deleteDoc(chatRef);
    console.log("✅ Chat and messages deleted from Firestore");
  } catch (error) {
    console.error("❌ Error deleting chat from Firestore:", error);
  }
}

export async function renameChatInFirestore(uid, chatId, newTitle) {
  try {
    const chatRef = doc(db, "users", uid, "chats", chatId);
    await updateDoc(chatRef, { title: newTitle });
    console.log("✏️ Chat renamed in Firestore");
  } catch (error) {
    console.error("❌ Failed to rename chat:", error);
  }
}

export async function getChatMessages(uid, chatId) {
  const ref = collection(db, "users", uid, "chats", chatId, "messages");
  const snap = await getDocs(ref);
  return snap.docs.map((doc) => doc.data());
}


// ─────────── TOPICS ───────────

export async function createUserTopic(topicName) {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const topicData = {
    name: topicName,               
    title: topicName,              
    createdAt: serverTimestamp(),
    ownerId: user.uid,
  };

  const ref = collection(db, "users", user.uid, "topics");
  const docRef = await addDoc(ref, topicData);

  return {
    topicId: docRef.id,
    ...topicData,
  };
}

export async function loadUserTopics(uid) {
  const ref = collection(db, "users", uid, "topics");
  const snap = await getDocs(ref);
  return snap.docs.map(doc => ({ topicId: doc.id, ...doc.data() }));
}

export function subscribeToUserTopics(uid, callback) {
  const ref = collection(db, "users", uid, "topics");
  const q = query(ref, orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const topics = snapshot.docs.map(doc => ({ topicId: doc.id, ...doc.data() }));
    callback(topics);
  });
}

export async function deleteTopicFromFirestore(uid, topicId) {
  try {
    const topicRef = doc(db, "users", uid, "topics", topicId);
    await deleteDoc(topicRef);
    console.log("🗑️ Topic deleted from Firestore");
  } catch (error) {
    console.error("❌ Failed to delete topic:", error);
  }
}
 // ─────────── TOPIC CHATS (вложенные чаты внутри topic) ───────────

export async function createChatForTopic({ uid, topicId, messageText }) {
  const user = auth.currentUser;
  const _uid = uid || user?.uid;
  if (!_uid) throw new Error("User not authenticated");
  if (!topicId) throw new Error("Topic ID is required");

  // Создаём пустой чат внутри топика
  const chatData = {
    title: "New Chat",
    createdAt: serverTimestamp(),
    ownerId: _uid,
    topicId,
  };

  const ref = collection(db, "users", _uid, "topics", topicId, "chats");
  const docRef = await addDoc(ref, chatData);

  return {
    chatId: docRef.id,
    ...chatData,
  };
}

export async function addMessageToTopicChat(topicId, chatId, messageContent) {
  const user = auth.currentUser;
  const uid = user?.uid;
  if (!uid) throw new Error("User not authenticated");
  if (!topicId || !chatId) throw new Error("TopicId and chatId are required");

  const chatRef = doc(db, "users", uid, "topics", topicId, "chats", chatId);
  const messagesRef = collection(
    db,
    "users",
    uid,
    "topics",
    topicId,
    "chats",
    chatId,
    "messages"
  );

  // ✅ гарантируем, что документ чата существует (создастся при отсутствии)
  await setDoc(
    chatRef,
    { ownerId: uid, topicId, createdAt: serverTimestamp(), title: "New Chat" },
    { merge: true }
  );

  const message = {
    role: "user",
    content: messageContent,
    timestamp: serverTimestamp(),
  };

  await addDoc(messagesRef, message);

  // Если это первое сообщение — формируем заголовок из него
  const snapshot = await getDocs(messagesRef);
  if (snapshot.size === 1) {
    const titleWords = messageContent.trim().split(/\s+/).slice(0, 8).join(" ");
    const title = titleWords.charAt(0).toUpperCase() + titleWords.slice(1);
    await updateDoc(chatRef, { title });
  }
}

// ✅ Алиасы, чтобы импорт в InputBar был единым стилем
export const createChatGlobal = createUserChat;
export const addMessageToGlobalChat = addMessageToChat;
