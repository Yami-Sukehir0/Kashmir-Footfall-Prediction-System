#!/usr/bin/env python3
"""
Enhanced Model Training Script
Train all models with COMPLETE feature set
"""

import sys
import os
import yaml
import logging
from datetime import datetime

# Add project root to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.models.model_trainer import ModelTrainer


def setup_logging():
    """Setup logging configuration"""
    log_dir = 'logs'
    os.makedirs(log_dir, exist_ok=True)

    log_file = os.path.join(log_dir, f'training_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log')

    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(log_file),
            logging.StreamHandler(sys.stdout)
        ]
    )

    return logging.getLogger(__name__)


def main():
    """Main training function"""
    logger = setup_logging()

    logger.info("=" * 70)
    logger.info("KASHMIR TOURISM FOOTFALL PREDICTION - ENHANCED TRAINING")
    logger.info("Using COMPLETE feature set (location + time + weather + holidays)")
    logger.info("=" * 70)

    try:
        # Load config
        with open('config/config.yaml', 'r') as f:
            config = yaml.safe_load(f)

        logger.info("Configuration loaded successfully")

        # Initialize trainer
        trainer = ModelTrainer(config)

        # Train and save
        best_model, test_metrics = trainer.train_and_save()

        logger.info("\n" + "=" * 70)
        logger.info("TRAINING SUMMARY")
        logger.info("=" * 70)
        logger.info(f"Best Model: {best_model}")
        logger.info(f"Test Metrics:")
        for metric, value in test_metrics.items():
            logger.info(f"  {metric}: {value:.4f}")

        logger.info("\n✓ Training completed successfully!")
        logger.info("=" * 70)

    except Exception as e:
        logger.error(f"Training failed: {str(e)}", exc_info=True)
        sys.exit(1)


if __name__ == '__main__':
    main()
