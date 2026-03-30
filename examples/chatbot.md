# Example: Customer Service Chatbot

## System Description
An LLM-powered chatbot that answers customer support questions for an e-commerce company operating in the EU.

## Risk Classification

**Step 1 - Prohibited?** No. Not social scoring, biometric, manipulative, or exploitative.

**Step 2 - GPAI?** If built on a third-party foundation model (GPT-4, Claude, Mistral), the GPAI obligations apply to the model provider, not to you (the deployer). If you fine-tuned or built your own model, assess under GPAI rules.

**Step 3 - High-risk?** No. Customer service chatbots are not listed in Annex III.

**Step 4 - Limited risk?** Yes. The system interacts directly with natural persons.

**Classification: Limited Risk**

## Required Actions

1. Inform users they are interacting with an AI system (not a human)
2. If the chatbot generates text that could be perceived as human-written for public information purposes, disclose AI involvement
3. No further obligations under the Act

## Practical Implementation

- Add a clear notice: "You are chatting with an AI assistant"
- Include in the UI, not buried in terms of service
- Consider a visible indicator throughout the conversation
