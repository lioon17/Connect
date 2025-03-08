const express = require('express');
const router = express.Router();
const db = require('../config/db');
 
// API to get new products for the index page
router.get('/api/products', async (req, res) => {
    try {
        const generalQuery = `
            SELECT p.*, 
                   (SELECT pi.image_url 
                    FROM product_images pi 
                    WHERE pi.product_id = p.id 
                    AND pi.image_type = 'front' 
                    LIMIT 1) AS image_url
            FROM products p
            WHERE p.subcategory = 'new'
            LIMIT 7
        `;

        const curtainsQuery = `
            SELECT p.*, 
                   (SELECT pi.image_url 
                    FROM product_images pi 
                    WHERE pi.product_id = p.id 
                    AND pi.image_type = 'front' 
                    LIMIT 1) AS image_url
            FROM products p
            WHERE p.category = 'curtains' AND p.subcategory = 'new'
            LIMIT 4
        `;

        const [generalProducts] = await db.query(generalQuery);
        const [curtainProducts] = await db.query(curtainsQuery);

        // Combine results and remove duplicates based on product ID
        const productMap = new Map();

        [...generalProducts, ...curtainProducts].forEach(product => {
            productMap.set(product.id, product); // Use product ID as the key
        });

        const products = Array.from(productMap.values()); // Get unique products

        res.json({ 
            success: true, 
            products
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ success: false, message: 'Error fetching products' });
    }
});

// Route to fetch all products with optional pagination and filtering// Route to fetch all products with optional filtering and search
router.get('/api/products/all', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 20; // Default limit
        const offset = parseInt(req.query.offset, 10) || 0; // Default offset
        const category = req.query.category || null; // Optional category filter
        const subcategory = req.query.subcategory || null; // Optional subcategory filter
        const title = req.query.title || null; // Optional search filter

        let query = `
            SELECT p.*, 
                   (SELECT pi.image_url 
                    FROM product_images pi 
                    WHERE pi.product_id = p.id 
                    AND pi.image_type = 'front' 
                    LIMIT 1) AS image_url
            FROM products p
        `;

        const conditions = [];
        const params = [];

        if (category) {
            conditions.push(`p.category = ?`);
            params.push(category);
        }

        if (subcategory) {
            conditions.push(`p.subcategory = ?`);
            params.push(subcategory);
        }

        if (title) {
            conditions.push(`p.title LIKE ?`);
            params.push(`%${title}%`); // Use wildcard for partial match
        }

        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(' AND ');
        }

        query += ` LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const [products] = await db.query(query, params);

        res.json({ success: true, products });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ success: false, message: 'Error fetching products' });
    }
});




/* API to get a single product with all its images 
router.get('/api/products/:id', async (req, res) => {
    const productId = req.params.id;
    try {
        const [product] = await db.query('SELECT * FROM products WHERE id = ?', [productId]);

        if (product.length > 0) {
            const [images] = await db.query('SELECT * FROM product_images WHERE product_id = ?', [productId]);
            res.json({ success: true, product: product[0], images });
        } else {
            res.status(404).json({ success: false, message: 'Product not found' });
        }
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ success: false, message: 'Error fetching product' });
    }
}); */

router.get('/api/products/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        const query = `
            SELECT p.*, 
                   (SELECT pi.image_url 
                    FROM product_images pi 
                    WHERE pi.product_id = p.id 
                    AND pi.image_type = 'front' 
                    LIMIT 1) AS image_url
            FROM products p
            WHERE p.id = ?
        `;
        const [rows] = await db.query(query, [productId]);

        if (rows.length > 0) {
            res.json({ success: true, product: rows[0] });
        } else {
            res.status(404).json({ success: false, message: 'Product not found' });
        }
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ success: false, message: 'Error fetching product' });
    }
});

router.get('/curtains', async (req, res) => {
    const productId = req.query.id;

    try {
        const query = `
            SELECT p.*, 
                   (SELECT pi.image_url 
                    FROM product_images pi 
                    WHERE pi.product_id = p.id 
                    AND pi.image_type = 'front' 
                    LIMIT 1) AS image_url
            FROM products p
            WHERE p.id = ?
        `;
        const [rows] = await db.query(query, [productId]);

        if (rows.length > 0) {
            res.render('curtains', { product: rows[0] });
        } else {
            res.status(404).send('Product not found');
        }
    } catch (error) {
        console.error('Error fetching curtain details:', error);
        res.status(500).send('Error fetching curtain details');
    }
});
router.get('/api/product-sizes/:productId', async (req, res) => {
    const productId = req.params.productId;

    try {
        // Ensure productId is a number to prevent SQL injection risks
        if (isNaN(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        // Query database for available sizes
        const [sizes] = await db.query("SELECT size FROM product_sizes WHERE product_id = ?", [productId]);

        // If no sizes found, return an empty array
        if (sizes.length === 0) {
            return res.json({ success: true, sizes: [] });
        }

        // Send the list of available sizes
        res.json({ success: true, sizes: sizes.map(s => s.size) });

    } catch (error) {
        console.error("Error fetching sizes:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});


/*
// Products route with search functionality
router.get('/products', async (req, res) => {
    const { title } = req.query; // Get the search title from query parameters
    let query = `
        SELECT p.*, 
               (SELECT pi.image_url 
                FROM product_images pi 
                WHERE pi.product_id = p.id 
                AND pi.image_type = 'front' 
                LIMIT 1) AS image_url
        FROM products p
    `;
    const values = [];

    // Add filtering by title if provided
    if (title) {
        query += ` WHERE p.title LIKE ? COLLATE utf8mb4_general_ci`;
        values.push(`%${title}%`);
    }

    try {
        const [results] = await db.query(query, values);
        res.json({ success: true, products: results });
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch products' });
    }
});
*/


module.exports = router;
