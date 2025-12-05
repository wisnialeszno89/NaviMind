export const userMemory = {
  load() {
    try {
      return JSON.parse(localStorage.getItem("nm_user_memory") || "{}");
    } catch {
      return {};
    }
  },

  save(data: Record<string, any>) {
    localStorage.setItem("nm_user_memory", JSON.stringify(data));
  },

  remember(key: string, value: any) {
    const mem = this.load();
    mem[key] = value;
    this.save(mem);
  },

  get(key: string) {
    const mem = this.load();
    return mem[key];
  },
};