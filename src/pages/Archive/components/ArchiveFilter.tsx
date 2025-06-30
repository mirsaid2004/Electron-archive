import { DownOutlined, FilterOutlined, InboxOutlined } from "@ant-design/icons";
import {
  Input,
  Dropdown,
  MenuProps,
  Drawer,
  Button,
  Badge,
  Modal,
  Space,
  Col,
  Row,
  Popconfirm,
  PopconfirmProps,
  message,
  Upload,
  UploadFile,
  Steps,
  Radio,
  Flex,
  Progress,
} from "antd";
import { SearchProps } from "antd/es/input";
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArchiveDocumentSchema, ArchiveDocumentType } from "@/schema/archive";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { appwriteRequests } from "@/api/apiClient";
import CustomInput from "@/components/CustomInput";
import clsx from "clsx";
import { fadeIn } from "@/constants/animations";
import { Icon } from "@iconify/react/dist/iconify.js";
import * as XLSX from "xlsx";
import { ColDef, GridApi } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { AG_GRID_LOCALE_UZ } from "@/assets/locales/agGrid.locale.uz";
import { colDefs, defaultColDef } from "@/constants/AgGrid-table";
import { useArchiveContext } from "../hooks/useArchiveContext";
import {
  useUploadDataReadContext,
  useUploadDataWriteContext,
} from "../hooks/useUploadDataContext";
import UploadDataProvider from "../context/uploadDataContext";

enum DataUploadMenuEnum {
  EXCEL_UPLOAD = "excel-upload",
  EXCEL_DOWNLOAD = "excel-download",
}

const dataUploadMenu = [
  {
    key: DataUploadMenuEnum.EXCEL_UPLOAD,
    label: "Excel fayl yuklash",
    icon: <Icon icon="material-symbols:upload" width="24" height="24" />,
  },
  {
    key: DataUploadMenuEnum.EXCEL_DOWNLOAD,
    label: "Excel faylga saqlab olish",
    icon: <Icon icon="material-symbols:download" width="24" height="24" />,
  },
];

const uploadDataSteps = [
  {
    title: "Birinchi qadam",
    description: "Faylni tanlang va yuklang",
  },
  {
    title: "Ikkinchi qadam",
    description: "Yuklangan faylni tekshiring",
  },
  {
    title: "Uchinchi qadam",
    description: "Ma'lumotlarni saqlang",
  },
];

function ArchiveFilter() {
  const { isOpenDeleteBar } = useArchiveContext();

  return isOpenDeleteBar ? (
    <ArchiveDeleteBar />
  ) : (
    <div
      className={clsx("w-full flex flex-wrap items-center gap-3 mt-5", fadeIn)}
    >
      <ArchiveFilterQuery />
      <ArchiveDataModal />
      <ArchiveDataDrawer />
    </div>
  );
}

