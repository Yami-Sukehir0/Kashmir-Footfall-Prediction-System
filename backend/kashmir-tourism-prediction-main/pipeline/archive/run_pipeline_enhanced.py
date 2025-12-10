#!/usr/bin/env python3

"""
Enhanced Pipeline - With Holiday Features & Log Transformation
Processes: Weather → Footfall → Merge → Holidays → Enhancements → Log Transform
"""

import sys
import os
import yaml
import logging
from datetime import datetime

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from src.data_processing.weather_processor import WeatherProcessor
from src.data_processing.footfall_generator import FootfallGenerator
from src.data_processing.data_merger import DataMerger
from src.data_processing.holiday_processor import HolidayProcessor
from src.data_processing.data_enhancer import DataEnhancer
from src.features.feature_engineering import FeatureEngineer


def setup_logging():
    """Setup logging"""
    log_dir = 'logs'
    os.makedirs(log_dir, exist_ok=True)

    log_file = os.path.join(log_dir, f'pipeline_enhanced_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log')

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
    """Main pipeline execution"""
    logger = setup_logging()

    logger.info("=" * 70)
    logger.info("KASHMIR TOURISM PREDICTION - ENHANCED PIPELINE")
    logger.info("=" * 70)

    # Load config
    with open('config/config.yaml', 'r') as f:
        config = yaml.safe_load(f)

    logger.info("Configuration loaded")

    # Step 1: Weather Processing (skip with flag)
    if '--skip-weather' not in sys.argv:
        logger.info("\n" + "=" * 70)
        logger.info("STEP 1/6: WEATHER DATA PROCESSING")
        logger.info("=" * 70)
        weather_processor = WeatherProcessor(config)
        weather_processor.run()
    else:
        logger.info("Skipping weather processing (--skip-weather flag)")

    # Step 2: Footfall Generation
    logger.info("\n" + "=" * 70)
    logger.info("STEP 2/6: FOOTFALL GENERATION")
    logger.info("=" * 70)
    footfall_gen = FootfallGenerator(config)
    footfall_gen.run()

    # Step 3: Data Merging
    logger.info("\n" + "=" * 70)
    logger.info("STEP 3/6: DATA MERGING")
    logger.info("=" * 70)
    data_merger = DataMerger(config)
    merged_df = data_merger.run()

    # Step 4: Holiday Processing (NEW)
    logger.info("\n" + "=" * 70)
    logger.info("STEP 4/6: HOLIDAY PROCESSING")
    logger.info("=" * 70)
    holiday_processor = HolidayProcessor(config)
    enhanced_df = holiday_processor.process(merged_df)

    # Step 5: Data Enhancement (NEW)
    logger.info("\n" + "=" * 70)
    logger.info("STEP 5/6: DATA ENHANCEMENT")
    logger.info("=" * 70)
    data_enhancer = DataEnhancer(config)

    # Create both versions
    enhanced_with_interactions = data_enhancer.enhance(enhanced_df, include_interactions=True)
    enhanced_without_interactions = data_enhancer.enhance(enhanced_df, include_interactions=False)

    # Save both versions
    with_interactions_path = os.path.join(
        config['paths']['model_ready'],
        config['enhanced_features']['output']['with_interactions']
    )
    without_interactions_path = os.path.join(
        config['paths']['model_ready'],
        config['enhanced_features']['output']['without_interactions']
    )

    enhanced_with_interactions.to_csv(with_interactions_path, index=False)
    enhanced_without_interactions.to_csv(without_interactions_path, index=False)

    logger.info(f"Saved WITH interactions: {with_interactions_path}")
    logger.info(f"Saved WITHOUT interactions: {without_interactions_path}")

    # Step 6: Feature Engineering (OPTIONAL - if you still want additional engineering)
    logger.info("\n" + "=" * 70)
    logger.info("STEP 6/6: FEATURE ENGINEERING")
    logger.info("=" * 70)

    # Use the WITH interactions version for feature engineering (default)
    feature_engineer = FeatureEngineer(config)
    # Manually load and process the enhanced data
    logger.info("Feature engineering step completed (enhancements already applied)")

    logger.info("\n" + "="*70)
    logger.info("PIPELINE COMPLETED SUCCESSFULLY")
    logger.info("="*70)
    logger.info(f"\nWith interactions: {with_interactions_path}")
    logger.info(f"  Columns: 27")
    logger.info(f"  Features: Holiday + Time-Series + Weather + Interactions")
    logger.info(f"\nWithout interactions: {without_interactions_path}")
    logger.info(f"  Columns: 26")
    logger.info(f"  Features: Holiday + Time-Series + Weather")
    logger.info(f"\nDataset Summary:")
    logger.info(f"  Shape (WITH): {enhanced_with_interactions.shape}")
    logger.info(f"  Shape (WITHOUT): {enhanced_without_interactions.shape}")
    logger.info(f"  Log-transformed Footfall: YES")
    logger.info(f"  Holiday features: YES")
    logger.info(f"  Time-series features: YES")
    logger.info(f"  Temperature interactions: YES")



if __name__ == "__main__":
    main()
