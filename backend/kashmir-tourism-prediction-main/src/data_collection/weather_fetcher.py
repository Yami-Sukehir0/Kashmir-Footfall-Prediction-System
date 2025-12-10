#!/usr/bin/env python3

"""
Weather Data Fetcher - Enhanced with Aggressive Retry Logic
Collects historical weather data from Open-Meteo API for Kashmir tourist locations
Handles API rate limiting with longer retry delays (10s, 30s, 60s) for maximum success
"""

import requests
import pandas as pd
import time
import os
import logging
from typing import Dict, List, Tuple
from datetime import datetime


class WeatherDataFetcher:
    """
    Fetches weather data from Open-Meteo Archive API for specified locations and date ranges.
    Implements aggressive rate limiting with long retry delays to ensure complete data collection.
    """

    def __init__(self, config: Dict):
        """
        Initialize the weather data fetcher with configuration

        Args:
            config: Dictionary containing weather API configuration
        """
        self.config = config
        self.api_url = config['weather']['api_url']
        self.locations = config['weather']['locations']
        self.parameters = config['weather']['parameters']
        self.date_ranges = config['weather']['date_ranges']
        self.request_delay = config['weather'].get('request_delay', 5.0)
        self.output_dir = config['paths']['weather_raw']

        # Retry configuration with custom delays
        self.max_retries = config['weather'].get('max_retries', 3)
        self.retry_delays = config['weather'].get('retry_delays', [10, 30, 60])  # Custom delays per attempt
        self.timeout = config['weather'].get('timeout', 30)

        # Set up logging
        self.logger = logging.getLogger(__name__)

        # Create output directory if it doesn't exist
        os.makedirs(self.output_dir, exist_ok=True)

    def fetch_weather_for_location(
            self,
            location_name: str,
            latitude: float,
            longitude: float,
            start_date: str,
            end_date: str
    ) -> pd.DataFrame:
        """
        Fetch weather data for a single location and date range with aggressive retry logic

        Args:
            location_name: Name of the location
            latitude: Latitude coordinate
            longitude: Longitude coordinate
            start_date: Start date in YYYY-MM-DD format
            end_date: End date in YYYY-MM-DD format

        Returns:
            DataFrame containing weather data
        """
        # Build API request parameters
        params = {
            'latitude': latitude,
            'longitude': longitude,
            'start_date': start_date,
            'end_date': end_date,
            'daily': ','.join(self.parameters),
            'timezone': 'Asia/Kolkata'
        }

        # Try multiple times with custom long delays
        for attempt in range(1, self.max_retries + 1):
            try:
                self.logger.info(
                    f"Fetching data for {location_name} ({start_date} to {end_date}) "
                    f"[Attempt {attempt}/{self.max_retries}]"
                )

                # Make API request
                response = requests.get(
                    self.api_url,
                    params=params,
                    timeout=self.timeout
                )

                # Check for rate limiting specifically
                if response.status_code == 429:
                    if attempt <= len(self.retry_delays):
                        wait_time = self.retry_delays[attempt - 1]
                    else:
                        wait_time = self.retry_delays[-1]  # Use last delay if exceeded

                    self.logger.warning(
                        f"Rate limited for {location_name}. "
                        f"Attempt {attempt}/{self.max_retries}. "
                        f"Waiting {wait_time}s before retry... (API needs time to reset)"
                    )
                    time.sleep(wait_time)
                    continue

                # Raise for other HTTP errors
                response.raise_for_status()

                # Parse JSON response
                data = response.json()

                # Convert to DataFrame
                if 'daily' in data:
                    df = pd.DataFrame(data['daily'])
                    df['location'] = location_name
                    self.logger.info(
                        f"[SUCCESS] Fetched {len(df)} days of data for {location_name} "
                        f"on attempt {attempt}"
                    )
                    return df
                else:
                    self.logger.error(f"No daily data found in API response for {location_name}")
                    return pd.DataFrame()

            except requests.exceptions.Timeout:
                self.logger.warning(
                    f"Timeout for {location_name}. "
                    f"Attempt {attempt}/{self.max_retries}"
                )
                if attempt < self.max_retries:
                    wait_time = self.retry_delays[attempt - 1] if attempt <= len(self.retry_delays) else \
                    self.retry_delays[-1]
                    self.logger.info(f"Waiting {wait_time}s before retry...")
                    time.sleep(wait_time)

            except requests.exceptions.HTTPError as e:
                if e.response.status_code == 429:
                    # Already handled above
                    continue
                else:
                    self.logger.error(
                        f"HTTP error for {location_name}: {e.response.status_code} - {e}"
                    )
                    return pd.DataFrame()

            except requests.exceptions.RequestException as e:
                self.logger.error(f"Request failed for {location_name}: {str(e)}")
                if attempt < self.max_retries:
                    wait_time = self.retry_delays[attempt - 1] if attempt <= len(self.retry_delays) else \
                    self.retry_delays[-1]
                    self.logger.info(f"Waiting {wait_time}s before retry...")
                    time.sleep(wait_time)

            except Exception as e:
                self.logger.error(f"Unexpected error for {location_name}: {str(e)}")
                return pd.DataFrame()

        # All retries exhausted
        self.logger.error(
            f"[FAILED] Unable to fetch data for {location_name} after {self.max_retries} attempts "
            f"with delays of {self.retry_delays}. API rate limit may be strict."
        )
        return pd.DataFrame()

    def fetch_all_locations(self) -> Dict[str, pd.DataFrame]:
        """
        Fetch weather data for all configured locations and date ranges

        Returns:
            Dictionary mapping location names to DataFrames
        """
        all_data = {}
        total_requests = len(self.locations) * len(self.date_ranges)
        request_count = 0
        failed_requests = []

        self.logger.info(f"Starting weather data collection for {len(self.locations)} locations")
        self.logger.info(f"Total API requests to make: {total_requests}")
        self.logger.info(f"Base delay between requests: {self.request_delay}s")
        self.logger.info(f"Retry strategy: {self.max_retries} attempts with delays {self.retry_delays}")
        self.logger.info(f"Estimated minimum time: ~{(total_requests * self.request_delay) / 60:.1f} minutes")
        self.logger.info(
            f"Estimated maximum time (with retries): ~{(total_requests * (self.request_delay + sum(self.retry_delays))) / 60:.1f} minutes")

        for location in self.locations:
            location_name = location['name']
            latitude = location['latitude']
            longitude = location['longitude']

            location_dfs = []
            location_success = True

            # Fetch data for each date range
            for date_range in self.date_ranges:
                start_date = date_range['start']
                end_date = date_range['end']

                df = self.fetch_weather_for_location(
                    location_name, latitude, longitude, start_date, end_date
                )

                if not df.empty:
                    location_dfs.append(df)
                else:
                    location_success = False
                    failed_requests.append(f"{location_name} ({start_date} to {end_date})")

                request_count += 1
                self.logger.info(f"Progress: {request_count}/{total_requests} requests completed")

                # Rate limiting - always wait between requests to avoid hitting rate limits
                if request_count < total_requests:
                    self.logger.debug(f"Waiting {self.request_delay}s before next request")
                    time.sleep(self.request_delay)

            # Combine all date ranges for this location
            if location_dfs:
                combined_df = pd.concat(location_dfs, ignore_index=True)
                all_data[location_name] = combined_df

                if location_success:
                    self.logger.info(
                        f"[COMPLETE] {location_name}: {len(combined_df)} total rows "
                        f"(all date ranges successful)"
                    )
                else:
                    self.logger.warning(
                        f"[PARTIAL] {location_name}: {len(combined_df)} total rows "
                        f"(some date ranges failed)"
                    )
            else:
                self.logger.error(f"[FAILED] No data collected for {location_name}")

        # Summary of failures
        if failed_requests:
            self.logger.warning(f"\n{len(failed_requests)} request(s) failed:")
            for req in failed_requests:
                self.logger.warning(f"  - {req}")
        else:
            self.logger.info("\n[PERFECT] All requests completed successfully!")

        return all_data

    def save_data(self, data: Dict[str, pd.DataFrame]) -> List[str]:
        """
        Save weather data to CSV files

        Args:
            data: Dictionary mapping location names to DataFrames

        Returns:
            List of saved file paths
        """
        saved_files = []

        self.logger.info(f"Saving weather data to {self.output_dir}")

        for location_name, df in data.items():
            # Create safe filename
            filename = f"{location_name.replace(', ', '_').replace(' ', '_')}_weather.csv"
            filepath = os.path.join(self.output_dir, filename)

            # Save to CSV
            df.to_csv(filepath, index=False)
            saved_files.append(filepath)
            self.logger.info(f"Saved {filename} ({len(df)} rows)")

        return saved_files

    def run(self) -> Tuple[Dict[str, pd.DataFrame], List[str]]:
        """
        Execute the complete weather data fetching pipeline

        Returns:
            Tuple of (data dictionary, list of saved file paths)
        """
        start_time = datetime.now()
        self.logger.info("=" * 70)
        self.logger.info("WEATHER DATA COLLECTION STARTED")
        self.logger.info("=" * 70)

        # Fetch data for all locations
        data = self.fetch_all_locations()

        # Save data to files
        saved_files = self.save_data(data)

        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()

        # Calculate completeness
        total_expected_locations = len(self.config['weather']['locations'])
        success_rate = (len(data) / total_expected_locations) * 100

        # Calculate row completeness
        expected_rows_per_location = 2557  # 730 + 1827 days
        total_rows = sum(len(df) for df in data.values())
        expected_total_rows = total_expected_locations * expected_rows_per_location
        row_completeness = (total_rows / expected_total_rows) * 100

        self.logger.info("=" * 70)
        self.logger.info(f"WEATHER DATA COLLECTION COMPLETED in {duration:.2f} seconds ({duration / 60:.2f} minutes)")
        self.logger.info(f"Locations processed: {len(data)}/{total_expected_locations}")
        self.logger.info(f"Files saved: {len(saved_files)}")
        self.logger.info(f"Location success rate: {success_rate:.1f}%")
        self.logger.info(f"Data completeness: {row_completeness:.1f}% ({total_rows}/{expected_total_rows} rows)")

        if success_rate == 100.0 and row_completeness == 100.0:
            self.logger.info("[PERFECT] Complete dataset collected!")
        elif row_completeness >= 95.0:
            self.logger.info("[EXCELLENT] Nearly complete dataset - suitable for production!")
        elif row_completeness >= 80.0:
            self.logger.info("[GOOD] Dataset is usable for model training")
        else:
            self.logger.warning("[PARTIAL] Dataset may need manual completion")

        self.logger.info("=" * 70)

        return data, saved_files
