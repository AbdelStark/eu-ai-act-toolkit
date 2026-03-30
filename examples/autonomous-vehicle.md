# Example: Autonomous Vehicle AI System

## System Description
An AI system controlling an autonomous vehicle (L4 autonomy) deployed on EU roads. Uses camera, lidar, and radar inputs processed through a world model and planning system.

## Risk Classification

**Step 1 - Prohibited?** No.

**Step 2 - GPAI?** If the perception/planning system uses a foundation model (e.g., a VLA or world model), GPAI obligations apply to the model provider.

**Step 3 - High-risk?** Yes, via both pathways:
- **Pathway A**: Safety component of a vehicle (Annex I, Regulation 2019/2144 on motor vehicle safety). Requires third-party conformity assessment.
- **Pathway B**: Annex III, Category 2: "Critical infrastructure" - safety component in road traffic management.

**Classification: HIGH-RISK (with third-party conformity assessment)**

## Required Actions

All Articles 9-15 requirements apply, plus:

1. **Third-party conformity assessment** required (not self-assessment)
2. **Risk Management** must cover: sensor failures, adversarial attacks (physical world patches, stickers), edge cases (weather, unusual road conditions, emergency vehicles), interaction with vulnerable road users (pedestrians, cyclists, children)
3. **Data Governance** must address: geographic representativeness (trained on roads similar to deployment area), demographic coverage (detection accuracy across ages, skin tones, wheelchair users, mobility aids), weather and lighting conditions
4. **Human Oversight**: Remote monitoring capability, safe fallback state (minimal risk condition), intervention mechanism, clear handoff protocols
5. **Accuracy metrics**: Object detection precision/recall by category, false negative rates for vulnerable road users, performance under degraded conditions
6. **Cybersecurity**: Protection against V2X (vehicle-to-everything) attacks, OTA update integrity, sensor spoofing

## Additional Regulatory Overlap

- UN Regulation 157 (automated lane keeping)
- UNECE WP.29 framework for automated driving
- National road traffic laws in deployment countries
- Product liability under the revised EU Product Liability Directive
