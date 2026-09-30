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
        const { data } = await supabaseClient.from('store_settings').select('*').eq('id', 1).single();
        if (data) {
            if (data.banner_text && data.banner_text.trim() !== "") {
                const bContainer = document.getElementById('store-banner-container');
                const bText = document.getElementById('store-banner-text');
                if (bContainer && bText) {
                    bText.innerText = "🚀 " + data.banner_text + " 🚀";
                    bContainer.style.display = 'block';
                }
            }
            
            if (data.maintenance_mode) {
                document.body.innerHTML = `<div style="height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; background: var(--bg-cream, #FBF9F6); color: var(--text-dark, #2A332C); font-family: var(--font-body, sans-serif); padding: 20px;">
                    <h1 style="font-size: 44px; font-family: var(--font-heading, serif); color: var(--primary-forest, #1A3B26); margin-bottom: 20px;">Market Closed</h1>
                    <p style="font-size: 16px; color: var(--text-muted, #5C6E61); max-width: 600px; line-height: 1.6;">We are currently curating our fresh selection and upgrading our systems. SVVLK will reopen shortly. Thank you for your patience.</p>
                </div>
                `;
                return true;
            }
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
                    delivery_time: deliveryTime,
                    payment_method: paymentMethod,
                    utr_number: document.getElementById("utr-number") ? document.getElementById("utr-number").value : null,
                    total_amount: window.checkoutFinalTotal || Number(totalAmount.replace(/,/g, '')),
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
        document.getElementById("success-order-total").textContent = "₹" + (window.checkoutFinalTotal || Number(totalAmount.replace(/,/g, ''))).toLocaleString("en-IN");
        
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

            // Check if this product is in favorites
            const favs = JSON.parse(localStorage.getItem('svvlk-favorites')) || [];
            const isFav = favs.some(f => f.name === product.name && f.brand === product.brand && f.size === product.size);
            const heartStyle = isFav ? "color: #e74c3c; font-variation-settings: 'FILL' 1;" : "color: #ccc;";

            card.innerHTML = 
                '<div style="position: relative;">' +
                    '<img src="' + (product.image_url || 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=400&q=80') + '" alt="' + product.name + '" class="product-image">' +
                    '<div class="fav-btn" data-brand="' + product.brand + '" data-name="' + product.name + '" data-size="' + product.size + '" data-price="' + product.price + '" data-img="' + (product.image_url || '') + '" style="position: absolute; top: 10px; right: 10px; background: white; border-radius: 50%; width: 32px; height: 32px; display: flex; justify-content: center; align-items: center; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.2); ' + heartStyle + ' font-size: 18px; transition: 0.2s;">' + (isFav ? '❤️' : '🤍') + '</div>' +
                '</div>' +
                '<h3 class="product-title">' + product.brand + '</h3>' +
                '<p>' + product.name + ' - ' + product.size + '</p>' +
                '<p>' + (product.b2bOriginalPriceStr || '') + '₹' + Number(product.price).toLocaleString("en-IN") + '</p>' +
                btnHtml;

            const imgEl = card.querySelector('img');
            const h3El = card.querySelector('h3');
            if (imgEl) {
                imgEl.style.cursor = 'pointer';
                imgEl.onclick = () => openProductModal(product);
            }
            if (h3El) {
                h3El.style.cursor = 'pointer';
                h3El.onclick = () => openProductModal(product);
            }

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



if (loginBtn) { loginBtn.addEventListener("click", (e) => {
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
}); }

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

        if (loginBtn) loginBtn.innerHTML = "Logout";
        
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
        if (loginBtn) loginBtn.innerHTML = "Login";
        
        
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
        document.getElementById("prof-wholesale").checked = localStorage.getItem("svvlk-is-b2b") === "true";
    });

    closeProfileBtn.addEventListener("click", () => {
        profileModal.style.display = "none";
    });

    profileForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!currentUser) return;

        const isB2B = document.getElementById("prof-wholesale").checked;
        localStorage.getItem("svvlk-is-b2b") !== (isB2B ? "true" : "false") && localStorage.setItem("svvlk-is-b2b", isB2B ? "true" : "false");
        if(typeof updateB2BUI === "function") updateB2BUI();
        if (typeof loadProducts === "function") loadProducts();

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
        // Find existing cart logic or just add directly
        const cartItem = cart.find(i => i.name === product.name && i.size === product.size);
        if (cartItem) {
            cartItem.quantity++;
        } else {
            cart.push({
                name: product.name,
                brand: product.brand,
                size: product.size,
                price: Number(product.price),
                quantity: 1
            });
        }
        updateCart();
        showToast(product.name + " added to cart", "success");
        closeProductModal();
    };
    
    document.getElementById('product-modal').style.display = 'flex';
};

