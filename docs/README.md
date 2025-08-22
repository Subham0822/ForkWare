# **App Name**: KindPlate

## Core Features:

- Role-Based Landing: Landing page with clear CTAs for canteen/event and NGO/volunteer roles.
- Dashboard Segregation: Role-gated dashboards for canteens/events and NGOs/volunteers.
- Surplus Logging: Form to log surplus food with fields for name, quantity, expiry, location, and image upload.
- Available Food Listings: Real-time list of available food postings for NGOs/volunteers.
- Status Indicators: Status badges to indicate if food is available, picked up, or expired.

## 🚀 **NEW: AI-Powered Demand Prediction**

**Machine Learning-Powered Surplus Food Forecasting** - Predict surplus food in advance based on past events, canteen usage patterns, and AI analysis. This cutting-edge feature helps event organizers reduce food waste through intelligent planning and predictive analytics.

### Key AI Features:
- **Predictive Analytics**: Forecast surplus food generation for upcoming events
- **Multi-Factor Analysis**: Consider event type, attendance, seasonal factors, and historical patterns
- **Smart Recommendations**: AI-generated insights to reduce food waste
- **Risk Assessment**: Categorize predictions as low, medium, or high risk
- **Confidence Scoring**: Understand prediction reliability with confidence levels
- **Trend Analysis**: Track prediction accuracy and patterns over time

### Technology Stack:
- **Google Gemini AI**: Advanced language model for intelligent analysis
- **Machine Learning**: Historical data pattern recognition
- **Real-time Analytics**: Live prediction generation and updates
- **Interactive Dashboards**: Comprehensive visualization and insights

*Perfect for judges who love ML/AI implementations!* 🎯

## Environment Variables

Create `.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Gmail SMTP (App Password, not OAuth)
GMAIL_USER=your@gmail.com
GMAIL_APP_PASSWORD=your-app-password
# Optional overrides
EMAIL_FROM=notifications@yourdomain.com
EMAIL_FROM_NAME=ForkWare
```

## Nearby Email Notifications (PostGIS)

To notify users within a radius when a surplus listing is posted, enable PostGIS and add an RPC in Supabase.

Run the following in Supabase SQL editor (one-time):

```sql
-- 1) Enable PostGIS
create extension if not exists postgis;

-- 2) Coordinates on events and profiles (if not present)
alter table if exists public.events
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;

alter table if exists public.profiles
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;

-- 3) RPC to get profiles within radius (km)
create or replace function public.profiles_within_radius(
  center_lat double precision,
  center_lon double precision,
  radius_km double precision
)
returns table (
  id uuid,
  name text,
  email text,
  latitude double precision,
  longitude double precision,
  distance_km double precision
) as $$
  select p.id,
         p.name,
         p.email,
         p.latitude,
         p.longitude,
         ST_DistanceSphere(
           ST_MakePoint(center_lon, center_lat),
           ST_MakePoint(p.longitude, p.latitude)
         ) / 1000.0 as distance_km
  from public.profiles p
  where p.latitude is not null
    and p.longitude is not null
    and ST_DistanceSphere(
          ST_MakePoint(center_lon, center_lat),
          ST_MakePoint(p.longitude, p.latitude)
        ) <= radius_km * 1000.0;
$$ language sql stable;
```

When `POST /api/events/[id]/listings` creates a listing, the server asynchronously emails all profiles within 5 km of the event location.
