import { ContainerOutlined, HomeOutlined } from "@ant-design/icons";
import { Breadcrumb } from "antd";
import ArchiveFilter from "./components/ArchiveFilter";
import ArchiveTable from "./components/ArchiveTable";
import { ArchiveProvider } from "./context/archiveContext";

function Archive() {
  return (
    <ArchiveProvider>
      <div className="w-full p-4">
        <Breadcrumb
          items={[
            {
              href: "/",
              title: <HomeOutlined />,
            },
            {
              href: "/archive",
              title: (
                <>
                  <ContainerOutlined />
                  <span>Arxiv</span>
                </>
              ),
            },
          ]}
        />

        <ArchiveFilter />
        <ArchiveTable />
      </div>
    </ArchiveProvider>
  );
}

export default Archive;
