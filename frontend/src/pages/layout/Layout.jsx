import { Outlet } from "react-router-dom";
import Menu from "../../containers/menu/Menu";
import styles from "./Layout.module.css";

const Layout = () => {
  return (
    <div className={styles.layoutContainer}>
      <Menu />
      <Outlet />
    </div>
  );
};

export default Layout;
