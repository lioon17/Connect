require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const axios = require('axios');
const moment = require('moment');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const nodemailer = require('nodemailer');


 

const db = require('./config/db');
const authRoutes = require('./routes/auth_routes');
const productsRoute = require('./routes/products');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlist_routes');
const curtainRoutes = require('./routes/curtains_routes');
const dashboardRoutes = require('./routes/dashboard_routes')
const isAuthenticated = require('./middleware/auth'); 
const isAdmin = require('./middleware/authMiddleware'); 

const app = express();
app.set('view engine', 'ejs');

// Session store
const sessionStore = new MySQLStore({}, db);

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(session({
    key: 'connect',
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 },
    
}));

// Routes
app.use(authRoutes);
app.use(productsRoute);
app.use(cartRoutes);
app.use(wishlistRoutes);
app.use(curtainRoutes);
app.use(dashboardRoutes);




app.get('/', (req, res) => res.render('index', { title: 'Home Page' }));
app.get('/login', (req, res) => res.render('login', { title: 'Login' }));
app.get('/product', (req, res) => res.render('product', { title: 'Products' }));
app.get('/curtains', (req, res) => res.render('curtains', { title: 'curtains' }));
app.get('/products', (req, res) => res.render('products', { title: 'products' }));
app.get('/checkout', (req, res) => res.render('checkout', { title: 'checkout' }));
app.get('/dashboard',isAdmin, (req, res) => res.render('dashboard', { title: 'dashboard' }));
app.get('/contact', (req, res) => res.render('contact', { title: 'contact us' }));
app.get('/about', (req, res) => res.render('about', { title: 'about' }));
app.get('/privacy-policy', (req, res) => res.render('privacy-policy', { title: 'Privacy Policy' }));
app.get('/Tracking-orders', (req, res) => res.render('Tracking-orders', { title: 'Tracking Orders' }));
app.get('/customer-account', isAuthenticated, (req, res) => {res.render('customer-account', { title: 'customers account' });});
app.get('/curtains-ordersummary', (req, res) => res.render('curtains-ordersummary', { title: ' ordersummary' }));
app.get('/complete-purchase', (req, res) => res.render('complete-purchase', { title: 'complete purchase' }));

app.get('/product-details', async (req, res, next) => {
    const productId = req.query.id;
    try {
        const [productResult] = await db.query('SELECT * FROM products WHERE id = ?', [productId]);
        if (productResult.length === 0) return res.status(404).send('Product not found');
        const product = productResult[0];
        const [imageResults] = await db.query('SELECT image_url, image_type FROM product_images WHERE product_id = ?', [productId]);
        res.render('product-details', { product, images: imageResults });
    } catch (error) {
        console.error('Error fetching product details:', error);
        next(error);
    }
});

app.get('/wishlist', async (req, res) => {
  const userId = req.session.user_id; // Assuming you store the user's ID in session

  if (!userId) {
      return res.redirect('/login'); // Redirect to login if not authenticated
  }

  try {
      const [wishlist] = await db.query(
          `SELECT 
              p.id AS product_id, 
              p.title, 
              p.category, 
              p.price, 
              w.wishlist_id, 
              i.image_url 
           FROM 
              products p
           JOIN 
              wishlist w 
           ON 
              p.id = w.product_id
           LEFT JOIN 
              product_images i 
           ON 
              p.id = i.product_id 
           WHERE 
              w.user_id = ? AND i.image_type = 'front'`,
          [userId]
      );
      res.render('wishlist', { title: 'Wishlist', wishlist });
  } catch (error) {
      console.error('Error fetching wishlist:', error);
      res.status(500).render('error', { message: 'Failed to load wishlist', error });
  }
});



// Database connection test
(async () => {
    try {
        const [rows] = await db.query('SELECT 1 + 1 AS result');
        console.log('Database connected:', rows[0].result === 2 ? 'Success' : 'Failure');
    } catch (err) {
        console.error('Database connection failed:', err.message);
    }
})();

// Error-handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err.stack);
    res.status(500).send('Internal Server Error');
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

