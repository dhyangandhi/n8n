# TODO - Fix MANUAL_TRIGGER TypeScript error in node-selector.tsx

## Steps:
1. [x] Create `src/components/manual-trigger.tsx` component similar to initial-node.tsx.
2. [x] Update `src/config/node-components.ts` to import ManualTriggerNode and add `[NodeType.MANUAL_TRIGGER]: ManualTriggerNode` to nodeCompontes.
3. Update `src/components/node-selector.tsx` to add `MANUAL_TRIGGER: "MANUAL_TRIGGER"` to the object `{ INITIAL: "INITIAL"; }` at line ~28.
4. Run `npx prisma generate` (if schema changes, none expected).
5. Verify no TypeScript errors (VSCode should clear).
6. Test functionality: select manual trigger node.

Mark completed steps as done and attempt_completion when all finished.
