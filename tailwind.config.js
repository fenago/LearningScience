module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./styles/globals.css",
  ],
  theme: {
    extend: {
      // LearningScience.ai Brand Identity Colors (Updated Specification)
      colors: {
        // Primary Colors
        primary: {
          blue: '#3B82F6', // rgb(59, 130, 246) - trust, intelligence, education
          purple: '#8B5CF6', // rgb(139, 92, 246) - creativity, innovation
          green: '#10B981', // rgb(16, 185, 129) - growth, success
        },
        // Neutral Colors
        neutral: {
          dark: '#1F2937', // rgb(31, 41, 55) - primary text
          medium: '#6B7280', // rgb(107, 114, 128) - secondary text
          light: '#F3F4F6', // rgb(243, 244, 246) - backgrounds
          white: '#FFFFFF', // contrast and clean spaces
        },
        // Semantic Color Aliases for easy usage
        'brand-blue': '#3B82F6',
        'brand-purple': '#8B5CF6',
        'brand-green': '#10B981',
        'text-primary': '#1F2937',
        'text-secondary': '#6B7280',
        'bg-light': '#F3F4F6',
        'bg-white': '#FFFFFF',
      },
      // LearningScience.ai Typography System
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'sans': ['Inter', 'sans-serif'], // Override default sans with Inter
      },
      fontSize: {
        // Heading Sizes (exact specification)
        'h1': ['3.5rem', { lineHeight: '1.1', fontWeight: '700' }], // 56px / bold
        'h2': ['2.5rem', { lineHeight: '1.2', fontWeight: '700' }], // 40px / bold
        'h3': ['1.875rem', { lineHeight: '1.3', fontWeight: '600' }], // 30px / semibold
        'h4': ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }], // 24px / semibold
        // Body Text Sizes
        'body-lg': ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }], // 18px / regular for main content
        'body-md': ['1rem', { lineHeight: '1.6', fontWeight: '400' }], // 16px / regular for secondary content
        'body-lg-medium': ['1.125rem', { lineHeight: '1.6', fontWeight: '500' }], // 18px / medium for emphasis
        'body-md-medium': ['1rem', { lineHeight: '1.6', fontWeight: '500' }], // 16px / medium for emphasis
      },
      fontWeight: {
        'regular': '400',
        'medium': '500',
        'semibold': '600',
        'bold': '700',
      },
      backgroundImage: {
        // Brand Gradients
        'brand-gradient': 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #3B82F6 100%)',
        'cta-gradient': 'linear-gradient(to bottom right, #3B82F6, #8B5CF6)',
        'hero-gradient': 'linear-gradient(135deg, #F3F4F6 0%, #FFFFFF 100%)',
        // Legacy gradients (for backwards compatibility)
        gradient: "linear-gradient(60deg, #f79533, #f37055, #ef4e7b, #a166ab, #5073b8, #1098ad, #07b39b, #6fba82)",
        'learning-gradient': 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #3B82F6 100%)',
      },
      animation: {
        opacity: "opacity 0.25s ease-in-out",
        appearFromRight: "appearFromRight 300ms ease-in-out",
        wiggle: "wiggle 1.5s ease-in-out infinite",
        popup: "popup 0.25s ease-in-out",
        shimmer: "shimmer 3s ease-out infinite alternate",
        // Magic UI Animations
        'fade-in': 'fade-in 0.8s ease-out forwards',
        'slide-in': 'slide-in 0.6s ease-out forwards',
        'gradient-x': 'gradient-x 15s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'marquee': 'marquee 40s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'dot-pulse': 'dotPulse 6s ease-in-out infinite',
      },
      keyframes: {
        opacity: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        appearFromRight: {
          "0%": { opacity: 0.3, transform: "translate(15%, 0px);" },
          "100%": { opacity: 1, transform: "translate(0);" },
        },
        wiggle: {
          "0%, 20%, 80%, 100%": {
            transform: "rotate(0deg)",
          },
          "30%, 60%": {
            transform: "rotate(-2deg)",
          },
          "40%, 70%": {
            transform: "rotate(2deg)",
          },
          "45%": {
            transform: "rotate(-4deg)",
          },
          "55%": {
            transform: "rotate(4deg)",
          },
        },
        popup: {
          "0%": { transform: "scale(0.8)", opacity: 0.8 },
          "50%": { transform: "scale(1.1)", opacity: 1 },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
        shimmer: {
          "0%": { backgroundPosition: "0 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'marquee': {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'dotPulse': {
          '0%, 100%': { 
            opacity: '0.1', 
            transform: 'scale(1)',
          },
          '50%': { 
            opacity: '0.3', 
            transform: 'scale(1.02)',
          },
        },
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    // Light & dark themes are added by default (it switches automatically based on OS settings)
    // You can add another theme among the list of 30+
    // Add "data-theme='theme_name" to any HTML tag to enable the 'theme_name' theme.
    // https://daisyui.com/
    themes: ["light", "dark"],
  },
};
