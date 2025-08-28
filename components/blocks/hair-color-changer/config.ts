import type { HairColorChanger } from '@/types/blocks/hair-color-changer';

export const defaultHairColorChangerConfig: HairColorChanger = {
  name: "hair-color-changer",
  title: "AI Hair Color Changer",
  description: "Transform your look instantly with our AI-powered hair color changer. Try on any hair color virtually - no commitment, just pure fun!",
  
  uploadSection: {
    title: "Upload Your Photo",
    description: "Choose a clear photo where your hair is visible for the best results",
    uploadButton: {
      title: "Upload Image"
    },
    mobileButton: {
      title: "Upload From Mobile"
    },
    dragText: "Drag and drop your image here",
    supportedFormats: "Supports JPG, PNG, WEBP (Max 10MB)"
  },

  colorSelection: {
    title: "Choose Your Dream Hair Color",
    description: "Select from natural tones or bold fashion colors - experiment with different looks!",
    defaultColor: "natural_brown",
    allowCustomColor: false
  },

  comparisonSection: {
    title: "Your Transformation",
    beforeLabel: "Before", 
    afterLabel: "After",
    showCircularMask: false,
    maskSize: 200
  },

  resultSection: {
    title: "Amazing Results!",
    downloadButton: {
      title: "Download Result"
    },
    shareButton: {
      title: "Share Result"
    },
    retryButton: {
      title: "Try Another Color"
    },
    processingMessage: {
      title: "Creating Your New Look...",
      description: "Our AI is carefully analyzing your hair and applying the perfect color"
    },
    completedMessage: {
      title: "Stunning Transformation!",
      description: "Your new hair color looks absolutely amazing! Download or try another color."
    },
    failedMessage: {
      title: "Oops! Something went wrong",
      description: "Please try again with a different photo or check your internet connection"
    }
  },

  progressTexts: {
    uploading: "Uploading your beautiful photo...",
    processing: "AI is analyzing your hair...",
    analyzing: "Detecting hair structure...",
    applying: "Applying your chosen color...",
    finalizing: "Adding the finishing touches...",
    completed: "Perfect!",
    failed: "Error occurred"
  },

  processingConfig: {
    defaultDuration: 30000, // 30 seconds
    maxWaitTime: 120000,    // 2 minutes  
    pollingInterval: 5000,  // 5 seconds
    maxPollingAttempts: 24, // Max 24 attempts (2 minutes total)
    sseTimeout: 30000      // 30 seconds SSE timeout
  },

  supportedFormats: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  maxFileSize: 10 * 1024 * 1024, // 10MB

  features: {
    title: "Why Choose Our Hair Color Changer?",
    description: "Experience the most advanced virtual hair coloring technology",
    items: [
      {
        title: "Realistic Results",
        description: "AI-powered technology that creates incredibly natural-looking color applications",
        icon: "RiMagicLine"
      },
      {
        title: "Instant Preview", 
        description: "See your new hair color in seconds, not hours at a salon",
        icon: "RiTimeLine"
      },
      {
        title: "Risk-Free Experimentation",
        description: "Try unlimited colors without any damage to your actual hair",
        icon: "RiHeartLine"
      },
      {
        title: "Works for Everyone",
        description: "Compatible with all hair types, lengths, and styles",
        icon: "RiGroupLine"
      }
    ]
  },

  faq: {
    title: "Frequently Asked Questions", 
    description: "Everything you need to know about our hair color changer",
    items: [
      {
        title: "How realistic are the results?",
        description: "Our AI uses advanced computer vision to analyze your hair texture, lighting, and style, creating incredibly realistic color applications that look natural."
      },
      {
        title: "What types of photos work best?",
        description: "Use clear, well-lit photos where your hair is fully visible. Natural lighting works best, and avoid heavily filtered images for optimal results."
      },
      {
        title: "Is my photo safe and private?",
        description: "Absolutely! Your photos are processed securely and are not stored permanently on our servers. Your privacy is our top priority."
      },
      {
        title: "Can I try multiple colors?",
        description: "Yes! Try as many colors as you want. Experiment with natural tones, bold fashion colors, or anything in between - it's all free!"
      }
    ]
  }
};

// Export named config for easy importing
export { defaultHairColorChangerConfig as hairColorChangerConfig };