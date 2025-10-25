require("dotenv").config();
const http = require("http");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/burgerdb")
    .then(() => console.log("DB Connected"))
    .catch(err => console.error("DB Connection Error:", err));

// Define schema and model
const customerSchema = new mongoose.Schema({
    name: String,
    email: String,
    date: String,
    time: String,
    people: String
});
const customerModel = mongoose.model('burgerbookings', customerSchema);

// Create server
const server = http.createServer((req, res) => {
    let filePath;

    // Serve index.html from frontend_ folder
    if (req.url === "/") {
        filePath = path.join(__dirname, "../frontend_", "index.html");
    } else {
        filePath = path.join(__dirname, "../frontend_", req.url);
    }

    const extname = path.extname(filePath).toLowerCase();
    const mimeTypes = {
        ".html": "text/html",
        ".js": "text/javascript",
        ".css": "text/css",
        ".json": "application/json",
        ".png": "image/png",
        ".jpg": "image/jpg",
        ".jpeg": "image/jpeg",
        ".gif": "image/gif",
        ".mp4": "video/mp4"
    };
    const contentType = mimeTypes[extname] || "text/html";

    // Handle POST /book
    if (req.url === "/book" && req.method === "POST") {
        let body = "";
        req.on("data", chunk => body += chunk.toString());
        req.on("end", () => {
            const formData = new URLSearchParams(body);
            const booking = {
                name: formData.get("name"),
                email: formData.get("email"),
                date: formData.get("date"),
                time: formData.get("time"),
                people: formData.get("people")
            };

            customerModel.create(booking)
                .then(() => {
                    console.log("Booking saved:", booking);
                    res.writeHead(200, { "Content-Type": "text/html" });
                    res.end(`
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Booking Confirmation</title>
                            <style>
                                body {
                                    font-family: Arial, sans-serif;
                                    background-color: #f4f4f4;
                                    display: flex;
                                    flex-direction: column;
                                    align-items: center;
                                    justify-content: center;
                                    height: 100vh;
                                    margin: 0;
                                }
                                h1 { color: #4CAF50; }
                                p { font-size: 1.2em; margin: 5px 0; }
                                a {
                                    text-decoration: none;
                                    color: white;
                                    background-color: #4CAF50;
                                    padding: 10px 20px;
                                    border-radius: 5px;
                                }
                                a:hover { background-color: #45a049; }
                            </style>
                        </head>
                        <body>
                            <h1>Thank You for Your Booking!</h1>
                            <p>Name: ${booking.name}</p>
                            <p>Email: ${booking.email}</p>
                            <p>Date: ${booking.date}</p>
                            <p>Time: ${booking.time}</p>
                            <p>People: ${booking.people}</p>
                            <a href="/">Go Back</a>
                        </body>
                        </html>
                    `);
                })
                .catch(err => {
                    console.error("Error saving booking:", err);
                    res.writeHead(500, { "Content-Type": "text/html" });
                    res.end("<h1>Internal Server Error</h1><p>Unable to save booking.</p>");
                });
        });
        return;
    }

    // Handle GET /view
    if (req.url === "/view" && req.method === "GET") {
        customerModel.find().then(customers => {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.write("<h1>All Bookings</h1>");
            res.write("<table border=1 cellspacing=0 width=600>");
            res.write("<tr><th>Name</th><th>Email</th><th>Date</th><th>Time</th><th>People</th></tr>");
            customers.forEach(c => {
                res.write(`<tr><td>${c.name}</td><td>${c.email}</td><td>${c.date}</td><td>${c.time}</td><td>${c.people}</td></tr>`);
            });
            res.write("</table>");
            res.end();
        }).catch(err => {
            console.error("Error fetching bookings:", err);
            res.writeHead(500, { "Content-Type": "text/html" });
            res.end("<h1>Internal Server Error</h1><p>Unable to fetch bookings.</p>");
        });
        return;
    }

    // Serve static files
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === "ENOENT") {
                res.writeHead(404, { "Content-Type": "text/html" });
                res.end("<h1>404 Not Found</h1>");
            } else {
                res.writeHead(500, { "Content-Type": "text/plain" });
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            res.writeHead(200, { "Content-Type": contentType });
            res.end(content, "utf-8");
        }
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
