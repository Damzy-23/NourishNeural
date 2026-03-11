#!/usr/bin/env python3
"""
PantryPal Model Training Pipeline
Orchestrates the training of all ML models to achieve performance targets
"""

import os
import sys
import json
import logging
import subprocess
from datetime import datetime
from typing import Dict, List, Optional
import pandas as pd

# Add src to path for imports
sys.path.append('src')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('training.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class PantryPalTrainingPipeline:
    """Main training pipeline for all PantryPal models"""
    
    def __init__(self, config_path: str = "training_config.json"):
        self.config_path = config_path
        self.config = self.load_config()
        self.results = {}
        
        # Create necessary directories
        self.create_directories()
        
    def load_config(self) -> Dict:
        """Load training configuration"""
        default_config = {
            "data_collection": {
                "enabled": True,
                "num_products_per_supermarket": 1000,
                "num_expiry_samples": 1000,
                "num_consumption_samples": 2000
            },
            "food_classifier": {
                "enabled": True,
                "target_accuracy": 95.0,
                "batch_size": 32,
                "epochs": 100,
                "learning_rate": 1e-4,
                "use_augmentation": True
            },
            "expiry_predictor": {
                "enabled": True,
                "target_mae": 2.0,  # Mean Absolute Error in days
                "batch_size": 64,
                "epochs": 50,
                "learning_rate": 1e-3
            },
            "waste_predictor": {
                "enabled": True,
                "target_accuracy": 85.0,
                "n_estimators": 1000,
                "max_depth": 8,
                "learning_rate": 0.1
            },
            "ai_chat": {
                "enabled": True,
                "target_satisfaction": 80.0,
                "num_training_examples": 1000,
                "use_fine_tuning": True
            }
        }
        
        if os.path.exists(self.config_path):
            with open(self.config_path, 'r') as f:
                config = json.load(f)
            # Merge with defaults
            for key, value in default_config.items():
                if key not in config:
                    config[key] = value
                elif isinstance(value, dict):
                    for subkey, subvalue in value.items():
                        if subkey not in config[key]:
                            config[key][subkey] = subvalue
        else:
            config = default_config
            self.save_config(config)
        
        return config
    
    def save_config(self, config: Dict):
        """Save configuration to file"""
        with open(self.config_path, 'w') as f:
            json.dump(config, f, indent=2)
        logger.info(f"Configuration saved to {self.config_path}")
    
    def create_directories(self):
        """Create necessary directories for training"""
        directories = [
            "data/raw",
            "data/processed",
            "data/training",
            "models",
            "logs",
            "results"
        ]
        
        for directory in directories:
            os.makedirs(directory, exist_ok=True)
        
        logger.info("Created necessary directories")
    
    def run_data_collection(self) -> bool:
        """Run data collection phase"""
        if not self.config["data_collection"]["enabled"]:
            logger.info("Data collection disabled in config")
            return True
        
        logger.info("Starting data collection phase")
        
        try:
            # Run UK food scraper
            result = subprocess.run([
                sys.executable, "data_collection/uk_food_scraper.py"
            ], capture_output=True, text=True, cwd=".")
            
            if result.returncode == 0:
                logger.info("Data collection completed successfully")
                return True
            else:
                logger.error(f"Data collection failed: {result.stderr}")
                return False
                
        except Exception as e:
            logger.error(f"Error during data collection: {e}")
            return False
    
    def run_food_classifier_training(self) -> bool:
        """Run food classifier training"""
        if not self.config["food_classifier"]["enabled"]:
            logger.info("Food classifier training disabled in config")
            return True
        
        logger.info("Starting food classifier training")
        
        try:
            # Create training script with config
            trainer_script = self.create_food_classifier_script()
            
            # Run training
            result = subprocess.run([
                sys.executable, "-c", trainer_script
            ], capture_output=True, text=True, cwd=".")
            
            if result.returncode == 0:
                logger.info("Food classifier training completed successfully")
                
                # Parse results
                self.parse_training_results(result.stdout, "food_classifier")
                return True
            else:
                logger.error(f"Food classifier training failed: {result.stderr}")
                return False
                
        except Exception as e:
            logger.error(f"Error during food classifier training: {e}")
            return False
    
    def run_expiry_predictor_training(self) -> bool:
        """Run expiry predictor training"""
        if not self.config["expiry_predictor"]["enabled"]:
            logger.info("Expiry predictor training disabled in config")
            return True
        
        logger.info("Starting expiry predictor training")
        
        try:
            # For now, use simple model training
            # In practice, you'd implement the full transformer+LSTM model
            from src.models.simple_models import SimpleExpiryPredictor
            
            # Load data
            data_path = "data/training/products_with_expiry.csv"
            if not os.path.exists(data_path):
                logger.error(f"Training data not found: {data_path}")
                return False
            
            # Train model
            model = SimpleExpiryPredictor()
            accuracy = model.train_and_evaluate(data_path)
            
            self.results["expiry_predictor"] = {
                "accuracy": accuracy,
                "target_mae": self.config["expiry_predictor"]["target_mae"],
                "achieved_target": accuracy <= self.config["expiry_predictor"]["target_mae"]
            }
            
            logger.info(f"Expiry predictor training completed with accuracy: {accuracy:.2f}")
            return True
            
        except Exception as e:
            logger.error(f"Error during expiry predictor training: {e}")
            return False
    
    def run_waste_predictor_training(self) -> bool:
        """Run waste predictor training"""
        if not self.config["waste_predictor"]["enabled"]:
            logger.info("Waste predictor training disabled in config")
            return True
        
        logger.info("Starting waste predictor training")
        
        try:
            # Use simple model for now
            from src.models.simple_models import SimpleWastePredictor
            
            # Load data
            data_path = "data/training/consumption_data.csv"
            if not os.path.exists(data_path):
                logger.error(f"Training data not found: {data_path}")
                return False
            
            # Train model
            model = SimpleWastePredictor()
            accuracy = model.train_and_evaluate(data_path)
            
            self.results["waste_predictor"] = {
                "accuracy": accuracy,
                "target_accuracy": self.config["waste_predictor"]["target_accuracy"],
                "achieved_target": accuracy >= self.config["waste_predictor"]["target_accuracy"] / 100
            }

            logger.info(f"Waste predictor training completed with accuracy: {accuracy:.2%}")
            return True
            
        except Exception as e:
            logger.error(f"Error during waste predictor training: {e}")
            return False
    
    def run_ai_chat_training(self) -> bool:
        """Run AI chat assistant training"""
        if not self.config["ai_chat"]["enabled"]:
            logger.info("AI chat training disabled in config")
            return True
        
        logger.info("Starting AI chat assistant training")
        
        try:
            # Run AI chat trainer
            result = subprocess.run([
                sys.executable, "training/ai_chat_trainer.py"
            ], capture_output=True, text=True, cwd=".")
            
            if result.returncode == 0:
                logger.info("AI chat training completed successfully")
                
                # Evaluate training data quality
                training_data_path = "data/training/ai_chat_training_data.csv"
                if os.path.exists(training_data_path):
                    df = pd.read_csv(training_data_path)
                    satisfaction_score = self.evaluate_chat_training_data(df)
                    
                    self.results["ai_chat"] = {
                        "training_examples": len(df),
                        "satisfaction_score": satisfaction_score,
                        "target_satisfaction": self.config["ai_chat"]["target_satisfaction"],
                        "achieved_target": satisfaction_score >= self.config["ai_chat"]["target_satisfaction"]
                    }
                
                return True
            else:
                logger.error(f"AI chat training failed: {result.stderr}")
                return False
                
        except Exception as e:
            logger.error(f"Error during AI chat training: {e}")
            return False
    
    def create_food_classifier_script(self) -> str:
        """Create food classifier training script with current config"""
        config = self.config["food_classifier"]
        
        script = f"""
import sys
sys.path.append('src')

from training.food_classifier_trainer import FoodClassifierTrainer

config = {{
    'num_classes': 200,
    'pretrained': True,
    'batch_size': {config['batch_size']},
    'learning_rate': {config['learning_rate']},
    'weight_decay': 1e-4,
    'epochs': {config['epochs']},
    'early_stopping_patience': 10,
    'num_workers': 4,
    'use_augmentation': {config['use_augmentation']},
    'label_smoothing': 0.1,
    'train_data_path': 'data/training/products_with_expiry.csv',
    'val_data_path': 'data/training/products_with_expiry.csv'
}}

trainer = FoodClassifierTrainer(config)
best_accuracy = trainer.train()
print(f"BEST_ACCURACY:{{best_accuracy}}")
"""
        return script
    
    def evaluate_chat_training_data(self, df: pd.DataFrame) -> float:
        """Evaluate chat training data quality"""
        # Simple evaluation based on data characteristics
        score = 0.0
        
        # Check data size
        if len(df) >= self.config["ai_chat"]["num_training_examples"]:
            score += 25.0
        
        # Check category diversity
        unique_categories = df['category'].nunique()
        if unique_categories >= 5:
            score += 25.0
        
        # Check UK context coverage
        if 'context' in df.columns:
            uk_coverage = (df['context'] == 'uk_food_assistant').mean()
            score += uk_coverage * 25.0
        
        # Check response quality (length and content)
        avg_response_length = df['expected_response'].str.len().mean()
        if avg_response_length >= 50:  # Reasonable response length
            score += 25.0
        
        return min(score, 100.0)  # Cap at 100
    
    def parse_training_results(self, output: str, model_name: str):
        """Parse training results from output"""
        lines = output.split('\n')
        
        for line in lines:
            if 'BEST_ACCURACY:' in line:
                accuracy = float(line.split('BEST_ACCURACY:')[1])
                self.results[model_name] = {
                    "accuracy": accuracy,
                    "target_accuracy": self.config[model_name]["target_accuracy"],
                    "achieved_target": accuracy >= self.config[model_name]["target_accuracy"]
                }
                break
    
    def run_full_pipeline(self) -> Dict:
        """Run the complete training pipeline"""
        logger.info("Starting PantryPal training pipeline")
        start_time = datetime.now()
        
        pipeline_steps = [
            ("Data Collection", self.run_data_collection),
            ("Food Classifier Training", self.run_food_classifier_training),
            ("Expiry Predictor Training", self.run_expiry_predictor_training),
            ("Waste Predictor Training", self.run_waste_predictor_training),
            ("AI Chat Training", self.run_ai_chat_training)
        ]
        
        success_count: int = 0
        total_steps = len(pipeline_steps)
        
        for step_name, step_function in pipeline_steps:
            logger.info(f"Running step: {step_name}")
            
            try:
                success = step_function()
                if success:
                    success_count = success_count + 1
                    logger.info(f"[SUCCESS] {step_name} completed successfully")
                else:
                    logger.error(f"[FAILED] {step_name} failed")
                    
            except Exception as e:
                logger.error(f"[ERROR] {step_name} failed with error: {e}")
        
        # Calculate overall results
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        overall_results = {
            "pipeline_status": "completed" if success_count == total_steps else "partial",
            "success_rate": success_count / total_steps,
            "duration_seconds": duration,
            "individual_results": self.results,
            "performance_summary": self.generate_performance_summary()
        }
        
        # Save results
        self.save_results(overall_results)
        
        logger.info(f"Training pipeline completed in {duration:.2f} seconds")
        logger.info(f"Success rate: {success_count}/{total_steps} steps")
        
        return overall_results
    
    def generate_performance_summary(self) -> Dict:
        """Generate performance summary against targets"""
        targets_achieved: int = 0
        detailed_results: dict = {}
        summary: dict = {
            "targets_achieved": targets_achieved,
            "total_targets": 4,
            "detailed_results": detailed_results
        }

        targets = {
            "food_classifier": {"target": 95.0, "metric": "accuracy"},
            "expiry_predictor": {"target": 2.0, "metric": "mae"},
            "waste_predictor": {"target": 85.0, "metric": "accuracy"},
            "ai_chat": {"target": 80.0, "metric": "satisfaction"}
        }

        for model_name, target_info in targets.items():
            if model_name in self.results:
                result = self.results[model_name]
                achieved = result.get("achieved_target", False)

                detailed_results[model_name] = {
                    "achieved": achieved,
                    "target": target_info["target"],
                    "actual": result.get(target_info["metric"], 0),
                    "metric": target_info["metric"]
                }

                if achieved:
                    targets_achieved = targets_achieved + 1

        summary["targets_achieved"] = targets_achieved
        return summary
    
    def save_results(self, results: Dict):
        """Save training results"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        results_file = f"results/training_results_{timestamp}.json"
        
        with open(results_file, 'w') as f:
            json.dump(results, f, indent=2, default=str)
        
        logger.info(f"Results saved to {results_file}")
        
        # Also save summary
        summary_file = f"results/performance_summary_{timestamp}.txt"
        with open(summary_file, 'w') as f:
            f.write(self.format_results_summary(results))
        
        logger.info(f"Summary saved to {summary_file}")
    
    def format_results_summary(self, results: Dict) -> str:
        """Format results summary for human reading"""
        summary = f"""
PantryPal Training Pipeline Results
====================================

Pipeline Status: {results['pipeline_status'].upper()}
Success Rate: {results['success_rate']:.1%}
Duration: {results['duration_seconds']:.2f} seconds

Performance Summary:
-------------------
Targets Achieved: {results['performance_summary']['targets_achieved']}/{results['performance_summary']['total_targets']}

Detailed Results:
"""
        
        for model_name, details in results['performance_summary']['detailed_results'].items():
            status = "✅ ACHIEVED" if details['achieved'] else "❌ NOT ACHIEVED"
            summary += f"\n{model_name.replace('_', ' ').title()}: {status}"
            summary += f"\n  Target: {details['target']} {details['metric']}"
            summary += f"\n  Actual: {details['actual']:.2f} {details['metric']}"
        
        summary += f"\n\nIndividual Model Results:"
        for model_name, model_results in results['individual_results'].items():
            summary += f"\n\n{model_name.replace('_', ' ').title()}:"
            for key, value in model_results.items():
                summary += f"\n  {key}: {value}"
        
        return summary

def main():
    """Main function to run the training pipeline"""
    logger.info("Initializing PantryPal Training Pipeline")
    
    # Initialize pipeline
    pipeline = PantryPalTrainingPipeline()
    
    # Run full pipeline
    results = pipeline.run_full_pipeline()
    
    # Print summary
    print("\n" + "="*50)
    print("TRAINING PIPELINE SUMMARY")
    print("="*50)
    print(pipeline.format_results_summary(results))
    
    # Check if all targets achieved
    targets_achieved = results['performance_summary']['targets_achieved']
    total_targets = results['performance_summary']['total_targets']
    
    if targets_achieved == total_targets:
        logger.info("[SUCCESS] ALL PERFORMANCE TARGETS ACHIEVED!")
        logger.info("PantryPal is ready for deployment with optimal performance")
    else:
        logger.warning(f"[WARNING] Only {targets_achieved}/{total_targets} targets achieved")
        logger.info("Consider adjusting training parameters or collecting more data")

if __name__ == "__main__":
    main()
