import { useRef, useState } from 'react';
import { Camera, Sparkles, Upload } from 'lucide-react';
import { CATEGORIES } from '@/shared/config';
import { Button } from '@/shared/ui/button';
import { ProductCard } from '@/entities/product/ui/ProductCard';
import { useVisualSearch } from '@/features/visual-search/api';

const COLORS = ['Black', 'White', 'Brown', 'Navy', 'Tan', 'Beige', 'Olive'];

export default function StudioPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | undefined>();
  const [color, setColor] = useState<string>();
  const [category, setCategory] = useState<string>();
  const search = useVisualSearch();

  const onFile = (f?: File) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const run = () => search.mutate({ file, color, category });

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
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            onFile(e.dataTransfer.files?.[0]);
          }}
          className="grid cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-border p-10 text-center transition hover:border-primary"
        >
          {preview ? (
            <img src={preview} alt="preview" className="max-h-64 rounded-xl object-contain" />
          ) : (
            <div className="text-muted-foreground">
              <Upload className="mx-auto mb-3 h-10 w-10 text-primary" />
              <p className="font-medium text-foreground">Drop an image or click to upload</p>
              <p className="text-sm">PNG, JPG up to 10MB</p>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
        </div>

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

      {search.data && (
        <div className="mt-14">
          <h2 className="mb-6 font-display text-2xl font-bold">
            {search.data.results.length} matches found
          </h2>
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
        </div>
      )}
    </div>
  );
}
