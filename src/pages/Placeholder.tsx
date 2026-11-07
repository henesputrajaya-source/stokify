export default function Placeholder({ title }: { title: string }) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{title}</h1>
      <p className="mt-3 text-sm text-slate-500">Halaman ini akan segera dibuat.</p>
    </div>
  );
}
