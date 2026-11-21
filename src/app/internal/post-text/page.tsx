import { PostTextPreview } from "@/components/company/PostTextPreview";
import { THEME_SWATCHES } from "@/lib/media-library-shared";

/* Dev preview of on-screen post text in every theme color, plus the classic
   look. 404 in production through the /internal layout. */
export default function PostTextPreviewPage() {
  return (
    <div className="flex min-h-screen flex-wrap content-start gap-4 bg-ground p-8">
      {[null, ...THEME_SWATCHES].map((color) => (
        <div
          key={color ?? "classic"}
          className="flex w-[200px] items-center justify-center bg-ink-900 px-3 rounded-ops-md"
          style={{ aspectRatio: "9 / 16" }}
        >
          <div className="flex max-w-[90%] justify-center text-center">
            <PostTextPreview text="Your caption here on two lines" color={color} fontSize={19} />
          </div>
        </div>
      ))}
    </div>
  );
}
