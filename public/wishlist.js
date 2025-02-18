

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

   /* // Handle adding items to cart  
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
    }); */
    
});


function redirectToCurtainsPage(productId) {
    window.location.href = `/curtains?id=${productId}`;
}

// Example: Add event listeners for dynamic elements
document.addEventListener('DOMContentLoaded', () => {
    // Add remove functionality for wishlist
    document.querySelectorAll('.remove-from-wishlist').forEach(button => {
        button.addEventListener('click', async event => {
            const wishlistId = event.target.closest('button').dataset.id;
            await removeFromWishlist(wishlistId);
        });
    });

    // Add add-to-cart functionality
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', async event => {
            const productId = event.target.closest('button').dataset.productId;
            await addToCart(productId);
        });
    });
});


/*quick view*/

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
