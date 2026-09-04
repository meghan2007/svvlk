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
                <div style="height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; background: #f4f7f6; color: #333; font-family: sans-serif; padding: 20px;">
                    <h1 style="font-size: 40px; color: #e74c3c; margin-bottom: 20px;">🚧 Under Maintenance</h1>
                    <p style="font-size: 18px; max-width: 600px; line-height: 1.6;">SVVLK Groceries is currently upgrading our systems to serve you better. We will be back online shortly. Please check back in a few minutes!</p>
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
    await new Promise(resolve => setTimeout(resolve, 2500));

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

        showToast("Error saving order: " + err.message, "warning");
        return; // STOP execution so it doesn't say success!
    }

    const orderMessage =
        document.getElementById("order-message");

    orderMessage.innerHTML = `
        <h3><svg class='icon' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><path d='M22 11.08V12a10 10 0 1 1-5.93-9.14'></path><polyline points='22 4 12 14.01 9 11.01'></polyline></svg> Order Placed Successfully!</h3>

        <p>Thank you, ${escapeHTML(customerName)}!</p>

        <p><svg class='icon' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><rect x='5' y='2' width='14' height='20' rx='2' ry='2'></rect><line x1='12' y1='18' x2='12.01' y2='18'></line></svg> Mobile: ${escapeHTML(customerPhone)}</p>

        <p><svg class='icon' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'></path><circle cx='12' cy='10' r='3'></circle></svg> Delivery: ${escapeHTML(customerAddress)}, ${escapeHTML(customerCity)}</p>

        <p>
            <svg class='icon' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><circle cx='12' cy='12' r='10'></circle><path d='M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8'></path><path d='M12 18V6'></path></svg> Order Total:
            ₹${document.getElementById("cart-total").textContent}
        </p>

        <p>We will contact you regarding your order.</p>
    `;


    // Clear cart

    cart = [];

    updateCart();

    checkoutForm.reset();

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
                '<p>? ' + Number(product.price).toLocaleString("en-IN") + '</p>' +
                btnHtml;

            productsList.appendChild(card);
        });

    } catch (err) {
        console.error("Error loading products:", err);
        productsList.innerHTML = '<p style="color:red; font-weight:bold;">Error loading products. Make sure your Supabase table is created and RLS is disabled.</p>';
    }
}

// Call on load
loadProducts();
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

function handleToggle(e) {
    e.preventDefault();
    isSignUp = !isSignUp;
    authTitle.textContent = isSignUp ? "Sign Up for SVVLK" : "Login to SVVLK";
    authSubmit.textContent = isSignUp ? "Sign Up" : "Login";
    authToggleText.innerHTML = isSignUp 
        ? 'Already have an account? <a href="#" id="auth-toggle-link">Login</a>' 
        : 'Don\'t have an account? <a href="#" id="auth-toggle-link">Sign up</a>';
    
    document.getElementById("auth-toggle-link").addEventListener("click", handleToggle);
}

document.getElementById("auth-toggle-link").addEventListener("click", handleToggle);

// Google OAuth
const googleBtn = document.getElementById("auth-google-btn");
if (googleBtn) {
    googleBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        googleBtn.innerHTML = "Redirecting to Google...";
        googleBtn.style.opacity = "0.5";
        try {
            const { data, error } = await supabaseClient.auth.signInWithOAuth({
                provider: 'google',
                
            });
            if (error) throw error;

        } catch (err) {
            showToast(err.message, "warning");
        }
    });
}

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
        if (isSignUp) {
            const { data, error } = await supabaseClient.auth.signUp({ email, password });
            if (error) throw error;

            showToast("Signup successful! You can now log in.", "success");
            
            // Switch back to login mode automatically
            document.getElementById("auth-password").value = '';
            document.getElementById("auth-toggle-link").click(); 
        } else {
            const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
            if (error) throw error;

            showToast("Logged in successfully!", "success");
            authModal.style.display = "none";
            updateAuthState();
        }
    } catch (err) {
        showToast(err.message, "warning");
    }
});

async function updateAuthState() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    currentUser = session?.user || null;
    
    if (currentUser) {
        loginBtn.innerHTML = "Logout";
        if (document.getElementById("my-orders-btn")) document.getElementById("my-orders-btn").style.display = "inline-block";
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
        if (document.getElementById("my-orders-btn")) document.getElementById("my-orders-btn").style.display = "none";
        
        // Clear auto-filled name on logout if we want, but usually it's fine to leave it.
    }
}

updateAuthState();

// ===============================
// MY ORDERS HISTORY
// ===============================

const myOrdersBtn = document.getElementById("my-orders-btn");
const ordersModal = document.getElementById("orders-modal");
const closeOrders = document.getElementById("close-orders");
const ordersList = document.getElementById("orders-list");

if (myOrdersBtn) {
    myOrdersBtn.addEventListener("click", async (e) => {
        e.preventDefault();
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

                card.innerHTML = 
                    `<div class="order-history-header">
                        <div>
                            <span class="order-history-id">${escapeHTML(order.order_id)}</span>
                            <span class="order-status-badge ${statusClass}">${escapeHTML(statusText)}</span>
                        </div>
                        <span class="order-history-amount">₹${Number(order.total_amount).toLocaleString("en-IN")}</span>
                    </div>
                    <div>Delivered to: ${escapeHTML(order.customer_address)}</div>
                    <div class="order-history-items">${escapeHTML(itemsText)}</div>`;

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
