import { ArchiveDocumentType } from "@/schema/archive";
import { createContext, ReactNode, useCallback, useState } from "react";

type ArchiveContextType = {
  // NOTE: modal data
  // NOTE: create modal data
  isOpenCreateModal: boolean;
  updateModalData?: { $id: string } & ArchiveDocumentType;
  openCreateModal: (
    isOpen: boolean,
    data?: { $id: string } & ArchiveDocumentType
  ) => void;
  // NOTE: queries data
  isOpenFilterModal: boolean;
  filterModalData: Omit<ArchiveDocumentType, "docApplicationNumber">;
  openFilterModal: (
    isOpen: boolean,
    data?: ArchiveContextType["filterModalData"]
  ) => void;
  docApplicationNumber: string;
  setDocApplicationNumber: (applicationNumber: string) => void;
  // NOTE: delete bar
  isOpenDeleteBar: boolean;
  selectedDocuments: string[];
  setSelectedDocuments: (selecteds: string[]) => void;
};

type ArchiveStateType = Omit<
  ArchiveContextType,
  | "openCreateModal"
  | "openFilterModal"
  | "setDocApplicationNumber"
  | "setSelectedDocuments"
>;

export const ArchiveContext = createContext<ArchiveContextType | null>(null);

const defaultArchiveState: ArchiveStateType = {
  isOpenCreateModal: false,
  updateModalData: undefined,
  isOpenFilterModal: false,
  filterModalData: {
    docSerialNumber: "",
    docLocker: "",
    docShelf: "",
    docCollection: "",
  },
  docApplicationNumber: "",
  isOpenDeleteBar: false,
  selectedDocuments: [],
};

export const ArchiveProvider = ({ children }: { children: ReactNode }) => {
  const [archiveState, setArchiveState] =
    useState<ArchiveStateType>(defaultArchiveState);

  const openCreateModal = useCallback<ArchiveContextType["openCreateModal"]>(
    (isOpen, data) => {
      setArchiveState((prev) => ({
        ...prev,
        isOpenCreateModal: isOpen,
        updateModalData: data,
      }));
    },
    []
  );

  const openFilterModal = useCallback<ArchiveContextType["openFilterModal"]>(
    (isOpen, data) => {
      setArchiveState((prev) => ({
        ...prev,
        isOpenFilterModal: isOpen,
        filterModalData: data || prev.filterModalData,
      }));
    },
    []
  );

  const setDocApplicationNumber = useCallback<
    ArchiveContextType["setDocApplicationNumber"]
  >((docApplicationNumber) => {
    setArchiveState((prev) => ({
      ...prev,
      docApplicationNumber,
    }));
  }, []);

  const setSelectedDocuments = useCallback<
    ArchiveContextType["setSelectedDocuments"]
  >((selecteds) => {
    setArchiveState((prev) => ({
      ...prev,
      isOpenDeleteBar: !!selecteds.length,
      selectedDocuments: selecteds,
    }));
  }, []);

  return (
    <ArchiveContext.Provider
      value={{
        ...archiveState,
        openCreateModal,
        openFilterModal,
        setDocApplicationNumber,
        setSelectedDocuments,
      }}
    >
      {children}
    </ArchiveContext.Provider>
  );
};
