#!/usr/bin/env python3
"""
Kashmir Tourism Prediction - Complete Pipeline
Unified pipeline combining weather fetching, processing, enhancements, and feature engineering

Author: Kashmir Tourism Prediction Team
Version: 2.0.0
"""

import os
import sys
import yaml
import logging
import argparse
from datetime import datetime
from pathlib import Path
from typing import Dict, Optional

# Add parent directory to path to import our modules
sys.path.insert(0, str(Path(__file__).parent.parent))

# Import all required modules
from src.data_collection.weather_fetcher import WeatherDataFetcher
from src.data_processing.weather_processor import WeatherProcessor
from src.data_processing.footfall_generator import FootfallGenerator
from src.data_processing.data_merger import DataMerger
from src.data_processing.holiday_processor import HolidayProcessor
from src.data_processing.data_enhancer import DataEnhancer
from src.features.feature_engineering import FeatureEngineer


class CompletePipelineOrchestrator:
    """
    Orchestrates the complete end-to-end data pipeline for Kashmir tourism prediction.

    Pipeline Steps:
    1. Weather Data Collection (API fetch)
    2. Weather Data Processing (daily -> monthly aggregation)
    3. Footfall Generation (generate tourist footfall data)
    4. Data Merging (combine weather + footfall)
    5. Holiday Processing (add holiday features)
    6. Data Enhancement (interactions, log transform)
    7. Feature Engineering (final ML-ready features)
    """

    def __init__(self, config_path: str = "config/config.yaml", skip_weather: bool = False,
                 skip_enhancements: bool = False):
        """
        Initialize the pipeline orchestrator.

        Args:
            config_path: Path to configuration YAML file
            skip_weather: If True, skip weather data fetching (use existing data)
            skip_enhancements: If True, skip holiday and enhancement steps
        """
        self.skip_weather = skip_weather
        self.skip_enhancements = skip_enhancements
        self.config = None
        self.logger = None

        # Resolve config path - handle both root and pipeline/ directory execution
        script_dir = Path(__file__).parent  # pipeline/ directory
        project_root = script_dir.parent  # project root directory

        # Try multiple possible locations for config file
        possible_paths = [
            Path(config_path),  # Direct path as given
            project_root / config_path,  # From project root
            project_root / "config" / "config.yaml",  # Standard location
            script_dir / config_path,  # From script directory
            Path("config/config.yaml"),  # Relative from current dir
            Path("../config/config.yaml"),  # Up one level from pipeline/
        ]

        # Find the first path that exists
        config_found = False
        for path in possible_paths:
            if path.exists():
                self.config_path = str(path)
                config_found = True
                break

        if not config_found:
            raise FileNotFoundError(
                f"Config file not found. Searched in:\n" +
                "\n".join([f"  - {p}" for p in possible_paths])
            )

        # Initialize
        self._setup_logging()
        self._load_config()
        self._create_directories()

    def _setup_logging(self):
        """Setup comprehensive logging to file and console."""
        log_dir = 'logs'
        os.makedirs(log_dir, exist_ok=True)

        log_file = os.path.join(
            log_dir,
            f'complete_pipeline_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'
        )

        # Configure logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_file),
                logging.StreamHandler(sys.stdout)
            ]
        )

        self.logger = logging.getLogger(__name__)
        self.logger.info(f"Logging initialized. Log file: {log_file}")

    def _load_config(self):
        """Load configuration from YAML file."""
        try:
            if not os.path.exists(self.config_path):
                raise FileNotFoundError(f"Config file not found: {self.config_path}")

            with open(self.config_path, 'r') as f:
                self.config = yaml.safe_load(f)

            self.logger.info(f"Configuration loaded from {self.config_path}")

        except Exception as e:
            self.logger.error(f"Failed to load configuration: {e}")
            raise

    def _create_directories(self):
        """Create all necessary directories from config."""
        try:
            directories = [
                self.config['paths']['raw_data'],
                self.config['paths']['interim_data'],
                self.config['paths']['weather_raw'],
                self.config['paths']['weather_daily'],
                self.config['paths']['weather_monthly'],
                self.config['paths']['footfall_generated'],
                self.config['paths']['processed_data'],
                self.config['paths']['model_ready'],
                self.config['paths']['logs'],
            ]

            for directory in directories:
                os.makedirs(directory, exist_ok=True)

            self.logger.info("All directories created/verified")

        except Exception as e:
            self.logger.error(f"Failed to create directories: {e}")
            raise

    def _log_step_header(self, step_num: int, total_steps: int, step_name: str):
        """Log a formatted step header."""
        separator = "=" * 80
        self.logger.info(f"\n{separator}")
        self.logger.info(f"STEP {step_num}/{total_steps}: {step_name}")
        self.logger.info(separator)

    def step1_fetch_weather_data(self) -> bool:
        """
        Step 1: Fetch weather data from Open-Meteo API.

        Returns:
            bool: True if successful, False otherwise
        """
        if self.skip_weather:
            self.logger.info("[SKIP]  Skipping weather data fetch (--skip-weather flag)")
            return True

        self._log_step_header(1, 7, "WEATHER DATA COLLECTION (API Fetch)")

        try:
            fetcher = WeatherDataFetcher(self.config)
            weather_data, saved_files = fetcher.run()

            self.logger.info(f"[OK] Weather data fetched successfully")
            self.logger.info(f"   -> Locations processed: {len(saved_files)}")
            self.logger.info(f"   -> Total records: {len(weather_data)}")

            return True

        except Exception as e:
            self.logger.error(f"[FAILED] Weather data fetch failed: {e}")
            return False

    def step2_process_weather_data(self) -> bool:
        """
        Step 2: Process weather data (daily -> monthly aggregation).

        Returns:
            bool: True if successful, False otherwise
        """
        self._log_step_header(2, 7, "WEATHER DATA PROCESSING (Daily -> Monthly)")

        try:
            processor = WeatherProcessor(self.config)
            processor.run()

            self.logger.info("[OK] Weather data processed successfully")
            self.logger.info("   -> Daily data aggregated to monthly")
            self.logger.info("   -> All locations combined")

            return True

        except Exception as e:
            self.logger.error(f"[FAILED] Weather processing failed: {e}")
            return False

    def step3_generate_footfall(self) -> bool:
        """
        Step 3: Generate tourist footfall data.

        Returns:
            bool: True if successful, False otherwise
        """
        self._log_step_header(3, 7, "FOOTFALL DATA GENERATION")

        try:
            generator = FootfallGenerator(self.config)
            generator.run()

            self.logger.info("[OK] Footfall data generated successfully")
            self.logger.info("   -> Tourist footfall data created")

            return True

        except Exception as e:
            self.logger.error(f"[FAILED] Footfall generation failed: {e}")
            return False

    def step4_merge_data(self) -> bool:
        """
        Step 4: Merge weather and footfall data.

        Returns:
            bool: True if successful, False otherwise
        """
        self._log_step_header(4, 7, "DATA MERGING (Weather + Footfall)")

        try:
            merger = DataMerger(self.config)
            merger.run()

            self.logger.info("[OK] Data merged successfully")
            self.logger.info("   -> Weather and footfall data combined")

            return True

        except Exception as e:
            self.logger.error(f"[FAILED] Data merging failed: {e}")
            return False

    def step5_process_holidays(self) -> bool:
        """
        Step 5: Add holiday features to the dataset.

        Returns:
            bool: True if successful, False otherwise
        """
        if self.skip_enhancements:
            self.logger.info("[SKIP]  Skipping holiday processing (--skip-enhancements flag)")
            return True

        self._log_step_header(5, 7, "HOLIDAY PROCESSING")

        try:
            # Load the merged dataset
            import os
            merged_file = os.path.join(
                self.config['paths']['processed_data'],
                self.config['files']['final_dataset']
            )

            if not os.path.exists(merged_file):
                self.logger.error(f"Merged dataset not found: {merged_file}")
                return False

            import pandas as pd
            tourism_df = pd.read_csv(merged_file)

            # Process holidays
            holiday_processor = HolidayProcessor(self.config)
            enhanced_df = holiday_processor.process(tourism_df)  # [OK] CORRECT method

            # Save the result
            enhanced_df.to_csv(merged_file, index=False)

            self.logger.info("Holiday features added successfully")
            self.logger.info(f"   Dataset shape: {enhanced_df.shape}")

            return True

        except Exception as e:
            self.logger.error(f"[FAILED] Holiday processing failed: {e}")
            return False

    def step6_enhance_data(self) -> bool:
        """
        Step 6: Enhance data with interactions and log transformations.

        Returns:
            bool: True if successful, False otherwise
        """
        if self.skip_enhancements:
            self.logger.info("Skipping data enhancements (--skip-enhancements flag)")
            return True

        self._log_step_header(6, 7, "DATA ENHANCEMENT")

        try:
            # Load the dataset (after holiday processing)
            import os
            import pandas as pd

            merged_file = os.path.join(
                self.config['paths']['processed_data'],
                self.config['files']['final_dataset']
            )

            if not os.path.exists(merged_file):
                self.logger.error(f"Dataset not found: {merged_file}")
                return False

            df = pd.read_csv(merged_file)
            self.logger.info(f"   Loaded dataset with {len(df)} rows, {len(df.columns)} columns")

            # Enhance with all features
            enhancer = DataEnhancer(self.config)
            enhanced_df = enhancer.enhance(df, include_interactions=True)

            # Save enhanced dataset to TWO locations for data flow integrity

            # Location 1: Enhanced dataset (for reference/debugging)
            enhanced_file = os.path.join(
                self.config['paths']['processed_data'],
                'enhanced_dataset.csv'
            )
            enhanced_df.to_csv(enhanced_file, index=False)
            self.logger.info(f"   Enhanced dataset saved to: {enhanced_file}")

            # Location 2: ALSO overwrite the final_dataset so Step 7 gets enhanced data
            final_file = os.path.join(
                self.config['paths']['processed_data'],
                self.config['files']['final_dataset']
            )
            enhanced_df.to_csv(final_file, index=False)
            self.logger.info(f"   Also saved as final dataset: {final_file}")
            self.logger.info(f"   This ensures Step 7 loads the ENHANCED version")

            # Log final stats
            self.logger.info("Data enhanced successfully")
            self.logger.info(f"   Dataset shape: {enhanced_df.shape}")
            self.logger.info(f"   Total features: {len(enhanced_df.columns)}")
            self.logger.info(f"   Column names: {list(enhanced_df.columns)}")

            return True

        except Exception as e:
            self.logger.error(f"Data enhancement failed: {e}")
            import traceback
            self.logger.error(traceback.format_exc())
            return False

    def step7_engineer_features(self) -> bool:
        """
        Step 7: Final feature engineering for ML model.

        Returns:
            bool: True if successful, False otherwise
        """
        self._log_step_header(7, 7, "FEATURE ENGINEERING (ML-Ready)")

        try:
            engineer = FeatureEngineer(self.config)
            engineer.run()

            self.logger.info("[OK] Feature engineering completed successfully")
            self.logger.info("   -> Temporal features added")
            self.logger.info("   -> Rolling statistics computed")
            self.logger.info("   -> Dataset ready for model training")

            return True

        except Exception as e:
            self.logger.error(f"[FAILED] Feature engineering failed: {e}")
            return False

    def run(self) -> bool:
        """
        Execute the complete pipeline.

        Returns:
            bool: True if all steps successful, False if any step fails
        """
        start_time = datetime.now()

        # Print header
        separator = "=" * 80
        self.logger.info("\n" + separator)
        self.logger.info("KASHMIR TOURISM PREDICTION - COMPLETE PIPELINE v2.0")
        self.logger.info(separator)
        self.logger.info(f"Started at: {start_time.strftime('%Y-%m-%d %H:%M:%S')}")
        self.logger.info(f"Config: {self.config_path}")
        self.logger.info(f"Skip Weather: {self.skip_weather}")
        self.logger.info(f"Skip Enhancements: {self.skip_enhancements}")
        self.logger.info(separator + "\n")

        # Execute pipeline steps
        steps = [
            (self.step1_fetch_weather_data, "Weather Data Collection"),
            (self.step2_process_weather_data, "Weather Data Processing"),
            (self.step3_generate_footfall, "Footfall Generation"),
            (self.step4_merge_data, "Data Merging"),
            (self.step5_process_holidays, "Holiday Processing"),
            (self.step6_enhance_data, "Data Enhancement"),
            (self.step7_engineer_features, "Feature Engineering"),
        ]

        failed_steps = []

        for step_func, step_name in steps:
            try:
                success = step_func()
                if not success:
                    failed_steps.append(step_name)
                    self.logger.error(f"Step failed: {step_name}")
            except Exception as e:
                failed_steps.append(step_name)
                self.logger.error(f"Step crashed: {step_name} - {e}")

        # Final summary
        end_time = datetime.now()
        duration = end_time - start_time

        self.logger.info("\n" + separator)
        self.logger.info("PIPELINE EXECUTION SUMMARY")
        self.logger.info(separator)
        self.logger.info(f"Completed at: {end_time.strftime('%Y-%m-%d %H:%M:%S')}")
        self.logger.info(f"Total duration: {duration}")

        if failed_steps:
            self.logger.error(f"[FAILED] Pipeline FAILED. Failed steps: {', '.join(failed_steps)}")
            self.logger.info(separator + "\n")
            return False
        else:
            self.logger.info("[OK] Pipeline completed SUCCESSFULLY!")
            self.logger.info("   -> All data processing steps completed")
            self.logger.info("   -> Dataset ready for model training")
            self.logger.info(f"   -> Next step: Run training with 'python scripts/train_models.py'")
            self.logger.info(separator + "\n")
            return True


