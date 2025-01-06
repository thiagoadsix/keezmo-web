export function JourneySection() {
  return (
    <section
      id="journey"
      className="flex min-h-screen flex-col items-center justify-center bg-background px-4 md:px-8 py-8"
    >
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white text-center">
        Comece sua jornada de estudos agora
      </h2>
      <p className="mt-4 max-w-2xl text-center text-sm sm:text-base md:text-lg text-neutral-400 leading-relaxed">
        Organize seus materiais, crie flashcards em segundos e
        estude de forma estratégica com a ajuda da IA.
      </p>
      <div className="mt-8 w-full max-w-3xl">
        <img
          src="/dashboard.png"
          alt="Dashboard Keezmo"
          className="rounded-lg shadow-lg w-full h-auto"
        />
      </div>
    </section>
  );
}
