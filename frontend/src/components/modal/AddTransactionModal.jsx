import { useState, useRef, useEffect, useMemo } from "react";
import {
  Zap,
  X,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  Delete,
  Calendar,
  Tag,
  Type,
  FileText,
  Check,
  ChevronDown,
} from "lucide-react";
import { useTransactionStore } from "../../store/transactionStore";
import { getCategoriesForType } from "../../config/categories";
import { getTodayDateString } from "../../utils/dateRange";
import styles from "./AddTransactionModal.module.css";

const AddTransactionModal = () => {
  const {
    isAddModalOpen,
    closeAddModal,
    addTransaction,
    updateTransaction,
    editingTransaction,
    currency,
  } = useTransactionStore();

  const amountRef = useRef(null);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(getTodayDateString());
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditing = Boolean(editingTransaction);

  const categoryOptions = useMemo(() => {
    const base = getCategoriesForType(type);
    const current = editingTransaction?.category || "";
    if (current && !base.some((c) => c.name === current)) {
      return [{ name: current, label: current }, ...base];
    }
    return base;
  }, [type, editingTransaction]);

  useEffect(() => {
    if (!isAddModalOpen) return;
    if (editingTransaction) {
      const tx = editingTransaction;
      setTitle(tx.title || "");
      setAmount(String(tx.amount ?? ""));
      setType(tx.type || "expense");
      setCategory(tx.category || "");
      setDate(
        tx.date
          ? new Date(tx.date).toISOString().slice(0, 10)
          : getTodayDateString(),
      );
      setNote(tx.note || "");
    } else {
      setTitle("");
      setAmount("");
      setType("expense");
      setCategory(getCategoriesForType("expense")[0].name);
      setDate(getTodayDateString());
      setNote("");
    }
    setError("");
    amountRef.current?.focus();
  }, [isAddModalOpen, editingTransaction]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isAddModalOpen) {
        closeAddModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAddModalOpen, closeAddModal]);

  if (!isAddModalOpen) return null;

  const handleTypeChange = (newType) => {
    setType(newType);
    const list = getCategoriesForType(newType);
    if (!list.some((c) => c.name === category)) {
      setCategory(list[0]?.name || "");
    }
    if (error) setError("");
  };

  const handleFieldChange = (setter) => (e) => {
    setter(e.target.value);
    if (error) setError("");
  };

  const handleClearAmount = () => {
    setAmount("");
    amountRef.current?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const finalCategory = category.trim().toLowerCase();
    if (!finalCategory) {
      setError("Please select a category");
      return;
    }

    const selectedCatObj = categoryOptions.find((c) => c.name === finalCategory);
    const parsedTitle = title.trim() || selectedCatObj?.label || "Transaction";

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid amount greater than 0");
      amountRef.current?.focus();
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: parsedTitle,
        amount: numAmount,
        type,
        category: finalCategory,
        date: new Date(`${date}T12:00:00.000Z`).toISOString(),
        note: note.trim() || undefined,
      };

      if (isEditing) {
        await updateTransaction(payload);
        return;
      }

      await addTransaction(payload);
      closeAddModal();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to add transaction",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.backdrop} onClick={closeAddModal}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.dragHandle} />
        <div className={styles.header}>
          <div className={styles.headerTitleGroup}>
            <div className={styles.lightningIcon}>
              <Zap size={14} />
            </div>
            <span className={styles.headerTitle}>
              {isEditing ? "EDIT TRANSACTION" : "SPEED LOGGER"}
            </span>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={closeAddModal}
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {error && (
          <div className={styles.errorBanner}>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.typeToggle}>
            <button
              type="button"
              className={`${styles.typeBtn} ${type === "expense" ? styles.activeExpense : ""}`}
              onClick={() => handleTypeChange("expense")}
            >
              <ArrowUpRight size={14} /> Expense
            </button>
            <button
              type="button"
              className={`${styles.typeBtn} ${type === "income" ? styles.activeIncome : ""}`}
              onClick={() => handleTypeChange("income")}
            >
              <ArrowDownLeft size={14} /> Income
            </button>
            <button
              type="button"
              className={`${styles.typeBtn} ${type === "investment" ? styles.activeInvestment : ""}`}
              onClick={() => handleTypeChange("investment")}
            >
              <TrendingUp size={14} /> Invest
            </button>
          </div>

          <div className={styles.amountContainer}>
            <div className={styles.amountInputGroup}>
              <span className={styles.amountPrefix}>{currency}</span>
              <input
                ref={amountRef}
                type="number"
                step="any"
                inputMode="decimal"
                placeholder="0"
                className={styles.amountInput}
                value={amount}
                onChange={handleFieldChange(setAmount)}
                required
              />
            </div>
            {amount && (
              <button
                type="button"
                className={styles.clearAmountBtn}
                onClick={handleClearAmount}
                title="Clear"
              >
                <Delete size={16} />
              </button>
            )}
          </div>

          <div className={styles.inputFieldWrapper}>
            <Type size={16} className={styles.inputIcon} />
            <input
              type="text"
              placeholder="Title (e.g. Lunch at Cafe, or leave blank)"
              className={styles.inputField}
              value={title}
              onChange={handleFieldChange(setTitle)}
            />
          </div>

          <div className={styles.inputFieldWrapper}>
            <Tag size={16} className={styles.inputIcon} />
            <select
              className={styles.selectField}
              value={category}
              onChange={handleFieldChange(setCategory)}
              required
            >
              {categoryOptions.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className={styles.selectArrow} />
          </div>

          <div className={styles.inputFieldWrapper}>
            <Calendar size={16} className={styles.inputIcon} />
            <input
              type="date"
              className={styles.inputField}
              value={date}
              onChange={handleFieldChange(setDate)}
              required
            />
          </div>

          <div className={styles.inputFieldWrapper}>
            <FileText size={16} className={styles.inputIcon} />
            <input
              type="text"
              placeholder="Add note (optional)..."
              className={styles.inputField}
              value={note}
              onChange={handleFieldChange(setNote)}
            />
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            <Check size={16} strokeWidth={2.5} />
            <span>
              {loading
                ? "Saving..."
                : isEditing
                  ? "Update Transaction"
                  : `Save ${type.charAt(0).toUpperCase() + type.slice(1)}`}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;