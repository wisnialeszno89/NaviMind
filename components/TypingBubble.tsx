export default function TypingBubble() {
  return (
    <div className="flex gap-1 items-center bg-[#222] text-gray-400 px-4 py-2 rounded-xl w-fit">
      <span className="animate-bounce">●</span>
      <span className="animate-bounce delay-150">●</span>
      <span className="animate-bounce delay-300">●</span>
    </div>
  );
}