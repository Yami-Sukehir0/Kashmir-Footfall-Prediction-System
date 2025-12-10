"""
Safe Pipeline Re-run
Backs up existing data, runs pipeline, then merges best results
"""

import os
import shutil
import subprocess
import pandas as pd
from datetime import datetime


def backup_data():
    """Create timestamped backup of current data"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_dir = f"backup_{timestamp}"

    print(f"Creating backup: {backup_dir}")

    if os.path.exists("data"):
        shutil.copytree("data", os.path.join(backup_dir, "data"))
        print(f"✓ Backup created: {backup_dir}")
        return backup_dir
    else:
        print("✗ No data directory to backup")
        return None


def run_pipeline():
    """Run the pipeline"""
    print("\n" + "=" * 70)
    print("Running pipeline...")
    print("=" * 70 + "\n")

    result = subprocess.run(["python", "pipeline/run_pipeline.py"],
                            capture_output=False)

    return result.returncode == 0


def compare_results(backup_dir):
    """Compare old and new results, keep the better one"""

    old_file = os.path.join(backup_dir, "data", "model_ready",
                            "kashmir_tourism_simple_label.csv")
    new_file = "data/model_ready/kashmir_tourism_simple_label.csv"

    if not os.path.exists(old_file):
        print("\n✓ No previous data to compare - keeping new results")
        return "new"

    if not os.path.exists(new_file):
        print("\n✗ New pipeline failed - restoring backup")
        shutil.rmtree("data")
        shutil.copytree(os.path.join(backup_dir, "data"), "data")
        return "old"

    # Compare data quality
    old_df = pd.read_csv(old_file)
    new_df = pd.read_csv(new_file)

    print("\n" + "=" * 70)
    print("COMPARISON")
    print("=" * 70)
    print(f"\nOld data: {len(old_df)} rows")
    print(f"New data: {len(new_df)} rows")

    old_completeness = len(old_df) / 840 * 100
    new_completeness = len(new_df) / 840 * 100

    print(f"\nOld completeness: {old_completeness:.1f}%")
    print(f"New completeness: {new_completeness:.1f}%")

    if new_completeness >= old_completeness:
        print("\n✓ New data is BETTER or EQUAL - keeping new results")
        return "new"
    else:
        print("\n⚠ Old data is BETTER - restoring backup")

        # Restore old data
        shutil.rmtree("data")
        shutil.copytree(os.path.join(backup_dir, "data"), "data")

        print("✓ Backup restored")
        return "old"


def merge_best_data(backup_dir):
    """Advanced: Merge best months from both runs"""

    old_weather_dir = os.path.join(backup_dir, "data", "interim", "weather_data")
    new_weather_dir = "data/interim/weather_data"

    if not os.path.exists(old_weather_dir) or not os.path.exists(new_weather_dir):
        return

    print("\n" + "=" * 70)
    print("MERGING WEATHER DATA")
    print("=" * 70)

    # For each location, keep the file with more data
    locations = [f for f in os.listdir(new_weather_dir) if f.endswith('.csv')]

    for loc_file in locations:
        old_file = os.path.join(old_weather_dir, loc_file)
        new_file = os.path.join(new_weather_dir, loc_file)

        if not os.path.exists(old_file):
            print(f"  {loc_file}: NEW (no old data)")
            continue

        old_df = pd.read_csv(old_file)
        new_df = pd.read_csv(new_file)

        if len(new_df) >= len(old_df):
            print(f"  {loc_file}: KEEPING NEW ({len(new_df)} vs {len(old_df)} rows)")
        else:
            print(f"  {loc_file}: KEEPING OLD ({len(old_df)} vs {len(new_df)} rows)")
            shutil.copy(old_file, new_file)

    # Re-process with merged data
    print("\n✓ Re-processing with merged data...")
    subprocess.run(["python", "pipeline/run_pipeline.py", "--skip-weather"])


def main():
    print("=" * 70)
    print("SAFE PIPELINE RE-RUN")
    print("=" * 70)

    # Step 1: Backup
    backup_dir = backup_data()
    if not backup_dir:
        print("Cannot proceed without backup")
        return

    # Step 2: Run pipeline
    success = run_pipeline()

    if not success:
        print("\n✗ Pipeline failed - check logs")
        return

    # Step 3: Compare results
    result = compare_results(backup_dir)

    # Step 4: Optional merge (uncomment if you want this)
    # if result == "new":
    #     merge_best_data(backup_dir)

    print("\n" + "=" * 70)
    print("SAFE RE-RUN COMPLETE")
    print("=" * 70)
    print(f"\nBackup preserved at: {backup_dir}")
    print("You can delete backup folder once you're satisfied with results")


if __name__ == "__main__":
    main()
