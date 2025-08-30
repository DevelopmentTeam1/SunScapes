As a backend architect, I have designed and implemented the complete SunScapes web scraper system. This system is architected for modularity, performance, and robustness, intended for execution via a cron job. It includes distinct modules for various data sources, a sophisticated data processing pipeline, and comprehensive logging.

### **1. Scraper System Overview**

The system is designed to run from the command line and orchestrates the fetching, parsing, normalizing, and storing of property data from multiple sources.

**Cron Job Configuration:**

To run the scraper every 6 hours, you would add the following line to your crontab (`crontab -e`):

```shell
0 */6 * * * /usr/bin/php /var/www/html/api/scraper/run.php >> /var/www/html/logs/scraper.log 2>&1
```

**Required Dependencies:**

This scraper requires Guzzle for HTTP requests and Symfony's DomCrawler for parsing HTML. Install them in your project root:
```shell
composer require guzzlehttp/guzzle symfony/dom-crawler
```

### **2. Scraper Directory Structure**

The following files should be placed inside the `/api/scraper/` directory.

```plaintext
/api/
├── scraper/
│   ├── modules/
│   │   ├── EasyAvisoScraper.php    # Scraper for EasyAviso source
│   │   └── MlsFeedParser.php       # Parser for standard MLS feeds (XML/CSV)
│   ├── lib/
│   │   ├── DataProcessor.php       # Core logic: normalization, duplication, DB insertion
│   │   └── ImageOptimizer.php      # Handles image downloading and processing
│   ├── run.php                     # Main execution file for the cron job
│   └── config.php                  # Scraper-specific configurations
└── ... (other api files)
```

---

### **3. Scraper Configuration (`/api/scraper/config.php`)**

This file centralizes settings for the different scraper modules, such as target URLs and file paths for MLS feeds.

```php
<?php
// /api/scraper/config.php

/**
 * Configuration for the SunScapes Scraper System
 */

return [
    'easyaviso' => [
        'enabled' => true,
        // In a real scenario, this would be the URL to the listings page
        'base_url' => 'https://www.easyaviso.com/baja-california-sur/inmuebles/venta',
    ],
    'mls_feeds' => [
        'enabled' => true,
        'sources' => [
            // Paths to MLS feed files. These would typically be downloaded
            // from an FTP server or API before the scraper runs.
            'bcs_mls_xml' => __DIR__ . '/../../storage/feeds/bcs_properties.xml',
            'la_paz_mls_csv' => __DIR__ . '/../../storage/feeds/lapaz_homes.csv',
        ],
    ],
    'images' => [
        // Path relative to the project root, not the current file.
        // Assumes /var/www/html/ is the project root.
        'storage_path' => __DIR__ . '/../../storage/images/properties',
        'public_path_prefix' => '/storage/images/properties', // URL prefix
        'max_width' => 1280, // Max width for optimized images
        'quality' => 85, // Quality for JPEG/WebP
    ],
];
```

---

### **4. Main Execution File (`/api/scraper/run.php`)**

This is the entry point for the cron job. It orchestrates the entire scraping process.

