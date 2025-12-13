import { ReactNode } from "react";

interface InfoTagProps {
  icon: ReactNode; 
  value: string;   
}

export default function InfoTag({ icon, value }: InfoTagProps) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 capitalize text-sm font-semibold">
      {icon && (
        <span className="flex items-center justify-center w-4 h-4 shrink-0">
          {icon}
        </span>
      )}
      {value}
    </span>
  );
}
