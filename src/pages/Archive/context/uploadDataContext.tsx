import { appwriteRequests } from "@/api/apiClient";
import { sleep } from "@/helper/sleep";
import {
  ArchiveDocumentsCollectionType,
  ArchiveDocumentType,
} from "@/schema/archive";
import { DataUploadTypeEnum } from "@/schema/data-upload.enums";
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
  handleUpload: (
    rowData: ArchiveDocumentType[],
    uploadOption: DataUploadTypeEnum
  ) => void;
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

  const documentsUploadStream = async (
    rowsData: ArchiveDocumentType[],
    progressPoint = 0,
    uploadLimit = rowsData.length
  ) => {
    // Process sequentially instead of concurrently
    for (let index = 0; index < rowsData.length; index++) {
      const rowData = rowsData[index];
      const result = await appwriteRequests.createDocument(rowData);

      if (!result.success) {
        throw new Error(`Failed to upload document: ${result.error}`);
      }

      setUploadDataRead((prev) => ({
        ...prev,
        progressPercent: Math.round(
          ((index + progressPoint + 1) / uploadLimit) * 100
        ),
        logMessage: `Uploading ${index + 1}/${rowsData.length}...`,
      }));

      // Add delay between requests (except for the last one)
      if (index < rowsData.length - 1) {
        await sleep(10);
      }
    }
  };

  const documentsDeleteStream = async (
    rowsData: ArchiveDocumentsCollectionType["data"],
    progressPoint = 0,
    uploadLimit = rowsData.length
  ) => {
    for (let index = 0; index < rowsData.length; index++) {
      const rowData = rowsData[index];
      const deleteRequest = await appwriteRequests.deleteDocument(rowData.$id);

      if (!deleteRequest.success) {
        throw new Error(`Failed to delete document: ${deleteRequest.error}`);
      }

      setUploadDataRead((prev) => ({
        ...prev,
        progressPercent: Math.round(
          ((index + progressPoint + 1) / uploadLimit) * 100
        ),
        logMessage: `Deleting ${index + 1}/${rowsData.length}...`,
      }));

      // Add delay between requests (except for the last one)
      if (index < rowsData.length - 1) {
        await sleep(10);
      }
    }
  };

  const uploadDocuments = useCallback(
    async (rowsData: ArchiveDocumentType[]) => {
      setUploadDataRead((prev) => ({
        ...prev,
        isLoading: true,
        progressPercent: 0,
        logMessage: "Starting upload...",
        status: "active",
      }));

      await documentsUploadStream(rowsData);

      setUploadDataRead((prev) => ({
        ...prev,
        isLoading: false,
        logMessage: "Upload completed successfully!",
        status: "success",
      }));
    },
    []
  );

  const clearAndUploadDocuments = useCallback(
    async (rowsData: ArchiveDocumentType[]) => {
      setUploadDataRead((prev) => ({
        ...prev,
        isLoading: true,
        progressPercent: 0,
        logMessage: "Starting upload...",
        status: "active",
      }));

      const allDocuments = await appwriteRequests.getDocuments();

      if (!allDocuments.success)
        throw new Error(`Failed to fetch documents: ${allDocuments.error}`);

      const uploadLimit = allDocuments.total + rowsData.length;

      await documentsDeleteStream(allDocuments.data, 0, uploadLimit);

      await documentsUploadStream(rowsData, allDocuments.total, uploadLimit);

      setUploadDataRead((prev) => ({
        ...prev,
        isLoading: false,
        logMessage: "Upload completed successfully!",
        status: "success",
      }));
    },
    []
  );

  const handleUpload = useCallback<UploadDataWriteContextType["handleUpload"]>(
    async (rowsData, uploadOption) => {
      try {
        switch (uploadOption) {
          case DataUploadTypeEnum.ADD_EXCEL_FILE:
            uploadDocuments(rowsData);
            break;
          case DataUploadTypeEnum.CLEAR_AND_ADD_EXCEL_FILE:
            clearAndUploadDocuments(rowsData);
            break;
          default:
            throw Error("Upload option not provided");
        }
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
