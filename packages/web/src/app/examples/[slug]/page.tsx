import ExamplesPageClient from './ExamplesPageClient';

export function generateStaticParams() {
  return [
    { slug: 'chatbot' },
    { slug: 'hiring-tool' },
    { slug: 'autonomous-vehicle' },
  ];
}

export default function ExamplesPage() {
  return <ExamplesPageClient />;
}
