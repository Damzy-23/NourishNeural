#!/usr/bin/env python3
"""
UK Food Data Scraper
Collects food data from UK supermarkets for training datasets
"""

import requests
import json
import time
import pandas as pd
from bs4 import BeautifulSoup
import sqlite3
from datetime import datetime, timedelta
import logging
from typing import Dict, List, Optional
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class UKFoodDataCollector:
    def __init__(self, db_path: str = "data/uk_food_data.db"):
        """Initialize the UK food data collector"""
        self.db_path = db_path
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
        # Create database
        self.init_database()
        
        # UK supermarket configurations
        self.supermarkets = {
            'tesco': {
                'base_url': 'https://www.tesco.com',
                'search_endpoint': '/groceries/en-GB/search',
                'product_categories': [
                    'fresh-food', 'bakery', 'dairy-eggs-chilled', 
                    'frozen', 'food-cupboard', 'drinks', 'beer-wine-spirits'
                ]
            },
            'sainsburys': {
                'base_url': 'https://www.sainsburys.co.uk',
                'search_endpoint': '/webapp/wcs/stores/servlet/SearchDisplayView',
                'product_categories': [
                    'fresh-food', 'bakery', 'dairy-eggs-chilled',
                    'frozen', 'food-cupboard', 'drinks'
                ]
            },
            'asda': {
                'base_url': 'https://www.asda.com',
                'search_endpoint': '/groceries',
                'product_categories': [
                    'fresh-food', 'bakery', 'dairy-eggs-chilled',
                    'frozen', 'food-cupboard', 'drinks'
                ]
            }
        }
        
        # Food categories mapping
        self.food_categories = {
            'fruit_vegetables': ['apples', 'bananas', 'oranges', 'tomatoes', 'carrots', 'onions'],
            'dairy': ['milk', 'cheese', 'yogurt', 'butter', 'cream'],
            'meat_poultry': ['chicken', 'beef', 'pork', 'lamb', 'turkey'],
            'fish_seafood': ['salmon', 'cod', 'prawns', 'tuna', 'haddock'],
            'bakery': ['bread', 'croissants', 'pastries', 'cakes', 'biscuits'],
            'pantry': ['rice', 'pasta', 'cereals', 'flour', 'sugar', 'oil'],
            'frozen': ['frozen_vegetables', 'frozen_fruit', 'ice_cream', 'frozen_meals'],
            'beverages': ['water', 'juice', 'tea', 'coffee', 'soft_drinks']
        }

    def init_database(self):
        """Initialize SQLite database for storing food data"""
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create tables
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                supermarket TEXT NOT NULL,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                subcategory TEXT,
                brand TEXT,
                price REAL,
                unit TEXT,
                size TEXT,
                image_url TEXT,
                description TEXT,
                nutritional_info TEXT,
                storage_instructions TEXT,
                shelf_life_days INTEGER,
                barcode TEXT,
                product_url TEXT,
                collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(supermarket, name, brand)
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS expiry_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id INTEGER,
                storage_type TEXT,
                storage_temp REAL,
                humidity REAL,
                actual_shelf_life INTEGER,
                spoilage_indicators TEXT,
                quality_score REAL,
                collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products (id)
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_consumption (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id INTEGER,
                purchase_date DATE,
                expiry_date DATE,
                consumption_date DATE,
                waste_amount REAL,
                waste_reason TEXT,
                meal_planning BOOLEAN,
                leftovers_used BOOLEAN,
                user_id TEXT,
                collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products (id)
            )
        ''')
        
        conn.commit()
        conn.close()
        logger.info("Database initialized successfully")

    def scrape_supermarket_data(self, supermarket: str, categories: List[str] = None) -> List[Dict]:
        """Scrape food data from a specific UK supermarket"""
        if supermarket not in self.supermarkets:
            raise ValueError(f"Unsupported supermarket: {supermarket}")
        
        config = self.supermarkets[supermarket]
        categories = categories or config['product_categories']
        
        all_products = []
        
        for category in categories:
            logger.info(f"Scraping {supermarket} - {category}")
            
            try:
                products = self._scrape_category(supermarket, category)
                all_products.extend(products)
                
                # Rate limiting
                time.sleep(2)
                
            except Exception as e:
                logger.error(f"Error scraping {supermarket} {category}: {e}")
                continue
        
        logger.info(f"Scraped {len(all_products)} products from {supermarket}")
        return all_products

    def _scrape_category(self, supermarket: str, category: str) -> List[Dict]:
        """Scrape products from a specific category"""
        config = self.supermarkets[supermarket]
        
        if supermarket == 'tesco':
            return self._scrape_tesco_category(category)
        elif supermarket == 'sainsburys':
            return self._scrape_sainsburys_category(category)
        elif supermarket == 'asda':
            return self._scrape_asda_category(category)
        
        return []

    def _scrape_tesco_category(self, category: str) -> List[Dict]:
        """Scrape Tesco category data"""
        products = []
        
        # Simulate Tesco API calls (in practice, you'd use their actual API)
        search_terms = self._get_category_search_terms(category)
        
        for term in search_terms[:5]:  # Limit for demo
            try:
                # Mock product data (replace with actual scraping)
                mock_products = self._generate_mock_tesco_products(term, category)
                products.extend(mock_products)
                
            except Exception as e:
                logger.error(f"Error scraping Tesco {category} - {term}: {e}")
                continue
        
        return products

    def _scrape_sainsburys_category(self, category: str) -> List[Dict]:
        """Scrape Sainsbury's category data"""
        products = []
        search_terms = self._get_category_search_terms(category)
        
        for term in search_terms[:5]:
            try:
                mock_products = self._generate_mock_sainsburys_products(term, category)
                products.extend(mock_products)
                
            except Exception as e:
                logger.error(f"Error scraping Sainsbury's {category} - {term}: {e}")
                continue
        
        return products

    def _scrape_asda_category(self, category: str) -> List[Dict]:
        """Scrape Asda category data"""
        products = []
        search_terms = self._get_category_search_terms(category)
        
        for term in search_terms[:5]:
            try:
                mock_products = self._generate_mock_asda_products(term, category)
                products.extend(mock_products)
                
            except Exception as e:
                logger.error(f"Error scraping Asda {category} - {term}: {e}")
                continue
        
        return products

    def _get_category_search_terms(self, category: str) -> List[str]:
        """Get search terms for a category"""
        return self.food_categories.get(category, [])

    def _generate_mock_tesco_products(self, term: str, category: str) -> List[Dict]:
        """Generate mock Tesco products (replace with actual scraping)"""
        return [
            {
                'supermarket': 'tesco',
                'name': f'Tesco {term.title()} 500g',
                'category': category,
                'brand': 'Tesco',
                'price': round(1.50 + (hash(term) % 100) / 100, 2),
                'unit': 'each',
                'size': '500g',
                'description': f'Fresh {term} from Tesco',
                'storage_instructions': 'Store in refrigerator',
                'shelf_life_days': 7,
                'nutritional_info': json.dumps({
                    'calories_per_100g': 50 + (hash(term) % 50),
                    'protein': 2.5,
                    'carbs': 10.0,
                    'fat': 0.5
                })
            }
        ]

    def _generate_mock_sainsburys_products(self, term: str, category: str) -> List[Dict]:
        """Generate mock Sainsbury's products"""
        return [
            {
                'supermarket': 'sainsburys',
                'name': f'Sainsbury\'s {term.title()} 500g',
                'category': category,
                'brand': 'Sainsbury\'s',
                'price': round(1.60 + (hash(term) % 100) / 100, 2),
                'unit': 'each',
                'size': '500g',
                'description': f'Quality {term} from Sainsbury\'s',
                'storage_instructions': 'Store in refrigerator',
                'shelf_life_days': 8,
                'nutritional_info': json.dumps({
                    'calories_per_100g': 52 + (hash(term) % 50),
                    'protein': 2.8,
                    'carbs': 9.5,
                    'fat': 0.6
                })
            }
        ]

    def _generate_mock_asda_products(self, term: str, category: str) -> List[Dict]:
        """Generate mock Asda products"""
        return [
            {
                'supermarket': 'asda',
                'name': f'Asda {term.title()} 500g',
                'category': category,
                'brand': 'Asda',
                'price': round(1.40 + (hash(term) % 100) / 100, 2),
                'unit': 'each',
                'size': '500g',
                'description': f'Value {term} from Asda',
                'storage_instructions': 'Store in refrigerator',
                'shelf_life_days': 6,
                'nutritional_info': json.dumps({
                    'calories_per_100g': 48 + (hash(term) % 50),
                    'protein': 2.2,
                    'carbs': 10.5,
                    'fat': 0.4
                })
            }
        ]

    def save_products_to_db(self, products: List[Dict]):
        """Save scraped products to database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        for product in products:
            try:
                cursor.execute('''
                    INSERT OR IGNORE INTO products 
                    (supermarket, name, category, brand, price, unit, size, 
                     description, storage_instructions, shelf_life_days, nutritional_info)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    product['supermarket'],
                    product['name'],
                    product['category'],
                    product['brand'],
                    product['price'],
                    product['unit'],
                    product['size'],
                    product['description'],
                    product['storage_instructions'],
                    product['shelf_life_days'],
                    product['nutritional_info']
                ))
                
            except Exception as e:
                logger.error(f"Error saving product {product['name']}: {e}")
                continue
        
        conn.commit()
        conn.close()
        logger.info(f"Saved {len(products)} products to database")

    def collect_expiry_data(self, num_samples: int = 1000):
        """Collect expiry prediction data"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get random products
        cursor.execute('SELECT id FROM products ORDER BY RANDOM() LIMIT ?', (num_samples,))
        product_ids = [row[0] for row in cursor.fetchall()]
        
        expiry_samples = []
        for product_id in product_ids:
            # Generate mock expiry data
            sample = {
                'product_id': product_id,
                'storage_type': 'refrigerated' if hash(str(product_id)) % 2 else 'pantry',
                'storage_temp': 4.0 if hash(str(product_id)) % 2 else 20.0,
                'humidity': 60.0 + (hash(str(product_id)) % 40),
                'actual_shelf_life': 5 + (hash(str(product_id)) % 10),
                'spoilage_indicators': json.dumps(['color_change', 'smell']),
                'quality_score': 0.7 + (hash(str(product_id)) % 30) / 100
            }
            expiry_samples.append(sample)
        
        # Save to database
        for sample in expiry_samples:
            cursor.execute('''
                INSERT INTO expiry_data 
                (product_id, storage_type, storage_temp, humidity, 
                 actual_shelf_life, spoilage_indicators, quality_score)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                sample['product_id'],
                sample['storage_type'],
                sample['storage_temp'],
                sample['humidity'],
                sample['actual_shelf_life'],
                sample['spoilage_indicators'],
                sample['quality_score']
            ))
        
        conn.commit()
        conn.close()
        logger.info(f"Collected {len(expiry_samples)} expiry data samples")

    def collect_consumption_data(self, num_samples: int = 2000):
        """Collect waste prediction data"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get random products
        cursor.execute('SELECT id FROM products ORDER BY RANDOM() LIMIT ?', (num_samples,))
        product_ids = [row[0] for row in cursor.fetchall()]
        
        consumption_samples = []
        for product_id in product_ids:
            purchase_date = datetime.now() - timedelta(days=hash(str(product_id)) % 30)
            expiry_date = purchase_date + timedelta(days=7 + hash(str(product_id)) % 14)
            consumption_date = purchase_date + timedelta(days=hash(str(product_id)) % 10)
            
            sample = {
                'product_id': product_id,
                'purchase_date': purchase_date.strftime('%Y-%m-%d'),
                'expiry_date': expiry_date.strftime('%Y-%m-%d'),
                'consumption_date': consumption_date.strftime('%Y-%m-%d'),
                'waste_amount': (hash(str(product_id)) % 100) / 100,
                'waste_reason': 'expired' if hash(str(product_id)) % 3 == 0 else None,
                'meal_planning': hash(str(product_id)) % 2 == 0,
                'leftovers_used': hash(str(product_id)) % 2 == 0,
                'user_id': f'user_{hash(str(product_id)) % 1000}'
            }
            consumption_samples.append(sample)
        
        # Save to database
        for sample in consumption_samples:
            cursor.execute('''
                INSERT INTO user_consumption 
                (product_id, purchase_date, expiry_date, consumption_date,
                 waste_amount, waste_reason, meal_planning, leftovers_used, user_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                sample['product_id'],
                sample['purchase_date'],
                sample['expiry_date'],
                sample['consumption_date'],
                sample['waste_amount'],
                sample['waste_reason'],
                sample['meal_planning'],
                sample['leftovers_used'],
                sample['user_id']
            ))
        
        conn.commit()
        conn.close()
        logger.info(f"Collected {len(consumption_samples)} consumption data samples")

    def export_training_data(self, output_dir: str = "data/training"):
        """Export data for model training"""
        os.makedirs(output_dir, exist_ok=True)
        
        conn = sqlite3.connect(self.db_path)
        
        # Export products data
        products_df = pd.read_sql_query('''
            SELECT p.*, e.storage_type, e.storage_temp, e.humidity, 
                   e.actual_shelf_life, e.spoilage_indicators, e.quality_score
            FROM products p
            LEFT JOIN expiry_data e ON p.id = e.product_id
        ''', conn)
        
        products_df.to_csv(f'{output_dir}/products_with_expiry.csv', index=False)
        
        # Export consumption data
        consumption_df = pd.read_sql_query('''
            SELECT c.*, p.name, p.category, p.brand, p.shelf_life_days
            FROM user_consumption c
            JOIN products p ON c.product_id = p.id
        ''', conn)
        
        consumption_df.to_csv(f'{output_dir}/consumption_data.csv', index=False)
        
        # Export summary statistics
        stats = {
            'total_products': len(products_df),
            'total_expiry_samples': len(products_df.dropna(subset=['actual_shelf_life'])),
            'total_consumption_samples': len(consumption_df),
            'supermarkets': products_df['supermarket'].value_counts().to_dict(),
            'categories': products_df['category'].value_counts().to_dict()
        }
        
        with open(f'{output_dir}/data_stats.json', 'w') as f:
            json.dump(stats, f, indent=2)
        
        conn.close()
        logger.info(f"Exported training data to {output_dir}")

def main():
    """Main function to run data collection"""
    collector = UKFoodDataCollector()
    
    # Collect data from all supermarkets
    for supermarket in ['tesco', 'sainsburys', 'asda']:
        logger.info(f"Starting data collection for {supermarket}")
        products = collector.scrape_supermarket_data(supermarket)
        collector.save_products_to_db(products)
    
    # Collect additional training data
    logger.info("Collecting expiry prediction data")
    collector.collect_expiry_data(1000)
    
    logger.info("Collecting consumption data")
    collector.collect_consumption_data(2000)
    
    # Export for training
    logger.info("Exporting training data")
    collector.export_training_data()
    
    logger.info("Data collection completed successfully!")

if __name__ == "__main__":
    main()
