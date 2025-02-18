const express = require('express');
const router = express.Router();
const pool = require('../config/db');// Assuming db.js is in the same directory
const isAuthenticated = require('../middleware/auth'); // Authentication middleware

router.get('/api/customer-insights', async (req, res) => {
    try {
        // Fetch new customers count using the 'created_at' column
        const [newCustomersResult] = await pool.execute(`
            SELECT COUNT(*) as newCustomers 
            FROM users 
            WHERE created_at >= CURDATE() - INTERVAL 30 DAY;
        `);

        // Fetch total customers count
        const [totalCustomersResult] = await pool.execute(`
            SELECT COUNT(*) as totalCustomers 
            FROM users;
        `);

        // Calculate returning customers (total - new customers)
        const newCustomers = newCustomersResult[0].newCustomers;
        const totalCustomers = totalCustomersResult[0].totalCustomers;
        const returningCustomers = totalCustomers - newCustomers;

        // Return the data
        res.json({
            newCustomers,
            totalCustomers,
            returningCustomers,
        });
    } catch (error) {
        console.error('Error fetching customer insights:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});



router.get('/api/curtains/total-sales', async (req, res) => {
    try {
        // Query to calculate total sales
        const [result] = await pool.execute(`
            SELECT SUM(total_price) as totalSales 
            FROM curtains_orders;
        `);

        // Extract total sales from query result
        const totalSales = result[0].totalSales || 0; // Default to 0 if no sales

        // Return the total sales
        res.json({ totalSales });
    } catch (error) {
        console.error('Error fetching total sales:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/api/sales-by-category', async (req, res) => {
    try {
        // SQL query to fetch total sales grouped by category
        const [result] = await pool.execute(`
            SELECT 
                p.category, 
                SUM(oi.total) AS totalSales
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            GROUP BY p.category
            ORDER BY totalSales DESC;
        `);

        // Return the results
        res.json(result);
    } catch (error) {
        console.error('Error fetching sales by category:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
// Real-Time Purchase Updates Route
router.get('/api/real-time-purchase', async (req, res) => {
    try {
        // Query to get the latest general order from orders and order_items tables
        const [generalOrder] = await pool.execute(`
            SELECT 
                o.order_id, 
                o.total_amount, 
                o.phone_number, 
                o.order_date, 
                oi.product_id, 
                oi.quantity, 
                oi.total, 
                p.title AS product_title
            FROM orders o
            JOIN order_items oi ON o.order_id = oi.order_id
            JOIN products p ON oi.product_id = p.id
            ORDER BY o.order_date DESC
            LIMIT 1;
        `);

        // Query to get the latest curtain order from curtains_orders table
        const [curtainOrder] = await pool.execute(`
            SELECT 
                co.order_id, 
                co.material, 
                co.delivery_option, 
                co.phone_number, 
                co.total_price, 
                co.created_at, 
                p.title AS product_title
            FROM curtains_orders co
            JOIN products p ON co.product_id = p.id
            ORDER BY co.created_at DESC
            LIMIT 1;
        `);

        // Determine the most recent order
        let latestOrder;
        if (
            generalOrder.length > 0 &&
            (curtainOrder.length === 0 || new Date(generalOrder[0].order_date) > new Date(curtainOrder[0].created_at))
        ) {
            // If general order is more recent
            latestOrder = {
                orderType: 'General Order',
                orderId: generalOrder[0].order_id,
                productTitle: generalOrder[0].product_title,
                quantity: generalOrder[0].quantity,
                totalAmount: parseFloat(generalOrder[0].total_amount).toFixed(2),
                phoneNumber: generalOrder[0].phone_number,
                orderDate: generalOrder[0].order_date
            };
        } else if (curtainOrder.length > 0) {
            // If curtain order is more recent
            latestOrder = {
                orderType: 'Curtain Order',
                orderId: curtainOrder[0].order_id,
                productTitle: curtainOrder[0].product_title,
                material: curtainOrder[0].material,
                deliveryOption: curtainOrder[0].delivery_option,
                totalAmount: parseFloat(curtainOrder[0].total_price).toFixed(2),
                phoneNumber: curtainOrder[0].phone_number,
                orderDate: curtainOrder[0].created_at
            };
        } else {
            return res.json({ message: 'No recent purchases found.' });
        }

        // Send the latest order as a response
        res.json(latestOrder);
    } catch (error) {
        console.error('Error fetching real-time purchase update:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/api/curtains/sales', async (req, res) => {
    try {
        // Fetch top-selling curtains
        const [topSelling] = await pool.execute(`
            SELECT 
                p.title AS curtain_title,
                COUNT(cw.window_id) AS total_windows,
                SUM(cw.width * cw.height) AS total_area_sold,
                SUM(co.total_price) AS total_sales
            FROM 
                curtains_orders co
            JOIN 
                curtains_order_windows cw ON co.order_id = cw.order_id
            JOIN 
                products p ON co.product_id = p.id
            GROUP BY 
                co.product_id
            ORDER BY 
                total_sales DESC
            LIMIT 10;
        `);

        /* Fetch low-selling curtains
        const [lowSelling] = await pool.execute(`
            SELECT 
                p.title AS curtain_title,
                COUNT(cw.window_id) AS total_windows,
                SUM(cw.width * cw.height) AS total_area_sold,
                SUM(co.total_price) AS total_sales
            FROM 
                curtains_orders co
            JOIN 
                curtains_order_windows cw ON co.order_id = cw.order_id
            JOIN 
                products p ON co.product_id = p.id
            GROUP BY 
                co.product_id
            ORDER BY 
                total_sales ASC
            LIMIT 10;
        `); */

        // Return both top and low-selling curtains
        res.json({ topSellingCurtains: topSelling/*, lowSellingCurtains: lowSelling*/});
    } catch (error) {
        console.error('Error fetching curtains sales data:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Route to fetch top-selling products including curtains
router.get('/api/top-selling-products', async (req, res) => {
    try {
        // SQL query to get top-selling general products
        const [generalProducts] = await pool.execute(`
            SELECT 
                p.title AS productTitle,
                SUM(oi.quantity) AS totalQuantitySold
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            GROUP BY oi.product_id
        `);

        // SQL query to get top-selling curtains by total width
        const [curtains] = await pool.execute(`
            SELECT 
                p.title AS productTitle,
                SUM(cw.width * cw.window_number) AS totalWidthSold
            FROM curtains_orders co
            JOIN curtains_order_windows cw ON co.order_id = cw.order_id
            JOIN products p ON co.product_id = p.id
            GROUP BY co.product_id
        `);

        // Combine both results
        const combinedResults = [...generalProducts, ...curtains];

        // Sort the combined results by quantity/width sold in descending order
        const sortedResults = combinedResults.sort((a, b) => {
            return (b.totalQuantitySold || b.totalWidthSold) - (a.totalQuantitySold || a.totalWidthSold);
        });

        // Return the top 10 results
        res.json(sortedResults.slice(0, 10));
    } catch (error) {
        console.error('Error fetching top-selling products:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});





// Add a new product
router.post('/api/products', async (req, res) => {
    try {
        const { title, category, price, stock_quantity } = req.body;

        // Insert the new product
        await pool.execute(`
            INSERT INTO products (title, category, price, stock_quantity)
            VALUES (?, ?, ?, ?)
        `, [title, category, price, stock_quantity]);

        res.json({ message: 'Product added successfully!' });
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Update a product
router.put('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, category, price, stock_quantity } = req.body;

        // Update the product
        await pool.execute(`
            UPDATE products
            SET title = ?, category = ?, price = ?, stock_quantity = ?
            WHERE id = ?
        `, [title, category, price, stock_quantity, id]);

        res.json({ message: 'Product updated successfully!' });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Delete a product
router.delete('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Delete the product
        await pool.execute(`
            DELETE FROM products
            WHERE id = ?
        `, [id]);

        res.json({ message: 'Product deleted successfully!' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Increase stock quantity
router.put('/api/products/increase-stock/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { amount } = req.body;

        // Increase stock quantity
        await pool.execute(`
            UPDATE products
            SET stock_quantity = stock_quantity + ?
            WHERE id = ?
        `, [amount, id]);

        res.json({ message: `Stock increased by ${amount} units!` });
    } catch (error) {
        console.error('Error increasing stock quantity:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Decrease stock quantity
router.put('/api/products/decrease-stock/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { amount } = req.body;

        // Decrease stock quantity (ensure it doesn't go below zero)
        const [product] = await pool.execute(`
            SELECT stock_quantity FROM products WHERE id = ?
        `, [id]);

        if (product.length > 0 && product[0].stock_quantity < amount) {
            return res.status(400).json({ message: 'Not enough stock to reduce by that amount!' });
        }

        await pool.execute(`
            UPDATE products
            SET stock_quantity = stock_quantity - ?
            WHERE id = ?
        `, [amount, id]);

        res.json({ message: `Stock decreased by ${amount} units!` });
    } catch (error) {
        console.error('Error decreasing stock quantity:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Fetch order management data
router.get('/api/orders', async (req, res) => {
    try {
        const [orders] = await pool.execute(`
            SELECT 
                o.order_id,
                u.username AS customer_name,
                GROUP_CONCAT(CONCAT(p.title, ' (', oi.quantity, ')') SEPARATOR ', ') AS items,
                o.total_amount,
                o.order_status,
                o.order_date
            FROM 
                orders o
            JOIN 
                users u ON o.user_id = u.user_id
            JOIN 
                order_items oi ON o.order_id = oi.order_id
            JOIN 
                products p ON oi.product_id = p.id
            GROUP BY 
                o.order_id
        `);

        res.json({ success: true, orders });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

router.put('/api/orders/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const [result] = await pool.execute(
            'UPDATE orders SET order_status = ? WHERE order_id = ?',
            [status, id]
        );

        if (result.affectedRows > 0) {
            res.json({ success: true, message: `Order status updated to ${status}` });
        } else {
            res.status(404).json({ success: false, message: 'Order not found' });
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});



// Route to fetch Mpesa transactions
router.get('/mpesa-transactions', async (req, res) => {
    try {
        const query = `
            SELECT MpesaReceiptNumber, Amount, PhoneNumber, TransactionDate 
            FROM mpesa_callbacks
            WHERE MpesaReceiptNumber IS NOT NULL
            ORDER BY TransactionDate DESC
        `;

        const [results] = await pool.execute(query);

        res.json(results);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



/*weekly sales*/
router.get('/sales-trends', async (req, res) => {
    try {
        // Query to get weekly sales from orders table
        const [orderSales] = await pool.execute(`
            SELECT 
                YEARWEEK(order_date) AS week,
                SUM(total_amount) AS totalSales
            FROM orders
            WHERE payment_status = 'paid'
            GROUP BY YEARWEEK(order_date)
            ORDER BY YEARWEEK(order_date) DESC
            LIMIT 4;
        `);

        // Query to get weekly sales from curtains_orders table
        const [curtainSales] = await pool.execute(`
            SELECT 
                YEARWEEK(created_at) AS week,
                SUM(total_price) AS totalSales
            FROM curtains_orders
            WHERE payment_status = 'paid'
            GROUP BY YEARWEEK(created_at)
            ORDER BY YEARWEEK(created_at) DESC
            LIMIT 4;
        `);

        // Combine both sales data
        const weeklySales = {};

        // Add general orders sales to the weeklySales object
        orderSales.forEach(row => {
            weeklySales[row.week] = (weeklySales[row.week] || 0) + parseFloat(row.totalSales);
        });

        // Add curtain orders sales to the weeklySales object
        curtainSales.forEach(row => {
            weeklySales[row.week] = (weeklySales[row.week] || 0) + parseFloat(row.totalSales);
        });

        // Format the response for frontend
        const formattedSales = Object.entries(weeklySales)
            .map(([week, totalSales]) => ({
                week,
                totalSales: totalSales.toFixed(2),
            }))
            .sort((a, b) => a.week - b.week); // Sort by week

        res.json(formattedSales);
    } catch (error) {
        console.error('Error fetching sales trends:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/*category quatity sold*/
router.get('/category-performance', async (req, res) => {
    try {
        // Query to get sold items by category from `orders` and `order_items`
        const [orderSales] = await pool.execute(`
            SELECT 
                p.category, 
                SUM(oi.quantity) AS totalSold
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            JOIN orders o ON oi.order_id = o.order_id
            WHERE o.payment_status = 'paid'
            GROUP BY p.category;
        `);

        // Query to get sold curtain items by category from `curtains_orders`
        const [curtainSales] = await pool.execute(`
            SELECT 
                p.category, 
                COUNT(co.order_id) AS totalSold
            FROM curtains_orders co
            JOIN products p ON co.product_id = p.id
            WHERE co.payment_status = 'paid'
            GROUP BY p.category;
        `);

        // Combine the results from both queries
        const categorySales = {};

        // Add general product sales
        orderSales.forEach(row => {
            categorySales[row.category] = (categorySales[row.category] || 0) + parseInt(row.totalSold);
        });

        // Add curtain sales
        curtainSales.forEach(row => {
            categorySales[row.category] = (categorySales[row.category] || 0) + parseInt(row.totalSold);
        });

        // Format response for frontend
        const formattedSales = Object.entries(categorySales).map(([category, totalSold]) => ({
            category,
            totalSold
        }));

        res.json(formattedSales);
    } catch (error) {
        console.error('Error fetching category performance:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
