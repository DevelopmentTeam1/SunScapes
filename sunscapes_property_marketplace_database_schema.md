```sql
-- SunScapes Ultimate Property Marketplace
-- Database Schema for MySQL 8.0+
--
-- This script creates the complete database structure, including tables,
-- relationships, and indexes, to support a world-class property marketplace.
--
-- Best Practices Applied:
-- - InnoDB storage engine for transactional integrity and foreign key support.
-- - utf8mb4 character set for full Unicode support, including emojis.
-- - Comprehensive indexing for high-performance queries.
-- - Clear foreign key constraints with appropriate ON DELETE/ON UPDATE actions.
-- - Descriptive comments for all tables and complex columns.
-- - Use of appropriate data types (JSON for flexible data, DECIMAL for currency).

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =================================================================================
-- Table: users
-- Purpose: Stores all user accounts, including buyers, sellers, agents, and admins.
-- =================================================================================
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `phone_number` VARCHAR(50) NULL,
  `role` ENUM('buyer', 'seller', 'agent', 'admin') NOT NULL DEFAULT 'buyer',
  `is_email_verified` BOOLEAN NOT NULL DEFAULT FALSE,
  `verification_token` VARCHAR(100) NULL,
  `token_expires_at` TIMESTAMP NULL,
  `last_login_at` TIMESTAMP NULL,
  `status` ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores user accounts and their roles.';


-- =================================================================================
-- Table: agent_profiles
-- Purpose: Stores extended information for users with the 'agent' role.
-- =================================================================================
DROP TABLE IF EXISTS `agent_profiles`;
CREATE TABLE `agent_profiles` (
  `user_id` BIGINT UNSIGNED NOT NULL,
  `bio` TEXT NULL,
  `profile_image_url` VARCHAR(255) NULL,
  `agency_name` VARCHAR(255) NULL,
  `whatsapp_number` VARCHAR(50) NULL,
  `languages_spoken` JSON NULL, -- e.g., ["English", "Spanish", "French"]
  `specialties` JSON NULL, -- e.g., ["Luxury Properties", "Beachfront", "Investment"]
  `is_verified` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Indicates if agent has a verification badge.',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_agent_profiles_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Extended profiles for real estate agents.';


-- =================================================================================
-- Table: agent_certifications
-- Purpose: Manages certifications for verified agents.
-- =================================================================================
DROP TABLE IF EXISTS `agent_certifications`;
CREATE TABLE `agent_certifications` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `agent_user_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `issuing_organization` VARCHAR(255) NOT NULL,
  `issue_date` DATE NOT NULL,
  `expiration_date` DATE NULL,
  `credential_id` VARCHAR(255) NULL,
  `credential_url` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_agent_certifications_agent_user_id` (`agent_user_id`),
  CONSTRAINT `fk_agent_certifications_agent_user_id` FOREIGN KEY (`agent_user_id`) REFERENCES `agent_profiles` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores professional certifications for agents.';


-- =================================================================================
-- Table: properties
-- Purpose: The core table holding all property listing information.
-- =================================================================================
DROP TABLE IF EXISTS `properties`;
CREATE TABLE `properties` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `agent_id` BIGINT UNSIGNED NULL,
  `status` ENUM('for_sale', 'for_rent', 'foreclosure', 'sold', 'rented', 'pending', 'draft') NOT NULL DEFAULT 'draft',
  `property_type` ENUM('residential', 'commercial', 'industrial', 'apartment', 'house', 'condo', 'land', 'ranch', 'villa') NOT NULL,
  `mls_id` VARCHAR(100) NULL UNIQUE COMMENT 'MLS listing ID for synchronization.',
  `source_url` VARCHAR(2048) NULL COMMENT 'Original URL if scraped.',

  -- Default Language Content (Fallbacks)
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,

  -- Pricing
  `price_usd` DECIMAL(15, 2) NOT NULL COMMENT 'Standardized price in USD for consistent filtering.',
  `price_display_currency` VARCHAR(3) NOT NULL DEFAULT 'USD',
  `price_original_amount` DECIMAL(15, 2) NOT NULL,

  -- Location
  `address_line_1` VARCHAR(255) NOT NULL,
  `address_line_2` VARCHAR(255) NULL,
  `neighborhood` VARCHAR(255) NULL,
  `city` VARCHAR(100) NOT NULL,
  `state_province` VARCHAR(100) NOT NULL,
  `postal_code` VARCHAR(20) NULL,
  `country` VARCHAR(100) NOT NULL,
  `latitude` DECIMAL(10, 8) NOT NULL,
  `longitude` DECIMAL(11, 8) NOT NULL,

  -- Core Details
  `bedrooms` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `bathrooms` DECIMAL(3, 1) NOT NULL DEFAULT 0.0 COMMENT 'Supports half-baths (e.g., 2.5).',
  `sqft_interior` INT UNSIGNED NULL,
  `sqft_lot` INT UNSIGNED NULL,
  `year_built` SMALLINT UNSIGNED NULL,
  `stories` TINYINT UNSIGNED NULL,
  `parking_spaces` TINYINT UNSIGNED NULL,

  -- Amenities (Boolean flags for fast filtering)
  `has_pool` BOOLEAN NOT NULL DEFAULT FALSE,
  `has_gym` BOOLEAN NOT NULL DEFAULT FALSE,
  `has_jacuzzi` BOOLEAN NOT NULL DEFAULT FALSE,
  `has_garage` BOOLEAN NOT NULL DEFAULT FALSE,
  `has_laundry` BOOLEAN NOT NULL DEFAULT FALSE,
  `has_fireplace` BOOLEAN NOT NULL DEFAULT FALSE,
  `has_basement` BOOLEAN NOT NULL DEFAULT FALSE,
  `is_ocean_view` BOOLEAN NOT NULL DEFAULT FALSE,
  `is_waterfront` BOOLEAN NOT NULL DEFAULT FALSE,
  `is_beachfront` BOOLEAN NOT NULL DEFAULT FALSE,
  `is_pet_friendly` BOOLEAN NOT NULL DEFAULT FALSE,
  `is_furnished` BOOLEAN NOT NULL DEFAULT FALSE,
  `is_gated_community` BOOLEAN NOT NULL DEFAULT FALSE,

  -- Lifestyle Tags (Flexible JSON for searching unique features)
  `lifestyle_tags` JSON NULL COMMENT 'e.g., ["golf_community", "marina_access", "surf_spot", "equestrian"]',

  -- Media
  `main_image_url` VARCHAR(255) NULL,
  `image_urls` JSON NULL, -- e.g., ["url1.jpg", "url2.jpg"]
  `video_url` VARCHAR(255) NULL,
  `virtual_tour_url` VARCHAR(255) NULL,
  
  -- Timestamps
  `listed_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  INDEX `idx_properties_agent_id` (`agent_id`),
  INDEX `idx_properties_status` (`status`),
  INDEX `idx_properties_property_type` (`property_type`),
  INDEX `idx_properties_location` (`country`, `state_province`, `city`),
  INDEX `idx_properties_price_usd` (`price_usd`),
  INDEX `idx_properties_geo` (`latitude`, `longitude`),
  FULLTEXT `ft_properties_title_description` (`title`, `description`),
  
  CONSTRAINT `fk_properties_agent_id` FOREIGN KEY (`agent_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Central repository for all property listings.';


-- =================================================================================
-- Table: user_favorites
-- Purpose: Links users to their favorited properties (many-to-many).
-- =================================================================================
DROP TABLE IF EXISTS `user_favorites`;
CREATE TABLE `user_favorites` (
  `user_id` BIGINT UNSIGNED NOT NULL,
  `property_id` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`, `property_id`),
  CONSTRAINT `fk_user_favorites_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_user_favorites_property_id` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tracks which properties users have favorited.';


