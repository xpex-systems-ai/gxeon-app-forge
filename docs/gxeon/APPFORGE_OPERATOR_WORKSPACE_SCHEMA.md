# APPFORGE Operator Workspace Schema

The schema is data-only and lives in `app/lib/gxeon/operatorWorkspace.ts`.

## Types

- `OperatorWorkspaceTabId`: `create`, `package`, `monetize`, `validate`, `integrate`, `agent`.
- `OperatorWorkspaceModuleDefinition`: module key, label, description, `localOnly: true`, and `humanApprovalRequired: true`.
- `OperatorWorkspaceTabDefinition`: tab id, label, description, module keys and safety note.

## Helpers

- `getOperatorWorkspaceTabs()` returns cloned tab definitions for UI rendering.
- `findOperatorWorkspaceTab(id)` returns one tab definition by id.
- `getOperatorWorkspaceSummary()` returns tab count, unique module count, tab ids and module keys.

## Contract

The schema does not contain callbacks, side effects, external action flags or executable automation. It is safe navigation metadata for the Operator Workspace shell.
