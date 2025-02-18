// Select sidebar elements for floating and sliding behavior
const floatingSidebar = document.querySelector('.p-sidebar');
const floatingToggleButton = document.querySelector('.toggle-sidebar');
const floatingCloseButton = document.querySelector('.floating-close-btn'); // Add this line
const slidingSidebar = document.querySelector('.sidebar');
const slidingToggleButton = document.querySelector('.sidebar-toggle');
const closeSlidingButton = document.querySelector('.close-btn');
const mainContent = document.querySelector('.main-content');

// Floating Sidebar (bottom on mobile)
if (floatingSidebar && floatingToggleButton) {
    // Toggle floating sidebar visibility
    floatingToggleButton.addEventListener('click', () => {
        floatingSidebar.classList.toggle('open');
    });

    // Close floating sidebar when clicking outside
    window.addEventListener('click', (event) => {
        if (!floatingSidebar.contains(event.target) && !floatingToggleButton.contains(event.target)) {
            floatingSidebar.classList.remove('open');
        }
    });

    // Close floating sidebar when clicking the close button
    if (floatingCloseButton) {
        floatingCloseButton.addEventListener('click', () => {
            floatingSidebar.classList.remove('open');
        });
    }

    // Add touch support for drag-to-close behavior on mobile
    let startY = 0;
    let currentY = 0;

    floatingSidebar.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
        currentY = floatingSidebar.getBoundingClientRect().top;
    });

    floatingSidebar.addEventListener('touchmove', (e) => {
        const deltaY = e.touches[0].clientY - startY;
        if (deltaY > 0) { // Allow downward drag
            floatingSidebar.style.transform = `translateY(${deltaY}px)`;
        }
    });

    floatingSidebar.addEventListener('touchend', (e) => {
        const deltaY = e.changedTouches[0].clientY - startY;
        if (deltaY > 100) { // Close sidebar if dragged down far enough
            floatingSidebar.classList.remove('open');
        }
        floatingSidebar.style.transform = ''; // Reset position
    });
}

// Sliding Sidebar (from the side)
if (slidingSidebar && slidingToggleButton && closeSlidingButton) {
    // Open sliding sidebar
    slidingToggleButton.addEventListener('click', () => {
        slidingSidebar.style.left = '0'; // Show the sidebar
        if (mainContent) mainContent.style.marginLeft = '250px'; // Move main content
    });

    // Close sliding sidebar
    closeSlidingButton.addEventListener('click', () => {
        slidingSidebar.style.left = '-250px'; // Hide the sidebar
        if (mainContent) mainContent.style.marginLeft = '0'; // Reset main content
    });

    // Close sliding sidebar when clicking outside
    window.addEventListener('click', (event) => {
        if (!slidingSidebar.contains(event.target) && !slidingToggleButton.contains(event.target)) {
            slidingSidebar.style.left = '-250px';
            if (mainContent) mainContent.style.marginLeft = '0';
        }
    });
}


const supportPhone = document.getElementById('supportPhone');
const copyMessage = document.getElementById('copyMessage');

supportPhone.addEventListener('click', () => {
    const phoneNumber = supportPhone.textContent.trim();

    // Use the Clipboard API to copy the text
    navigator.clipboard.writeText(phoneNumber)
        .then(() => {
            // Show a confirmation message
            copyMessage.style.display = 'inline';
            setTimeout(() => {
                copyMessage.style.display = 'none';
            }, 2000); // Hide the message after 2 seconds
        })
        .catch((error) => {
            console.error('Failed to copy the phone number:', error);
        });
});

document.addEventListener('DOMContentLoaded', function() {
    const footerTitles = document.querySelectorAll('.footer-title');
    footerTitles.forEach(title => {
        title.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                this.classList.toggle('active');
                const links = this.nextElementSibling;
                if (links.style.display === 'block') {
                    links.style.display = 'none';
                } else {
                    links.style.display = 'block';
                }
            }
        });
    });
});


const cartIcon = document.querySelector('.cart-icon');
const cartDropdown = document.querySelector('.cart-dropdown');
const cartItemsContainer = document.querySelector('.cart-items');
const cartCount = document.querySelector('.cart-count');
const cartItemsCount = document.querySelector('.cart-items-count');
const cartTotal = document.querySelector('.cart-total');        
const clearCartBtn = document.getElementById('clearCart');

let cart = [];


async function addToCart(productId) {
    try {
        const response = await fetch('/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id: productId, quantity: 1 })
        });

        if (response.status === 401) {
            alert('You need to log in to add items to your cart.');
            window.location.href = '/login';
            return;
        }

        const data = await response.json();

        if (data.success) {
            showPopup('cart', data.product);
            loadCart();
        } else {
            showPopup('error', null, data.message);
        }
    } catch (error) {
        console.error('Error adding product to cart:', error);
        showPopup('error');
    }
}

