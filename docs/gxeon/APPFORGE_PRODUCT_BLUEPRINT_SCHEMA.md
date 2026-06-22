# APPFORGE Product Blueprint Schema

## ProductBuilderDraft

| Field | Type | Notes |
| --- | --- | --- |
| `idea` | `string` | Product idea entered by the operator. |
| `niche` | `string` | Market or category. |
| `targetAudience` | `string` | Avatar or customer segment. |
| `problem` | `string` | Primary problem to solve. |
| `productType` | `ebook \| course \| mentorship \| saas \| template \| affiliate_store \| dashboard \| community \| service \| other` | Manual planning classification only. |
| `offer` | `string` | Initial offer description. |
| `promise` | `string` | Transformation promise without guaranteed income. |
| `desiredPrice` | `string` | Price hypothesis for human validation. |
| `channels` | `string[]` | Planned channels; no API execution. |
| `tone` | `direct \| premium \| technical \| popular \| institutional \| persuasive` | Prompt tone. |
| `deliveryFormat` | `string` | Example: PDF, videos, templates, dashboard. |
| `approvalNotes` | `string` | Human approval notes. |
| `createdAt` | `string` | ISO timestamp. |
| `updatedAt` | `string` | ISO timestamp. |

## ProductBlueprintOutput

| Field | Type | Purpose |
| --- | --- | --- |
| `nameSuggestions` | `string[]` | Product name ideas. |
| `avatar` | `string` | Structured avatar summary. |
| `coreOffer` | `string` | Core offer statement. |
| `promise` | `string` | Safe promise statement. |
| `transformation` | `string` | Before/after transformation. |
| `deliverables` | `string[]` | Product deliverables. |
| `pricingHypothesis` | `string` | Suggested price hypothesis. |
| `landingPageStructure` | `string[]` | Landing page sections. |
| `marketplacePackFields` | `string[]` | Manual marketplace-pack fields. |
| `contentAngles` | `string[]` | Initial content angles. |
| `salesChannels` | `string[]` | Operator-selected channels. |
| `humanApprovalChecklist` | `string[]` | Required manual checks. |
| `nextSteps` | `string[]` | Next actions. |

## Export shape

JSON export includes `draft`, `blueprint`, `prompt`, `markdown`, `safety`, and `exportedAt`. It does not include API keys, tokens, payment credentials, marketplace credentials, database URLs, or environment values.
