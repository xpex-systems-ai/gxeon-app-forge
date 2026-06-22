# Checkout Blueprint Schema

## CheckoutBlueprintDraft

Fields: `sourceProductIdea`, `sourceNiche`, `sourceAudience`, `sourceProblem`, `sourceOffer`, `sourcePromise`, `basePrice`, `deliveryFormat`, `selectedPlatforms`, `marketplaceCategory`, `tone`, `checkoutGoal`, `pricingModel`, `guaranteePolicy`, `supportModel`, `approvalNotes`, `createdAt`, and `updatedAt`.

## CheckoutBlueprintOutput

Includes `pricingHypothesis`, `plans`, `orderBumps`, `upsells`, `downsells`, `checkoutPageCopy`, `thankYouPage`, `guaranteeAndRefund`, `supportAndDelivery`, `platformNotes`, `humanApprovalChecklist`, `riskWarnings`, and `nextSteps`.

## CheckoutBlueprintExport

Includes the draft, blueprint, visible context payload, prompt, markdown, safety flags, and `exportedAt`. Safety flags assert manual-first, no guaranteed income, no real checkout, no live payments, no gateway API execution, no marketplace API execution, and local-only draft storage.