let popupTimeout;

function showPopup(type, product = null, errorMessage = '') {
    const popup = document.getElementById('new-popup');
    const itemName = document.getElementById('itemName');
    const actionText = document.getElementById('actionText');
    const popupFooter = document.getElementById('new-popup-footer');
    const popupIcon = document.getElementById('popupIcon');
    const popupMessage = document.getElementById('popupMessage');
    const itemImage = document.getElementById('itemImage');

    if (type === 'wishlist' && product) {
        itemName.textContent = product.title;
        actionText.textContent = 'Added to wishlist';
        popupFooter.className = 'new-popup-footer wishlist';
        popupIcon.className = 'bi bi-heart-fill';
        popupMessage.textContent = 'Item added to wishlist';
        itemImage.src = product.image_url || '/placeholder.svg?height=100&width=100';
        itemImage.alt = product.title;
    } else if (type === 'cart' && product) {
        itemName.textContent = product.title;
        actionText.textContent = 'Added to cart';
        popupFooter.className = 'new-popup-footer cart';
        popupIcon.className = 'bi bi-cart3';
        popupMessage.textContent = 'Item added to cart';
        itemImage.src = product.image_url || '/placeholder.svg?height=100&width=100';
        itemImage.alt = product.title;
    } else {
        itemName.textContent = 'Error';
        actionText.textContent = 'Failed to add item';
        popupFooter.className = 'new-popup-footer error';
        popupIcon.className = 'bi bi-x-circle';
        popupMessage.textContent = errorMessage || 'Something went wrong';
        itemImage.src = '/placeholder.svg?height=100&width=100';
        itemImage.alt = 'Error';
    }

    popup.classList.add('show');

    clearTimeout(popupTimeout);

    popupTimeout = setTimeout(() => {
        closePopup();
    }, 3000);
}

function closePopup() {
    const popup = document.getElementById('new-popup');
    popup.classList.remove('show');
}

async function loadCart() {
    try {
        const response = await fetch('/cart');
        const data = await response.json();
        
        console.log('Cart data:', data); // Debug log

        // Check if the cart items container exists
        const cartItemsContainer = document.querySelector('.cart-items');
        if (!cartItemsContainer) {
            console.error('Cart items container not found.');
            return; // Exit the function if the container is not found
        }

        if (data.success) {
            const cart = data.cart; // Ensure correct field
            console.log('Cart items:', cart); // Debug log
            renderCart(cart);
        } else {
            console.error('Failed to load cart items:', data.message);
        }
    } catch (error) {
        console.error('Error loading cart items:', error);
    }
}


function renderCart(cart) {
    const cartItemsContainer = document.querySelector('.cart-items');
    if (!cartItemsContainer) {
        console.error('Cart items container not found.');
        return;
    }
    
    cartItemsContainer.innerHTML = ''; // Clear previous content
    
    if (!cart || cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
        return;
    }

    let total = 0;
    let itemCount = 0;

    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('cart-item');
        itemElement.innerHTML = `
            <img src="${item.image_url}" alt="${item.title}">
            <div class="cart-item-details">
                <h4>${item.title}</h4>
                <p>${parseFloat(item.price).toFixed(2)}sh each</p>
            </div>
            <div class="cart-item-actions">
                <button class="btn btn-outline" onclick="updateQuantity(${item.cart_id}, ${item.quantity - 1})">-</button>
                <span>${item.quantity}</span>
                <button class="btn btn-outline" onclick="updateQuantity(${item.cart_id}, ${item.quantity + 1})">+</button>
                <button class="btn btn-outline" onclick="removeItem(${item.cart_id})"><i class="bi bi-trash"></i></button>
            </div>
        `;
        cartItemsContainer.appendChild(itemElement);
        total += parseFloat(item.price) * item.quantity;
        itemCount += item.quantity;
    });
    

    cartCount.textContent = itemCount;
    cartItemsCount.textContent = `${cart.length} item${cart.length !== 1 ? 's' : ''}`;
    cartTotal.textContent = total.toFixed(2);
}




async function updateQuantity(cartId, newQuantity) {
    try {
        const response = await fetch(`/cart/${cartId}`, {  // Using cartId, not productId
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ quantity: newQuantity })
        });

        const data = await response.json();

        if (data.success) {
            alert('Cart updated successfully');
            loadCart(); // Reload the cart after updating
        } else {
            alert(`Failed to update cart: ${data.message}`);
        }
    } catch (error) {
        console.error('Error updating cart:', error);
    }
}


