export function EmptyState({ message, height = 240 }: { message: string; height?: number }) {
  return (
    <div
      className="flex items-center justify-center text-center text-sm text-muted-foreground px-6"
      style={{ minHeight: height }}
    >
      <p>{message}</p>
    </div>
  );
}
