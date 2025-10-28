require("dotenv").config();
const http = require("http");
const mongoose = require("mongoose");

// ===============================
// MongoDB Connection
// ===============================
const mongoURI =
  process.env.MONGO_URI || "mongodb://mongo:27017/burgerdb"; // <-- IMPORTANT: Use 'mongo' from docker-compose

mongoose
  .connect(mongoURI)
  .then(() => console.log("✅ DB Connected"))
  .catch((err) => console.error("❌ DB Connection Error:", err.message));

// ===============================
// Define Schemas and Models
// ===============================

// Old schema (so /view still works)
const customerSchema = new mongoose.Schema({
  name: String,
  email: String,
  date: String,
  time: String,
  people: String,
});
const customerModel = mongoose.model("burgerbookings", customerSchema);

// NEW schema for the cart
const orderSchema = new mongoose.Schema({
  items: [String], // An array of burger names
  orderDate: { type: Date, default: Date.now },
});
const orderModel = mongoose.model("orders", orderSchema);

// ===============================
// HTTP Server Setup
// ===============================
const server = http.createServer(async (req, res) => {
  // --- START OF CORS HEADERS ---
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allows all domains
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }
  // --- END OF CORS HEADERS ---

  // ===============================
  // NEW Route: POST /order
  // ===============================
  if (req.url === "/order" && req.method === "POST") {
    try {
      let body = "";
      req.on("data", (chunk) => (body += chunk.toString()));

      req.on("end", async () => {
        const { items } = JSON.parse(body); // Parse the JSON from the cart
        const newOrder = new orderModel({ items });
        await newOrder.save();

        console.log("✅ Order saved:", items);

        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Order saved successfully!" }));
      });
    } catch (err) {
      console.error("❌ Error saving order:", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Unable to save order." }));
    }
    return;
  }

  // ===============================
  // Route: GET /view (Display all OLD bookings)
  // ===============================
  if (req.url === "/view" && req.method === "GET") {
    try {
      const customers = await customerModel.find();
      res.writeHead(200, { "Content-Type": "text/html" });
      res.write("<h1>All Bookings (Old System)</h1>");
      res.write("<table border=1 cellspacing=0 width=600>");
      res.write("<tr><th>Name</th><th>Email</th><th>Date</th><th>Time</th><th>People</th></tr>");
      customers.forEach((c) => {
        res.write(
          `<tr><td>${c.name}</td><td>${c.email}</td><td>${c.date}</td><td>${c.time}</td><td>${c.people}</td></tr>`
        );
      });
      res.write("</table>");
      res.end();
    } catch (err) {
      console.error("❌ Error fetching bookings:", err);
      res.writeHead(500, { "Content-Type": "text/html" });
      res.end("<h1>500 Internal Server Error</h1><p>Unable to fetch bookings.</p>");
    }
    return;
  }

  // ===============================
  // (Optional) NEW Route: GET /view-orders
  // ===============================
  if (req.url === "/view-orders" && req.method === "GET") {
    try {
      const orders = await orderModel.find().sort({orderDate: -1});
      res.writeHead(200, { "Content-Type": "text/html" });
      res.write("<h1>All New Burger Orders</h1>");
      res.write("<table border=1 cellspacing=0 width=600>");
      res.write("<tr><th>Order Date</th><th>Items</th></tr>");
      orders.forEach((o) => {
        res.write(
          `<tr><td>${o.orderDate.toLocaleString()}</td><td>${o.items.join(", ")}</td></tr>`
        );
      });
      res.write("</table>");
      res.end();
    } catch (err) {
      console.error("❌ Error fetching orders:", err);
      res.writeHead(500, { "Content-Type": "text/html" });
      res.end("<h1>500 Internal Server Error</h1><p>Unable to fetch orders.</p>");
    }
    return;
  }


  // ===============================
  // Default 404 Route
  // ===============================
  res.writeHead(404, { "Content-Type": "text/html" });
  res.end("<h1>404 Not Found</h1><p>This is the API server. The requested route was not found.</p>");
});

// ===============================
// Start Server
// ===============================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
});