-- =================================================================================
-- Table: user_saved_searches
-- Purpose: Stores users' custom search criteria for notifications.
-- =================================================================================
DROP TABLE IF EXISTS `user_saved_searches`;
CREATE TABLE `user_saved_searches` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `search_name` VARCHAR(255) NOT NULL,
  `search_parameters` JSON NOT NULL COMMENT 'Stores search filters as a JSON object.',
  `send_email_notifications` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_user_saved_searches_user_id` (`user_id`),
  CONSTRAINT `fk_user_saved_searches_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores user-defined search queries for future use and alerts.';


-- =================================================================================
-- Table: property_inquiries
-- Purpose: Captures inquiries made by users or guests on specific properties.
-- =================================================================================
DROP TABLE IF EXISTS `property_inquiries`;
CREATE TABLE `property_inquiries` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `property_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NULL COMMENT 'Null if the inquiry is from a non-logged-in guest.',
  `inquirer_name` VARCHAR(255) NOT NULL,
  `inquirer_email` VARCHAR(255) NOT NULL,
  `inquirer_phone` VARCHAR(50) NULL,
  `message` TEXT NOT NULL,
  `status` ENUM('new', 'contacted', 'closed') NOT NULL DEFAULT 'new',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_property_inquiries_property_id` (`property_id`),
  INDEX `idx_property_inquiries_user_id` (`user_id`),
  CONSTRAINT `fk_property_inquiries_property_id` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_property_inquiries_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Records all contact requests related to properties.';