def parse_arguments():
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(
        description='Kashmir Tourism Prediction - Complete Data Pipeline',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Run complete pipeline (fetch weather data)
  python pipeline/run_complete_pipeline.py

  # Skip weather fetching (use existing data)
  python pipeline/run_complete_pipeline.py --skip-weather

  # Run basic pipeline only (no enhancements)
  python pipeline/run_complete_pipeline.py --skip-enhancements

  # Custom config file
  python pipeline/run_complete_pipeline.py --config my_config.yaml
        """
    )

    parser.add_argument(
        '--config',
        type=str,
        default='config/config.yaml',
        help='Path to configuration file (default: config.yaml)'
    )

    parser.add_argument(
        '--skip-weather',
        action='store_true',
        help='Skip weather data fetching (use existing weather data)'
    )

    parser.add_argument(
        '--skip-enhancements',
        action='store_true',
        help='Skip holiday processing and data enhancements'
    )

    return parser.parse_args()


def main():
    """Main entry point."""
    # Parse arguments
    args = parse_arguments()

    try:
        # Create and run pipeline
        pipeline = CompletePipelineOrchestrator(
            config_path=args.config,
            skip_weather=args.skip_weather,
            skip_enhancements=args.skip_enhancements
        )

        success = pipeline.run()

        # Exit with appropriate code
        sys.exit(0 if success else 1)

    except KeyboardInterrupt:
        print("\n\n⚠️  Pipeline interrupted by user")
        sys.exit(130)

    except Exception as e:
        print(f"\n\n[FAILED] Pipeline failed with error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
