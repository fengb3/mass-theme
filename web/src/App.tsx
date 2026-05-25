export default function App() {
  return (
    <div className="h-screen w-screen flex flex-col bg-neutral-900 text-white">
      <header className="h-12 border-b border-neutral-700 flex items-center px-4 shrink-0">
        <h1 className="text-sm font-bold">MWKEYS Theme Editor</h1>
      </header>
      <main className="flex flex-1 overflow-hidden">
        <aside className="w-52 border-r border-neutral-700 p-2 shrink-0">
          Sidebar
        </aside>
        <section className="flex-1 flex items-center justify-center bg-neutral-950">
          Preview
        </section>
        <aside className="w-80 border-l border-neutral-700 p-2 shrink-0">
          Property Panel
        </aside>
      </main>
    </div>
  )
}
