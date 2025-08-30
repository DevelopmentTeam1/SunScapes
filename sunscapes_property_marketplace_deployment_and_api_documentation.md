# SunScapes Property Marketplace: Complete Documentation

This document provides a comprehensive overview of the SunScapes platform, covering deployment, API specifications, and user guides for all stakeholders.

---

## 1. Deployment Guide

This guide provides step-by-step instructions for deploying the SunScapes application (React Frontend, PHP Backend, MySQL Database, and Scraper) on a standard Linux server with Apache.

### 1.1. Server Requirements

Ensure the server environment meets the following specifications:

| Component | Requirement | Notes |
| :--- | :--- | :--- |
| **Operating System**| Any modern Linux distribution | e.g., Ubuntu 22.04 LTS, CentOS Stream 9 |
| **Web Server** | Apache 2.4+ | `mod_rewrite` must be enabled. |
| **PHP** | Version 8.3+ | |
| **PHP Extensions** | `pdo_mysql`, `curl`, `gd`, `mbstring`, `json`, `xml`| Standard extensions for database, HTTP, images, and data processing. |
| **Database** | MySQL 8.0+ or MariaDB 10.6+ | |
| **Software** | Composer 2.x, Git | For dependency management and version control. |

### 1.2. Deployment Steps

Follow these steps in order to deploy the application.

#### **Step 1: Clone the Repository**

Clone the project source code into your web server's root directory (e.g., `/var/www/html`).

```shell
# Navigate to your web root directory
cd /var/www/html

# Clone the project repository
git clone <your-repository-url> sunscapes

# Navigate into the project directory
cd sunscapes
```

#### **Step 2: Install Dependencies**

Install both backend (PHP) and scraper dependencies using Composer.

```shell
# Install API dependencies (including php-jwt)
composer install --no-dev --optimize-autoloader

# Install scraper dependencies (if they are separate)
# This assumes a composer.json in the scraper's root directory
# For this project, they are combined in the root composer.json
```

#### **Step 3: Configure Environment**

Copy the example configuration file and update it with your environment-specific settings. **Never commit the actual configuration file to version control.**

1.  Navigate to the API configuration directory: `cd api/config`.
2.  Create a `config.php` file based on the reference `config.php` code.
3.  Update the following constants with your production values:

    ```php
    // --- Database Configuration ---
    define('DB_HOST', '127.0.0.1');
    define('DB_NAME', 'sunscapes_db');
    define('DB_USER', 'sunscapes_user');
    define('DB_PASS', 'YOUR_SECURE_DATABASE_PASSWORD');

    // --- JWT Authentication Configuration ---
    // Generate a long, random key using `openssl rand -base64 32` or a similar tool
    define('JWT_SECRET_KEY', 'YOUR_RANDOMLY_GENERATED_SUPER_SECRET_KEY');
    define('JWT_ISSUER', 'https://api.yourdomain.com');
    define('JWT_AUDIENCE', 'https://yourdomain.com');
    ```

#### **Step 4: Set Up the Database**

1.  Create the MySQL database and user.

    ```sql
    CREATE DATABASE sunscapes_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    CREATE USER 'sunscapes_user'@'localhost' IDENTIFIED BY 'YOUR_SECURE_DATABASE_PASSWORD';
    GRANT ALL PRIVILEGES ON sunscapes_db.* TO 'sunscapes_user'@'localhost';
    FLUSH PRIVILEGES;
    ```

2.  Import the database schema.

    ```shell
    mysql -u sunscapes_user -p sunscapes_db < database_schema.sql
    ```
    *Replace `database_schema.sql` with the path to the provided schema file.*

#### **Step 5: Configure Apache Web Server**

