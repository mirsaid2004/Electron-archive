import { Layout } from "antd";
import Sidebar from "./Sidebar";

function PageTemplate() {
  return (
    <div>
      <Layout.Header className="w-full"></Layout.Header>
      <div className="">
        <Sidebar />
      </div>
    </div>
  );
}

export default PageTemplate;