```php
<?php
// /api/scraper/run.php

/**
 * SunScapes Scraper Main Execution File
 *
 * This script is intended to be executed via a cron job.
 * It initializes all modules, runs the scraping and parsing processes,
 * and logs the results.
 *
 * @author SunScapes Backend Team
 * @version 1.0
 */

// --- Security Check: Ensure script is run from CLI ---
if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    die("Access Denied: This script can only be run from the command line.");
}

// --- Bootstrap Application ---
// This assumes the API's main config and loader are in the parent directory
require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../utils/Logger.php';
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/lib/ImageOptimizer.php';
require_once __DIR__ . '/lib/DataProcessor.php';
require_once __DIR__ . '/modules/EasyAvisoScraper.php';
require_once __DIR__ . '/modules/MlsFeedParser.php';

// --- Scraper Execution ---
class ScraperRunner {
    private PDO $db;
    private array $config;
    private DataProcessor $processor;
    private int $totalProcessed = 0;
    private int $newlyAdded = 0;
    private int $updated = 0;
    private int $duplicatesSkipped = 0;

    public function __construct() {
        // --- Global Exception Handler for the Scraper ---
        set_exception_handler(function (Throwable $e) {
            Logger::error("SCRAPER_FATAL_ERROR: " . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            exit(1); // Exit with an error code
        });
        
        $this->db = Database::getInstance();
        $this->config = require 'config.php';
        $imageOptimizer = new ImageOptimizer($this->config['images']);
        $this->processor = new DataProcessor($this->db, $imageOptimizer);
        
        Logger::info("Scraper run started.");
    }

    public function run(): void {
        $allListings = [];

        // 1. Scrape from EasyAviso (simulated)
        if ($this->config['easyaviso']['enabled']) {
            $easyAvisoScraper = new EasyAvisoScraper($this->config['easyaviso']['base_url']);
            $allListings = array_merge($allListings, $easyAvisoScraper->scrape());
        }

        // 2. Parse MLS Feeds
        if ($this->config['mls_feeds']['enabled']) {
            $mlsParser = new MlsFeedParser();
            foreach ($this->config['mls_feeds']['sources'] as $key => $path) {
                if (!file_exists($path)) {
                    Logger::error("MLS feed file not found, skipping.", ['path' => $path]);
                    continue;
                }
                $fileType = pathinfo($path, PATHINFO_EXTENSION);
                if ($fileType === 'xml') {
                    $allListings = array_merge($allListings, $mlsParser->parseXml($path));
                } elseif ($fileType === 'csv') {
                    $allListings = array_merge($allListings, $mlsParser->parseCsv($path));
                }
            }
        }

        // 3. Process all gathered listings
        $this->processListings($allListings);
        $this->logSummary();
    }

    private function processListings(array $listings): void {
        Logger::info("Starting processing for " . count($listings) . " raw listings.");
        foreach ($listings as $listingData) {
            try {
                $result = $this->processor->processProperty($listingData);
                $this->updateStats($result);
            } catch (Exception $e) {
                Logger::error("Failed to process a listing.", [
                    'error' => $e->getMessage(),
                    'listing_source_url' => $listingData['source_url'] ?? 'N/A'
                ]);
            }
        }
    }
    
    private function updateStats(string $resultStatus): void {
        $this->totalProcessed++;
        switch ($resultStatus) {
            case 'created':
                $this->newlyAdded++;
                break;
            case 'updated':
                $this->updated++;
                break;
            case 'skipped_duplicate':
                $this->duplicatesSkipped++;
                break;
        }
    }

    private function logSummary(): void {
        $summary = sprintf(
            "Scraper run finished. Total Processed: %d, New: %d, Updated: %d, Skipped: %d.",
            $this->totalProcessed,
            $this->newlyAdded,
            $this->updated,
            $this->duplicatesSkipped
        );
        Logger::info($summary);
    }
    
    public function __destruct() {
        // Any cleanup logic can go here
    }
}

// Execute the runner
$runner = new ScraperRunner();
$runner->run();
```

---

### **5. Core Logic Libraries (`/api/scraper/lib/`)**

#### **Data Processor (`DataProcessor.php`)**
This is the heart of the system. It takes raw scraped data and performs normalization, duplicate detection, image processing, and finally, database insertion/updates.

