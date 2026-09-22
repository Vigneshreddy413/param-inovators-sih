import pytest
import pandas as pd
import requests

BASE_URL = "http://127.0.0.1:8000"

def test_api_health():
    response = requests.get(f"{BASE_URL}/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_statistics_endpoint():
    response = requests.get(f"{BASE_URL}/statistics")
    assert response.status_code == 200
    data = response.json()
    assert "total_active_events" in data
    assert "anomalous_events" in data
    assert "high_priority_events" in data
    
def test_events_endpoint():
    response = requests.get(f"{BASE_URL}/events?limit=5")
    assert response.status_code == 200
    events = response.json()
    assert isinstance(events, list)
    if len(events) > 0:
        event = events[0]
        assert "event_id" in event
        assert "latitude" in event
        assert "longitude" in event
        # Verify NaN is handled (None in JSON)
        if "frp" in event:
            assert event["frp"] is None or isinstance(event["frp"], (int, float))

def test_geojson_endpoint():
    response = requests.get(f"{BASE_URL}/events/geojson")
    assert response.status_code == 200
    geojson = response.json()
    assert geojson["type"] == "FeatureCollection"
    assert isinstance(geojson["features"], list)
    if len(geojson["features"]) > 0:
        feature = geojson["features"][0]
        assert feature["type"] == "Feature"
        assert "geometry" in feature
        assert feature["geometry"]["type"] == "Point"
        assert len(feature["geometry"]["coordinates"]) == 2

def test_risk_factors_schema():
    # We load the final CSV and ensure no impossible values
    try:
        df = pd.read_csv('../data/thermosentry_risk.csv')
        assert len(df) > 0
        assert df['risk_score'].max() <= 100
        assert df['risk_score'].min() >= 0
    except FileNotFoundError:
        pass # Skip if running outside full environment
