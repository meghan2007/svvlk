// ===============================
// SPLASH SCREEN LOGIC
// ===============================
document.addEventListener("DOMContentLoaded", () => {
        const splashScreen = document.getElementById("splash-screen");
    if (splashScreen) {
                const hideSplash = () => {
            splashScreen.style.opacity = "0";
            setTimeout(() => {
                splashScreen.style.display = "none";
                
                // Gate Logic
                if (currentUser) {
                    document.getElementById("store-content").style.display = "block";
                    document.getElementById("login-gate").style.display = "none";
                } else {
                    document.getElementById("store-content").style.display = "none";
                    document.getElementById("login-gate").style.display = "flex";
                }
            }, 800);
        };
        // Hide on click OR automatically after 2.5 seconds
        splashScreen.addEventListener("click", hideSplash);
        setTimeout(hideSplash, 2500);
    }
});
const SUPABASE_URL = "https://vlcpdyaitetgyqiawsoj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsY3BkeWFpdGV0Z3lxaWF3c29qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5ODU1MjksImV4cCI6MjEwMzU2MTUyOX0.rYePHXoZgy68see7wNZPz0QyGR7tsM1RdTvsA6BwttU";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

// ===============================
// MAINTENANCE MODE CHECK
// ===============================
async function checkMaintenanceMode() {
    try {
        const { data } = await supabaseClient.from('store_settings').select('maintenance_mode').eq('id', 1).single();
        if (data && data.maintenance_mode) {
                        document.body.innerHTML = `
                <div style="height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; background: var(--bg-cream, #FBF9F6); color: var(--text-dark, #2A332C); font-family: var(--font-body, sans-serif); padding: 20px;">
                    <h1 style="font-size: 44px; font-family: var(--font-heading, serif); color: var(--primary-forest, #1A3B26); margin-bottom: 20px;">Market Closed</h1>
                    <p style="font-size: 16px; color: var(--text-muted, #5C6E61); max-width: 600px; line-height: 1.6;">We are currently curating our fresh selection and upgrading our systems. SVVLK will reopen shortly. Thank you for your patience.</p>
                </div>
            `;
            return true;
        }
    } catch (e) {
        console.log(e);
    }
    return false;
}

// ===============================
// DARK MODE
// ===============================
const darkModeToggle = document.getElementById('dark-mode-toggle');
if (darkModeToggle) {
    if (localStorage.getItem('dark-mode') === 'enabled') {
        document.body.classList.add('dark-mode');
        darkModeToggle.textContent = '☀️';
    }

    darkModeToggle.addEventListener('click', (e) => {
        e.preventDefault();
        document.body.classList.toggle('dark-mode');
        
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('dark-mode', 'enabled');
            darkModeToggle.textContent = '☀️';
        } else {
            localStorage.setItem('dark-mode', 'disabled');
            darkModeToggle.textContent = '🌙';
        }
    });
}


// ===============================
// PAYMENT METHOD TOGGLE
// ===============================
const paymentMethodSelect = document.getElementById("payment-method");
const upiSection = document.getElementById("upi-section");
const utrNumberInput = document.getElementById("utr-number");

if (paymentMethodSelect && upiSection) {
    paymentMethodSelect.addEventListener("change", function() {
        if (this.value === "UPI") {
            upiSection.style.display = "block";
            utrNumberInput.required = true;
        } else {
            upiSection.style.display = "none";
            utrNumberInput.required = false;
            utrNumberInput.value = ""; // clear it
        }
    });
}

// ===============================
// SECURITY HELPER
// ===============================
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, function(tag) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag;
    });
}

// ===============================
// SVVLK GROCERY CART
// ===============================

let cart = JSON.parse(localStorage.getItem("svvlk-cart")) || [];
try {
    cart = JSON.parse(localStorage.getItem('svvlk-cart')) || [];
} catch (e) {
    console.error("Cart parsing error, resetting cart");
    localStorage.removeItem('svvlk-cart');
}

function saveCart() {
    localStorage.setItem('svvlk-cart', JSON.stringify(cart));
}


// ===============================
// ADD TO CART
// ===============================

