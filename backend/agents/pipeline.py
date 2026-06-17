import json
import os
from groq import Groq


class ResearchAgent:
    """Research agent: uses Groq API to analyze a market sector."""

    def __init__(self, groq_api_key: str):
        self.client = Groq(api_key=groq_api_key)

    def run(self, sector_keyword: str) -> dict:
        """
        Research agent: analyzes a sector and returns competitor trends,
        market size, entry barriers, and top players.
        """
        prompt = f"""Analyze the "{sector_keyword}" sector and provide a detailed research report in JSON format with the following structure:
{{
  "competitor_trends": "3-4 key trends",
  "market_size": "estimated market size and growth",
  "entry_barriers": "main barriers to entry",
  "top_players": "list of top 5 players in this sector",
  "market_opportunity": "investment opportunity assessment"
}}

Return ONLY valid JSON, no markdown formatting, no code fences, no extra text."""

        try:
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a market research analyst. Always respond with valid JSON only. No markdown, no code fences, no extra text."
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=2048,
            )

            result = response.choices[0].message.content.strip()

            # Clean up any markdown code fences if present
            if result.startswith("```"):
                result = result.split("\n", 1)[1]  # Remove first line
            if result.endswith("```"):
                result = result.rsplit("```", 1)[0]  # Remove last fence
            result = result.strip()

            parsed = json.loads(result)
            return parsed

        except json.JSONDecodeError:
            # If JSON parsing fails, return a structured fallback with the raw text
            return {
                "competitor_trends": result if 'result' in dir() else "Analysis unavailable",
                "market_size": "N/A",
                "entry_barriers": "N/A",
                "top_players": "N/A",
                "market_opportunity": "N/A"
            }
        except Exception as e:
            raise RuntimeError(f"Groq API error: {str(e)}")


class AnalystAgent:
    """Analyst agent: takes research output and provides strategic analysis."""

    VALID_TIERS = [
        "High Growth Market",
        "Niche/Saturated",
        "Strategic Pivot Required"
    ]

    def __init__(self, groq_api_key: str):
        self.client = Groq(api_key=groq_api_key)

    def run(self, research_output: dict) -> dict:
        """
        Analyst agent: takes research output and returns strategic tier
        and 3 recommendations.
        """
        research_text = json.dumps(research_output, indent=2)

        prompt = f"""Based on this market research:

{research_text}

Provide strategic analysis in JSON format:
{{
  "category_tier": "MUST be exactly one of: 'High Growth Market', 'Niche/Saturated', or 'Strategic Pivot Required'",
  "recommendation_1": "First strategic recommendation",
  "recommendation_2": "Second strategic recommendation",
  "recommendation_3": "Third strategic recommendation",
  "rationale": "Brief explanation of tier selection"
}}

Return ONLY valid JSON, no markdown formatting, no code fences, no extra text."""

        try:
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a strategic market analyst. Always respond with valid JSON only. No markdown, no code fences, no extra text."
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5,
                max_tokens=1024,
            )

            result = response.choices[0].message.content.strip()

            # Clean up any markdown code fences if present
            if result.startswith("```"):
                result = result.split("\n", 1)[1]
            if result.endswith("```"):
                result = result.rsplit("```", 1)[0]
            result = result.strip()

            parsed = json.loads(result)

        except json.JSONDecodeError:
            parsed = {
                "category_tier": "Strategic Pivot Required",
                "recommendation_1": "Conduct additional market research",
                "recommendation_2": "Analyze competitive positioning",
                "recommendation_3": "Evaluate resource requirements",
                "rationale": "Unable to parse AI response — manual review needed"
            }
        except Exception as e:
            raise RuntimeError(f"Groq API error: {str(e)}")

        # Validate tier
        if parsed.get("category_tier") not in self.VALID_TIERS:
            parsed["category_tier"] = "Strategic Pivot Required"

        return parsed
