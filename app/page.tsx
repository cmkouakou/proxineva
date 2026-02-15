export default function HomePage() {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">Proxineva</h1>
      <p className="mt-2 text-gray-600">
        Bienvenue. Pour envoyer une demande, va sur{" "}
        <a className="underline" href="/demande">
          /demande
        </a>
        .
      </p>
    </main>
  );
}
