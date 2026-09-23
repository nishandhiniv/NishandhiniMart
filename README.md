# NishandhiniMart

## Online Shopping Website - Capstone Project

NishandhiniMart is a full-stack online shopping website developed as a capstone project. The system provides separate features for **Buyers, Sellers, and Administrators**, with product management, shopping, orders, sales management, reviews, analytics, and an AI chatbot.

---

## 📌 Project Overview

NishandhiniMart is designed to provide a complete online shopping experience.

The application consists of:

- Buyer Module
- Seller Module
- Admin Module
- AI Chatbot
- Product Management
- Shopping Cart
- Wishlist
- Order Management
- Reviews and Ratings
- Sales Management
- Reports and Analytics

The backend is developed using **C++ with the Drogon framework** and **PostgreSQL**, while the frontend uses **HTML, CSS, and JavaScript**.

---

## 🎯 Project Objectives

The main objectives of NishandhiniMart are:

- To develop a complete online shopping platform.
- To provide separate dashboards for Buyers, Sellers, and Administrators.
- To allow sellers to manage products and orders.
- To allow buyers to browse and purchase products.
- To provide order tracking and purchase history.
- To provide product reviews and ratings.
- To provide administrators with user, seller, product, and order management.
- To provide sales and analytics information.
- To integrate an AI chatbot for user assistance.
- To deploy the application for online access.

---

# 👥 User Modules

## 🛍️ Buyer Module

The Buyer module provides the complete shopping experience.

### Features

- Buyer registration
- Buyer login
- Product browsing
- Product search
- Product filtering
- Product details
- Add to cart
- Cart management
- Wishlist
- Buy Now
- Checkout
- Order placement
- Order history
- Order tracking
- Purchase history
- Product reviews and ratings
- Buyer profile
- Account settings
- AI chatbot

---

## 🏪 Seller Module

The Seller module allows sellers to manage their products, orders, and sales.

### Features

- Seller login
- Seller dashboard
- Seller account information
- Add products
- Edit products
- Manage products
- Product quantity management
- Stock management
- Low-stock alerts
- Seller order management
- Delivery/status management
- Sales information
- Seller profile
- Seller settings
- Logout

### Seller Dashboard

The Seller Dashboard provides information such as:

- Total products
- Total stock
- Total orders
- Total sales
- Recent orders
- Stock information
- Low-stock alerts
- Seller account information

---

# 👨‍💼 Admin Module

The Admin module provides management and monitoring functionality for the entire platform.

### Features

- Admin login
- Admin dashboard
- User management
- Seller management
- Product management
- Order management
- Payment information
- Reports
- Analytics
- User activity
- Purchase history
- Reviews given by buyers
- Admin settings
- AI chatbot
- Logout

### User Activity

Administrators can view user-related information including:

- Personal details
- Account information
- Buyer purchase history
- Orders
- Reviews
- Seller account information where applicable

---

# 🤖 AI Chatbot

NishandhiniMart includes an AI chatbot to assist users.

The chatbot is integrated into the application and can be accessed through the available chatbot interface.

The backend supports AI provider integration through an environment variable:

