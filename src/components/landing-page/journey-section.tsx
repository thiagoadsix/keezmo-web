export function JourneySection() {
  return (
    <section id="journey" className="flex min-h-screen flex-col items-center justify-center bg-background">
      <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Sua Jornada Começa Aqui
      </h2>
      <p className="mt-4 max-w-2xl text-center text-neutral-400">
        Saia do caos dos materiais desorganizados e entre no universo do
        aprendizado estratégico.
      </p>
      <div className="mt-8">
        <img
          src="/screenshots/dashboard.png"
          alt="Dashboard Keezmo"
          className="rounded-lg shadow-lg"
        />
      </div>
    </section>
  );
}
