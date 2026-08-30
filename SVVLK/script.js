const SUPABASE_URL = "https://vlcpdyaitetgyqiawsoj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsY3BkeWFpdGV0Z3lxaWF3c29qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5ODU1MjksImV4cCI6MjEwMzU2MTUyOX0.rYePHXoZgy68see7wNZPz0QyGR7tsM1RdTvsA6BwttU";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);
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

let cart = [];
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

    const customerPhone =
        document.getElementById("customer-phone").value;

    const customerAddress =
        document.getElementById("customer-address").value;

    const customerCity =
        document.getElementById("customer-city").value;


        const totalAmount = document.getElementById("cart-total").textContent;

    try {
        const { error } = await supabaseClient
            .from('orders')
            .insert([
                {
                                        order_id: "ORD-" + Date.now(),
                    user_id: currentUser.id,
                    customer_name: customerName,
                    customer_phone: customerPhone,
                    customer_address: customerAddress + ", " + customerCity,
                    total_amount: Number(totalAmount.replace(/,/g, '')),
                    cart_items: cart
                }
            ]);

        if (error) throw error;
    } catch (err) {
        console.error("Supabase Error:", err);
        showToast("Error saving order to database. Check console.", "warning");
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

            card.innerHTML = 
                '<img src="' + product.image_url + '" alt="' + product.name + '">' +
                '<h3>' + product.brand + '</h3>' +
                '<p>' + product.name + ' - ' + product.size + '</p>' +
                '<p>₹' + Number(product.price).toLocaleString("en-IN") + '</p>' +
                '<button class="add-to-cart">Add to Cart</button>';

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
    } else {
        loginBtn.innerHTML = "Login";
    }
}

updateAuthState();