document.getElementById('products-list').addEventListener('click', function(event) {
    if (event.target.classList.contains('add-to-cart')) {
        const productCard = event.target.closest(".product-card");
        const name = productCard.dataset.name;
        const brand = productCard.dataset.brand;
        const size = productCard.dataset.size;
        const price = Number(productCard.dataset.price);

        if (price <= 0) {
            showToast("Price not added for this product yet.", "warning");
            return;
        }

        const productId = name + "-" + brand + "-" + size;
        const existingProduct = cart.find(item => item.id === productId);

        if (existingProduct) {
            existingProduct.quantity++;
        } else {
            cart.push({ id: productId, name, brand, size, price, quantity: 1 });
        }

        updateCart();
        showToast(brand + " " + name + " added to cart!", "success");
    }
});


// ===============================
// UPDATE CART
// ===============================

function updateCart() {

    const cartItems = document.getElementById("cart-items");
    const cartCount = document.getElementById("cart-count");
    const cartTotal = document.getElementById("cart-total");

    cartItems.innerHTML = "";

    let total = 0;
    let totalItems = 0;


    // Empty cart

    if (cart.length === 0) {

        cartItems.innerHTML = "<p>Your cart is empty.</p>";

        cartCount.textContent = "0";
        const floatingCount = document.getElementById("floating-cart-count");
        if (floatingCount) floatingCount.textContent = "0";
        cartTotal.textContent = "0";

        if (document.getElementById("proceed-checkout")) {
            document.getElementById("proceed-checkout").style.display = "none";
        }
        saveCart();
        return;
    }


    // Display products

    cart.forEach(function(item, index) {

        const itemTotal = item.price * item.quantity;

        total += itemTotal;
        totalItems += item.quantity;


        const cartItem = document.createElement("div");

        cartItem.className = "cart-item";


        cartItem.innerHTML = `
            <div>
                <h3>${item.brand} ${item.name}</h3>
                <p>Size: ${item.size}</p>
                <p>Price: ₹${item.price.toLocaleString("en-IN")}</p>
            </div>

            <div>

                <button onclick="decreaseQuantity(${index})">
                    −
                </button>

                <span>
                    ${item.quantity}
                </span>

                <button onclick="increaseQuantity(${index})">
                    +
                </button>

            </div>

            <div>

                <p>
                    ₹${itemTotal.toLocaleString("en-IN")}
                </p>

                <button onclick="removeItem(${index})">
                    <svg class='icon' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><polyline points='3 6 5 6 21 6'></polyline><path d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'></path><line x1='10' y1='11' x2='10' y2='17'></line><line x1='14' y1='11' x2='14' y2='17'></line></svg> Remove
                </button>

            </div>
        `;


        cartItems.appendChild(cartItem);

    });


    cartCount.textContent = totalItems;
    const floatingCount = document.getElementById("floating-cart-count");
    if (floatingCount) floatingCount.textContent = totalItems;

        cartTotal.textContent = total.toLocaleString("en-IN");

    // Auto-fill UPI amount (Must be raw number, no commas, strictly for UPI apps)
    const upiBtn = document.getElementById("upi-pay-btn");
    if (upiBtn) {
        upiBtn.href = "upi://pay?pa=7569898179@ybl&pn=SVVLK%20Traders&cu=INR&am=" + Number(total).toFixed(2);
    }

    if (document.getElementById("proceed-checkout")) {
        document.getElementById("proceed-checkout").style.display = "inline-block";
    }

    saveCart();
}


// ===============================
// INCREASE QUANTITY
// ===============================

function increaseQuantity(index) {

    cart[index].quantity++;

    updateCart();

}


// ===============================
// DECREASE QUANTITY
// ===============================

function decreaseQuantity(index) {

    if (cart[index].quantity > 1) {

        cart[index].quantity--;

    } else {

        cart.splice(index, 1);

    }

    updateCart();

}


// ===============================
// REMOVE PRODUCT
// ===============================

function removeItem(index) {

    cart.splice(index, 1);

    updateCart();

}


// ===============================
// SEARCH
// ===============================

const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");


// Search when button is clicked

searchButton.addEventListener("click", function() {

    searchProducts();

});


// Search when typing

searchInput.addEventListener("input", function() {

    searchProducts();

});


function searchProducts() {

    const searchText =
        searchInput.value.toLowerCase().trim();

    const products =
        document.querySelectorAll(".product-card");


    products.forEach(function(product) {

        const productText =
            product.textContent.toLowerCase();

        if (productText.includes(searchText)) {

            product.style.display = "";

        } else {

            product.style.display = "none";

        }

    });

}