```text
GEMINI_API_KEY

The API key is not hard-coded into the source code.

⭐ Reviews and Ratings

The system provides a product review and rating feature.

Buyers can provide ratings and reviews for products they have purchased.

Reviews include:

Product
Rating
Comment
Review date

Administrators can view reviews associated with users.

📊 Reports and Analytics

The Admin module provides information useful for monitoring the shopping platform.

The system supports information related to:

Monthly orders
Product sales
Quantity sold
Total sales
Seller sales
Customer purchasing information
Product purchasing trends
Stock and quantity information
🗄️ Database

NishandhiniMart uses PostgreSQL as its database.

The project contains database tables for major application functions, including:

users
products
cart
orders
order_items
reviews
product_additional_details
Users

Stores buyer, seller, and administrator account information.

Products

Stores product information such as:

Product name
Description
Price
Image
Category
Seller
Quantity
Orders

Stores customer order information.

Order Items

Stores individual products included in orders.

Reviews

Stores product ratings and comments submitted by buyers.

🏗️ System Architecture
                    NishandhiniMart
                           |
          +----------------+----------------+
          |                |                |
       Buyer            Seller            Admin
          |                |                |
          +----------------+----------------+
                           |
                       Frontend
                           |
                  HTML / CSS / JavaScript
                           |
                         API
                           |
                     C++ / Drogon
                           |
                       PostgreSQL
💻 Technologies Used
Frontend
HTML5
CSS3
JavaScript
Backend
C++
Drogon Framework
Database
PostgreSQL
Build Tools
CMake
vcpkg
Containerization
Docker
Deployment
GitHub
GitHub Pages
Render
Version Control
Git
GitHub
📁 Project Structure
NishandhiniMart/
│
├── backend/
│   ├── AI/
│   ├── Chatbot/
│   ├── Controllers/
│   ├── Routes/
│   ├── Services/
│   ├── database/
│   └── test_main.cpp
│
├── frontend/
│   ├── admin/
│   ├── buyer-dashboard/
│   ├── seller-dashboard/
│   ├── chatbot/
│   ├── images/
│   └── login.html
│
├── .github/
│   └── workflows/
│       └── pages.yml
│
├── CMakeLists.txt
├── Dockerfile
├── README.md
└── .gitignore
🔐 Security

The project uses environment variables for sensitive configuration.

For example:

DB_HOST
DB_PORT
DB_NAME
DB_USER
DB_PASSWORD
GEMINI_API_KEY
PORT

Sensitive credentials should not be stored directly in the source code or committed to GitHub.

🐳 Docker

The backend can be built and executed using Docker.

The Docker configuration builds the C++ Drogon backend and exposes the application through the configured server port.

Example:

docker build -t nishandhini-mart .

The application can then be run using Docker with the required database environment variables.

🚀 Local Development
Prerequisites

Make sure the following are installed:

C++
CMake
PostgreSQL
Git
Docker (optional)
Drogon
vcpkg
Backend

Navigate to the project directory:

cd C:\Users\Dell\Desktop\capstone\NishandhiniMart

Build the project:

cmake --build build --config Debug

Run the backend:

.\build\Debug\NishandhiniMart.exe

The local backend runs on:

http://127.0.0.1:8090
🌐 Deployment

The project uses:

Frontend

GitHub Pages

https://nishandhiniv.github.io/NishandhiniMart/
Backend

Render

https://nishandhinimart.onrender.com

The frontend communicates with the deployed backend through the application APIs.

🔗 Live Project
NishandhiniMart

Live Website:

https://nishandhiniv.github.io/NishandhiniMart/

Backend API:

https://nishandhinimart.onrender.com

🧪 Testing

The following modules have been tested in the deployed application:

Buyer Login
Buyer Dashboard
Product Browsing
Cart
Wishlist
Checkout
Orders
Reviews
Seller Login
Seller Dashboard
Product Management
Seller Orders
Sales
Seller Profile
Admin Login
Admin Dashboard
User Management
Seller Management
Product Management
Order Management
Reports
AI Chatbot

The deployed application has been verified through the live GitHub Pages frontend.

📈 Future Enhancements

Possible future enhancements include:

Online payment gateway integration
Advanced product recommendations
Improved AI-powered shopping assistance
Advanced sales analytics
Email notifications
Order notification system
Enhanced mobile responsiveness
Additional security improvements
🎓 Project Type

Capstone Project

Project Name: NishandhiniMart

Domain: E-Commerce / Online Shopping

Backend: C++ / Drogon

Database: PostgreSQL

Frontend: HTML / CSS / JavaScript

👩‍💻 Development

NishandhiniMart was developed as an academic capstone project to demonstrate full-stack application development, database management, REST API development, frontend development, deployment, and integration of AI functionality.


### One important thing

Since your current Git status was clean and the latest changes are already pushed, **don't push this README yet until we review it once**.

After you replace the README, run:

```powershell
git diff -- README.md

