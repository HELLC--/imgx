import type { Sharp } from 'sharp';
import type { Readable } from 'node:stream';

export class ValidationError extends Error {
  constructor(
    public readonly operation: string,
    public readonly param: string,
    message: string,
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export interface OperationDescriptor {
  name: string;
  options: Record<string, unknown>;
}

export interface Operation {
  name: string;
  parse(params: string): Record<string, unknown>;
  serialize(options: Record<string, unknown>): string;
  validate(options: Record<string, unknown>): void;
  apply(sharp: Sharp, options: Record<string, unknown>): Sharp | Promise<Sharp>;
}

export interface SourceProvider {
  name: string;
  match(input: unknown): boolean;
  resolve(input: unknown): Promise<Buffer | Readable>;
}
