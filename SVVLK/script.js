// ===============================
// SVVLK GROCERY CART
// ===============================

let cart = [];


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
            alert("Price not added for this product yet.");
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
                    🗑️ Remove
                </button>

            </div>
        `;


        cartItems.appendChild(cartItem);

    });


    cartCount.textContent = totalItems;

    cartTotal.textContent = total.toLocaleString("en-IN");

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
        alert("Your cart is empty!");
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
        <h3>✅ Order Placed Successfully!</h3>

        <p>Thank you, ${customerName}!</p>

        <p>📱 Mobile: ${customerPhone}</p>

        <p>📍 Delivery: ${customerAddress}, ${customerCity}</p>

        <p>
            💰 Order Total:
            ₹${document.getElementById("cart-total").textContent}
        </p>

        <p>We will contact you regarding your order.</p>
    `;


    // Clear cart

    cart = [];

    updateCart();

    checkoutForm.reset();

});