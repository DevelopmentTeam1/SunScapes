# SunScapes Property Marketplace
![SunScapes Logo](https://r2.flowith.net/files/4a9e2ea6-7bb8-4edd-a812-957afef9b132/1755746305074-logo_sm@180x131.png)

## Project Overview
SunScapes is a world-class, feature-rich, and conversion-optimized property marketplace specializing in Baja California Sur (BCS), Mexico. The platform is designed to be the definitive resource for buyers, sellers, and agents in the BCS real estate market, offering a luxurious yet approachable user experience. It combines a powerful PHP backend, a dynamic frontend, and an automated data aggregation system to provide the most comprehensive and up-to-date listings, alongside a suite of powerful tools to facilitate the buying process.

## Key Features
The platform is built around three core pillars: Buyer Conversion, Trust & Credibility, and Core Platform capabilities.

*   **Advanced Property Search:** Filter properties by dozens of criteria, including lifestyle tags (`golf_community`, `surf_spot`, etc.). Users can also draw custom search areas on an interactive map.
*   **Automated Web Scraper:** A modular PHP system aggregates listings from various sources like MLS feeds (XML, CSV) and real estate portals (e.g., EasyAviso) to ensure our database is comprehensive and current.
*   **Buyer Conversion Tools:** A suite of interactive tools to engage users and guide their decisions, including:
    *   *Dream Property Quiz:* Matches user lifestyle preferences to properties.
    *   *Investment ROI Calculator:* Projects potential rental income.
    *   *Cost of Living Calculator:* Compares expenses between different cities in BCS.
    *   *Neighborhood Explorer:* An interactive map with layers for schools, healthcare, restaurants, and more.
*   **Agent Verification System:** A multi-tier badge system (`SunScapes Certified`, `MLS Verified`, `Top Producer`) to build trust and highlight top-performing agents.
*   **User & Agent Dashboards:** Personalized spaces for buyers to save favorites and searches, and for agents to manage their profiles and listings.
*   **Secure Document Portal:** A secure area within the user dashboard for uploading and managing sensitive documents related to property transactions.
*   **Multilingual Support:** Full internationalization (i18n) for English, Spanish, French, German, and Mandarin, including `hreflang` tags for optimal SEO.
*   **Virtual Tour Scheduling:** Integrated system for users to request and schedule live virtual tours with agents.
*   **Admin Dashboard:** Backend infrastructure for managing users, properties, content, and system operations like the scraper.

## Technology Stack

| Category | Technology / Library | Description |
| :--- | :--- | :--- |
| **Frontend** | React 18+ with TypeScript | The super prompt specifies React, though the final deliverables were static HTML/JS files representing the compiled output. |
| **Styling** | Tailwind CSS | A utility-first CSS framework for rapid, custom UI development. |
| **Backend** | PHP 8.3 | Secure, modern PHP for the REST API and scraper system. |
| **Database** | MySQL 8.0+ | A robust relational database to store all platform data. |
| **Web Server** | Apache 2.4+ | Configured with `mod_rewrite` for clean URLs. |
| **API Dependencies** | `firebase/php-jwt` | For handling JSON Web Token authentication. |
| **Scraper Dependencies** | `guzzlehttp/guzzle`, `symfony/dom-crawler` | For making HTTP requests and parsing HTML content. |
| **Dependency Mgmt** | Composer | For managing PHP packages for the backend and scraper. |

## Project Structure
The project is organized in a modular structure designed for clear separation of concerns between the frontend, backend, and stored assets.

```plaintext
/var/www/html/sunscapes/
├── public/          # React build output (Frontend entry point)
│   ├── index.html
│   ├── static/
│   └── .htaccess
├── api/             # PHP REST API and Scraper (Backend)
│   ├── config/      # Database and application configuration
│   ├── controllers/ # Handles business logic for API endpoints
│   ├── middleware/  # Auth, Rate Limiting, etc.
│   ├── models/      # Database interaction logic
│   ├── utils/       # API helpers (ApiResponse, Logger)
│   ├── scraper/     # Web scraper system
│   └── index.php    # Main API router
├── storage/         # Writable directory by the web server
│   ├── images/      # Optimized property images
│   ├── documents/   # User-uploaded documents
│   └── cache/       # Application cache
├── translations/    # JSON files for internationalization (i18n)
├── logs/            # Application, scraper, and error logs
└── backups/         # Database and file backups
```

## Setup and Installation
Follow these steps to set up the SunScapes marketplace on a Linux/Apache server.

1.  **Prerequisites**
    *   Linux OS (e.g., Ubuntu 22.04)
    *   Apache 2.4+ with `mod_rewrite` enabled
    *   PHP 8.3+ with extensions: `pdo_mysql`, `curl`, `gd`, `json`, `mbstring`, `xml`
    *   MySQL 8.0+
    *   Composer 2.x
    *   Git

2.  **Clone the Repository**
    ```shell
    git clone <your-repository-url> /var/www/html/sunscapes
    cd /var/www/html/sunscapes
    ```

3.  **Install Dependencies**
    Install all PHP dependencies for the API and scraper.
    ```shell
    composer install --no-dev --optimize-autoloader
    ```

4.  **Database Setup**
    a. Create the MySQL database and user.
    ```sql
    CREATE DATABASE sunscapes_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    CREATE USER 'sunscapes_user'@'localhost' IDENTIFIED BY 'YOUR_SECURE_PASSWORD';
    GRANT ALL PRIVILEGES ON sunscapes_db.* TO 'sunscapes_user'@'localhost';
    FLUSH PRIVILEGES;
    ```
    b. Import the database schema from the provided SQL file.
    ```shell
    mysql -u sunscapes_user -p sunscapes_db < database_schema.sql
    ```

5.  **Environment Configuration**
    a. Copy the example configuration file and edit it. **Do not commit this file.**
    b. Open `api/config/config.php` and set your production values:
    ```php
    // In /api/config/config.php
    define('DB_HOST', '127.0.0.1');
    define('DB_NAME', 'sunscapes_db');
    define('DB_USER', 'sunscapes_user');
    define('DB_PASS', 'YOUR_SECURE_PASSWORD');

    // Generate a new key using: openssl rand -base64 32
    define('JWT_SECRET_KEY', 'YOUR_RANDOMLY_GENERATED_SUPER_SECRET_KEY'); 
    define('JWT_ISSUER', 'https://api.sunscapes.site');
    define('JWT_AUDIENCE', 'https://sunscapes.site');
    ```

6.  **Web Server Configuration**
    Set up an Apache Virtual Host to point to the `public` directory.
    ```apache
    <VirtualHost *:80>
        ServerName yourdomain.com
        DocumentRoot /var/www/html/sunscapes/public

        <Directory /var/www/html/sunscapes/public>
            Options Indexes FollowSymLinks
            AllowOverride All
            Require all granted
        </Directory>
        
        # Point API requests to the API handler
        Alias /api /var/www/html/sunscapes/api
        <Directory /var/www/html/sunscapes/api>
            AllowOverride All
            Require all granted
        </Directory>

        ErrorLog ${APACHE_LOG_DIR}/sunscapes_error.log
        CustomLog ${APACHE_LOG_DIR}/sunscapes_access.log combined
    </VirtualHost>
    ```
    Ensure `mod_rewrite` is enabled: `sudo a2enmod rewrite && sudo systemctl restart apache2`.

7.  **Set File Permissions**
    The web server needs write access to the `logs` and `storage` directories.
    ```shell
    sudo chown -R www-data:www-data /var/www/html/sunscapes/logs /var/www/html/sunscapes/storage
    sudo chmod -R 775 /var/www/html/sunscapes/logs /var/www/html/sunscapes/storage
    ```

8.  **Automate the Scraper**
    Add the scraper script to the system's cron table to run automatically. Open the crontab editor with `crontab -e` and add the following line to run it every 6 hours:
    ```shell
    0 */6 * * * /usr/bin/php /var/www/html/sunscapes/api/scraper/run.php >> /var/www/html/sunscapes/logs/scraper.log 2>&1
    ```

## Usage
-   **Buyers:** Register for an account to save favorite properties, create saved searches for new listing alerts, and use the full suite of buyer tools. Make inquiries on properties via the forms or integrated WhatsApp buttons.
-   **Agents:** Once verified by an admin, agents can manage their public profile, add and update their property listings, and will receive inquiries directly from interested buyers.
-   **Admins:** Access the admin dashboard (not publicly available) to manage users, verify agents, moderate content, view analytics, and manually trigger system processes like the web scraper.

## Final Deliverables
The complete project package includes the following components:

*   **Website Files:** A complete zip archive containing all frontend and backend source code.
*   **Documentation:**
    *   This `README.md` file.
    *   API Documentation in OpenAPI 3.0 format.
    *   Detailed User Manual and Agent Training materials.
    *   A comprehensive Deployment Guide.
*   **Assets:**
    *   Logo variations and a complete icon library.
    *   Templates for emails and social media.
*   **Scripts:**
    *   Database schema setup script (`database_schema.sql`).
    *   Configuration examples and cron job commands.