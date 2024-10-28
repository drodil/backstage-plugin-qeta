# Templates

Templates are used to create base information for questions, just like in Github you can create a new issue from a
template.

Templates can only be managed by moderators described in the app config:

```yaml
qeta:
  moderators:
    - user:default/admin
    - group:default/moderators
```

## Creating a template

As a moderator, open the `Moderate` menu and click on `Templates`. Click on `Create` and fill in the form.

## Using a template

When creating a new question, you can select a template from the list of templates.
The form will be filled with the predefined information from the template.

There is always option to create a generic question without a template.