1.  Ensure `mod_rewrite` is enabled: `sudo a2enmod rewrite`
2.  Point your Apache Virtual Host configuration to the frontend's build directory (`/var/www/html/sunscapes/public`).
3.  Ensure `AllowOverride All` is set for the directory to allow `.htaccess` files to function.

    **Example Apache Virtual Host:**
    ```apache
    <VirtualHost *:80>
        ServerName yourdomain.com
        DocumentRoot /var/www/html/sunscapes/public

        <Directory /var/www/html/sunscapes/public>
            Options Indexes FollowSymLinks
            AllowOverride All
            Require all granted
        </Directory>

        ErrorLog ${APACHE_LOG_DIR}/error.log
        CustomLog ${APACHE_LOG_DIR}/access.log combined
    </VirtualHost>
    ```

4.  The provided `.htaccess` file in `/api/.htaccess` will handle routing API requests correctly.

#### **Step 6: Set File Permissions**

The web server needs write permissions for the `logs` and `storage` directories.

```shell
# Assuming your web server user is www-data (common on Ubuntu/Debian)
sudo chown -R www-data:www-data /var/www/html/sunscapes/logs
sudo chown -R www-data:www-data /var/www/html/sunscapes/storage

# Set appropriate permissions
sudo chmod -R 775 /var/www/html/sunscapes/logs
sudo chmod -R 775 /var/www/html/sunscapes/storage
```

#### **Step 7: Set Up the Scraper Cron Job**

To automate the property scraping process, add a cron job.

1.  Open the crontab editor: `crontab -e`
2.  Add the following line to run the scraper every 6 hours and log its output:

    ```shell
    0 */6 * * * /usr/bin/php /var/www/html/sunscapes/api/scraper/run.php >> /var/www/html/sunscapes/logs/scraper.log 2>&1
    ```

    *This command executes the `run.php` script, appends its standard output and errors to `scraper.log`.*

### 1.3. Final Checks

-   Visit your domain to ensure the React frontend loads.
-   Test an unauthenticated API endpoint, like `/api/blog/posts`.
-   Attempt to register and log in to test the user authentication flow.
-   Manually run the scraper script from the command line (`php /var/www/html/sunscapes/api/scraper/run.php`) to verify it works before relying on the cron job.

---

## 2. API Documentation (OpenAPI 3.0.3)

This section provides the complete API specification in OpenAPI format. This can be used with tools like Swagger UI for interactive documentation.

