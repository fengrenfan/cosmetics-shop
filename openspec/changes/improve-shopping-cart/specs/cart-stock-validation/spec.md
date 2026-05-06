## ADDED Requirements

### Requirement: Cart stock and status validation
The system SHALL validate stock and product status for each cart item when listing cart contents, and SHALL mark items with insufficient stock or off-shelf status as invalid.

#### Scenario: List cart with available items
- **WHEN** user views cart list and all items have stock > 0 and status = 1
- **THEN** all items display normally without invalid marking

#### Scenario: List cart with out-of-stock item
- **WHEN** user views cart list and an item has stock = 0
- **THEN** that item displays an invalid indicator and is excluded from checkout

#### Scenario: List cart with off-shelf product
- **WHEN** user views cart list and an item's product has status = 0
- **THEN** that item displays an "已下架" (off-shelf) badge and is excluded from checkout

#### Scenario: Checkout with invalid items present
- **WHEN** user attempts to checkout while invalid items are in the cart
- **THEN** system SHALL show a warning listing invalid items and block checkout until they are removed