// STK Push Function// Function to normalize and validate the phone number
function formatPhoneNumber(phoneNumber) {
    // Remove any whitespace or special characters
    phoneNumber = phoneNumber.trim();

    // If the number starts with '0', replace '0' with '254'
    if (phoneNumber.startsWith('0')) {
        phoneNumber = '254' + phoneNumber.slice(1);
    }

    // Validate the phone number
    const isValidPhoneNumber = /^254\d{9}$/.test(phoneNumber);
    if (!isValidPhoneNumber) {
        throw new Error("Invalid phone number format. Please use '254xxxxxxxxx' or '07xxxxxxxx' formats.");
    }

    return phoneNumber;
}

// STK Push Function
app.post('/stkpush', async (req, res) => {
    const { phoneNumber, amount } = req.body;

    try {
        if (!phoneNumber || !amount) {
            return res.status(400).json({ message: "Phone number and amount are required" });
        }

        // Normalize and validate the phone number
        const formattedPhoneNumber = formatPhoneNumber(phoneNumber);

        // Mpesa API preparation
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

        const response = await axios.post(url, data, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        res.status(200).json({
            message: "STK push sent successfully",
            response: response.data,
        });
    } catch (error) {
        console.error('Error during STK Push:', error);

        res.status(500).json({
            message: error.message || "An error occurred while processing the STK Push request.",
        });
    }
});


app.post('/callback', async (req, res) => {
    try {
        console.log('Received STK PUSH CALLBACK:', JSON.stringify(req.body, null, 2));

        const callbackData = req.body.Body?.stkCallback;
        if (!callbackData) {
            console.error('Invalid callback data:', req.body);
            return res.status(400).json({ message: 'Invalid callback data' });
        }

        const { CheckoutRequestID, ResultCode, ResultDesc } = callbackData;
        const callbackMetadata = callbackData.CallbackMetadata;

        if (!callbackMetadata?.Item) {
            console.error('Missing CallbackMetadata:', callbackData);
            return res.status(400).json({ message: 'Invalid CallbackMetadata' });
        }

        const Amount = callbackMetadata.Item.find(item => item.Name === 'Amount')?.Value || 0;
        const MpesaReceiptNumber = callbackMetadata.Item.find(item => item.Name === 'MpesaReceiptNumber')?.Value || null;

        console.log('Parsed Callback Data:', { CheckoutRequestID, ResultCode, ResultDesc, Amount, MpesaReceiptNumber });

        // Check which table the CheckoutRequestID belongs to
        const [orders] = await db.query(`SELECT * FROM orders WHERE CheckoutRequestID = ?`, [CheckoutRequestID]);
        if (orders.length > 0) {
            if (ResultCode === 0) {
                await db.query(
                    `UPDATE orders SET payment_status = ?, total_amount = ?, CheckoutRequestID = ?
                     WHERE order_id = ?`,
                    ['paid', Amount, MpesaReceiptNumber, orders[0].order_id]
                );
                console.log('Order payment status updated for orders table.');
            }
        } else {
            const [curtainOrders] = await db.query(`SELECT * FROM curtains_orders WHERE CheckoutRequestID = ?`, [CheckoutRequestID]);
            if (curtainOrders.length > 0) {
                if (ResultCode === 0) {
                    await db.query(
                        `UPDATE curtains_orders SET payment_status = ?, total_price = ?, CheckoutRequestID = ?
                         WHERE order_id = ?`,
                        ['paid', Amount, MpesaReceiptNumber, curtainOrders[0].order_id]
                    );
                    console.log('Order payment status updated for curtains_orders table.');
                }
            } else {
                console.error('No matching order found for CheckoutRequestID:', CheckoutRequestID);
            }
        }

        res.status(200).json({ message: 'Callback processed successfully' });
    } catch (error) {
        console.error('Error processing callback:', error);
        res.status(500).json({ message: 'Error processing callback', error: error.message });
    }
});




  
 

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
  



// Route to handle contact form submissions
app.post('/send-message', async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return res.status(400).send('All fields are required.');
    }

    try {
        // Create a Nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail', // or any other email provider (e.g., Yahoo, Outlook)
            auth: {
                user: process.env.EMAIL_USER, // Your email from environment variables
                pass: process.env.EMAIL_PASS, // App password or email password
            },
        });

        // Email options
        const mailOptions = {
            from: `"${name}" <${email}>`,
            to: process.env.RECEIVER_EMAIL, // Your email to receive the messages
            subject: subject,
            text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
        };

        // Send the email
        await transporter.sendMail(mailOptions);

        res.status(200).send('Message sent successfully!');
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).send('Failed to send the message. Please try again later.');
    }
});

 
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));