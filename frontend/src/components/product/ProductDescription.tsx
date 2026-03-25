interface ProductDescriptionProps {
  html: string | null;
}

export function ProductDescription({ html }: ProductDescriptionProps) {
  if (!html) return null;

  // NOTE: long_desc is trusted HTML authored by admins (not user input).
  // If user-generated content is added in future, sanitize with DOMPurify.
  return (
    <div
      className="prose prose-sm max-w-none mt-8 pt-8 border-t"
      style={{ borderColor: "var(--border)" }}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
