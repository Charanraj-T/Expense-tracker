import { useState, useEffect, useMemo, useRef } from "react";
import { Download, Plus, Search, FileText } from "lucide-react";
import { useTransactionStore } from "../../store/transactionStore";
import MonthSelector from "../../components/common/MonthSelector";
import TransactionItem from "../../components/common/TransactionItem";
import { groupTransactionsByDate } from "../../utils/dateRange";
import { exportTransactionsToCsv } from "../../utils/exportCsv";
import styles from "./Transactions.module.css";

const Transactions = () => {
  const {
    transactions,
    pagination,
    filterType,
    search,
    currency,
    loading,
    setFilterType,
    setPage,
    setSearch,
    fetchTransactions,
    deleteTransaction,
    openAddModal,
    openEditModal,
  } = useTransactionStore();

  const [searchInput, setSearchInput] = useState("");
  const debounceRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(searchInput.trim());
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput, setSearch]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const groups = useMemo(() => {
    return groupTransactionsByDate(transactions);
  }, [transactions]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("Delete this transaction?")) {
      await deleteTransaction(id);
    }
  };

  const renderTxRow = (tx) => (
    <TransactionItem
      key={tx._id}
      transaction={tx}
      currency={currency}
      onDelete={handleDelete}
      onEdit={() => openEditModal(tx)}
    />
  );

  return (
    <div className={styles.container}>
      {/* Top Header Bar */}
      <div className={styles.topBar}>
        <div className={styles.titleSection}>
          <span className={styles.overline}>LEDGER & ACTIVITY</span>
          <h1 className={styles.pageTitle}>Transactions</h1>
        </div>

        <div className={styles.actionGroup}>
          <button
            type="button"
            className={styles.exportBtn}
            onClick={() => exportTransactionsToCsv(transactions, `transactions_${Date.now()}.csv`)}
          >
            <Download size={15} />
            Export CSV
          </button>
          <button type="button" className={styles.addBtn} onClick={openAddModal}>
            <Plus size={16} /> Add Transaction
          </button>
        </div>
      </div>

      <div className={styles.monthRow}>
        <MonthSelector />
      </div>

      {/* Filter and Search Bar */}
      <div className={styles.filterBar}>
        <div className={styles.typeFilters}>
          {["", "expense", "income", "investment"].map((typeKey) => {
            const label = typeKey
              ? typeKey === "investment"
                ? "Investments"
                : typeKey === "expense"
                ? "Expenses"
                : "Income"
              : "All";
            const isActive = filterType === typeKey;
            return (
              <button
                key={typeKey}
                type="button"
                className={`${styles.filterPill} ${isActive ? styles.activeFilterPill : ""}`}
                onClick={() => setFilterType(typeKey)}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className={styles.searchWrapper}>
          <Search size={15} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search title, category or note..."
            className={styles.searchInput}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className={styles.emptyState}>Loading transactions...</div>
      ) : transactions.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <FileText size={40} strokeWidth={1.5} />
          </div>
          <h3>No transactions found</h3>
          <p>No transactions match this filter for the selected billing period.</p>
        </div>
      ) : (
        <div className={styles.groupsContainer}>
          {/* Today */}
          {groups.today.length > 0 && (
            <div className={styles.groupSection}>
              <div className={styles.groupHeader}>
                <h3 className={styles.groupTitle}>Today</h3>
                <span className={styles.groupBadge}>{groups.today.length}</span>
              </div>
              <div className={styles.txList}>
                {groups.today.map(renderTxRow)}
              </div>
            </div>
          )}

          {/* Yesterday */}
          {groups.yesterday.length > 0 && (
            <div className={styles.groupSection}>
              <div className={styles.groupHeader}>
                <h3 className={styles.groupTitle}>Yesterday</h3>
                <span className={styles.groupBadge}>
                  {groups.yesterday.length}
                </span>
              </div>
              <div className={styles.txList}>
                {groups.yesterday.map(renderTxRow)}
              </div>
            </div>
          )}

          {/* Older Dates */}
          {groups.older.length > 0 && (
            <div className={styles.groupSection}>
              <div className={styles.groupHeader}>
                <h3 className={styles.groupTitle}>Older in Period</h3>
                <span className={styles.groupBadge}>{groups.older.length}</span>
              </div>
              <div className={styles.txList}>
                {groups.older.map(renderTxRow)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Backend Pagination or Search Summary */}
      {search ? (
        <div className={styles.paginationBar}>
          <span className={styles.pageInfo}>
            Found {pagination.total} matching transaction
            {pagination.total !== 1 ? "s" : ""}
          </span>
        </div>
      ) : pagination.pages > 1 ? (
        <div className={styles.paginationBar}>
          <span className={styles.pageInfo}>
            Page {pagination.page} of {pagination.pages} ({pagination.total}{" "}
            records)
          </span>

          <div className={styles.paginationControls}>
            <button
              type="button"
              className={styles.pageBtn}
              disabled={pagination.page <= 1}
              onClick={() => setPage(pagination.page - 1)}
            >
              Previous
            </button>
            <button
              type="button"
              className={styles.pageBtn}
              disabled={pagination.page >= pagination.pages}
              onClick={() => setPage(pagination.page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Transactions;