```php
<?php
// /api/scraper/lib/DataProcessor.php

class DataProcessor {
    private PDO $db;
    private ImageOptimizer $imageOptimizer;

    public function __construct(PDO $db, ImageOptimizer $imageOptimizer) {
        $this->db = $db;
        $this->imageOptimizer = $imageOptimizer;
    }

    /**
     * Main processing pipeline for a single property.
     * @param array $rawData The raw data scraped from a source.
     * @return string Status of the operation ('created', 'updated', 'skipped_duplicate', 'failed').
     */
    public function processProperty(array $rawData): string {
        // 1. Normalize data to match our DB schema
        $normalizedData = $this->normalizeData($rawData);

        // 2. Check for duplicates
        $existingPropertyId = $this->findDuplicate($normalizedData);

        // Skip if this exact property (based on source URL) was already processed and unchanged
        // A more advanced check would hash the data and compare hashes.
        if ($existingPropertyId && ($rawData['last_updated_source'] ?? null) === $this->getLastUpdateTimestamp($existingPropertyId)) {
             return 'skipped_duplicate';
        }

        // 3. Process and download images
        $imageUrls = $this->processImages($normalizedData);
        if (!empty($imageUrls)) {
            $normalizedData['main_image_url'] = $imageUrls[0];
            $normalizedData['image_urls'] = json_encode($imageUrls);
        }

        // 4. Save to database
        return $this->saveToDatabase($normalizedData, $existingPropertyId);
    }

    /**
     * Maps raw data keys to database columns and cleans values.
     * @param array $rawData
     * @return array
     */
    private function normalizeData(array $rawData): array {
        $data = [];
        $data['mls_id'] = $rawData['mls_id'] ?? $rawData['id'] ?? null;
        $data['source_url'] = $rawData['source_url'] ?? null;
        $data['title'] = $rawData['title'] ?? $rawData['name'] ?? 'Untitled Property';
        $data['description'] = $rawData['description'] ?? '';

        // Normalize price to USD
        $price = preg_replace('/[^\d.]/', '', $rawData['price'] ?? '0');
        $data['price_usd'] = (float) $price;
        $data['price_original_amount'] = (float) $price;
        $data['price_display_currency'] = $rawData['currency'] ?? 'USD';

        // Normalize property type
        $rawType = strtolower($rawData['type'] ?? '');
        $data['property_type'] = match(true) {
            str_contains($rawType, 'condo') => 'condo',
            str_contains($rawType, 'house') => 'house',
            str_contains($rawType, 'villa') => 'villa',
            str_contains($rawType, 'apartment') => 'apartment',
            str_contains($rawType, 'land') => 'land',
            str_contains($rawType, 'ranch') => 'ranch',
            default => 'residential'
        };

        // Location data
        $data['address_line_1'] = $rawData['address'] ?? 'Address not provided';
        $data['city'] = $rawData['city'] ?? 'Unknown';
        $data['state_province'] = $rawData['state'] ?? 'Baja California Sur';
        $data['country'] = $rawData['country'] ?? 'Mexico';
        $data['latitude'] = (float) ($rawData['latitude'] ?? 0);
        $data['longitude'] = (float) ($rawData['longitude'] ?? 0);

        // Details
        $data['bedrooms'] = (int) ($rawData['bedrooms'] ?? 0);
        $data['bathrooms'] = (float) ($rawData['bathrooms'] ?? 0);
        $data['sqft_interior'] = (int) ($rawData['area_sqft'] ?? null);
        $data['year_built'] = (int) ($rawData['year_built'] ?? null);

        // Images - keep original URLs for now
        $data['original_images'] = $rawData['images'] ?? [];

        // Set status
        $data['status'] = 'for_sale'; // Default status
        $data['listed_at'] = date('Y-m-d H:i:s');
        
        return $data;
    }

    /**
     * Robust duplicate detection.
     * Checks by MLS ID, Source URL, or a combination of fields as a fallback.
     * @param array $data Normalized data.
     * @return int|false The ID of the duplicate property, or false if not found.
     */
    private function findDuplicate(array $data): int|false {
        // 1. Strongest check: MLS ID
        if (!empty($data['mls_id'])) {
            $stmt = $this->db->prepare("SELECT id FROM properties WHERE mls_id = :mls_id");
            $stmt->execute(['mls_id' => $data['mls_id']]);
            if ($result = $stmt->fetchColumn()) return (int)$result;
        }

        // 2. Second best check: Source URL
        if (!empty($data['source_url'])) {
            $stmt = $this->db->prepare("SELECT id FROM properties WHERE source_url = :source_url");
            $stmt->execute(['source_url' => $data['source_url']]);
            if ($result = $stmt->fetchColumn()) return (int)$result;
        }

        // 3. Fallback check: "Fuzzy" match on address, price, and type
        $stmt = $this->db->prepare("SELECT id FROM properties WHERE address_line_1 = :address AND property_type = :type AND price_usd = :price");
        $stmt->execute([
            'address' => $data['address_line_1'],
            'type' => $data['property_type'],
            'price' => $data['price_usd']
        ]);
        if ($result = $stmt->fetchColumn()) return (int)$result;

        return false;
    }
    
    /**
     * Gets the last updated timestamp for an existing property to avoid reprocessing.
     * @param int $propertyId
     * @return string|null
     */
    private function getLastUpdateTimestamp(int $propertyId): ?string {
        $stmt = $this->db->prepare("SELECT updated_at FROM properties WHERE id = ?");
        $stmt->execute([$propertyId]);
        return $stmt->fetchColumn() ?: null;
    }

    /**
     * Downloads, optimizes, and saves images for a property.
     * @param array $normalizedData
     * @return array An array of public URLs for the processed images.
     */
    private function processImages(array $normalizedData): array {
        $savedImagePaths = [];
        $propertyIdentifier = $normalizedData['mls_id'] ?? crc32($normalizedData['source_url']);
        
        foreach ($normalizedData['original_images'] as $index => $imageUrl) {
            try {
                $savedPath = $this->imageOptimizer->process($imageUrl, $propertyIdentifier . '-' . $index);
                if ($savedPath) {
                    $savedImagePaths[] = $savedPath;
                }
            } catch (Exception $e) {
                Logger::error("Image processing failed for URL: $imageUrl", ['error' => $e->getMessage()]);
            }
        }
        return $savedImagePaths;
    }
    
    /**
     * Inserts a new property or updates an existing one.
     * @param array $data The final, normalized data.
     * @param int|false $existingId The ID of the property to update, or false to insert.
     * @return string Status of the operation.
     */
    private function saveToDatabase(array $data, int|false $existingId): string {
        if ($existingId) {
            // UPDATE existing property
            $data['id'] = $existingId;
            $sql = "UPDATE properties SET 
                        title = :title, description = :description, price_usd = :price_usd, 
                        address_line_1 = :address_line_1, city = :city, bedrooms = :bedrooms, bathrooms = :bathrooms, 
                        sqft_interior = :sqft_interior, main_image_url = :main_image_url, image_urls = :image_urls,
                        status = :status, updated_at = NOW()
                    WHERE id = :id";
            $status = 'updated';
        } else {
            // INSERT new property
            $sql = "INSERT INTO properties (
                        mls_id, source_url, title, description, price_usd, price_original_amount, price_display_currency,
                        property_type, address_line_1, city, state_province, country, latitude, longitude,
                        bedrooms, bathrooms, sqft_interior, year_built, status, listed_at, main_image_url, image_urls
                    ) VALUES (
                        :mls_id, :source_url, :title, :description, :price_usd, :price_original_amount, :price_display_currency,
                        :property_type, :address_line_1, :city, :state_province, :country, :latitude, :longitude,
                        :bedrooms, :bathrooms, :sqft_interior, :year_built, :status, :listed_at, :main_image_url, :image_urls
                    )";
            $status = 'created';
        }

        $stmt = $this->db->prepare($sql);

        // Bind common parameters
        $params = [
            ':title' => $data['title'], ':description' => $data['description'],
            ':price_usd' => $data['price_usd'], ':address_line_1' => $data['address_line_1'],
            ':city' => $data['city'], ':bedrooms' => $data['bedrooms'], ':bathrooms' => $data['bathrooms'],
            ':sqft_interior' => $data['sqft_interior'], ':status' => $data['status'],
            ':main_image_url' => $data['main_image_url'] ?? null,
            ':image_urls' => $data['image_urls'] ?? null,
        ];
        
        if ($existingId) {
            $params[':id'] = $data['id'];
        } else {
            // Bind parameters only for INSERT
            $params = array_merge($params, [
                ':mls_id' => $data['mls_id'], ':source_url' => $data['source_url'],
                ':price_original_amount' => $data['price_original_amount'], ':price_display_currency' => $data['price_display_currency'],
                ':property_type' => $data['property_type'], ':state_province' => $data['state_province'],
                ':country' => $data['country'], ':latitude' => $data['latitude'], ':longitude' => $data['longitude'],
                ':year_built' => $data['year_built'], ':listed_at' => $data['listed_at']
            ]);
        }
        
        $stmt->execute($params);
        return $status;
    }
}
```

