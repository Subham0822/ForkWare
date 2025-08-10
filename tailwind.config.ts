import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        headline: ['Poppins', 'sans-serif'],
        code: ['monospace'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'fade-in-up': {
            '0%': {
                opacity: '0',
                transform: 'translateY(20px)',
            },
            '100%': {
                opacity: '1',
                transform: 'translateY(0)',
            },
        },
        'fade-in-down': {
            '0%': {
                opacity: '0',
                transform: 'translateY(-20px)',
            },
            '100%': {
                opacity: '1',
                transform: 'translateY(0)',
            },
        },
        'fade-in-left': {
            '0%': {
                opacity: '0',
                transform: 'translateX(-20px)',
            },
            '100%': {
                opacity: '1',
                transform: 'translateX(0)',
            },
        },
        'fade-in-right': {
            '0%': {
                opacity: '0',
                transform: 'translateX(20px)',
            },
            '100%': {
                opacity: '1',
                transform: 'translateX(0)',
            },
        },
        'slide-in-from-top': {
            '0%': {
                transform: 'translateY(-100%)',
            },
            '100%': {
                transform: 'translateY(0)',
            },
        },
        'slide-in-from-bottom': {
            '0%': {
                transform: 'translateY(100%)',
            },
            '100%': {
                transform: 'translateY(0)',
            },
        },
        'scale-in': {
            '0%': {
                opacity: '0',
                transform: 'scale(0.9)',
            },
            '100%': {
                opacity: '1',
                transform: 'scale(1)',
            },
        },
        'bounce-in': {
            '0%': {
                opacity: '0',
                transform: 'scale(0.3)',
            },
            '50%': {
                opacity: '1',
                transform: 'scale(1.05)',
            },
            '70%': {
                transform: 'scale(0.9)',
            },
            '100%': {
                opacity: '1',
                transform: 'scale(1)',
            },
        },
        'float': {
            '0%, 100%': {
                transform: 'translateY(0px)',
            },
            '50%': {
                transform: 'translateY(-10px)',
            },
        },
        'glow': {
            '0%, 100%': {
                boxShadow: '0 0 20px rgba(var(--primary), 0.3)',
            },
            '50%': {
                boxShadow: '0 0 30px rgba(var(--primary), 0.6)',
            },
        },
        'shimmer': {
            '0%': {
                backgroundPosition: '-200% 0',
            },
            '100%': {
                backgroundPosition: '200% 0',
            },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'fade-in-down': 'fade-in-down 0.6s ease-out forwards',
        'fade-in-left': 'fade-in-left 0.6s ease-out forwards',
        'fade-in-right': 'fade-in-right 0.6s ease-out forwards',
        'slide-in-from-top': 'slide-in-from-top 0.5s ease-out forwards',
        'slide-in-from-bottom': 'slide-in-from-bottom 0.5s ease-out forwards',
        'scale-in': 'scale-in 0.3s ease-out forwards',
        'bounce-in': 'bounce-in 0.6s ease-out forwards',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(var(--primary), 0.3)',
        'glow-lg': '0 0 40px rgba(var(--primary), 0.4)',
        'glow-accent': '0 0 20px rgba(var(--accent), 0.3)',
        'glow-accent-lg': '0 0 40px rgba(var(--accent), 0.4)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-accent': 'var(--gradient-accent)',
        'gradient-card': 'var(--gradient-card)',
        'shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
