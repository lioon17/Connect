const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Adjust the path if necessary
const isAuthenticated = require('../middleware/auth'); // Import the auth middleware


// Add item to cart
router.post('/cart', isAuthenticated, async (req, res) => {
  const { product_id, quantity } = req.body;
  const user_id = req.session.user_id;

  if (!product_id || !quantity) {
      return res.status(400).json({ success: false, message: 'Product ID and quantity are required.' });
  }

  try {
      // Check if the item already exists in the user's cart
      const [existingCart] = await pool.query(
          `SELECT * FROM cart WHERE user_id = ? AND product_id = ?`,
          [user_id, product_id]
      );

      if (existingCart.length > 0) {
          // Update the quantity of the existing item
          await pool.query(
              `UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?`,
              [quantity, user_id, product_id]
          );
      } else {
          // Add a new item to the cart
          await pool.query(
              `INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)`,
              [user_id, product_id, quantity]
          );
      }

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
          message: 'Item added to cart.',
          product: product[0]
      });
  } catch (error) {
      console.error('Error adding item to cart:', error);
      res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});



// Get cart items
router.get('/cart', isAuthenticated, async (req, res) => {
  const user_id = req.session.user_id;

  try {
    const [cartItems] = await pool.query(
      `SELECT c.cart_id, c.product_id, c.quantity, p.title, p.price, pi.image_url
       FROM cart c
       JOIN products p ON c.product_id = p.id
       LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.image_type = 'front'
       WHERE c.user_id = ?`,
      [user_id]
    );

    res.json({ success: true, cart: cartItems });
  } catch (error) {
    console.error('Error retrieving cart:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// Update cart item quantity
router.put('/cart/:cart_id', isAuthenticated, async (req, res) => {
  const { cart_id } = req.params;
  const { quantity } = req.body;
  const user_id = req.session.user_id;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ success: false, message: 'Quantity must be at least 1.' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE cart SET quantity = ? WHERE cart_id = ? AND user_id = ?',
      [quantity, cart_id, user_id]
    );

    if (result.affectedRows > 0) {
      res.json({ success: true, message: 'Cart updated.' });
    } else {
      res.status(404).json({ success: false, message: 'Cart item not found.' });
    }
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// Remove item from cart
router.delete('/cart/:cart_id', isAuthenticated, async (req, res) => {
  const { cart_id } = req.params;
  const user_id = req.session.user_id;

  try {
    const [result] = await pool.query(
      'DELETE FROM cart WHERE cart_id = ? AND user_id = ?',
      [cart_id, user_id]
    );

    if (result.affectedRows > 0) {
      res.json({ success: true, message: 'Item removed from cart.' });
    } else {
      res.status(404).json({ success: false, message: 'Cart item not found.' });
    }
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// Clear cart
router.delete('/cart', isAuthenticated, async (req, res) => {
  const user_id = req.session.user_id;

  try {
    await pool.query('DELETE FROM cart WHERE user_id = ?', [user_id]);
    res.json({ success: true, message: 'Cart cleared.' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});


 
// Place Order Route

router.post('/placeOrder', isAuthenticated, async (req, res) => {
  const { cart, phoneNumber, deliveryAddress, paymentMethod, CheckoutRequestID } = req.body;

  if (!cart || !phoneNumber || !deliveryAddress) {
      return res.status(400).json({ message: 'Invalid order details.' });
  }

  let connection;
  try {
      connection = await pool.getConnection();
      await connection.beginTransaction();

      // Insert order into orders table
      const [orderResult] = await connection.query('INSERT INTO orders SET ?', {
          user_id: req.session.user_id,
          total_amount: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
          delivery_address: deliveryAddress,
          phone_number: phoneNumber,
          mpesa_number: paymentMethod === 'mpesa' ? phoneNumber : null,
          payment_status: 'pending',
          CheckoutRequestID, // Store the CheckoutRequestID
      });

      const orderId = orderResult.insertId;

      // Insert order items into order_items table
      const orderItems = cart.map(item => [
          orderId,
          item.product_id,
          item.quantity,
          item.price,
          item.price * item.quantity,
      ]);

      await connection.query('INSERT INTO order_items (order_id, product_id, quantity, price, total) VALUES ?', [orderItems]);

      // Clear the user's cart
      await connection.query('DELETE FROM cart WHERE user_id = ?', [req.session.user_id]);

      // Commit transaction
      await connection.commit();

      res.status(200).json({ message: 'Order placed successfully.' });
  } catch (error) {
      console.error('Error placing order:', error);

      if (connection) {
          await connection.rollback();
      }

      res.status(500).json({ message: 'Failed to place order.' });
  } finally {
      if (connection) {
          connection.release();
      }
  }
});


// Route to fetch order summary for Step 3
router.get('/orderSummary', isAuthenticated, async (req, res) => {
  try {
      const userId = req.session.user_id;

      // Fetch the most recent order for the logged-in user
      const [orders] = await pool.query(`
          SELECT 
              order_id AS order_number,
              total_amount,
              payment_status,
              mpesa_number,
              delivery_address,
              order_status,
              order_date
          FROM orders
          WHERE user_id = ?
          ORDER BY order_date DESC
          LIMIT 1
      `, [userId]);

      if (!orders || orders.length === 0) {
          return res.status(404).json({ message: 'No recent orders found.' });
      }

      const order = orders[0];

      // Fetch the order items for the most recent order
      const [orderItems] = await pool.query(`
          SELECT 
              oi.product_id,
              p.title,
              oi.quantity,
              oi.price,
              oi.total
          FROM order_items oi
          JOIN products p ON p.id = oi.product_id
          WHERE oi.order_id = ?
      `, [order.order_number]);

      // Return the complete order summary
      res.status(200).json({
          success: true,
          order: {
              order_number: order.order_number,
              total_amount: order.total_amount,
              payment_method: order.mpesa_number ? 'Mpesa' : 'Cash on Delivery',
              delivery_address: order.delivery_address,
              order_status: order.order_status,
              order_date: order.order_date,
              items: orderItems.map(item => ({
                  product_id: item.product_id,
                  title: item.title,
                  quantity: item.quantity,
                  price: item.price,
                  total: item.total,
              })),
          },
      });
  } catch (error) {
      console.error('Error fetching order summary:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch order summary.' });
  }
});


 /*tracking*/
 router.get('/api/tracking', isAuthenticated, async (req, res) => {
  const user_id = req.session.user_id;

  try {
      const [orders] = await pool.execute(
          `
          SELECT 
              o.order_id,
              u.username AS customer_name,
              GROUP_CONCAT(CONCAT(p.title, ' (', oi.quantity, '), Price: ', oi.price, ', Total: ', oi.total) SEPARATOR '; ') AS items,
              o.total_amount,
              o.order_status,
              o.order_date,
              o.delivery_address,
              o.phone_number
          FROM 
              orders o
          JOIN 
              users u ON o.user_id = u.user_id
          JOIN 
              order_items oi ON o.order_id = oi.order_id
          JOIN 
              products p ON oi.product_id = p.id
          WHERE 
              o.user_id = ?
          GROUP BY 
              o.order_id
          ORDER BY 
              o.order_date DESC
          LIMIT 1
          `,
          [user_id]
      );

      if (orders.length > 0) {
          res.json({ success: true, order: orders[0] });
      } else {
          res.status(404).json({ success: false, message: 'No orders found for this user.' });
      }
  } catch (error) {
      console.error('Error fetching order details:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});


router.get('/api/order-history', isAuthenticated, async (req, res) => {
  const user_id = req.session.user_id;

  try {
      const [orders] = await pool.execute(
          `
          SELECT 
              o.order_id,
              o.total_amount,
              u.username AS customer_name,
              u.email AS customer_email,
              o.order_status,
              o.order_date
          FROM 
              orders o
          JOIN 
              users u ON o.user_id = u.user_id
          WHERE 
              o.user_id = ?
          ORDER BY 
              o.order_date DESC
          `,
          [user_id]
      );

      if (orders.length > 0) {
          res.json({ success: true, orders });
      } else {
          res.status(404).json({ success: false, message: 'No orders found for this user.' });
      }
  } catch (error) {
      console.error('Error fetching order history:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});


module.exports = router;
