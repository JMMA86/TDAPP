export default function AgendaContainer({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-blue-50 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {children}
      </div>
    </main>
  );
}
