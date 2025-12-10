#!/usr/bin/env python3

"""
Kashmir Tourism Prediction - Pipeline Orchestrator
Main script that runs the complete data pipeline from raw data to ML-ready features
"""

import os
import sys
import yaml
import logging
import argparse
from datetime import datetime
from pathlib import Path

# Add parent directory to path to import our modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.data_collection.weather_fetcher import WeatherDataFetcher
from src.data_processing.weather_processor import WeatherProcessor
from src.data_processing.footfall_generator import FootfallGenerator
from src.data_processing.data_merger import DataMerger
from src.features.feature_engineering import FeatureEngineer


class PipelineOrchestrator:
    """
    Orchestrates the complete data pipeline for Kashmir tourism prediction.
    Manages execution flow, logging, and error handling.
    """

    def __init__(self, config_path: str = "config/config.yaml"):
        """
        Initialize the pipeline orchestrator

        Args:
            config_path: Path to the configuration YAML file
        """
        self.config_path = config_path
        self.config = self._load_config()
        self.logger = self._setup_logging()

        # Create all necessary directories
        self._create_directories()

    def _load_config(self) -> dict:
        """
        Load configuration from YAML file

        Returns:
            Configuration dictionary
        """
        try:
            with open(self.config_path, 'r') as f:
                config = yaml.safe_load(f)
            print(f"✓ Configuration loaded from {self.config_path}")
            return config
        except FileNotFoundError:
            print(f"✗ Configuration file not found: {self.config_path}")
            sys.exit(1)
        except yaml.YAMLError as e:
            print(f"✗ Error parsing configuration file: {e}")
            sys.exit(1)

    def _setup_logging(self) -> logging.Logger:
        """
        Set up logging configuration

        Returns:
            Configured logger instance
        """
        # Create logs directory
        os.makedirs(self.config['paths']['logs'], exist_ok=True)

        # Configure logging
        log_file = os.path.join(
            self.config['paths']['logs'],
            self.config['logging']['file']
        )

        logging.basicConfig(
            level=getattr(logging, self.config['logging']['level']),
            format=self.config['logging']['format'],
            handlers=[
                logging.FileHandler(log_file),
                logging.StreamHandler(sys.stdout)
            ]
        )

        logger = logging.getLogger(__name__)
        logger.info(f"Logging initialized. Log file: {log_file}")

        return logger

    def _create_directories(self):
        """
        Create all necessary directories for the pipeline
        """
        directories = [
            self.config['paths']['raw_data'],
            self.config['paths']['interim_data'],
            self.config['paths']['weather_raw'],
            self.config['paths']['weather_daily'],
            self.config['paths']['weather_monthly'],
            self.config['paths']['footfall_generated'],
            self.config['paths']['processed_data'],
            self.config['paths']['model_ready'],
            self.config['paths']['logs']
        ]

        for directory in directories:
            os.makedirs(directory, exist_ok=True)

        self.logger.info("All directories created/verified")

    def run_weather_collection(self, skip: bool = False) -> bool:
        """
        Step 1: Fetch weather data from API

        Args:
            skip: If True, skip this step

        Returns:
            True if successful, False otherwise
        """
        if skip:
            self.logger.info("Skipping weather data collection (--skip-weather flag)")
            return True

        try:
            self.logger.info("\n" + "=" * 70)
            self.logger.info("STEP 1/5: Weather Data Collection")
            self.logger.info("=" * 70)

            fetcher = WeatherDataFetcher(self.config)
            data, saved_files = fetcher.run()

            if not data or not saved_files:
                self.logger.error("Weather data collection failed - no data collected")
                return False

            self.logger.info(f"[SUCCESS] Weather data collection completed successfully")
            return True

        except Exception as e:
            self.logger.error(f"✗ Weather data collection failed: {str(e)}", exc_info=True)
            return False

    def run_weather_processing(self) -> bool:
        """
        Step 2: Process weather data (daily to monthly)

        Returns:
            True if successful, False otherwise
        """
        try:
            self.logger.info("\n" + "=" * 70)
            self.logger.info("STEP 2/5: Weather Data Processing")
            self.logger.info("=" * 70)

            processor = WeatherProcessor(self.config)
            result = processor.run()

            if result.empty:
                self.logger.error("Weather processing failed - empty result")
                return False

            self.logger.info(f"[SUCCESS] Weather processing completed successfully")
            return True

        except Exception as e:
            self.logger.error(f"✗ Weather processing failed: {str(e)}", exc_info=True)
            return False

    def run_footfall_generation(self) -> bool:
        """
        Step 3: Generate footfall estimates

        Returns:
            True if successful, False otherwise
        """
        try:
            self.logger.info("\n" + "=" * 70)
            self.logger.info("STEP 3/5: Footfall Data Generation")
            self.logger.info("=" * 70)

            generator = FootfallGenerator(self.config)
            result = generator.run()

            if result.empty:
                self.logger.error("Footfall generation failed - empty result")
                return False

            self.logger.info(f"[SUCCESS] Footfall generation completed successfully")
            return True

        except Exception as e:
            self.logger.error(f"✗ Footfall generation failed: {str(e)}", exc_info=True)
            return False

    def run_data_merging(self) -> bool:
        """
        Step 4: Merge weather and footfall data

        Returns:
            True if successful, False otherwise
        """
        try:
            self.logger.info("\n" + "=" * 70)
            self.logger.info("STEP 4/5: Data Merging")
            self.logger.info("=" * 70)

            merger = DataMerger(self.config)
            result = merger.run()

            if result.empty:
                self.logger.error("Data merging failed - empty result")
                return False

            self.logger.info(f"[SUCCESS] Data merging completed successfully")
            return True

        except Exception as e:
            self.logger.error(f"✗ Data merging failed: {str(e)}", exc_info=True)
            return False

    def run_feature_engineering(self) -> bool:
        """
        Step 5: Create ML-ready features

        Returns:
            True if successful, False otherwise
        """
        try:
            self.logger.info("\n" + "=" * 70)
            self.logger.info("STEP 5/5: Feature Engineering")
            self.logger.info("=" * 70)

            engineer = FeatureEngineer(self.config)
            result = engineer.run()

            if result.empty:
                self.logger.error("Feature engineering failed - empty result")
                return False

            self.logger.info(f"[SUCCESS] Feature engineering completed successfully")
            return True

        except Exception as e:
            self.logger.error(f"✗ Feature engineering failed: {str(e)}", exc_info=True)
            return False

    def run_full_pipeline(self, skip_weather: bool = False) -> bool:
        """
        Run the complete pipeline

        Args:
            skip_weather: If True, skip weather data collection

        Returns:
            True if all steps successful, False otherwise
        """
        start_time = datetime.now()

        self.logger.info("\n" + "=" * 70)
        self.logger.info("KASHMIR TOURISM PREDICTION - FULL PIPELINE")
        self.logger.info(f"Project: {self.config['project']['name']}")
        self.logger.info(f"Version: {self.config['project']['version']}")
        self.logger.info(f"Started: {start_time.strftime('%Y-%m-%d %H:%M:%S')}")
        self.logger.info("=" * 70)

        # Track success of each step
        steps = [
            ("Weather Collection", lambda: self.run_weather_collection(skip=skip_weather)),
            ("Weather Processing", self.run_weather_processing),
            ("Footfall Generation", self.run_footfall_generation),
            ("Data Merging", self.run_data_merging),
            ("Feature Engineering", self.run_feature_engineering)
        ]

        for step_name, step_func in steps:
            if not step_func():
                self.logger.error(f"\n✗ Pipeline failed at: {step_name}")
                return False

        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()

        self.logger.info("\n" + "=" * 70)
        self.logger.info("[SUCCESS] PIPELINE COMPLETED SUCCESSFULLY!")
        self.logger.info(f"Total execution time: {duration:.2f} seconds ({duration / 60:.2f} minutes)")
        self.logger.info(
            f"Final output: {os.path.join(self.config['paths']['model_ready'], self.config['files']['feature_engineered'])}")
        self.logger.info("=" * 70)

        return True


def main():
    """
    Main entry point for the pipeline
    """
    parser = argparse.ArgumentParser(
        description="Kashmir Tourism Prediction Data Pipeline",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Run full pipeline
  python pipeline/run_pipeline.py

  # Run with custom config
  python pipeline/run_pipeline.py --config my_config.yaml

  # Skip weather data collection (use existing data)
  python pipeline/run_pipeline.py --skip-weather
        """
    )

    parser.add_argument(
        '--config',
        type=str,
        default='config/config.yaml',
        help='Path to configuration file (default: config/config.yaml)'
    )

    parser.add_argument(
        '--skip-weather',
        action='store_true',
        help='Skip weather data collection (use existing weather data)'
    )

    args = parser.parse_args()

    # Run pipeline
    try:
        orchestrator = PipelineOrchestrator(config_path=args.config)
        success = orchestrator.run_full_pipeline(skip_weather=args.skip_weather)

        if success:
            print("\n[SUCCESS] Pipeline execution completed successfully!")
            sys.exit(0)
        else:
            print("\n[ERROR] Pipeline execution failed. Check logs for details.")
            sys.exit(1)

    except KeyboardInterrupt:
        print("\n\n[INTERRUPTED] Pipeline interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n[ERROR] Unexpected error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
