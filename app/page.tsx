import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <h1 className="text-3xl font-semibold tracking-tight">UrbanDelivery</h1>
      <p className="text-muted text-lg">
        Sistema de gestão de entregas urbanas
      </p>
      <Link
        href="/customers"
        className="mt-4 inline-flex h-10 items-center rounded-md bg-primary px-6 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
      >
        Gerir Clientes
      </Link>
    </div>
  );
}
