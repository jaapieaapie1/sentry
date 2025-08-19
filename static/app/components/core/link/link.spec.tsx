import {render, screen} from 'sentry-test/reactTestingLibrary';

import {ExternalLink, Link} from 'sentry/components/core/link';
import {FrontendVersionProvider} from 'sentry/components/frontendVersionContext';

// Mock React Router's Link component to spy on its props
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: jest.fn(({reloadDocument, to, children, ...props}) => (
    <a
      href={typeof to === 'string' ? to : to.pathname}
      data-reload-document={reloadDocument}
      {...props}
    >
      {children}
    </a>
  )),
}));

describe('Link', () => {
  // Note: Links should not support a disabled option, as disabled links are just text elements
  it('disabled links render as <a> with no href', () => {
    render(
      <Link disabled to="https://www.sentry.io/">
        Link
      </Link>
    );

    expect(screen.getByText('Link')).toBeEnabled();
    expect(screen.getByText('Link')).not.toHaveAttribute('href');
  });

  it('links render as <a> with href', () => {
    render(<Link to="https://www.sentry.io/">Link</Link>);
    expect(screen.getByText('Link')).toHaveAttribute('href', 'https://www.sentry.io/');
  });

  it('links have reloadDocument=true when frontend is outdated', () => {
    render(
      <FrontendVersionProvider releaseVersion="frontend@abc123" force="stale">
        <Link to="/issues/">Link</Link>
      </FrontendVersionProvider>
    );

    // Verify that reloadDocument is set to true for stale frontend
    expect(screen.getByRole('link')).toHaveAttribute('data-reload-document', 'true');
  });

  it('links have reloadDocument=false when frontend is fresh', () => {
    render(
      <FrontendVersionProvider releaseVersion="frontend@abc123" force="fresh">
        <Link to="/issues/">Link</Link>
      </FrontendVersionProvider>
    );

    // Verify that reloadDocument is false for fresh frontend
    expect(screen.getByRole('link')).toHaveAttribute('data-reload-document', 'false');
  });
});

describe('ExternalLink', () => {
  it('external links render as <a> with target="_blank" and rel="noreferrer noopener" if openInNewTab is true', () => {
    render(<ExternalLink href="https://www.sentry.io/">ExternalLink</ExternalLink>);

    expect(screen.getByRole('link')).toHaveAttribute('target', '_blank');
    expect(screen.getByRole('link')).toHaveAttribute('rel', 'noreferrer noopener');
  });

  it('external links render as <a> with href if openInNewTab is false', () => {
    render(
      <ExternalLink href="https://www.sentry.io/" openInNewTab={false}>
        ExternalLink
      </ExternalLink>
    );

    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://www.sentry.io/');
    expect(screen.getByRole('link')).not.toHaveAttribute('target');
    expect(screen.getByRole('link')).not.toHaveAttribute('rel');
  });
});
