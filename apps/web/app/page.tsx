import Link from "next/link";

const points = [
  {
    title: "Brand-neutral",
    body: "We don't sell supplements. Products are ranked on third-party testing, value per gram and fit for you.",
  },
  {
    title: "Safety first",
    body: "Kidney, liver, pregnancy and medication checks run before any recommendation — and we tell you when to see a doctor.",
  },
  {
    title: "Made for Southeast Asia",
    body: "Local prices in MYR, SGD, IDR, THB, PHP and VND, plus halal-certified filtering.",
  },
  {
    title: "Transparent",
    body: "Every suggestion shows the reasons, the dose and the research behind it.",
  },
];

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
          The right protein & creatine <span className="text-brand-600">for you</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-slate-600 sm:text-lg">
          Answer a few questions about your goals, diet and health — optionally add numbers from your medical report —
          and get an evidence-based plan in under 3 minutes.
        </p>
        <Link href="/check" className="btn-primary mt-8 px-8 py-3 text-base">
          Get my recommendation
        </Link>
        <p className="mt-3 text-xs text-slate-500">Free · No account needed · Your answers aren&apos;t stored</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {points.map((p) => (
          <div key={p.title} className="card">
            <h2 className="font-semibold text-brand-700">{p.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{p.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
