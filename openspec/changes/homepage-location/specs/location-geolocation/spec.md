## ADDED Requirements

### Requirement: Automatic geolocation
The system SHALL attempt to determine the user's current city using GPS when the location icon is tapped for the first time or when the user requests auto-detection.

#### Scenario: Request location permission
- **WHEN** user taps the location icon and location permission has not been granted
- **THEN** system requests location permission from the user

#### Scenario: Permission granted, location available
- **WHEN** location permission is granted and coordinates are retrieved
- **THEN** system matches coordinates to a known city and selects it

#### Scenario: Permission denied
- **WHEN** user denies location permission
- **THEN** system displays the city selection popup for manual selection without auto-selecting any city

#### Scenario: Location retrieved but city not matched
- **WHEN** coordinates are retrieved but do not match any known city
- **THEN** system shows a message "无法识别城市，请手动选择" and displays the city selection popup

### Requirement: Geolocation button in popup
The system SHALL provide a "使用定位" button in the city selection popup that triggers automatic location when tapped.

#### Scenario: Tap use location button
- **WHEN** user taps the "使用定位" (Use My Location) button in the popup
- **THEN** system initiates location retrieval and displays a loading indicator