export type Thread = {
  id: string;
  title: string;
  mode: string; // ← DODANE
};

type Listener = () => void;

class ThreadStore {
  list: Thread[] = [];
  listeners: Listener[] = [];

  subscribe(fn: Listener) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  notify() {
    this.listeners.forEach((l) => l());
  }

  init() {
    const raw = localStorage.getItem("nm_threads");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);

        // Jeśli stare rozmowy nie mają pola mode → dodajemy je
        this.list = parsed.map((t: any) => ({
          id: t.id,
          title: t.title,
          mode: t.mode || "default",
        }));
      } catch {
        this.list = [];
      }
    }
  }

  save() {
    localStorage.setItem("nm_threads", JSON.stringify(this.list));
    this.notify();
  }

  createThread() {
    const id = crypto.randomUUID();

    const t: Thread = {
      id,
      title: "Nowa rozmowa",
      mode: "default", // ← każda nowa rozmowa w trybie DEFAULT
    };

    this.list.unshift(t);
    this.save();
    return t;
  }

  renameThread(id: string, title: string) {
    const t = this.list.find((x) => x.id === id);
    if (!t) return;

    t.title = title;
    this.save();
  }

  // 🔥 NOWA FUNKCJA: zmiana trybu AI
  setMode(id: string, mode: string) {
    const t = this.list.find((x) => x.id === id);
    if (!t) return;

    t.mode = mode;
    this.save();
  }
}

export const threadStore = new ThreadStore();
