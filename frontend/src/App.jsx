import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Layout from "./pages/layout/Layout";
import Home from "./pages/home/Home";
import Transactions from "./pages/transactions/Transactions";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route exact path={"/"} element={<Home />}></Route>
          <Route exact path={"/dashboard"} element={<Home />}></Route>
          <Route exact path={"/transactions"} element={<Transactions />}></Route>
          <Route path="*" element={<Navigate replace to={"/"} />}></Route>
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
