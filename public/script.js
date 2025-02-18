document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.querySelector('.s-sidebar');
    const sidebarToggle = document.querySelector('.s-sidebar-toggle');
    const closeButton = document.querySelector('.s-close-btn');
    const groupToggle = document.querySelector('.s-group-toggle');
    const groupContent = document.querySelector('.s-group-content');

    // Toggle sidebar on mobile
    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });

    // Close sidebar when the close button is clicked
    closeButton.addEventListener('click', function() {
        sidebar.classList.remove('active');
    });

    // Toggle group content
    groupToggle.addEventListener('click', function() {
        groupContent.classList.toggle('active');
        this.querySelector('i').classList.toggle('fa-chevron-down');
        this.querySelector('i').classList.toggle('fa-chevron-right');
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(event) {
        const isClickInsideSidebar = sidebar.contains(event.target);
        const isClickOnToggle = sidebarToggle.contains(event.target);

        if (!isClickInsideSidebar && !isClickOnToggle && window.innerWidth <= 768) {
            sidebar.classList.remove('active');
        }
    });

    // Version switcher functionality (for demonstration)
    const versionSwitcher = document.querySelector('.s-version-switcher');
    versionSwitcher.addEventListener('click', function() {
        alert('Version switcher clicked. Add your custom logic here.');
    });

    // User profile functionality (for demonstration)
    const userProfile = document.querySelector('.s-user-profile');
    userProfile.addEventListener('click', function() {
        alert('User profile clicked. Add your custom logic here.');
    });
});

// Select necessary elements
const floatingSidebar = document.querySelector('#filterSidebar');
const floatingToggleButton = document.querySelector('#toggle-sidebar');
const floatingCloseButton = document.querySelector('.floating-close-btn');

// Floating Sidebar (filters)
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


