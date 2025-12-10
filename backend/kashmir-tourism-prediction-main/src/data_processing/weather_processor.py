#!/usr/bin/env python3

"""
Weather Data Processor
Converts daily weather data to monthly aggregates and combines all locations
"""

import pandas as pd
import os
import logging
from typing import Dict, List
from datetime import datetime


class WeatherProcessor:
    """
    Processes daily weather data into monthly aggregates.
    Removes unnecessary columns and combines data from all locations.
    """

    def __init__(self, config: Dict):
        """
        Initialize the weather processor with configuration

        Args:
            config: Dictionary containing processing configuration
        """
        self.config = config
        self.input_dir = config['paths']['weather_raw']
        self.output_dir = config['paths']['weather_monthly']
        self.combined_file = os.path.join(
            config['paths']['processed_data'],
            config['files']['weather_combined']
        )
        self.columns_to_remove = config['weather']['columns_to_remove']

        # Set up logging
        self.logger = logging.getLogger(__name__)

        # Create output directories
        os.makedirs(self.output_dir, exist_ok=True)
        os.makedirs(config['paths']['processed_data'], exist_ok=True)

    def process_daily_to_monthly(self, df: pd.DataFrame, location_name: str) -> pd.DataFrame:
        """
        Convert daily weather data to monthly averages

        Args:
            df: DataFrame with daily weather data
            location_name: Name of the location

        Returns:
            DataFrame with monthly aggregated data
        """
        # Make a copy to avoid modifying original
        df = df.copy()

        # Remove unnecessary columns
        df = df.drop(columns=[col for col in self.columns_to_remove if col in df.columns],
                     errors='ignore')

        # Convert time column to datetime
        df['time'] = pd.to_datetime(df['time'])

        # Extract year and month for grouping
        df['year'] = df['time'].dt.year
        df['month'] = df['time'].dt.month

        # Group by year and month, calculate means
        monthly_df = df.groupby(['year', 'month']).agg({
            col: 'mean' for col in df.columns if col not in ['time', 'year', 'month', 'location']
        }).reset_index()

        # Create year-month string for better readability
        monthly_df['time'] = monthly_df.apply(
            lambda row: f"{int(row['year'])}-{int(row['month']):02d}", axis=1
        )

        # Drop separate year and month columns
        monthly_df = monthly_df.drop(columns=['year', 'month'])

        # Add location column
        monthly_df['location'] = location_name

        # Reorder columns - time and location first
        cols = ['time', 'location'] + [col for col in monthly_df.columns if col not in ['time', 'location']]
        monthly_df = monthly_df[cols]

        self.logger.info(f"Converted {location_name}: {len(df)} daily -> {len(monthly_df)} monthly records")

        return monthly_df

    def process_all_files(self) -> Dict[str, pd.DataFrame]:
        """
        Process all weather files in the input directory

        Returns:
            Dictionary mapping location names to monthly DataFrames
        """
        monthly_data = {}

        # Get all CSV files from input directory
        csv_files = [f for f in os.listdir(self.input_dir) if f.endswith('.csv')]

        if not csv_files:
            self.logger.warning(f"No CSV files found in {self.input_dir}")
            return monthly_data

        self.logger.info(f"Found {len(csv_files)} weather files to process")

        for filename in csv_files:
            filepath = os.path.join(self.input_dir, filename)

            try:
                # Read daily data
                df = pd.read_csv(filepath)

                # Extract location name from filename or dataframe
                if 'location' in df.columns and not df['location'].empty:
                    location_name = df['location'].iloc[0]
                else:
                    # Fallback: extract from filename
                    location_name = filename.replace('_weather.csv', '').replace('_', ', ')

                # Process to monthly
                monthly_df = self.process_daily_to_monthly(df, location_name)
                monthly_data[location_name] = monthly_df

                # Save individual monthly file
                output_filename = filename.replace('_weather.csv', '_monthly.csv')
                output_path = os.path.join(self.output_dir, output_filename)
                monthly_df.to_csv(output_path, index=False)

                self.logger.info(f"Saved monthly data: {output_filename}")

            except Exception as e:
                self.logger.error(f"Error processing {filename}: {str(e)}")
                continue

        return monthly_data

    def combine_all_locations(self, monthly_data: Dict[str, pd.DataFrame]) -> pd.DataFrame:
        """
        Combine monthly data from all locations into a single DataFrame

        Args:
            monthly_data: Dictionary mapping locations to DataFrames

        Returns:
            Combined DataFrame with all locations
        """
        if not monthly_data:
            self.logger.error("No monthly data to combine")
            return pd.DataFrame()

        # Concatenate all location dataframes
        combined_df = pd.concat(monthly_data.values(), ignore_index=True)

        # Sort by location and time
        combined_df = combined_df.sort_values(['location', 'time']).reset_index(drop=True)

        self.logger.info(f"Combined data from {len(monthly_data)} locations: {len(combined_df)} total rows")

        return combined_df

    def run(self) -> pd.DataFrame:
        """
        Execute the complete weather processing pipeline

        Returns:
            Combined monthly weather DataFrame
        """
        start_time = datetime.now()
        self.logger.info("=" * 70)
        self.logger.info("WEATHER DATA PROCESSING STARTED")
        self.logger.info("=" * 70)

        # Process all files to monthly
        monthly_data = self.process_all_files()

        if not monthly_data:
            self.logger.error("No data processed. Aborting.")
            return pd.DataFrame()

        # Combine all locations
        combined_df = self.combine_all_locations(monthly_data)

        # Save combined file
        combined_df.to_csv(self.combined_file, index=False)
        self.logger.info(f"Saved combined weather data: {self.combined_file}")

        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()

        self.logger.info("=" * 70)
        self.logger.info(f"WEATHER DATA PROCESSING COMPLETED in {duration:.2f} seconds")
        self.logger.info(f"Output file: {self.combined_file}")
        self.logger.info("=" * 70)

        return combined_df
