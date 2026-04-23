import { writeFile } from 'node:fs/promises';
import { Readable } from 'node:stream';
import type { OperationDescriptor } from './types';
import { resolveSource } from './source/index';
import { executePipeline } from './pipeline';

class ImgxBuilder {
  private operations: OperationDescriptor[] = [];

  constructor(private input: unknown) {}

  private addOp(name: string, options: Record<string, unknown>): this {
    this.operations.push({ name, options });
    return this;
  }

  resize(options: Record<string, unknown>): this { return this.addOp('resize', options); }
  crop(options: Record<string, unknown>): this { return this.addOp('crop', options); }
  indexcrop(options: Record<string, unknown>): this { return this.addOp('indexcrop', options); }
  circle(options: Record<string, unknown>): this { return this.addOp('circle', options); }
  roundedCorners(options: Record<string, unknown>): this { return this.addOp('rounded-corners', options); }
  autoOrient(options: Record<string, unknown>): this { return this.addOp('auto-orient', options); }
  rotate(options: Record<string, unknown>): this { return this.addOp('rotate', options); }
  flip(options: Record<string, unknown>): this { return this.addOp('flip', options); }
  blur(options: Record<string, unknown>): this { return this.addOp('blur', options); }
  quality(options: Record<string, unknown>): this { return this.addOp('quality', options); }
  format(options: Record<string, unknown>): this { return this.addOp('format', options); }
  watermark(options: Record<string, unknown>): this { return this.addOp('watermark', options); }

  async toBuffer(): Promise<Buffer> {
    const sourceBuffer = await resolveSource(this.input);
    return executePipeline(sourceBuffer, this.operations);
  }

  async toFile(path: string): Promise<void> {
    const buffer = await this.toBuffer();
    await writeFile(path, buffer);
  }

  toStream(): Readable {
    const self = this;
    const stream = new Readable({ read() {} });
    self.toBuffer()
      .then((buf) => { stream.push(buf); stream.push(null); })
      .catch((err) => stream.destroy(err as Error));
    return stream;
  }
}

export function imgx(input: unknown): ImgxBuilder {
  return new ImgxBuilder(input);
}
