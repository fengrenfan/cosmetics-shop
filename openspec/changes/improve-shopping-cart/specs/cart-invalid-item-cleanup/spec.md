## ADDED Requirements

### Requirement: Invalid items cleanup
The system SHALL provide a mechanism for users to identify and remove all invalid items (out-of-stock or off-shelf) from their cart in a single action.

#### Scenario: Show cleanup button when invalid items exist
- **WHEN** user views cart and there are one or more invalid items (stock = 0 OR status = 0)
- **THEN** a "清理失效商品" (Cleanup Invalid Items) button appears in the tip bar area

#### Scenario: Cleanup button tap shows confirmation
- **WHEN** user taps "清理失效商品" button
- **THEN** a confirmation dialog appears asking "确定要删除所有失效商品吗？"

#### Scenario: Confirm cleanup removes invalid items
- **WHEN** user confirms the cleanup dialog
- **THEN** all invalid items are removed via batch delete API and the cart list refreshes

#### Scenario: No invalid items present
- **WHEN** user views cart and all items are valid
- **THEN** the cleanup button is hidden
