"use client";

type Props = {
  visible: boolean;
  onDismiss: () => void;
};

export default function OnboardingBanner({ visible, onDismiss }: Props) {
  if (!visible) return null;

  return (
    <div className="m-4 p-4 rounded-lg bg-neutral-800 border border-neutral-700 text-sm">
      <div className="font-semibold mb-2">Witaj w NaviMind — wersja testowa</div>

      <ul className="list-disc ml-5 text-neutral-300 space-y-1">
        <li>Czat działa w czasie rzeczywistym i może zawierać błędy.</li>
        <li>To wczesna wersja aplikacji. Funkcje mogą ulegać zmianie.</li>
        <li>Twoje wiadomości są zapisywane lokalnie w przeglądarce.</li>
      </ul>

      <div className="mt-3 text-neutral-400 text-xs">
        Korzystając z aplikacji zgadzasz się, że nie jest to narzędzie medyczne,
        finansowe ani prawne. Wersja testowa nie powinna być używana do podejmowania
        decyzji o wysokim ryzyku.
      </div>

      <button
        onClick={onDismiss}
        className="mt-3 px-3 py-1 bg-neutral-700 hover:bg-neutral-600 rounded text-xs"
      >
        Rozumiem
      </button>
    </div>
  );
}