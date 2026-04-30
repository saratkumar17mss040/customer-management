import React, { useState, useMemo } from "react";
import styles from "./CustomerTable.module.css";

// Number of rows to show per page
const PAGE_SIZE = 15;

export default function CustomerTable({ customers, onDelete, loading }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null); // tracks which row is being deleted

  // Filter customers by name or email or phone based on search query
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.startsWith(q),
    );
  }, [customers, searchQuery]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  // Clamp current page when filter shrinks results
  // safePage is the current page number
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  // Reset to page 1 whenever search changes
  function handleSearch(e) {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  }

  // Delete handler with per-row loading state
  async function handleDelete(id) {
    if (!window.confirm("Remove this customer? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  }

  // Build page number array for pagination controls
  function buildPageNumbers() {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = [1];
    const delta = 2;
    let left = Math.max(2, safePage - delta);
    let right = Math.min(totalPages - 1, safePage + delta);
    if (left > 2) pages.push("…");
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push("…");
    pages.push(totalPages);
    return pages;
  }

  return (
    <section className={styles.section}>
      {/* Table Header: title + search*/}
      <div className={styles.tableHeader}>
        <div>
          <h2 className={styles.tableTitle}>Customers</h2>
          <p className={styles.tableMeta}>
            {filtered.length} {filtered.length === 1 ? "record" : "records"}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>⌕</span>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search name, email or phone…"
            value={searchQuery}
            onChange={handleSearch}
            aria-label="Search customers"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className={styles.tableWrap}>
        {loading ? (
          <div className={styles.stateBox}>
            <span className={styles.spinner} />
            <p>Loading customers…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.stateBox}>
            <span className={styles.emptyIcon}>◎</span>
            <p className={styles.emptyTitle}>No customers found</p>
            <p className={styles.emptyHint}>
              {searchQuery
                ? "Try a different search term."
                : "Add your first customer using the form."}
            </p>
          </div>
        ) : (
          <table className={styles.table} aria-label="Customer list">
            <thead>
              <tr>
                <th className={styles.thIndex}>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th className={styles.thAction}>Action</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((customer, idx) => (
                <tr
                  key={customer.id}
                  className={`${styles.row} ${deletingId === customer.id ? styles.rowDeleting : ""}`}
                >
                  {/* Row number relative to full filtered list */}
                  <td className={styles.tdIndex}>{pageStart + idx + 1}</td>
                  <td className={styles.tdName}>
                    {/* Avatar-style initials */}
                    <span className={styles.avatar}>
                      {customer.name.charAt(0).toUpperCase()}
                    </span>
                    <span>{customer.name}</span>
                  </td>
                  <td className={styles.tdEmail}>{customer.email}</td>
                  <td className={styles.tdPhone}>{customer.phone}</td>
                  <td>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(customer.id)}
                      disabled={deletingId === customer.id}
                      aria-label={`Delete ${customer.name}`}
                    >
                      {deletingId === customer.id ? (
                        <span className={styles.deletingSpinner} />
                      ) : (
                        "Delete"
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Controls*/}
      {totalPages > 1 && (
        <nav className={styles.pagination} aria-label="Pagination">
          {/* Previous */}
          <button
            className={styles.pageBtn}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            aria-label="Previous page"
          >
            ‹
          </button>

          {/* Page number buttons */}
          {buildPageNumbers().map((p, i) =>
            p === "…" ? (
              <span key={`ellipsis-${i}`} className={styles.ellipsis}>
                …
              </span>
            ) : (
              <button
                key={p}
                className={`${styles.pageBtn} ${safePage === p ? styles.pageBtnActive : ""}`}
                onClick={() => setCurrentPage(p)}
                aria-label={`Page ${p}`}
                aria-current={safePage === p ? "page" : undefined}
              >
                {p}
              </button>
            ),
          )}

          {/* Next */}
          <button
            className={styles.pageBtn}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            aria-label="Next page"
          >
            ›
          </button>

          {/* Page info */}
          <span className={styles.pageInfo}>
            Page {safePage} of {totalPages}
          </span>
        </nav>
      )}
    </section>
  );
}
