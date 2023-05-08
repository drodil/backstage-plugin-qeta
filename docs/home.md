# Adding Q&A table to homepage

This shows questions table in the custom homepage for the user:

```tsx
import React from 'react';
import { QuestionTableCard } from '@drodil/backstage-plugin-qeta';
import { CustomHomepageGrid } from '@backstage/plugin-home';
import { Content, Page } from '@backstage/core-components';

export const homePage = (
  <Page themeId="home">
    <Content>
      <CustomHomepageGrid>
        <QuestionTableCard />
      </CustomHomepageGrid>
    </Content>
  </Page>
);
```
