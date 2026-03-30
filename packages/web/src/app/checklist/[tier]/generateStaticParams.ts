export function generateStaticParams() {
  return [
    { tier: 'high-risk' },
    { tier: 'gpai' },
    { tier: 'gpai-systemic' },
    { tier: 'limited' },
    { tier: 'minimal' },
    { tier: 'prohibited' },
  ];
}