Send me that output. I'll check whether the README matches your actual project before you commit it.

# NishandhiniMart

## Online Shopping Website - Capstone Project

NishandhiniMart is a full-stack online shopping website developed as a capstone project. The system provides separate features for **Buyers, Sellers, and Administrators**, with product management, shopping, orders, sales management, reviews, analytics, and an AI chatbot.

---

## 📌 Project Overview

NishandhiniMart is designed to provide a complete online shopping experience.

The application consists of:

- Buyer Module

- Seller Module

- Admin Module

- AI Chatbot

- Product Management

- Shopping Cart

- Wishlist

- Order Management

- Reviews and Ratings

- Sales Management

- Reports and Analytics

The backend is developed using **C++ with the Drogon framework** and **PostgreSQL**, while the frontend uses **HTML, CSS, and JavaScript**.

---

## 🎯 Project Objectives

The main objectives of NishandhiniMart are:

- To develop a complete online shopping platform.

- To provide separate dashboards for Buyers, Sellers, and Administrators.

- To allow sellers to manage products and orders.

- To allow buyers to browse and purchase products.

- To provide order tracking and purchase history.

- To provide product reviews and ratings.

- To provide administrators with user, seller, product, and order management.

- To provide sales and analytics information.

- To integrate an AI chatbot for user assistance.

- To deploy the application for online access.

---

# 👥 User Modules

## 🛍️ Buyer Module

The Buyer module provides the complete shopping experience.

### Features

- Buyer registration

- Buyer login

- Product browsing

- Product search

- Product filtering

- Product details

- Add to cart

- Cart management

- Wishlist

- Buy Now

- Checkout

- Order placement

- Order history

- Order tracking

- Purchase history

- Product reviews and ratings

- Buyer profile

- Account settings

- AI chatbot

---

## 🏪 Seller Module

The Seller module allows sellers to manage their products, orders, and sales.

### Features

- Seller login

- Seller dashboard

- Seller account information

- Add products

- Edit products

- Manage products

- Product quantity management

- Stock management

- Low-stock alerts

- Seller order management

- Delivery/status management

- Sales information

- Seller profile

- Seller settings

- Logout

### Seller Dashboard

The Seller Dashboard provides information such as:

- Total products

- Total stock

- Total orders

- Total sales

- Recent orders

- Stock information

- Low-stock alerts

- Seller account information

---

# 👨‍💼 Admin Module

The Admin module provides management and monitoring functionality for the entire platform.

### Features

- Admin login

- Admin dashboard

- User management

- Seller management

- Product management

- Order management

- Payment information

- Reports

- Analytics

- User activity

- Purchase history

- Reviews given by buyers

- Admin settings

- AI chatbot

- Logout

### User Activity

Administrators can view user-related information including:

- Personal details

- Account information

- Buyer purchase history

- Orders

- Reviews

- Seller account information where applicable

---

# 🤖 AI Chatbot

NishandhiniMart includes an AI chatbot to assist users.

The chatbot is integrated into the application and can be accessed through the available chatbot interface.

The backend supports AI provider integration through an environment variable:

```text

GEMINI_API_KEY ethu mattum tha varuthu

ஆமாம் 👍 புரிகிறது. நீங்கள் README-ஐ paste செய்தபோது அந்த இடத்தில் இருந்து மட்டும் text காட்டுகிறது என்று சொல்கிறீர்கள்.

அதற்கு காரணம் README-ல் இருக்கும் இந்த Markdown code block:

```text
GEMINI_API_KEY

அதற்குப் பிறகு இருக்கும் content இன்னும் paste செய்யப்படவில்லை.

### இப்போது அந்த இடத்திலிருந்து continue பண்ணுங்க

இந்த பகுதியை:

