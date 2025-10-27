# UK Supermarket Dataset

This dataset contains comprehensive information about UK supermarket chains, their store locations, and product catalogs. **Expanded to include 15 major UK retail chains with 16+ store locations and specialized product catalogs.**

## Dataset Structure

### 1. Store Locations (`stores.json`)
Contains location data for all major UK supermarket chains:
- **15 retail chains**: Tesco, Sainsbury's, ASDA, Morrisons, Waitrose, ALDI, Lidl, Co-op, Iceland, Marks & Spencer, Booths, Costcutter, SPAR, Nisa, Budgens
- **16+ store locations** with GPS coordinates
- Store ID, name, chain, address
- GPS coordinates (latitude, longitude)
- Contact information (phone, website)
- Services (delivery, click & collect, loyalty programs)
- Store hours and special features

### 2. Product Catalogs (`products/`)
Product catalogs for each major chain:
- `tesco-products.json` - 10 products (general grocery)
- `coop-products.json` - 8 products (Fairtrade, organic, local)
- `iceland-products.json` - 8 products (frozen foods specialist)
- `marks-spencer-products.json` - 10 products (premium quality)
- `sainsburys-products.json`
- `asda-products.json`
- `morrisons-products.json`
- `waitrose-products.json`
- `aldi-products.json`
- `lidl-products.json`

### 3. Store Categories (`categories.json`)
Standardized product categories and subcategories used across all stores.

### 4. Price Data (`prices/`)
Historical and current pricing data for products across different stores.

## Data Sources

1. **Geolocet UK Grocery Store Locations** - 58,500+ store locations
2. **Crawl Feeds Supermarket Data** - Product catalogs and pricing
3. **Agenty Supermarket Datasets** - Comprehensive store and product data
4. **ONS Shelf Availability Data** - Product availability trends

## Usage

This dataset is designed for:
- Store finder applications
- Price comparison tools
- Product availability tracking
- Location-based services
- Market research and analytics

## Licensing

Please ensure compliance with individual data source licenses and terms of use.
