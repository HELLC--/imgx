import './operations/index';

export { imgx } from './imgx';
export { parseURL } from './parser';
export { buildURL } from './serializer';
export { executePipeline } from './pipeline';
export { resolveSource, registerProvider } from './source/index';
export { ValidationError } from './types';
export type { Operation, OperationDescriptor, SourceProvider } from './types';
export { register as registerOperation, getOperation, getAllOperations } from './operations/index';

import { resolveSource } from './source/index';
import { parseURL } from './parser';
import { executePipeline } from './pipeline';

export async function processImage(
  input: unknown,
  params: string,
): Promise<Buffer> {
  const sourceBuffer = await resolveSource(input);
  const operations = parseURL(params);
  return executePipeline(sourceBuffer, operations);
}
