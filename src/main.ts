import { DatabaseService } from "./database.service";

const db = new DatabaseService();

window.addEventListener("DOMContentLoaded", () => {
  const addCartButtons = document.getElementsByClassName("add-cart");
  for (let i = 0; i < addCartButtons.length; i++) {
    addCartButtons[i].addEventListener("click", async function (this: HTMLElement) {
      const productDiv = (this as HTMLElement).closest(".products");
      if (!productDiv) return;
      const name = productDiv.querySelector("h4")?.textContent || "";
      const price = parseFloat(productDiv.querySelector("span")?.textContent || "0");
      await db.addToCart(name, price, 1);
      updateCartUI();
    });
  }
  updateCartUI();
});

async function updateCartUI() {
  const cartDetails = document.getElementById("cart-details");
  const cartTitle = document.querySelector(".cart h2");
  if (!cartDetails || !cartTitle) return;
  const items = await db.getCartItems();
  if (items.length === 0) {
    cartDetails.innerHTML = `
      <img src="./assets/images/illustration-empty-cart.svg" alt="">
      <p>Your added items will appear here</p>
    `;
    cartTitle.textContent = "Your Cart (0)";
    return;
  }
  cartTitle.textContent = `Your Cart (${items.reduce((sum, item) => sum + item.quantity, 0)})`;
  const orderTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartDetails.innerHTML = items.map(item => `
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
    <span>${item.name} x${item.quantity}</span>
    <span>$${(item.price * item.quantity).toFixed(2)}</span>
    <button data-name="${item.name}" class="remove-cart" style="margin-left:8px; box-shadow:none; border:none;"><img src="./assets//images/icon-remove-item.svg" alt=""></button>
  </div>
`).join("") + `
  <div style="border-top:1px solid #eee;margin-top:12px;padding-top:8px;display:flex;justify-content:space-between;font-weight:bold;">
    <span>Order Total</span>
    <span>$${orderTotal.toFixed(2)}</span>
  </div>
  <button id="confirm-order" style="margin-top:12px;width:100%;background:hsl(14, 86%, 42%);color:white;border:none;padding:8px 0;border-radius:6px;cursor:pointer;">Confirm Order</button>
`;
// Add remove event listeners
cartDetails.querySelectorAll(".remove-cart").forEach(btn => {
  btn.addEventListener("click", async function (this: HTMLElement) {
    const name = this.getAttribute("data-name")!;
    await db.removeFromCart(name);
    updateCartUI();
  });
});
// Add confirm order event listener
const confirmBtn = document.getElementById("confirm-order");
if (confirmBtn) {
  confirmBtn.addEventListener("click", async () => {
    
    await db.clearCart();
    updateCartUI();
  });
}
}