```yaml
openapi: 3.0.3
info:
  title: SunScapes Property Marketplace API
  description: API for managing properties, users, agents, and content for the SunScapes platform.
  version: 1.0.0
servers:
  - url: https://api.sunscapes.site/v1
    description: Production Server
paths:
  /users/auth:
    post:
      summary: User Registration & Login
      description: Handles both new user registration and existing user login. The system checks if the email exists. If it does, it attempts to log in. If not, it registers a new user.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  format: email
                  example: user@example.com
                password:
                  type: string
                  format: password
                  example: "strongpassword123"
                first_name:
                  type: string
                  example: "John"
                last_name:
                  type: string
                  example: "Doe"
              required:
                - email
                - password
      responses:
        '200':
          description: Login Successful.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthSuccessResponse'
        '201':
          description: Registration Successful.
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    example: success
                  data:
                    type: object
                    properties:
                      message:
                        type: string
                        example: "Registration successful. Please check your email for a verification code."
                      userId:
                        type: integer
                        example: 101
        '400':
          description: Bad Request (e.g., missing fields).
        '401':
          description: Invalid credentials for login.
  /users/verify:
    post:
      summary: Verify User Email (OTP)
      description: Verifies a new user's account using the One-Time Password (OTP) sent to their email.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                otp:
                  type: string
                  example: "123456"
              required:
                - otp
      responses:
        '200':
          description: Verification Successful.
        '400':
          description: Invalid or expired OTP.
  /users/favorites:
    get:
      summary: Get User's Favorite Properties
      security:
        - bearerAuth: []
      responses:
        '200':
          description: A list of the user's favorite properties.
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Property'
        '401':
          description: Unauthorized.
    post:
      summary: Add a Property to Favorites
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                property_id:
                  type: integer
                  example: 1
              required:
                - property_id
      responses:
        '201':
          description: Favorite added successfully.
        '409':
          description: Conflict (property is already a favorite).
  /users/favorites/{propertyId}:
    delete:
      summary: Remove a Property from Favorites
      security:
        - bearerAuth: []
      parameters:
        - name: propertyId
          in: path
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: Favorite removed successfully.
        '404':
          description: Favorite not found.
  /properties:
    post:
      summary: Create a New Property Listing
      description: Allows verified agents and admins to create new property listings.
      security:
        - bearerAuth: [agent, admin]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Property'
      responses:
        '201':
          description: Property created successfully.
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: integer
                    example: 124
                  message:
                    type: string
        '403':
          description: Forbidden (user is not an agent or admin).
  /properties/search:
    post:
      summary: Search for Properties
      description: Advanced property search using various filters.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                property_type:
                  type: string
                  enum: [house, condo, land, villa]
                min_price:
                  type: number
                max_price:
                  type: number
                bedrooms:
                  type: integer
                city:
                  type: string
                is_ocean_view:
                  type: boolean
                lifestyle_tags:
                  type: array
                  items:
                    type: string
                page:
                  type: integer
                  default: 1
                limit:
                  type: integer
                  default: 10
      responses:
        '200':
          description: A list of matching properties.
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Property'
  /properties/{propertyId}/inquire:
    post:
      summary: Send an Inquiry for a Property
      parameters:
        - name: propertyId
          in: path
          required: true
          schema:
            type: integer
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
                email:
                  type: string
                  format: email
                message:
                  type: string
                phone:
                  type: string
              required:
                - name
                - email
                - message
      responses:
        '201':
          description: Inquiry sent successfully.
  /scraper/run:
    post:
      summary: Manually trigger the web scraper
      description: Admin-only endpoint to start a scraper run immediately.
      security:
        - bearerAuth: [admin]
      responses:
        '200':
          description: Scraper run initiated.
        '403':
          description: Forbidden.

components:
  schemas:
    Property:
      type: object
      properties:
        id:
          type: integer
          readOnly: true
        agent_id:
          type: integer
        status:
          type: string
          enum: [for_sale, for_rent, foreclosure, sold, rented, pending, draft]
        property_type:
          type: string
          enum: [residential, commercial, industrial, apartment, house, condo, land, ranch, villa]
        title:
          type: string
        description:
          type: string
        price_usd:
          type: number
          format: double
        city:
          type: string
        state_province:
          type: string
        latitude:
          type: number
          format: double
        longitude:
          type: number
          format: double
        bedrooms:
          type: integer
        bathrooms:
          type: number
        sqft_interior:
          type: integer
        is_ocean_view:
          type: boolean
        main_image_url:
          type: string
          format: uri
        image_urls:
          type: array
          items:
            type: string
            format: uri
        lifestyle_tags:
          type: array
          items:
            type: string
    User:
      type: object
      properties:
        id:
          type: integer
        email:
          type: string
          format: email
        first_name:
          type: string
        last_name:
          type: string
        role:
          type: string
          enum: [buyer, seller, agent, admin]
    AuthSuccessResponse:
      type: object
      properties:
        status:
          type: string
          example: success
        data:
          type: object
          properties:
            token:
              type: string
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            user:
              type: object
              properties:
                id:
                  type: integer
                  example: 12
                role:
                  type: string
                  example: "buyer"
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

---

## 3. User Manual (For Buyers & Sellers)

Welcome to SunScapes! This guide will help you navigate the platform to find your perfect property in paradise or connect with interested buyers.

### **Getting Started**

1.  **Registering Your Account:**
    *   Click the "Sign In" or "Register" button.
    *   Provide your name, email, and a secure password. The system will automatically detect if you are a new user and begin the registration process.
    *   You will receive a 6-digit verification code (OTP) in your email. Enter this code when prompted to activate your account.

2.  **Logging In:**
    *   Once registered, use the same form with your email and password to log in.

### **Finding Your Dream Property**

-   **Simple Search:** Use the main search bar on the homepage to search by location (e.g., "Cabo San Lucas"), property type, or price range.
-   **Advanced Search & Map Explorer:**
    *   Click "Explore on Map" or navigate to the main properties page for a detailed map view.
    *   Use the filters to narrow down your search by bedrooms, bathrooms, amenities (like Pool or Ocean View), and lifestyle tags (like Golf or Surf).
    -   You can draw a custom area on the map to see listings only within that specific zone.
-   **Dream Property Quiz:** Not sure where to start? Take our interactive "Dream Property Quiz" from the "Tools" menu. Answer a few lifestyle questions, and we'll suggest properties that match your personality and desires.

### **Exploring Listings**

-   **Property Cards:** Listings are shown as cards with a primary photo and key details like price, beds, and baths.
-   **Saving Favorites:** Click the heart icon (🤍) on any property card or detail page to save it to your dashboard. The icon will turn orange (🧡) to show it's a favorite.
-   **Property Detail Page:** Click on a property to see a full description, a gallery of high-resolution photos, a 360° virtual tour (if available), and detailed information.

### **Using Our Tools**

Located in the main navigation under "Tools," you'll find:
-   **Investment ROI Calculator:** Estimate the potential return on a rental property.
-   **Cost of Living Calculator:** Compare estimated monthly expenses between different cities in BCS.
-   **Climate Comparison Tool:** See how the weather differs between locations like La Paz and Cabo.
-   **Neighborhood Explorer:** An interactive map to view amenities like schools, hospitals, and restaurants near properties.

### **Making an Inquiry**

Found a property you love?
1.  On the property detail page, fill out the inquiry form with your name, email, and message.
2.  Your message will be sent directly to the listing agent.
3.  You can also use the integrated WhatsApp button for a more immediate connection.

### **Managing Your Dashboard**

-   Click "Dashboard" in the main menu to access your personal space.
-   Here you can view your **Saved Favorites**, manage your **Saved Searches**, and securely upload/manage personal documents for your property transaction.

---

## 4. Agent Training Materials

Welcome to the SunScapes platform, designed to connect you with qualified buyers from around the world. This guide will help you maximize your success.

### **Managing Your Public Profile**

Your profile is your digital business card. It's crucial for building trust with potential clients.
1.  **Access:** Log in and navigate to your Dashboard, then click "My Profile."
2.  **Key Elements:**
    *   **Profile Picture:** Upload a professional headshot.
    *   **Bio:** Write a compelling summary of your experience, specialties, and why you love working in BCS real estate.
    *   **Contact Information:** Ensure your phone, email, and WhatsApp number are correct.
    *   **Specialties & Languages:** Select tags that accurately reflect your areas of expertise (e.g., "Luxury Condos," "Investment Properties") and the languages you speak.

### **The Agent Verification System**

Trust is our most important asset. Our multi-tier verification system gives clients confidence.
-   **SunScapes Certified:** Our internal verification.
-   **MLS Verified:** Shows you are an active member of the local MLS.
-   **Certifications:** To enhance your profile, upload proof of any certifications or awards (e.g., "Top Producer 2024"). Our admin team will review and approve them, adding official badges to your profile.

### **Listing and Managing Properties**

1.  **Creating a Listing:**
    *   From your dashboard, click "Create New Listing."
    *   Fill out all fields with accurate and detailed information. The more detail you provide, the better your listing will perform.
    *   **Photos are critical:** Upload high-quality, professional photos. The first image will be the main photo.
    *   **360° Tours:** If you have a Matterport or similar virtual tour, add the link to the designated field.
    *   **Lifestyle Tags:** Select all relevant tags (e.g., `golf_community`, `marina_access`, `pet_friendly`) to appear in filtered searches.

2.  **Managing Existing Listings:**
    *   Your dashboard will display all your active listings.
    *   You can edit details, update the status (e.g., from "For Sale" to "Pending"), and manage photos at any time.

### **Responding to Inquiries**

-   When a user sends an inquiry on one of your listings, you will receive an email notification containing the user's message and contact details.
-   **Speed is key:** We encourage responding to all inquiries within 24 hours to provide the best client experience.
-   Your dashboard will have an "Inquiries" tab where you can track all incoming leads and manage their status (`new`, `contacted`, `closed`).