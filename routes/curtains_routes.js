const express = require('express');
const router = express.Router();
const pool = require('../config/db');// Assuming db.js is in the same directory
const isAuthenticated = require('../middleware/auth'); // Authentication middleware

// Route to post a new order in the curtains_orders table// Route to post a new order in the curtains_orders table
router.post('/orders', isAuthenticated, async (req, res) => {
  const {
      product_id,
      material,
      delivery_option,
      delivery_location,
      pickup_point,
      phone_number,
      total_price,
      notes
  } = req.body;

  // Retrieve user_id from the session set by isAuthenticated middleware
  const user_id = req.session.user_id;

  // Validate required fields
  if (!user_id || !product_id || !material || !delivery_option || !phone_number || !total_price) {
      return res.status(400).json({
          message: 'Missing required fields: user_id, product_id, material, delivery_option, phone_number, and total_price are mandatory.'
      });
  }

  try {
      const [result] = await pool.query(
          `INSERT INTO curtains_orders (
             user_id, 
             product_id, 
             material, 
             delivery_option, 
             delivery_location, 
             pickup_point, 
             phone_number, 
             total_price, 
             notes,
             order_status, 
             payment_status
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
              user_id, // User ID from session
              product_id,
              material,
              delivery_option,
              delivery_location || null,
              pickup_point || null,
              phone_number,
              total_price,
              notes || null,
              'processing', // Default order status
              'not paid'    // Default payment status
          ]
      );

      res.status(201).json({
          message: 'Order created successfully.',
          order_id: result.insertId,
          order_status: 'processing',
          payment_status: 'not paid'
      });
  } catch (err) {
      console.error('Error creating order:', err);
      res.status(500).json({
          message: 'An error occurred while creating the order.',
          error: err.message
      });
  }
});


// Route to post window details to the curtains_order_windows table
router.post('/orders/:orderId/windows',  isAuthenticated,async (req, res) => {
  const { orderId } = req.params;
  const { windows } = req.body; // Expecting an array of windows with { window_number, width, height }

  if (!windows || !Array.isArray(windows)) {
    return res.status(400).json({ message: 'Windows data is required and must be an array.' });
  }

  try {
    const values = windows.map(({ window_number, width, height }) => [orderId, window_number, width, height]);
    await pool.query(
      `INSERT INTO curtains_order_windows (order_id, window_number, width, height)
       VALUES ?`,
      [values]
    );

    res.status(201).json({ message: 'Window details added successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'An error occurred while adding window details.' });
  }
});


router.get('/orders/:orderId?', isAuthenticated, async (req, res) => {
  const { orderId } = req.params;  
  const userId = req.session.user_id; // Get the authenticated user's ID

  try {
      const query = `
          SELECT co.order_id, co.user_id, co.product_id, co.material, co.delivery_option, 
                 co.delivery_location, co.pickup_point, co.phone_number, co.total_price, 
                 co.notes, co.created_at, co.updated_at,
                 cow.window_id, cow.window_number, cow.width, cow.height
          FROM curtains_orders co
          LEFT JOIN curtains_order_windows cow ON co.order_id = cow.order_id
          WHERE co.user_id = ? AND co.payment_status = 'not paid'
          ${orderId ? 'AND co.order_id = ?' : ''}
          ORDER BY co.created_at DESC
      `;

      const params = orderId ? [userId, orderId] : [userId];
      const [orderDetails] = await pool.query(query, params);

      if (orderDetails.length === 0) {
          return res.status(404).json({ message: 'No unpaid orders found.' });
      }

      // Group the data into a single order with multiple windows
      const order = {
          order_id: orderDetails[0].order_id,
          user_id: orderDetails[0].user_id,
          product_id: orderDetails[0].product_id,
          material: orderDetails[0].material,
          delivery_option: orderDetails[0].delivery_option,
          delivery_location: orderDetails[0].delivery_location,
          pickup_point: orderDetails[0].pickup_point,
          phone_number: orderDetails[0].phone_number,
          total_price: orderDetails[0].total_price,
          notes: orderDetails[0].notes,
          created_at: orderDetails[0].created_at,
          updated_at: orderDetails[0].updated_at,
          windows: orderDetails.map(detail => ({
              window_id: detail.window_id,
              window_number: detail.window_number,
              width: detail.width,
              height: detail.height,
          })),
      };

      res.status(200).json(order);
  } catch (err) {
      console.error('Error fetching order details:', err);
      res.status(500).json({ message: 'An error occurred while retrieving the order.' });
  }
});



  router.put('/orders/:orderId/update-checkout-id', async (req, res) => {
    const { orderId } = req.params;
    const { CheckoutRequestID } = req.body;

    try {
        const [result] = await pool.query(
            `UPDATE curtains_orders SET CheckoutRequestID = ? WHERE order_id = ?`,
            [CheckoutRequestID, orderId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }

        res.json({ success: true, message: 'Order updated successfully.' });
    } catch (error) {
        console.error('Error updating CheckoutRequestID:', error);
        res.status(500).json({ success: false, message: 'Failed to update order.' });
    }
});


module.exports = router;
