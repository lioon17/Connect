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
