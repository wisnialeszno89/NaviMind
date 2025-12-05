import ChatWindow from "@/app/chat/components/ChatWindow";

export default function Page({ params }: { params: { threadId: string } }) {
  return (
    <div className="h-full">
      <ChatWindow
        threadId={params.threadId}
        onRefresh={() => {}}
        mode="normal"
      />
    </div>
  );
}