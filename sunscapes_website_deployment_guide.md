# SunScapes Website Deployment: Your Step-by-Step Guide

**To**: The SunScapes Team
**From**: Claude Opus 4.1, Project Leader
**Subject**: Guide to Making the SunScapes Website Live

This guide provides a simple, step-by-step checklist for uploading the final project files to your web server. No technical expertise is required—just follow these instructions carefully.

---

### **Before You Begin: Your Deployment Toolkit**

Make sure you have the following two items ready:

1.  **The Final Project ZIP File:** This is the compressed archive containing all the website files. Let's assume it's named `SunScapes_Final_Website.zip`.
2.  **Web Server Login Details:** You'll need the username and password for your web hosting account, which gives you access to the server's File Manager or FTP.

---

### **Step 1: Understanding Your Web Server's Filing System**

Think of your web server as a digital filing cabinet. We need to place our files in the correct drawers so the internet can find them. The main folder for public websites is usually called `/var/www/html/`.

Inside this main folder, we will create a dedicated home for our project called `sunscapes`. This keeps everything organized.

> **Our Goal:** To replicate the correct folder structure inside `/var/www/html/sunscapes/` on your server, matching the contents of your ZIP file.



---

### **Step 2: The Folder-by-Folder Upload Checklist**

Unzip the `SunScapes_Final_Website.zip` file on your computer. You will see a set of folders. The following guide tells you exactly where each folder and its contents should go on the web server.

#### **1. The `/public/` Folder**
*   **What it is:** This is the most important folder. It contains the actual, visible website that your visitors will see—the homepage, property listings, images, and interactive elements.
*   **Action:**
    1.  On your web server, navigate to `/var/www/html/sunscapes/`.
    2.  Find the `public` folder inside your unzipped project files on your computer.
    3.  Upload the **entire `public` folder** and all its contents into the `sunscapes` directory on your server.

#### **2. The `/api/` Folder**
*   **What it is:** This is the "engine" of your website. It handles things like user logins, property searches, and contact forms. It works in the background and isn't directly visible to visitors.
*   **Action:**
    1.  On your web server, stay in the `/var/www/html/sunscapes/` directory.
    2.  Find the `api` folder on your computer.
    3.  Upload the **entire `api` folder** to the `sunscapes` directory on your server.

#### **3. The `/storage/` Folder**
*   **What it is:** This folder is a secure storage space. It's designed to hold property images uploaded by the system and important documents uploaded by users. It starts empty.
*   **Action:**
    1.  This folder might not be in your ZIP file. If it's not, you must **create it manually** on the server.
    2.  Inside `/var/www/html/sunscapes/`, create a new, empty folder and name it `storage`.
    3.  *Important:* Your web host may need to set special "write permissions" for this folder so the website can save files here.

#### **4. The `/translations/` Folder**
*   **What it is:** This folder contains the text for all the different languages supported by the site (English, Spanish, French, etc.).
*   **Action:**
    1.  On your web server, stay in the `/var/www/html/sunscapes/` directory.
    2.  Find the `translations` folder on your computer.
    3.  Upload the **entire `translations` folder** to the `sunscapes` directory on your server.

#### **5. The `/logs/` and `/backups/` Folders**
*   **What they are:** These are housekeeping folders. `logs` is used for technical troubleshooting, and `backups` is for storing safety copies of your data. They are not part of the public website.
*   **Action:**
    1.  Like the `storage` folder, these may need to be created manually on the server if they are not in the ZIP file.
    2.  Inside `/var/www/html/sunscapes/`, create two new, empty folders: one named `logs` and one named `backups`.

---

### **Summary of Final Structure**

Once you're done, your file structure on the server should look like this. The table below summarizes what goes where.

| Destination on Web Server | Purpose | What You Need to Do |
| :--- | :--- | :--- |
| **`/var/www/html/sunscapes/public/`** | The visible website (frontend). | Upload the `public` folder from the ZIP. |
| **`/var/www/html/sunscapes/api/`** | The website's "engine" (backend). | Upload the `api` folder from the ZIP. |
| **`/var/www/html/sunscapes/storage/`** | Stores property images & documents. | Create this folder empty on the server. |
| **`/var/www/html/sunscapes/translations/`** | Holds all language files. | Upload the `translations` folder from the ZIP. |
| **`/var/www/html/sunscapes/logs/`** | For technical logs. | Create this folder empty on the server. |
| **`/var/www/html/sunscapes/backups/`** | For data backups. | Create this folder empty on the server. |

---

### **Final Step: Pointing Your Domain**

After all files are uploaded, the final step is to tell your domain name (e.g., `www.sunscapes.site`) to point to the `/var/www/html/sunscapes/public` folder. This is a quick setting that your web hosting support team can typically do for you in a few minutes.

**Congratulations!** Once that final setting is adjusted, your SunScapes Property Marketplace will be live for the world to see.