import { Outlet } from "react-router-dom";
import Menu from "../../containers/menu/Menu";
import AddTransactionModal from "../../components/modal/AddTransactionModal";
import { useAuthStore } from "../../store/authStore";
import { getInitials } from "../../utils/getInitials";
import styles from "./Layout.module.css";

const Layout = () => {
  const { user } = useAuthStore();
  const displayName = user?.username || user?.userId || "Account";
  const initials = getInitials(displayName);

  return (
    <div className={styles.layoutWrapper}>
      <aside className={styles.sidebarArea}>
        <Menu />
      </aside>

      <div className={styles.mainArea}>
        {/* Top bar visible across views */}
        <header className={styles.topBar}>
          <div className={styles.topBarRight}>
            <div className={styles.topBarAvatar} title={displayName}>
              {initials}
            </div>
          </div>
        </header>

        <main className={styles.contentScrollArea}>
          <Outlet />
        </main>
      </div>

      <AddTransactionModal />
    </div>
  );
};

export default Layout;
