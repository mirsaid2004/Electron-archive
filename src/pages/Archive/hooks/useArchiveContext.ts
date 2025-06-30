import { useContext } from "react";
import { ArchiveContext } from "../context/archiveContext";

export const useArchiveContext = () => {
  const context = useContext(ArchiveContext);
  if (!context) {
    throw new Error("useArchiveContext must be used within an ArchiveProvider");
  }
  return context;
};
