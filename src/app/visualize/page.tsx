
"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Sparkles, Upload, RotateCcw, Download, ShoppingBag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { giftProductPhotoPreview } from "@/ai/flows/gift-product-photo-preview";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const PRODUCT_TYPES = [
  { id: "mug", name: "Ceramic Mug", template: "gift-mug" },
  { id: "tshirt", name: "T-Shirt", template: "gift-tshirt" },
  { id: "canvas", name: "Canvas Print", template: "gift-canvas" },
];

export default function VisualizePage() {
  const searchParams = useSearchParams();
  const [selectedProduct, setSelectedProduct] = useState(searchParams.get("product") || "mug");
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [previewResult, setPreviewResult] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentProduct = PRODUCT_TYPES.find(p => p.id === selectedProduct) || PRODUCT_TYPES[0];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "File too large", description: "Please upload an image smaller than 5MB.", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserPhoto(reader.result as string);
        setPreviewResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVisualize = async () => {
    if (!userPhoto) {
      toast({ title: "No photo uploaded", description: "Please upload a photo to visualize.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const templateImg = PlaceHolderImages.find(img => img.id === `gift-${currentProduct.id}`)?.imageUrl || "";
      
      // We need to fetch the template image and convert it to data URI if it's a URL
      // For this demo, we assume the placeholder images are reachable and compatible.
      // In a real app, you might use a local asset or a pre-converted data URI.
      
      const response = await giftProductPhotoPreview({
        userPhotoDataUri: userPhoto,
        productTemplateDataUri: templateImg, // Ideally this should be a data URI
        productType: currentProduct.name
      });

      setPreviewResult(response.previewPhotoDataUri);
      toast({ title: "Preview Generated!", description: "Your personalized gift is ready to view." });
    } catch (error) {
      console.error(error);
      toast({ title: "Generation failed", description: "We couldn't generate your preview. Please try again.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-background py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-headline font-bold mb-4 flex items-center justify-center gap-3">
            <Sparkles className="text-primary" /> AI Personalization Tool
          </h1>
          <p className="text-lg text-muted-foreground">See your memories come to life on our high-quality products before you buy.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Controls */}
          <Card className="border-none shadow-xl bg-accent/20">
            <CardContent className="p-8 space-y-8">
              <div className="space-y-4">
                <Label className="text-lg font-bold">1. Select Product Type</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_TYPES.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label className="text-lg font-bold">2. Upload Your Photo</Label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-primary/20 rounded-2xl p-12 text-center cursor-pointer hover:bg-background/50 transition-colors group"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                  />
                  {userPhoto ? (
                    <div className="relative w-32 h-32 mx-auto rounded-xl overflow-hidden shadow-lg border-2 border-white">
                      <Image src={userPhoto} alt="User photo" fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                        <Upload className="text-primary w-8 h-8" />
                      </div>
                      <p className="font-medium">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground">JPG, PNG up to 5MB</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 space-y-4">
                <Button 
                  onClick={handleVisualize} 
                  disabled={!userPhoto || isGenerating} 
                  className="w-full h-14 rounded-full text-lg font-bold shadow-lg"
                >
                  {isGenerating ? (
                    <>Generating... <Loader2 className="ml-2 w-5 h-5 animate-spin" /></>
                  ) : (
                    <>Visualize Now <Sparkles className="ml-2 w-5 h-5" /></>
                  )}
                </Button>
                {previewResult && (
                  <Button variant="ghost" className="w-full rounded-full" onClick={() => { setPreviewResult(null); setUserPhoto(null); }}>
                    <RotateCcw className="mr-2 w-4 h-4" /> Start Over
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Preview Window */}
          <div className="space-y-6">
            <h3 className="text-2xl font-headline font-bold">Preview Window</h3>
            <div className="relative aspect-square bg-accent/10 rounded-[2rem] overflow-hidden shadow-inner flex items-center justify-center border-4 border-white/40">
              {isGenerating ? (
                <div className="text-center space-y-4">
                  <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
                  <p className="font-medium animate-pulse">Designing your {currentProduct.name}...</p>
                </div>
              ) : previewResult ? (
                <Image src={previewResult} alt="Visualizer output" fill className="object-cover animate-in fade-in zoom-in-95 duration-500" />
              ) : userPhoto ? (
                <div className="text-center p-8 space-y-4">
                  <p className="text-muted-foreground italic">Ready to see your photo on the {currentProduct.name}?</p>
                  <p className="text-xs">Click "Visualize Now" to use AI layout technology.</p>
                </div>
              ) : (
                <div className="text-center p-12 text-muted-foreground">
                  <p className="text-lg">No image to preview yet.</p>
                  <p className="text-sm mt-2">Upload a photo to see the magic happen.</p>
                </div>
              )}
            </div>

            {previewResult && (
              <div className="flex gap-4 animate-in slide-in-from-bottom-4 duration-500">
                <Button variant="outline" className="flex-1 h-12 rounded-full border-primary text-primary hover:bg-primary hover:text-white">
                  <Download className="mr-2 w-4 h-4" /> Save Preview
                </Button>
                <Button className="flex-1 h-12 rounded-full shadow-md">
                  <ShoppingBag className="mr-2 w-4 h-4" /> Buy This Now
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
