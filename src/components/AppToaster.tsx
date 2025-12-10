import { Toaster } from "react-hot-toast";
import { CheckCircle, XCircle } from "lucide-react"; // icon đẹp
import { useEffect, useState } from "react";

export default function AppToaster() {
  const [darkMode, setDarkMode] = useState(false);

  // Nếu bạn có context/theme, có thể bind darkMode từ đó
  useEffect(() => {
    const html = document.documentElement;
    setDarkMode(html.classList.contains("dark"));
  }, []);

  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      toastOptions={{
        duration: 3000, // 3 giây
        style: {
          borderRadius: '10px',
          padding: '12px 16px',
          color: darkMode ? '#d1fae5' : '#166534',
          background: darkMode ? '#065f46' : '#dcfce7',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          fontWeight: 500,
        },
        success: {
          icon: <CheckCircle className="w-5 h-5" />,
        },
        error: {
          icon: <XCircle className="w-5 h-5" />,
          style: {
            background: darkMode ? '#7f1d1d' : '#fee2e2',
            color: darkMode ? '#fca5a5' : '#991b1b',
          },
        },
      }}
    />
  );
}