const ArchiveFilterQuery = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const {
    openFilterModal,
    isOpenFilterModal,
    filterModalData,
    docApplicationNumber,
    setDocApplicationNumber,
  } = useArchiveContext();

  const showModal = () => {
    openFilterModal(true);
  };

  const handleOk = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: ArchiveDocumentType = {
      docSerialNumber: formData.get("docSerialNumber") as string,
      docApplicationNumber: formData.get("docApplicationNumber") as string,
      docLocker: formData.get("docLocker") as string,
      docShelf: formData.get("docShelf") as string,
      docCollection: formData.get("docCollection") as string,
    };
    openFilterModal(false, data);
  };

  const handleCancel = () => {
    formRef.current?.reset();
    openFilterModal(false);
  };

  const onSearch: SearchProps["onSearch"] = (value) => {
    setDocApplicationNumber(value);
  };

  const isFilterModalDataExist = useMemo(
    () => Object.values(filterModalData).some(Boolean),
    [filterModalData]
  );

  return (
    <>
      <Input.Search
        placeholder="Talabnoma raqamini kiriting"
        allowClear
        onSearch={onSearch}
        defaultValue={docApplicationNumber}
        className="w-full max-w-3xs"
      />

      <Badge dot={isFilterModalDataExist}>
        <Button type="primary" icon={<FilterOutlined />} onClick={showModal}>
          Filtr
        </Button>
      </Badge>

      <Modal
        title="Qo'shimcha filtr parametrlari"
        closable={{ "aria-label": "Custom Close Button" }}
        open={isOpenFilterModal}
        onCancel={handleCancel}
        footer={null}
      >
        <form ref={formRef} onSubmit={handleOk}>
          <Row gutter={[16, 16]} className="mb-4">
            <Col span={12}>
              <label htmlFor="docSerialNumber">T/R</label>
              <Input
                id="docSerialNumber"
                name="docSerialNumber"
                placeholder="T/R kiriting"
                defaultValue={filterModalData.docSerialNumber}
                allowClear
              />
            </Col>
            <Col span={12}>
              <label htmlFor="docLocker">Shkaf</label>
              <Input
                id="docLocker"
                name="docLocker"
                placeholder="Shkafni kiriting"
                defaultValue={filterModalData.docLocker}
                allowClear
              />
            </Col>
          </Row>
          <Row gutter={[16, 16]} className="mb-4">
            <Col span={12}>
              <label htmlFor="docShelf">Polka</label>
              <Input
                id="docShelf"
                name="docShelf"
                placeholder="Polkani kiriting"
                defaultValue={filterModalData.docShelf}
                allowClear
              />
            </Col>
            <Col span={12}>
              <label htmlFor="docCollection">To'plam</label>
              <Input
                id="docCollection"
                name="docCollection"
                placeholder="To'plamni kiriting"
                defaultValue={filterModalData.docCollection}
                allowClear
              />
            </Col>
          </Row>

          <Space className="w-full mt-4 justify-end flex-wrap">
            <Button
              type="default"
              htmlType="reset"
              onClick={handleCancel}
              className="mb-4"
            >
              Bekor qilish
            </Button>
            <Button type="primary" htmlType="submit" className="mb-4">
              Saqlash
            </Button>
          </Space>
        </form>
      </Modal>
    </>
  );
};

const ArchiveDataModal = () => {
  const [selectedDataMenu, selectDataMenu] =
    useState<DataUploadMenuEnum | null>(null);

  const { openCreateModal } = useArchiveContext();

  const showDrawer = () => {
    openCreateModal(true);
  };

  const onMenuClick: MenuProps["onClick"] = (e) => {
    selectDataMenu(e.key as DataUploadMenuEnum);
  };

  return (
    <UploadDataProvider>
      <Dropdown.Button
        type="primary"
        className="!w-fit ml-auto"
        onClick={showDrawer}
        menu={{ items: dataUploadMenu, onClick: onMenuClick }}
        icon={<DownOutlined />}
      >
        Ma'lumot yuklash
      </Dropdown.Button>
      <ArchiveUploadDataModal
        open={selectedDataMenu === DataUploadMenuEnum.EXCEL_UPLOAD}
        setOpen={selectDataMenu}
      />
    </UploadDataProvider>
  );
};

