import { useState, useEffect, useMemo, useRef } from "react";
import { Download, Plus, Search, FileText } from "lucide-react";
import { useTransactionStore } from "../../store/transactionStore";
import { exportTransactionsCsv } from "../../services/transactionService";
import { downloadBlob } from "../../utils/exportCsv";
import { getErrorMessage } from "../../api/axios";
import MonthSelector from "../../components/common/MonthSelector";
import TransactionItem from "../../components/common/TransactionItem";
import { groupTransactionsByDate } from "../../utils/dateRange";
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
    buildRangeParams,
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
    return groupTransactionsByDate(Array.isArray(transactions) ? transactions : []);
  }, [transactions]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("Delete this transaction?")) {
      await deleteTransaction(id);
    }
  };

  const handleExportCsv = async () => {
    try {
      const params = buildRangeParams({
        ...(filterType && { type: filterType }),
        ...(search && { search }),
      });
      const blob = await exportTransactionsCsv(params);
      downloadBlob(blob, `transactions_${Date.now()}.csv`);
    } catch (err) {
      alert(getErrorMessage(err));
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
      <div className={styles.topBar}>
        <h1 className={styles.pageTitle}>Transactions</h1>
        <div className={styles.monthSelectorWrap}>
          <MonthSelector />
        </div>

        <div className={styles.actionGroup}>
          <button
            type="button"
            className={styles.exportBtn}
            onClick={handleExportCsv}
          >
            <Download size={15} />
            Export CSV
          </button>
          <button type="button" className={styles.addBtn} onClick={openAddModal}>
            <Plus size={16} /> Add Transaction
          </button>
        </div>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.typeFilters}>
          {[
            { key: "", label: "All", count: pagination?.total ?? (Array.isArray(transactions) ? transactions.length : 0) },
            { key: "expense", label: "Expenses", dotClass: styles.dotExpense },
            { key: "income", label: "Income", dotClass: styles.dotIncome },
            { key: "investment", label: "Investments", dotClass: styles.dotInvestment },
          ].map(({ key, label, count, dotClass }) => {
            const isActive = filterType === key;
            return (
              <button
                key={key}
                type="button"
                className={`${styles.filterPill} ${isActive ? styles.activeFilterPill : ""}`}
                onClick={() => setFilterType(key)}
              >
                {dotClass && <span className={`${styles.filterDot} ${dotClass}`} />}
                <span>{label}</span>
                {count !== undefined && count > 0 && (
                  <span className={styles.filterCountBadge}>{count}</span>
                )}
              </button>
            );
          })}
        </div>

        <div className={styles.searchWrapper}>
          <Search size={15} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search merchant, notes, amount..."
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
          {groups.map((group) => (
            <div key={group.dateStr} className={styles.groupSection}>
              <div className={styles.groupHeader}>
                <div className={styles.groupTitleWrap}>
                  <h3 className={styles.groupTitle}>{group.title}</h3>
                  {group.subtitle && (
                    <span className={styles.groupSubtitle}>
                      {group.subtitle}
                    </span>
                  )}
                </div>
                <span className={styles.groupBadge}>
                  {group.transactions.length}
                </span>
              </div>
              <div className={styles.txList}>
                {group.transactions.map(renderTxRow)}
              </div>
            </div>
          ))}
        </div>
      )}



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
