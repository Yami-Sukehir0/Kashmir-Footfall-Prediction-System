#!/usr/bin/env python3

"""
Data Enhancer
Adds advanced features: lag features, interactions, log transformation
"""

import pandas as pd
import numpy as np
import logging
from typing import Dict, Tuple


class DataEnhancer:
    """
    Enhances dataset with advanced features
    """

    def __init__(self, config: Dict):
        """
        Initialize enhancer

        Args:
            config: Configuration dictionary
        """
        self.config = config
        self.enhanced_config = config['enhanced_features']
        self.logger = logging.getLogger(__name__)

    def create_timeseries_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Create lag and time-series features per location

        Args:
            df: Input dataframe

        Returns:
            Dataframe with time-series features
        """
        if not self.enhanced_config['timeseries_features']['enabled']:
            return df

        df = df.copy()
        target = 'Footfall'

        self.logger.info("Creating time-series features...")

        # Find the location column (could be 'location_encoded' or similar)
        location_col = None
        for col in ['location_encoded', 'location', 'Location', 'site']:
            if col in df.columns:
                location_col = col
                break

        if location_col is None:
            self.logger.warning("No location column found, skipping per-location time-series features")
            return df

        # Check if year and month exist
        if 'year' not in df.columns or 'month' not in df.columns:
            self.logger.warning("No year/month columns found, skipping time-series features")
            return df

        # Sort by location, year, month
        df = df.sort_values([location_col, 'year', 'month']).reset_index(drop=True)

        # Lag features (per location)
        if self.enhanced_config['timeseries_features']['create_lags']:
            df['footfall_lag_1'] = df.groupby(location_col)[target].shift(1)
            df['footfall_lag_1'] = df.groupby(location_col)['footfall_lag_1'].bfill()

            self.logger.info("Created lag features")

        # Month-over-month growth
        if self.enhanced_config['timeseries_features']['create_mom']:
            df['footfall_mom'] = df.groupby(location_col)[target].pct_change()
            df['footfall_mom'] = df.groupby(location_col)['footfall_mom'].bfill()
            df['footfall_mom'] = df['footfall_mom'].fillna(0)

            self.logger.info("Created MoM growth features")

        # Rolling standard deviation
        if self.enhanced_config['timeseries_features']['create_rolling_std']:
            df['footfall_rolling_std_3'] = (
                df.groupby(location_col)[target]
                .rolling(window=3, min_periods=1)
                .std()
                .reset_index(drop=True)
            )

            df['footfall_rolling_std_6'] = (
                df.groupby(location_col)[target]
                .rolling(window=6, min_periods=1)
                .std()
                .reset_index(drop=True)
            )

            df['footfall_rolling_std_3'] = df['footfall_rolling_std_3'].fillna(0)
            df['footfall_rolling_std_6'] = df['footfall_rolling_std_6'].fillna(0)

            self.logger.info("Created rolling std features")

        return df

    def create_interaction_features(
            self,
            df: pd.DataFrame,
            include_interactions: bool = True
    ) -> pd.DataFrame:
        """
        Create interaction features (conditionally)

        Args:
            df: Input dataframe
            include_interactions: Whether to include interactions

        Returns:
            Dataframe with/without interaction features
        """
        df = df.copy()

        if not include_interactions:
            self.logger.info("Interaction features disabled (Option C)")
            # Remove if exists
            if 'precipitation_temperature' in df.columns:
                df = df.drop('precipitation_temperature', axis=1)
            return df

        if not self.enhanced_config['interaction_features']['enabled']:
            return df

        self.logger.info("Creating interaction features...")

        # Precipitation × Temperature interaction
        if self.enhanced_config['interaction_features']['precipitation_temperature']:
            if 'precipitation_sum' in df.columns and 'temperature_2m_mean' in df.columns:
                df['precipitation_temperature'] = (
                        df['precipitation_sum'] * df['temperature_2m_mean']
                )
                self.logger.info("Created precipitation × temperature interaction")

        return df

    def apply_footfall_floor(self, df: pd.DataFrame, min_threshold: int = 1000) -> pd.DataFrame:
        """
        Apply minimum footfall threshold to RAW (non-transformed) footfall values.
        This catches data entry errors, generated low values, and anomalous months.

        CRITICAL: This must be called BEFORE log transformation!

        Args:
            df: Input dataframe with RAW footfall values
            min_threshold: Minimum footfall per month per location (default: 1000 visitors/month)

        Returns:
            DataFrame with floor applied to RAW footfall values
        """
        df = df.copy()
        target = 'Footfall'

        if target not in df.columns:
            self.logger.warning(f"Column '{target}' not found. Skipping floor application.")
            return df

        # Count how many values are below threshold
        below_threshold_mask = df[target] < min_threshold
        below_count = below_threshold_mask.sum()

        if below_count > 0:
            self.logger.warning(
                f"Found {below_count} footfall values < {min_threshold:,} "
                f"({below_count / len(df) * 100:.1f}% of data)"
            )
            self.logger.warning("These may be data errors or anomalous months. Applying floor.")

            # Show sample of affected rows (up to 10)
            affected = df[below_threshold_mask][['Footfall', 'year', 'month']]
            if 'location_encoded' in df.columns:
                affected = df[below_threshold_mask][['Footfall', 'location_encoded', 'year', 'month']]

            self.logger.info("Sample of affected rows:")
            for idx, row in affected.head(10).iterrows():
                if 'location_encoded' in row:
                    self.logger.info(
                        f"  Row {idx}: Location {int(row['location_encoded'])}, "
                        f"{int(row['year'])}-{int(row['month']):02d}: "
                        f"Footfall={int(row['Footfall']):,} -> {min_threshold:,}"
                    )
                else:
                    self.logger.info(
                        f"  Row {idx}: {int(row['year'])}-{int(row['month']):02d}: "
                        f"Footfall={int(row['Footfall']):,} -> {min_threshold:,}"
                    )

            # Apply floor to RAW values (BEFORE log transform)
            original_min = df[target].min()
            df.loc[below_threshold_mask, target] = min_threshold
            new_min = df[target].min()

            self.logger.info(f"Applied footfall floor: {min_threshold:,} visitors/month")
            self.logger.info(
                f"Footfall range: {original_min:,.0f} -> {new_min:,.0f} (min), {df[target].max():,.0f} (max)")
        else:
            self.logger.info(f"✓ All footfall values >= {min_threshold:,}. No floor needed.")

        return df

    def apply_footfall_cap(self, df: pd.DataFrame, config: dict) -> pd.DataFrame:
        """
        Cap extreme outliers in footfall data using percentile-based method.
        This prevents extreme values from dominating model training while
        preserving the natural data distribution.

        CRITICAL: Must be called BEFORE log transformation!

        Args:
            df: Input dataframe with RAW footfall values
            config: Outlier capping configuration from config.yaml

        Returns:
            DataFrame with outliers capped at specified percentile
        """
        df = df.copy()
        target = 'Footfall'

        # Validate Footfall column exists
        if target not in df.columns:
            self.logger.warning(f"Column '{target}' not found. Skipping outlier capping.")
            return df

        # Check if capping is enabled
        if not config.get('enabled', False):
            self.logger.info("Outlier capping disabled in configuration")
            return df

        # Get configuration
        method = config.get('method', 'percentile')
        percentile = config.get('percentile', 99)

        # Validate percentile value
        if not (50 <= percentile <= 100):
            self.logger.error(f"Invalid percentile value: {percentile}. Must be between 50-100. Using 99.")
            percentile = 99

        self.logger.info(f"Applying outlier cap using method: {method}, percentile: {percentile}")

        # Calculate percentile threshold
        cap_value = df[target].quantile(percentile / 100.0)

        # Count values above threshold
        above_cap_mask = df[target] > cap_value
        above_count = above_cap_mask.sum()

        if above_count > 0:
            # Log warning about outliers found
            percentage = (above_count / len(df)) * 100
            self.logger.warning(
                f"Found {above_count} footfall values above {percentile}th percentile "
                f"({percentage:.2f}% of {len(df)} total rows)"
            )
            self.logger.warning(f"Capping threshold: {cap_value:,.0f} visitors/month")

            # Show statistics before capping
            original_min = df[target].min()
            original_max = df[target].max()
            original_mean = df[target].mean()
            original_std = df[target].std()

            self.logger.info(f"Original statistics:")
            self.logger.info(f"  Min: {original_min:,.0f}")
            self.logger.info(f"  Max: {original_max:,.0f}")
            self.logger.info(f"  Mean: {original_mean:,.0f}")
            self.logger.info(f"  Std: {original_std:,.0f}")

            # Show sample of affected rows (up to 15)
            affected = df[above_cap_mask].copy()
            sample_cols = [target, 'year', 'month']
            if 'location_encoded' in df.columns:
                sample_cols.insert(1, 'location_encoded')

            self.logger.info(f"Sample of affected rows (showing up to 15):")
            display_count = min(15, len(affected))
            for i, (idx, row) in enumerate(affected[sample_cols].iterrows(), 1):
                if 'location_encoded' in row:
                    self.logger.info(
                        f"  [{i:2d}] Row {idx:3d}: Location {int(row['location_encoded']):2d}, "
                        f"{int(row['year'])}-{int(row['month']):02d}: "
                        f"Footfall {int(row[target]):>10,} → {int(cap_value):>10,} "
                        f"(reduction: {int(row[target] - cap_value):>10,})"
                    )
                else:
                    self.logger.info(
                        f"  [{i:2d}] Row {idx:3d}: {int(row['year'])}-{int(row['month']):02d}: "
                        f"Footfall {int(row[target]):>10,} → {int(cap_value):>10,}"
                    )

                if i >= display_count:
                    if len(affected) > display_count:
                        self.logger.info(f"  ... and {len(affected) - display_count} more")
                    break

            # Apply cap
            df.loc[above_cap_mask, target] = cap_value

            # Show statistics after capping
            new_min = df[target].min()
            new_max = df[target].max()
            new_mean = df[target].mean()
            new_std = df[target].std()

            self.logger.info(f"After capping statistics:")
            self.logger.info(f"  Min: {new_min:,.0f} (unchanged)")
            self.logger.info(f"  Max: {new_max:,.0f} (was {original_max:,.0f})")
            self.logger.info(f"  Mean: {new_mean:,.0f} (was {original_mean:,.0f})")
            self.logger.info(f"  Std: {new_std:,.0f} (was {original_std:,.0f})")

            # Calculate impact
            reduction_percentage = ((original_max - new_max) / original_max) * 100
            self.logger.info(f"Impact:")
            self.logger.info(f"  Maximum reduced by {reduction_percentage:.1f}%")
            self.logger.info(f"  {above_count} extreme outliers capped")
            self.logger.info(
                f"  {len(df) - above_count} values ({((len(df) - above_count) / len(df)) * 100:.1f}%) unchanged")

        else:
            self.logger.info(f"✓ All footfall values <= {percentile}th percentile ({cap_value:,.0f})")
            self.logger.info(f"  No outlier capping needed")

        return df

    def apply_log_transformation(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Apply log transformation to target variable - DISABLED

        IMPORTANT: This method is DISABLED because we now apply floor/cap
        logic BEFORE log transformation. The transformation happens in
        the feature engineering step to maintain correct order:
        1. Floor (in enhance)
        2. Cap (in enhance)
        3. Save RAW values
        4. Log transform later in feature engineering

        Args:
            df: Input dataframe

        Returns:
            Dataframe WITHOUT log transformation (unchanged)
        """
        # DISABLED - No longer transform here!
        self.logger.info("⚠️  Log transformation DISABLED in data_enhancer.py")
        self.logger.info("   Reason: Transformation moved to feature engineering")
        self.logger.info("   to apply AFTER floor/cap logic on RAW values")

        return df  # Return unchanged!

    def enhance(self, df: pd.DataFrame, include_interactions: bool = True) -> pd.DataFrame:
        """
        Complete enhancement pipeline with all features.

        Processing Order (CRITICAL - DO NOT CHANGE):
        1. Rolling features (time-series smoothing)
        2. Time-series features (lags, if enabled)
        3. Interaction features (weather × sunshine, etc.)
        4. Additional features (temp_range, days_to_holiday, etc.)
        5. FOOTFALL FLOOR (catch low/erroneous values on RAW data)
        6. FOOTFALL CAP (catch extreme outliers on RAW data) ← NEW!
        7. Reorder columns (organization)
        8. Log transformation (MUST be last - normalizes scale)

        Args:
            df: Input dataframe with all base features
            include_interactions: Whether to create interaction features

        Returns:
            Enhanced dataframe ready for feature engineering
        """
        df = df.copy()

        # Header
        self.logger.info("=" * 80)
        self.logger.info("DATA ENHANCEMENT PIPELINE")
        self.logger.info("=" * 80)
        self.logger.info(f"Input shape: {df.shape}")
        self.logger.info(f"Input columns: {list(df.columns)}")
        self.logger.info("=" * 80)

        # Step 1: Rolling features
        self.logger.info("Step 1/8: Creating rolling features...")
        df = self._create_rolling_features(df)
        self.logger.info(f"  Shape after rolling features: {df.shape}")

        # Step 2: Time-series features
        self.logger.info("Step 2/8: Creating time-series features...")
        df = self.create_timeseries_features(df)
        self.logger.info(f"  Shape after time-series features: {df.shape}")

        # Step 3: Interaction features
        self.logger.info("Step 3/8: Creating interaction features...")
        df = self.create_interaction_features(df, include_interactions)
        self.logger.info(f"  Shape after interaction features: {df.shape}")

        # Step 4: Additional features
        self.logger.info("Step 4/8: Creating additional features...")
        df = self._create_additional_features(df)
        self.logger.info(f"  Shape after additional features: {df.shape}")

        # Step 5: Apply footfall floor (minimum threshold)
        self.logger.info("=" * 80)
        self.logger.info("Step 5/8: Applying footfall FLOOR (minimum threshold)")
        self.logger.info("  This catches low/erroneous values in RAW footfall data")
        self.logger.info("  Must be applied BEFORE log transformation")
        self.logger.info("=" * 80)
        df = self.apply_footfall_floor(df, min_threshold=1000)
        self.logger.info(f"  Shape after floor: {df.shape}")

        # Step 6: Apply footfall cap (outlier detection) - NEW!
        self.logger.info("=" * 80)
        self.logger.info("Step 6/8: Applying footfall CAP (outlier detection)")
        self.logger.info("  This catches extreme outliers in RAW footfall data")
        self.logger.info("  Must be applied BEFORE log transformation")
        self.logger.info("=" * 80)
        outlier_config = self.config.get('footfall', {}).get('outlier_capping', {})
        df = self.apply_footfall_cap(df, outlier_config)
        self.logger.info(f"  Shape after cap: {df.shape}")

        # Step 7: Reorder columns
        self.logger.info("Step 7/8: Reordering columns...")
        df = self.reorder_columns(df)
        self.logger.info(f"  Shape after reordering: {df.shape}")

        # Step 8: Log transformation (MUST BE LAST!)
        self.logger.info("=" * 80)
        self.logger.info("Step 8/8: Applying log transformation")
        self.logger.info("  This MUST be the last step")
        self.logger.info("  Normalizes footfall scale for model training")
        self.logger.info("=" * 80)
        df = self.apply_log_transformation(df)
        self.logger.info(f"  Shape after log transformation: {df.shape}")

        # Footer
        self.logger.info("=" * 80)
        self.logger.info("ENHANCEMENT PIPELINE COMPLETE")
        self.logger.info(f"Final shape: {df.shape}")
        self.logger.info(f"Final columns ({len(df.columns)}): {list(df.columns)}")
        self.logger.info("=" * 80)

        return df

    def _create_rolling_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Create rolling average feature per location

        Args:
            df: Input dataframe

        Returns:
            Dataframe with rolling features
        """
        self.logger.info("Creating rolling features...")

        df = df.copy()
        target = 'Footfall'

        # Find location column
        location_col = None
        for col in ['location_encoded', 'location', 'Location', 'site']:
            if col in df.columns:
                location_col = col
                break

        if location_col and 'year' in df.columns and 'month' in df.columns:
            df = df.sort_values([location_col, 'year', 'month']).reset_index(drop=True)

            # Rolling average per location
            df['footfall_rolling_avg'] = (
                df.groupby(location_col)[target]
                .rolling(window=3, min_periods=1)
                .mean()
                .reset_index(drop=True)
            )

            self.logger.info("Created footfall_rolling_avg")

        return df

    def _create_additional_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Create additional engineered features:
        - temperature_range
        - temp_sunshine_interaction
        - days_to_next_holiday (proper calculation)

        Args:
            df: Input dataframe

        Returns:
            Dataframe with additional features
        """
        self.logger.info("Creating additional engineered features...")
        df = df.copy()

        # 1. Temperature range
        if 'temperature_2m_max' in df.columns and 'temperature_2m_min' in df.columns:
            df['temperature_range'] = df['temperature_2m_max'] - df['temperature_2m_min']
            self.logger.info("Created temperature_range")

        # 2. Temperature × Sunshine interaction
        if 'temperature_2m_mean' in df.columns and 'sunshine_duration' in df.columns:
            df['temp_sunshine_interaction'] = df['temperature_2m_mean'] * df['sunshine_duration']
            self.logger.info("Created temp_sunshine_interaction")

        # 3. Days to next holiday (IMPROVED CALCULATION)
        if 'holiday_count' in df.columns and 'year' in df.columns and 'month' in df.columns:
            df['days_to_next_holiday'] = self._calculate_days_to_next_holiday(df)
            self.logger.info("Created days_to_next_holiday with proper calculation")
        elif 'holiday_count' in df.columns:
            # Fallback to simple logic if year/month not available
            self.logger.warning("Year/month not found - using simplified days_to_next_holiday")
            df['days_to_next_holiday'] = df['holiday_count'].apply(
                lambda x: 0 if x > 0 else 15
            )

        return df

    def _calculate_days_to_next_holiday(self, df: pd.DataFrame) -> pd.Series:
        """
        Calculate actual days to next holiday for each month.

        Logic:
        - If current month has holidays: assume mid-month holiday → 0-15 days
        - If no holiday this month: calculate to next month with holiday
        - Maximum cap at 90 days (3 months)

        Args:
            df: Input dataframe with year, month, holiday_count

        Returns:
            Series with days to next holiday
        """
        import pandas as pd
        from datetime import datetime, timedelta

        days_to_holiday = []

        # Sort by year and month to process chronologically
        df_sorted = df.sort_values(['year', 'month']).reset_index(drop=True)

        for idx, row in df_sorted.iterrows():
            current_year = row['year']
            current_month = row['month']
            holiday_count = row['holiday_count']

            # If current month has holidays
            if holiday_count > 0:
                # Assume holidays are distributed through the month
                # Give a value between 0-15 days (average mid-month)
                if holiday_count == 1:
                    days = 7  # Single holiday, likely mid-month
                elif holiday_count == 2:
                    days = 5  # Multiple holidays, closer
                else:
                    days = 3  # Many holidays, very close
                days_to_holiday.append(days)
            else:
                # Find next month with holidays
                days_found = False
                days_count = 15  # Start from end of current month

                for months_ahead in range(1, 13):  # Check up to 12 months ahead
                    # Calculate next month
                    next_month = current_month + months_ahead
                    next_year = current_year

                    # Handle year rollover
                    while next_month > 12:
                        next_month -= 12
                        next_year += 1

                    # Find if next month has holidays in the dataset
                    next_month_data = df_sorted[
                        (df_sorted['year'] == next_year) &
                        (df_sorted['month'] == next_month)
                        ]

                    if not next_month_data.empty:
                        next_holiday_count = next_month_data['holiday_count'].iloc[0]
                        if next_holiday_count > 0:
                            # Calculate approximate days
                            # Assume ~30 days per month
                            days_count = (months_ahead * 30) - 15  # Mid-month of next holiday month
                            days_found = True
                            break

                # Cap at 90 days (3 months)
                if not days_found or days_count > 90:
                    days_count = 90

                days_to_holiday.append(int(days_count))

        # Return in original order
        result = pd.Series(days_to_holiday, index=df_sorted.index)
        return result.reindex(df.index)

    def reorder_columns(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Reorder columns logically (matches 27-column version)

        Args:
            df: Input dataframe

        Returns:
            Dataframe with reordered columns
        """
        # Define preferred column order
        column_order = [
            # Target
            'Footfall',

            # Identifiers
            'location_encoded', 'year', 'month', 'season',

            # Rolling features
            'footfall_rolling_avg',

            # Weather core
            'temperature_2m_mean', 'temperature_2m_max', 'temperature_2m_min',
            'precipitation_sum', 'snowfall_sum',

            # Weather secondary
            'precipitation_hours', 'windgusts_10m_max', 'relative_humidity_2m_mean',
            'sunshine_duration',

            # Interactions
            'temp_sunshine_interaction', 'temperature_range',
            'precipitation_temperature',

            # Holiday features
            'holiday_count', 'long_weekend_count',
            'national_holiday_count', 'festival_holiday_count',
            'days_to_next_holiday',

            # Time-series
            'footfall_lag_1', 'footfall_mom',
            'footfall_rolling_std_3', 'footfall_rolling_std_6'
        ]

        # Keep only existing columns in the specified order
        existing_cols = [col for col in column_order if col in df.columns]

        # Add any remaining columns not in the order
        remaining_cols = [col for col in df.columns if col not in existing_cols]

        final_order = existing_cols + remaining_cols

        return df[final_order]

