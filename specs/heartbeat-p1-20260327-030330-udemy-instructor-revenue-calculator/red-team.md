# Red Team

## Main Failure Modes

1. Treating gross learner payments as if they were Udemy Net Amount values.
2. Presenting the partner / affiliate share as official when it is really a customizable planning assumption.
3. Making the subscription model look precise even though it depends on a scenario for total subscription revenue and minutes share.
4. Duplicating the slug in discovery files because `tools/index.md` already contains one existing entry.

## Mitigations

- Label transactional inputs as net sales before instructor share.
- Label partner share as editable and note why.
- Keep subscription inputs explicit and advanced, with explanatory helper text.
- Assert exact-once counts in the test file across all four discovery surfaces.
