// ===============================
// SVVLK GROCERY CART
// ===============================

let cart = JSON.parse(localStorage.getItem('svvlk-cart')) || [];

function saveCart() {
    localStorage.setItem('svvlk-cart', JSON.stringify(cart));
}


// ===============================
// ADD TO CART
// ===============================

const addButtons = document.querySelectorAll(".add-to-cart");

addButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        const productCard = button.closest(".product-card");

        const name = productCard.dataset.name;
        const brand = productCard.dataset.brand;
        const size = productCard.dataset.size;
        const price = Number(productCard.dataset.price);

        // Don't allow products with ₹0
        if (price <= 0) {
            showToast("Price not added for this product yet.", "warning");
            return;
        }

        const productId = name + "-" + brand + "-" + size;

        const existingProduct = cart.find(function(item) {
            return item.id === productId;
        });

        if (existingProduct) {

            existingProduct.quantity++;

        } else {

            cart.push({
                id: productId,
                name: name,
                brand: brand,
                size: size,
                price: price,
                quantity: 1
            });

        }

        updateCart();
        showToast("" + brand + " " + name + " added to cart!", "success");

    });

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

const categoryButtons =
    document.querySelectorAll(".category-filter");

const allProducts =
    document.querySelectorAll(".product-card");


categoryButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        const selectedCategory =
            button.dataset.category;

        allProducts.forEach(function(product) {

            if (
                selectedCategory === "all" ||
                product.dataset.category === selectedCategory
            ) {

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

checkoutForm.addEventListener("submit", function(event) {

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


    const orderMessage =
        document.getElementById("order-message");

    orderMessage.innerHTML = `
        <h3><svg class='icon' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><path d='M22 11.08V12a10 10 0 1 1-5.93-9.14'></path><polyline points='22 4 12 14.01 9 11.01'></polyline></svg> Order Placed Successfully!</h3>

        <p>Thank you, ${customerName}!</p>

        <p><svg class='icon' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><rect x='5' y='2' width='14' height='20' rx='2' ry='2'></rect><line x1='12' y1='18' x2='12.01' y2='18'></line></svg> Mobile: ${customerPhone}</p>

        <p><svg class='icon' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'></path><circle cx='12' cy='10' r='3'></circle></svg> Delivery: ${customerAddress}, ${customerCity}</p>

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
