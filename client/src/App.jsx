import React, { useState, useEffect, useCallback } from "react";
import { fetchCustomers, createCustomer, deleteCustomer } from "./api/api";
import CustomerForm from "./components/CustomerForm";
import CustomerTable from "./components/CustomerTable";
import styles from "./App.module.css";

export default function App() {
  const [customers, setCustomers] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [globalError, setGlobalError] = useState("");

  const loadCustomers = useCallback(async () => {
    setTableLoading(true);
    setGlobalError("");
    try {
      const res = await fetchCustomers();
      setCustomers(res);
    } catch {
      setGlobalError("Could not load customers.");
    } finally {
      setTableLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  async function handleAdd(payload) {
    // Pessimistic UI update
    const res = await createCustomer(payload);
    setCustomers((prev) => [res.data, ...prev]);
  }

  async function handleDelete(id) {
    await deleteCustomer(id);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className={styles.appShell}>
      {/* ── Top Navigation Bar ── */}
      <header className={styles.navbar}>
        <div className={styles.navInner}>
          <div className={styles.brand}>
            <span className={styles.brandMark}>◈</span>
            <span className={styles.brandName}>CustomerBase</span>
          </div>
          <div className={styles.navStats}>
            <span className={styles.statBadge}>
              {tableLoading ? "—" : customers?.length || 0} customers
            </span>
          </div>
        </div>
      </header>

      {/* ── Global Error Banner ── */}
      {globalError && (
        <div className={styles.globalError}>
          <span>⚠ {globalError}</span>
          <button onClick={loadCustomers} className={styles.retryBtn}>
            Retry
          </button>
        </div>
      )}

      {/* ── Main Content ── */}
      <main className={styles.main}>
        <div className={styles.pageGrid}>
          {/* Left sidebar: Add Customer form */}
          <aside className={styles.sidebar}>
            <CustomerForm onAdd={handleAdd} />
          </aside>

          {/* Right: Customer table with pagination */}
          <div className={styles.tableArea}>
            <CustomerTable
              customers={customers}
              onDelete={handleDelete}
              loading={tableLoading}
            />
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <p>
          Customer Management Dashboard · In-memory storage · Data resets on
          server restart
        </p>
      </footer>
    </div>
  );
}
