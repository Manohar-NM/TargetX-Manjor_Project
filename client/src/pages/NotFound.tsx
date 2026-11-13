import { useLocation } from "wouter";
import { WarningCircle, House } from "@phosphor-icons/react";

export default function NotFound() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center circuit-bg p-6">
      <div className="tx-card w-full max-w-md p-8 md:p-10 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-900">
            <WarningCircle size={28} weight="regular" className="text-zinc-700" />
          </div>
        </div>

        <span className="font-mono text-3xl font-semibold text-zinc-950 tracking-tight block mb-2">
          404
        </span>

        <h1 className="text-lg font-semibold text-zinc-950 mb-2 font-sans">
          Page Not Found
        </h1>

        <p className="text-zinc-600 mb-8 text-sm font-sans leading-relaxed">
          The requested page could not be located. It may have been moved or the URL might be incorrect.
        </p>

        <div className="flex justify-center">
          <button
            onClick={handleGoHome}
            className="tx-btn-primary px-6 h-11 text-sm font-medium inline-flex items-center gap-2 shadow-sm"
          >
            <House size={16} weight="regular" />
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}
