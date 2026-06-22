# Content Factory Schema

## ContentFactoryDraft
Fields: `sourceProductIdea`, `sourceNiche`, `sourceAudience`, `sourceProblem`, `sourceOffer`, `sourcePromise`, `basePrice`, `deliveryFormat`, `selectedPlatforms`, `landingGoal`, `campaignGoal`, `campaignTone`, `contentChannels`, `postingCadence`, `ctaMode`, `proofNotes`, `approvalNotes`, `createdAt`, and `updatedAt`.

## ContentFactoryOutput
Includes `positioning`, `contentAngles`, `instagramPosts`, `linkedinPosts`, `youtubeShorts`, `emailSequence`, `whatsappManualFollowups`, `adAngleDrafts`, `launchCalendar`, `assetChecklist`, `humanApprovalChecklist`, `riskWarnings`, and `nextSteps`.

## ContentFactoryExport
Includes the normalized draft, generated content, visible context payload, prompt, markdown, safety flags, and export timestamp. Safety flags assert manual-first, no guaranteed income, no auto-posting, no external send, no social/email/WhatsApp execution, and local-only draft behavior.
