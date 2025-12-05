import ChatWindow from "@/app/chat/components/ChatWindow";

type Props = {
  params: {
    threadId: string;
  };
};

export default function Page({ params }: Props) {
  return (
    <div className="h-full">
      <ChatWindow
        threadId={params.threadId}
        mode="default"
        onRefresh={() => {}}
      />
    </div>
  );
}