/*carousel*/
document.addEventListener('DOMContentLoaded', function() {
            const carousel = document.querySelector('.carousel');
            const images = carousel.querySelectorAll('img');
            const indicatorsContainer = document.querySelector('.carousel-indicators');
            let currentIndex = 0;

            // Create indicators
            images.forEach((_, index) => {
                const indicator = document.createElement('div');
                indicator.classList.add('carousel-indicator');
                indicator.addEventListener('click', () => goToSlide(index));
                indicatorsContainer.appendChild(indicator);
            });

            const indicators = indicatorsContainer.querySelectorAll('.carousel-indicator');

            function goToSlide(index) {
                carousel.style.transform = `translateX(-${index * 100}%)`;
                currentIndex = index;
                updateIndicators();
            }

            function updateIndicators() {
                indicators.forEach((indicator, index) => {
                    if (index === currentIndex) {
                        indicator.classList.add('active');
                    } else {
                        indicator.classList.remove('active');
                    }
                });
            }

            function nextSlide() {
                currentIndex = (currentIndex + 1) % images.length;
                goToSlide(currentIndex);
            }

            // Auto-advance the carousel every 5 seconds
            setInterval(nextSlide, 5000);

            // Initialize the first indicator as active
            updateIndicators();
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
        
                if (data.success) {
                    const cart = data.cart;
                    renderCart(cart, '.cart-items'); // Top bar cart
                    renderCart(cart, '.h-cart-table tbody'); // Cart page table
                    renderCheckoutCart(cart, '.h-table tbody'); // Checkout step 2 table
                } else {
                    console.error('Failed to load cart items:', data.message);
                }
            } catch (error) {
                console.error('Error loading cart items:', error);
            }
        }
        
        function renderCart(cart, containerSelector) {
            const container = document.querySelector(containerSelector);
            if (!container) {
                console.error(`Container not found: ${containerSelector}`);
                return;
            }
        
            container.innerHTML = ''; // Clear previous content
        
            if (!cart || cart.length === 0) {
                container.innerHTML = containerSelector.includes('table') 
                    ? '<tr><td colspan="3">Your cart is empty.</td></tr>' 
                    : '<p>Your cart is empty.</p>';
        
                // Update top bar cart and cart page totals independently
                if (containerSelector === '.cart-items') {
                    document.querySelector('.cart-items-count').textContent = '0 items';
                    document.querySelector('.cart-count').textContent = '0';
                    document.querySelector('.cart-total').textContent = '0.00';
                } else if (containerSelector.includes('table')) {
                    const totalsContainer = document.querySelector('.cart-totals');
                    if (totalsContainer) {
                        totalsContainer.querySelector('.total-row.final span:last-child').textContent = 'Ksh0.00';
                    }
                }
                return;
            }
        
            // Calculate the total count of items and the total price
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            const totalPrice = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
        
            // Update totals for the top bar cart
            if (containerSelector === '.cart-items') {
                document.querySelector('.cart-items-count').textContent = `${totalItems} items`;
                document.querySelector('.cart-count').textContent = totalItems;
                document.querySelector('.cart-total').textContent = totalPrice.toFixed(2);
            }
        
            // Update totals for the cart page
            if (containerSelector.includes('table')) {
                const totalsContainer = document.querySelector('.cart-totals');
                if (totalsContainer) {
                    totalsContainer.querySelector('.total-row.final span:last-child').textContent = `Ksh${totalPrice.toFixed(2)}`;
                }
            }
        
            cart.forEach(item => {
                if (containerSelector.includes('table')) {
                    // Render for cart page table
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>
                            <div class="h-product-info">
                                <button class="btn-remove" aria-label="Remove item" onclick="removeItem(${item.cart_id})"><i class="bi bi-trash"></i></button>
                                <img src="${item.image_url}" alt="${item.title}" class="h-product-image">
                                <div><h3>${item.title}</h3></div>
                            </div>
                        </td>
                        <td>
                            <div class="quantity-control">
                                <button class="quantity-btn" onclick="updateQuantity(${item.cart_id}, ${item.quantity - 1})">-</button>
                                <input type="number" value="${item.quantity}" min="1" class="quantity-input" onchange="updateQuantity(${item.cart_id}, this.value)">
                                <button class="quantity-btn" onclick="updateQuantity(${item.cart_id}, ${item.quantity + 1})">+</button>
                            </div>
                        </td>
                        <td>Ksh${(item.price * item.quantity).toFixed(2)}</td>
                    `;
                    container.appendChild(row);
                } else {
                    // Render for top bar cart
                    const itemElement = document.createElement('div');
                    itemElement.classList.add('cart-item');
                    itemElement.innerHTML = `
                        <img src="${item.image_url}" alt="${item.title}">
                        <div class="cart-item-details">
                            <h4>${item.title}</h4>
                            <p>${parseFloat(item.price).toFixed(2)} Ksh each</p>
                        </div>
                        <div class="cart-item-actions">
                            <button class="quantity-btn" onclick="updateQuantity(${item.cart_id}, ${item.quantity - 1})">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn" onclick="updateQuantity(${item.cart_id}, ${item.quantity + 1})">+</button>
                            <button onclick="removeItem(${item.cart_id})"><i class="bi bi-trash"></i></button>
                        </div>
                    `;
                    container.appendChild(itemElement);
                }
            });
        }
        
        
        // ✅ New function to render Checkout Step 2
        function renderCheckoutCart(cart, containerSelector) {
            const container = document.querySelector(containerSelector);
            if (!container) {
                console.error(`Container not found: ${containerSelector}`);
                return;
            }
        
            container.innerHTML = ''; // Clear previous content
        
            if (!cart || cart.length === 0) {
                container.innerHTML = '<tr><td colspan="2">Your cart is empty.</td></tr>';
                return;
            }
        
            let subtotal = 0;
            cart.forEach(item => {
                subtotal += parseFloat(item.price) * item.quantity;
        
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.title} × ${item.quantity}</td>
                    <td class="text-right">Ksh ${(item.price * item.quantity).toFixed(2)}</td>
                `;
                container.appendChild(row);
            });
        
            // Add summary rows for Subtotal, Shipping, and Total
            const summaryHtml = `
                <tr>
                    <td class="font-bold">Subtotal</td>
                    <td class="text-right font-bold">Ksh ${subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>Shipping</td>
                    <td class="text-right">Ksh 10.00</td>
                </tr>
                <tr>
                    <td class="font-bold text-lg">Total</td>
                    <td class="text-right font-bold text-lg">Ksh ${(subtotal + 10).toFixed(2)}</td>
                </tr>
            `;
            container.insertAdjacentHTML('beforeend', summaryHtml);
        }
        
        
        // Update cart actions
        async function updateQuantity(cartId, newQuantity) {
            if (newQuantity < 1) return; // Prevent invalid quantities
            try {
                await fetch(`/cart/${cartId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ quantity: newQuantity }),
                });
                loadCart(); // Reload both carts
            } catch (error) {
                console.error('Error updating quantity:', error);
            }
        }
        
        async function removeItem(cartId) {
            try {
                await fetch(`/cart/${cartId}`, { method: 'DELETE' });
                loadCart(); // Reload both carts
            } catch (error) {
                console.error('Error removing item:', error);
            }
        }
        
        // Initial load
        loadCart();
        
        
        
        
        
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


  
async function loadProducts() {
    const productGrid = document.getElementById('product-grid');
    const searchResults = document.getElementById('search-results');
    const searchGrid = searchResults ? document.getElementById('search-grid') : null;

    if (!productGrid) {
        console.error("Error: 'product-grid' element not found.");
        return;
    }

    // Read the query parameters from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category') || '';
    const subcategory = urlParams.get('subcategory') || '';
    const searchQuery = urlParams.get('title') || '';
    const limit = urlParams.get('limit') || '';
    const offset = urlParams.get('offset') || '';

    const isIndexPage = window.location.pathname === '/'; // Check if it's the index page
    const apiRoute = isIndexPage ? '/api/products' : '/api/products/all'; // Use appropriate API route

    try {
        let url = new URL(apiRoute, window.location.origin);

        // For the index page, ensure we filter by subcategory = 'new'
        if (isIndexPage) {
            url.searchParams.append('subcategory', 'new');
        } else {
            // Add query parameters for other pages
            if (category) url.searchParams.append('category', category);
            if (subcategory) url.searchParams.append('subcategory', subcategory);
            if (searchQuery) url.searchParams.append('title', searchQuery);
            if (limit) url.searchParams.append('limit', limit);
            if (offset) url.searchParams.append('offset', offset);
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
            if (searchQuery && searchResults && searchGrid) {
                productGrid.style.display = 'none'; // Hide default product grid
                searchResults.style.display = 'block'; // Show search results
                searchGrid.innerHTML = ''; // Clear search results content
            } else {
                productGrid.style.display = 'grid'; // Show default product grid
                if (searchResults) searchResults.style.display = 'none'; // Hide search results
                productGrid.innerHTML = ''; // Clear product grid content
            }

            const gridToUpdate = searchQuery && searchGrid ? searchGrid : productGrid;

            if (data.products.length === 0) {
                gridToUpdate.innerHTML = '<p>No products found.</p>';
                return;
            }

            data.products.forEach(product => {
                const stockStatus = product.stock_status === 'in_stock'
                    ? 'in-stock'
                    : product.stock_status === 'out-of-stock'
                    ? 'out-of-stock'
                    : 'unknown';

                const stockStatusText = product.stock_status
                    ? product.stock_status.replace('_', ' ')
                    : 'Unknown';

                const productActions = product.category.toLowerCase() === 'curtains'
                    ? `
                        <button class="place-order-btn" onclick="redirectToCurtainsPage(${product.id})">
                            <i class="bi bi-box-arrow-in-right"></i> Place Order
                        </button>
                    `
                    : `
                        <button class="add-to-cart" 
                            ${stockStatus === 'out-of-stock' ? 'disabled' : ''} 
                            onclick="addToCart(${product.id})">
                            <i class="bi bi-cart-plus"></i> Add to cart
                        </button>
                    `;

                const productCard = `
                    <div class="product-card" data-category="${product.category.toLowerCase()}" 
                        data-title="${product.title.toLowerCase()}">
                        <div class="product-image">
                            <a href="/product-details?id=${product.id}">
                                <img src="${product.image_url}" alt="${product.title}">
                            </a>
                            <span class="price-tag">$${product.price}</span>
                            <span class="quick-view" onclick="quickView(${product.id})">
                                <i class="bi bi-eye"></i> Quick View
                            </span>
                        </div>
                        <div class="product-info">
                            <h2 class="product-title">${product.title}</h2>
                            <span class="product-category">${product.category}</span>
                            <div class="stock-status ${stockStatus}">
                                <i class="bi ${stockStatus === 'in-stock' ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i> ${stockStatusText}
                            </div>
                        </div>
                        <div class="product-actions">
                            <button class="action-button add-to-wishlist" data-product-id="${product.id}">
                                <i class="bi bi-heart"></i> Wishlist
                            </button>
                            ${productActions}
                        </div>
                    </div>
                `;
                gridToUpdate.innerHTML += productCard;
            });

            // Attach wishlist functionality to buttons dynamically loaded
            document.querySelectorAll('.add-to-wishlist').forEach(button => {
                button.addEventListener('click', async (event) => {
                    const productId = event.target.closest('button').dataset.productId; // Get product ID
                    await addToWishlist(productId); // Add to wishlist
                });
            });
        } else {
            productGrid.innerHTML = '<p>Failed to load products.</p>';
        }
    } catch (error) {
        console.error('Error loading products:', error);
        productGrid.innerHTML = '<p>Failed to load products.</p>';
    }
}

// Function to redirect to curtains page
function redirectToCurtainsPage(productId) {
    window.location.href = `/curtains?id=${productId}`;
}

// Call loadProducts on page load
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});
    
   


       
   /*search*/ 
    document.getElementById('search').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            const query = this.value.trim();
            const params = new URLSearchParams(window.location.search);
            if (query) {
                params.set('title', query); // Set title for search
            } else {
                params.delete('title'); // Remove title if empty
            }
            window.location.href = `/product?${params.toString()}`; // Redirect to correct path
        }
    });

    
    
    // Function to search with filters
    function searchProducts() {
        const query = document.getElementById('search-query').value.trim();
        const params = new URLSearchParams();
        const category = document.getElementById('category-select').value;
    
        if (query) params.append('title', query);
        if (category && category !== 'all') params.append('category', category);
    
        window.location.href = `/product?${params.toString()}`;
    }

  
    
async function loadSearchResults() {
    const searchResults = document.getElementById('search-results');
    const searchGrid = document.getElementById('search-grid');

    // Read the search query from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('title') || ''; // Get the search query

    if (!searchQuery) {
        searchResults.style.display = 'none'; // Hide the search results section
        return;
    }

    try {
        // Fetch search results with the `title` parameter
        const response = await fetch(`/api/products/all?title=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();

        if (data.success && data.products.length > 0) {
            searchResults.style.display = 'block'; // Show the search results section
            searchGrid.innerHTML = ''; // Clear existing content

            // Render each product in the search results
            data.products.forEach(product => {
                const stockStatus = product.stock_status === 'in_stock'
                    ? 'in-stock'
                    : product.stock_status === 'out-of-stock'
                    ? 'out-of-stock'
                    : 'unknown';

                const stockStatusText = product.stock_status
                    ? product.stock_status.replace('_', ' ')
                    : 'Unknown';

                const productActions = product.category.toLowerCase() === 'curtains'
                    ? `
                        <button class="place-order-btn" onclick="redirectToCurtainsPage(${product.id})">
                            <i class="bi bi-box-arrow-in-right"></i> Place Order
                        </button>
                    `
                    : `
                        <button class="add-to-cart" 
                            ${stockStatus === 'out-of-stock' ? 'disabled' : ''} 
                            onclick="addToCart(${product.id})">
                            <i class="bi bi-cart-plus"></i> Add to cart
                        </button>
                    `;

                const productCard = `
                    <div class="product-card" data-category="${product.category.toLowerCase()}" 
                        data-title="${product.title.toLowerCase()}">
                        <div class="product-image">
                            <a href="/product-details?id=${product.id}">
                                <img src="${product.image_url}" alt="${product.title}">
                            </a>
                            <span class="price-tag">$${product.price}</span>
                            <span class="quick-view" onclick="quickView(${product.id})">
                                <i class="bi bi-eye"></i> Quick View
                            </span>
                        </div>
                        <div class="product-info">
                            <h2 class="product-title">${product.title}</h2>
                            <span class="product-category">${product.category}</span>
                            <div class="stock-status ${stockStatus}">
                                <i class="bi ${stockStatus === 'in-stock' ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i> ${stockStatusText}
                            </div>
                        </div>
                        <div class="product-actions">
                            <button class="action-button add-to-wishlist" data-product-id="${product.id}">
                                <i class="bi bi-heart"></i> Wishlist
                            </button>
                            ${productActions}
                        </div>
                    </div>
                `;
                searchGrid.innerHTML += productCard;
            });
        } else {
            searchResults.style.display = 'block'; // Show the search results section
            searchGrid.innerHTML = '<p>No products match your search criteria.</p>';
        }
    } catch (error) {
        console.error('Error fetching search results:', error);
        searchResults.style.display = 'block';
        searchGrid.innerHTML = '<p>Failed to load search results. Please try again later.</p>';
    }
}


document.addEventListener('DOMContentLoaded', () => {
    loadSearchResults(); // Handle search results
});

/*categories*/
/*categories*/
const categories = {
    curtains: ["curtains","Blackout curtains"],
    sheers: ["sheers","Blackout sheers"],
    women: ["Dresses","Tops and blouses","shorts","jeans"],
    men: ["Shirts","Tshirts","shorts","jeans"],
    shoes: ["Sneakers", "Boots", "Loafers", "Heels", "Flats"],
};

function renderCategories() {
    const categoriesAccordion = document.getElementById('categories-accordion');
    categoriesAccordion.innerHTML = Object.entries(categories)
        .map(
            ([category, subcategories]) => `
        <div class="accordion-item">
            <button class="accordion-button" data-category="${category}">
                ${category.charAt(0).toUpperCase() + category.slice(1)}
                <i class="bi bi-chevron-down"></i>
            </button>
            <div class="accordion-content" style="display: none;">
                ${subcategories
                    .map(
                        (subcategory) => `
                    <a href="/product?category=${category}&subcategory=${subcategory}" class="subcategory-link">
                        ${subcategory}
                    </a>
                `
                    )
                    .join('')}
            </div>
        </div>
    `
        )
        .join('');

    // Add toggle functionality for categories
    document.querySelectorAll('.accordion-button').forEach((button) => {
        button.addEventListener('click', () => {
            const content = button.nextElementSibling;

            // Toggle dropdown visibility
            if (content.style.display === 'none') {
                content.style.display = 'block';
                button.querySelector('i').classList.remove('bi-chevron-down');
                button.querySelector('i').classList.add('bi-chevron-up');
            } else {
                content.style.display = 'none';
                button.querySelector('i').classList.remove('bi-chevron-up');
                button.querySelector('i').classList.add('bi-chevron-down');
            }
        });
    });
}

// Call renderCategories when the page loads
document.addEventListener('DOMContentLoaded', () => {
    renderCategories();
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

 

// Populate categories and load products on page load
document.addEventListener('DOMContentLoaded', () => {
    loadProducts(); 
    // Load products for both pages

    // If category and subcategory filters are present, initialize them
    if (categorySelect && subcategorySelect) {
        updateSubcategories();
        categorySelect.addEventListener('change', updateSubcategories);
        subcategorySelect.addEventListener('change', filterProducts);
    }
});


 