window.closeProductModal = function() {
    document.getElementById('product-modal').style.display = 'none';
};
// ===============================
// PWA INSTALL BANNER
// ===============================
let deferredPrompt;
const installBanner = document.getElementById("pwa-install-banner");
const installBtn = document.getElementById("pwa-install-btn");
const closeInstallBtn = document.getElementById("pwa-close-btn");

window.addEventListener("beforeinstallprompt", (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    // Update UI notify the user they can add to home screen
    if (installBanner) {
        installBanner.style.display = "flex";
    }
});

if (installBtn) {
    installBtn.addEventListener("click", async () => {
        if (installBanner) installBanner.style.display = "none";
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log("User response to the install prompt: " + outcome);
            deferredPrompt = null;
        }
    });
}

if (closeInstallBtn) {
    closeInstallBtn.addEventListener("click", () => {
        if (installBanner) installBanner.style.display = "none";
    });
}
// ===============================
// PINCODE CHECKER
// ===============================
const pincodeBtn = document.getElementById('pincode-check-btn');
const pincodeInput = document.getElementById('pincode-input');
const pincodeResult = document.getElementById('pincode-result');

if (pincodeBtn && pincodeInput && pincodeResult) {
    // Valid pincodes for Visakhapatnam delivery areas
    const validPincodes = ['530018', '530008', '530024', '530007', '530016', '530009', '530027'];

    pincodeBtn.addEventListener('click', () => {
        const enteredPin = pincodeInput.value.trim();
        
        pincodeResult.style.display = 'block';
        
        if (!/^\d{6}$/.test(enteredPin)) {
            pincodeResult.textContent = 'Please enter a valid 6-digit Pincode.';
            pincodeResult.style.color = '#e74c3c';
            pincodeResult.style.backgroundColor = '#fdeaea';
            return;
        }

        if (validPincodes.includes(enteredPin)) {
            pincodeResult.textContent = '🎉 Great news! We deliver to ' + enteredPin + '. Delivery within 2 hours.';
            pincodeResult.style.color = '#27ae60';
            pincodeResult.style.backgroundColor = '#eafaf1';
        } else {
            pincodeResult.textContent = 'Sorry, we do not currently deliver to ' + enteredPin + '. Please contact the proprietor for bulk orders.';
            pincodeResult.style.color = '#e67e22';
            pincodeResult.style.backgroundColor = '#fdf2e9';
        }
    });

    // Check on Enter key press
    pincodeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            pincodeBtn.click();
        }
    });
}


// ===============================
// PRODUCT MODAL LOGIC FIX
// ===============================
const productModal = document.getElementById('product-modal');
const closePmBtn = document.getElementById('close-pm');

if (closePmBtn) {
    closePmBtn.addEventListener('click', () => {
        if (productModal) productModal.style.display = 'none';
    });
}

// Ensure clicking outside the modal content closes it
if (productModal) {
    productModal.addEventListener('click', (e) => {
        if (e.target === productModal) {
            productModal.style.display = 'none';
        }
    });
}

// Override the existing openProductModal to ensure it displays the modal
const originalOpenProductModal = window.openProductModal;
window.openProductModal = function(product) {
    if (originalOpenProductModal) {
        originalOpenProductModal(product); // Call original to set data
    }
    // Now explicitly show it
    if (productModal) {
        productModal.style.display = 'flex';
    }
};


// ===============================
// FAVORITES / WATCHLIST LOGIC
// ===============================
const favIcon = document.getElementById('fav-icon');
const favCount = document.getElementById('fav-count');
const favModal = document.getElementById('favorites-modal');
const closeFavModal = document.getElementById('close-favorites');
const favListContainer = document.getElementById('favorites-list-container');

let favorites = JSON.parse(localStorage.getItem('svvlk-favorites')) || [];

