# Database Schema Design

## Overview
LinkShield AI uses a relational database to store user data, scan results, and application metadata. The schema is designed for performance, scalability, and maintainability.

## Entity Relationship Diagram

```
┌───────────────┐       ┌───────────────┐       ┌───────────────┐
│     Users     │       │     Scans     │       │ ScanFeatures  │
├───────────────┤       ├───────────────┤       ├───────────────┤
│ id (PK)       │       │ id (PK)       │       │ id (PK)       │
│ email         │1      │ user_id (FK)  │       │ scan_id (FK)  │
│ name          ├───────┤ url           │1      │ feature_name  │
│ password_hash │       │ is_phishing   ├───────┤ feature_value │
│ created_at    │       │ confidence    │       │ created_at    │
│ updated_at    │       │ scan_timestamp│       └───────────────┘
│ last_login    │       │ created_at    │
└───────────────┘       └───────────────┘
        │                       │
        │                       │
        │                       │
┌───────┴───────┐       ┌───────┴───────┐
│  UserSettings │       │   Categories  │
├───────────────┤       ├───────────────┤
│ id (PK)       │       │ id (PK)       │
│ user_id (FK)  │       │ scan_id (FK)  │
│ setting_name  │       │ category_name │
│ setting_value │       │ created_at    │
│ created_at    │       └───────────────┘
│ updated_at    │
└───────────────┘
```

## Tables

### Users
Stores user account information.

| Column        | Type         | Constraints           | Description                        |
|---------------|--------------|----------------------|-----------------------------------|
| id            | UUID         | PK, NOT NULL         | Unique user identifier            |
| email         | VARCHAR(255) | UNIQUE, NOT NULL     | User email address                |
| name          | VARCHAR(100) | NOT NULL             | User's full name                  |
| password_hash | VARCHAR(255) | NOT NULL             | Hashed password                   |
| created_at    | TIMESTAMP    | NOT NULL, DEFAULT NOW | Account creation timestamp        |
| updated_at    | TIMESTAMP    | NOT NULL, DEFAULT NOW | Last update timestamp            |
| last_login    | TIMESTAMP    |                      | Last successful login timestamp   |

### Scans
Records of URL scans performed by users.

| Column         | Type         | Constraints           | Description                       |
|----------------|--------------|----------------------|-----------------------------------|
| id             | UUID         | PK, NOT NULL         | Unique scan identifier            |
| user_id        | UUID         | FK, NOT NULL         | Reference to Users table          |
| url            | TEXT         | NOT NULL             | The URL that was scanned          |
| is_phishing    | BOOLEAN      | NOT NULL             | Phishing detection result         |
| confidence     | DECIMAL(5,4) | NOT NULL             | Confidence score (0.0000-1.0000)  |
| scan_timestamp | TIMESTAMP    | NOT NULL, DEFAULT NOW | When the scan was performed       |
| created_at     | TIMESTAMP    | NOT NULL, DEFAULT NOW | Record creation timestamp         |

### ScanFeatures
Detailed features extracted during URL analysis.

| Column        | Type         | Constraints           | Description                       |
|---------------|--------------|----------------------|-----------------------------------|
| id            | UUID         | PK, NOT NULL         | Unique feature identifier         |
| scan_id       | UUID         | FK, NOT NULL         | Reference to Scans table          |
| feature_name  | VARCHAR(100) | NOT NULL             | Name of the extracted feature     |
| feature_value | TEXT         | NOT NULL             | Value of the feature              |
| created_at    | TIMESTAMP    | NOT NULL, DEFAULT NOW | Record creation timestamp         |

### Categories
Classification categories for scanned URLs.

| Column        | Type         | Constraints           | Description                       |
|---------------|--------------|----------------------|-----------------------------------|
| id            | UUID         | PK, NOT NULL         | Unique category identifier        |
| scan_id       | UUID         | FK, NOT NULL         | Reference to Scans table          |
| category_name | VARCHAR(100) | NOT NULL             | Name of the category              |
| created_at    | TIMESTAMP    | NOT NULL, DEFAULT NOW | Record creation timestamp         |

### UserSettings
User preferences and settings.

| Column        | Type         | Constraints           | Description                       |
|---------------|--------------|----------------------|-----------------------------------|
| id            | UUID         | PK, NOT NULL         | Unique setting identifier         |
| user_id       | UUID         | FK, NOT NULL         | Reference to Users table          |
| setting_name  | VARCHAR(100) | NOT NULL             | Name of the setting               |
| setting_value | TEXT         | NOT NULL             | Value of the setting              |
| created_at    | TIMESTAMP    | NOT NULL, DEFAULT NOW | Record creation timestamp         |
| updated_at    | TIMESTAMP    | NOT NULL, DEFAULT NOW | Last update timestamp            |

## Indexes

| Table         | Index Name             | Columns                  | Type    |
|---------------|------------------------|--------------------------|---------|
| Users         | users_email_idx        | email                    | UNIQUE  |
| Scans         | scans_user_id_idx      | user_id                  | BTREE   |
| Scans         | scans_timestamp_idx    | scan_timestamp           | BTREE   |
| ScanFeatures  | features_scan_id_idx   | scan_id                  | BTREE   |
| Categories    | categories_scan_id_idx | scan_id                  | BTREE   |
| UserSettings  | settings_user_id_idx   | user_id                  | BTREE   |

## Relationships

1. **Users to Scans**: One-to-many. A user can have multiple scan records.
2. **Scans to ScanFeatures**: One-to-many. A scan can have multiple features.
3. **Scans to Categories**: One-to-many. A scan can belong to multiple categories.
4. **Users to UserSettings**: One-to-many. A user can have multiple settings.
