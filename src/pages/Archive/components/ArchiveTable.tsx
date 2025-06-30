import { AgGridReact } from "ag-grid-react";
import { ColDef, GridApi, RowSelectionOptions } from "ag-grid-community";
import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { appwriteRequests } from "@/api/apiClient";
import { AG_GRID_LOCALE_UZ } from "@/assets/locales/agGrid.locale.uz";
import { Query } from "appwrite";
import { colDefs, defaultColDef } from "@/constants/AgGrid-table";
import { useArchiveContext } from "../hooks/useArchiveContext";

const containerStyle = { width: "100%", height: "85%", marginTop: "20px" };
const gridStyle = { height: "100%", width: "100%" };

const rowSelection: RowSelectionOptions | "single" | "multiple" = {
  mode: "multiRow",
};

function ArchiveTable() {
  const table = useRef<GridApi | null>(null);
  const {
    openCreateModal,
    filterModalData,
    docApplicationNumber,
    setSelectedDocuments,
    selectedDocuments,
  } = useArchiveContext();
  console.log({ docApplicationNumber });
  const { data, isFetching } = useQuery({
    queryKey: ["archiveData", docApplicationNumber, filterModalData],
    queryFn: async () => {
      const queries: string[] = [];

      if (docApplicationNumber) {
        queries.push(
          Query.search("docApplicationNumber", docApplicationNumber)
        );
      }

      const filterDataEntries = Object.entries(filterModalData);

      if (filterDataEntries.length) {
        filterDataEntries.forEach(([key, value]) => {
          if (value) {
            queries.push(Query.search(key, value));
          }
        });
      }

      return await appwriteRequests.getDocuments(queries);
    },
  });
  console.log("ArchiveTable data:", data);

  const [columnDefs] = useState<ColDef[]>(colDefs);

  const onSelectionChanged = useCallback(() => {
    const selected = table.current?.getSelectedRows() || [];

    setSelectedDocuments(selected.map((row) => row.$id));
  }, [setSelectedDocuments]);

  useEffect(() => {
    if (table.current) {
      const selecteds = table.current.getSelectedRows();
      if (!selectedDocuments.length && selecteds.length) {
        table.current.deselectAll();
      }
    }
  }, [selectedDocuments]);

  return (
    <div style={containerStyle}>
      <div style={gridStyle}>
        <AgGridReact
          onGridReady={(params) => (table.current = params.api)}
          rowData={data?.success ? data.data : []}
          loading={isFetching}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowSelection={rowSelection}
          localeText={AG_GRID_LOCALE_UZ}
          onSelectionChanged={onSelectionChanged}
          onRowDoubleClicked={(rowData) => {
            console.log({ rowData });
            openCreateModal(true, rowData.data);
          }}
        />
      </div>
    </div>
  );
}

export default ArchiveTable;
