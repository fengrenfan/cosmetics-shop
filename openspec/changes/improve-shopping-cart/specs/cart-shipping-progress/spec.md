## ADDED Requirements

### Requirement: Free shipping progress display
The system SHALL display a dynamic free shipping progress indicator in the cart footer, showing how much more the user needs to spend to qualify for free shipping.

#### Scenario: Display shipping progress below threshold
- **WHEN** user views cart and total price is below the free shipping threshold
- **THEN** footer shows "还需 ¥XX 免运费" with progress bar

#### Scenario: Display shipping progress at or above threshold
- **WHEN** user views cart and total price is at or above the free shipping threshold
- **THEN** footer shows "已满 ¥XX，免运费" with a checkmark indicator

#### Scenario: Threshold value from system configuration
- **WHEN** system retrieves the free shipping threshold value
- **THEN** it SHALL use the value from system configuration (dict table) with default of 99

#### Scenario: Progress bar visual
- **WHEN** shipping progress is displayed
- **THEN** it SHALL show a filled ratio bar (current/total) and monetary gap amount
