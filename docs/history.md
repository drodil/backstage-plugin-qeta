# Post History & Revisions

The Q&A plugin supports automatic version history tracking for posts. Every time a post is edited, the **previous** state is saved as a revision snapshot. Users can browse past revisions and restore any version.

## Overview

- **Scope**: Configurable via `enabledContent`. By default, only articles (`type = 'article'`) have revision tracking. You can enable it for questions and links as well.
- **Storage**: Full snapshots of the previous post state (title, content, URL, header image, tags, entities) are stored in the database.
- **No-op detection**: If an edit does not actually change the title, content, URL, or header image, no revision is created.
- **Draft exclusion**: Revisions are not recorded for posts that are still in `draft` status. The first publish from draft to active does not create a revision.

## Configuration

```yaml
qeta:
  history:
    enabled: true # Enable revision tracking (default: false)
    retentionDays: 180 # Number of days to keep revisions (default: 180)
    saveAttachments: true # Save attachment UUIDs in revisions (default: false)
    enabledContent: # Content types with revision tracking (default: ['article'])
      - article
      - question
      - link
```

### Configuration Options

| Option            | Type       | Default       | Description                                                                                                                                                                                                                 |
| ----------------- | ---------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `enabled`         | `boolean`  | `false`       | Enable or disable revision tracking entirely. When `false`, no revisions are saved and the cleanup job is skipped.                                                                                                          |
| `retentionDays`   | `number`   | `180`         | Number of days to keep revisions before automatic cleanup.                                                                                                                                                                  |
| `enabledContent`  | `string[]` | `['article']` | List of content types that should have revision tracking. Possible values: `article`, `question`, `link`.                                                                                                                   |
| `saveAttachments` | `boolean`  | `false`       | When `true`, attachment UUIDs linked to the post are saved in revision snapshots. On restore the attachments are re-linked to the post so images and header images are preserved even if the content was edited in between. |

### Examples

**Track revisions for all content types with attachment preservation:**

```yaml
qeta:
  history:
    enabled: true
    saveAttachments: true
    enabledContent:
      - article
      - question
      - link
```

**Track only article revisions (default behavior):**

```yaml
qeta:
  history:
    enabled: true
    enabledContent:
      - article
```

**Disable revision tracking entirely:**

```yaml
qeta:
  history:
    enabled: false
```

## How It Works

When a post of an enabled content type is edited, the previous state (title, content, URL, header image, tags, and entities) is automatically saved as a revision snapshot before the update is applied. No revision is created if none of those fields actually changed.

## Viewing & Restoring Revisions

All post pages (articles, questions, links) show a **History** button in the header. The button is:

- **Clickable** when history is enabled for that content type and the post is active.
- **Greyed out** (with a tooltip) when history is disabled for the content type or the post is not active (e.g. draft).

Clicking the button opens a dialog listing all revisions with their timestamp and the user who triggered the edit. Each revision can be previewed or restored.

When restoring a revision, the current post state is first saved as a new revision (so the restore itself is reversible), then the selected snapshot is applied.

## Attachments

### Default Behavior (`saveAttachments: false`)

Attachment UUIDs referenced in the post content are not separately tracked. If an attachment was orphaned before a restore (e.g. an edit removed the image reference and the cleaner ran), the restored content will reference it but the image will return a 404.

### With `saveAttachments: true`

Each revision snapshot also records the list of attachment UUIDs linked to the post at the time of the snapshot. On restore, those attachments are re-linked to the post so images and header images are available again — even if they were orphaned in the meantime.

**Recommendation**: Enable `saveAttachments` if you want full fidelity when restoring revisions, especially for content-heavy articles with many images.

## Permissions

The history feature reuses existing permissions — no new permissions are required:

| Action             | Required Permission                         |
| ------------------ | ------------------------------------------- |
| View revision list | `qeta.read.post` (same as reading the post) |
| Restore a revision | `qeta.edit.post` (same as editing the post) |

Post authors, tag experts, and moderators can restore revisions according to the standard permission rules.

## Retention & Cleanup

Old revisions are automatically cleaned up by a background job that runs **daily at 3:00 AM** (server time). The schedule is not configurable.

- Revisions older than `retentionDays` days are deleted.
- The default retention is **180 days** (6 months).
- If `enabled` is `false`, the cleanup job does not start.

To keep revisions indefinitely, set a very large value:

```yaml
qeta:
  history:
    retentionDays: 36500 # ~100 years
```
