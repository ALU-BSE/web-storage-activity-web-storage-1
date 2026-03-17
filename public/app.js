const state = {
  csrfToken: "",
  settingsKey: "ws_settings",
  encryptedEmailKey: "encrypted_email",
  emailSecret: "team-five-secret-key",
};

const el = {
  loginForm: document.getElementById("loginForm"),
  logoutBtn: document.getElementById("logoutBtn"),
  authStatus: document.getElementById("authStatus"),
  csrfToken: document.getElementById("csrfToken"),
  themeToggle: document.getElementById("themeToggle"),
  fontSize: document.getElementById("fontSize"),
  saveSettingsBtn: document.getElementById("saveSettingsBtn"),
  settingsView: document.getElementById("settingsView"),
  emailInput: document.getElementById("emailInput"),
  saveEmailBtn: document.getElementById("saveEmailBtn"),
  showEmailBtn: document.getElementById("showEmailBtn"),
  emailView: document.getElementById("emailView"),
  productSelect: document.getElementById("productSelect"),
  qtyInput: document.getElementById("qtyInput"),
  addToCartBtn: document.getElementById("addToCartBtn"),
  clearCartBtn: document.getElementById("clearCartBtn"),
  cartList: document.getElementById("cartList"),
  xssInput: document.getElementById("xssInput"),
  sanitizeBtn: document.getElementById("sanitizeBtn"),
  sanitizedView: document.getElementById("sanitizedView"),
};

async function getCsrfToken() {
  const res = await fetch("/api/csrf");
  const data = await res.json();
  state.csrfToken = data.csrfToken;
  el.csrfToken.value = data.csrfToken;
}

async function refreshSession() {
  const res = await fetch("/api/session");
  const data = await res.json();
  el.authStatus.textContent = data.isAuthenticated
    ? "Authenticated: authToken cookie exists"
    : "Not authenticated";
}

async function login(event) {
  event.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, csrfToken: state.csrfToken }),
  });

  const data = await res.json();
  el.authStatus.textContent = JSON.stringify(data, null, 2);

  if (res.ok) {
    await refreshSession();
  }
}

async function logout() {
  await fetch("/api/logout", { method: "POST" });
  await refreshSession();
}

function getSettings() {
  try {
    return (
      JSON.parse(localStorage.getItem(state.settingsKey)) || {
        theme: "light",
        fontSize: 16,
      }
    );
  } catch {
    return { theme: "light", fontSize: 16 };
  }
}

function applyTheme(theme) {
  document.body.classList.toggle("dark", theme === "dark");
}

function applySettings(settings) {
  applyTheme(settings.theme);
  document.documentElement.style.fontSize = `${settings.fontSize}px`;
  el.fontSize.value = settings.fontSize;
  el.settingsView.textContent = JSON.stringify(settings, null, 2);
}

function saveSettings() {
  const current = getSettings();
  const next = {
    ...current,
    fontSize: Number(el.fontSize.value || 16),
  };

  try {
    localStorage.setItem(state.settingsKey, JSON.stringify(next));
    applySettings(next);
  } catch (error) {
    el.settingsView.textContent = `Storage error: ${error.message}`;
  }
}

function toggleTheme() {
  const current = getSettings();
  const next = {
    ...current,
    theme: current.theme === "dark" ? "light" : "dark",
  };

  localStorage.setItem(state.settingsKey, JSON.stringify(next));
  applySettings(next);
}

function getCart() {
  try {
    return JSON.parse(sessionStorage.getItem("cart")) || [];
  } catch {
    return [];
  }
}

function drawCart() {
  const cart = getCart();
  if (cart.length === 0) {
    el.cartList.innerHTML = "<li>Cart is empty.</li>";
    return;
  }

  el.cartList.innerHTML = cart
    .map((item) => `<li>${item.product} x ${item.quantity}</li>`)
    .join("");
}

function addToCart() {
  const product = el.productSelect.value;
  const quantity = Number(el.qtyInput.value || 1);
  const cart = getCart();

  const existing = cart.find((item) => item.product === product);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ product, quantity });
  }

  sessionStorage.setItem("cart", JSON.stringify(cart));
  drawCart();
}

function clearCart() {
  sessionStorage.removeItem("cart");
  drawCart();
}

function sanitizeInput() {
  const raw = el.xssInput.value;
  const sanitized = encodeURIComponent(raw);
  el.sanitizedView.textContent = `Raw: ${raw}\nSanitized with encodeURIComponent:\n${sanitized}`;
}

function saveEmailEncrypted() {
  const email = el.emailInput.value.trim();
  if (!email) {
    el.emailView.textContent = "Type an email first.";
    return;
  }

  const cipher = CryptoJS.AES.encrypt(email, state.emailSecret).toString();
  localStorage.setItem(state.encryptedEmailKey, cipher);
  el.emailView.textContent = `Encrypted value saved:\n${cipher}`;
}

function showEmailDecrypted() {
  const cipher = localStorage.getItem(state.encryptedEmailKey);
  if (!cipher) {
    el.emailView.textContent = "No encrypted email saved yet.";
    return;
  }

  const bytes = CryptoJS.AES.decrypt(cipher, state.emailSecret);
  const plain = bytes.toString(CryptoJS.enc.Utf8);
  el.emailView.textContent = `Decrypted email: ${plain || "(failed to decrypt)"}`;
}

async function init() {
  await getCsrfToken();
  await refreshSession();
  applySettings(getSettings());
  drawCart();
  sanitizeInput();

  el.loginForm.addEventListener("submit", login);
  el.logoutBtn.addEventListener("click", logout);
  el.themeToggle.addEventListener("click", toggleTheme);
  el.saveSettingsBtn.addEventListener("click", saveSettings);
  el.addToCartBtn.addEventListener("click", addToCart);
  el.clearCartBtn.addEventListener("click", clearCart);
  el.sanitizeBtn.addEventListener("click", sanitizeInput);
  el.saveEmailBtn.addEventListener("click", saveEmailEncrypted);
  el.showEmailBtn.addEventListener("click", showEmailDecrypted);
}

init();