-- =================================================================================
-- Table: blog_posts
-- Purpose: Stores content for the blog and articles.
-- =================================================================================
DROP TABLE IF EXISTS `blog_posts`;
CREATE TABLE `blog_posts` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `author_id` BIGINT UNSIGNED NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE COMMENT 'URL-friendly identifier for the post.',
  `title` VARCHAR(255) NOT NULL,
  `content` LONGTEXT NOT NULL,
  `featured_image_url` VARCHAR(255) NULL,
  `status` ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
  `published_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_blog_posts_author_id` (`author_id`),
  INDEX `idx_blog_posts_status` (`status`),
  FULLTEXT `ft_blog_posts_title_content` (`title`, `content`),
  CONSTRAINT `fk_blog_posts_author_id` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores articles for the content marketing strategy.';


-- =================================================================================
-- Table: multilingual_content
-- Purpose: A polymorphic table to store translations for various models.
-- =================================================================================
DROP TABLE IF EXISTS `multilingual_content`;
CREATE TABLE `multilingual_content` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `parent_table` VARCHAR(100) NOT NULL COMMENT 'The table being translated, e.g., "properties", "blog_posts".',
  `parent_id` BIGINT UNSIGNED NOT NULL COMMENT 'The ID of the record in the parent_table.',
  `language_code` VARCHAR(10) NOT NULL COMMENT 'e.g., "es-MX", "fr-CA", "en-US".',
  `field_name` VARCHAR(100) NOT NULL COMMENT 'The column being translated, e.g., "title", "description".',
  `field_value` TEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_multilingual_content` (`parent_table`, `parent_id`, `language_code`, `field_name`),
  INDEX `idx_multilingual_content_lookup` (`parent_table`, `parent_id`, `language_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores translations for fields in other tables.';


-- =================================================================================
-- Table: seo_metadata
-- Purpose: Stores SEO-related metadata for different content types.
-- =================================================================================
DROP TABLE IF EXISTS `seo_metadata`;
CREATE TABLE `seo_metadata` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `metadatable_type` VARCHAR(255) NOT NULL COMMENT 'Polymorphic relation: Model name, e.g., "Property", "BlogPost".',
  `metadatable_id` BIGINT UNSIGNED NOT NULL COMMENT 'Polymorphic relation: ID of the model instance.',
  `language_code` VARCHAR(10) NOT NULL COMMENT 'e.g., "es-MX", "en-US".',
  `meta_title` VARCHAR(255) NULL,
  `meta_description` TEXT NULL,
  `meta_keywords` TEXT NULL,
  `og_title` VARCHAR(255) NULL,
  `og_description` TEXT NULL,
  `og_image_url` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_seo_metadata` (`metadatable_type`, `metadatable_id`, `language_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Manages SEO metadata for various content types.';


-- =================================================================================
-- Table: property_views_analytics
-- Purpose: Tracks views on property detail pages for analytics.
-- =================================================================================
DROP TABLE IF EXISTS `property_views_analytics`;
CREATE TABLE `property_views_analytics` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `property_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NULL COMMENT 'Null if view is from a guest.',
  `session_id` VARCHAR(255) NULL COMMENT 'To track anonymous user sessions.',
  `viewed_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` TEXT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_property_views_analytics_property_id` (`property_id`),
  INDEX `idx_property_views_analytics_user_id` (`user_id`),
  INDEX `idx_property_views_analytics_viewed_at` (`viewed_at`),
  CONSTRAINT `fk_property_views_analytics_property_id` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_property_views_analytics_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Logs views for property analytics and trend analysis.';


-- =================================================================================
-- Table: currency_exchange_rates
-- Purpose: Stores exchange rates for the currency conversion feature.
-- =================================================================================
DROP TABLE IF EXISTS `currency_exchange_rates`;
CREATE TABLE `currency_exchange_rates` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `base_currency` VARCHAR(3) NOT NULL DEFAULT 'USD',
  `target_currency` VARCHAR(3) NOT NULL,
  `rate` DECIMAL(15, 8) NOT NULL,
  `last_updated` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_currency_pair` (`base_currency`, `target_currency`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores currency exchange rates against a base currency (USD).';

SET FOREIGN_KEY_CHECKS = 1;

-- End of Schema Script
```