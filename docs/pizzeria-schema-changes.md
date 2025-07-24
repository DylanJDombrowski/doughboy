# Pizzeria Database Schema Changes

This document outlines the changes made to the database schema to support enhanced pizzeria features.

## New Tables

### 1. `pizzeria_ratings`

Separate ratings specifically for pizzerias (distinct from recipe ratings).

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| pizzeria_id | UUID | Foreign key to pizzerias table |
| user_id | UUID | Foreign key to auth.users table |
| overall_rating | SMALLINT | Overall rating (1-5) |
| crust_rating | SMALLINT | Crust quality rating (1-5) |
| review | TEXT | Optional text review |
| photos | TEXT[] | Array of photo URLs |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

**Constraints:**
- Unique constraint on (pizzeria_id, user_id)
- Check constraints on rating ranges (1-5)
- Foreign key constraints

### 2. `saved_pizzerias`

Allows users to save their favorite pizzerias.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users table |
| pizzeria_id | UUID | Foreign key to pizzerias table |
| created_at | TIMESTAMP | Creation timestamp |

**Constraints:**
- Unique constraint on (user_id, pizzeria_id)
- Foreign key constraints

## Updated Tables

### `pizzerias`

Added new fields to the existing pizzerias table.

| New Column | Type | Description |
|------------|------|-------------|
| photos | TEXT[] | Array of photo URLs |
| description | TEXT | Detailed description |
| hours | TEXT | Operating hours information |
| updated_at | TIMESTAMP | Last update timestamp |

## Row Level Security Policies

### `pizzeria_ratings`

- **Select:** Everyone can view all pizzeria ratings
- **Insert:** Users can only insert their own ratings
- **Update:** Users can only update their own ratings
- **Delete:** Users can only delete their own ratings

### `saved_pizzerias`

- **Select:** Users can only view their own saved pizzerias
- **Insert:** Users can only save pizzerias for themselves
- **Delete:** Users can only unsave their own pizzerias

## Utility Functions

Several utility functions have been implemented to interact with these tables:

### Pizzeria Ratings
- `createOrUpdatePizzeriaRating`: Create or update a rating
- `getPizzeriaRatingStats`: Get average ratings and count
- `getUserPizzeriaRating`: Get a user's rating for a pizzeria
- `deletePizzeriaRating`: Delete a rating

### Saved Pizzerias
- `savePizzeria`: Save a pizzeria to favorites
- `unsavePizzeria`: Remove a pizzeria from favorites
- `isPizzeriaSaved`: Check if a pizzeria is saved
- `getSavedPizzerias`: Get all saved pizzerias for a user

## Implementation Notes

- All changes are backward compatible
- Added proper indexes for performance
- Updated TypeScript interfaces to match schema
- Added comprehensive error handling
