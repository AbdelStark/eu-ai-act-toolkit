import ExamplesPageClient from './ExamplesPageClient';
import type { WorkedExample } from '@eu-ai-act/sdk';

import examplesData from '../../../../../../data/examples.json';

interface ExamplesFile {
  examples: WorkedExample[];
}

export function generateStaticParams() {
  return (examplesData as ExamplesFile).examples.map((e) => ({
    slug: e.slug,
  }));
}

export default function ExamplesPage() {
  return <ExamplesPageClient />;
}
