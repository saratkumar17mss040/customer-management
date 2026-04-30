const API_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Fetch all customers from the backend.
 * @returns {Promise<{ data: Customer[], total: number }>}
 */
export async function fetchCustomers() {
  const res = await fetch(`${API_URL}/customers`);
  if (!res.ok) throw new Error("Failed to load customers.");
  return res.json();
}

/**
 * Create a new customer.
 * @param {{ name: string, email: string, phone: string }} payload
 * @returns {Promise<{ data: Customer }>}
 */
export async function createCustomer(payload) {
  const res = await fetch(`${API_URL}/customers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) {
    // Throw a structured error the form can display
    const err = new Error(
      json.errors?.join(" ") || "Failed to create customer.",
    );
    err.errors = json.errors;
    throw err;
  }
  return json;
}

/**
 * Delete a customer by ID.
 * @param {string} id - Customer UUID
 * @returns {Promise<{ data: Customer }>}
 */
export async function deleteCustomer(id) {
  const res = await fetch(`${API_URL}/customers/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete customer.");
  return res.json();
}