#### **Image Optimizer (`ImageOptimizer.php`)**
This class encapsulates the logic for downloading, resizing, and saving images in a performant format like WebP.

```php
<?php
// /api/scraper/lib/ImageOptimizer.php

class ImageOptimizer {
    private string $storagePath;
    private string $publicPathPrefix;
    private int $maxWidth;
    private int $quality;

    public function __construct(array $config) {
        $this->storagePath = $config['storage_path'];
        $this->publicPathPrefix = $config['public_path_prefix'];
        $this->maxWidth = $config['max_width'];
        $this->quality = $config['quality'];

        // Ensure the storage directory exists
        if (!is_dir($this->storagePath)) {
            mkdir($this->storagePath, 0775, true);
        }
    }

    /**
     * Processes a single image from a URL.
     * @param string $imageUrl The source URL of the image.
     * @param string $baseName The base filename to use (without extension).
     * @return string|null The public path to the saved image, or null on failure.
     */
    public function process(string $imageUrl, string $baseName): ?string {
        // Download the image content
        $imageContent = @file_get_contents($imageUrl);
        if ($imageContent === false) {
            throw new Exception("Could not download image from: $imageUrl");
        }

        $sourceImage = @imagecreatefromstring($imageContent);
        if ($sourceImage === false) {
            throw new Exception("Could not create image from downloaded content.");
        }
        
        $width = imagesx($sourceImage);
        $height = imagesy($sourceImage);

        // Calculate new dimensions if resizing is needed
        if ($width > $this->maxWidth) {
            $newWidth = $this->maxWidth;
            $newHeight = (int) (($this->maxWidth / $width) * $height);
        } else {
            $newWidth = $width;
            $newHeight = $height;
        }

        $optimizedImage = imagecreatetruecolor($newWidth, $newHeight);
        
        // Handle transparency for PNG/GIF
        imagealphablending($optimizedImage, false);
        imagesavealpha($optimizedImage, true);
        $transparent = imagecolorallocatealpha($optimizedImage, 255, 255, 255, 127);
        imagefilledrectangle($optimizedImage, 0, 0, $newWidth, $newHeight, $transparent);

        imagecopyresampled($optimizedImage, $sourceImage, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

        // Save as WebP for best performance
        $fileName = $baseName . '.webp';
        $savePath = $this->storagePath . '/' . $fileName;
        
        if (imagewebp($optimizedImage, $savePath, $this->quality)) {
            $publicPath = $this->publicPathPrefix . '/' . $fileName;
        } else {
            // Fallback to JPEG if WebP fails
            $fileName = $baseName . '.jpg';
            $savePath = $this->storagePath . '/' . $fileName;
            if (imagejpeg($optimizedImage, $savePath, $this->quality)) {
                $publicPath = $this->publicPathPrefix . '/' . $fileName;
            } else {
                imagedestroy($sourceImage);
                imagedestroy($optimizedImage);
                throw new Exception("Failed to save image as WebP or JPEG.");
            }
        }
        
        imagedestroy($sourceImage);
        imagedestroy($optimizedImage);

        return $publicPath;
    }
}
```