function updateFavCount() {
    if (favCount) {
        favCount.textContent = favorites.length;
    }
}

function saveFavorites() {
    localStorage.setItem('svvlk-favorites', JSON.stringify(favorites));
    updateFavCount();
}

function renderFavorites() {
    if (!favListContainer) return;
    favListContainer.innerHTML = '';
    
    if (favorites.length === 0) {
        favListContainer.innerHTML = '<p style="color: var(--text-muted); font-style: italic;">No favorites saved yet. Click the heart icon on products to save them for later!</p>';
        return;
    }

    favorites.forEach((item, index) => {
        const card = document.createElement('div');
        card.style = 'border: 1px solid #eee; border-radius: 8px; padding: 10px; text-align: center; position: relative;';
        
        card.innerHTML = 
            '<div onclick="removeFavorite(' + index + ')" style="position: absolute; top: 5px; right: 5px; cursor: pointer; color: #e74c3c; font-size: 18px;">✖</div>' +
            '<img src="' + (item.img || 'https://via.placeholder.com/400?text=SVVLK') + '" style="width: 100%; height: 100px; object-fit: cover; border-radius: 6px; margin-bottom: 10px;">' +
            '<h4 style="font-size: 13px; margin: 0 0 5px 0; color: var(--text-dark);">' + item.brand + ' ' + item.name + '</h4>' +
            '<p style="font-size: 12px; color: var(--text-muted); margin: 0 0 5px 0;">' + item.size + '</p>' +
            '<p style="font-size: 14px; font-weight: bold; color: var(--accent-gold); margin: 0 0 10px 0;">₹' + Number(item.price).toLocaleString('en-IN') + '</p>' +
            '<button onclick="addFavToCart(' + index + ')" style="background: var(--primary-forest); color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 12px; cursor: pointer; width: 100%;">Add to Cart</button>';
        
        favListContainer.appendChild(card);
    });
}

window.removeFavorite = function(index) {
    favorites.splice(index, 1);
    saveFavorites();
    renderFavorites();
    // Re-render products to update heart icons
    if (typeof loadProducts === 'function') loadProducts();
};

window.addFavToCart = function(index) {
    const item = favorites[index];
    const productId = item.name + '-' + item.brand + '-' + item.size;
    const existingProduct = cart.find(i => i.id === productId);

    if (existingProduct) {
        existingProduct.quantity++;
    } else {
        cart.push({ id: productId, name: item.name, brand: item.brand, size: item.size, price: item.price, quantity: 1 });
    }

    updateCart();
    showToast(item.brand + ' ' + item.name + ' added to cart!', 'success');
};

if (favIcon) {
    favIcon.addEventListener('click', () => {
        renderFavorites();
        favModal.style.display = 'flex';
    });
}

if (closeFavModal) {
    closeFavModal.addEventListener('click', () => {
        favModal.style.display = 'none';
    });
}

// Close when clicking outside
if (favModal) {
    favModal.addEventListener('click', (e) => {
        if (e.target === favModal) {
            favModal.style.display = 'none';
        }
    });
}

// Global click delegation for heart icons on product cards
document.addEventListener('click', (e) => {
    const favBtn = e.target.closest('.fav-btn');
    if (favBtn) {
        e.stopPropagation();
        const brand = favBtn.dataset.brand;
        const name = favBtn.dataset.name;
        const size = favBtn.dataset.size;
        const price = Number(favBtn.dataset.price);
        const img = favBtn.dataset.img;
        
        const existingIndex = favorites.findIndex(f => f.name === name && f.brand === brand && f.size === size);
        
        if (existingIndex > -1) {
            // Remove
            favorites.splice(existingIndex, 1);
            favBtn.innerHTML = '🤍';
            favBtn.style.color = '#ccc';
            showToast('Removed from favorites', 'success');
        } else {
            // Add
            favorites.push({ brand, name, size, price, img });
            favBtn.innerHTML = '❤️';
            favBtn.style.color = '#e74c3c';
            showToast('Added to favorites!', 'success');
        }
        
        saveFavorites();
    }
});

// Init
updateFavCount();



