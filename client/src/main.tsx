import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set the document title
document.title = "Sistema de Gestão";

// Add meta description if not already present
const metaDescription = document.createElement("meta");
metaDescription.name = "description";
metaDescription.content = "Sistema de Gestão para gerenciamento de clientes";
document.head.appendChild(metaDescription);

createRoot(document.getElementById("root")!).render(<App />);
