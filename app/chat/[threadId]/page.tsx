import ChatWindow from "@/app/chat/components/ChatWindow";

export default async function Page({ params }: { params: { threadId: string } }) {
  // Next.js 15: params może być asynchroniczne, więc owijamy je w Promise.resolve
  const { threadId } = await Promise.resolve(params);

  return (
    <div className="h-full">
      <ChatWindow
        threadId={threadId}
        onRefresh={() => {}}
        mode="normal"
      />
    </div>
  );
}