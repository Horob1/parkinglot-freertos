import { ThemeProvider } from "./components/ThemeProvider";
import AppRouter from "./routes";
import { Toaster } from "react-hot-toast";
import "./App.css";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Toaster position="bottom-right" />
      <AppRouter />
    </ThemeProvider>
  );
}

export default App;
