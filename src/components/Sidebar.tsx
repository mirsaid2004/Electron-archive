import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { ContainerOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Layout, Menu } from "antd";
import clsx from "clsx";

type MenuItem = Required<MenuProps>["items"][number];

const items: MenuItem[] = [
  { key: "archive", icon: <ContainerOutlined />, label: "Arxiv" },
];

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Layout.Sider
      theme="light"
      onCollapse={toggleCollapsed}
      trigger={<CollapseTrigger collapsed={collapsed} />}
      collapsible
      collapsed={collapsed}
      className={clsx("flex flex-col h-full")}
      width={256} // Adjust width based on collapsed state
      collapsedWidth={55}
    >
      <LogoComponent collapsed={collapsed} />
      <Menu
        defaultSelectedKeys={["archive"]}
        mode="inline"
        theme="light"
        inlineCollapsed={collapsed}
        items={items}
        className={clsx("flex-1", { "w-64": !collapsed, "w-16": collapsed })} // Adjust width based
      />
    </Layout.Sider>
  );
};

const LogoComponent = ({ collapsed }: { collapsed: boolean }) => {
  return (
    <div
      className={clsx(
        "flex gap-3 justify-center items-center py-3 font-semibold text-lg",
        { "px-6": !collapsed, "px-2": collapsed }
      )}
    >
      <Icon icon="simple-icons:ea" width={30} height={30} />
      <span
        className={clsx("transition-opacity italic", {
          "flex-auto min-w-0 whitespace-nowrap overflow-hidden": !collapsed,
          hidden: collapsed,
        })}
      >
        Elektron Arxiv
      </span>
    </div>
  );
};

const CollapseTrigger = ({ collapsed }: { collapsed: boolean }) => {
  return (
    <div className="w-full h-full p-1">
      <div
        className={clsx(
          "w-full h-full flex gap-2.5 items-center justify-center hover:bg-[#e6f4ff] text-lg relative bottom-2",
          { "px-6": !collapsed, "px-2": collapsed }
        )}
      >
        <Icon
          icon={collapsed ? "lucide:sidebar-open" : "lucide:sidebar-close"}
        />
        {!collapsed ? (
          <span className="flex-1 text-sm text-left whitespace-nowrap">
            Menyuni yopish
          </span>
        ) : null}
      </div>
    </div>
  );
};

export default Sidebar;