// ===============================
// SHOP NOW BUTTON
// ===============================

const shopNow = document.getElementById("shop-now");

if (shopNow) {

    shopNow.addEventListener("click", function() {

        document.getElementById("products").scrollIntoView({
            behavior: "smooth"
        });

    });

}


// ===============================
// INITIAL CART
// ===============================

updateCart();
// ===============================
// CATEGORY FILTER
// ===============================

const categoryButtons = document.querySelectorAll(".category-filter");
categoryButtons.forEach(button => {
    button.addEventListener("click", () => {
        const selectedCategory = button.dataset.category;
        const allProducts = document.querySelectorAll(".product-card");
        
        allProducts.forEach(product => {
            if (selectedCategory === "all" || product.dataset.category === selectedCategory) {
                product.style.display = "";
            } else {
                product.style.display = "none";
            }
        });
    });
});


// ===============================
// CHECKOUT
// ===============================

const checkoutForm =
    document.getElementById("checkout-form");

checkoutForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    if (!currentUser) {
        showToast("You must be logged in to place an order. Please log in first.", "warning");
        document.getElementById("auth-modal").style.display = "flex";
        return;
    }

    event.preventDefault();

    if (cart.length === 0) {
        showToast("Your cart is empty!", "warning");
        return;
    }

    const customerName =
        document.getElementById("customer-name").value;

    const customerPhone = document.getElementById("customer-phone").value;

    if (!/^[6-9]\d{9}$/.test(customerPhone.replace(/\D/g, ""))) {
        showToast("Please enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9).", "warning");
        return;
    }

    const customerAddress =
        document.getElementById("customer-address").value;

        const customerCity = document.getElementById("customer-city").value;
    if (!customerCity) {
        showToast("Please select a delivery location.", "warning");
        return;
    }

    // Validate Bulk Locations (NAD, Gopalapatnam)
    const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    if ((customerCity === "NAD" || customerCity === "Gopalapatnam") && totalItemsCount < 5) {
        showToast("Delivery to " + customerCity + " requires a bulk order of at least 5 bags/items.", "warning");
        return;
    }

    const deliveryTime = document.getElementById("delivery-time").value;


                const totalAmount = document.getElementById("cart-total").textContent;

    const paymentMethod = document.getElementById("payment-method").value;
    if (!paymentMethod) {
        showToast("Please select a payment method", "warning");
        return;
    }

    // Show Processing Animation
    const paymentOverlay = document.getElementById("payment-overlay");
    if (paymentOverlay) {
        paymentOverlay.style.display = "flex";
        if (paymentMethod === "COD") {
            paymentOverlay.querySelector("h3").textContent = "Confirming Order...";
            paymentOverlay.querySelector("p").textContent = "Preparing for Cash on Delivery";
        } else {
            paymentOverlay.querySelector("h3").textContent = "Verifying UTR...";
            paymentOverlay.querySelector("p").textContent = "Checking transaction ID " + document.getElementById("utr-number").value;
        }
    }
    
    // Simulate 2.5 second bank processing delay
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
        const { error } = await supabaseClient
            .from('orders')
            .insert([
                {
                                        order_id: "ORD-" + Date.now(),
                    user_id: currentUser.id,
                    customer_name: customerName,
                    customer_phone: customerPhone,
                    customer_address: customerAddress,
                    customer_city: customerCity,
                    payment_method: paymentMethod,
                    utr_number: document.getElementById("utr-number") ? document.getElementById("utr-number").value : null,
                    total_amount: Number(totalAmount.replace(/,/g, '')),
                    items: cart
                }
            ]);

        if (error) throw error;

    } catch (err) {
        console.error("Supabase Error:", err);
        if (paymentOverlay) paymentOverlay.style.display = "none";
        showToast("Error saving order: " + err.message, "warning");
        return; // STOP execution so it doesn't say success!
    }

    if (paymentOverlay) paymentOverlay.style.display = "none";

        // Show Premium Success Overlay
    const successOverlay = document.getElementById("order-success-overlay");
    if (successOverlay) {
        document.getElementById("success-order-id").textContent = "#ORD-" + Date.now();
        document.getElementById("success-order-total").textContent = "₹" + Number(totalAmount.replace(/,/g, '')).toLocaleString("en-IN");
        
        successOverlay.style.display = "flex";
        // trigger reflow
        void successOverlay.offsetWidth;
        successOverlay.classList.add("active");
    } else {
        showToast("Order placed successfully!", "success");
    }

    cart = [];
    updateCart();
    checkoutForm.reset();
    document.getElementById("checkout").style.display = "none";

});



