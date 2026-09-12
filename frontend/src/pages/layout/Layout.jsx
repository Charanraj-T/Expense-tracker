import Menu from "../../containers/menu/Menu";
import styles from "./Layout.module.css";

const Layout = ({ children }) => {
  return (
    <div className={styles.layoutContainer}>
      <Menu />
      {children}
    </div>
  );
};

export default Layout;
