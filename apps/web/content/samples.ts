export interface Sample {
  id: string;
  filename: string;
  descriptionKey: string;
}

export const SAMPLES: Sample[] = [
  {
    id: 'default',
    filename: 'sample.jpg',
    descriptionKey: 'samples.default',
  },
];

export function getSample(id: string): Sample | undefined {
  return SAMPLES.find((s) => s.id === id);
}
