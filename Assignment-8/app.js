/* ---------- Utilities ---------- */
function qs(selector) {
  return document.querySelector(selector);
}
function qsa(selector) {
  return Array.from(document.querySelectorAll(selector));
}
function byId(id) {
  return document.getElementById(id);
}

function readJSON(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch (e) {
    return null;
  }
}
function writeJSON(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}
function uid() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

/* ---------- Store Initialization ---------- */
const API_PRODUCTS = "https://dummyjson.com/products";

async function initializeStoreIfNeeded() {
  let products = readJSON("products");
  let categories = readJSON("categories");

  if (!products || !categories) {
    try {
      const res = await fetch(API_PRODUCTS);
      const data = await res.json();
      const apiProducts = data.products;

      const catMap = {};
      products = apiProducts.map((p) => {
        const prodId = uid();
        let catName = p.category?.trim() || "Uncategorized";

        if (!catMap[catName]) {
          catMap[catName] = {
            id: uid(),
            name: catName,
            image: p.thumbnail || "",
          };
        }

        return {
          id: prodId,
          title: p.title,
          price: p.price || 0,
          description: p.description,
          images: p.images?.length
            ? p.images
            : [p.thumbnail || "https://via.placeholder.com/400"],
          category: { id: catMap[catName].id, name: catName },
        };
      });

      categories = Object.values(catMap);

      writeJSON("products", products);
      writeJSON("categories", categories);
    } catch (e) {
      console.error("API fetch failed", e);
      writeJSON("products", products || []);
      writeJSON("categories", categories || []);
    }
  }
}

/* ---------- CRUD ---------- */
function getProducts() {
  return readJSON("products") || [];
}
function getCategories() {
  return readJSON("categories") || [];
}
function saveProducts(prods) {
  writeJSON("products", prods);
}
function saveCategories(cats) {
  writeJSON("categories", cats);
}

function addCategory(name, imageUrl) {
  const cats = getCategories();
  const newCat = { id: uid(), name, image: imageUrl || "" };
  cats.push(newCat);
  saveCategories(cats);
  return newCat;
}

function addProduct({ title, price, description, categoryId, images }) {
  const prods = getProducts();
  const cat = getCategories().find((c) => c.id == categoryId);
  const newProd = {
    id: uid(),
    title,
    price,
    description: description || "",
    images: images?.length ? images : ["https://via.placeholder.com/400"],
    category: cat
      ? { id: cat.id, name: cat.name }
      : { id: null, name: "Uncategorized" },
  };
  prods.unshift(newProd);
  saveProducts(prods);
  return newProd;
}

function updateProduct(id, data) {
  const prods = getProducts();
  const idx = prods.findIndex((p) => p.id == id);
  if (idx === -1) return false;
  prods[idx] = { ...prods[idx], ...data };
  if (data.categoryId) {
    const cat = getCategories().find((c) => c.id == data.categoryId);
    if (cat) prods[idx].category = { id: cat.id, name: cat.name };
  }
  saveProducts(prods);
  return true;
}

function deleteProduct(id) {
  saveProducts(getProducts().filter((p) => p.id != id));
  return true;
}

function updateCategory(id, data) {
  const cats = getCategories();
  const idx = cats.findIndex((c) => c.id == id);
  if (idx === -1) return false;
  cats[idx] = { ...cats[idx], ...data };
  saveCategories(cats);
  return true;
}

function deleteCategory(id) {
  saveCategories(getCategories().filter((c) => c.id != id));
  saveProducts(getProducts().filter((p) => p.category?.id != id));
  return true;
}

/* ---------- Cart ---------- */
function getCart() {
  return readJSON("cart") || [];
}
function saveCart(cart) {
  writeJSON("cart", cart);
}
function addToCart(productId) {
  const cart = getCart();
  const item = cart.find((i) => i.productId == productId);
  if (item) item.quantity++;
  else cart.push({ productId, quantity: 1 });
  saveCart(cart);
  renderCartCount();
}

/* ---------- Rendering: User ---------- */
function renderCategoryFilter() {
  const sel = byId("category-filter");
  if (!sel) return;
  sel.innerHTML = `<option value="">All Categories</option>`;
  getCategories().forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.name;
    sel.appendChild(opt);
  });
}

