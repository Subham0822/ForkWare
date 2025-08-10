# Gemini AI Setup Guide

This guide will help you set up Gemini AI integration for real-time analytics in your ForkWare application.

## Prerequisites

1. A Google Cloud account
2. Access to Gemini AI API

## Step 1: Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

## Step 2: Configure Environment Variables

Create a `.env.local` file in your project root with the following content:

```bash
# Gemini AI API Key
NEXT_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here

# Supabase Configuration (if not already configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**Important:** Replace `your_actual_api_key_here` with the API key you copied from Google AI Studio.

## Step 3: Restart Development Server

After adding the environment variables, restart your development server:

```bash
npm run dev
```

## How It Works

The analytics page now:

1. **Fetches real data** from your Supabase database (food listings)
2. **Uses Gemini AI** to analyze the data and calculate realistic metrics
3. **Provides dynamic analytics** including:
   - Total food saved (calculated from actual listings)
   - Pickup completion rates
   - Estimated meals served
   - Monthly trends
   - Growth rates

## Features

- **Real-time data**: Analytics update based on actual database content
- **AI-powered insights**: Gemini analyzes patterns and provides realistic estimates
- **Fallback system**: If Gemini fails, falls back to calculated analytics
- **Loading states**: Shows loading indicators while AI processes data
- **Error handling**: Graceful error handling with retry options

## Troubleshooting

### API Key Issues

- Ensure your API key is correct
- Check that the environment variable is properly set
- Verify the API key has access to Gemini AI

### Rate Limiting

- The free tier has rate limits
- If you hit limits, the system will fall back to calculated analytics

### Database Connection

- Ensure your Supabase connection is working
- Check that food_listings table exists and has data

## Security Notes

- The API key is exposed to the client (NEXT*PUBLIC* prefix)
- This is safe for Gemini AI as it's designed for client-side usage
- Never expose sensitive API keys (like Supabase service keys) to the client

## Cost Information

- Gemini 1.5 Flash (free tier) is used
- No additional costs beyond your existing Google Cloud usage
- Check [Google AI pricing](https://ai.google.dev/pricing) for current rates
