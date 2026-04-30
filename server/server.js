const express = require("express");
const cors = require("cors");
const fs = require("fs").promises;
const path = require("path");
const { log } = require("console");
const { randomUUID: uuidv4 } = require("crypto");

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_PATH = path.join(__dirname, "data.json");

// Middlewares
app.use(cors()); // Allow cross-origin requests from the React frontend
app.use(express.json()); // Parse incoming JSON request bodies
const customers = []; // In-memory data store

async function getCustomersFromFile() {
  try {
    const rawData = await fs.readFile(DATA_PATH, "utf8");

    // 1. Parse the string into a JS Object
    const parsedFile = JSON.parse(rawData);

    // 2. Extract the array from the 'customers' property
    // If your JSON looks like { "customers": [...] }
    const customersArray = parsedFile.customers;

    // 3. Final Check: Ensure we are returning an array
    if (Array.isArray(customersArray)) {
      return customersArray;
    } else {
      console.warn(
        "Data found, but 'customers' is not an array. Returning empty.",
      );
      return [];
    }
  } catch (err) {
    console.error("FS Error:", err.message);
    return []; // Fallback so the server doesn't crash
  }
}

getCustomersFromFile()
  .then((data) => {
    customers.push(...data);
  })
  .catch((err) => {
    console.error("Error initializing customers:", err.message);
  });

function generateId() {
  return uuidv4();
}

// Input Validation
function validateCustomer(body) {
  const errors = [];
  const { name, email, phone } = body;

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    errors.push("Name must be at least 2 characters.");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    errors.push("A valid email address is required.");
  }

  const phoneRegex = /^[0-9]{7,15}$/;
  if (!phone || !phoneRegex.test(phone.trim())) {
    errors.push("Phone must be 7–15 digits (numbers only).");
  }

  return { valid: errors.length === 0, errors };
}

/**
 * GET /customers
 * Returns the full list of customers sorted by newest first.
 */
app.get("/customers", async (req, res) => {
  try {
    const customers = await getCustomersFromFile();

    // Sort by date (good for UI consistency)
    const sortedCustomers = customers.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );

    res.json(sortedCustomers);
  } catch (error) {
    console.error("Error reading data:", error);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

/**
 * POST /customers
 * Adds a new customer after validating input.
 * Body: { name, email, phone }
 */
app.post("/customers", (req, res) => {
  const { valid, errors } = validateCustomer(req.body);

  if (!valid) {
    return res.status(400).json({ success: false, errors });
  }

  // Check for duplicate email (case-insensitive)
  const emailExists = customers.some(
    (c) => c.email.toLowerCase() === req.body.email.trim().toLowerCase(),
  );
  if (emailExists) {
    return res.status(409).json({
      success: false,
      errors: ["A customer with this email already exists."],
    });
  }

  const newCustomer = {
    id: generateId(),
    name: req.body.name.trim(),
    email: req.body.email.trim().toLowerCase(),
    phone: req.body.phone.trim(),
    createdAt: new Date().toISOString(),
  };

  customers.push(newCustomer);

  res.status(201).json({ success: true, data: newCustomer });
});

/**
 * DELETE /customers/:id
 * Removes a customer by their unique ID.
 */
app.delete("/customers/:id", (req, res) => {
  const { id } = req.params;
  const index = customers.findIndex((c) => c.id === id);

  if (index === -1) {
    return res
      .status(404)
      .json({ success: false, errors: [`Customer with ID ${id} not found.`] });
  }

  // Remove the customer from the array
  const [removed] = customers.splice(index, 1);

  res.json({ success: true, data: removed });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, errors: ["Route not found."] });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("[ERROR]", err.message);
  res.status(500).json({ success: false, errors: ["Internal server error."] });
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n🚀 Customer API running on http://localhost:${PORT}`);
  console.log(`   GET    http://localhost:${PORT}/customers`);
  console.log(`   POST   http://localhost:${PORT}/customers`);
  console.log(`   DELETE http://localhost:${PORT}/customers/:id\n`);
});