function renderProductsGrid({ categoryId = null, q = "" } = {}) {
  const grid = byId("products-grid");
  if (!grid) return;
  grid.innerHTML = "";
  let prods = getProducts();
  if (categoryId) prods = prods.filter((p) => p.category?.id == categoryId);
  if (q) {
    q = q.toLowerCase();
    prods = prods.filter(
      (p) =>
        (p.title || "").toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q)
    );
  }
  if (!prods.length) {
    grid.innerHTML = "<p class='center'>No products to show.</p>";
    return;
  }

  prods.forEach((p) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${p.images[0]}" alt="${p.title}" />
      <h3>${p.title}</h3>
      <p class="price">$${p.price}</p>
      <p>${p.category?.name || "Uncategorized"}</p>
      <p>${p.description || ""}</p>
      <div style="margin-top:auto;display:flex;gap:8px;">
        <a class="btn secondary" href="product.html?id=${p.id}">View</a>
        <button class="btn" data-add="${p.id}">Add to Cart</button>
      </div>
    `;
    grid.appendChild(card);
  });

  qsa("[data-add]").forEach(
    (btn) =>
      (btn.onclick = () => {
        addToCart(btn.getAttribute("data-add"));
        alert("Added to cart");
      })
  );
}

/* ---------- Product Detail ---------- */
function renderProductDetail() {
  const wrap = byId("product-detail");
  if (!wrap) return;
  const id = new URLSearchParams(location.search).get("id");
  if (!id) {
    wrap.innerHTML = "<p>Invalid product id</p>";
    return;
  }
  const p = getProducts().find((x) => String(x.id) === String(id));
  if (!p) {
    wrap.innerHTML = "<p>Product not found</p>";
    return;
  }

  wrap.innerHTML = `
    <div class="detail-grid">
      <div><img id="main-img" src="${p.images[0]}" /></div>
      <div>
        <h2>${p.title}</h2>
        <p class="price">$${p.price}</p>
        <p><strong>Category:</strong> ${p.category?.name || "Uncategorized"}</p>
        <p>${p.description || ""}</p>
        <div style="margin-top:12px;"><button class="btn" id="btn-add-cart">Add to Cart</button></div>
      </div>
    </div>
  `;

  byId("btn-add-cart").onclick = () => {
    addToCart(p.id);
    alert("Added to cart");
  };
}

/* ---------- Admin ---------- */
function admin_showAllProducts() {
  const area = byId("admin-area");
  area.innerHTML = "";

  const controls = document.createElement("div");
  controls.className = "admin-controls";
  controls.innerHTML = `<button class="btn" id="btn-add-product">Add Product</button>`;
  area.appendChild(controls);

  const list = document.createElement("div");
  list.className = "product-list";
  getProducts().forEach((p) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${p.images[0]}" />
      <h3>${p.title}</h3>
      <p class="price">$${p.price}</p>
      <p>${p.category?.name || "Uncategorized"}</p>
      <div style="display:flex;gap:8px;margin-top:8px;">
        <button class="btn secondary" data-edit="${p.id}">Edit</button>
        <button class="btn danger" data-delete="${p.id}">Delete</button>
      </div>
    `;
    list.appendChild(card);
  });
  area.appendChild(list);

  byId("btn-add-product").onclick = admin_renderAddProductForm;
  qsa("[data-delete]").forEach(
    (btn) =>
      (btn.onclick = () => {
        if (confirm("Delete?")) {
          deleteProduct(btn.getAttribute("data-delete"));
          admin_showAllProducts();
        }
      })
  );
  qsa("[data-edit]").forEach(
    (btn) =>
      (btn.onclick = () =>
        admin_renderEditProductForm(btn.getAttribute("data-edit")))
  );
}

function admin_renderAddProductForm() {
  const area = byId("admin-area");
  const opts = getCategories()
    .map((c) => `<option value="${c.id}">${c.name}</option>`)
    .join("");
  area.innerHTML = `
    <h2>Add Product</h2>
    <div class="form-row"><input id="p-title" placeholder="Title"/><input id="p-price" placeholder="Price" type="number"/></div>
    <div class="form-row"><select id="p-category"><option value="">Select Category</option>${opts}</select><input id="p-images" placeholder="Image URL"/></div>
    <div class="form-row"><textarea id="p-desc" placeholder="Description" rows="4" style="width:100%"></textarea></div>
    <div class="form-row"><button id="p-save" class="btn">Save</button><button id="p-cancel" class="btn secondary">Cancel</button></div>
  `;
  byId("p-save").onclick = () => {
    const title = byId("p-title").value.trim();
    const price = Number(byId("p-price").value);
    const catId = byId("p-category").value;
    const images = byId("p-images")
      .value.split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const desc = byId("p-desc").value.trim();
    if (!title || !price || !catId)
      return alert("Title, price, category required");
    addProduct({ title, price, categoryId: catId, images, description: desc });
    admin_showAllProducts();
  };
  byId("p-cancel").onclick = admin_showAllProducts;
}

