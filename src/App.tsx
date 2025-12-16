import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import AppRouter from "./router/AppRouter";
import ChatbotWidget from "./pages/Chatbot";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRouter />
        <ChatbotWidget />
      </AuthProvider>
    </ThemeProvider>
  );
}
