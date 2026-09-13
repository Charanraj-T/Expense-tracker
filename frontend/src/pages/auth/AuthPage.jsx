import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, User, Mail, Lock, ArrowRight } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { getErrorMessage } from "../../api/axios";
import styles from "./AuthPage.module.css";

const AuthPage = () => {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register, token } = useAuthStore();

  useEffect(() => {
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [token, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        await register(form.email, form.username, form.password);
        await login(form.email, form.password);
      }
      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authWrapper}>
      <div className={styles.authCard}>
        <div className={styles.brandHeader}>
          <div className={styles.brandIcon}>
            <Wallet size={24} strokeWidth={2.2} />
          </div>
          <h1 className={styles.brandTitle}>ClearSpend</h1>
          <p className={styles.brandSubtitle}>Personal financial clarity without complexity</p>
        </div>

        <div className={styles.segmentToggle}>
          <button
            type="button"
            className={`${styles.segmentBtn} ${mode === "login" ? styles.activeSegment : ""}`}
            onClick={() => {
              setMode("login");
              setError("");
            }}
          >
            Log In
          </button>
          <button
            type="button"
            className={`${styles.segmentBtn} ${mode === "register" ? styles.activeSegment : ""}`}
            onClick={() => {
              setMode("register");
              setError("");
            }}
          >
            Create Account
          </button>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {mode === "register" && (
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="authUsername">
                Full Name / Username
              </label>
              <div className={styles.inputWrapper}>
                <User size={16} className={styles.fieldIcon} />
                <input
                  id="authUsername"
                  name="username"
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  className={styles.input}
                  value={form.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="authEmail">
              Email Address
            </label>
            <div className={styles.inputWrapper}>
              <Mail size={16} className={styles.fieldIcon} />
              <input
                id="authEmail"
                name="email"
                type="email"
                placeholder="name@example.com"
                className={styles.input}
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="authPassword">
              Password
            </label>
            <div className={styles.inputWrapper}>
              <Lock size={16} className={styles.fieldIcon} />
              <input
                id="authPassword"
                name="password"
                type="password"
                placeholder="••••••••"
                className={styles.input}
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            <span>
              {loading
                ? "Authenticating..."
                : mode === "login"
                  ? "Sign In to ClearSpend"
                  : "Create Free Account"}
            </span>
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