// ===============================
// TOAST NOTIFICATIONS
// ===============================

const toastCheckIcon = `<svg class='icon' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><path d='M22 11.08V12a10 10 0 1 1-5.93-9.14'></path><polyline points='22 4 12 14.01 9 11.01'></polyline></svg>`;
const toastWarnIcon = `<svg class='icon' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><circle cx='12' cy='12' r='10'></circle><line x1='12' y1='8' x2='12' y2='12'></line><line x1='12' y1='16' x2='12.01' y2='16'></line></svg>`;

const toastContainer = document.createElement('div');
toastContainer.id = 'toast-container';
document.body.appendChild(toastContainer);

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    const icon = type === 'success' ? toastCheckIcon : toastWarnIcon;
    toast.innerHTML = icon + message;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ===============================
// PROCEED TO CHECKOUT BUTTON
// ===============================

const proceedCheckoutBtn = document.getElementById("proceed-checkout");

if (proceedCheckoutBtn) {
    proceedCheckoutBtn.addEventListener("click", function() {
        document.getElementById("checkout").scrollIntoView({
            behavior: "smooth"
        });
        
        setTimeout(() => {
            document.getElementById("customer-name").focus();
        }, 600);
    });
}

// ===============================
// FETCH PRODUCTS FROM SUPABASE
// ===============================
async function loadProducts() {
    const productsList = document.getElementById('products-list');
    if (!productsList) return;

    try {
        const { data: products, error } = await supabaseClient
            .from('products')
            .select('*');

        if (error) throw error;


        productsList.innerHTML = ''; 

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.dataset.category = product.category;
            card.dataset.name = product.name;
            card.dataset.brand = product.brand;
            card.dataset.size = product.size;
            card.dataset.price = product.price;

                        let btnHtml = '<button class="add-to-cart">Add to Cart</button>';
            if (product.is_in_stock === false) {
                btnHtml = '<button disabled style="background: #95a5a6; cursor: not-allowed;">Out of Stock</button>';
                card.style.opacity = '0.6';
            }

            card.innerHTML = 
                '<img src="' + (product.image_url || 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=400&q=80') + '" alt="' + product.name + '">' +
                '<h3>' + product.brand + '</h3>' +
                '<p>' + product.name + ' - ' + product.size + '</p>' +
                '<p>₹' + Number(product.price).toLocaleString("en-IN") + '</p>' +
                btnHtml;

            productsList.appendChild(card);
        });

    } catch (err) {
        console.error("Error loading products:", err);
        productsList.innerHTML = '<p style="color:red; font-weight:bold;">Error loading products. Make sure your Supabase table is created and RLS is disabled.</p>';
    }
}

// Call on load
checkMaintenanceMode().then((isMaintenance) => {
    if (!isMaintenance) {
        loadProducts();
    }
});
// ===============================
// AUTHENTICATION
// ===============================

let isSignUp = false;
let currentUser = null;

const authModal = document.getElementById("auth-modal");
const loginBtn = document.getElementById("login-btn");
const closeAuth = document.getElementById("close-auth");
const authForm = document.getElementById("auth-form");
const authTitle = document.getElementById("auth-title");
const authSubmit = document.getElementById("auth-submit");
const authToggleText = document.getElementById("auth-toggle-text");



loginBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (currentUser) {
        supabaseClient.auth.signOut().then(() => {
            showToast("Logged out successfully");
            updateAuthState();
        });
    } else {
        authModal.style.display = "flex";
    }
});

closeAuth.addEventListener("click", () => {
    authModal.style.display = "none";
});

authForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("auth-email").value;
    const password = document.getElementById("auth-password").value;
    
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) throw error;

        showToast("Logged in successfully!", "success");
        authModal.style.display = "none";
        updateAuthState();
    } catch (err) {
        showToast(err.message, "warning");
    }
});