function admin_renderEditProductForm(prodId) {
  const p = getProducts().find((x) => String(x.id) === String(prodId));
  if (!p) return alert("Product not found");
  const opts = getCategories()
    .map(
      (c) =>
        `<option value="${c.id}" ${p.category?.id == c.id ? "selected" : ""}>${
          c.name
        }</option>`
    )
    .join("");
  const area = byId("admin-area");
  area.innerHTML = `
    <h2>Edit Product</h2>
    <div class="form-row"><input id="p-title" value="${
      p.title
    }"/><input id="p-price" value="${p.price}" type="number"/></div>
    <div class="form-row"><select id="p-category">${opts}</select><input id="p-images" value="${p.images.join(
    ","
  )}"/></div>
    <div class="form-row"><textarea id="p-desc" rows="4" style="width:100%">${
      p.description
    }</textarea></div>
    <div class="form-row"><button id="p-save" class="btn">Save</button><button id="p-cancel" class="btn secondary">Cancel</button></div>
  `;
  byId("p-save").onclick = () => {
    const title = byId("p-title").value.trim();
    const price = Number(byId("p-price").value);
    const catId = byId("p-category").value;
    const images = byId("p-images")
      .value.split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const desc = byId("p-desc").value.trim();
    if (!title || !price || !catId)
      return alert("Title, price, category required");
    updateProduct(p.id, {
      title,
      price,
      categoryId: catId,
      images,
      description: desc,
    });
    admin_showAllProducts();
  };
  byId("p-cancel").onclick = admin_showAllProducts;
}

/* ---------- Admin Category Section ---------- */
function admin_showAllCategories() {
  const area = byId("admin-area");
  area.innerHTML = "<h2>Categories</h2>";

  const btnAdd = document.createElement("button");
  btnAdd.className = "btn";
  btnAdd.textContent = "Add Category";
  btnAdd.onclick = admin_renderAddCategoryForm;
  area.appendChild(btnAdd);

  const list = document.createElement("div");
  list.className = "category-list";
  getCategories().forEach((c) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${c.image || "https://via.placeholder.com/100"}" alt="${
      c.name
    }" style="width:100px;height:100px;object-fit:cover" />
      <h3>${c.name}</h3>
      <div style="display:flex;gap:8px;margin-top:8px;">
        <button class="btn secondary" data-edit> Edit </button>
        <button class="btn danger" data-delete> Delete </button>
      </div>
    `;

    // CLICK TO SHOW PRODUCTS
    card.addEventListener("click", (e) => {
      if (e.target.tagName === "BUTTON") return;
      const prods = getProducts().filter((p) => p.category?.id === c.id);
      showCategoryProducts(c.name, prods);
    });

    // EDIT button
    card.querySelector("[data-edit]").onclick = () =>
      admin_renderEditCategoryForm(c.id);

    // DELETE button
    card.querySelector("[data-delete]").onclick = () => {
      if (
        confirm(
          "Delete category? All products in this category will also be deleted."
        )
      ) {
        deleteCategory(c.id);
        admin_showAllCategories();
      }
    };

    list.appendChild(card);
  });

  area.appendChild(list);
}

function showCategoryProducts(catName, products) {
  const area = byId("admin-area");
  area.innerHTML = `<h2>Products in "${catName}"</h2><button class="btn secondary" onclick="admin_showAllCategories()">Back to Categories</button>`;
  const list = document.createElement("div");
  list.className = "product-list";
  products.forEach((p) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${p.images[0]}" />
      <h3>${p.title}</h3>
      <p class="price">$${p.price}</p>
    `;
    list.appendChild(card);
  });
  area.appendChild(list);
}

