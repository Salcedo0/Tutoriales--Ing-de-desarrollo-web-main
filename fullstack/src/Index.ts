import express from "express";
import path from "path";
import expressLayouts from "express-ejs-layouts";
import type { Application } from "express";
import Routes from "./routes/Routes.js";

class Index {
  static startServer(): void {
    const app: Application = express();
    const PORT = process.env.PORT || 3000;

    // Use EJS as the template engine and point it to the views folder.
    app.set("view engine", "ejs");
    app.set("views", path.join(process.cwd(), "src/views"));

    // Serve static assets (the compiled Tailwind stylesheet lives here).
    app.use(express.static("src/public"));

    // Wrap every view in a shared layout.
    app.use(expressLayouts);
    app.set("layout", "layouts/app");

    // Register the application routes.
    app.use(Routes.initializeRoutes());

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

Index.startServer();
