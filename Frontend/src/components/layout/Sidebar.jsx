import { NavLink } from "react-router-dom";
import { Store, X } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { NAV_BY_ROLE } from "../../constants/navigation";
import { ROLE_LABELS } from "../../constants/roles";

export default function Sidebar({ open, onClose }) {
  const { role } = useAuth();
  const items = NAV_BY_ROLE[role] || [];

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-slate-900 text-slate-100 transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between gap-2 border-b border-slate-800 px-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500">
              <Store size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold leading-none tracking-wide">
                SH MART
              </p>
              <p className="text-[11px] text-slate-400">
                {ROLE_LABELS[role] || ""}
              </p>
            </div>
          </div>
          <button
            className="text-slate-400 hover:text-white lg:hidden"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {items.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-800 px-5 py-4 text-[11px] text-slate-500">
          SH MART © {new Date().getFullYear()}
        </div>
      </aside>
    </>
  );
}