async function updateAuthState() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    currentUser = session?.user || null;
    
    if (currentUser) {
        // --- 15-DAY INACTIVITY CHECK ---
        try {
            const { data: latestOrder } = await supabaseClient
                .from("orders")
                .select("created_at")
                .eq("user_id", currentUser.id)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();
                
            if (latestOrder) {
                const orderDate = new Date(latestOrder.created_at);
                const now = new Date();
                const diffTime = Math.abs(now - orderDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                
                                                // Give a 24-hour grace period if the Proprietor just reset their password
                const accountUpdatedDate = new Date(currentUser.updated_at);
                const diffUpdateDays = Math.ceil(Math.abs(now - accountUpdatedDate) / (1000 * 60 * 60 * 24));

                                                const vipEmails = [
                    'vvramu9441@gmail.com',
                    'meghan4167@gmail.com',
                    'svvlktraders@gmail.com',
                    'venkatasunitha85@gmail.com'
                ];
                const isAdmin = currentUser && currentUser.email ? vipEmails.includes(currentUser.email.toLowerCase()) : false;
                
                                if (!isAdmin && diffDays > 15 && diffUpdateDays > 1) {
                    // Scramble their password so they are completely locked out
                    const scrambledPassword = "LOCKED-" + Math.floor(Math.random() * 1000000000) + "-SVVLK";
                    await supabaseClient.auth.updateUser({ password: scrambledPassword });
                    
                    // Log them out
                    await supabaseClient.auth.signOut();
                    currentUser = null;
                    showToast("Your session expired due to 15 days of inactivity. Please log in again.", "warning");
                    setTimeout(() => {
                        const authModal = document.getElementById("auth-modal");
                        if (authModal) authModal.style.display = "flex";
                    }, 1500);
                }
            }
        } catch (err) {
            console.error("Error checking inactivity timeout:", err);
        }
    }

        if (currentUser) {
        // Reveal store if they just logged in from the gate
        const storeContent = document.getElementById("store-content");
        const loginGate = document.getElementById("login-gate");
        if (storeContent && loginGate) {
            storeContent.style.display = "block";
            loginGate.style.display = "none";
        }

        loginBtn.innerHTML = "Logout";
        
        if (document.getElementById("my-profile-btn")) document.getElementById("my-profile-btn").style.display = "inline-block";
        
        // Auto-fill checkout form
        supabaseClient.from("profiles").select("*").eq("id", currentUser.id).maybeSingle().then(({data}) => {
            if (data) {
                document.getElementById("customer-name").value = data.full_name || "";
                document.getElementById("customer-phone").value = data.phone || "";
                document.getElementById("customer-address").value = data.address || "";
                document.getElementById("customer-city").value = data.city || "";
            }
        });
        
        const nameInput = document.getElementById("customer-name");
        if (nameInput && !nameInput.value) {
            const googleName = currentUser.user_metadata?.full_name || currentUser.user_metadata?.name;
            if (googleName) {
                nameInput.value = googleName;
            } else if (currentUser.email) {
                nameInput.value = currentUser.email.split('@')[0];
            }
        }
    } else {
        loginBtn.innerHTML = "Login";
        
        
        // Clear auto-filled name on logout if we want, but usually it's fine to leave it.
    }
}

updateAuthState();

// ===============================
// MY ORDERS HISTORY
// ===============================

const myOrdersBtn = document.getElementById("profile-view-orders-btn");
const ordersModal = document.getElementById("orders-modal");
const closeOrders = document.getElementById("close-orders");
const ordersList = document.getElementById("orders-list");