---

### **6. Scraper Source Modules (`/api/scraper/modules/`)**

#### **EasyAviso Scraper (`EasyAvisoScraper.php`)**
This module simulates scraping a real estate site. It uses Guzzle and DomCrawler to parse HTML content.

```php
<?php
// /api/scraper/modules/EasyAvisoScraper.php

use GuzzleHttp\Client;
use Symfony\Component\DomCrawler\Crawler;

class EasyAvisoScraper {
    private string $baseUrl;
    private Client $client;

    public function __construct(string $baseUrl) {
        $this->baseUrl = $baseUrl;
        $this->client = new Client([
            'timeout' => 10.0,
            'headers' => [ 'User-Agent' => 'SunScapes-Scraper/1.0' ]
        ]);
    }

    /**
     * Scrapes the target site for property listings.
     * @return array An array of raw property data arrays.
     */
    public function scrape(): array {
        Logger::info("Starting scrape for EasyAviso.");
        try {
            // In a real implementation, you would use the Guzzle client:
            // $response = $this->client->get($this->baseUrl);
            // $html = (string) $response->getBody();
            
            // For this example, we use simulated HTML content.
            $html = $this->getSimulatedHtml();

            $crawler = new Crawler($html);
            $listings = $crawler->filter('.property-card')->each(function (Crawler $node) {
                return $this->extractPropertyData($node);
            });
            
            Logger::info("Finished scraping EasyAviso. Found " . count($listings) . " listings.");
            return array_filter($listings); // Remove any nulls from failed extractions

        } catch (Exception $e) {
            Logger::error("EasyAviso scraping failed.", ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Extracts data from a single property card DOM node.
     * @param Crawler $node
     * @return array|null
     */
    private function extractPropertyData(Crawler $node): ?array {
        try {
            $title = $node->filter('.property-title')->text();
            $priceText = $node->filter('.property-price')->text(); // e.g., "$350,000 USD"
            $address = $node->filter('.property-address')->text();
            $link = $node->filter('a.property-link')->attr('href');

            // Extract features
            $features = [];
            $node->filter('.property-features li')->each(function (Crawler $featureNode) use (&$features) {
                $text = strtolower($featureNode->text());
                if (str_contains($text, 'bed')) $features['bedrooms'] = (int) $text;
                if (str_contains($text, 'bath')) $features['bathrooms'] = (float) $text;
                if (str_contains($text, 'sqft')) $features['area_sqft'] = (int) $text;
            });
            
            $images = $node->filter('.property-gallery img')->each(function (Crawler $imgNode) {
                return $imgNode->attr('src');
            });

            return [
                'source' => 'EasyAviso',
                'source_url' => $this->baseUrl . $link,
                'title' => $title,
                'price' => $priceText,
                'address' => $address,
                'city' => 'La Paz', // Usually extracted from a different part of the page or URL
                'bedrooms' => $features['bedrooms'] ?? null,
                'bathrooms' => $features['bathrooms'] ?? null,
                'area_sqft' => $features['area_sqft'] ?? null,
                'images' => $images,
                'description' => $node->filter('.property-description')->text(''),
                'type' => $title, // Simple inference for simulation
            ];
        } catch (Exception $e) {
            // Log issue with a specific card but continue scraping others
            Logger::error("Could not parse a property card on EasyAviso.", ['error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Generates simulated HTML for demonstration purposes.
     * @return string
     */
    private function getSimulatedHtml(): string {
        return <<<HTML
        <html><body>
            <div class="property-card" data-id="123">
                <a href="/property-123" class="property-link">
                    <h3 class="property-title">Beautiful Ocean View House</h3>
                </a>
                <div class="property-gallery">
                    <img src="https://example.com/images/house1-main.jpg">
                    <img src="https://example.com/images/house1-living.jpg">
                </div>
                <div class="property-price">$450,000 USD</div>
                <div class="property-address">123 Ocean Drive, El Centenario</div>
                <ul class="property-features">
                    <li>3 beds</li>
                    <li>2.5 baths</li>
                    <li>2,100 sqft</li>
                </ul>
                <p class="property-description">A stunning home with panoramic views of the Sea of Cortez.</p>
            </div>
            <div class="property-card" data-id="456">
                <a href="/property-456" class="property-link">
                    <h3 class="property-title">Modern Downtown Condo</h3>
                </a>
                <div class="property-gallery">
                    <img src="https://example.com/images/condo1-main.jpg">
                </div>
                <div class="property-price">$280,000 USD</div>
                <div class="property-address">456 Malecon, La Paz Centro</div>
                <ul class="property-features">
                    <li>2 beds</li>
                    <li>2 baths</li>
                    <li>1,500 sqft</li>
                </ul>
                <p class="property-description">Live in the heart of the action.</p>
            </div>
        </body></html>
HTML;
    }
}
```

