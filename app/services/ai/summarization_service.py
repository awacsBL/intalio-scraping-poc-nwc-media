from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch
from typing import Optional
import logging
from .config import DEVICE, SUMMARIZATION_MODEL, SUMMARY_CONFIG

logger = logging.getLogger(__name__)


class SummarizationService:
    """Stateless summarization service for Arabic text"""
    
    def __init__(self):
        """Load model on initialization"""
        logger.info(f"Loading summarization model: {SUMMARIZATION_MODEL}")
        self.tokenizer = AutoTokenizer.from_pretrained(SUMMARIZATION_MODEL)
        self.model = AutoModelForSeq2SeqLM.from_pretrained(SUMMARIZATION_MODEL)
        self.model.to(DEVICE)
        self.model.eval()  # Set to evaluation mode
        logger.info(f"Summarization model loaded on {DEVICE}")
    
    def summarize(
        self, 
        text: str,
        max_length: Optional[int] = None,
        min_length: Optional[int] = None
    ) -> str:
        """
        Summarize Arabic text
        
        Args:
            text: Input text to summarize
            max_length: Maximum length of summary (default from config)
            min_length: Minimum length of summary (default from config)
            
        Returns:
            Summarized text
            
        Raises:
            ValueError: If text is empty or too short
        """
        if not text or len(text.strip()) < 10:
            raise ValueError("Text too short to summarize")
        
        max_length = max_length or SUMMARY_CONFIG["max_output_length"]
        min_length = min_length or SUMMARY_CONFIG["min_length"]
        
        try:
            inputs = self.tokenizer(
                text,
                return_tensors="pt",
                truncation=True,
                max_length=SUMMARY_CONFIG["max_input_length"]
            ).to(DEVICE)
            
            with torch.no_grad():
                summary_ids = self.model.generate(
                    **inputs,
                    max_length=max_length,
                    min_length=min_length,
                    num_beams=SUMMARY_CONFIG["num_beams"],
                    early_stopping=True
                )
            
            summary = self.tokenizer.decode(summary_ids[0], skip_special_tokens=True)
            
            logger.info(f"Summarized text: {len(text)} chars -> {len(summary)} chars")
            return summary
            
        except Exception as e:
            logger.error(f"Summarization failed: {e}")
            raise
    
    def batch_summarize(self, texts: list[str]) -> list[str]:
        """
        Summarize multiple texts (processes sequentially for stability)
        
        Args:
            texts: List of texts to summarize
            
        Returns:
            List of summaries (same order as input)
        """
        summaries = []
        for text in texts:
            try:
                summary = self.summarize(text)
                summaries.append(summary)
            except ValueError:
                # Text too short, return original
                summaries.append(text)
            except Exception as e:
                logger.error(f"Failed to summarize text: {e}")
                summaries.append(text)  # Fallback to original
        
        return summaries
