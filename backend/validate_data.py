import pandas as pd
import numpy as np

def run_validation():
    try:
        df = pd.read_csv('../data/thermosentry_risk.csv')
    except FileNotFoundError:
        print("Data file not found. Run pipeline first.")
        return

    total = len(df)
    duplicates = df['event_id'].duplicated().sum()
    
    # Coordinate check
    invalid_coords = df[(df['latitude'] < -90) | (df['latitude'] > 90) | (df['longitude'] < -180) | (df['longitude'] > 180)].shape[0]
    missing_coords = df['latitude'].isna().sum() + df['longitude'].isna().sum()
    
    missing_time = df['observation_time'].isna().sum() if 'observation_time' in df.columns else total
    missing_frp = df['frp'].isna().sum() if 'frp' in df.columns else total
    missing_conf = df['confidence'].isna().sum() if 'confidence' in df.columns else total
    missing_ind = df['distance_to_industry_km'].isna().sum() if 'distance_to_industry_km' in df.columns else total
    
    invalid_frp = df[df['frp'] < 0].shape[0] if 'frp' in df.columns else 0

    print("==================================================")
    print("THERMOSENTRY DATA VALIDATION REPORT")
    print("==================================================")
    print(f"TOTAL EVENTS:                 {total}")
    print(f"DUPLICATES:                   {duplicates}")
    print(f"MISSING COORDINATES:          {missing_coords}")
    print(f"INVALID COORDINATES:          {invalid_coords}")
    print(f"MISSING TIMESTAMPS:           {missing_time}")
    print(f"MISSING FRP:                  {missing_frp}")
    print(f"INVALID FRP (<0):             {invalid_frp}")
    print(f"MISSING CONFIDENCE:           {missing_conf}")
    print(f"MISSING INDUSTRIAL CONTEXT:   {missing_ind}")
    
    # ML & Risk specific checks
    if 'is_anomalous' in df.columns:
        anomalies = df['is_anomalous'].sum()
        print(f"ANOMALIES FLAGGED:            {anomalies}")
    
    if 'risk_level' in df.columns:
        counts = df['risk_level'].value_counts().to_dict()
        print("\nRISK DISTRIBUTION:")
        for k, v in counts.items():
            print(f"- {k}: {v}")

    if 'persistent_activity' in df.columns:
        persist = df['persistent_activity'].sum()
        print(f"\nPERSISTENT EVENTS:            {persist}")

if __name__ == "__main__":
    run_validation()
