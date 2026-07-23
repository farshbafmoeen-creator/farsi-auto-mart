import { useRef, useState } from "react";
import { X, Plus, Upload, Link as LinkIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ImageUpload({
  value,
  onChange,
  maxImages = 8,
}: {
  value: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [urlInput, setUrlInput] = useState("");

  const uploadFile = async (file: File) => {
    if (value.length >= maxImages) {
      setError(`حداکثر ${maxImages} تصویر مجاز است`);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("حجم تصویر باید کمتر از ۵ مگابایت باشد");
      return;
    }
    setError("");
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("product-images").upload(path, file, {
        cacheControl: "31536000",
        upsert: false,
        contentType: file.type,
      });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      onChange([...value, data.publicUrl]);
    } catch (e: any) {
      setError(e?.message ?? "آپلود ناموفق بود");
    } finally {
      setUploading(false);
    }
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    for (const f of Array.from(files)) await uploadFile(f);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="ms-2 h-4 w-4 animate-spin" /> : <Upload className="ms-2 h-4 w-4" />}
          {uploading ? "در حال آپلود…" : "آپلود تصویر"}
        </Button>
        <span className="text-xs text-muted-foreground">یا</span>
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <LinkIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              dir="ltr"
              placeholder="آدرس URL تصویر…"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="pe-10"
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              if (urlInput.trim()) {
                onChange([...value, urlInput.trim()]);
                setUrlInput("");
              }
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {error && <p className="mt-2 text-xs text-red-300">{error}</p>}

      {value.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {value.map((img, i) => (
            <div key={i} className="group relative overflow-hidden rounded-lg border border-border bg-accent/50">
              <img src={img} alt="" className="aspect-square w-full object-cover" />
              <button
                type="button"
                onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                className="absolute top-1 right-1 grid h-7 w-7 place-items-center rounded-full bg-red-500/80 text-white opacity-0 transition group-hover:opacity-100"
                aria-label="حذف"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="mt-3 text-xs text-muted-foreground">
        تصاویر در فضای ابری ذخیره می‌شوند. اگر تصاویر بعد از آپلود نمایش داده نشدند، نیاز است در تنظیمات کارگاه (Privacy & Security) امکان «Public Buckets» فعال شود.
      </p>
    </div>
  );
}
