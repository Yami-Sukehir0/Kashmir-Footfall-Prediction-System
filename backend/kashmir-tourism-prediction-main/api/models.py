"""
Pydantic models for API request/response validation
"""

from pydantic import BaseModel, Field
from typing import Optional


class PredictionInput(BaseModel):
    """
    Input features for footfall prediction - EXACTLY 17 FEATURES
    These match what the model was trained on
    """
    # Weather features (1-9)
    temperature_2m_mean: float = Field(..., description="Mean temperature in Celsius")
    temperature_2m_max: float = Field(..., description="Max temperature in Celsius")
    temperature_2m_min: float = Field(..., description="Min temperature in Celsius")
    precipitation_sum: float = Field(..., description="Total precipitation in mm")
    snowfall_sum: float = Field(..., description="Total snowfall in cm")
    precipitation_hours: int = Field(..., description="Hours with precipitation")
    windgusts_10m_max: float = Field(..., description="Max wind gust speed in km/h")
    relative_humidity_2m_mean: float = Field(..., description="Mean relative humidity %")
    sunshine_duration: float = Field(..., description="Sunshine duration in minutes")

    # Interaction & Derived Features (10-12)
    temp_sunshine_interaction: float = Field(..., description="Temperature × Sunshine interaction")
    temperature_range: float = Field(..., description="Temperature max - min range")
    precipitation_temperature: float = Field(..., description="Precipitation × Temperature")

    # Holiday Features (13-17)
    holiday_count: int = Field(..., description="Number of holidays in period")
    long_weekend_count: int = Field(..., description="Number of long weekends")
    national_holiday_count: int = Field(..., description="National holidays count")
    festival_holiday_count: int = Field(..., description="Festival holidays count")
    days_to_next_holiday: int = Field(..., description="Days until next holiday")

    class Config:
        json_schema_extra = {
            "example": {
                "temperature_2m_mean": 5.2,
                "temperature_2m_max": 12.1,
                "temperature_2m_min": -2.3,
                "precipitation_sum": 45.5,
                "snowfall_sum": 2.1,
                "precipitation_hours": 8,
                "windgusts_10m_max": 35.4,
                "relative_humidity_2m_mean": 72.5,
                "sunshine_duration": 120,
                "temp_sunshine_interaction": 624.0,
                "temperature_range": 14.4,
                "precipitation_temperature": 236.6,
                "holiday_count": 1,
                "long_weekend_count": 0,
                "national_holiday_count": 1,
                "festival_holiday_count": 0,
                "days_to_next_holiday": 15
            }
        }


class PredictionResponse(BaseModel):
    """
    API response with prediction results
    """
    predicted_footfall: int = Field(..., description="Predicted visitor count")
    confidence: str = Field(..., description="Prediction confidence level")
    message: str = Field(..., description="Prediction summary")

    class Config:
        json_schema_extra = {
            "example": {
                "predicted_footfall": 42358,
                "confidence": "high",
                "message": "Predicted 42,358 visitors in Srinagar for 7/2025"
            }
        }


class HealthCheckResponse(BaseModel):
    """
    Health check response
    """
    status: str = Field(..., description="API status")
    model: str = Field(..., description="Active model")
    version: str = Field(..., description="API version")
