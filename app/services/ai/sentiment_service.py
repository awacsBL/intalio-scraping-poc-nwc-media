"""
Multilingual Sentiment Analysis Service
Uses tabularisai/multilingual-sentiment-analysis

Model outputs 5 classes: Very Negative, Negative, Neutral, Positive, Very Positive
We map these to 3 simplified labels: negative, neutral, positive
"""
from transformers import pipeline
import torch
from typing import Literal
import logging
from app.config import DEVICE, SENTIMENT_MODEL, SENTIMENT_CONFIG

logger = logging.getLogger(__name__)

SentimentLabel = Literal["positive", "neutral", "negative"]


class SentimentResult:
    """Structured sentiment analysis result"""
    def __init__(self, label: SentimentLabel, score: float):
        self.label = label
        self.score = score
    
    def to_dict(self) -> dict:
        return {"label": self.label, "score": round(self.score, 4)}


class SentimentService:
    """Stateless sentiment analysis service for multilingual text"""
    
    def __init__(self):
        """Load model on initialization"""
        logger.info(f"Loading sentiment model: {SENTIMENT_MODEL}")
        
        self.pipeline = pipeline(
            "sentiment-analysis",
            model=SENTIMENT_MODEL,
            device=0 if DEVICE == "cuda" else -1,
            truncation=True,
            max_length=SENTIMENT_CONFIG["max_length"]
        )
        
        logger.info(f"Sentiment model loaded on {DEVICE}")
    
    def _map_label(self, model_label: str) -> SentimentLabel:
        """
        Map model's 5-class output to simplified 3-class labels
        Model outputs: Very Negative, Negative, Neutral, Positive, Very Positive
        We map to: negative, neutral, positive
        """
        label_lower = model_label.lower()
        
        # Map Very Negative and Negative -> negative
        if "negative" in label_lower:
            return "negative"
        # Map Very Positive and Positive -> positive
        elif "positive" in label_lower:
            return "positive"
        # Map Neutral -> neutral
        else:
            return "neutral"
    
    def analyze(self, text: str) -> SentimentResult:
        """
        Analyze sentiment of text
        
        Args:
            text: Input text to analyze
            
        Returns:
            SentimentResult with label and confidence score
            
        Raises:
            ValueError: If text is empty
        """
        if not text or len(text.strip()) == 0:
            raise ValueError("Cannot analyze empty text")
        
        try:
            result = self.pipeline(text[:SENTIMENT_CONFIG["max_length"]])[0]
            
            # Simplify label using mapping
            label = self._map_label(result["label"])
            score = result["score"]
            
            return SentimentResult(label=label, score=score)
            
        except Exception as e:
            logger.error(f"Sentiment analysis failed: {e}")
            raise
    
    def batch_analyze(self, texts: list[str]) -> list[SentimentResult]:
        """
        Analyze sentiment for multiple texts
        
        Args:
            texts: List of texts to analyze
            
        Returns:
            List of SentimentResults (same order as input)
        """
        if not texts:
            return []
        
        try:
            valid_texts = [t[:SENTIMENT_CONFIG["max_length"]] for t in texts if t and t.strip()]
            
            if not valid_texts:
                return [SentimentResult(label="neutral", score=0.0) for _ in texts]
            
            results = self.pipeline(valid_texts)
            
            # Convert to SentimentResult objects using label mapping
            sentiment_results = []
            for result in results:
                label = self._map_label(result["label"])
                sentiment_results.append(SentimentResult(label=label, score=result["score"]))
            
            return sentiment_results
            
        except Exception as e:
            logger.error(f"Batch sentiment analysis failed: {e}")
            # Return neutral sentiment for all on error
            return [SentimentResult(label="neutral", score=0.0) for _ in texts]

