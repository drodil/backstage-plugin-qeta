# Adding Q&A table to homepage

In the new frontend system, Qeta provides home widgets that you can enable through frontend extension configuration.

```yaml
app:
  extensions:
    - home-page-widget:qeta/home-posts-table:
        config:
          rowsPerPage: 10
          postType: all
    - home-page-widget:qeta/home-posts-timeline: {}
```
