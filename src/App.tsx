import { RouterProvider } from "react-router";
import { routes } from "./routes";
import Sidebar from "./components/Sidebar";
import {
  ClientSideRowModelModule,
  LocaleModule,
  ModuleRegistry,
  RowSelectionModule,
  TextEditorModule,
  ValidationModule,
} from "ag-grid-community";

ModuleRegistry.registerModules([
  RowSelectionModule,
  ClientSideRowModelModule,
  LocaleModule,
  TextEditorModule,
  ...(process.env.NODE_ENV !== "production" ? [ValidationModule] : []),
]);

function App() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <RouterProvider router={routes} />
    </div>
  );
}

export default App;
