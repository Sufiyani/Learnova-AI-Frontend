import { Loader2 } from "lucide-react";

export default function Spinner({ size = 24, className = "" }: { size?: number; className?: string }) {
  return <Loader2 className={`animate-spin text-brand-500 ${className}`} size={size} />;
}

export function FullPageSpinner() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Spinner size={40} />
    </div>
  );
}
