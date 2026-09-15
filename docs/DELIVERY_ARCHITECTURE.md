# Flash One Project Delivery Workspace

Major Phase 2 adds project execution after a Project already exists.

Project → Tasks → Files → Deliverables → Conversation → Timeline

This is not payments, invoices, or electronic signature.

## Domain separation

| Entity | Meaning |
| --- | --- |
| Task | Internal or customer-visible work item |
| Project file | Metadata for a private Storage object |
| Deliverable | Formal customer review package |
| Conversation / message | Project participants only |
| Project activity | Workspace timeline from real events |
| audit_events | Security/audit log (unchanged, still locked) |

A file is not a deliverable. Deliverable acceptance is not payment.

## Task visibility

`customer_visible` is false by default. Admin must opt in. Customers never
see internal tasks.

Admin manages tasks. Customers view only customer-visible tasks. Assigned
developers may see project-team tasks, including internal tasks that are
hidden from customers. `customer_visible` is not developer authorization.

## Files and Storage

Private bucket: `project-files`.

Path: `{visibility}/{project_id}/{file_id}/{normalized_filename}`

Visibility:

- `customer` — customer, assigned developers, admin
- `project_team` — assigned developers and admin
- `internal` — admin only

Assigned developers do not receive every project file.

Database authorization is authoritative. Downloads use a 60-second signed
URL after a metadata SELECT succeeds.

Limits: 20 MB. Allowed extensions/MIME pairs: pdf, png, jpg/jpeg, webp, txt,
csv, zip, docx, xlsx. Empty files rejected. Filename normalized server-side.

Customers cannot hard-delete files. Destructive admin deletion is deferred.

Malware scanning is deferred.

## Deliverable versioning

Each `admin_create_deliverable` creates the next version. Submit is only from
`draft`. Submitting supersedes other `submitted` / `changes_requested` rows,
not `accepted` rows. `file_snapshot` stores the filenames the customer
reviewed. Later file changes do not rewrite that snapshot.

Acceptance records `accepted_by_user_id` and `accepted_at`. Idempotent.
Platform admin cannot accept as the customer.

## Conversation

Exactly one primary conversation per project (`unique project_id`).
`ensure_project_conversation` is idempotent. Existing projects are backfilled.

Messages are immutable. `sender_user_id` and `sender_kind` are assigned from
`auth.uid()` / `is_platform_admin()` / project relationship, not
caller-supplied identity.

V1 sender labels:

- Customer
- Flash One (platform admin / staff)
- Project Developer

Assigned developers may participate in the project conversation. They are
never labelled Platform Admin unless they actually are admin.

Message attachments are deferred; reuse project files later if needed.

## Timeline

`project_activity` is a workspace timeline. It is not `audit_events` and not
the financial ledger.
Customers see `visibility = customer` events only.

## Deferred

- Malware scanning
- Advanced file previews
- Large-file multipart upload
- Message attachments
- Email / SMS / WhatsApp notifications
- Realtime/WebSocket chat
- Typing indicators and read receipts
- Task assignment / workforce beyond developer assignment
- Employee / freelancer / partner assignment
- Advanced project timeline beyond real domain events
- Customer file deletion
- Storage retention / production limits