```markdown
The backend supports AI provider integration through an environment variable:

```text
GEMINI_API_KEY

இதற்குப் பிறகு கீழே உள்ள sections-ஐ paste பண்ணுங்க:

```markdown
The API key is not hard-coded into the source code.

---

# ⭐ Reviews and Ratings

The system provides a product review and rating feature.

Buyers can provide ratings and reviews for products they have purchased.

Reviews include:

- Product
- Rating
- Comment
- Review date

Administrators can view reviews associated with users.

---

# 📊 Reports and Analytics

The Admin module provides information useful for monitoring the shopping platform.

The system supports information related to:

- Monthly orders
- Product sales
- Quantity sold
- Total sales
- Seller sales
- Customer purchasing information
- Product purchasing trends
- Stock and quantity information

---

# 🗄️ Database

NishandhiniMart uses PostgreSQL as its database.

The project contains database tables for major application functions, including:

- users
- products
- cart
- orders
- order_items
- reviews
- product_additional_details

---

# 🏗️ System Architecture

```text
NishandhiniMart
       |
       +--- Buyer
       |
       +--- Seller
       |
       +--- Admin
       |
       +--- AI Chatbot
       |
       +--- Frontend
       |      HTML / CSS / JavaScript
       |
       +--- Backend
       |      C++ / Drogon
       |
       +--- Database
              PostgreSQL
💻 Technologies Used
Frontend
HTML5
CSS3
JavaScript
Backend
C++
Drogon Framework
Database
PostgreSQL
Build Tools
CMake
vcpkg
Deployment
Docker
Render
GitHub Pages
Version Control
Git
GitHub
📁 Project Structure
NishandhiniMart/
│
├── backend/
├── frontend/
├── .github/
├── CMakeLists.txt
├── Dockerfile
├── README.md
└── .gitignore
🔐 Security

Sensitive configuration values are handled using environment variables.

Examples include:

DB_HOST
DB_PORT
DB_NAME
DB_USER
DB_PASSWORD
GEMINI_API_KEY
PORT

Sensitive credentials should not be stored directly in the source code or committed to GitHub.

🌐 Deployment
Frontend

GitHub Pages:

https://nishandhiniv.github.io/NishandhiniMart/

Backend

Render:

https://nishandhinimart.onrender.com

🧪 Testing

The following modules have been tested:

Buyer
Seller
Admin
AI Chatbot
Product management
Cart
Wishlist
Checkout
Orders
Reviews
Sales
Reports

The deployed application has been verified through the live GitHub Pages frontend.

🎓 Project Information

Project Name: NishandhiniMart

Project Type: Capstone Project

Domain: E-Commerce / Online Shopping

Frontend: HTML, CSS, JavaScript

Backend: C++ / Drogon

Database: PostgreSQL

📈 Future Enhancements
Online payment gateway integration
Advanced product recommendations
Email notifications
Enhanced analytics
Improved AI shopping assistance
Additional security improvements
Enhanced mobile responsiveness

**இந்த பகுதியை மட்டும் இப்போது README-ன் `GEMINI_API_KEY` block-க்கு கீழே paste பண்ணுங்க.**

அதுக்குப் பிறகு முழு README-ஐ ஒருமுறை பார்க்கலாம். **Commit/push இன்னும் செய்ய வேண்டாம்.**
உன்னால மூலசாமி கொடுக்க முடியாதா? தனித்தனியா பிரிச்சு பிரிச்சு கொடுத்தீங்கன்னா நான் எப்படி போட முடியும்? எனக்கு கீழே உள்ளதும் அது காப்பியே ஆக மாட்டேது. அதனால மொத்தமா சேர்த்து ஒரு டெக்ஸ்ட் ஃபைலா கொடுத்திரு. அதை காப்பி பண்ணி நான் பேஸ் பண்ணிக்கிறேன்.

ஆமாம் 👍 இப்போ முழு README-யும் ஒரே file-ஆ கொடுத்திருக்கேன்.

