# AI Demand Prediction Setup Guide

## 🚀 Quick Start

Get the AI-powered demand prediction feature running in 3 simple steps!

### Step 1: Environment Setup

Add your Gemini AI API key to your `.env.local` file:

```bash
# AI Configuration
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# Supabase (if not already configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Get Gemini API Key:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy and paste it into your `.env.local` file

### Step 2: Database Setup

Run the SQL script to create the required table:

```bash
# Option 1: Using Supabase Dashboard
# Copy and paste the contents of docs/sql/create-demand-predictions-table.sql

# Option 2: Using psql
psql -h your_host -U your_user -d your_db -f docs/sql/create-demand-predictions-table.sql
```

### Step 3: Seed Sample Data (Optional)

Populate your database with sample predictions:

```bash
node scripts/seed-demand-predictions.js
```

## 🎯 Test the Feature

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to Analytics:**
   - Go to `/analytics` in your browser
   - Click the **"AI Demand Prediction"** tab

3. **Generate Your First Prediction:**
   - Select an upcoming event from the dropdown
   - Click **"Generate Prediction"**
   - Watch the AI analyze your data!

## 🔧 Troubleshooting

### Common Issues:

**"Failed to generate prediction"**
- Check your Gemini API key is correct
- Verify your Supabase connection
- Ensure you have upcoming events in your database

**"No events found"**
- Run the event seeding script first:
  ```bash
  node scripts/seed-events.js
  ```

**"API key invalid"**
- Verify your Gemini API key at [Google AI Studio](https://makersuite.google.com/app/apikey)
- Check for typos in your `.env.local` file

### Performance Tips:

- **First prediction**: May take 10-15 seconds (AI model loading)
- **Subsequent predictions**: 5-8 seconds
- **Data updates**: Near-instantaneous

## 📊 What You'll See

### Overview Tab:
- Event selection dropdown
- Prediction generation button
- Recent predictions summary

### Detailed Analysis Tab:
- Surplus breakdown pie chart
- Prediction factors analysis
- AI-generated recommendations

### Trends Tab:
- Historical prediction trends
- Confidence vs. risk analysis
- Performance metrics

## 🎉 Success Indicators

✅ **Feature is working when you see:**
- AI prediction generation completes successfully
- Charts and visualizations render properly
- Recommendations appear for each prediction
- Risk levels and confidence scores display

## 🚀 Next Steps

Once the feature is working:

1. **Test with real events**: Create events with different characteristics
2. **Monitor accuracy**: Compare predictions with actual outcomes
3. **Customize factors**: Adjust prediction parameters based on your needs
4. **Scale up**: Use for multiple events and organizations

## 📞 Need Help?

- **Documentation**: Check `docs/AI_DEMAND_PREDICTION.md`
- **Issues**: Report bugs via GitHub
- **Questions**: Use GitHub discussions

---

**Happy Predicting! 🧠✨**
