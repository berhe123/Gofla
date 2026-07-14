import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Camera, Sparkles } from 'lucide-react';
import { CATEGORIES } from '@/shared/config';
import { Button } from '@/shared/ui/button';
import { ProductCard } from '@/entities/product/ui/ProductCard';
import { useVisualSearch } from '@/features/visual-search/api';
import { StudioDropzone } from '@/features/visual-search/ui/StudioDropzone';

const COLORS = ['Black', 'White', 'Brown', 'Navy', 'Tan', 'Beige', 'Olive'];

type StudioLocationState = {
  file?: File;
  autoSearch?: boolean;
};

export default function StudioPage() {
  const location = useLocation();
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | undefined>();
  const [color, setColor] = useState<string>();
  const [category, setCategory] = useState<string>();
  const search = useVisualSearch();

  const onFile = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const run = () => {
    if (!file) {
      toast.error('Please upload an image first');
      return;
    }
    search.mutate(
      { file, color, category },
      {
        onError: () => toast.error('Visual search failed. Please try again.'),
      },
    );
  };

  useEffect(() => {
    const state = location.state as StudioLocationState | null;
    if (!state?.file) return;

    setFile(state.file);
    setPreview(URL.createObjectURL(state.file));

    if (state.autoSearch) {
      search.mutate(
        { file: state.file },
        {
          onError: () => toast.error('Visual search failed. Please try again.'),
        },
      );
    }

    window.history.replaceState({}, document.title);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once when arriving from home dropzone
  }, [location.key]);

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
          <Sparkles className="h-3.5 w-3.5" /> Gofla Studio
        </span>
        <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl text-balance">
          Snap it. We'll find it.
        </h1>
        <p className="mt-3 text-muted-foreground">
          Upload any photo and refine with color and category. Our engine surfaces your closest
          in-stock matches.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-2xl rounded-3xl border border-border bg-card p-6 md:p-8">
        <StudioDropzone preview={preview} onFileSelect={onFile} />

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-medium">Category</p>
            <select
              value={category ?? ''}
              onChange={(e) => setCategory(e.target.value || undefined)}
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
            >
              <option value="">Any</option>
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Color</p>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(color === c ? undefined : c)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${
                    color === c ? 'border-primary text-primary' : 'border-border text-muted-foreground'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Button size="lg" className="mt-6 w-full" onClick={run} disabled={search.isPending}>
          <Camera className="h-5 w-5" /> {search.isPending ? 'Searching…' : 'Find matches'}
        </Button>
      </div>

      {search.isError && (
        <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-destructive">
          Could not run visual search. Check your connection and try again.
        </p>
      )}

      {search.data && (
        <div className="mt-14">
          <h2 className="mb-6 font-display text-2xl font-bold">
            {search.data.results.length} matches found
          </h2>
          {search.data.results.length === 0 ? (
            <p className="text-muted-foreground">No matches yet — try another image or adjust filters.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {search.data.results.map(({ product, score }) => (
                <div key={product.id} className="relative">
                  <span className="absolute -top-2 left-2 z-10 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                    {Math.round(score * 100)}% match
                  </span>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
