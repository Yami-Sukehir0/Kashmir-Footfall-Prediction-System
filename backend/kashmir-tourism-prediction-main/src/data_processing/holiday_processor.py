#!/usr/bin/env python3

"""
Holiday Data Processor
Processes holiday calendar and creates monthly aggregates
Integrates with tourism data
"""

import pandas as pd
import numpy as np
import os
import logging
from typing import Dict


class HolidayProcessor:
    """
    Processes holiday data into monthly features
    """

    def __init__(self, config: Dict):
        """
        Initialize holiday processor

        Args:
            config: Configuration dictionary
        """
        self.config = config
        self.holiday_config = config['enhanced_features']['holidays']
        self.logger = logging.getLogger(__name__)

    def load_holidays(self) -> pd.DataFrame:
        """
        Load holiday data from CSV

        Returns:
            DataFrame with holiday information
        """
        filepath = self.holiday_config['filepath']

        if not os.path.exists(filepath):
            self.logger.warning(f"Holiday file not found: {filepath}")
            return pd.DataFrame()

        self.logger.info(f"Loading holidays from: {filepath}")

        df = pd.read_csv(filepath)
        df['date'] = pd.to_datetime(df['date'])

        self.logger.info(f"Loaded {len(df)} holidays")

        return df

    def aggregate_by_month(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Aggregate holidays to monthly level

        Args:
            df: Holiday dataframe

        Returns:
            Monthly aggregated holidays
        """
        if df.empty:
            self.logger.warning("No holiday data to aggregate")
            return pd.DataFrame()

        df = df.copy()
        df['year'] = df['date'].dt.year
        df['month'] = df['date'].dt.month

        # Create monthly aggregates properly
        monthly_holidays = df.groupby(['year', 'month']).agg({
            'holiday_name': 'count',
            'is_long_weekend': 'sum'
        }).reset_index()

        # Rename the first set of columns
        monthly_holidays.columns = ['year', 'month', 'holiday_count', 'long_weekend_count']

        # Add holiday types separately
        national_holidays = (df[df['holiday_type'] == 'National']
                             .groupby(['year', 'month']).size()
                             .reset_index(name='national_holiday_count'))

        festival_holidays = (df[df['holiday_type'] == 'Festival']
                             .groupby(['year', 'month']).size()
                             .reset_index(name='festival_holiday_count'))

        # Merge all together
        monthly_holidays = monthly_holidays.merge(national_holidays,
                                                  on=['year', 'month'],
                                                  how='left')
        monthly_holidays = monthly_holidays.merge(festival_holidays,
                                                  on=['year', 'month'],
                                                  how='left')

        # Fill NaN with 0
        monthly_holidays['national_holiday_count'] = monthly_holidays['national_holiday_count'].fillna(0).astype(int)
        monthly_holidays['festival_holiday_count'] = monthly_holidays['festival_holiday_count'].fillna(0).astype(int)

        self.logger.info(f"Aggregated to {len(monthly_holidays)} month-year combinations")

        return monthly_holidays

    def merge_with_tourism(
            self,
            tourism_df: pd.DataFrame,
            holidays_monthly: pd.DataFrame
    ) -> pd.DataFrame:
        """
        Merge monthly holidays with tourism data

        Args:
            tourism_df: Tourism data with year, month columns
            holidays_monthly: Monthly aggregated holidays

        Returns:
            Merged dataframe
        """
        tourism_df = tourism_df.copy()

        # Extract year and month if they don't exist
        if 'year' not in tourism_df.columns:
            # Check if there's a date column or time column
            if 'time' in tourism_df.columns:
                tourism_df['time'] = pd.to_datetime(tourism_df['time'], errors='coerce')
                tourism_df['year'] = tourism_df['time'].dt.year
                tourism_df['month'] = tourism_df['time'].dt.month
            else:
                self.logger.warning("No 'time' or 'year'/'month' columns found")
                # Add zero columns if can't extract
                for col in ['holiday_count', 'long_weekend_count',
                            'national_holiday_count', 'festival_holiday_count']:
                    tourism_df[col] = 0
                return tourism_df

        if holidays_monthly.empty:
            self.logger.warning("No holiday data to merge, adding zero columns")

            # Add zero columns if no holiday data
            for col in ['holiday_count', 'long_weekend_count',
                        'national_holiday_count', 'festival_holiday_count']:
                tourism_df[col] = 0

            return tourism_df

        # Merge on year and month
        merged_df = tourism_df.merge(
            holidays_monthly,
            on=['year', 'month'],
            how='left'
        )

        # Fill NaN with 0 (months with no holidays)
        holiday_cols = ['holiday_count', 'long_weekend_count',
                        'national_holiday_count', 'festival_holiday_count']

        for col in holiday_cols:
            if col in merged_df.columns:
                merged_df[col] = merged_df[col].fillna(0).astype(int)
            else:
                merged_df[col] = 0

        self.logger.info(f"Merged holiday data with tourism data")
        self.logger.info(f"Holiday features added: {holiday_cols}")

        return merged_df

    def process(self, tourism_df: pd.DataFrame) -> pd.DataFrame:
        """
        Complete holiday processing pipeline

        Args:
            tourism_df: Tourism data

        Returns:
            Enhanced dataframe with holiday features
        """
        self.logger.info("=" * 70)
        self.logger.info("PROCESSING HOLIDAY DATA")
        self.logger.info("=" * 70)

        # Load holidays
        holidays_df = self.load_holidays()

        # Aggregate to monthly
        holidays_monthly = self.aggregate_by_month(holidays_df)

        # Merge with tourism data
        result_df = self.merge_with_tourism(tourism_df, holidays_monthly)

        self.logger.info("=" * 70)
        self.logger.info("HOLIDAY PROCESSING COMPLETED")
        self.logger.info("=" * 70)

        return result_df
