## item_191_define_a_json_owned_system_tuning_surface_for_externalizable_technical_constants - Define a JSON-owned system-tuning surface for externalizable technical constants
> From version: 0.3.1
> Status: Done
> Understanding: 100%
> Confidence: 99%
> Progress: 100%
> Complexity: Medium
> Theme: Data
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- Retunable technical constants such as input feel, viewport knobs, search limits, and presentation timings are still spread across TypeScript modules.
- That makes technical tuning harder to inspect and adjust as one coherent surface.

# Scope
- In: one repo-owned `systemTuning.json` surface for externalizable technical constants.
- Out: merging technical and gameplay tuning into one file, or moving all project constants into data files.

```mermaid
%% logics-signature: backlog|define-a-json-owned-system-tuning-surfac|req-053-define-an-externalized-json-syst|retunable-technical-constants-such-as-in|ac1-the-slice-defines-a-dedicated
flowchart LR
    Req[Req 053 system tuning] --> Gap[Technical tuning values are scattered]
    Gap --> Slice[System tuning JSON surface]
    Slice --> Result[One editable technical tuning source]
```

# Acceptance criteria
- AC1: The slice defines a dedicated JSON-owned technical/system tuning surface.
- AC2: The slice defines that this surface remains separate from gameplay tuning.
- AC3: The slice defines first-wave technical domains such as input, viewport, and runtime presentation timing.
- AC4: The slice stays bounded to retunable technical constants.

# Links
- Request: `req_053_define_an_externalized_json_system_tuning_contract`

# Notes
- Derived from request `req_053_define_an_externalized_json_system_tuning_contract`.
- Source file: `logics/request/req_053_define_an_externalized_json_system_tuning_contract.md`.
