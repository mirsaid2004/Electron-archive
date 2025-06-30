import { appwriteRequests } from "@/api/apiClient";
import { sleep } from "@/helper/sleep";
import { ArchiveDocumentType } from "@/schema/archive";
import {
  createContext,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react";

type UploadDataReadContextType = {
  isLoading: boolean;
  progressPercent: number;
  logMessage: string;
  status: "normal" | "success" | "exception" | "active";
};

type UploadDataWriteContextType = {
  handleUpload: (rowData: ArchiveDocumentType[]) => void;
  reset: () => void;
};

const UploadDataReadContext = createContext<UploadDataReadContextType | null>(
  null
);

const UploadDataWriteContext = createContext<UploadDataWriteContextType | null>(
  null
);

export const UploadDataContext = {
  Read: UploadDataReadContext,
  Write: UploadDataWriteContext,
};

const UploadDataProvider = ({ children }: { children: ReactNode }) => {
  const [uploadDataRead, setUploadDataRead] =
    useState<UploadDataReadContextType>({
      isLoading: false,
      progressPercent: 0,
      logMessage: "",
      status: "normal",
    });

  const handleUpload = useCallback<UploadDataWriteContextType["handleUpload"]>(
    async (rowsData) => {
      try {
        setUploadDataRead((prev) => ({
          ...prev,
          isLoading: true,
          progressPercent: 0,
          logMessage: "Starting upload...",
          status: "active",
        }));

        // Process sequentially instead of concurrently
        for (let index = 0; index < rowsData.length; index++) {
          const rowData = rowsData[index];
          const result = await appwriteRequests.createDocument(rowData);

          if (!result.success) {
            throw new Error(`Failed to upload document: ${result.error}`);
          }

          setUploadDataRead((prev) => ({
            ...prev,
            progressPercent: Math.round(((index + 1) / rowsData.length) * 100),
            logMessage: `Uploading ${index + 1}/${rowsData.length}...`,
          }));

          // Add delay between requests (except for the last one)
          if (index < rowsData.length - 1) {
            await sleep(50);
          }
        }

        setUploadDataRead((prev) => ({
          ...prev,
          isLoading: false,
          logMessage: "Upload completed successfully!",
          status: "success",
        }));
      } catch (err) {
        const error = err as Error;
        console.error("Upload error:", error);
        setUploadDataRead((prev) => ({
          ...prev,
          isLoading: false,
          logMessage: error.toString(),
          status: "exception",
        }));
        return;
      }
    },
    []
  );

  const reset = useCallback<UploadDataWriteContextType["reset"]>(() => {
    setUploadDataRead({
      isLoading: false,
      progressPercent: 0,
      logMessage: "",
      status: "normal",
    });
  }, []);

  const uploadDataWrite = useMemo<UploadDataWriteContextType>(
    () => ({
      handleUpload,
      reset,
    }),
    [handleUpload, reset]
  );

  return (
    <UploadDataReadContext.Provider value={uploadDataRead}>
      <UploadDataWriteContext.Provider value={uploadDataWrite}>
        {children}
      </UploadDataWriteContext.Provider>
    </UploadDataReadContext.Provider>
  );
};

export default UploadDataProvider;
