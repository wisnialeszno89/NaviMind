"use client";

import { useEffect, useState } from "react";

const MODES = [
  { id: "normal", label: "Normal" },
  { id: "deep", label: "Deep" },
  { id: "system", label: "System" },
];

type Props = {
  mode: string;
  onChange: (m: string) => void;
};

export default function ModeSelector({ mode, onChange }: Props) {
  const [value, setValue] = useState(mode);

  useEffect(() => {
    setValue(mode);
  }, [mode]);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newMode = e.target.value;

    setValue(newMode);
    onChange(newMode);

    try {
      localStorage.setItem("nm_mode", newMode);
    } catch {}
  }

  return (
    <select
      className="bg-neutral-800 border border-neutral-700 text-sm px-2 py-1 rounded text-white"
      value={value}
      onChange={handleChange}
    >
      {MODES.map((m) => (
        <option key={m.id} value={m.id}>
          {m.label}
        </option>
      ))}
    </select>
  );
}