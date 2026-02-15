import RequestForm from "@/components/RequestForm";

export default function DemandePage() {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">Décrire mon besoin</h1>
      <p className="mt-2 text-sm text-gray-600">
        Remplis ce formulaire. On te répond rapidement avec la meilleure option
        (en ligne ou à domicile).
      </p>

      <div className="mt-6 rounded-xl border p-5">
        <RequestForm />
      </div>
    </main>
  );
}