// ===============================
// DYNAMIC DELIVERY FEE LOGIC
// ===============================
const checkoutCity = document.getElementById('customer-city');
const deliveryFeeDisplay = document.getElementById('delivery-fee-display');
const deliveryFeeAmount = document.getElementById('delivery-fee-amount');
const checkoutFinalTotalDisplay = document.getElementById('checkout-final-total-display');
const checkoutFinalAmount = document.getElementById('checkout-final-amount');

const DELIVERY_FEES = {
    'Marripalem': 20,
    'Urvasi': 30,
    'ITI Junction': 30,
    'Kancharapalem': 40,
    'Kapparada': 35,
    'Thatichetlapalem': 40,
    'NAD': 50,
    'Gopalapatnam': 60
};

// Global checkout fee state
window.currentDeliveryFee = 0;
window.checkoutFinalTotal = 0;

// Also we need to initialize checkoutFinalTotal when proceeding to checkout
const proceedBtn = document.getElementById('proceed-checkout');
if (proceedBtn) {
    proceedBtn.addEventListener('click', () => {
        const baseTotalStr = document.getElementById('cart-total').textContent.replace(/,/g, '');
        window.checkoutFinalTotal = Number(baseTotalStr) || 0;
        
        // Trigger city change if already selected
        if (checkoutCity && checkoutCity.value) {
            checkoutCity.dispatchEvent(new Event('change'));
        }
    });
}

if (checkoutCity) {
    checkoutCity.addEventListener('change', function() {
        const city = this.value;
        const fee = DELIVERY_FEES[city] || 0;
        window.currentDeliveryFee = fee;
        
        const baseTotalStr = document.getElementById('cart-total').textContent.replace(/,/g, '');
        const baseTotal = Number(baseTotalStr) || 0;
        
        window.checkoutFinalTotal = baseTotal + fee;
        
        if (fee > 0) {
            if(deliveryFeeDisplay) deliveryFeeDisplay.style.display = 'flex';
            if(deliveryFeeAmount) deliveryFeeAmount.textContent = '₹' + fee;
        } else {
            if(deliveryFeeDisplay) deliveryFeeDisplay.style.display = 'none';
        }
        
        if(checkoutFinalTotalDisplay) checkoutFinalTotalDisplay.style.display = 'flex';
        if(checkoutFinalAmount) checkoutFinalAmount.textContent = '₹' + window.checkoutFinalTotal.toLocaleString('en-IN');
        
        // Update UPI button if they choose UPI
        const upiBtn = document.getElementById('upi-pay-btn');
        if (upiBtn) {
            upiBtn.href = 'upi://pay?pa=7569898179@ybl&pn=SVVLK%20Traders&cu=INR&am=' + window.checkoutFinalTotal.toFixed(2);
        }
    });
}


// ===============================
// ABANDONED CART NUDGE
// ===============================
setTimeout(() => {
    try {
        const storedCart = JSON.parse(localStorage.getItem('svvlk-cart')) || [];
        if (storedCart.length > 0) {
            const lastNudge = localStorage.getItem('svvlk-last-nudge');
            const now = Date.now();
            
            // If never nudged, or nudged more than 4 hours ago (14400000 ms)
            if (!lastNudge || (now - Number(lastNudge)) > 14400000) { 
                
                // Show custom elegant nudge
                const nudge = document.createElement('div');
                nudge.style = 'position: fixed; bottom: 100px; left: 20px; background: white; border-left: 4px solid var(--accent-gold); padding: 15px; border-radius: 8px; box-shadow: 0 5px 20px rgba(0,0,0,0.15); z-index: 9999; display: flex; align-items: center; gap: 15px; transform: translateX(-150%); transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); max-width: 300px;';
                
                nudge.innerHTML = `
                    <div style="font-size: 24px;">🛒</div>
                    <div>
                        <h4 style="margin: 0 0 5px 0; color: var(--primary-forest); font-size: 15px;">You left items in your cart!</h4>
                        <p style="margin: 0; font-size: 13px; color: var(--text-muted);">Don't miss out on your fresh groceries.</p>
                        <a href="#cart" onclick="this.parentElement.parentElement.style.transform='translateX(-150%)';" style="display: inline-block; margin-top: 8px; font-size: 13px; font-weight: bold; color: var(--accent-gold); text-decoration: none;">View Cart &rarr;</a>
                    </div>
                    <div onclick="this.parentElement.style.transform='translateX(-150%)'" style="position: absolute; top: 5px; right: 8px; cursor: pointer; color: #aaa; font-size: 18px;">&times;</div>
                `;
                
                document.body.appendChild(nudge);
                
                // Slide in after 2.5 seconds of page load
                setTimeout(() => {
                    nudge.style.transform = 'translateX(0)';
                }, 2500);
                
                localStorage.setItem('svvlk-last-nudge', now.toString());
            }
        }
    } catch (e) {
        console.error('Cart nudge error', e);
    }
}, 1000);


