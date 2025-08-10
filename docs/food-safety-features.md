# Food Safety Tagging System

## Overview

The Food Safety Tagging system provides comprehensive tracking and management of food safety information for all food listings in ForkWare. This system helps ensure food quality, compliance with safety standards, and provides transparency to users about the safety of available food items.

## Features

### 1. Safety Rating System

- **5-Point Scale**: Ratings from 1 (Unsafe) to 5 (Excellent)
- **Visual Indicators**: Color-coded badges with appropriate icons
- **Automatic Alerts**: Low safety ratings (≤2) trigger warning banners

### 2. Temperature Monitoring

- **Temperature Input**: Celsius-based temperature tracking
- **Visual Indicators**:
  - 🔥 Red for hot foods (>60°C)
  - ❄️ Blue for cold foods (<5°C)
  - 🌡️ Green for safe temperature ranges
- **Safety Guidelines**: Clear indicators for safe temperature ranges

### 3. Allergen Management

- **Common Allergens**: Pre-defined list of 14 common allergens
- **Custom Allergens**: Ability to add custom allergen information
- **Visual Warnings**: Orange badges with warning icons for allergens
- **Easy Management**: Click-to-add/remove allergen system

### 4. Preparation Method Tracking

- **Standardized Options**: Fresh, Cooked, Baked, Fried, Steamed, Grilled, Packaged, Other
- **Quality Indicators**: Helps users understand food preparation standards

### 5. Storage Conditions

- **Free Text Input**: Detailed storage requirements and conditions
- **Best Practices**: Guidelines for proper food storage

### 6. Inspection Tracking

- **Last Inspection Timestamp**: Tracks when food was last inspected
- **Automatic Reminders**: Alerts for items needing inspection
- **Compliance Monitoring**: Ensures regular safety checks

## Database Schema

### New Fields Added to `food_listings` Table

```sql
ALTER TABLE food_listings
ADD COLUMN temperature VARCHAR(10),
ADD COLUMN allergens TEXT[],
ADD COLUMN preparation_method VARCHAR(50),
ADD COLUMN safety_rating INTEGER CHECK (safety_rating >= 1 AND safety_rating <= 5),
ADD COLUMN storage_conditions TEXT,
ADD COLUMN last_inspection TIMESTAMP WITH TIME ZONE;
```

### Indexes for Performance

- `idx_food_listings_safety_rating`: Efficient safety rating filtering
- `idx_food_listings_allergens`: Fast allergen-based searches
- `idx_food_listings_last_inspection`: Inspection schedule tracking

## User Interface

### 1. Add/Edit Food Listing Form

- **Safety Section**: Dedicated section for safety information
- **Intuitive Input**: User-friendly forms with clear labels
- **Validation**: Input validation and helpful hints

### 2. Food Listings Table

- **Safety Column**: Dedicated column showing safety information
- **Compact Display**: Safety tags show key information at a glance
- **Detailed View**: Expandable safety details for comprehensive information

### 3. Safety Dashboard

- **Safety Rating Card**: Average safety rating across all listings
- **Safety Alerts**: Warning banners for low safety items
- **Inspection Reminders**: Notifications for items needing inspection

### 4. Filtering and Search

- **Safety Rating Filter**: Filter by specific safety ratings
- **Allergen Awareness**: Easy identification of allergen-containing foods
- **Temperature Monitoring**: Track temperature-sensitive items

## Safety Guidelines

### Temperature Safety

- **Cold Foods**: 0-5°C (refrigerated)
- **Hot Foods**: 60°C+ (properly heated)
- **Danger Zone**: 5-60°C (avoid for extended periods)

### Safety Rating Guidelines

- **5 (Excellent)**: Perfect condition, recently prepared, optimal storage
- **4 (Good)**: Good condition, properly stored, within safe timeframe
- **3 (Fair)**: Acceptable condition, may need attention soon
- **2 (Poor)**: Concerning condition, requires immediate attention
- **1 (Unsafe)**: Unsafe for consumption, should be removed

### Allergen Management

- **Common Allergens**: Peanuts, Tree Nuts, Milk, Eggs, Soy, Wheat, Fish, Shellfish, Gluten, Lactose, Sulfites, Mustard, Celery, Sesame
- **Custom Allergens**: Add specific allergens not in the standard list
- **Clear Labeling**: All allergens prominently displayed

## Implementation Details

### Components

- `FoodSafetyTags`: Displays safety information in compact format
- `FoodSafetyForm`: Input form for safety data
- `FoodSafetyAlert`: Warning system for safety issues

### State Management

- **Local State**: Form data managed in component state
- **Context Integration**: Safety data integrated with existing food listings context
- **Real-time Updates**: Immediate feedback and validation

### Data Flow

1. User inputs safety information in the form
2. Data is validated and formatted
3. Safety data is saved with food listing
4. Safety information is displayed in listings table
5. Safety alerts and reminders are generated automatically

## Best Practices

### For Food Providers

- **Regular Inspections**: Update inspection timestamps regularly
- **Accurate Ratings**: Provide honest and accurate safety assessments
- **Temperature Monitoring**: Monitor and record temperatures accurately
- **Allergen Disclosure**: Always disclose all allergens present

### For Users

- **Check Safety Ratings**: Review safety information before pickup
- **Allergen Awareness**: Check allergen information carefully
- **Temperature Sensitivity**: Consider temperature requirements for transport
- **Report Issues**: Report any safety concerns immediately

## Future Enhancements

### Planned Features

- **Automated Temperature Logging**: IoT sensor integration
- **Safety Certification**: Integration with food safety certifications
- **Compliance Reporting**: Automated compliance and audit reports
- **Mobile Safety App**: Dedicated mobile interface for safety monitoring

### Integration Opportunities

- **Food Safety APIs**: Integration with food safety databases
- **Regulatory Compliance**: Automated compliance checking
- **Analytics Dashboard**: Advanced safety analytics and reporting
- **Notification System**: Automated alerts for safety issues

## Support and Maintenance

### Database Migration

Run the SQL migration script to add safety fields:

```bash
psql -d your_database -f docs/sql/add-food-safety-fields.sql
```

### Component Updates

All safety components are automatically included in the build. No additional configuration required.

### Monitoring

- Monitor safety rating distributions
- Track inspection compliance
- Review safety alerts and warnings
- Analyze temperature trends

## Conclusion

The Food Safety Tagging system provides a comprehensive solution for managing food safety in ForkWare. By implementing these features, food providers can ensure transparency and compliance, while users can make informed decisions about food safety. The system is designed to be user-friendly, comprehensive, and scalable for future enhancements.
