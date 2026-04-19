// React-layer errors. Re-exports the framework-agnostic ones from
// @graphistry/client-api so consumers have one import site.

export { GraphistryRpcError, GraphistryPermissionError } from '@graphistry/client-api';

/** Thrown when a hook mutation is attempted on a domain controlled by a Provider prop. */
export class GraphistryControlledError extends Error {
  readonly domain: string;
  readonly propName: string;
  constructor(domain: string, propName: string) {
    super(
      `${domain} is controlled by the <GraphistryProvider ${propName}> prop — ` +
      `either remove the prop and use the hook mutator, or keep the prop and treat the domain as read-only.`
    );
    this.name = 'GraphistryControlledError';
    this.domain = domain;
    this.propName = propName;
  }
}