/* ---------- Add Category Form ---------- */
function admin_renderAddCategoryForm() {
  const area = byId("admin-area");
  area.innerHTML = `
    <h2>Add Category</h2>
    <div class="form-row">
      <input id="c-name" placeholder="Category Name"/>
      <input id="c-image" placeholder="Image URL"/>
    </div>
    <div class="form-row">
      <button id="c-save" class="btn">Save</button>
      <button id="c-cancel" class="btn secondary">Cancel</button>
    </div>
  `;
  byId("c-save").onclick = () => {
    const name = byId("c-name").value.trim();
    const image = byId("c-image").value.trim();
    if (!name) return alert("Category name required");
    addCategory(name, image);
    admin_showAllCategories();
  };
  byId("c-cancel").onclick = admin_showAllCategories;
}

/* ---------- Edit Category Form ---------- */
function admin_renderEditCategoryForm(catId) {
  const c = getCategories().find((x) => String(x.id) === String(catId));
  if (!c) return alert("Category not found");
  const area = byId("admin-area");
  area.innerHTML = `
    <h2>Edit Category</h2>
    <div class="form-row">
      <input id="c-name" value="${c.name}" placeholder="Category Name"/>
      <input id="c-image" value="${c.image}" placeholder="Image URL"/>
    </div>
    <div class="form-row">
      <button id="c-save" class="btn">Save</button>
      <button id="c-cancel" class="btn secondary">Cancel</button>
    </div>
  `;
  byId("c-save").onclick = () => {
    const name = byId("c-name").value.trim();
    const image = byId("c-image").value.trim();
    if (!name) return alert("Category name required");
    updateCategory(c.id, { name, image });
    admin_showAllCategories();
  };
  byId("c-cancel").onclick = admin_showAllCategories;
}

/* ---------- Cart ---------- */
function renderCartCount() {
  const el = byId("cart-count");
  if (!el) return;
  el.textContent = getCart().reduce((s, i) => s + (i.quantity || 0), 0);
}

function renderCartPage() {
  const container = byId("cart-items");
  const totalElement = byId("total");
  const checkoutButton = byId("checkout-btn");
  if (!container) return;

  const cart = getCart();
  const products = getProducts();
  if (!cart.length) {
    container.innerHTML = "<p>Your cart is empty 😕</p>";
    totalElement.textContent = "";
    checkoutButton.style.display = "none";
    return;
  }

  container.innerHTML = "";
  let total = 0;
  cart.forEach((item) => {
    const p = products.find((x) => x.id == item.productId);
    if (!p) return;
    const price = p.price * item.quantity;
    total += price;
    container.innerHTML += `
      <div class="cart-item">
        <img src="${p.images[0]}" />
        <div><strong>${p.title}</strong><br>$${p.price} x ${item.quantity} = <b>$${price}</b></div>
        <div>
          <button class="btn qty-btn" onclick="updateQty(${p.id}, 'minus')">-</button>
          <button class="btn qty-btn" onclick="updateQty(${p.id}, 'plus')">+</button>
          <button class="btn remove" onclick="removeFromCart(${p.id})">Remove</button>
        </div>
      </div>
    `;
  });
  totalElement.textContent = `Total: $${total}`;
  checkoutButton.style.display = "block";
}

function updateQty(productId, action) {
  const cart = getCart();
  const item = cart.find((i) => i.productId == productId);
  if (!item) return;
  if (action == "plus") item.quantity++;
  else if (action == "minus" && item.quantity > 1) item.quantity--;
  saveCart(cart);
  renderCartPage();
  renderCartCount();
}

function removeFromCart(productId) {
  saveCart(getCart().filter((i) => i.productId != productId));
  renderCartPage();
  renderCartCount();
}

async function boot() {
  await initializeStoreIfNeeded();
  renderCartCount();

  if (byId("products-grid")) {
    renderCategoryFilter();
    renderProductsGrid();
    const select = byId("category-filter");
    const search = byId("search-input");
    select.onchange = () =>
      renderProductsGrid({
        categoryId: select.value || null,
        q: search?.value || "",
      });
    search?.addEventListener("input", () =>
      renderProductsGrid({ categoryId: select.value || null, q: search.value })
    );
  }

  if (byId("product-detail")) renderProductDetail();
  if (byId("admin-area")) {
    byId("box-all-products")?.addEventListener("click", admin_showAllProducts);
    byId("box-all-categories")?.addEventListener(
      "click",
      admin_showAllCategories
    );
    admin_showAllProducts();
  }

  if (byId("cart-items")) renderCartPage();
}

boot();
