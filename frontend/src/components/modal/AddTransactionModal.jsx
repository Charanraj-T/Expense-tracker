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
} from "lucide-react";
import { useTransactionStore } from "../../store/transactionStore";
import { getCategoriesForType } from "../../config/categories";
import styles from "./AddTransactionModal.module.css";

const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

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
  const [feedback, setFeedback] = useState("");
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

  // Preselect first category and auto-focus amount when modal opens
  useEffect(() => {
    if (isAddModalOpen) {
      setTimeout(() => {
        amountRef.current?.focus();
      }, 50);
      setFeedback("");
      setError("");
      setCategory(getCategoriesForType("expense")[0].name);
    }
  }, [isAddModalOpen]);

  // Prefill fields when editing an existing transaction
  useEffect(() => {
    if (isAddModalOpen && editingTransaction) {
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
      setFeedback("");
      setError("");
    }
  }, [isAddModalOpen, editingTransaction]);

  // Handle Escape key to close modal
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
    if (feedback) setFeedback("");
    if (error) setError("");
  };

  const handleFieldChange = (setter) => (e) => {
    setter(e.target.value);
    if (feedback) setFeedback("");
    if (error) setError("");
  };

  const handleClearAmount = () => {
    setAmount("");
    amountRef.current?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFeedback("");

    const parsedTitle = title.trim();
    if (!parsedTitle) {
      setError("Please enter a title");
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid amount greater than 0");
      amountRef.current?.focus();
      return;
    }

    const finalCategory = category.trim().toLowerCase();
    if (!finalCategory) {
      setError("Please select a category");
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

      // Clear fields as required, keep category selected for repeat entry
      setAmount("");
      setTitle("");
      setNote("");

      setFeedback(
        `Added ${currency} ${numAmount} (${finalCategory})! Ready for next.`,
      );

      // Keep modal open, refocus Amount
      setTimeout(() => {
        amountRef.current?.focus();
      }, 50);
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

        {feedback && (
          <div className={styles.successFlash}>
            <span>{feedback}</span>
          </div>
        )}

        {error && (
          <div className={styles.errorBanner}>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* 1. Type Selector (Segmented Toggle) */}
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

          {/* 2. Amount Input Box (Primary Focus) */}
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
                autoFocus
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

          {/* 3. Title Input */}
          <div className={styles.inputFieldWrapper}>
            <Type size={16} className={styles.inputIcon} />
            <input
              type="text"
              placeholder="Title (e.g. Lunch at Cafe)"
              className={styles.inputField}
              value={title}
              onChange={handleFieldChange(setTitle)}
              required
            />
          </div>

          {/* 4. Category Dropdown */}
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
          </div>

          {/* 5. Date Picker Input */}
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

          {/* 6. Note Input */}
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

          {/* 7. Save Button */}
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            <Check size={16} />
            <span>
              {loading
                ? "Saving..."
                : isEditing
                  ? "Update"
                  : `Save ${type.charAt(0).toUpperCase() + type.slice(1)}`}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;