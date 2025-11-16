// ----------------------
// API URL
// ----------------------
const API_PRODUCTS = "https://dummyjson.com/products";

// ----------------------
// Global Variable (For CRUD + App Use)
// ----------------------
let allProducts = [];


// ----------------------
// Fetch & Save To LocalStorage + Assign To Variable
// ----------------------
async function setupProducts() {

  // Step 1: Check if data already exists in LocalStorage
  const storedData = localStorage.getItem("products");

  if (storedData) {
    allProducts = JSON.parse(storedData);
    console.log("Data Loaded From LocalStorage:", allProducts);
    return;
  }

  // Step 2: If not found → Fetch From API and Save
  try {
    const res = await fetch(API_PRODUCTS);
    const data = await res.json();

    const finalData = data.products ? data.products : data;

    localStorage.setItem("products", JSON.stringify(finalData));

    allProducts = finalData;

    console.log("Data Fetched From API & Saved:", allProducts);

  } catch (error) {
    console.error("Error Fetching API Data:", error);
  }
}


// ----------------------
// Call Function Once
// ----------------------
setupProducts();
