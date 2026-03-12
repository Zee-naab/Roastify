import { useState } from "react";

import { useNavigate } from "react-router-dom";
import { LogOut, PanelLeftClose, PanelLeft } from "lucide-react";
import CelebrityGrid, { CELEBRITIES } from "../components/CelebrityGrid";
import ModeSelector from "../components/ModeSelector";
import ChatWindow from "../components/ChatWindow";

export default function ChatPage() {
  const navigate = useNavigate();
  const [persona, setPersona] = useState("gordon ramsay");
  const [mode, setMode] = useState("savage");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const selectedCeleb = CELEBRITIES.find((c) => c.id === persona);

  function handleLogout() {
    localStorage.removeItem("jwt");
    localStorage.removeItem("user_email");
    navigate("/");
  }

  return (
    <div className="h-screen flex flex-col bg-bg overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 glass border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-display font-black text-xl tracking-tight text-heat-gradient">
            Roastify
          </span>
          {selectedCeleb && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl glass text-sm text-white/70 border border-white/5">
              <span>{selectedCeleb.emoji}</span>
              <span className="capitalize font-medium text-white/90">
                {selectedCeleb.name}
              </span>
              <span className="text-white/20">·</span>
              <span className="capitalize text-heat text-xs font-semibold">
                {mode}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSidebarOpen((o) => !o)}
            className="btn-ghost p-2 rounded-xl text-white/60 hover:text-white"
            title={sidebarOpen ? "Hide panel" : "Show panel"}
          >
            {sidebarOpen ? (
              <PanelLeftClose size={18} />
            ) : (
              <PanelLeft size={18} />
            )}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="btn-ghost p-2 rounded-xl text-white/60 hover:text-red-400"
            title="Log out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-64 sm:w-72 flex-shrink-0 border-r border-white/5 overflow-y-auto p-4 flex flex-col gap-6 bg-surface/50">
            <section>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-3">
                Celebrity
              </p>
              <CelebrityGrid selected={persona} onSelect={setPersona} />
            </section>
            <section>
              <ModeSelector selected={mode} onSelect={setMode} />
            </section>
          </aside>
        )}

        {/* Chat */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <ChatWindow persona={persona} mode={mode} />
        </main>
      </div>
    </div>
  );
}
