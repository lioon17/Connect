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


    async function loadProducts(category = '', searchQuery = '') {
        const productGrid = document.getElementById('product-grid');
    
        // Determine the correct API route based on the current page
        const apiRoute = window.location.pathname.includes('product')
            ? '/api/products/all'
            : '/api/products';
    
        try {
            let url = new URL(apiRoute, window.location.origin);
            if (category) {
                url.searchParams.append('category', category);
            }
            if (searchQuery) {
                url.searchParams.append('title', searchQuery);
            }
    
            const response = await fetch(url);
            const data = await response.json();
    
            if (data.success) {
                productGrid.innerHTML = ''; // Clear existing content
    
                data.products.forEach(product => {
                    const stockStatus = product.stock_status === 'in_stock'
                        ? 'in-stock'
                        : product.stock_status === 'out-of-stock'
                        ? 'out-of-stock'
                        : 'unknown';
    
                    const stockStatusText = product.stock_status
                        ? product.stock_status.replace('_', ' ')
                        : 'Unknown';
    
                    // Conditional rendering for "Add to Cart" or "Place Order" button
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
                    productGrid.innerHTML += productCard;
                });
    
                // Add event listeners for adding to wishlist
                document.querySelectorAll('.add-to-wishlist').forEach(button => {
                    button.addEventListener('click', async (event) => {
                        const productId = event.target.closest('button').dataset.productId; // Get product ID
                        await addToWishlist(productId); // Call the function to add to wishlist
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
    
    // Navigate to the curtains page with the selected image
    function redirectToCurtainsPage(productId) {
        window.location.href = `/curtains?id=${productId}`;
    }
    
    
    
    // Render Categories and add click functionality
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
                <div class="accordion-content">
                    ${subcategories
                        .map(
                            (subcategory) => `
                        <p class="subcategory" data-category="${category}" data-subcategory="${subcategory}">${subcategory}</p>
                    `
                        )
                        .join('')}
                </div>
            </div>
        `
            )
            .join('');
    
        // Add accordion toggle functionality
        document.querySelectorAll('.accordion-button').forEach((button) => {
            button.addEventListener('click', (event) => {
                const content = button.nextElementSibling;
                content.classList.toggle('active');
                
                // Filter products by main category
                const category = event.target.dataset.category;
                loadProducts(category);
            });
        });
    
        // Add subcategory filtering
        document.querySelectorAll('.subcategory').forEach((subcategory) => {
            subcategory.addEventListener('click', (event) => {
                const category = event.target.dataset.category;
                const subcategoryName = event.target.dataset.subcategory;
                loadProducts(category, subcategoryName);
            });
        });
    }
    
    // Call loadProducts and renderCategories when the page loads
    document.addEventListener('DOMContentLoaded', () => {
        loadProducts();
        renderCategories();
    
        // Add event listener for search
        const searchInput = document.getElementById('search');
        if (searchInput) {
            searchInput.addEventListener('input', (event) => {
                const searchQuery = event.target.value.trim();
                loadProducts('', searchQuery);
            });
        }
    });
    
    

    const categories = {
        curtains: ["Blackout curtains", "Thermal curtains", "Valances and pelmets"],
        sheers: ["Lace curtains", "Privacy sheers", "Net curtains"],
        women: ["Dresses", "Tops and blouses", "Pants and trousers"],
        men: ["Formal shirts and trousers", "Casual shirts and t-shirts", "Jeans and chinos"],
        shoes: ["Sneakers", "Boots", "Loafers", "Heels", "Flats"],
    };
    
    
    

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



// Close the Quick View Modal
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

 
document.addEventListener('DOMContentLoaded', () => {
    // Handle removing items from wishlist
    document.querySelectorAll('.remove-from-wishlist').forEach(button => {
        button.addEventListener('click', async (event) => {
            const wishlistId = event.target.closest('button').dataset.id;
            try {
                const response = await fetch(`/wishlist/${wishlistId}`, { method: 'DELETE' });
                const data = await response.json();
                if (data.success) {
                    alert('Product removed from wishlist');
                    location.reload(); // Reload the page to reflect changes
                } else {
                    alert('Failed to remove from wishlist');
                }
            } catch (error) {
                console.error('Error removing from wishlist:', error);
            }
        });
    });

    // Handle adding items to cart
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', async (event) => {
            const productId = event.target.closest('button').dataset.productId; // Get product ID
            const quantity = 1; // Default quantity
            if (!productId) {
                alert('Product ID is missing.');
                return;
            }
            try {
                const response = await fetch('/cart', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ product_id: productId, quantity })
                });
                const data = await response.json();
                if (data.success) {
                    alert('Product added to cart.');
                } else {
                    alert('Failed to add product to cart.');
                }
            } catch (error) {
                console.error('Error adding to cart:', error);
            }
        });
    });
    
});







async function getAccessToken() {
    const consumer_key = process.env.MPESA_CONSUMER_KEY;
    const consumer_secret = process.env.MPESA_CONSUMER_SECRET;
    const url = `${process.env.MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`;
    const auth = "Basic " + Buffer.from(consumer_key + ":" + consumer_secret).toString("base64");

    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: auth,
            },
        });
        return response.data.access_token;
    } catch (error) {
        console.error('Error getting access token:', error);
        throw error;
    }
}

// STK Push Function
app.post('/stkpush', async (req, res) => {
    const { phoneNumber, amount } = req.body;

    if (!phoneNumber || !amount) {
        return res.status(400).json({ message: "Phone number and amount are required" });
    }

    const formattedPhoneNumber = formatPhoneNumber(phoneNumber); // Ensure phone number is in 254 format
    const accessToken = await getAccessToken();
    const url = `${process.env.MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`;
    const timestamp = moment().format('YYYYMMDDHHmmss');
    const password = Buffer.from(
        process.env.MPESA_SHORTCODE + process.env.MPESA_PASSKEY + timestamp
    ).toString('base64');

    const data = {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: formattedPhoneNumber,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: formattedPhoneNumber,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: "THE CONNECT",
        TransactionDesc: "Payment for Order",
    };

    try {
        const response = await axios.post(url, data, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        res.status(200).json({
            message: "STK push sent successfully",
            response: response.data,
        });
    } catch (error) {
        console.error('Error sending STK push:', error);
        res.status(500).json({
            message: "Failed to send STK push",
            error: error.message,
        });
    }
});

// Utility to format phone number to 254 format
function formatPhoneNumber(phone) {
    if (phone.startsWith('07')) {
        return phone.replace(/^0/, '254');
    } else if (!phone.startsWith('254')) {
        throw new Error('Invalid phone number format');
    }
    return phone;
}

app.post('/callback', async (req, res) => {
    console.log(`[${new Date().toISOString()}] Received STK PUSH CALLBACK:`, JSON.stringify(req.body, null, 2));
  
    const callbackData = req.body.Body?.stkCallback;
    if (!callbackData) {
        console.error(`[${new Date().toISOString()}] Invalid callback data:`, req.body);
        return res.status(400).send('Invalid callback data');
    }
  
    const { CheckoutRequestID, ResultCode, ResultDesc } = callbackData;
    const Amount = callbackData?.CallbackMetadata?.Item?.find(item => item.Name === 'Amount')?.Value || null;
    const MpesaReceiptNumber = callbackData?.CallbackMetadata?.Item?.find(item => item.Name === 'MpesaReceiptNumber')?.Value || null;
    const Balance = callbackData?.CallbackMetadata?.Item?.find(item => item.Name === 'Balance')?.Value || null;
    const TransactionDate = callbackData?.CallbackMetadata?.Item?.find(item => item.Name === 'TransactionDate')?.Value || null;
    const PhoneNumber = callbackData?.CallbackMetadata?.Item?.find(item => item.Name === 'PhoneNumber')?.Value || null;
  
    // Send acknowledgment to M-Pesa
    res.status(200).send('Callback received');
  
    // Log and process the callback data
    setImmediate(() => {
        console.log(`[${new Date().toISOString()}] Parsed Callback Data:`, { 
            CheckoutRequestID, 
            ResultCode, 
            ResultDesc, 
            Amount, 
            MpesaReceiptNumber, 
            Balance, 
            TransactionDate, 
            PhoneNumber 
        });

        try {
            // Mock processing
            const order = { orderId: CheckoutRequestID, paymentStatus: 'Unpaid' }; // Mocked order
            if (order) {
                order.paymentStatus = 'Paid'; // Update the mock order status
                console.log(`[${new Date().toISOString()}] Order payment status updated (in-memory):`, order);
            } else {
                console.error(`[${new Date().toISOString()}] Order not found for CheckoutRequestID: ${CheckoutRequestID}`);
            }
        } catch (err) {
            console.error(`[${new Date().toISOString()}] Error processing callback for CheckoutRequestID: ${CheckoutRequestID || 'Unknown'}`, err);
        }
    });
});

  
 // Remove the duplicate definition if already declared
// const getAccessToken = async () => { ... }

app.get('/registerurl', async (req, res) => {
    try {
        const accessToken = await getAccessToken(); // Use the existing function
        const url = `${process.env.MPESA_BASE_URL}/mpesa/c2b/v1/registerurl`;

        const response = await axios.post(url, {
            ShortCode: process.env.MPESA_SHORTCODE,
            ResponseType: 'Completed',
            ConfirmationURL: process.env.MPESA_CALLBACK_URL,
            ValidationURL: process.env.MPESA_CALLBACK_URL,
        }, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        console.log('Callback URL registered successfully:', response.data);
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error registering callback URL:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to register callback URL' });
    }
});



  app.get('/query/:CheckoutRequestID', async (req, res) => {
    const { CheckoutRequestID } = req.params;
  
    try {
      const accessToken = await getAccessToken();
      const url = 'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query';
      const auth = 'Bearer ' + accessToken;
      const timestamp = moment().format('YYYYMMDDHHmmss');
      const password = Buffer.from(shortCode + passkey + timestamp).toString('base64');
  
      const response = await axios.post(url, {
        BusinessShortCode: shortCode,   // Replace with your Business ShortCode
        Password: password,             // Generated password using ShortCode, PassKey, and Timestamp
        Timestamp: timestamp,           // Current timestamp in the required format
        CheckoutRequestID               // The request ID to query
      }, {
        headers: {
          Authorization: auth,
        },
      });
  
      console.log('Query response:', response.data);
      res.status(200).json(response.data);
    } catch (error) {
      console.error('Error in /query route:', error.response ? error.response.data : error.message);
      res.status(500).send(' Request failed');
    }
  });



  
        // Profit and Loss Chart
        const profitLossCtx = document.getElementById('profitLossChart').getContext('2d');
        new Chart(profitLossCtx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Profit',
                    data: [4000, 3000, 2000, 2780, 1890, 2390],
                    backgroundColor: 'rgba(75, 192, 192, 0.6)'
                }, {
                    label: 'Loss',
                    data: [2400, 1398, 9800, 3908, 4800, 3800],
                    backgroundColor: 'rgba(255, 99, 132, 0.6)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // Sales Trends Chart
        const salesTrendsCtx = document.getElementById('salesTrendsChart').getContext('2d');
        new Chart(salesTrendsCtx, {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                    label: 'Sales',
                    data: [4000, 3000, 5000, 2780],
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });

        // Revenue vs Expenses Chart
        const revenueExpensesCtx = document.getElementById('revenueExpensesChart').getContext('2d');
        new Chart(revenueExpensesCtx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Revenue',
                    data: [4000, 3000, 2000, 2780, 1890, 2390],
                    backgroundColor: 'rgba(75, 192, 192, 0.6)'
                }, {
                    label: 'Expenses',
                    data: [2400, 1398, 9800, 3908, 4800, 3800],
                    backgroundColor: 'rgba(255, 99, 132, 0.6)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // Category Performance Chart
        const categoryPerformanceCtx = document.getElementById('categoryPerformanceChart').getContext('2d');
        new Chart(categoryPerformanceCtx, {
            type: 'bar',
            data: {
                labels: ['Curtains', 'Sheers', "Women's Clothing", "Men's Clothing", "Men's Shoes", "Women's Shoes"],
                datasets: [{
                    label: 'Sales',
                    data: [4000, 3000, 2000, 2780, 1890, 2390],
                    backgroundColor: 'rgba(75, 192, 192, 0.6)'
                }, {
                    label: 'Profit',
                    data: [2400, 1398, 980, 1908, 800, 1300],
                    backgroundColor: 'rgba(255, 99, 132, 0.6)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // Product Management
        const productTable = document.getElementById('productTable').getElementsByTagName('tbody')[0];
        const addProductForm = document.getElementById('addProductForm');

        // Initial product data
        const products = [
            { name: ' Curtains', price: 3000.99, stock: 50 },
            { name: 'Sheer Voile', price: 600.99, stock: 100 },
            { name: 'Women Dress', price: 400.99, stock: 20 },
            { name: 'Men Trousers', price: 1500.99, stock: 120 },
            { name: 'shoes', price: 3550.99, stock: 11 },
        ];

        // Function to render product table
        function renderProductTable() {
            productTable.innerHTML = '';
            products.forEach((product, index) => {
                const row = productTable.insertRow();
                row.innerHTML = `
                    <td>${product.name}</td>
                    <td><input type="number" value="${product.price}" onchange="updateProduct(${index}, 'price', this.value)"></td>
                    <td><input type="number" value="${product.stock}" onchange="updateProduct(${index}, 'stock', this.value)"></td>
                    <td><button class="btn btn-danger" onclick="removeProduct(${index})">Remove</button></td>
                `;
            });
        }

        // Function to add a new product
        addProductForm.onsubmit = function(e) {
            e.preventDefault();
            const name = document.getElementById('productName').value;
            const price = parseFloat(document.getElementById('productPrice').value);
            const stock = parseInt(document.getElementById('productStock').value);
            products.push({ name, price, stock });
            renderProductTable();
            this.reset();
        };

        // Function to update a product
        function updateProduct(index, field, value) {
            products[index][field] = parseFloat(value);
            renderProductTable();
        }

        // Function to remove a product
        function removeProduct(index) {
            products.splice(index, 1);
            renderProductTable();
        }

        // Initial render of product table
        renderProductTable();

        // Customer Reviews
        const reviewsTable = document.getElementById('reviewsTable').getElementsByTagName('tbody')[0];
        const reviews = [
            { product: 'Premium Curtains', rating: 4.5, review: 'Great quality!' },
            { product: 'Sheer Voile', rating: 4.2, review: 'Beautiful and light.' }
        ];

        // Function to render reviews table
        function renderReviewsTable() {
            reviewsTable.innerHTML = '';
            reviews.forEach(review => {
                const row = reviewsTable.insertRow();
                row.innerHTML = `
                    <td>${review.product}</td>
                    <td>${review.rating}</td>
                    <td>${review.review}</td>
                `;
            });
        }

        // Initial render of reviews table
        renderReviewsTable();

        // Simulating real-time updates
        setInterval(() => {
            // Update latest purchase
            const products = ['Women\'s Summer Dress', 'Men\'s Casual Shirt', 'Premium Curtains', 'Sheer Voile'];
            document.getElementById('latestPurchase').textContent = `Latest Purchase: ${products[Math.floor(Math.random() * products.length)]}`;

            // Update sales figures
            document.getElementById('curtainsSales').textContent = `$${(Math.random() * 10000 + 40000).toFixed(2)}`;
            document.getElementById('sheersSales').textContent = `$${(Math.random() * 5000 + 30000).toFixed(2)}`;
            document.getElementById('womenClothingSales').textContent = `$${(Math.random() * 15000 + 50000).toFixed(2)}`;
            document.getElementById('menClothingSales').textContent = `$${(Math.random() * 10000 + 40000).toFixed(2)}`;
            document.getElementById('menShoesSales').textContent = `$${(Math.random() * 8000 + 30000).toFixed(2)}`;
            document.getElementById('womenShoesSales').textContent = `$${(Math.random() * 12000 + 50000).toFixed(2)}`;

            // Update customer counts
            document.getElementById('newCustomers').textContent = Math.floor(Math.random() * 500 + 1000);
            document.getElementById('totalCustomers').textContent = Math.floor(Math.random() * 2000 + 10000);

            // Update conversion and abandoned cart rates
            document.getElementById('conversionRate').textContent = `${(Math.random() * 2 + 2).toFixed(1)}%`;
            document.getElementById('abandonedCartRate').textContent = `${Math.floor(Math.random() * 10 + 60)}%`;
        }, 5000);



        const initialOrders = [
            { id: 1, customer: "John Doe", items: "2x Premium Curtains", total: "$259.98", status: "pending", date: "2023-06-01" },
            { id: 2, customer: "Jane Smith", items: "1x Women's Summer Dress", total: "$79.99", status: "processing", date: "2023-06-02" },
            { id: 3, customer: "Bob Johnson", items: "3x Men's Casual Shirt", total: "$179.97", status: "completed", date: "2023-06-03" },
            { id: 4, customer: "Alice Brown", items: "4x Sheer Voile", total: "$199.96", status: "pending", date: "2023-06-04" },
            { id: 5, customer: "Charlie Davis", items: "1x Men's Leather Shoes", total: "$149.99", status: "processing", date: "2023-06-05" },
            { id: 6, customer: "Eva Wilson", items: "2x Women's Sandals", total: "$179.98", status: "completed", date: "2023-06-06" },
        ];

        let orders = [...initialOrders];

        const searchInput = document.getElementById('searchInput');
        const statusFilter = document.getElementById('statusFilter');
        const sortBy = document.getElementById('sortBy');
        const orderTableBody = document.getElementById('orderTableBody');

        function renderOrders() {
            const filteredOrders = orders
                .filter(order => 
                    order.customer.toLowerCase().includes(searchInput.value.toLowerCase()) ||
                    order.items.toLowerCase().includes(searchInput.value.toLowerCase())
                )
                .filter(order => statusFilter.value === 'all' ? true : order.status === statusFilter.value)
                .sort((a, b) => {
                    if (sortBy.value === 'date') {
                        return new Date(b.date).getTime() - new Date(a.date).getTime();
                    } else {
                        return parseFloat(b.total.replace('$', '')) - parseFloat(a.total.replace('$', ''));
                    }
                });

            orderTableBody.innerHTML = filteredOrders.map(order => `
                <tr>
                    <td>${order.id}</td>
                    <td>${order.customer}</td>
                    <td>${order.items}</td>
                    <td>${order.total}</td>
                    <td><span class="badge badge-${order.status}">${order.status}</span></td>
                    <td>${order.date}</td>
                    <td>
                        ${order.status === 'pending' ? `<button onclick="updateOrderStatus(${order.id}, 'processing')">Process</button>` : ''}
                        ${order.status === 'processing' ? `<button onclick="updateOrderStatus(${order.id}, 'completed')">Complete</button>` : ''}
                    </td>
                </tr>
            `).join('');
        }

        function updateOrderStatus(orderId, newStatus) {
            orders = orders.map(order => 
                order.id === orderId ? { ...order, status: newStatus } : order
            );
            renderOrders();
        }

        searchInput.addEventListener('input', renderOrders);
        statusFilter.addEventListener('change', renderOrders);
        sortBy.addEventListener('change', renderOrders);

        // Initial render
        renderOrders();

      

        
    async function loadProducts() {
        const productGrid = document.getElementById('product-grid');
    
        // Read the query parameters from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category') || ''; // Get the category from query params
        const subcategory = urlParams.get('subcategory') || ''; // Get the subcategory if any
        const searchQuery = urlParams.get('searchQuery') || ''; // Get the search query if any
        const limit = urlParams.get('limit') || ''; // Pagination limit (if applicable)
        const offset = urlParams.get('offset') || ''; // Pagination offset (if applicable)
    
        // Determine API route based on the page
        const isIndexPage = window.location.pathname === '/'; // Check if it's the index page
        const apiRoute = isIndexPage ? '/api/products' : '/api/products/all'; // Use appropriate API
    
        try {
            let url = new URL(apiRoute, window.location.origin);
    
            // Add query parameters for filtering
            if (!isIndexPage) {
                // Product page supports all filters
                if (category) {
                    url.searchParams.append('category', category);
                }
                if (subcategory) {
                    url.searchParams.append('subcategory', subcategory);
                }
                if (searchQuery) {
                    url.searchParams.append('title', searchQuery);
                }
                if (limit) {
                    url.searchParams.append('limit', limit);
                }
                if (offset) {
                    url.searchParams.append('offset', offset);
                }
            }
    
            // Fetch products
            const response = await fetch(url);
            const data = await response.json();
    
            if (data.success) {
                productGrid.innerHTML = ''; // Clear existing content
    
                if (data.products.length === 0) {
                    productGrid.innerHTML = '<p>No products found for this category or search query.</p>';
                    return;
                }
    
                // Render each product
                data.products.forEach(product => {
                    const stockStatus = product.stock_status === 'in_stock'
                        ? 'in-stock'
                        : product.stock_status === 'out-of-stock'
                        ? 'out-of-stock'
                        : 'unknown';
    
                    const stockStatusText = product.stock_status
                        ? product.stock_status.replace('_', ' ')
                        : 'Unknown';
    
                    // Conditional rendering for "Add to Cart" or "Place Order" button
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
                    productGrid.innerHTML += productCard;
                });
    
                // Add event listeners for adding to wishlist
                document.querySelectorAll('.add-to-wishlist').forEach(button => {
                    button.addEventListener('click', async (event) => {
                        const productId = event.target.closest('button').dataset.productId; // Get product ID
                        await addToWishlist(productId); // Call the function to add to wishlist
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
    
    // Function to navigate to curtains page with the selected product
    function redirectToCurtainsPage(productId) {
        window.location.href = `/curtains?id=${productId}`;
    }
    
    // Call loadProducts on page load
    document.addEventListener('DOMContentLoaded', () => {
        loadProducts();
    });
    
    
    