if (myOrdersBtn) {
    myOrdersBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        
        // Hide profile modal when opening orders modal
        const profModal = document.getElementById("profile-modal");
        if (profModal) profModal.style.display = "none";

        ordersModal.style.display = "flex";
        ordersList.innerHTML = "<p>Loading your past orders...</p>";

        try {
            const { data, error } = await supabaseClient
                .from('orders')
                .select('*')
                .order('order_id', { ascending: false });

            if (error) throw error;


            if (!data || data.length === 0) {
                ordersList.innerHTML = "<p>You haven't placed any orders yet!</p>";
                return;
            }

            ordersList.innerHTML = "";
            data.forEach(order => {
                const card = document.createElement("div");
                card.className = "order-history-card";
                
                // Format items safely
                let itemsText = "Items: ";
                if (order.items && Array.isArray(order.items)) {
                    itemsText += order.items.map(item => item.quantity + "x " + item.brand + " " + item.name).join(", ");
                } else {
                    itemsText += "Details unavailable";
                }

                let statusClass = "status-pending";
                let statusText = order.status || "Pending";
                if (statusText.toLowerCase() === "shipped") statusClass = "status-shipped";
                if (statusText.toLowerCase() === "delivered") statusClass = "status-delivered";

                                let step = 1;
                if (statusText.toLowerCase() === "shipped") step = 2;
                if (statusText.toLowerCase() === "delivered") step = 3;

                card.innerHTML = `
                    <div class="order-history-header">
                        <div>
                            <span class="order-history-id">Order #${escapeHTML(order.order_id)}</span>
                        </div>
                        <span class="order-history-amount">₹${Number(order.total_amount).toLocaleString("en-IN")}</span>
                    </div>
                    
                    <div class="tracking-wrapper">
                        <div class="track-step ${step >= 1 ? "active" : ""}">
                            <div class="track-dot"></div>
                            <div class="track-label">Placed</div>
                        </div>
                        <div class="track-line ${step >= 2 ? "active" : ""}"></div>
                        <div class="track-step ${step >= 2 ? "active" : ""}">
                            <div class="track-dot"></div>
                            <div class="track-label">Packed</div>
                        </div>
                        <div class="track-line ${step >= 3 ? "active" : ""}"></div>
                        <div class="track-step ${step >= 3 ? "active" : ""}">
                            <div class="track-dot"></div>
                            <div class="track-label">Delivered</div>
                        </div>
                    </div>

                    <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 8px;">Delivered to: ${escapeHTML(order.customer_address)}</div>
                    <div class="order-history-items" style="font-size: 13px;">${escapeHTML(itemsText)}</div>`;

                ordersList.appendChild(card);
            });

        } catch (err) {
            console.error("Error fetching orders:", err);
            ordersList.innerHTML = "<p style='color:red;'>Failed to load orders.</p>";
        }
    });
}

if (closeOrders) {
    closeOrders.addEventListener("click", () => {
        ordersModal.style.display = "none";
    });
}

// ===============================
// USER PROFILE LOGIC
// ===============================
const navProfileBtn = document.getElementById("my-profile-btn");
const profileModal = document.getElementById("profile-modal");
const closeProfileBtn = document.querySelector(".close-profile-modal");
const profileForm = document.getElementById("profile-form");

if (navProfileBtn && profileModal) {
    navProfileBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        profileModal.style.display = "flex";
        
        // Load existing profile data
        if (currentUser) {
            const { data } = await supabaseClient.from("profiles").select("*").eq("id", currentUser.id).maybeSingle();
            if (data) {
                document.getElementById("prof-name").value = data.full_name || "";
                document.getElementById("prof-phone").value = data.phone || "";
                document.getElementById("prof-address").value = data.address || "";
                document.getElementById("prof-city").value = data.city || "";
            }
        }
    });

    closeProfileBtn.addEventListener("click", () => {
        profileModal.style.display = "none";
    });

    profileForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!currentUser) return;

        const profileData = {
            id: currentUser.id,
            full_name: document.getElementById("prof-name").value,
            phone: document.getElementById("prof-phone").value,
            address: document.getElementById("prof-address").value,
            city: document.getElementById("prof-city").value
        };

        const { error } = await supabaseClient.from("profiles").upsert([profileData]);
        if (error) {
            showToast("Error saving profile: " + error.message, "warning");
        } else {
            showToast("Profile saved successfully!", "success");
            profileModal.style.display = "none";
            
            // Auto-fill checkout form immediately
            document.getElementById("customer-name").value = profileData.full_name;
            document.getElementById("customer-phone").value = profileData.phone;
            document.getElementById("customer-address").value = profileData.address;
            document.getElementById("customer-city").value = profileData.city;
        }
    });
}

// ===============================
// PWA SERVICE WORKER (App Installation)
// ===============================
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').then(() => {
    console.log("Service Worker Registered");
  });
}

// Order Success Overlay Listeners
document.addEventListener("DOMContentLoaded", () => {
    const successOverlay = document.getElementById("order-success-overlay");
    const trackBtn = document.getElementById("success-track-btn");
    const continueBtn = document.getElementById("success-continue-btn");

    if (continueBtn) {
        continueBtn.addEventListener("click", () => {
            successOverlay.classList.remove("active");
            setTimeout(() => {
                successOverlay.style.display = "none";
                document.getElementById('products').scrollIntoView({behavior: 'smooth'});
            }, 500);
        });
    }

    if (trackBtn) {
        trackBtn.addEventListener("click", () => {
            successOverlay.classList.remove("active");
            setTimeout(() => {
                successOverlay.style.display = "none";
                const myOrdersBtn = document.getElementById("profile-view-orders-btn");
                if (myOrdersBtn) {
                    // Open Profile/Orders Modal
                    const profModal = document.getElementById("profile-modal");
                    if (profModal) profModal.style.display = "none";
                    
                    const ordersModal = document.getElementById("orders-modal");
                    if (ordersModal) ordersModal.style.display = "flex";
                    
                    myOrdersBtn.click();
                }
            }, 500);
        });
    }
});

