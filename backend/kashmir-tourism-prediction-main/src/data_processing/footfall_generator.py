#!/usr/bin/env python3

"""
Footfall Data Generator
Generates monthly tourist footfall estimates for 2017-2018 based on known data
and research-based growth patterns
"""

import pandas as pd
import numpy as np
import os
import logging
from typing import Dict, Tuple
from datetime import datetime


class FootfallGenerator:
    """
    Generates estimated tourist footfall data for historical years (2017-2018)
    based on known data (2020-2024) and tourism growth patterns.
    """

    def __init__(self, config: Dict):
        """
        Initialize the footfall generator with configuration

        Args:
            config: Dictionary containing footfall generation configuration
        """
        self.config = config
        self.raw_data_dir = config['paths']['raw_data']
        self.output_dir = config['paths']['footfall_generated']
        self.output_file = os.path.join(
            config['paths']['processed_data'],
            config['files']['footfall_generated']
        )

        # Configuration parameters
        self.generated_years = config['footfall']['generated_years']
        self.known_years = config['footfall']['known_years']
        self.excluded_years = config['footfall']['excluded_years']
        self.growth_rates = config['footfall']['growth_rates']
        self.peak_months = config['footfall']['peak_months']
        self.shoulder_months = config['footfall']['shoulder_months']
        self.low_months = config['footfall']['low_months']

        # File names
        self.sites_file = config['files']['tourist_sites_footfall']
        self.monthly_file = config['files']['monthly_tourist_data']

        # Set up logging
        self.logger = logging.getLogger(__name__)

        # Create output directories
        os.makedirs(self.output_dir, exist_ok=True)
        os.makedirs(config['paths']['processed_data'], exist_ok=True)

    def standardize_location_name(self, name: str) -> str:
        """
        Standardize location names to match weather data format

        Args:
            name: Original location name

        Returns:
            Standardized location name
        """
        # Convert to title case and handle special location
        name = name.strip()

        # Special case: Lolab Bungus, Keran Teetwal
        if "lolab" in name.lower() or "bungus" in name.lower():
            return "Lolab Bungus, Keran Teetwal"

        return name.title()

    def load_input_data(self) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """
        Load the input CSV files

        Returns:
            Tuple of (sites_df, monthly_df)
        """
        sites_path = os.path.join(self.raw_data_dir, self.sites_file)
        monthly_path = os.path.join(self.raw_data_dir, self.monthly_file)

        self.logger.info(f"Loading site data from: {sites_path}")
        sites_df = pd.read_csv(sites_path)

        self.logger.info(f"Loading monthly data from: {monthly_path}")
        monthly_df = pd.read_csv(monthly_path)

        # ⭐ NEW: Filter out the "Total" row (row 13)
        if 'Month' in monthly_df.columns:
            monthly_df = monthly_df[monthly_df['Month'].notna()].copy()  # Remove NaN months
            monthly_df = monthly_df[
                ~monthly_df['Month'].astype(str).str.strip().str.lower().isin(['total', 'nan'])].copy()
            monthly_df = monthly_df.reset_index(drop=True)
            self.logger.info(f"Filtered to {len(monthly_df)} valid months (removed Total row)")

        self.logger.info(f"Loaded {len(sites_df)} tourist sites")
        self.logger.info(f"Loaded {len(monthly_df)} months of overall data")

        return sites_df, monthly_df

    def calculate_monthly_distribution(self, monthly_df: pd.DataFrame, year: int) -> np.ndarray:
        """
        Calculate monthly distribution percentages for a given year

        Args:
            monthly_df: DataFrame with monthly Kashmir-wide data
            year: Year to calculate distribution for

        Returns:
            Array of 12 monthly percentage values
        """
        total_col = f"{year}_Total"

        if total_col not in monthly_df.columns:
            self.logger.warning(f"No data for year {year}, using average distribution")
            # Use average of available years
            available_years = [y for y in self.known_years if f"{y}_Total" in monthly_df.columns]
            if not available_years:
                # Fallback to simple seasonal pattern
                return self._get_default_distribution()

            avg_distribution = np.zeros(12)
            for y in available_years:
                year_total = monthly_df[f"{y}_Total"].sum()
                if year_total > 0:
                    avg_distribution += (monthly_df[f"{y}_Total"].values / year_total)
            avg_distribution /= len(available_years)
            return avg_distribution

        # Calculate percentage distribution for this year
        year_total = monthly_df[total_col].sum()

        if year_total == 0:
            return self._get_default_distribution()

        distribution = monthly_df[total_col].values / year_total
        return distribution

    def _get_default_distribution(self) -> np.ndarray:
        """
        Get default seasonal distribution pattern

        Returns:
            Array of 12 monthly percentage values
        """
        distribution = np.zeros(12)

        # Assign weights based on season
        for month in self.peak_months:
            distribution[month - 1] = 0.15  # 15% each for peak months

        for month in self.shoulder_months:
            distribution[month - 1] = 0.08  # 8% each for shoulder months

        for month in self.low_months:
            distribution[month - 1] = 0.03  # 3% each for low months

        # Normalize to sum to 1
        distribution = distribution / distribution.sum()

        return distribution

    def generate_historical_footfall(
            self,
            sites_df: pd.DataFrame,
            monthly_df: pd.DataFrame
    ) -> pd.DataFrame:
        """
        Generate footfall estimates for historical years

        Args:
            sites_df: DataFrame with site-wise yearly data
            monthly_df: DataFrame with monthly Kashmir-wide data

        Returns:
            DataFrame with generated monthly footfall for all sites
        """
        all_data = []

        # Get list of sites
        sites = sites_df['Name of the Tourist site'].values

        self.logger.info(f"Generating footfall for {len(sites)} sites")

        for site in sites:
            site_standardized = self.standardize_location_name(site)
            site_row = sites_df[sites_df['Name of the Tourist site'] == site].iloc[0]

            # Get known yearly totals for this site
            known_yearly = {}
            for year in self.known_years:
                col_name = f"Tourist Footfall {year} (in thousands)"
                if col_name in site_row.index:
                    known_yearly[year] = site_row[col_name]

            # Calculate average annual growth rate from known data
            if len(known_yearly) >= 2:
                years = sorted(known_yearly.keys())
                growth_rates = []
                for i in range(len(years) - 1):
                    if known_yearly[years[i]] > 0:
                        rate = (known_yearly[years[i + 1]] - known_yearly[years[i]]) / known_yearly[years[i]]
                        growth_rates.append(rate)

                if growth_rates:
                    avg_growth = np.mean(growth_rates)
                else:
                    avg_growth = (self.growth_rates['min'] + self.growth_rates['max']) / 2
            else:
                avg_growth = (self.growth_rates['min'] + self.growth_rates['max']) / 2

            # Clamp growth rate to reasonable range
            avg_growth = np.clip(avg_growth, self.growth_rates['min'], self.growth_rates['max'])

            self.logger.debug(f"{site_standardized}: Using growth rate of {avg_growth:.2%}")

            # Generate data for historical years
            for gen_year in self.generated_years:
                # Work backwards from 2020 (first known year)
                base_year = 2020
                base_value = known_yearly.get(base_year, 0)

                if base_value == 0:
                    self.logger.warning(f"{site_standardized}: No base data for {base_year}, skipping")
                    continue

                # Calculate years difference
                years_back = base_year - gen_year

                # Estimate yearly total (working backwards with inverse growth)
                estimated_yearly = base_value / ((1 + avg_growth) ** years_back)

                # Get monthly distribution for this year
                monthly_dist = self.calculate_monthly_distribution(monthly_df, base_year)

                # Generate monthly values
                for month in range(1, 13):
                    monthly_value = estimated_yearly * monthly_dist[month - 1]

                    all_data.append({
                        'Tourist Site': site_standardized,
                        'Time': f"{gen_year}-{month:02d}",
                        'Footfall': int(round(monthly_value))
                    })

            # Add known data for all years
            for known_year in self.known_years:
                if known_year in self.excluded_years:
                    continue

                yearly_total = known_yearly.get(known_year, 0)

                if yearly_total == 0:
                    self.logger.warning(f"{site_standardized}: No data for {known_year}, skipping")
                    continue

                # Get monthly distribution
                monthly_dist = self.calculate_monthly_distribution(monthly_df, known_year)

                # Generate monthly values
                for month in range(1, 13):
                    monthly_value = yearly_total * monthly_dist[month - 1]

                    all_data.append({
                        'Tourist Site': site_standardized,
                        'Time': f"{known_year}-{month:02d}",
                        'Footfall': int(round(monthly_value))
                    })

        # Create DataFrame
        result_df = pd.DataFrame(all_data)

        # Sort by site and time
        result_df = result_df.sort_values(['Tourist Site', 'Time']).reset_index(drop=True)

        self.logger.info(f"Generated {len(result_df)} monthly footfall records")

        return result_df

    def normalize_anomalous_years(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Normalize footfall data for anomalous years (2017, 2018, 2020)
        to match the distribution of baseline years (2021-2024) with
        realistic minimum footfall constraints.

        This addresses the structural break in time series caused by:
        - Political unrest (2017-2018)
        - COVID-19 pandemic (2020)

        Args:
            df: DataFrame with columns [Tourist Site, Time, Footfall]

        Returns:
            DataFrame with normalized footfall values
        """
        # Check if normalization is enabled
        if 'normalization' not in self.config['footfall']:
            self.logger.info("Normalization config not found - skipping")
            return df

        if not self.config['footfall']['normalization']['enabled']:
            self.logger.info("Normalization disabled - skipping")
            return df

        df = df.copy()

        # Extract configuration
        baseline_years = self.config['footfall']['normalization']['baseline_years']
        anomalous_years = self.config['footfall']['normalization']['anomalous_years']
        min_footfall = self.config['footfall']['normalization']['min_footfall']

        # Extract year and month from Time column
        df['Year'] = df['Time'].str[:4].astype(int)
        df['Month'] = df['Time'].str[5:7].astype(int)

        # Get unique tourist sites
        sites = df['Tourist Site'].unique()

        self.logger.info("=" * 70)
        self.logger.info("NORMALIZING ANOMALOUS YEARS WITH FLOOR CONSTRAINTS")
        self.logger.info(f"Baseline years: {baseline_years}")
        self.logger.info(f"Anomalous years to scale: {anomalous_years}")
        self.logger.info("=" * 70)

        # Normalize per location
        for site in sites:
            site_data = df[df['Tourist Site'] == site].copy()

            # Calculate baseline statistics (2021-2024)
            baseline_data = site_data[site_data['Year'].isin(baseline_years)]

            if len(baseline_data) == 0:
                self.logger.warning(f"No baseline data for {site}, skipping normalization")
                continue

            # Calculate per-month minimums from baseline (realistic floor)
            baseline_monthly_min = baseline_data.groupby('Month')['Footfall'].min()
            baseline_monthly_mean = baseline_data.groupby('Month')['Footfall'].mean()

            # Set floor at 50% of baseline monthly minimum (accounts for some decline)
            monthly_floor = baseline_monthly_min * 0.50

            baseline_mean = baseline_data['Footfall'].mean()
            baseline_std = baseline_data['Footfall'].std()

            if baseline_std == 0:
                self.logger.warning(f"Zero std for {site}, skipping normalization")
                continue

            # Normalize each anomalous year
            for year in anomalous_years:
                year_data = site_data[site_data['Year'] == year]

                if len(year_data) == 0:
                    continue

                # Calculate current statistics
                current_mean = year_data['Footfall'].mean()
                current_std = year_data['Footfall'].std()

                if current_std == 0:
                    current_std = 1  # Avoid division by zero

                # For each month in this year
                for month in range(1, 13):
                    mask = (df['Tourist Site'] == site) & (df['Year'] == year) & (df['Month'] == month)

                    if not mask.any():
                        continue

                    original_value = df.loc[mask, 'Footfall'].values[0]

                    # Apply z-score normalization
                    z_score = (original_value - current_mean) / current_std
                    normalized_value = z_score * baseline_std + baseline_mean

                    # Apply month-specific floor
                    if month in monthly_floor.index:
                        floor_value = monthly_floor[month]
                        normalized_value = max(normalized_value, floor_value)

                    # Global minimum check
                    normalized_value = max(normalized_value, min_footfall)

                    # Round to integer
                    normalized_value = int(round(normalized_value))

                    # Update DataFrame
                    df.loc[mask, 'Footfall'] = normalized_value

                # Log the transformation
                year_mask = (df['Tourist Site'] == site) & (df['Year'] == year)
                original_total = site_data[site_data['Year'] == year]['Footfall'].sum()
                normalized_total = df.loc[year_mask, 'Footfall'].sum()
                scale_factor = normalized_total / original_total if original_total > 0 else 1

                # Check how many values hit the floor
                normalized_values = df.loc[year_mask, 'Footfall'].values
                floor_hit_count = sum(1 for v in normalized_values if
                                      v == min_footfall or any(v == monthly_floor.get(m, 0) for m in range(1, 13)))

                self.logger.info(
                    f"{site} - {year}: Scaled {original_total:,.0f} -> {normalized_total:,.0f} "
                    f"(×{scale_factor:.2f}, {floor_hit_count} months floor-adjusted)"
                )

        # Drop temporary columns
        df = df.drop(columns=['Year', 'Month'])

        self.logger.info("=" * 70)
        self.logger.info("NORMALIZATION COMPLETED WITH REALISTIC MINIMUMS")
        self.logger.info("=" * 70)

        return df

    def run(self) -> pd.DataFrame:
        """
        Execute the complete footfall generation pipeline

        Returns:
            DataFrame with generated footfall data
        """
        start_time = datetime.now()
        self.logger.info("=" * 70)
        self.logger.info("FOOTFALL DATA GENERATION STARTED")
        self.logger.info("=" * 70)

        # Load input data
        sites_df, monthly_df = self.load_input_data()

        # Generate historical footfall
        footfall_df = self.generate_historical_footfall(sites_df, monthly_df)

        # Normalize anomalous years (NEW!)
        footfall_df = self.normalize_anomalous_years(footfall_df)

        # Save to file
        footfall_df.to_csv(self.output_file, index=False)
        self.logger.info(f"Saved footfall data: {self.output_file}")

        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()

        self.logger.info("=" * 70)
        self.logger.info(f"FOOTFALL DATA GENERATION COMPLETED in {duration:.2f} seconds")
        self.logger.info(f"Output file: {self.output_file}")
        self.logger.info("=" * 70)

        return footfall_df
