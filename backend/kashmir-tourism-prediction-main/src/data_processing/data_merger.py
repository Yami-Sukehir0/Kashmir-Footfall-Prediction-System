#!/usr/bin/env python3

"""
Data Merger
Combines weather and footfall data into a single dataset for ML training
"""

import pandas as pd
import os
import logging
from typing import Dict, Tuple
from datetime import datetime


class DataMerger:
    """
    Merges weather data and tourist footfall data into a unified dataset.
    Handles location name standardization and data validation.
    """

    def __init__(self, config: Dict):
        """
        Initialize the data merger with configuration

        Args:
            config: Dictionary containing merge configuration
        """
        self.config = config
        self.processed_dir = config['paths']['processed_data']
        self.weather_file = os.path.join(
            self.processed_dir,
            config['files']['weather_combined']
        )
        self.footfall_file = os.path.join(
            self.processed_dir,
            config['files']['footfall_generated']
        )
        self.output_file = os.path.join(
            self.processed_dir,
            config['files']['final_dataset']
        )

        # Location name mapping
        self.location_mapping = config['merge']['location_mapping']

        # Set up logging
        self.logger = logging.getLogger(__name__)

    def standardize_location_names(self, df: pd.DataFrame, column: str) -> pd.DataFrame:
        """
        Standardize location names using the mapping

        Args:
            df: DataFrame containing location names
            column: Name of the column with location names

        Returns:
            DataFrame with standardized location names
        """
        df = df.copy()

        # Apply mapping
        df[column] = df[column].replace(self.location_mapping)

        return df

    def load_data(self) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """
        Load weather and footfall data

        Returns:
            Tuple of (weather_df, footfall_df)
        """
        self.logger.info(f"Loading weather data from: {self.weather_file}")
        weather_df = pd.read_csv(self.weather_file)

        self.logger.info(f"Loading footfall data from: {self.footfall_file}")
        footfall_df = pd.read_csv(self.footfall_file)

        self.logger.info(f"Weather data: {len(weather_df)} rows")
        self.logger.info(f"Footfall data: {len(footfall_df)} rows")

        return weather_df, footfall_df

    def prepare_data_for_merge(
            self,
            weather_df: pd.DataFrame,
            footfall_df: pd.DataFrame
    ) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """
        Prepare both datasets for merging

        Args:
            weather_df: Weather DataFrame
            footfall_df: Footfall DataFrame

        Returns:
            Tuple of prepared DataFrames
        """
        # Standardize location names in footfall data
        footfall_df = self.standardize_location_names(footfall_df, 'Tourist Site')

        # Rename columns for clarity
        footfall_df = footfall_df.rename(columns={'Tourist Site': 'tourist_site'})
        weather_df = weather_df.rename(columns={'location': 'tourist_site'})

        # Ensure time columns are strings in same format (YYYY-MM)
        footfall_df['time'] = footfall_df['Time'].astype(str)
        weather_df['time'] = weather_df['time'].astype(str)

        # Drop the original Time column from footfall
        footfall_df = footfall_df.drop(columns=['Time'])

        # Convert footfall to numeric
        footfall_df['Footfall'] = pd.to_numeric(footfall_df['Footfall'], errors='coerce')

        self.logger.info("Data prepared for merging")

        return weather_df, footfall_df

    def merge_datasets(
            self,
            weather_df: pd.DataFrame,
            footfall_df: pd.DataFrame
    ) -> pd.DataFrame:
        """
        Merge weather and footfall data on location and time

        Args:
            weather_df: Prepared weather DataFrame
            footfall_df: Prepared footfall DataFrame

        Returns:
            Merged DataFrame
        """
        # Perform inner join on tourist_site and time
        merged_df = pd.merge(
            footfall_df,
            weather_df,
            on=['tourist_site', 'time'],
            how='inner'
        )

        self.logger.info(f"Merged dataset: {len(merged_df)} rows")

        # Check for missing values
        missing_counts = merged_df.isnull().sum()
        if missing_counts.any():
            self.logger.warning("Missing values detected:")
            for col, count in missing_counts[missing_counts > 0].items():
                self.logger.warning(f"  {col}: {count} missing values")

        # Reorder columns - put key columns first
        key_cols = ['tourist_site', 'time', 'Footfall']
        other_cols = [col for col in merged_df.columns if col not in key_cols]
        merged_df = merged_df[key_cols + other_cols]

        return merged_df

    def validate_merge(self, merged_df: pd.DataFrame) -> bool:
        """
        Validate the merged dataset

        Args:
            merged_df: Merged DataFrame to validate

        Returns:
            True if validation passes, False otherwise
        """
        # Check if merge resulted in empty dataset
        if len(merged_df) == 0:
            self.logger.error("Merged dataset is empty!")
            return False

        # Check unique locations
        unique_locations = merged_df['tourist_site'].unique()
        self.logger.info(f"Locations in merged data: {len(unique_locations)}")
        for loc in sorted(unique_locations):
            count = len(merged_df[merged_df['tourist_site'] == loc])
            self.logger.info(f"  {loc}: {count} records")

        # Check date range
        merged_df['time_dt'] = pd.to_datetime(merged_df['time'] + '-01')
        min_date = merged_df['time_dt'].min()
        max_date = merged_df['time_dt'].max()
        self.logger.info(f"Date range: {min_date.strftime('%Y-%m')} to {max_date.strftime('%Y-%m')}")

        # Drop temporary column
        merged_df.drop(columns=['time_dt'], inplace=True)

        # Check for negative footfall values
        negative_footfall = merged_df[merged_df['Footfall'] < 0]
        if len(negative_footfall) > 0:
            self.logger.warning(f"Found {len(negative_footfall)} rows with negative footfall")

        return True

    def run(self) -> pd.DataFrame:
        """
        Execute the complete data merging pipeline

        Returns:
            Merged DataFrame
        """
        start_time = datetime.now()
        self.logger.info("=" * 70)
        self.logger.info("DATA MERGING STARTED")
        self.logger.info("=" * 70)

        # Load data
        weather_df, footfall_df = self.load_data()

        # Prepare data
        weather_df, footfall_df = self.prepare_data_for_merge(weather_df, footfall_df)

        # Merge datasets
        merged_df = self.merge_datasets(weather_df, footfall_df)

        # Validate merge
        if not self.validate_merge(merged_df):
            self.logger.error("Merge validation failed!")
            return pd.DataFrame()

        # Save merged dataset
        merged_df.to_csv(self.output_file, index=False)
        self.logger.info(f"Saved merged dataset: {self.output_file}")

        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()

        self.logger.info("=" * 70)
        self.logger.info(f"DATA MERGING COMPLETED in {duration:.2f} seconds")
        self.logger.info(f"Output file: {self.output_file}")
        self.logger.info("=" * 70)

        return merged_df