const ArchiveUploadDataModal = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<DataUploadMenuEnum | null>>;
}) => {
  const table = useRef<GridApi | null>(null);
  const { handleUpload, reset } = useUploadDataWriteContext();
  const [openUploadProcessModal, setOpenUploadProcessModal] = useState(false);
  const [uploadOption, setUploadOption] = useState("add-excel-file");
  const [selectedStep, setSelectedStep] = useState<number>(0);
  const [file, setFile] = useState<UploadFile>();

  const [rowData, setRowData] = useState<ArchiveDocumentType[]>([]);
  const [columnDefs] = useState<ColDef[]>(
    colDefs.map((col) => ({ ...col, editable: true }))
  );

  const handleCancel = () => {
    setOpen(null);
    setFile(undefined);
    setRowData([]);
    setSelectedStep(0);
    reset();
  };

  const onChangeStep = (step: number) => {
    setSelectedStep(step);
  };

  const isValidExcelFile = (file: File) => {
    const validTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ];

    if (!validTypes.includes(file.type)) {
      message.error("Faqatgina Excel fayllarini yuklash mumkin");
      return false;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const data = e.target?.result;
      if (!data) return;

      try {
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const headers = (rawData[0] as string[]).map((header) =>
          header.toUpperCase().trim()
        );
        const requiredHeaders = [
          "T/R",
          "TALABNOMA RAQAMI",
          "SHKAF",
          "POLKA",
          "TOPLAM",
        ];

        const isValidHeaders = requiredHeaders.every((header) =>
          headers.includes(header)
        );

        if (!isValidHeaders) {
          message.error(
            "Faylda noto'g'ri ustunlar mavjud. Iltimos, quyidagi ustunlarni tekshiring: T/R, TALABNOMA RAQAMI, SHKAF, POLKA, TOPLAM"
          );
          return false;
        }

        const dataRows = rawData.slice(1) as string[][]; // skip header row
        if (dataRows.length === 0) {
          message.error("Faylda ma'lumotlar mavjud emas");
          return false;
        }
        setRowData(
          dataRows.map((row) => ({
            docSerialNumber: row[0] || "",
            docApplicationNumber: row[1] || "",
            docLocker: row[2] || "",
            docShelf: row[3] || "",
            docCollection: row[4] || "",
          }))
        );
        console.log("✅ Raw data from Excel:", rawData);
      } catch (err) {
        console.error("❌ Failed to parse Excel file", err);
        message.error("Excel faylni o'qishda xatolik yuz berdi");
      }
    };

    reader.readAsArrayBuffer(file); // 👈 key part here
    return true;
  };

  const handleStartUpload = () => {
    setOpenUploadProcessModal(true);
    handleUpload(rowData);
  };

  console.log({ rowData });
  console.log({ file });
  return (
    <Modal
      title="Excel fayl yuklash"
      closable={{ "aria-label": "Custom Close Button" }}
      open={open}
      onCancel={handleCancel}
      width={700}
      footer={null}
    >
      <Steps
        current={selectedStep}
        onChange={file ? onChangeStep : undefined}
        items={uploadDataSteps}
      />
      <br />
      {selectedStep === 0 ? (
        <Upload.Dragger
          listType="picture"
          accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
          customRequest={({ onSuccess, onError, file }) => {
            setTimeout(() => {
              if (isValidExcelFile(file as File)) {
                onSuccess?.("ok");
                setSelectedStep(1);
                return;
              } else {
                onError?.(new Error("Invalid file type"));
              }
            }, 100);
          }}
          fileList={file ? [file] : []}
          onChange={(filesList) => setFile(filesList.fileList[0])}
          multiple={false}
          // NOTE: file validation not working when beforeUpload is used
          // beforeUpload={() => {
          //   if (file) {
          //     message.warning("Faqat 1 ta fayl yuklash mumkin");
          //     return Upload.LIST_IGNORE;
          //   }
          //   return false; // prevent auto upload
          // }}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            Yuklash uchun faylni ushbu hududga bosing yoki sudrab torting
          </p>
          <p className="ant-upload-hint">
            Faqatgina excel faylni yuklash mumkin. Fayl kengaytmalari:
            <code>.xls, .xlsx, .csv</code>.
            <br />
            <code>T/R | TALABNOMA RAQAMI | SHKAF | POLKA | TOPLAM</code>{" "}
            bo'limlari bo'lishi kerak.
            <br />
            Boshqacha tartibda ma'lumotlar kiritilsa, xatolik yuz beradi.
          </p>
        </Upload.Dragger>
      ) : null}
      {selectedStep === 1 ? (
        <div className="w-full h-[380px]">
          <AgGridReact
            onGridReady={(params) => (table.current = params.api)}
            rowData={rowData}
            defaultColDef={defaultColDef}
            columnDefs={columnDefs}
            localeText={AG_GRID_LOCALE_UZ}
            onCellValueChanged={(cell) => {
              const updatedData = [...rowData];
              updatedData[cell.rowIndex!] = updatedData[cell.rowIndex!];
              setRowData(updatedData);
            }}
          />
        </div>
      ) : null}
      {selectedStep === 2 ? (
        <>
          <Radio.Group
            onChange={(e) => setUploadOption(e.target.value)}
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            value={uploadOption}
            options={[
              {
                value: "add-excel-file",
                className: "w-full border border-gray-300 !p-2 rounded",
                label: (
                  <Flex gap="small" justify="start" align="start" vertical>
                    <h3 className="font-semibold">
                      Excel fayl malumotini yuklash (Tavsiya etiladi)
                    </h3>
                    <p className="items-start">
                      Ushbu yo'q orqali siz shunchaki bazaga ma'lumotni
                      qo'shasiz. O'xshash ma'lumotlar dublikat bo'lib ketadi.
                      Malumotlar yoqolmaydi.
                    </p>
                  </Flex>
                ),
              },
              {
                value: "clear-and-add-excel-file",
                className: "w-full border border-gray-300 !p-2 rounded",
                label: (
                  <Flex gap="small" justify="start" align="start" vertical>
                    <h3 className="font-semibold">
                      Bazani tozalab, Excel fayl malumotini yuklash
                    </h3>
                    <p>
                      Ushbu yo'l orqali siz bazadagi barcha ma'lumotlarni
                      tozalab, yangi fayldagi ma'lumotlarni qo'shasiz. Eski
                      ma'lumotlar yo'qoladi.
                    </p>
                  </Flex>
                ),
              },
            ]}
          />
          <Space className="w-full mt-4 justify-end flex-wrap">
            <Button type="default" onClick={handleCancel} className="mb-4">
              Bekor qilish
            </Button>
            <Button type="primary" className="mb-4" onClick={handleStartUpload}>
              Saqlash
            </Button>
          </Space>
          <ProgressMenu
            open={openUploadProcessModal}
            setOpen={setOpenUploadProcessModal}
            handleClose={handleCancel}
          />
        </>
      ) : null}
    </Modal>
  );
};

