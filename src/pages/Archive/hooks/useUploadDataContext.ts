import { useContext } from "react";
import { UploadDataContext } from "../context/uploadDataContext";

export const useUploadDataReadContext = () => {
  const context = useContext(UploadDataContext.Read);
  if (!context) {
    throw new Error(
      "useUploadDataReadContext must be used within an UploadDataProvider"
    );
  }
  return context;
};

export const useUploadDataWriteContext = () => {
  const context = useContext(UploadDataContext.Write);
  if (!context) {
    throw new Error(
      "useUploadDataWriteContext must be used within an UploadDataProvider"
    );
  }
  return context;
};