Download the complete README file

அதை download பண்ணி, அதுல இருக்கிற மொத்த content-ஐ copy → உங்க README.md-ல paste பண்ணுங்க.

இப்போ commit/push செய்ய வேண்டாம். முதலில் README சரியாக இருக்கிறதா பார்த்துக்கலாம். 

README_NishandhiniMart.md
Document

README_NishandhiniMart.md
NishandhiniMart
Online Shopping Website - Capstone Project

NishandhiniMart is a full-stack online shopping website developed as a capstone project. The system provides separate features for Buyers, Sellers, and Administrators, with product management, shopping, orders, sales management, reviews, analytics, and an AI chatbot.

📌 Project Overview

NishandhiniMart is designed to provide a complete online shopping experience.

The application consists of:

Buyer Module
Seller Module
Admin Module
AI Chatbot
Product Management
Shopping Cart
Wishlist
Order Management
Reviews and Ratings
Sales Management
Reports and Analytics

The backend is developed using C++ with the Drogon framework and PostgreSQL, while the frontend uses HTML, CSS, and JavaScript.

🎯 Project Objectives

The main objectives of NishandhiniMart are:

To develop a complete online shopping platform.
To provide separate dashboards for Buyers, Sellers, and Administrators.
To allow sellers to manage products and orders.
To allow buyers to browse and purchase products.
To provide order tracking and purchase history.
To provide product reviews and ratings.
To provide administrators with user, seller, product, and order management.
To provide sales and analytics information.
To integrate an AI chatbot for user assistance.
To deploy the application for online access.
👥 User Modules
🛍️ Buyer Module

The Buyer module provides the complete shopping experience.

Features
Buyer registration
Buyer login
Product browsing
Product search
Product filtering
Product details
Add to cart
Cart management
Wishlist
Buy Now
Checkout
Order placement
Order history
Order tracking
Purchase history
Product reviews and ratings
Buyer profile
Account settings
AI chatbot
🏪 Seller Module

The Seller module allows sellers to manage their products, orders, and sales.

Features
Seller login
Seller dashboard
Seller account information
Add products
Edit products
Manage products
Product quantity management
Stock management
Low-stock alerts
Seller order management
Delivery/status management
Sales information
Seller profile
Seller settings
Logout
Seller Dashboard

The Seller Dashboard provides information such as:

Total products
Total stock
Total orders
Total sales
Recent orders
Stock information
Low-stock alerts
Seller account information
👨‍💼 Admin Module

The Admin module provides management and monitoring functionality for the entire platform.

Features
Admin login
Admin dashboard
User management
Seller management
Product management
Order management
Payment information
Reports
Analytics
User activity
Purchase history
Reviews given by buyers
Admin settings
AI chatbot
Logout
User Activity

Administrators can view user-related information including:

Personal details
Account information
Buyer purchase history
Orders
Reviews
Seller account information where applicable
🤖 AI Chatbot

NishandhiniMart includes an AI chatbot to assist users.

The chatbot is integrated into the application and can be accessed through the available chatbot interface.

The backend supports AI provider integration through an environment variable:

GEMINI_API_KEY

The API key is not hard-coded into the source code.

⭐ Reviews and Ratings

The system provides a product review and rating feature.

Buyers can provide ratings and reviews for products they have purchased.

Reviews include:

Product
Rating
Comment
Review date

Administrators can view reviews associated with users.

📊 Reports and Analytics

The Admin module provides information useful for monitoring the shopping platform.

The system supports information related to:

Monthly orders
Product sales
Quantity sold
Total sales
Seller sales
Customer purchasing information
Product purchasing trends
Stock and quantity information
🗄️ Database

NishandhiniMart uses PostgreSQL as its database.

The project contains database tables for major application functions, including:

users
products
cart
orders
order_items
reviews
product_additional_details
Users

Stores buyer, seller, and administrator account information.

Products

Stores product information such as:

