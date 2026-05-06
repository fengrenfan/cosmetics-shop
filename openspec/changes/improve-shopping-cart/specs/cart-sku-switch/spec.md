## ADDED Requirements

### Requirement: SKU switching within cart
The system SHALL allow users to switch SKU规格 (variant) for a cart item directly from the cart page without navigating to the product detail page.

#### Scenario: Switch SKU for a cart item
- **WHEN** user taps on the SKU name row of a cart item
- **THEN** system displays a SKU selection popup showing all available SKUs for that product

#### Scenario: Select new SKU and confirm
- **WHEN** user selects a different SKU from the popup and confirms
- **THEN** system updates the cart item's SKU to the selected one, recalculates price, and closes the popup

#### Scenario: Switch to same SKU
- **WHEN** user selects the currently selected SKU
- **THEN** no change occurs and popup closes

#### Scenario: Switch SKU triggers stock check
- **WHEN** user switches to a SKU with insufficient stock
- **THEN** system shows "库存不足" error and does not update the cart item
