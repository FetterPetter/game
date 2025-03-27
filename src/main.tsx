import React from "react";
import { createRoot } from "react-dom/client";
import { Application } from "./modules/app/application";
import "./index.css";
createRoot(document.getElementById("root")!).render(<Application />);
