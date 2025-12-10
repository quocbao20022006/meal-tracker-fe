import * as React from "react";
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from "@/components/ui/toast";
import { X } from "lucide-react";

export default function AddMealSuccessToast() {
  const [showSuccess, setShowSuccess] = React.useState(false);

  const handleAddMeal = async () => {
    // gọi API thêm meal
    const res = await fetch("/api/meal/add", { method: "POST" });
    if (res.ok) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000); // 3s tự ẩn
    }
  };

  return (
    <ToastProvider>
      <button onClick={handleAddMeal}>Add Meal</button>

      {showSuccess && (
        <Toast className="fixed top-4 right-4 w-80">
          <ToastTitle>✔ Success</ToastTitle>
          <ToastDescription>Meal added successfully!</ToastDescription>
          <ToastClose>
            <X className="w-4 h-4" />
          </ToastClose>
        </Toast>
      )}

      <ToastViewport />
    </ToastProvider>
  );
}
