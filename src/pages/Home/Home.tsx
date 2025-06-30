import { Outlet } from "react-router";
import Sidebar from "../../components/Sidebar";

function Home() {
  return (
    <div>
      <Sidebar />
      <Outlet />
    </div>
  );
}

export default Home;
