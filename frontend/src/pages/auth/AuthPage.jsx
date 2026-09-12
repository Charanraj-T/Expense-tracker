import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { getErrorMessage } from "../../api/axios";

const AuthPage = () => {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login, register } = useAuthStore();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
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
    }
  };

  const toggleMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setError("");
  };

  return (
    <div>
      <h2>{mode === "login" ? "Login" : "Register"}</h2>
      {error && <p>{error}</p>}
      <form onSubmit={handleSubmit}>
        {mode === "register" && (
          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
          />
        )}
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />
        <button type="submit">{mode === "login" ? "Login" : "Register"}</button>
      </form>
      <button type="button" onClick={toggleMode}>
        {mode === "login" ? "Need an account? Register" : "Have an account? Login"}
      </button>
    </div>
  );
};

export default AuthPage;