const ProgressMenu = ({
  open,
  setOpen,
  handleClose,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  handleClose: () => void;
}) => {
  const queryClient = useQueryClient();
  const { progressPercent, logMessage, status } = useUploadDataReadContext();
  console.log({ setOpen });

  useEffect(() => {
    if (status === "success") {
      setOpen(false);
      setTimeout(() => {
        handleClose();
        queryClient.invalidateQueries({
          queryKey: ["archiveData"],
        });
      }, 200);
    }
  }, [progressPercent, logMessage, status, handleClose, queryClient, setOpen]);

  console.log({ open });
  return (
    <Modal
      title="Yuklash jarayoni"
      closable={{ "aria-label": "Close Button" }}
      open={open}
      onCancel={() => setOpen(false)}
      width={500}
      footer={null}
    >
      <Progress percent={progressPercent} type="line" status={status} />
      <code className="text-sm">{logMessage}</code>
    </Modal>
  );
};

const ArchiveDataDrawer = () => {
  const queryClient = useQueryClient();
  const { isOpenCreateModal, openCreateModal, updateModalData } =
    useArchiveContext();
  const { control, handleSubmit, formState, reset } = useForm({
    resolver: zodResolver(ArchiveDocumentSchema),
  });
  const { errors, isDirty } = formState;

  const onClose = () => {
    reset({
      docSerialNumber: "",
      docApplicationNumber: "",
      docLocker: "",
      docShelf: "",
      docCollection: "",
    });
    openCreateModal(false);
  };

  const { mutate: createDocument, isPending: pendingCreateDocument } =
    useMutation({
      mutationKey: ["createArchiveDocument"],
      mutationFn: async (data: ArchiveDocumentType) => {
        await appwriteRequests.createDocument(data);
      },
      onMutate: () => {
        message.loading("Yuklanmoqda...");
      },
      onSuccess: () => {
        message.destroy();
        message.success("Ma'lumot muvaffaqiyatli qo'shildi");
        reset({
          docSerialNumber: "",
          docApplicationNumber: "",
          docLocker: "",
          docShelf: "",
          docCollection: "",
        });
        queryClient.invalidateQueries({
          queryKey: ["archiveData"],
        });
        openCreateModal(false);
      },
      onError: (error) => {
        message.destroy();
        message.error("Ma'lumot qo'shishda xatolik yuz berdi");
        console.error("Error creating document:", error);
      },
    });

  const { mutate: updateDocument, isPending: pendingUpdateDocument } =
    useMutation({
      mutationKey: ["updateArchiveDocument"],
      mutationFn: async ({
        $id,
        ...restData
      }: { $id: string } & ArchiveDocumentType) => {
        await appwriteRequests.updateDocument($id, restData);
      },
      onMutate: () => {
        message.loading("Yuklanmoqda...");
      },
      onSuccess: () => {
        message.destroy();
        message.success("Ma'lumot muvaffaqiyatli yangilandi");
        reset({
          docSerialNumber: "",
          docApplicationNumber: "",
          docLocker: "",
          docShelf: "",
          docCollection: "",
        });
        queryClient.invalidateQueries({
          queryKey: ["archiveData"],
        });
        openCreateModal(false);
      },
      onError: (error) => {
        message.destroy();
        message.error("Ma'lumot yangilashda xatolik yuz berdi");
        console.error("Error updating document:", error);
      },
    });

  const isMutating = pendingCreateDocument || pendingUpdateDocument;

  const handleSubmitForm = (data: ArchiveDocumentType) => {
    console.log("Form submitted with data:", data);
    if (updateModalData?.$id) {
      updateDocument({ $id: updateModalData.$id, ...data });
    } else {
      createDocument(data);
    }
  };

  useEffect(() => {
    if (updateModalData) {
      reset(updateModalData);
    }
  }, [reset, updateModalData]);

  console.log({ updateModalData });

  return (
    <Drawer
      title="Arxivga ma'lumot qo'shish"
      width={400}
      closable={{ "aria-label": "Close Button" }}
      onClose={onClose}
      open={isOpenCreateModal}
    >
      <form onSubmit={handleSubmit(handleSubmitForm)} noValidate>
        <Row gutter={[16, 16]} className="mb-4">
          <Col span={12}>
            <CustomInput
              field={"docSerialNumber"}
              control={control}
              errors={errors}
              label="T/R"
              placeholder="T/R kiriting"
              required
            />
          </Col>
          <Col span={12}>
            <CustomInput
              field={"docApplicationNumber"}
              control={control}
              errors={errors}
              label="Talabnoma raqami"
              placeholder="Talabnoma raqamini kiriting"
              required
            />
          </Col>
        </Row>
        <Row gutter={[16, 16]} className="mb-4">
          <Col span={12}>
            <CustomInput
              field={"docLocker"}
              control={control}
              errors={errors}
              label="Shkaf"
              placeholder="Shkafni kiriting"
              required
            />
          </Col>
          <Col span={12}>
            <CustomInput
              field="docShelf"
              control={control}
              errors={errors}
              label="Polka"
              placeholder="Polkani kiriting"
              required
            />
          </Col>
        </Row>
        <Row gutter={[16, 16]} className="mb-4">
          <Col span={12}>
            <CustomInput
              field="docCollection"
              control={control}
              errors={errors}
              label="To'plam"
              placeholder="To'plamni kiriting"
              required
            />
          </Col>
        </Row>
        <Space className="w-full mt-4 justify-end flex-wrap">
          <Button
            type="default"
            htmlType="reset"
            onClick={onClose}
            className="mb-4"
            disabled={isMutating}
          >
            Bekor qilish
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isMutating}
            disabled={!isDirty || isMutating}
            className="mb-4"
          >
            Saqlash
          </Button>
        </Space>
      </form>
    </Drawer>
  );
};

