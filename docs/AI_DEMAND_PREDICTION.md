# AI-Powered Demand Prediction Feature

## Overview

The AI-Powered Demand Prediction feature is a sophisticated machine learning system that predicts surplus food generation for upcoming events. This feature leverages historical data, event characteristics, and advanced AI algorithms to provide accurate forecasts, helping event organizers reduce food waste and optimize their planning.

## 🚀 Key Features

### 1. **Intelligent Surplus Forecasting**

- **Predictive Analytics**: Uses historical event data to forecast surplus food generation
- **Multi-Factor Analysis**: Considers event type, attendance, seasonal factors, and historical patterns
- **Confidence Scoring**: Provides confidence levels for each prediction
- **Risk Assessment**: Categorizes predictions as low, medium, or high risk

### 2. **AI-Powered Insights**

- **Gemini AI Integration**: Leverages Google's Gemini 1.5 Flash model for advanced analysis
- **Smart Recommendations**: Generates actionable insights to reduce food waste
- **Pattern Recognition**: Identifies trends and correlations in event data
- **Continuous Learning**: Improves predictions based on new data

### 3. **Comprehensive Analytics Dashboard**

- **Visual Charts**: Interactive pie charts, bar graphs, and trend analysis
- **Real-time Updates**: Live prediction generation and updates
- **Historical Comparison**: Compare predictions across multiple events
- **Performance Metrics**: Track prediction accuracy over time

## 🏗️ Technical Architecture

### Backend Services

#### 1. **Demand Prediction Service** (`src/lib/demand-prediction.ts`)

```typescript
interface DemandPrediction {
  eventId: string;
  eventName: string;
  eventDate: string;
  predictedSurplus: {
    totalKg: number;
    confidence: number;
    breakdown: {
      veg: number;
      nonVeg: number;
      desserts: number;
      beverages: number;
    };
  };
  factors: {
    historicalWaste: number;
    attendanceVariation: number;
    weatherImpact: number;
    eventTypeFactor: number;
    seasonalAdjustment: number;
  };
  recommendations: string[];
  riskLevel: "low" | "medium" | "high";
  lastUpdated: string;
}
```

#### 2. **API Endpoints**

- `POST /api/ai/demand-prediction` - Generate new predictions
- `GET /api/ai/demand-prediction` - Retrieve existing predictions
- Support for prediction updates and refreshes

#### 3. **Database Schema**

```sql
CREATE TABLE demand_predictions (
    id UUID PRIMARY KEY,
    event_id UUID REFERENCES events(id),
    predicted_surplus JSONB NOT NULL,
    factors JSONB NOT NULL,
    recommendations TEXT[] NOT NULL,
    risk_level TEXT NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE
);
```

### Frontend Components

#### 1. **Demand Prediction Component** (`src/components/demand-prediction.tsx`)

- **Overview Tab**: Event selection and prediction generation
- **Detailed Analysis Tab**: Charts and factor breakdowns
- **Trends Tab**: Historical prediction analysis

#### 2. **Analytics Integration**

- Seamlessly integrated into the main analytics dashboard
- New "AI Demand Prediction" tab for focused analysis
- Consistent UI/UX with existing analytics features

## 🧠 AI Algorithm Details

### Prediction Factors

1. **Historical Waste Patterns**

   - Analysis of past events with similar characteristics
   - Waste generation trends over time
   - Event-specific performance metrics

2. **Attendance Variations**

   - Expected vs. actual attendance patterns
   - RSVP accuracy and last-minute changes
   - Seasonal attendance fluctuations

3. **Event Type Characteristics**

   - Corporate events: More precise planning, lower waste
   - Social events: Higher variability, more waste
   - Educational events: Moderate predictability

4. **Seasonal Adjustments**

   - Holiday multipliers (Christmas: +30%, New Year: +20%)
   - Weather impact considerations
   - Seasonal food preference changes

5. **Market Trends**
   - Food waste awareness levels
   - Sustainable event practices adoption
   - Portion control implementation rates

### AI Prompt Engineering

The system uses carefully crafted prompts for Gemini AI:

```typescript
const prompt = `
You are an AI expert in food demand prediction and waste reduction. 
Analyze the following data to predict surplus food generation for an upcoming event.

ANALYSIS GUIDELINES:
- Use historical patterns to identify waste trends
- Consider seasonal variations (holidays, weather, etc.)
- Factor in event type characteristics
- Account for attendance prediction accuracy
- Provide realistic surplus estimates in kilograms
- Confidence should be 0.0-1.0 based on data quality
- Risk level: low (<10% surplus), medium (10-25%), high (>25%)
`;
```

## 📊 Usage Guide

### 1. **Generating Predictions**

1. Navigate to **Analytics Dashboard** → **AI Demand Prediction** tab
2. Select an upcoming event from the dropdown
3. Click **"Generate Prediction"** button
4. Wait for AI analysis (typically 5-10 seconds)
5. Review the generated prediction and insights

