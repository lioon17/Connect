
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