// WhatsApp Password Request Logic
document.addEventListener("DOMContentLoaded", () => {
    const showRequestForm = document.getElementById("show-request-form");
    const requestForm = document.getElementById("request-access-form");
    const sendRequestBtn = document.getElementById("send-request-btn");

    if (showRequestForm && requestForm) {
        showRequestForm.addEventListener("click", (e) => {
            e.preventDefault();
            requestForm.style.display = requestForm.style.display === "none" ? "block" : "none";
        });
    }

    if (sendRequestBtn) {
        sendRequestBtn.addEventListener("click", () => {
            const email = document.getElementById("request-email").value.trim();
            if (!email || !email.includes("@")) {
                showToast("Please enter a valid Email ID", "warning");
                return;
            }
            const text = "Hi Proprietor! I would like to register for an account at SVVLK Traders. My Email ID is: " + email;
                        const waLink = "https://wa.me/919441825349?text=" + encodeURIComponent(text);
            
            // Try saving to DB silently
                        const generatedPassword = "SVVLK" + Math.floor(1000 + Math.random() * 9000);
            
            // Try saving to DB silently
            supabaseClient.from('access_requests').insert([{ email: email, password: generatedPassword }]).then(({error}) => {
                if (error) console.error("Could not save request to DB:", error);
                
                // Open WhatsApp regardless
                window.open(waLink, "_blank");
                
                // Clear the form
                document.getElementById("request-email").value = "";
                requestForm.style.display = "none";
            });
        });
    }
});

// ===============================
// LOGIN GATE LOGIC
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    const gateForm = document.getElementById("gate-auth-form");
    if (gateForm) {
        gateForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("gate-email").value;
            const password = document.getElementById("gate-password").value;
            
            try {
                const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
                if (error) throw error;
        
                showToast("Logged in successfully!", "success");
                updateAuthState();
            } catch (err) {
                showToast(err.message, "warning");
            }
        });
    }

    const gateRequestBtn = document.getElementById("gate-request-btn");
    const gateRequestForm = document.getElementById("gate-request-form");
    if (gateRequestBtn && gateRequestForm) {
        gateRequestBtn.addEventListener("click", (e) => {
            e.preventDefault();
            gateRequestForm.style.display = gateRequestForm.style.display === "none" ? "block" : "none";
        });
    }

    const gateSendBtn = document.getElementById("gate-send-request");
    if (gateSendBtn) {
        gateSendBtn.addEventListener("click", () => {
            const email = document.getElementById("gate-request-email").value.trim();
            if (!email || !email.includes("@")) {
                showToast("Please enter a valid Email ID", "warning");
                return;
            }
            const text = "Hi Proprietor! I would like to register for an account at SVVLK Traders. My Email ID is: " + email;
            const waLink = "https://wa.me/919441825349?text=" + encodeURIComponent(text);
            
            supabaseClient.from('access_requests').insert([{ email: email }]).then(() => {
                window.open(waLink, "_blank");
                document.getElementById("gate-request-email").value = "";
                gateRequestForm.style.display = "none";
            });
        });
    }
});
window.openProductModal = function(product) {
    document.getElementById('pm-image').src = product.image_url || 'https://via.placeholder.com/400?text=SVVLK';
    document.getElementById('pm-brand').innerText = product.brand;
    document.getElementById('pm-title').innerText = product.name;
    document.getElementById('pm-size').innerText = product.size;
    document.getElementById('pm-price').innerText = '₹' + product.price;
    
    const btn = document.getElementById('pm-add-btn');
    btn.onclick = () => {
        addToCart(product.id, product.name, product.price);
        closeProductModal();
    };
    
    document.getElementById('product-modal').style.display = 'flex';
};

window.closeProductModal = function() {
    document.getElementById('product-modal').style.display = 'none';
};