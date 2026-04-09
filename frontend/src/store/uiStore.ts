import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type Theme = "dark" | "light";

interface UIState {
  sidebarOpen:      boolean;
  sidebarCollapsed: boolean;
  theme:            Theme;

  toggleSidebar:   () => void;
  setSidebarOpen:  (open: boolean) => void;
  toggleCollapsed: () => void;
  setTheme:        (theme: Theme) => void;
  toggleTheme:     () => void;
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
    root.classList.remove("light");
  } else {
    root.classList.add("light");
    root.classList.remove("dark");
  }
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      sidebarOpen:      true,
      sidebarCollapsed: false,
      theme:            "dark" as Theme,

      toggleSidebar:   () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen:  (open) => set({ sidebarOpen: open }),
      toggleCollapsed: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },

      toggleTheme: () => {
        const next = get().theme === "dark" ? "light" : "dark";
        applyTheme(next);
        set({ theme: next });
      },
    }),
    {
      name: "unilease_ui",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ theme: s.theme, sidebarCollapsed: s.sidebarCollapsed }),
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme);
      },
    }
  )
);
