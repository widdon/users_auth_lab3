export default function LoginLoading() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 py-6">
      <div className="skeleton h-12 w-48" />
      <div className="skeleton h-72 w-full" />
    </div>
  );
}
