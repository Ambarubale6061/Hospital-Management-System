import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@/api";
import App from "./App";
import "./index.css";

setBaseUrl(import.meta.env.VITE_API_URL || null);

createRoot(document.getElementById("root")!).render(<App />);