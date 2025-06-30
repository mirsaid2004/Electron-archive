import { createBrowserRouter, redirect } from "react-router";
import Home from "./pages/Home";
import Archive from "./pages/Archive";

export const routes = createBrowserRouter([
  {
    path: "/",
    Component: Home,
    loader: () => redirect("/archive"),
  },
  {
    path: "/archive",
    Component: Archive,
  },
]);
