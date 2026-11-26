const menuGrid = document.getElementById("menu-grid");
const cartList = document.getElementById("cart-list");
const cartSubtotalEl = document.getElementById("cart-subtotal");
const cartCountEl = document.getElementById("cart-count");
const cartMsgEl = document.getElementById("cart-msg");
const checkoutBtn = document.getElementById("checkout-btn");
const filterButtons = document.querySelectorAll(".filter-btn");
const searchInput = document.getElementById("search-input");

// One shared storage key — checkout.js must use the same one.
const CART_KEY = "campus_cart";

let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
let activeCategory = "all";
let searchTerm = "";

/* ---------- Menu ---------- */

function renderMenu(items) {
  menuGrid.innerHTML = "";

  if (items.length === 0) {
    menuGrid.innerHTML = '<p class="empty-state">No menu items match your search.</p>';
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <img src="${item.image}" alt="${item.name}" />
      <div class="card-header">
        <span class="category-tag">${item.category}</span>
        <span class="price">₹${item.price}</span>
      </div>
      <h3>${item.name}</h3>
      <p style="font-size: 0.85rem; color: #6b7280;">${item.description}</p>
      <button class="btn btn-primary add-btn" data-id="${item.id}">Add to Cart</button>
    `;
    menuGrid.appendChild(card);
  });
}

// Event delegation: one listener covers every "Add to Cart" button,
// including ones re-created after filtering/searching.
menuGrid.addEventListener("click", (event) => {
  const btn = event.target.closest(".add-btn");
  if (!btn) return;
  addToCart(Number(btn.dataset.id));
});

function applyFilters() {
  const term = searchTerm.trim().toLowerCase();
  const filtered = MENU_ITEMS.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  });
  renderMenu(filtered);
}

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    activeCategory = btn.dataset.category;
    filterButtons.forEach((b) => b.classList.toggle("active", b === btn));
    applyFilters();
  });
});

searchInput.addEventListener("input", (event) => {
  searchTerm = event.target.value;
  applyFilters();
});

/* ---------- Cart ---------- */

function addToCart(itemId) {
  const found = MENU_ITEMS.find((item) => item.id === itemId);
  if (!found) return;

  const existing = cart.find((item) => item.id === itemId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: found.id,
      name: found.name,
      price: Number(found.price),
      qty: 1
    });
  }

  cartMsgEl.textContent = "";
  saveCart();
  renderCart();
}

function changeQty(itemId, delta) {
  const item = cart.find((i) => i.id === itemId);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter((i) => i.id !== itemId);
  }

  saveCart();
  renderCart();
}

cartList.addEventListener("click", (event) => {
  const btn = event.target.closest(".qty-btn");
  if (!btn) return;
  changeQty(Number(btn.dataset.id), Number(btn.dataset.delta));
});

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function renderCart() {
  cartList.innerHTML = "";

  if (cart.length === 0) {
    cartList.innerHTML = '<li class="empty-state">Your cart is empty.</li>';
  } else {
    cart.forEach((item) => {
      const li = document.createElement("li");
      li.className = "cart-row";
      li.innerHTML = `
        <span>${item.name}</span>
        <span class="qty-controls">
          <button class="qty-btn" data-id="${item.id}" data-delta="-1" aria-label="Decrease quantity of ${item.name}">−</button>
          <span>${item.qty}</span>
          <button class="qty-btn" data-id="${item.id}" data-delta="1" aria-label="Increase quantity of ${item.name}">+</button>
        </span>
        <span>₹${item.price * item.qty}</span>
      `;
      cartList.appendChild(li);
    });
  }

  // Numeric totals (price * qty), not string concatenation
  const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * item.qty, 0);
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);

  cartSubtotalEl.textContent = subtotal;
  cartCountEl.textContent = totalQty;
}

checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) {
    cartMsgEl.textContent = "Your cart is empty. Please add at least one item before checking out.";
    return;
  }
  cartMsgEl.textContent = "";
  window.location.href = "pages/checkout.html";
});

// Initialize page
renderMenu(MENU_ITEMS);
renderCart();
