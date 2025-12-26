import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Image, Eye, Clock, Check, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { AuthModal } from "@/components/auth/AuthModal";

const categories = [
  "Politics",
  "Entertainment",
  "Economy",
  "Lifestyle",
  "Sports",
  "Technology",
];

const durations = [
  { value: "1", label: "1 Day" },
  { value: "3", label: "3 Days" },
  { value: "7", label: "7 Days" },
  { value: "0", label: "No Limit" },
];

export default function CreatePoll() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const { language } = useLanguage();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    question: "",
    category: "",
    duration: "3",
    isYesNo: false,
    options: ["", ""],
    image: null as File | null,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Show auth modal after loading if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setShowAuthModal(true);
    }
  }, [isLoading, isAuthenticated]);

  const handleAddOption = () => {
    if (formData.options.length < 6) {
      setFormData({ ...formData, options: [...formData.options, ""] });
    }
  };

  const handleRemoveOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData({ ...formData, options: newOptions });
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast({
      title: language === "pidgin" ? "Poll Don Ready! 🎉" : "Poll Created! 🎉",
      description: language === "pidgin" 
        ? "Your poll don dey live, people fit vote now."
        : "Your poll is now live and ready for votes.",
    });

    setIsSubmitting(false);
    navigate("/");
  };

  const displayOptions = formData.isYesNo ? ["Yes", "No"] : formData.options;

  // Show login prompt if not authenticated
  if (!isLoading && !isAuthenticated) {
    return (
      <>
        <div className="container py-10">
          <div className="max-w-md mx-auto text-center space-y-6">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <LogIn className="h-10 w-10 text-primary" />
            </div>
            <h1 className="font-poppins text-2xl sm:text-3xl font-bold text-foreground">
              {language === "pidgin" ? "Login to Create Poll" : "Login to Create a Poll"}
            </h1>
            <p className="text-muted-foreground">
              {language === "pidgin" 
                ? "You need to login first before you fit create poll. E quick o, no wahala!"
                : "You need to be logged in to create polls. It's quick and easy!"}
            </p>
            <Button 
              onClick={() => setShowAuthModal(true)}
              className="btn-touch gap-2"
              size="lg"
            >
              <LogIn className="h-5 w-5" />
              {language === "pidgin" ? "Login / Sign Up" : "Login / Sign Up"}
            </Button>
          </div>
        </div>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </>
    );
  }

  return (
    <>
      <div className="container py-6 sm:py-10">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 animate-fade-up">
            <h1 className="font-poppins text-2xl sm:text-3xl font-bold text-foreground">
              {language === "pidgin" ? "Create Poll" : "Create a Poll"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {language === "pidgin" 
                ? "Ask Naija wetin dem think about anything"
                : "Ask Naija what they think about anything"}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6 animate-fade-up delay-100">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  {language === "pidgin" ? "Poll Title" : "Poll Title"} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="E.g., Best Jollof Rice in Africa"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="h-12"
                  required
                />
              </div>

              {/* Question */}
              <div className="space-y-2">
                <Label htmlFor="question" className="text-sm font-medium">
                  {language === "pidgin" ? "Your Question" : "Your Question"} <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="question"
                  placeholder={language === "pidgin" ? "Wetin you wan ask?" : "What do you want to ask?"}
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="min-h-[100px] resize-none"
                  required
                />
              </div>

              {/* Question Type Toggle */}
              <div className="flex items-center justify-between p-4 bg-secondary rounded-xl">
                <div>
                  <Label className="text-sm font-medium">
                    {language === "pidgin" ? "Yes/No Question" : "Yes/No Question"}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {language === "pidgin" 
                      ? "Turn on for simple yes or no polls"
                      : "Toggle for simple yes or no polls"}
                  </p>
                </div>
                <Switch
                  checked={formData.isYesNo}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isYesNo: checked })
                  }
                />
              </div>

              {/* Options */}
              {!formData.isYesNo && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    {language === "pidgin" ? "Answer Options" : "Answer Options"} <span className="text-destructive">*</span>
                  </Label>
                  <div className="space-y-2">
                    {formData.options.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder={`Option ${index + 1}`}
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          className="h-12"
                          required
                        />
                        {formData.options.length > 2 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-12 w-12 shrink-0"
                            onClick={() => handleRemoveOption(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  {formData.options.length < 6 && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 gap-2 border-dashed"
                      onClick={handleAddOption}
                    >
                      <Plus className="h-4 w-4" />
                      {language === "pidgin" ? "Add Option" : "Add Option"}
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formData.options.length}/6 options
                  </p>
                </div>
              )}

              {/* Category & Duration */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {language === "pidgin" ? "Category" : "Category"} <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder={language === "pidgin" ? "Pick category" : "Select category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {language === "pidgin" ? "How Long" : "Duration"}
                  </Label>
                  <Select
                    value={formData.duration}
                    onValueChange={(value) =>
                      setFormData({ ...formData, duration: value })
                    }
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {durations.map((dur) => (
                        <SelectItem key={dur.value} value={dur.value}>
                          {dur.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {language === "pidgin" ? "Cover Image (Optional)" : "Cover Image (Optional)"}
                </Label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex items-center justify-center gap-2 h-12 px-4 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary hover:bg-secondary/50 transition-colors"
                  >
                    <Image className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {formData.image ? formData.image.name : (language === "pidgin" ? "Upload image" : "Upload an image")}
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full btn-touch text-base font-semibold gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    {language === "pidgin" ? "Dey publish..." : "Publishing..."}
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5" />
                    {language === "pidgin" ? "Publish Poll" : "Publish Poll"}
                  </>
                )}
              </Button>
            </form>

            {/* Preview */}
            <div className="animate-fade-up delay-200">
              <div className="sticky top-24">
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium text-muted-foreground">
                    {language === "pidgin" ? "Preview" : "Preview"}
                  </span>
                </div>

                <div className="bg-card rounded-xl border border-border p-5 space-y-4">
                  {imagePreview && (
                    <div className="aspect-video rounded-lg overflow-hidden bg-secondary">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    {formData.category && (
                      <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                        {formData.category}
                      </span>
                    )}
                    <h3 className="font-poppins font-bold text-lg text-foreground">
                      {formData.title || (language === "pidgin" ? "Your poll title" : "Your poll title")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {formData.question || (language === "pidgin" ? "Your question go show here" : "Your question will appear here")}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {displayOptions.map((option, index) => (
                      <div
                        key={index}
                        className="h-12 bg-secondary rounded-lg flex items-center px-4"
                      >
                        <span className="text-sm text-foreground">
                          {option || `Option ${index + 1}`}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {formData.duration === "0"
                        ? (language === "pidgin" ? "No time limit" : "No time limit")
                        : `${formData.duration} day${
                            formData.duration === "1" ? "" : "s"
                          } remaining`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