const ArchiveDeleteBar = () => {
  const queryClient = useQueryClient();
  const { selectedDocuments, setSelectedDocuments } = useArchiveContext();

  const { mutate } = useMutation({
    mutationFn: async (selectedDocuments: string[]) =>
      await appwriteRequests.deleteMultipleDocuments(selectedDocuments),
    onMutate: () => {
      message.loading("O'chirilmoqda...");
    },
    onSuccess() {
      message.destroy();
      message.success("Ma'lumotlar muvaffaqiyatli o'chirildi");
      setSelectedDocuments([]);
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ["archiveData"],
        });
      }, 200);
    },
    onError: (error) => {
      message.destroy();
      console.error("Error deleting documents:", error);
      message.error("Ma'lumotlar o'chirishda xatolik yuz berdi");
    },
  });

  const confirm: PopconfirmProps["onConfirm"] = () => {
    mutate(selectedDocuments);
  };

  return (
    <div
      className={clsx("w-full flex flex-wrap items-center gap-3 mt-5", fadeIn)}
    >
      <span className="text-gray-500 text-base">
        Tanlangan malumotlar: {selectedDocuments.length}
      </span>
      <Space className="flex-1 justify-end">
        <Button type="default" onClick={() => setSelectedDocuments([])}>
          Bekor qilish
        </Button>
        <Popconfirm
          title={`Eslatma! Ushbu amalni bajarish orqali tanlangan barcha ma'lumotlar o'chiriladi.`}
          description={`O'chirishni tasdiqlaysizmi?`}
          onConfirm={confirm}
          okText="Ha"
          cancelText="Yo'q"
        >
          <Button type="primary" danger>
            O'chirish
          </Button>
        </Popconfirm>
      </Space>
    </div>
  );
};

export default ArchiveFilter;
