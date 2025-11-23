import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Loader2, Check, AlertCircle } from "lucide-react";
import { TimelineEntryData } from "./TimelineEntry";
import { cn } from "@/lib/utils";

interface ImportDialogProps {
    onImport: (entries: Omit<TimelineEntryData, "id">[]) => void;
    buttonClassName?: string;
    triggerContent?: React.ReactNode;
}

export function ImportDialog({ onImport, buttonClassName, triggerContent }: ImportDialogProps) {
    const [open, setOpen] = useState(false);
    const [text, setText] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewEntries, setPreviewEntries] = useState<Omit<TimelineEntryData, "id">[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleProcess = async () => {
        if (!text && !file) {
            setError("Please provide text or upload a file.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            if (text) formData.append("text", text);
            if (file) formData.append("file", file);

            // We'll use JSON body for simplicity if only text, but for file we need base64 or formData
            // Let's stick to JSON with base64 for the file to keep it simple with the existing express setup

            let body: any = { text };

            if (file) {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                await new Promise((resolve) => {
                    reader.onload = () => {
                        body.image = reader.result; // This is the data URL
                        resolve(null);
                    };
                });
            }

            const response = await fetch("/api/import", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                throw new Error(`Import failed: ${response.statusText}`);
            }

            const data = await response.json();
            if (data.entries && Array.isArray(data.entries)) {
                setPreviewEntries(data.entries);
            } else {
                throw new Error("Invalid response format");
            }
        } catch (e: any) {
            console.error("Import error:", e);
            setError(e.message || "Failed to process import.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirm = () => {
        onImport(previewEntries);
        setOpen(false);
        // Reset state
        setText("");
        setFile(null);
        setPreviewEntries([]);
        setError(null);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className={buttonClassName}>
                    {triggerContent || (
                        <>
                            <Upload className="mr-2 h-4 w-4" />
                            Import
                        </>
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Import Data</DialogTitle>
                    <DialogDescription>
                        Paste text or upload an image (e.g., prescription, lab result) to automatically create entries.
                    </DialogDescription>
                </DialogHeader>

                {!previewEntries.length ? (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Paste Text</Label>
                            <Textarea
                                placeholder="Paste doctor's notes or email content here..."
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                rows={5}
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Or upload image</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Upload Image</Label>
                            <div
                                className={cn(
                                    "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition",
                                    file ? "border-emerald-500 bg-emerald-50/50" : "border-slate-200"
                                )}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*,.pdf"
                                    onChange={handleFileChange}
                                />
                                {file ? (
                                    <div className="flex items-center gap-2 text-emerald-600">
                                        <FileText className="h-6 w-6" />
                                        <span className="font-medium">{file.name}</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-1 text-slate-500">
                                        <Upload className="h-8 w-8 mb-2" />
                                        <span className="text-sm font-medium">Click to upload</span>
                                        <span className="text-xs text-slate-400">JPG, PNG, PDF supported</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-rose-500 text-sm bg-rose-50 p-3 rounded-md">
                                <AlertCircle className="h-4 w-4" />
                                {error}
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button onClick={handleProcess} disabled={isLoading || (!text && !file)}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    "Process with AI"
                                )}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium text-slate-900">Found {previewEntries.length} entries</h3>
                            <Button variant="ghost" size="sm" onClick={() => setPreviewEntries([])}>Back</Button>
                        </div>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                            {previewEntries.map((entry, i) => (
                                <div key={i} className="p-3 border rounded-lg bg-slate-50 space-y-1">
                                    <div className="flex justify-between items-start">
                                        <span className="font-semibold text-sm">{entry.title}</span>
                                        <span className="text-xs bg-white px-2 py-1 rounded border capitalize">{entry.type}</span>
                                    </div>
                                    <p className="text-xs text-slate-500">{entry.description}</p>
                                    <div className="flex gap-3 text-xs text-slate-400 mt-2">
                                        <span>{entry.date} at {entry.time}</span>
                                        {entry.provider && <span>• {entry.provider}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setPreviewEntries([])}>Cancel</Button>
                            <Button onClick={handleConfirm} className="bg-emerald-600 hover:bg-emerald-700">
                                <Check className="mr-2 h-4 w-4" />
                                Add All Entries
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
