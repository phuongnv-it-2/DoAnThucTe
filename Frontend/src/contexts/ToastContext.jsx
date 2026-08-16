import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const STYLES = {
  success: {
    box: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: CheckCircle2,
    iconColor: "text-emerald-500",
  },
  error: {
    box: "border-red-200 bg-red-50 text-red-800",
    icon: XCircle,
    iconColor: "text-red-500",
  },
  info: {
    box: "border-blue-200 bg-blue-50 text-blue-800",
    icon: Info,
    iconColor: "text-blue-500",
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, type = "info") => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => remove(id), 3500);
    },
    [remove]
  );

  const toast = {
    success: (msg) => push(msg, "success"),
    error: (msg) => push(msg, "error"),
    info: (msg) => push(msg, "info"),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => {
          const style = STYLES[t.type];
          const Icon = style.icon;
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-2.5 rounded-lg border px-4 py-3 text-sm shadow-lg ${style.box}`}
            >
              <Icon
                size={18}
                className={`mt-0.5 shrink-0 ${style.iconColor}`}
              />
              <p className="flex-1">{t.message}</p>
              <button
                onClick={() => remove(t.id)}
                className="shrink-0 text-current opacity-60 hover:opacity-100"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
