import React, { useState } from "react";
import styles from "./CustomerForm.module.css";

// Initial blank form state
const INITIAL_FORM = { name: "", email: "", phone: "" };

// Client-side validation rules (mirrors server validation)
function validateForm({ name, email, phone }) {
  const errors = {};
  if (!name.trim() || name.trim().length < 2)
    errors.name = "Name must be at least 2 characters.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    errors.email = "Enter a valid email address.";
  if (!/^[0-9]{7,15}$/.test(phone.trim()))
    errors.phone = "Phone must be 7–15 digits (numbers only).";
  return errors;
}

export default function CustomerForm({ onAdd }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // ── Update a single field and clear its error on change
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError("");
  }

  // ── Form submission
  async function handleSubmit(e) {
    e.preventDefault();

    // 1. Client-side validation
    const errors = validateForm(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    setServerError("");
    setSuccessMsg("");

    try {
      // 2. Send to backend via parent callback
      await onAdd({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      });

      // 3. Success: reset form and flash message
      setForm(INITIAL_FORM);
      setFieldErrors({});
      setSuccessMsg(`Customer added successfully!`);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      // Surface server-side errors (e.g. duplicate email)
      setServerError(err.errors?.[0] || err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className={styles.card}>
      {/* Header */}
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Add Customer</h2>
        <p className={styles.cardSubtitle}>
          Fill in the details to register a new customer.
        </p>
      </div>

      {/* Global success / error banners */}
      {successMsg && (
        <div className={`${styles.banner} ${styles.bannerSuccess}`}>
          <span className={styles.bannerIcon}>✓</span> {successMsg}
        </div>
      )}
      {serverError && (
        <div className={`${styles.banner} ${styles.bannerError}`}>
          <span className={styles.bannerIcon}>!</span> {serverError}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className={styles.form}>
        {/* Name */}
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="name">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Jane Doe"
            className={`${styles.input} ${fieldErrors.name ? styles.inputError : ""}`}
            autoComplete="off"
          />
          {fieldErrors.name && (
            <span className={styles.fieldError}>{fieldErrors.name}</span>
          )}
        </div>

        {/* Email */}
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="e.g. jane@company.com"
            className={`${styles.input} ${fieldErrors.email ? styles.inputError : ""}`}
            autoComplete="off"
          />
          {fieldErrors.email && (
            <span className={styles.fieldError}>{fieldErrors.email}</span>
          )}
        </div>

        {/* Phone */}
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="phone">
            Phone Number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="e.g. 9876543210"
            className={`${styles.input} ${fieldErrors.phone ? styles.inputError : ""}`}
            autoComplete="off"
          />
          {fieldErrors.phone && (
            <span className={styles.fieldError}>{fieldErrors.phone}</span>
          )}
        </div>

        {/* Submit */}
        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? (
            <>
              <span className={styles.spinner} /> Adding…
            </>
          ) : (
            <>
              <span className={styles.btnIcon}>+</span> Add Customer
            </>
          )}
        </button>
      </form>
    </section>
  );
}