async function removeItem(cartItemId) {
    try {
        const response = await fetch(`/cart/${cartItemId}`, { method: 'DELETE' });
        const data = await response.json();

        if (data.success) {
            loadCart(); // Refresh the cart display
        } else {
            alert(`Failed to remove item: ${data.message}`);
        }
    } catch (error) {
        console.error('Error removing item from cart:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Add event listener for the Clear Cart button
    const clearCartBtn = document.getElementById('clearCart');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', clearCart);
    }
});


async function clearCart() {
    console.log('Clear cart button clicked');
    try {
        const response = await fetch('/cart', { method: 'DELETE' });
        const data = await response.json();
        if (data.success) {
            loadCart(); // Refresh the cart display
        } else {
            alert(`Failed to clear cart: ${data.message}`);
        }
    } catch (error) {
        console.error('Error clearing cart:', error);
    }
}


async function addToWishlist(productId) {
    try {
        const response = await fetch('/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id: productId })
        });

        if (response.status === 401) {
            alert('You need to log in to add items to your wishlist.');
            window.location.href = '/login';
            return;
        }

        const data = await response.json();

        if (data.success) {
            showPopup('wishlist', data.product);
            loadWishlistCount();
        } else {
            showPopup('error', null, data.message);
        }
    } catch (error) {
        console.error('Error adding product to wishlist:', error);
        showPopup('error');
    }
}
            
      // Function to load wishlist item count
    async function loadWishlistCount() {
        try {
            const response = await fetch('/wishlist/count');
            const data = await response.json();

            if (data.success) {
                const wishlistCountElement = document.querySelector('.wishlist-items-count');
                wishlistCountElement.textContent = data.count > 0 ? data.count : 0; // Update the count display
            } else {
                console.error('Failed to load wishlist count:', data.message);
            }
        } catch (error) {
            console.error('Error loading wishlist count:', error);
        }
    }


// Call the function when the page loads
document.addEventListener('DOMContentLoaded', loadWishlistCount);



// Toggle cart dropdown
cartIcon.addEventListener('click', () => {
    cartDropdown.classList.toggle('show');
});

cartIcon.addEventListener('mouseenter', () => {
    cartDropdown.classList.add('show');
});

document.addEventListener('click', (event) => {
    if (!cartIcon.contains(event.target)) {
        cartDropdown.classList.remove('show');
    }
});






// Quick view functionality for opening product details in a modal
function quickView(productId) {
    fetch(`/api/products/${productId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const product = data.product;

                // Populate modal content
                document.getElementById('modal-title').textContent = product.title;
                document.getElementById('modal-description').textContent = product.description;

                const imageElement = document.getElementById('modal-image');
                if (product.image_url) {
                    imageElement.src = product.image_url; // Set image from database
                    imageElement.style.display = 'block'; // Ensure image is visible
                } else {
                    imageElement.style.display = 'none'; // Hide image if URL is not provided
                }

                document.getElementById('modal-price').textContent = `$${product.price}`;
                document.getElementById('modal-stock').textContent = product.stock_status === 'in_stock' 
                    ? 'In Stock' 
                    : 'Out of Stock';

                // Show the modal
                document.getElementById('quick-view-modal').style.display = 'block';
            } else {
                console.error('Product not found');
            }
        })
        .catch(error => {
            console.error('Error fetching product details:', error);
        });
}

// Close the modal when clicking the close button
document.querySelector('.close')?.addEventListener('click', () => {
    document.getElementById('quick-view-modal').style.display = 'none';
});


document.getElementById('search').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        const query = this.value.trim();
        const params = new URLSearchParams(window.location.search);
        if (query) {
            params.set('title', query); // Update title parameter
        } else {
            params.delete('title'); // Remove title parameter if empty
        }
        window.location.href = `/products?${params.toString()}`;
    }
});

function searchProducts() {
    const query = document.getElementById('search-query').value.trim();
    const params = new URLSearchParams();
    const category = document.getElementById('category-select').value;

    if (query) params.append('title', query);
    if (category && category !== 'all') params.append('category', category);

    window.location.href = `/products?${params.toString()}`;
}





/*search*/
document.querySelectorAll('.subcategory').forEach((subcategoryElement) => {
    subcategoryElement.addEventListener('click', () => {
        const selectedCategory = subcategoryElement.textContent.trim().toLowerCase();
        const params = new URLSearchParams(window.location.search);

        // Update category filter in URL
        params.set('category', selectedCategory);
        window.location.href = `/products?${params.toString()}`;
    });
});
