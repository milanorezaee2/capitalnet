// ─── FAQ Schema Hook ────────────────────────────────────────────────────────────────
// Dynamic FAQ Schema markup generation

import { useEffect } from 'react';
import type { FAQ } from '../types/enterprise';

export const useFAQSchema = (faqs: FAQ[]) => {
  useEffect(() => {
    if (!faqs || faqs.length === 0) return;

    // Remove existing FAQ schema
    const existingSchema = document.getElementById('faq-schema');
    if (existingSchema) {
      existingSchema.remove();
    }

    // Create FAQ Schema
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    };

    // Create script tag
    const script = document.createElement('script');
    script.id = 'faq-schema';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(faqSchema);
    document.head.appendChild(script);

    return () => {
      const schema = document.getElementById('faq-schema');
      if (schema) schema.remove();
    };
  }, [faqs]);
};
