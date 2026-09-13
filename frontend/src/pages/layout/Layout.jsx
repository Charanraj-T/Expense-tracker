import { Outlet, useNavigate } from "react-router-dom";
import { Wallet } from "lucide-react";
import Menu from "../../containers/menu/Menu";
import MobileNav from "../../containers/menu/MobileNav";
import AddTransactionModal from "../../components/modal/AddTransactionModal";
import { useAuthStore } from "../../store/authStore";
import { getInitials } from "../../utils/getInitials";
import styles from "./Layout.module.css";

const Layout = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const displayName = user?.username || user?.userId || "Account";
  const initials = getInitials(displayName);

  return (
    <div className={styles.layoutWrapper}>
      <aside className={styles.sidebarArea}>
        <Menu />
      </aside>

      <div className={styles.mainArea}>
        <header className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <div className={styles.brandGroup}>
              <div className={styles.brandLogo}>
                <Wallet size={16} strokeWidth={2.4} />
              </div>
              <span className={styles.brandText}>ClearSpend</span>
            </div>
          </div>

          <div className={styles.topBarRight}>
            <div
              className={styles.topBarAvatar}
              title={`Logged in as ${displayName}`}
              onClick={() => navigate("/account")}
              role="button"
              tabIndex={0}
            >
              {initials}
            </div>
          </div>
        </header>

        <main className={styles.contentScrollArea}>
          <Outlet />
        </main>
      </div>

      <MobileNav />

      <AddTransactionModal />
    </div>
  );
};

export default Layout;