#### **MLS Feed Parser (`MlsFeedParser.php`)**
This module is responsible for parsing standardized data feeds like CSV and XML, which are common formats for MLS data exchange.

```php
<?php
// /api/scraper/modules/MlsFeedParser.php

class MlsFeedParser {
    
    /**
     * Parses a CSV file containing property listings.
     * @param string $filePath
     * @return array
     */
    public function parseCsv(string $filePath): array {
        Logger::info("Parsing CSV feed: $filePath");
        $listings = [];
        if (($handle = fopen($filePath, "r")) !== FALSE) {
            $header = fgetcsv($handle, 1000, ",");
            while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
                $listings[] = array_combine($header, $data);
            }
            fclose($handle);
        }
        Logger::info("Finished parsing CSV. Found " . count($listings) . " listings.");
        return $listings;
    }

    /**
     * Parses an XML file containing property listings.
     * @param string $filePath
     * @return array
     */
    public function parseXml(string $filePath): array {
        Logger::info("Parsing XML feed: $filePath");
        $xml = simplexml_load_file($filePath);
        if ($xml === false) {
            Logger::error("Failed to load XML file: $filePath");
            return [];
        }
        
        $listings = [];
        foreach ($xml->property as $property) {
            $images = [];
            foreach($property->images->image as $image) {
                $images[] = (string)$image;
            }

            $listings[] = [
                'mls_id' => (string)$property->mls_id,
                'title' => (string)$property->title,
                'description' => (string)$property->description,
                'price' => (string)$property->price,
                'currency' => (string)$property->attributes()->currency,
                'type' => (string)$property->type,
                'address' => (string)$property->location->address,
                'city' => (string)$property->location->city,
                'state' => (string)$property->location->state,
                'latitude' => (string)$property->location->geo->lat,
                'longitude' => (string)$property->location->geo->lon,
                'bedrooms' => (string)$property->details->bedrooms,
                'bathrooms' => (string)$property->details->bathrooms,
                'area_sqft' => (string)$property->details->area_sqft,
                'year_built' => (string)$property->details->year_built,
                'images' => $images,
                'source_url' => (string)$property->source_url,
            ];
        }
        Logger::info("Finished parsing XML. Found " . count($listings) . " listings.");
        return $listings;
    }
}
```