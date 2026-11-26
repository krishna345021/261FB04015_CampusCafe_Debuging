const checkoutItemsEl = document.getElementById("checkout-items");
const subtotalEl = document.getElementById("subtotal");
const taxEl = document.getElementById("tax");
const discountEl = document.getElementById("discount");
const grandTotalEl = document.getElementById("grand-total");

const promoInput = document.getElementById("promo-input");
const applyPromoBtn = document.getElementById("apply-promo-btn");
const promoMsgEl = document.getElementById("promo-msg");

const orderForm = document.getElementById("order-form");
const studentNameInput = document.getElementById("student-name");
const rollNumberInput = document.getElementById("roll-number");
const orderMsgEl = document.getElementById("order-msg");
const confirmBtn = document.getElementById("confirm-order-btn");

// Same key that index page (app.js) saves to
const CART_KEY = "campus_cart";
const PROMO_CODE = "STUDENT15";
const PROMO_MIN_SUBTOTAL = 150;
const PROMO_RATE = 0.15;

let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
let discountAmount = 0;

function calculateSubtotal() {
  return cart.reduce((sum, item) => sum + Number(item.price) * (item.qty || 1), 0);
}

function renderCheckout() {
  checkoutItemsEl.innerHTML = "";

  if (cart.length === 0) {
    checkoutItemsEl.innerHTML = '<li class="empty-state">No items found in your order.</li>';
  } else {
    cart.forEach((item) => {
      const li = document.createElement("li");
      li.className = "cart-row";
      li.innerHTML = `
        <span>${item.name} × ${item.qty || 1}</span>
        <span>₹${(Number(item.price) * (item.qty || 1)).toFixed(2)}</span>
      `;
      checkoutItemsEl.appendChild(li);
    });
  }

  const subtotal = calculateSubtotal();
  const tax = subtotal * 0.05;
  const grandTotal = Math.max(0, subtotal + tax - discountAmount);

  subtotalEl.textContent = subtotal.toFixed(2);
  taxEl.textContent = tax.toFixed(2);
  discountEl.textContent = discountAmount.toFixed(2);
  grandTotalEl.textContent = grandTotal.toFixed(2);
}

function setMessage(el, text, type) {
  el.textContent = text;
  el.className = type === "success" ? "msg-success" : "msg-error";
}

applyPromoBtn.addEventListener("click", () => {
  const code = promoInput.value.trim().toUpperCase();
  const subtotal = calculateSubtotal();

  // Always reset first so an invalid attempt never leaves a stale discount
  discountAmount = 0;

  if (code !== PROMO_CODE) {
    setMessage(promoMsgEl, "Invalid promo code.", "error");
  } else if (subtotal < PROMO_MIN_SUBTOTAL) {
    setMessage(
      promoMsgEl,
      `STUDENT15 needs a subtotal of ₹${PROMO_MIN_SUBTOTAL} or more (yours is ₹${subtotal.toFixed(2)}).`,
      "error"
    );
  } else {
    discountAmount = subtotal * PROMO_RATE;
    setMessage(promoMsgEl, `Promo applied! You saved ₹${discountAmount.toFixed(2)}.`, "success");
  }

  renderCheckout();
});

orderForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = studentNameInput.value.trim();
  const roll = rollNumberInput.value.trim();

  if (cart.length === 0) {
    setMessage(orderMsgEl, "Your cart is empty. Go back to the menu and add items first.", "error");
    return;
  }
  if (!name || !roll) {
    setMessage(orderMsgEl, "Please enter both your Full Name and Roll Number.", "error");
    return;
  }

  const orderId = "CC-" + Date.now().toString(36).toUpperCase();

  // Clear saved cart + local state
  localStorage.removeItem(CART_KEY);
  cart = [];
  discountAmount = 0;
  promoInput.value = "";
  setMessage(promoMsgEl, "", "error");

  renderCheckout();
  setMessage(orderMsgEl, `Thank you, ${name}! Your order is confirmed. Order ID: ${orderId}`, "success");
  confirmBtn.disabled = true;
});

renderCheckout();