Product name
Description
Price
Image
Category
Seller
Quantity
Orders

Stores customer order information.

Order Items

Stores individual products included in orders.

Reviews

Stores product ratings and comments submitted by buyers.

🏗️ System Architecture
                    NishandhiniMart
                           |
          +----------------+----------------+
          |                |                |
       Buyer            Seller            Admin
          |                |                |
          +----------------+----------------+
                           |
                       Frontend
                           |
                  HTML / CSS / JavaScript
                           |
                         API
                           |
                     C++ / Drogon
                           |
                       PostgreSQL
💻 Technologies Used
Frontend
HTML5
CSS3
JavaScript
Backend
C++
Drogon Framework
Database
PostgreSQL
Build Tools
CMake
vcpkg
Containerization
Docker
Deployment
GitHub
GitHub Pages
Render
Version Control
Git
GitHub
📁 Project Structure
NishandhiniMart/
│
├── backend/
│   ├── AI/
│   ├── Chatbot/
│   ├── Controllers/
│   ├── Routes/
│   ├── Services/
│   ├── database/
│   └── test_main.cpp
│
├── frontend/
│   ├── admin/
│   ├── buyer-dashboard/
│   ├── seller-dashboard/
│   ├── chatbot/
│   ├── images/
│   └── login.html
│
├── .github/
│   └── workflows/
│       └── pages.yml
│
├── CMakeLists.txt
├── Dockerfile
├── README.md
└── .gitignore
🔐 Security

The project uses environment variables for sensitive configuration.

For example:

DB_HOST
DB_PORT
DB_NAME
DB_USER
DB_PASSWORD
GEMINI_API_KEY
PORT

Sensitive credentials should not be stored directly in the source code or committed to GitHub.

🐳 Docker

The backend can be built and executed using Docker.

The Docker configuration builds the C++ Drogon backend and exposes the application through the configured server port.

Example:

docker build -t nishandhini-mart .

The application can then be run using Docker with the required database environment variables.

🚀 Local Development
Prerequisites

Make sure the following are installed:

C++
CMake
PostgreSQL
Git
Docker (optional)
Drogon
vcpkg
Backend

Navigate to the project directory:

cd C:\Users\Dell\Desktop\capstone\NishandhiniMart

Build the project:

cmake --build build --config Debug

Run the backend:

.\build\Debug\NishandhiniMart.exe

The local backend runs on:

http://127.0.0.1:8090
🌐 Deployment

The project uses:

Frontend

GitHub Pages

https://nishandhiniv.github.io/NishandhiniMart/
Backend

Render

https://nishandhinimart.onrender.com

The frontend communicates with the deployed backend through the application APIs.

🔗 Live Project
NishandhiniMart

Live Website:

https://nishandhiniv.github.io/NishandhiniMart/

Backend API:

https://nishandhinimart.onrender.com

🧪 Testing

The following modules have been tested in the deployed application:

Buyer Login
Buyer Dashboard
Product Browsing
Cart
Wishlist
Checkout
Orders
Reviews
Seller Login
Seller Dashboard
Product Management
Seller Orders
Sales
Seller Profile
Admin Login
Admin Dashboard
User Management
Seller Management
Product Management
Order Management
Reports
AI Chatbot

The deployed application has been verified through the live GitHub Pages frontend.

📈 Future Enhancements

Possible future enhancements include:

Online payment gateway integration
Advanced product recommendations
Improved AI-powered shopping assistance
Advanced sales analytics
Email notifications
Order notification system
Enhanced mobile responsiveness
Additional security improvements
🎓 Project Type

Capstone Project

Project Name: NishandhiniMart

Domain: E-Commerce / Online Shopping

Backend: C++ / Drogon

Database: PostgreSQL

Frontend: HTML / CSS / JavaScript

👩‍💻 Development

NishandhiniMart was developed as an academic capstone project to demonstrate full-stack application development, database management, REST API development, frontend development, deployment, and integration of AI functionality.