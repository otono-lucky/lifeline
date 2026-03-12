import React, { useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";

export const ActionMenu = ({ items = [] }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!menuRef.current || menuRef.current.contains(event.target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!items.length) return null;

  return (
    <div className="relative inline-flex" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="p-2 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50"
        aria-label="Open actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute left-0 z-20 mt-7 w-48 rounded-lg border border-gray-200 bg-white shadow-lg popover-content">
          <div className="flex flex-col py-1">
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setOpen(false);
                  item.onClick?.();
                }}
                disabled={item.disabled}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                  item.variant === "danger"
                    ? "text-red-600"
                    : "text-gray-700"
                } ${item.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
