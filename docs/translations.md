# Translations (alpha)

The plugin supports translations. To add a new language, create a new file in `packages/app/src/locales` with the
language code (e.g. `qeta-fi.ts`).
Create the translations as described here https://backstage.io/docs/plugins/internationalization/ using the
`qetaTranslationRef` from `@drodil/backstage-plugin-qeta` as the translation reference:

```ts
// packages/app/src/locales/qeta-fi.ts
import { qetaTranslationRef } from '@drodil/backstage-plugin-qeta';
import { createTranslationMessages } from '@backstage/core-plugin-api/alpha';

const fi = createTranslationMessages({
  ref: qetaTranslationRef,
  full: false,
  translations: {
    'toolsPage.title': 'Työkalut',
    'welcomePage.introText': 'Käytä työkaluja helposti',
  },
});

export default fi;
```

Then add the translation to your `packages/app/src/App.tsx`:

```tsx
import { createTranslationResource } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '@drodil/backstage-plugin-qeta';

const app = createApp({
  //...
  __experimentalTranslations: {
    availableLanguages: ['en', 'fi'],
    resources: [
      createTranslationResource({
        ref: qetaTranslationRef,
        translations: {
          fi: () => import('./locales/qeta-fi'),
        },
      }),
    ],
  },
});
```

## Using predefined translations

You can also use the predefined translations from the plugin:

```ts
import { qetaTranslations } from '@drodil/backstage-plugin-qeta';

const app = createApp({
  //...
  __experimentalTranslations: {
    availableLanguages: ['en', 'fi'],
    resources: [qetaTranslations],
  },
});
```

Note that these translations might not contain your desired language. If you want to add a new language, you need to
contribute it to the plugin in `plugins/qeta/src/locales/` and add it in the `plugins/qeta/src/translation.ts`
with the right language code.
