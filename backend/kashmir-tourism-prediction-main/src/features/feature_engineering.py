#!/usr/bin/env python3

"""
Feature Engineering
Creates ML-ready features from the merged tourism dataset
"""

import pandas as pd
import numpy as np
import os
import logging
from typing import Dict
from datetime import datetime


class FeatureEngineer:
    """
    Transforms merged tourism data into ML-ready features.
    Adds temporal features, seasonal encoding, and rolling statistics.
    """

    def __init__(self, config: Dict):
        """
        Initialize the feature engineer with configuration

        Args:
            config: Dictionary containing feature engineering configuration
        """
        self.config = config

        # Set up logging FIRST (needed for file path logging)
        self.logger = logging.getLogger(__name__)

        # Smart file loading: Try enhanced dataset first, fall back to final_dataset
        # This ensures we always use the most feature-rich version available
        enhanced_file = os.path.join(
            config['paths']['processed_data'],
            'enhanced_dataset.csv'
        )
        fallback_file = os.path.join(
            config['paths']['processed_data'],
            config['files']['final_dataset']
        )

        # Determine which file to use
        if os.path.exists(enhanced_file):
            self.input_file = enhanced_file
            self.logger.info("=" * 70)
            self.logger.info("LOADING ENHANCED DATASET")
            self.logger.info(f"File: {enhanced_file}")
            self.logger.info("This file includes holiday features and interactions")
            self.logger.info("=" * 70)
        elif os.path.exists(fallback_file):
            self.input_file = fallback_file
            self.logger.warning("=" * 70)
            self.logger.warning("ENHANCED DATASET NOT FOUND - Using fallback")
            self.logger.warning(f"File: {fallback_file}")
            self.logger.warning("Some features may be missing!")
            self.logger.warning("=" * 70)
        else:
            raise FileNotFoundError(
                f"Neither enhanced nor fallback dataset found:\n"
                f"  - Enhanced: {enhanced_file}\n"
                f"  - Fallback: {fallback_file}"
            )

        self.output_dir = config['paths']['model_ready']
        self.output_file = os.path.join(
            self.output_dir,
            config['files']['feature_engineered']
        )

        # Configuration parameters
        self.rolling_window = config['features']['rolling_window']
        self.seasons = config['features']['seasons']
        self.drop_columns = config['features']['drop_columns']

        # Create output directory
        os.makedirs(self.output_dir, exist_ok=True)

    def load_data(self) -> pd.DataFrame:
        """
        Load the merged dataset

        Returns:
            DataFrame with merged data
        """
        self.logger.info(f"Loading merged data from: {self.input_file}")
        df = pd.read_csv(self.input_file)
        self.logger.info(f"Loaded {len(df)} rows, {len(df.columns)} columns")
        return df

    def extract_temporal_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Extract year and month from time column

        Args:
            df: Input DataFrame

        Returns:
            DataFrame with temporal features added
        """
        df = df.copy()

        # Parse time column (format: YYYY-MM)
        df['time_dt'] = pd.to_datetime(df['time'] + '-01')
        df['year'] = df['time_dt'].dt.year
        df['month'] = df['time_dt'].dt.month

        # Drop temporary datetime column
        df = df.drop(columns=['time_dt'])

        self.logger.info("Extracted year and month features")

        return df

    def encode_season(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Encode season based on month

        Args:
            df: Input DataFrame with month column

        Returns:
            DataFrame with season encoding added
        """
        df = df.copy()

        def get_season(month):
            for season_name, months in self.seasons.items():
                if month in months:
                    if season_name == 'winter':
                        return 1
                    elif season_name == 'spring':
                        return 2
                    elif season_name == 'summer':
                        return 3
                    elif season_name == 'autumn':
                        return 4
            return 0  # Shouldn't happen

        df['season'] = df['month'].apply(get_season)

        self.logger.info("Encoded season feature")

        return df

    def encode_location(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Label encode tourist site names

        Args:
            df: Input DataFrame with tourist_site column

        Returns:
            DataFrame with location encoding added
        """
        df = df.copy()

        # Get unique locations and sort them
        unique_locations = sorted(df['tourist_site'].unique())

        # Create mapping dictionary
        location_mapping = {loc: idx + 1 for idx, loc in enumerate(unique_locations)}

        # Apply encoding
        df['location_encoded'] = df['tourist_site'].map(location_mapping)

        self.logger.info(f"Encoded {len(unique_locations)} locations")
        self.logger.debug(f"Location mapping: {location_mapping}")

        return df

    def add_rolling_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Add rolling average of footfall by location

        Args:
            df: Input DataFrame

        Returns:
            DataFrame with rolling features added
        """
        df = df.copy()

        # Sort by location and time to ensure proper rolling calculation
        df = df.sort_values(['tourist_site', 'time']).reset_index(drop=True)

        # Calculate rolling average for each location
        df['footfall_rolling_avg'] = df.groupby('tourist_site')['Footfall'].transform(
            lambda x: x.rolling(window=self.rolling_window, min_periods=1).mean()
        )

        self.logger.info(f"Added {self.rolling_window}-month rolling average")

        return df

    def create_interaction_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Create interaction features between weather variables

        Args:
            df: Input DataFrame

        Returns:
            DataFrame with interaction features added
        """
        df = df.copy()

        # Temperature × Sunshine interaction (ideal tourism weather)
        if 'temperature_2m_mean' in df.columns and 'sunshine_duration' in df.columns:
            df['temp_sunshine_interaction'] = df['temperature_2m_mean'] * df['sunshine_duration']
            self.logger.info("Created temperature-sunshine interaction feature")

        # Temperature range (max - min) shows daily variability
        if 'temperature_2m_max' in df.columns and 'temperature_2m_min' in df.columns:
            df['temperature_range'] = df['temperature_2m_max'] - df['temperature_2m_min']
            self.logger.info("Created temperature range feature")

        return df

    def select_final_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Select and order final features for model training.
        IMPORTANT: This list MUST match what the API expects!
        """
        df = df.copy()

        # Define features to keep - MUST MATCH API models.py PredictionInput
        final_features = [
            # Target variable (removed before training)
            'Footfall',

            # Metadata features
            'location_encoded',
            'year',
            'month',
            'season',

            # Rolling statistics
            'footfall_rolling_avg',

            # Core weather features (9 features)
            'temperature_2m_mean',
            'temperature_2m_max',
            'temperature_2m_min',
            'precipitation_sum',
            'snowfall_sum',
            'precipitation_hours',
            'windgusts_10m_max',
            'relative_humidity_2m_mean',
            'sunshine_duration',

            # Derived interaction features (3 features)
            'temp_sunshine_interaction',
            'temperature_range',
            'precipitation_temperature',  # ADDED: From DataEnhancer

            # Holiday features (5 features) - CRITICAL FOR API
            'holiday_count',
            'long_weekend_count',
            'national_holiday_count',
            'festival_holiday_count',
            'days_to_next_holiday'
        ]

        # Select only features that exist in dataframe
        available_features = [f for f in final_features if f in df.columns]

        if len(available_features) < len(final_features):
            missing = set(final_features) - set(available_features)
            self.logger.warning(f"Some features not available: {missing}")

        # Select these columns
        df = df[available_features]

        self.logger.info(f"Selected {len(available_features)} features for final dataset")
        self.logger.info(f"Feature list: {available_features}")

        return df

    def apply_footfall_floor(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Apply minimum footfall threshold to prevent unrealistic low values.
        Affects both actual and normalized data.

        Args:
            df: Input DataFrame

        Returns:
            DataFrame with footfall floor applied
        """
        df = df.copy()

        min_threshold = 1000  # Minimum 1,000 visitors per month per location

        # Count how many values below threshold
        below_threshold = (df['Footfall'] < min_threshold).sum()

        if below_threshold > 0:
            self.logger.warning(
                f"Found {below_threshold} footfall values < {min_threshold:,}. "
                f"Applying minimum threshold."
            )

            # Show which locations/years are affected
            affected = df[df['Footfall'] < min_threshold][['Footfall', 'location_encoded', 'year', 'month']]
            for _, row in affected.head(10).iterrows():
                self.logger.warning(
                    f"  Location {int(row['location_encoded'])}, "
                    f"{int(row['year'])}-{int(row['month']):02d}: "
                    f"{int(row['Footfall'])} -> {min_threshold}"
                )

            # Apply floor
            df.loc[df['Footfall'] < min_threshold, 'Footfall'] = min_threshold

            self.logger.info(f"Applied minimum footfall threshold: {min_threshold:,} visitors/month")

        return df

    def apply_log_transformation(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Apply log transformation to Footfall (AFTER floor/cap logic).

        This is the CORRECT place to apply log transformation because:
        1. Floor/cap was already applied in data_enhancer.py on RAW values
        2. We're now transforming clean, bounded data
        3. No risk of double transformation

        Args:
            df: Input DataFrame with RAW (floored/capped) footfall

        Returns:
            DataFrame with log-transformed Footfall
        """
        df = df.copy()
        target = 'Footfall'

        if target not in df.columns:
            self.logger.warning(f"Target column '{target}' not found")
            return df

        # Check if transformation is enabled in config
        if 'enhanced_features' in self.config:
            if self.config['enhanced_features']['target_transformation']['enabled']:
                method = self.config['enhanced_features']['target_transformation']['method']

                if method == 'log1p':
                    # Store original stats
                    original_min = df[target].min()
                    original_max = df[target].max()
                    original_mean = df[target].mean()

                    # Apply transformation
                    df[target] = np.log1p(df[target])

                    self.logger.info("=" * 70)
                    self.logger.info("APPLYING LOG TRANSFORMATION")
                    self.logger.info("=" * 70)
                    self.logger.info(f"Method: {method}")
                    self.logger.info(f"Original scale:")
                    self.logger.info(f"  Min: {original_min:,.0f}")
                    self.logger.info(f"  Max: {original_max:,.0f}")
                    self.logger.info(f"  Mean: {original_mean:,.0f}")
                    self.logger.info(f"Transformed scale:")
                    self.logger.info(f"  Min: {df[target].min():.4f}")
                    self.logger.info(f"  Max: {df[target].max():.4f}")
                    self.logger.info(f"  Mean: {df[target].mean():.4f}")
                    self.logger.info("=" * 70)
                else:
                    self.logger.warning(f"Unknown transformation method: {method}")
            else:
                self.logger.info("Log transformation disabled in config")
        else:
            self.logger.warning("Enhanced features config not found")

        return df

    def finalize_dataset(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Final cleanup and column ordering

        Args:
            df: Input DataFrame

        Returns:
            Final ML-ready DataFrame
        """
        df = df.copy()

        # Drop columns that shouldn't be in the model
        cols_to_drop = [col for col in self.drop_columns if col in df.columns]
        df = df.drop(columns=cols_to_drop)

        self.logger.info(f"Dropped columns: {cols_to_drop}")

        # Reorder columns - put target and key features first
        priority_cols = ['Footfall', 'location_encoded', 'year', 'month', 'season', 'footfall_rolling_avg']
        other_cols = [col for col in df.columns if col not in priority_cols]
        final_cols = [col for col in priority_cols if col in df.columns] + other_cols

        df = df[final_cols]

        # Check for any remaining missing values
        missing_counts = df.isnull().sum()
        if missing_counts.any():
            self.logger.warning("Remaining missing values:")
            for col, count in missing_counts[missing_counts > 0].items():
                self.logger.warning(f"  {col}: {count} missing values")
                # Fill with mean for numeric columns
                if df[col].dtype in ['float64', 'int64']:
                    df[col].fillna(df[col].mean(), inplace=True)
                    self.logger.info(f"  Filled {col} with mean value")

        self.logger.info(f"Final dataset: {len(df)} rows, {len(df.columns)} columns")

        return df

    def run(self) -> pd.DataFrame:
        """
        Execute the complete feature engineering pipeline

        Returns:
            Feature-engineered DataFrame
        """
        start_time = datetime.now()
        self.logger.info("=" * 70)
        self.logger.info("FEATURE ENGINEERING STARTED")
        self.logger.info("=" * 70)

        # Step 1: Load data (should have floor/cap already applied, but NOT log-transformed)
        df = self.load_data()

        # Step 2: Extract temporal features
        df = self.extract_temporal_features(df)

        # Step 3: Encode season
        df = self.encode_season(df)

        # Step 4: Encode location
        df = self.encode_location(df)

        # Step 5: Add rolling features
        df = self.add_rolling_features(df)

        # Step 6: Create interaction features
        df = self.create_interaction_features(df)

        # Step 7: Select final features
        df = self.select_final_features(df)

        # Step 8: Apply log transformation (NEW! - AFTER floor/cap)
        self.logger.info("Applying log transformation (after floor/cap from enhancement)...")
        df = self.apply_log_transformation(df)

        # Step 9: Final cleanup (no longer applies floor - that was done earlier)
        self.logger.info("Footfall floor already applied in enhancement step (pre-transformation)")

        # Check for enhanced features
        if 'enhanced_features' in self.config and self.config['enhanced_features']['holidays']['enabled']:
            self.logger.info("Enhanced features already applied in data preparation")
            self.logger.info(f"Dataset shape: {df.shape}")

        # Save feature-engineered dataset
        df.to_csv(self.output_file, index=False)
        self.logger.info(f"Saved feature-engineered data: {self.output_file}")

        # Calculate duration
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()

        self.logger.info("=" * 70)
        self.logger.info(f"FEATURE ENGINEERING COMPLETED in {duration:.2f} seconds")
        self.logger.info(f"Output file: {self.output_file}")
        self.logger.info("=" * 70)

        return df
