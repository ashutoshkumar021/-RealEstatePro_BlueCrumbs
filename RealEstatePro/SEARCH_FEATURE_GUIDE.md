# Real Estate Projects Search Feature - Implementation Guide

## What's Been Implemented

### 1. Database Table: `real_estate_projects`
- **Location**: Added to `setup-database.js`
- **Structure**:
  - `id` - Primary key
  - `project_name` - Name of the property/project
  - `builder_name` - Developer/Builder name
  - `project_type` - Residential/Commercial/Industrial
  - `min_price` & `max_price` - Price range
  - `size_sqft` - Property size
  - `bhk` - Bedroom configuration
  - `status_possession` - Ready/Under Construction
  - `location` - Area/Sector location

### 2. Sample Data Script
- **File**: `server/insert-sample-projects.js`
- **Usage**: Run `node insert-sample-projects.js` to insert sample data
- **Contains**: 10 sample properties in Sector 150 Noida

### 3. API Endpoints
Added to `server.js`:
- `GET /api/projects/search` - Search projects with filters
  - Query params: location, bhk, builder, status, projectType, searchTerm
- `GET /api/projects/locations` - Get all unique locations
- `GET /api/projects/builders` - Get all unique builders

### 4. Search UI on Homepage
Updated `index.html`:
- Enhanced search forms with:
  - Location input field
  - BHK type dropdown (2/3/4/5 BHK)
  - Builder dropdown (dynamically loaded)
- Added search results section with grid layout
- Results show as cards with project details

### 5. JavaScript Search Handler
- **File**: `public/js/property-search.js`
- Features:
  - Loads builders dynamically on page load
  - Handles form submission
  - Sends search request to API
  - Displays results in card format
  - "Enquire Now" button for each property
  - Auto-scrolls to results section

## How to Use

### 1. Setup Database Table
```bash
cd server
node setup-database.js
```

### 2. Insert Sample Data
```bash
node insert-sample-projects.js
```

### 3. Test the Search
1. Go to homepage (index.html)
2. In the search box, try:
   - **Location**: "Sector 150" or "Noida"
   - **BHK**: Select "3 BHK"
   - **Builder**: Select "Godrej Properties" or "ATS Group"
3. Click "Search" button
4. Results will appear below with matching properties

## Search Features

### Current Filters
- **Location**: Text search (partial match)
- **BHK Type**: Exact match from dropdown
- **Builder**: Exact match from dropdown
- **Project Type**: Residential/Commercial/Industrial

### Result Display
Each property card shows:
- Project name
- Builder name
- Location
- BHK configuration
- Size in sq.ft
- Price range
- Possession status (Ready/Under Construction)
- "Enquire Now" button

### Enquiry Integration
When user clicks "Enquire Now":
- Quick enquiry popup opens
- Project and builder info is pre-filled
- Form submission saves to inquiries table
- Admin gets notification email

## Future Enhancements (Optional)

1. **Price Range Filter**: Add min/max price sliders
2. **Advanced Filters**: 
   - Possession date
   - Amenities
   - Property age
3. **Sorting Options**: 
   - Price (low to high/high to low)
   - Size
   - Newest first
4. **Map View**: Show properties on map
5. **Save Search**: Let users save their search criteria
6. **Compare Properties**: Select multiple properties to compare

## Troubleshooting

### If search returns no results:
1. Check if sample data is inserted: `SELECT * FROM real_estate_projects`
2. Verify API is working: Visit `/api/projects/search` in browser
3. Check browser console for errors

### If builders dropdown is empty:
1. Ensure projects table has data
2. Check `/api/projects/builders` endpoint
3. Verify jQuery is loaded before property-search.js

## Admin Email Notifications
All enquiries (including property enquiries) are sent to: **ashutosh8701@gmail.com**

This is configured in `server/mailer.js` line 31.