// ===============================
// SMART DELIVERY SLOTS
// ===============================
function updateDeliverySlots() {
    const deliveryTimeSelect = document.getElementById('delivery-time');
    if (!deliveryTimeSelect) return;
    
    const currentHour = new Date().getHours();
    const options = deliveryTimeSelect.options;

    // Reset options
    for (let i = 1; i < options.length; i++) {
        options[i].disabled = false;
        options[i].text = options[i].text.replace(/ \(.*?\)/, ''); // Remove old warnings
    }

    // Fast Delivery (Within 2 Hours) - Disable if after 8 PM (20:00)
    if (currentHour >= 20) {
        options[1].disabled = true;
        options[1].text = 'Fast Delivery (Unavailable after 8 PM)';
    } else {
        options[1].text = 'Fast Delivery (Within 2 Hours)';
    }
    
    // Today (Evening) - Disable if after 6 PM (18:00)
    if (currentHour >= 18) {
        options[2].disabled = true;
        options[2].text = 'Today Evening (Too late to order)';
    } else {
        options[2].text = 'Today (Evening)';
    }
}

// Run on load and whenever checkout is opened
updateDeliverySlots();
if (document.getElementById('proceed-checkout')) {
    document.getElementById('proceed-checkout').addEventListener('click', updateDeliverySlots);
}


// ===============================
// B2B WHOLESALE LOGIC
// ===============================
window.updateB2BUI = function() {
    const isB2B = localStorage.getItem('svvlk-is-b2b') === 'true';
    
    let badge = document.getElementById('b2b-badge');
    if (isB2B) {
        if (!badge) {
            badge = document.createElement('div');
            badge.id = 'b2b-badge';
            badge.innerHTML = '?? B2B Mode';
            badge.className = 'b2b-badge-futuristic';
            
            // Insert into header
            const headerActions = document.querySelector('header > div:last-child');
            if (headerActions) {
                headerActions.insertBefore(badge, headerActions.firstChild);
            }
        }
    } else {
        if (badge) badge.remove();
    }
};

// Init on load
updateB2BUI();


// =========================================
// TERMINAL BOOT SEQUENCE
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    const bootScreen = document.getElementById('boot-screen');
    const bootText = document.getElementById('boot-text');
    if (bootScreen && bootText) {
        // Only show boot screen once per session to not annoy the user
        if (sessionStorage.getItem('svvlk-booted')) {
            bootScreen.style.display = 'none';
            return;
        }
        
        const lines = [
            'INITIATING SECURE CONNECTION...',
            'BYPASSING MAINFRAME FIREWALL...',
            'LOADING INVENTORY DATABASES...',
            'DECRYPTING WHOLESALE PRICING...',
            'ACCESS GRANTED. WELCOME TO SVVLK.'
        ];
        
        let delay = 0;
        lines.forEach((line, index) => {
            setTimeout(() => {
                bootText.innerHTML += line + '<br>';
                playClickSound(); // Play typing sound
            }, delay);
            delay += 400 + Math.random() * 300;
        });
        
        setTimeout(() => {
            bootScreen.style.opacity = '0';
            playBootSuccessSound();
            setTimeout(() => {
                bootScreen.style.display = 'none';
                sessionStorage.setItem('svvlk-booted', 'true');
            }, 500);
        }, delay + 500);
    }
});

// =========================================
// SCI-FI UI SOUND EFFECTS (Web Audio API)
// =========================================
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

window.playClickSound = function() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.05);
    gainNode.gain.setValueAtTime(0.02, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
};

window.playAddCartSound = function() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
};

window.playBootSuccessSound = function() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.3);
    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
};

// Attach click sound to all buttons
document.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
        if (e.target.classList.contains('add-to-cart')) {
            playAddCartSound();
        } else {
            playClickSound();
        }
    }
});