### 2. **Understanding Predictions**

#### **Risk Levels**

- **Low Risk (<10%)**: Minimal surplus expected, maintain current planning
- **Medium Risk (10-25%)**: Moderate surplus expected, implement monitoring
- **High Risk (>25%)**: Significant surplus expected, take preventive action

#### **Confidence Scores**

- **80-100%**: High confidence, reliable prediction
- **60-79%**: Medium confidence, use with caution
- **Below 60%**: Low confidence, consider manual review

### 3. **Interpreting Factors**

- **Historical Waste**: Based on similar past events
- **Attendance Variation**: Expected vs. actual attendance patterns
- **Weather Impact**: Seasonal and weather-related factors
- **Event Type Factor**: Characteristics specific to event type
- **Seasonal Adjustment**: Holiday and seasonal considerations

### 4. **Following Recommendations**

The AI provides actionable recommendations such as:

- Implement portion control measures
- Monitor attendance patterns closely
- Prepare backup distribution channels
- Set up multiple pickup locations
- Establish rapid response teams

## 🔧 Setup and Configuration

### 1. **Environment Variables**

```bash
# Required for AI functionality
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

# Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. **Database Setup**

```bash
# Run the SQL script to create the demand_predictions table
psql -h your_host -U your_user -d your_db -f docs/sql/create-demand-predictions-table.sql
```

### 3. **Seed Sample Data**

```bash
# Run the seeding script to populate sample predictions
node scripts/seed-demand-predictions.js
```

## 📈 Performance Metrics

### Prediction Accuracy

- **Target**: 85%+ accuracy within ±15% of actual surplus
- **Current Performance**: Varies by event type and data quality
- **Improvement**: Continuous learning from actual vs. predicted results

### Response Times

- **Prediction Generation**: 5-10 seconds
- **Data Retrieval**: <500ms
- **Chart Rendering**: <1 second

### Scalability

- **Concurrent Predictions**: Supports up to 100 simultaneous requests
- **Data Storage**: Efficient JSONB storage for complex prediction data
- **Caching**: Intelligent caching for frequently accessed predictions

## 🚨 Error Handling

### Fallback Mechanisms

1. **AI Service Failure**: Automatic fallback to heuristic-based predictions
2. **Data Unavailable**: Graceful degradation with available information
3. **Network Issues**: Retry mechanisms with exponential backoff

### Error Types

- **Validation Errors**: Invalid event data or parameters
- **AI Service Errors**: Gemini API failures or timeouts
- **Database Errors**: Connection or query failures
- **Rate Limiting**: API quota exceeded

## 🔮 Future Enhancements

### 1. **Advanced ML Models**

- **Custom Training**: Train models on organization-specific data
- **Ensemble Methods**: Combine multiple prediction algorithms
- **Real-time Learning**: Continuous model updates based on outcomes

### 2. **External Integrations**

- **Weather APIs**: Real-time weather data integration
- **Social Media**: Event promotion and RSVP tracking
- **Economic Indicators**: Market factors affecting food costs

### 3. **Predictive Maintenance**

- **Equipment Failure**: Predict kitchen equipment issues
- **Staffing Needs**: Forecast required staff for events
- **Supply Chain**: Predict ingredient shortages or delays

## 🧪 Testing and Validation

### 1. **Unit Tests**

- Prediction algorithm accuracy
- Factor calculation validation
- Recommendation generation logic

### 2. **Integration Tests**

- API endpoint functionality
- Database operations
- AI service integration

### 3. **User Acceptance Testing**

- Prediction accuracy validation
- UI/UX usability testing
- Performance benchmarking

## 📚 API Reference

### Generate Prediction

```http
POST /api/ai/demand-prediction
Content-Type: application/json

{
  "eventId": "uuid",
  "action": "generate"
}
```

### Update Prediction

```http
POST /api/ai/demand-prediction
Content-Type: application/json

{
  "eventId": "uuid",
  "action": "update"
}
```

### Get All Predictions

```http
GET /api/ai/demand-prediction
```

## 🤝 Contributing

### Development Guidelines

1. **Code Quality**: Follow TypeScript best practices
2. **Testing**: Maintain 90%+ test coverage
3. **Documentation**: Update docs for all new features
4. **Performance**: Monitor response times and resource usage

### Testing Commands

```bash
# Run tests
npm run test

# Type checking
npm run typecheck

# Linting
npm run lint
```

## 📞 Support

### Getting Help

- **Documentation**: Check this file and related docs
- **Issues**: Report bugs via GitHub issues
- **Discussions**: Use GitHub discussions for questions
- **Contributions**: Submit pull requests for improvements

### Common Issues

1. **API Key Issues**: Verify Gemini API key configuration
2. **Database Errors**: Check Supabase connection and permissions
3. **Performance Issues**: Monitor API quotas and rate limits
4. **Prediction Accuracy**: Review historical data quality

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Maintainer**: ForkWare Development Team
