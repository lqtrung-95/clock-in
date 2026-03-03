/**
 * JSON-LD structured data component for SEO rich results.
 * Renders a <script type="application/ld+json"> tag in the document head.
 */

interface JsonLdSchemaProps {
  schema: Record<string, unknown>;
}

export function JsonLdSchema({ schema }: JsonLdSchemaProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
