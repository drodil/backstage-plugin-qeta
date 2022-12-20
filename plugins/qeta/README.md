# qeta

Welcome to the qeta plugin!

_This plugin was created through the Backstage CLI_

## Getting started

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by
running `yarn start` in the root directory, and then navigating to [/qeta](http://localhost:3000/qeta).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](./dev) directory.

## Adding to your application

Add route to qeta to your app in packages/app/src/Root/Root.tsx:

```tsx
<SidebarItem icon={HelpIcon} to="qeta" text="Q&A" />
```
