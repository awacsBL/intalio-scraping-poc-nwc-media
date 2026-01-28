"""AI Service Configuration"""
import torch
from typing import Literal

# Device configuration
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# Model names
SUMMARIZATION_MODEL = "fatmaserry/AraT5v2-arabic-summarization"
SENTIMENT_MODEL = "tabularisai/multilingual-sentiment-analysis"

# Summarization parameters
SUMMARY_CONFIG = {
    "max_input_length": 1024,
    "max_output_length": 150,
    "num_beams": 4,
    "min_length": 20,
}

# Sentiment parameters
SENTIMENT_CONFIG = {
    "max_length": 512,
    "truncation": True,
    "padding": True,
}

# Business logic thresholds
LONG_COMMENT_THRESHOLD = 100  # Characters
SUMMARY_TIME_WINDOW_DAYS = 7  # Days to look back for time-based summary
