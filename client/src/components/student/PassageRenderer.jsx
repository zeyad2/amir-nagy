/**
 * PassageRenderer Component
 * Renders TipTap HTML content with proper SAT-style formatting
 */
export default function PassageRenderer({ content, title, imageURL }) {
  return (
    <div className="passage-container">
      {title && (
        <h3 className="text-lg font-serif font-semibold mb-4 text-foreground">
          {title}
        </h3>
      )}

      {imageURL && (
        <div className="mb-4">
          <img
            src={imageURL}
            alt="Passage illustration"
            className="max-w-full h-auto rounded-lg border"
          />
        </div>
      )}

      <div
        className="prose prose-serif max-w-none font-serif text-base leading-relaxed
                   prose-p:mb-4 prose-p:text-foreground
                   prose-em:italic prose-em:text-foreground
                   prose-strong:font-semibold prose-strong:text-foreground
                   select-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  )
}
