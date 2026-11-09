export function FormError({ error }: { error?: string | string[] }) {
  if (!error || (Array.isArray(error) && error.length === 0)) return null;
  const list = Array.isArray(error) ? error : [error];
  return (
    <ul className="space-y-1 rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">
      {list.map((e) => <li key={e}>{e}</li>)}
    </ul>
  );
}
