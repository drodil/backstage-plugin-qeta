import { fireEvent, render, screen } from '@testing-library/react';
import { wrapInTestApp } from '@backstage/test-utils';
import { Link } from 'react-router-dom';
import { AskPage } from './AskPage';

jest.mock('@drodil/backstage-plugin-qeta-react', () => ({
  ...jest.requireActual('@drodil/backstage-plugin-qeta-react'),
  useQetaConfig: () => ({ disabled: {} }),
  useAI: () => ({ isNewQuestionsEnabled: false }),
  useQetaApi: () => ({ loading: false }),
  useQetaContext: () => ({}),
  PostForm: ({ entity }: { entity?: string }) => (
    <input aria-label="Entity" value={entity ?? ''} readOnly />
  ),
  AIAnswerCard: () => null,
}));

describe('AskPage', () => {
  const entity = 'component:default/test-service';
  const entityRoute = `/qeta/ask?entity=${entity}`;
  const genericRoute = '/qeta/ask';

  it.each([
    ['added', genericRoute, entityRoute],
    ['removed', entityRoute, genericRoute],
  ])('keeps rendering when the entity parameter is %s', async (_, from, to) => {
    render(
      wrapInTestApp(
        <>
          <Link to={to}>Next</Link>
          <AskPage />
        </>,
        { routeEntries: [from] },
      ),
    );

    fireEvent.click(screen.getByRole('link', { name: 'Next' }));

    expect(screen.getByRole('textbox', { name: 'Entity' })).toHaveValue(
      to === entityRoute ? entity : '',
    );
    expect(await screen.findByRole('heading')).toBeVisible();
  });

  it('shows the entity in the title when the entity parameter is set', async () => {
    render(wrapInTestApp(<AskPage />, { routeEntries: [entityRoute] }));

    expect(await screen.findByRole('heading')).toHaveTextContent(
      'test-service',
    );
  });
});
