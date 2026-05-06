## ADDED Requirements

### Requirement: City selection popup
The system SHALL display a city selection popup when the user taps the location icon on the homepage navigation bar.

#### Scenario: Open city selection popup
- **WHEN** user taps the location icon in the navigation bar
- **THEN** a bottom popup appears with a list of cities and a search input

#### Scenario: Search for a city
- **WHEN** user types in the search input
- **THEN** the city list filters to show matching cities (by name)

#### Scenario: Select a city from the list
- **WHEN** user taps a city from the list
- **THEN** the popup closes and the selected city name is displayed in the navigation bar

#### Scenario: Select a popular city
- **WHEN** user views the city list
- **THEN** popular cities (北京, 上海, 广州, 深圳, 杭州, 成都, 武汉, 重庆) are displayed at the top in a horizontal scroll section

### Requirement: Persist selected city
The system SHALL persist the user's selected city and restore it on subsequent app launches.

#### Scenario: Restore previously selected city
- **WHEN** user opens the app and has previously selected a city
- **THEN** the navigation bar displays the previously selected city name