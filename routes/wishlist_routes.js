// Import required modules
const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Database connection pool
const isAuthenticated = require('../middleware/auth'); // Authentication middleware

// Add to Wishlist

router.post('/wishlist', isAuthenticated, async (req, res) => {
    const { product_id } = req.body;
    const user_id = req.session.user_id;

    if (!product_id) {
        return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }

    try {
        const [existingItem] = await pool.query(
            'SELECT * FROM wishlist WHERE user_id = ? AND product_id = ?',
            [user_id, product_id]
        );

        if (existingItem.length > 0) {
            return res.json({ success: false, message: 'Product is already in the wishlist.' });
        }

        await pool.query(
            'INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)',
            [user_id, product_id]
        );

        // Fetch the product details
        const [product] = await pool.query(
            `SELECT p.id, p.title, p.price, pi.image_url 
             FROM products p 
             LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.image_type = 'front'
             WHERE p.id = ?`,
            [product_id]
        );

        if (product.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        res.json({ 
            success: true, 
            message: 'Product added to wishlist.',
            product: product[0]
        });
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        res.status(500).json({ success: false, message: 'Failed to add to wishlist.' });
    }
});


// Remove from Wishlist
router.delete('/wishlist/:wishlist_id', isAuthenticated, async (req, res) => {
    const { wishlist_id } = req.params;
    const user_id = req.session.user_id;

    try {
        const [result] = await pool.query(
            'DELETE FROM wishlist WHERE wishlist_id = ? AND user_id = ?',
            [wishlist_id, user_id]
        );

        if (result.affectedRows > 0) {
            res.json({ success: true, message: 'Product removed from wishlist.' });
        } else {
            res.status(404).json({ success: false, message: 'Wishlist item not found.' });
        }
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        res.status(500).json({ success: false, message: 'Failed to remove from wishlist.' });
    }
});

// Route to get the count of items in the user's wishlist
router.get('/wishlist/count', isAuthenticated, async (req, res) => {
    const user_id = req.session.user_id;

    try {
        const [wishlistItems] = await pool.query(
            'SELECT COUNT(*) AS count FROM wishlist WHERE user_id = ?',
            [user_id]
        );

        const count = wishlistItems[0].count;

        res.json({ success: true, count });
    } catch (error) {
        console.error('Error fetching wishlist count:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch wishlist count.' });
    }
});


router.get('/api/wishlist', isAuthenticated, async (req, res) => {
    const userId = req.session.user_id;

    try {
        const [wishlistItems] = await pool.query(
            `SELECT w.wishlist_id, w.product_id, p.title, p.category, p.price, pi.image_url
             FROM wishlist w
             JOIN products p ON w.product_id = p.id
             LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.image_type = 'front'
             WHERE w.user_id = ?`,
            [userId]
        );

        res.json({ success: true, wishlist: wishlistItems });
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});
module.exports = router;
