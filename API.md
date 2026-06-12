# ZYVV API v1 (Beta)

ZYVV is a decision interrogation protocol: drop a situation, get three structured
paths (conventional / contrarian / alien), pick one, raise an objection, get a
refined path. Every situation, door, choice, and objection is recorded — this is
ZYVV's core data asset (a growing dataset of *why* people reject advice), and it's
preserved regardless of which surface (app or API) is used.

This API is complementary to LLM APIs like Claude's or OpenAI's — it does not
replace your model, it gives you the protocol and the accumulating dataset on
top of it.

## Auth
All endpoints require: `Authorization: Bearer <your_api_key>`
Rate limit: 100 requests/hour per key.

## POST /api/v1/doors
Generate three doors for a situation.

Request:
{ "situation": "string, 10-2000 chars", "session_id": "optional string" }

Response:
{ "roast": "...", "doors": [...], "situation_id": 123, "structuredData": {...} }

## POST /api/v1/choice
Record which door was picked.

Request: { "situation_id": 123, "door_id": 456 }

Response: { "choice_id": 789 }

## POST /api/v1/interrogate
Raise an objection on the chosen door, get a refined path.

Request:
{ "previous_situation": "...", "selected_door": "conventional|contrarian|alien", "user_objection": "..." }

Response:
{ "refinement_block": { "critique", "refined_path", "next_interrogation_vector", "outcome_tracking_hint" } }