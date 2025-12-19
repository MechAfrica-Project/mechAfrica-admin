# Bulk Onboarding API Specification

## Overview

This document provides a complete API specification for the MechAfrica Bulk Onboarding feature. This feature allows administrators to upload Excel files containing farmer and service provider data for bulk registration.

**Base URL:** `/api/v1/admin/onboard`

**Authentication:** All endpoints require JWT authentication with admin role.

**Headers Required:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json (for JSON requests)
Content-Type: multipart/form-data (for file uploads)
```

---

## Table of Contents

1. [Upload Excel File](#1-upload-excel-file)
2. [List All Jobs](#2-list-all-jobs)
3. [Get Job Details](#3-get-job-details)
4. [Get Job Progress](#4-get-job-progress)
5. [Get Job Summary](#5-get-job-summary)
6. [Get Onboarded Records](#6-get-onboarded-records)
7. [Get Skipped Records](#7-get-skipped-records)
8. [Get Problematic Records](#8-get-problematic-records)
9. [Get Single Problematic Record](#9-get-single-problematic-record)
10. [Update Problematic Record](#10-update-problematic-record)
11. [Retry Single Record](#11-retry-single-record)
12. [Bulk Retry Records](#12-bulk-retry-records)
13. [Retry All Edited Records](#13-retry-all-edited-records)
14. [Skip Problematic Record](#14-skip-problematic-record)
15. [Delete Problematic Record](#15-delete-problematic-record)
16. [Get Edited Records Count](#16-get-edited-records-count)
17. [Export Edited Records](#17-export-edited-records)
18. [Get Job Result](#18-get-job-result)
19. [Confirm Job](#19-confirm-job)
20. [Cancel Job](#20-cancel-job)
21. [WebSocket Real-Time Updates](#21-websocket-real-time-updates)
22. [Data Types & Enums](#22-data-types--enums)
23. [Error Responses](#23-error-responses)
24. [Frontend Integration Guide](#24-frontend-integration-guide)

---

## 1. Upload Excel File

Upload an Excel file to start a bulk onboarding job.

### Endpoint

```
POST /api/v1/admin/onboard/upload
```

### Request

**Content-Type:** `multipart/form-data`

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `file` | File | Yes | - | Excel file (.xlsx or .xls) |
| `dry_run` | string | No | `"true"` | If `"true"`, analyze only without creating records |
| `skip_duplicates` | string | No | `"true"` | If `"true"`, skip records with duplicate phone/ID |
| `onboard_farmers` | string | No | `"true"` | If `"true"`, process farmer records |
| `onboard_providers` | string | No | `"false"` | If `"true"`, process service provider records |
| `onboard_mixed_roles` | string | No | `"true"` | If `"true"`, process records that are both farmer and provider |
| `mixed_role_as_type` | string | No | `"farmer"` | Create mixed roles as `"farmer"` or `"provider"` |

### Example Request (JavaScript/Fetch)

```javascript
const formData = new FormData();
formData.append('file', excelFile);
formData.append('dry_run', 'true');
formData.append('skip_duplicates', 'true');
formData.append('onboard_farmers', 'true');
formData.append('onboard_providers', 'false');
formData.append('onboard_mixed_roles', 'true');
formData.append('mixed_role_as_type', 'farmer');

const response = await fetch('/api/v1/admin/onboard/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### Success Response

**Status Code:** `202 Accepted`

```json
{
  "success": true,
  "message": "File uploaded and processing started",
  "data": {
    "job_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "pending",
    "file_name": "AGRINVEST_YEFFA_Registration.xlsx",
    "file_url": "https://storage.supabase.co/v1/object/public/uploads/onboarding/abc123.xlsx",
    "file_size": 2456789,
    "config": {
      "dry_run": true,
      "skip_duplicates": true,
      "onboard_farmers": true,
      "onboard_providers": false,
      "onboard_mixed_roles": true,
      "mixed_role_as_type": "farmer"
    },
    "message": "Processing started. Connect to WebSocket for real-time updates or poll the status endpoint."
  }
}
```

### Error Responses

**400 Bad Request - No file provided:**
```json
{
  "success": false,
  "message": "No file provided",
  "error": "http: no such file"
}
```

**400 Bad Request - Invalid file type:**
```json
{
  "success": false,
  "message": "Invalid file type",
  "error": "Only Excel files (.xlsx, .xls) are allowed"
}
```

---

## 2. List All Jobs

Retrieve a paginated list of all onboarding jobs.

### Endpoint

```
GET /api/v1/admin/onboard/jobs
```

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | `1` | Page number (1-indexed) |
| `limit` | integer | No | `20` | Items per page (max: 100) |

### Example Request

```
GET /api/v1/admin/onboard/jobs?page=1&limit=20
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Jobs retrieved successfully",
  "data": {
    "jobs": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "status": "completed",
        "file_name": "AGRINVEST_YEFFA_Registration.xlsx",
        "config": {
          "dry_run": true,
          "skip_duplicates": true,
          "onboard_farmers": true,
          "onboard_providers": false,
          "onboard_mixed_roles": true,
          "mixed_role_as_type": "farmer"
        },
        "progress": {
          "total_rows": 13407,
          "processed_rows": 13407,
          "farmers_created": 12181,
          "providers_created": 0,
          "skipped": 888,
          "errors": 338,
          "percent_complete": 100,
          "current_file": "AGRINVEST_YEFFA_Registration.xlsx",
          "current_sheet": "Sheet1",
          "type_breakdown": {
            "farmer_only": 8033,
            "farmer_and_provider": 4486,
            "service_provider_only": 802,
            "unknown": 86
          },
          "region_breakdown": {
            "Northern": 5432,
            "Upper West": 3210,
            "Upper East": 2891,
            "North East": 1874
          }
        },
        "result_summary": {
          "total_rows": 13407,
          "processed": 12181,
          "farmers_created": 12181,
          "providers_created": 0,
          "skipped": 888,
          "errors": 338
        }
      },
      {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "status": "processing",
        "file_name": "Another_File.xlsx",
        "config": { ... },
        "progress": { ... }
      }
    ],
    "total": 15,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

---

## 3. Get Job Details

Retrieve complete details of a specific job including full result data.

### Endpoint

```
GET /api/v1/admin/onboard/jobs/:job_id
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `job_id` | UUID | Yes | The job identifier |

### Example Request

```
GET /api/v1/admin/onboard/jobs/550e8400-e29b-41d4-a716-446655440000
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Job retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:45:00Z",
    "created_by": "admin-user-uuid",
    "status": "completed",
    "file_name": "AGRINVEST_YEFFA_Registration.xlsx",
    "file_url": "https://storage.supabase.co/v1/object/public/uploads/onboarding/abc123.xlsx",
    "file_path": "onboarding/abc123.xlsx",
    "file_bucket": "uploads",
    "file_size": 2456789,
    "config": {
      "dry_run": true,
      "skip_duplicates": true,
      "onboard_farmers": true,
      "onboard_providers": false,
      "onboard_mixed_roles": true,
      "mixed_role_as_type": "farmer"
    },
    "progress": {
      "total_rows": 13407,
      "processed_rows": 13407,
      "farmers_created": 12181,
      "providers_created": 0,
      "skipped": 888,
      "errors": 338,
      "percent_complete": 100,
      "current_file": "AGRINVEST_YEFFA_Registration.xlsx",
      "current_sheet": "Sheet1",
      "type_breakdown": {
        "farmer_only": 8033,
        "farmer_and_provider": 4486,
        "service_provider_only": 802,
        "unknown": 86
      },
      "region_breakdown": {
        "Northern": 5432,
        "Upper West": 3210,
        "Upper East": 2891,
        "North East": 1874
      }
    },
    "result": {
      "total_rows": 13407,
      "processed": 12181,
      "farmers_created": 12181,
      "providers_created": 0,
      "skipped": 888,
      "errors": 338,
      "duplicate_phones": ["0241234567", "0551234567"],
      "duplicate_ids": ["GHA-123456789-0"],
      "error_details": [
        "Row 128: phone number is required",
        "Row 245: invalid phone number format: 024"
      ],
      "type_breakdown": { ... },
      "region_breakdown": { ... },
      "onboarded_records": [ ... ],
      "skipped_records": [ ... ],
      "problematic_records": [ ... ]
    },
    "problematic_file_url": "",
    "problematic_file_path": "",
    "error_message": "",
    "started_at": "2024-01-15T10:30:05Z",
    "completed_at": "2024-01-15T10:45:00Z",
    "confirmed_at": null,
    "confirmed_by": null,
    "final_import_farmers": 0,
    "final_import_providers": 0
  }
}
```

---

## 4. Get Job Progress

Get the current processing progress of a job. Use this for polling when WebSocket is not available.

### Endpoint

```
GET /api/v1/admin/onboard/jobs/:job_id/progress
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `job_id` | UUID | Yes | The job identifier |

### Example Request

```
GET /api/v1/admin/onboard/jobs/550e8400-e29b-41d4-a716-446655440000/progress
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Progress retrieved successfully",
  "data": {
    "job_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "processing",
    "file_name": "AGRINVEST_YEFFA_Registration.xlsx",
    "progress": {
      "total_rows": 13407,
      "processed_rows": 6500,
      "farmers_created": 5891,
      "providers_created": 0,
      "skipped": 421,
      "errors": 188,
      "percent_complete": 48.5,
      "current_file": "AGRINVEST_YEFFA_Registration.xlsx",
      "current_sheet": "Sheet1",
      "type_breakdown": {
        "farmer_only": 4200,
        "farmer_and_provider": 2100,
        "service_provider_only": 150,
        "unknown": 50
      },
      "region_breakdown": {
        "Northern": 2800,
        "Upper West": 1600,
        "Upper East": 1400,
        "North East": 700
      }
    },
    "started_at": "2024-01-15T10:30:05Z",
    "is_final": false
  }
}
```

---

## 5. Get Job Summary

Get a comprehensive summary with breakdowns - ideal for dashboard display.

### Endpoint

```
GET /api/v1/admin/onboard/jobs/:job_id/summary
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `job_id` | UUID | Yes | The job identifier |

### Example Request

```
GET /api/v1/admin/onboard/jobs/550e8400-e29b-41d4-a716-446655440000/summary
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Job summary retrieved successfully",
  "data": {
    "job_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "completed",
    "file_name": "AGRINVEST_YEFFA_Registration.xlsx",
    "config": {
      "dry_run": true,
      "skip_duplicates": true,
      "onboard_farmers": true,
      "onboard_providers": false,
      "onboard_mixed_roles": true,
      "mixed_role_as_type": "farmer"
    },
    "progress": {
      "total_rows": 13407,
      "processed_rows": 13407,
      "farmers_created": 12181,
      "providers_created": 0,
      "skipped": 888,
      "errors": 338,
      "percent_complete": 100,
      "current_file": "AGRINVEST_YEFFA_Registration.xlsx",
      "current_sheet": "Sheet1",
      "type_breakdown": {
        "farmer_only": 8033,
        "farmer_and_provider": 4486,
        "service_provider_only": 802,
        "unknown": 86
      },
      "region_breakdown": {
        "Northern": 5432,
        "Upper West": 3210,
        "Upper East": 2891,
        "North East": 1874
      }
    },
    "started_at": "2024-01-15T10:30:05Z",
    "completed_at": "2024-01-15T10:45:00Z",
    "can_confirm": true,
    "is_dry_run": true,
    "result_summary": {
      "total_rows": 13407,
      "processed": 12181,
      "farmers_created": 12181,
      "providers_created": 0,
      "skipped": 888,
      "errors": 338
    },
    "onboarded": {
      "count": 12181,
      "by_type": {
        "farmer": 12181,
        "provider": 0
      },
      "by_region": {
        "Northern": 5432,
        "Upper West": 3210,
        "Upper East": 2891,
        "North East": 648
      }
    },
    "skipped": {
      "count": 888,
      "by_reason": {
        "Duplicate phone number": 423,
        "Duplicate ID number": 65,
        "Filtered by config": 400
      }
    },
    "errors": {
      "count": 338,
      "by_type": {
        "missing_phone": 156,
        "invalid_phone": 98,
        "missing_name": 84
      }
    },
    "type_breakdown": {
      "farmer_only": 8033,
      "farmer_and_provider": 4486,
      "service_provider_only": 802,
      "unknown": 86
    },
    "region_breakdown": {
      "Northern": 5432,
      "Upper West": 3210,
      "Upper East": 2891,
      "North East": 1874
    }
  }
}
```

---

## 6. Get Onboarded Records

Get successfully onboarded records for table display. Supports pagination.

### Endpoint

```
GET /api/v1/admin/onboard/jobs/:job_id/onboarded
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `job_id` | UUID | Yes | The job identifier |

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | `1` | Page number (1-indexed) |
| `limit` | integer | No | `50` | Items per page (max: 200) |

### Example Request

```
GET /api/v1/admin/onboard/jobs/550e8400-e29b-41d4-a716-446655440000/onboarded?page=1&limit=50
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Onboarded records retrieved",
  "data": {
    "count": 12181,
    "page": 1,
    "limit": 50,
    "pages": 244,
    "records": [
      {
        "row_number": 2,
        "source_file": "AGRINVEST_YEFFA_Registration.xlsx",
        "source_sheet": "Sheet1",
        "full_name": "John Mensah Asante",
        "phone_number": "+233241234567",
        "region": "Northern",
        "district": "Tamale Metropolitan",
        "participant_type": "farmer_only",
        "created_as": "farmer",
        "user_id": "550e8400-e29b-41d4-a716-446655440000"
      },
      {
        "row_number": 3,
        "source_file": "AGRINVEST_YEFFA_Registration.xlsx",
        "source_sheet": "Sheet1",
        "full_name": "Ama Serwaa Kofi",
        "phone_number": "+233551234567",
        "region": "Upper West",
        "district": "Wa Municipal",
        "participant_type": "farmer_and_provider",
        "created_as": "farmer",
        "user_id": "660e8400-e29b-41d4-a716-446655440001"
      },
      {
        "row_number": 4,
        "source_file": "AGRINVEST_YEFFA_Registration.xlsx",
        "source_sheet": "Sheet1",
        "full_name": "Kwame Osei",
        "phone_number": "+233201234567",
        "region": "Northern",
        "district": "Sagnarigu",
        "participant_type": "farmer_only",
        "created_as": "farmer",
        "user_id": "770e8400-e29b-41d4-a716-446655440002"
      }
    ],
    "by_type": {
      "farmer": 12181,
      "provider": 0
    },
    "by_region": {
      "Northern": 5432,
      "Upper West": 3210,
      "Upper East": 2891,
      "North East": 648
    }
  }
}
```

### Record Object Schema

| Field | Type | Description |
|-------|------|-------------|
| `row_number` | integer | Original row number in Excel file |
| `source_file` | string | Name of the source Excel file |
| `source_sheet` | string | Name of the sheet in the Excel file |
| `full_name` | string | Full name of the participant |
| `phone_number` | string | Formatted phone number (e.g., +233XXXXXXXXX) |
| `region` | string | Region name |
| `district` | string | District name |
| `participant_type` | string | Type: `farmer_only`, `service_provider_only`, or `farmer_and_provider` |
| `created_as` | string | What they were created as: `farmer` or `provider` |
| `user_id` | string | UUID of created user (empty string if dry run) |

---

## 7. Get Skipped Records

Get skipped records (duplicates, filtered by config) for table display.

### Endpoint

```
GET /api/v1/admin/onboard/jobs/:job_id/skipped
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `job_id` | UUID | Yes | The job identifier |

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | `1` | Page number (1-indexed) |
| `limit` | integer | No | `50` | Items per page (max: 200) |

### Example Request

```
GET /api/v1/admin/onboard/jobs/550e8400-e29b-41d4-a716-446655440000/skipped?page=1&limit=50
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Skipped records retrieved",
  "data": {
    "count": 888,
    "page": 1,
    "limit": 50,
    "pages": 18,
    "records": [
      {
        "row_number": 45,
        "source_file": "AGRINVEST_YEFFA_Registration.xlsx",
        "source_sheet": "Sheet1",
        "full_name": "Abena Pokuaa",
        "phone_number": "+233241234567",
        "reason": "Duplicate phone number: +233241234567",
        "participant_type": "farmer_only"
      },
      {
        "row_number": 89,
        "source_file": "AGRINVEST_YEFFA_Registration.xlsx",
        "source_sheet": "Sheet1",
        "full_name": "Kofi Mensah",
        "phone_number": "+233551234567",
        "reason": "Duplicate ID number: GHA-123456789-0",
        "participant_type": "farmer_only"
      },
      {
        "row_number": 156,
        "source_file": "AGRINVEST_YEFFA_Registration.xlsx",
        "source_sheet": "Sheet1",
        "full_name": "Yaw Boateng",
        "phone_number": "+233271234567",
        "reason": "Providers not being onboarded (config: onboard_providers=false)",
        "participant_type": "service_provider_only"
      }
    ],
    "by_reason": {
      "Duplicate phone number": 423,
      "Duplicate ID number": 65,
      "Filtered by config": 400
    }
  }
}
```

### Record Object Schema

| Field | Type | Description |
|-------|------|-------------|
| `row_number` | integer | Original row number in Excel file |
| `source_file` | string | Name of the source Excel file |
| `source_sheet` | string | Name of the sheet in the Excel file |
| `full_name` | string | Full name of the participant |
| `phone_number` | string | Phone number |
| `reason` | string | Why the record was skipped |
| `participant_type` | string | Type: `farmer_only`, `service_provider_only`, or `farmer_and_provider` |

---

## 8. Get Problematic Records

Get error/problematic records for table display and review.

### Endpoint

```
GET /api/v1/admin/onboard/jobs/:job_id/problematic
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `job_id` | UUID | Yes | The job identifier |

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | `1` | Page number (1-indexed) |
| `limit` | integer | No | `50` | Items per page (max: 200) |

### Example Request

```
GET /api/v1/admin/onboard/jobs/550e8400-e29b-41d4-a716-446655440000/problematic?page=1&limit=50
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Problematic records retrieved",
  "data": {
    "count": 338,
    "page": 1,
    "limit": 50,
    "pages": 7,
    "records": [
      {
        "row_number": 128,
        "source_file": "AGRINVEST_YEFFA_Registration.xlsx",
        "source_sheet": "Sheet1",
        "issue": "phone number is required",
        "issue_type": "missing_phone",
        "raw_data": {
          "Name of Participant": "Kwame Asante",
          "Telephone Number": "",
          "Ghana Card Number": "GHA-123456789-0",
          "Gender": "Male",
          "Region/State": "Northern",
          "District": "Tamale",
          "Community": "Kalpohin",
          "Activity": "Producer (Farmer)"
        }
      },
      {
        "row_number": 245,
        "source_file": "AGRINVEST_YEFFA_Registration.xlsx",
        "source_sheet": "Sheet1",
        "issue": "invalid phone number format: 024",
        "issue_type": "invalid_phone",
        "raw_data": {
          "Name of Participant": "Akosua Mensah",
          "Telephone Number": "024",
          "Ghana Card Number": "",
          "Gender": "Female",
          "Region/State": "Upper West",
          "District": "Wa",
          "Community": "Kpongu",
          "Activity": "Producer (Farmer)"
        }
      },
      {
        "row_number": 312,
        "source_file": "AGRINVEST_YEFFA_Registration.xlsx",
        "source_sheet": "Sheet1",
        "issue": "name is required",
        "issue_type": "missing_name",
        "raw_data": {
          "Name of Participant": "",
          "Telephone Number": "0241234567",
          "Ghana Card Number": "",
          "Gender": "",
          "Region/State": "Northern",
          "District": "",
          "Community": "",
          "Activity": ""
        }
      },
      {
        "row_number": 456,
        "source_file": "AGRINVEST_YEFFA_Registration.xlsx",
        "source_sheet": "Sheet1",
        "issue": "Unknown participant type - cannot determine if farmer or provider",
        "issue_type": "unknown_type",
        "raw_data": {
          "Name of Participant": "Yaw Boateng",
          "Telephone Number": "0551234567",
          "Ghana Card Number": "GHA-987654321-0",
          "Gender": "Male",
          "Region/State": "Upper East",
          "District": "Bolgatanga",
          "Community": "Sumbrungu",
          "Activity": ""
        }
      }
    ],
    "by_type": {
      "missing_phone": 156,
      "invalid_phone": 98,
      "missing_name": 84,
      "unknown_type": 86,
      "creation_error": 0
    },
    "download_url": ""
  }
}
```

### Record Object Schema

| Field | Type | Description |
|-------|------|-------------|
| `row_number` | integer | Original row number in Excel file |
| `source_file` | string | Name of the source Excel file |
| `source_sheet` | string | Name of the sheet in the Excel file |
| `issue` | string | Description of the issue |
| `issue_type` | string | Category of issue (see Issue Types below) |
| `raw_data` | object | Original data from Excel row (key-value pairs) |

### Issue Types

| Type | Description |
|------|-------------|
| `missing_phone` | Phone number field is empty |
| `invalid_phone` | Phone number format is invalid |
| `missing_name` | Name field is empty |
| `unknown_type` | Cannot determine if farmer or provider from activity |
| `duplicate_phone` | Phone number already exists in database |
| `duplicate_id` | ID number already exists in database |
| `creation_error` | Failed to create record in database |
| `validation_error` | Other validation error |

---

## 9. Get Single Problematic Record

Get a single problematic record by row number for editing.

### Endpoint

```
GET /api/v1/admin/onboard/jobs/:job_id/problematic/:row_number
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `job_id` | UUID | Yes | The job identifier |
| `row_number` | integer | Yes | The row number in the original Excel file |

### Example Request

```
GET /api/v1/admin/onboard/jobs/550e8400-e29b-41d4-a716-446655440000/problematic/128
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Record retrieved successfully",
  "data": {
    "row_number": 128,
    "source_file": "AGRINVEST_YEFFA_Registration.xlsx",
    "source_sheet": "Sheet1",
    "issue": "phone number is required",
    "issue_type": "missing_phone",
    "raw_data": {
      "Name of Participant": "Kwame Asante",
      "Telephone Number": "",
      "Ghana Card Number": "GHA-123456789-0",
      "Gender": "Male",
      "Region/State": "Northern",
      "District": "Tamale",
      "Community": "Kalpohin",
      "Activity": "Producer (Farmer)"
    }
  }
}
```

### Error Response

**404 Not Found:**
```json
{
  "success": false,
  "message": "Record not found",
  "error": "record with row number 128 not found"
}
```

---

## 10. Update Problematic Record

Update a problematic record with corrected data. This marks the record as "edited" for later retry.

### Endpoint

```
PUT /api/v1/admin/onboard/jobs/:job_id/problematic/:row_number
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `job_id` | UUID | Yes | The job identifier |
| `row_number` | integer | Yes | The row number in the original Excel file |

### Request Body

```json
{
  "updated_data": {
    "Telephone Number": "0241234567",
    "Name of Participant": "Kwame Asante Updated"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `updated_data` | object | Yes | Key-value pairs of fields to update |

### Example Request

```javascript
const response = await fetch('/api/v1/admin/onboard/jobs/550e8400.../problematic/128', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    updated_data: {
      "Telephone Number": "0241234567",
      "Name of Participant": "Kwame Asante"
    }
  })
});
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Record updated successfully",
  "data": {
    "row_number": 128,
    "source_file": "AGRINVEST_YEFFA_Registration.xlsx",
    "source_sheet": "Sheet1",
    "issue": "phone number is required",
    "issue_type": "missing_phone",
    "raw_data": {
      "Name of Participant": "Kwame Asante",
      "Telephone Number": "0241234567",
      "Ghana Card Number": "GHA-123456789-0",
      "Gender": "Male",
      "Region/State": "Northern",
      "District": "Tamale",
      "Community": "Kalpohin",
      "Activity": "Producer (Farmer)",
      "_edited": "true",
      "_edited_at": "2024-01-15T12:30:00Z"
    }
  }
}
```

---

## 11. Retry Single Record

Attempt to process a problematic record after it has been edited.

### Endpoint

```
POST /api/v1/admin/onboard/jobs/:job_id/problematic/:row_number/retry
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `job_id` | UUID | Yes | The job identifier |
| `row_number` | integer | Yes | The row number to retry |

### Request Body

None required.

### Example Request

```javascript
const response = await fetch('/api/v1/admin/onboard/jobs/550e8400.../problematic/128/retry', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### Success Response - Record Processed

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Record processed successfully",
  "data": {
    "row_number": 128,
    "success": true,
    "message": "Record processed successfully",
    "user_id": "550e8400-e29b-41d4-a716-446655440099",
    "created_as": "farmer"
  }
}
```

### Success Response - Still Has Issues

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Record still has issues",
  "data": {
    "row_number": 128,
    "success": false,
    "message": "invalid phone number format: 024",
    "issue_type": "invalid_phone",
    "issue": "invalid phone number format: 024"
  }
}
```

---

## 12. Bulk Retry Records

Retry multiple problematic records at once.

### Endpoint

```
POST /api/v1/admin/onboard/jobs/:job_id/problematic/bulk-retry
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `job_id` | UUID | Yes | The job identifier |

### Request Body

```json
{
  "row_numbers": [128, 245, 312, 456]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `row_numbers` | array of integers | Yes | List of row numbers to retry |

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Bulk retry completed",
  "data": {
    "total_attempted": 4,
    "successful": 3,
    "failed": 1,
    "results": [
      {
        "row_number": 128,
        "success": true,
        "message": "Record processed successfully",
        "user_id": "550e8400-e29b-41d4-a716-446655440099",
        "created_as": "farmer"
      },
      {
        "row_number": 245,
        "success": true,
        "message": "Record processed successfully",
        "user_id": "660e8400-e29b-41d4-a716-446655440100",
        "created_as": "farmer"
      },
      {
        "row_number": 312,
        "success": true,
        "message": "Record processed successfully",
        "user_id": "770e8400-e29b-41d4-a716-446655440101",
        "created_as": "farmer"
      },
      {
        "row_number": 456,
        "success": false,
        "message": "Duplicate phone number: +233241234567",
        "issue_type": "duplicate_phone",
        "issue": "Phone number +233241234567 already exists in database"
      }
    ]
  }
}
```

---

## 13. Retry All Edited Records

Retry all records that have been edited (marked with `_edited: true`).

### Endpoint

```
POST /api/v1/admin/onboard/jobs/:job_id/problematic/retry-edited
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `job_id` | UUID | Yes | The job identifier |

### Request Body

None required.

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Retry all edited records completed",
  "data": {
    "total_attempted": 15,
    "successful": 12,
    "failed": 3,
    "results": [
      {
        "row_number": 128,
        "success": true,
        "message": "Record processed successfully",
        "user_id": "550e8400-...",
        "created_as": "farmer"
      },
      ...
    ]
  }
}
```

### Response When No Edited Records

```json
{
  "success": true,
  "message": "Retry all edited records completed",
  "data": {
    "total_attempted": 0,
    "successful": 0,
    "failed": 0,
    "results": []
  }
}
```

---

## 14. Skip Problematic Record

Move a problematic record to the skipped list. Use this when you decide to skip a record rather than fix it.

### Endpoint

```
POST /api/v1/admin/onboard/jobs/:job_id/problematic/:row_number/skip
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `job_id` | UUID | Yes | The job identifier |
| `row_number` | integer | Yes | The row number to skip |

### Request Body (Optional)

```json
{
  "reason": "Data quality too poor to fix"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `reason` | string | No | Reason for skipping (optional) |

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Record moved to skipped",
  "data": null
}
```

---

## 15. Delete Problematic Record

Permanently remove a problematic record from the job. Use with caution.

### Endpoint

```
DELETE /api/v1/admin/onboard/jobs/:job_id/problematic/:row_number
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `job_id` | UUID | Yes | The job identifier |
| `row_number` | integer | Yes | The row number to delete |

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Record deleted successfully",
  "data": null
}
```

---

## 16. Get Edited Records Count

Get the count of problematic records that have been edited and are ready for retry.

### Endpoint

```
GET /api/v1/admin/onboard/jobs/:job_id/problematic/edited-count
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `job_id` | UUID | Yes | The job identifier |

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Edited records count retrieved",
  "data": {
    "count": 15
  }
}
```

---

## 17. Export Edited Records

Export all edited records as a JSON file for backup or review.

### Endpoint

```
GET /api/v1/admin/onboard/jobs/:job_id/problematic/export-edited
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `job_id` | UUID | Yes | The job identifier |

### Success Response

**Status Code:** `200 OK`

**Content-Type:** `application/json`

**Content-Disposition:** `attachment; filename=edited_records.json`

```json
[
  {
    "row_number": 128,
    "source_file": "AGRINVEST_YEFFA_Registration.xlsx",
    "source_sheet": "Sheet1",
    "issue": "phone number is required",
    "issue_type": "missing_phone",
    "raw_data": {
      "Name of Participant": "Kwame Asante",
      "Telephone Number": "0241234567",
      "_edited": "true",
      "_edited_at": "2024-01-15T12:30:00Z",
      ...
    }
  },
  ...
]
```

---

## 18. Get Job Result

Get the complete result of a finished job.

### Endpoint

```
GET /api/v1/admin/onboard/jobs/:job_id/result
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `job_id` | UUID | Yes | The job identifier |

### Example Request

```
GET /api/v1/admin/onboard/jobs/550e8400-e29b-41d4-a716-446655440000/result
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Job result retrieved successfully",
  "data": {
    "job_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "completed",
    "file_name": "AGRINVEST_YEFFA_Registration.xlsx",
    "config": {
      "dry_run": true,
      "skip_duplicates": true,
      "onboard_farmers": true,
      "onboard_providers": false,
      "onboard_mixed_roles": true,
      "mixed_role_as_type": "farmer"
    },
    "result": {
      "total_rows": 13407,
      "processed": 12181,
      "farmers_created": 12181,
      "providers_created": 0,
      "skipped": 888,
      "errors": 338,
      "duplicate_phones": ["+233241234567", "+233551234567"],
      "duplicate_ids": ["GHA-123456789-0"],
      "error_details": [
        "Row 128: phone number is required",
        "Row 245: invalid phone number format: 024",
        "Row 312: name is required"
      ],
      "type_breakdown": {
        "farmer_only": 8033,
        "farmer_and_provider": 4486,
        "service_provider_only": 802,
        "unknown": 86
      },
      "region_breakdown": {
        "Northern": 5432,
        "Upper West": 3210,
        "Upper East": 2891,
        "North East": 1874
      },
      "onboarded_records": [ ... ],
      "skipped_records": [ ... ],
      "problematic_records": [ ... ]
    },
    "started_at": "2024-01-15T10:30:05Z",
    "completed_at": "2024-01-15T10:45:00Z",
    "can_confirm": true
  }
}
```

### Error Response

**400 Bad Request - Job not completed:**
```json
{
  "success": false,
  "message": "Job result not available",
  "error": "Job has not completed yet"
}
```

---

## 19. Confirm Job

Confirm a dry-run job to perform the actual import. This creates a new job with `dry_run=false` and starts processing.

### Endpoint

```
POST /api/v1/admin/onboard/jobs/:job_id/confirm
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `job_id` | UUID | Yes | The job identifier |

### Request Body

None required.

### Example Request

```javascript
const response = await fetch('/api/v1/admin/onboard/jobs/550e8400-e29b-41d4-a716-446655440000/confirm', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### Success Response

**Status Code:** `202 Accepted`

```json
{
  "success": true,
  "message": "Job confirmed, actual import started",
  "data": {
    "original_job_id": "550e8400-e29b-41d4-a716-446655440000",
    "new_job_id": "660e8400-e29b-41d4-a716-446655440001",
    "status": "pending",
    "message": "Actual import started. Connect to WebSocket for real-time updates."
  }
}
```

### Error Responses

**400 Bad Request - Cannot confirm:**
```json
{
  "success": false,
  "message": "Job cannot be confirmed",
  "error": "Job must be completed and in dry-run mode to be confirmed"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Job not found",
  "error": "record not found"
}
```

---

## 20. Cancel Job

Cancel a pending or processing job.

### Endpoint

```
POST /api/v1/admin/onboard/jobs/:job_id/cancel
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `job_id` | UUID | Yes | The job identifier |

### Request Body

None required.

### Example Request

```javascript
const response = await fetch('/api/v1/admin/onboard/jobs/550e8400-e29b-41d4-a716-446655440000/cancel', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Job cancelled successfully",
  "data": {
    "job_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "cancelled"
  }
}
```

### Error Response

**400 Bad Request - Cannot cancel:**
```json
{
  "success": false,
  "message": "Failed to cancel job",
  "error": "cannot cancel job with status: completed"
}
```

---

## 21. WebSocket Real-Time Updates

Connect to WebSocket for real-time progress updates during job processing.

### WebSocket Connection

```
WS /ws
WS /ws/admin (admin-specific)
```

### Connection with Authentication

```javascript
// Option 1: Query parameter
const ws = new WebSocket('wss://api.mechafrica.com/ws/connect?token=<jwt_token>');

// Option 2: After connection (send auth message)
const ws = new WebSocket('wss://api.mechafrica.com/ws');
ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'auth',
    token: '<jwt_token>'
  }));
};
```

### Event Types

#### `onboard_progress`

Sent during job processing to update progress.

**Payload:**

```json
{
  "type": "onboard_progress",
  "payload": {
    "job_id": "550e8400-e29b-41d4-a716-446655440000",
    "event_type": "progress_update",
    "status": "processing",
    "file_name": "AGRINVEST_YEFFA_Registration.xlsx",
    "progress": {
      "total_rows": 13407,
      "processed_rows": 6500,
      "farmers_created": 5891,
      "providers_created": 0,
      "skipped": 421,
      "errors": 188,
      "percent_complete": 48.5,
      "current_file": "AGRINVEST_YEFFA_Registration.xlsx",
      "current_sheet": "Sheet1",
      "type_breakdown": {
        "farmer_only": 4200,
        "farmer_and_provider": 2100,
        "service_provider_only": 150,
        "unknown": 50
      },
      "region_breakdown": {
        "Northern": 2800,
        "Upper West": 1600,
        "Upper East": 1400,
        "North East": 700
      }
    }
  },
  "timestamp": "2024-01-15T10:35:00Z",
  "message_id": "msg-uuid-123"
}
```

### Event Type Values

| Value | Description |
|-------|-------------|
| `processing_started` | Job processing has begun |
| `counting_complete` | Finished counting total rows |
| `progress_update` | Regular progress update (every 50 rows) |
| `processing_completed` | Job completed successfully |
| `processing_failed` | Job failed with error |
| `job_cancelled` | Job was cancelled |

### Complete WebSocket Event with Result

When `event_type` is `processing_completed`:

```json
{
  "type": "onboard_progress",
  "payload": {
    "job_id": "550e8400-e29b-41d4-a716-446655440000",
    "event_type": "processing_completed",
    "status": "completed",
    "file_name": "AGRINVEST_YEFFA_Registration.xlsx",
    "progress": {
      "total_rows": 13407,
      "processed_rows": 13407,
      "farmers_created": 12181,
      "providers_created": 0,
      "skipped": 888,
      "errors": 338,
      "percent_complete": 100,
      "current_file": "AGRINVEST_YEFFA_Registration.xlsx",
      "current_sheet": "Sheet1",
      "type_breakdown": { ... },
      "region_breakdown": { ... }
    },
    "result_summary": {
      "total_rows": 13407,
      "processed": 12181,
      "farmers_created": 12181,
      "providers_created": 0,
      "skipped": 888,
      "errors": 338
    }
  },
  "timestamp": "2024-01-15T10:45:00Z",
  "message_id": "msg-uuid-456"
}
```

### WebSocket Error Event

```json
{
  "type": "onboard_progress",
  "payload": {
    "job_id": "550e8400-e29b-41d4-a716-446655440000",
    "event_type": "processing_failed",
    "status": "failed",
    "file_name": "AGRINVEST_YEFFA_Registration.xlsx",
    "error_message": "Failed to download file: status 404",
    "progress": { ... }
  },
  "timestamp": "2024-01-15T10:32:00Z",
  "message_id": "msg-uuid-789"
}
```

### JavaScript WebSocket Example

```javascript
class OnboardingWebSocket {
  constructor(token) {
    this.token = token;
    this.ws = null;
    this.listeners = new Map();
  }

  connect() {
    this.ws = new WebSocket(`wss://api.mechafrica.com/ws/connect?token=${this.token}`);
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
    };
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'onboard_progress') {
        const { job_id, event_type, status, progress, result_summary, error_message } = data.payload;
        
        // Emit to listeners
        this.emit(event_type, {
          jobId: job_id,
          status,
          progress,
          resultSummary: result_summary,
          errorMessage: error_message
        });
      }
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      // Reconnect logic here
    };
  }

  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(callback);
  }

  emit(eventType, data) {
    const callbacks = this.listeners.get(eventType) || [];
    callbacks.forEach(cb => cb(data));
    
    // Also emit to 'all' listeners
    const allCallbacks = this.listeners.get('all') || [];
    allCallbacks.forEach(cb => cb({ eventType, ...data }));
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// Usage
const wsClient = new OnboardingWebSocket(authToken);
wsClient.connect();

wsClient.on('processing_started', (data) => {
  console.log('Processing started for job:', data.jobId);
});

wsClient.on('progress_update', (data) => {
  updateProgressBar(data.progress.percent_complete);
  updateStats(data.progress);
});

wsClient.on('processing_completed', (data) => {
  showCompletionMessage(data.resultSummary);
  fetchDetailedResults(data.jobId);
});

wsClient.on('processing_failed', (data) => {
  showError(data.errorMessage);
});
```

---

## 22. Data Types & Enums

### Job Status

| Value | Description |
|-------|-------------|
| `pending` | Job created, waiting to start processing |
| `processing` | Job is currently processing rows |
| `analyzing` | Job is analyzing the file |
| `completed` | Job finished successfully |
| `failed` | Job failed with an error |
| `confirmed` | Dry-run job was confirmed for actual import |
| `cancelled` | Job was cancelled by user |

### Participant Type

| Value | Description |
|-------|-------------|
| `farmer_only` | Person is only a farmer |
| `service_provider_only` | Person is only a service provider |
| `farmer_and_provider` | Person is both farmer and service provider |
| `unknown` | Could not determine type from activity |

### Issue Type

| Value | Description |
|-------|-------------|
| `missing_phone` | Phone number field is empty |
| `invalid_phone` | Phone number format is invalid (less than 10 digits) |
| `missing_name` | Name field is empty |
| `unknown_type` | Cannot determine participant type |
| `duplicate_phone` | Phone number already exists in database |
| `duplicate_id` | ID number already exists in database |
| `creation_error` | Failed to create record in database |
| `validation_error` | Other validation failure |

### Config Object

```typescript
interface OnboardJobConfig {
  dry_run: boolean;           // If true, only analyze without creating records
  skip_duplicates: boolean;   // If true, skip records with duplicate phone/ID
  onboard_farmers: boolean;   // If true, process farmer records
  onboard_providers: boolean; // If true, process service provider records
  onboard_mixed_roles: boolean; // If true, process mixed role records
  mixed_role_as_type: 'farmer' | 'provider'; // Create mixed roles as this type
}
```

### Progress Object

```typescript
interface OnboardJobProgress {
  total_rows: number;           // Total rows in file (excluding header)
  processed_rows: number;       // Rows processed so far
  farmers_created: number;      // Farmers created (or would be created if dry run)
  providers_created: number;    // Providers created
  skipped: number;              // Records skipped (duplicates, filtered)
  errors: number;               // Records with errors
  percent_complete: number;     // 0-100 percentage
  current_file: string;         // Current file being processed
  current_sheet: string;        // Current sheet being processed
  type_breakdown: Record<string, number>;   // Count by participant type
  region_breakdown: Record<string, number>; // Count by region
}
```

### Result Object

```typescript
interface OnboardJobResult {
  total_rows: number;
  processed: number;
  farmers_created: number;
  providers_created: number;
  skipped: number;
  errors: number;
  duplicate_phones: string[];
  duplicate_ids: string[];
  error_details: string[];
  type_breakdown: Record<string, number>;
  region_breakdown: Record<string, number>;
  onboarded_records: OnboardedRecord[];
  skipped_records: SkippedRecord[];
  problematic_records: ProblematicRecord[];
}

interface OnboardedRecord {
  row_number: number;
  source_file: string;
  source_sheet: string;
  full_name: string;
  phone_number: string;
  region: string;
  district: string;
  participant_type: string;
  created_as: 'farmer' | 'provider';
  user_id: string; // Empty if dry run
}

interface SkippedRecord {
  row_number: number;
  source_file: string;
  source_sheet: string;
  full_name: string;
  phone_number: string;
  reason: string;
  participant_type: string;
}

interface ProblematicRecord {
  row_number: number;
  source_file: string;
  source_sheet: string;
  issue: string;
  issue_type: string;
  raw_data: Record<string, string>;
}
```

---

## 23. Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "error": "Technical error details"
}
```

### Common HTTP Status Codes

| Code | Description |
|------|-------------|
| `200` | Success |
| `202` | Accepted (job started) |
| `400` | Bad Request (validation error, cannot perform action) |
| `401` | Unauthorized (missing or invalid token) |
| `403` | Forbidden (not admin role) |
| `404` | Not Found (job doesn't exist) |
| `500` | Internal Server Error |

### Error Examples

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "User not authenticated",
  "error": null
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Access denied",
  "error": "Admin role required"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Job not found",
  "error": "record not found"
}
```

---

## 24. Frontend Integration Guide

### Recommended User Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    BULK ONBOARDING FLOW                         │
└─────────────────────────────────────────────────────────────────┘

1. UPLOAD PAGE
   ├── File input for Excel upload
   ├── Configuration options:
   │   ├── ☑ Dry Run (Preview only) [default: checked]
   │   ├── ☑ Skip Duplicates [default: checked]
   │   ├── ☑ Onboard Farmers [default: checked]
   │   ├── ☐ Onboard Providers [default: unchecked]
   │   ├── ☑ Onboard Mixed Roles [default: checked]
   │   └── Mixed Role As: [Farmer ▼]
   └── [Upload & Process] button

2. PROGRESS PAGE (after upload)
   ├── Progress bar: 48.5% ████████░░░░░░░░
   ├── Stats:
   │   ├── Total Rows: 13,407
   │   ├── Processed: 6,500
   │   ├── Farmers: 5,891
   │   ├── Skipped: 421
   │   └── Errors: 188
   └── Cancel button (if still processing)

3. RESULTS PAGE (after completion)
   ├── Summary Cards:
   │   ├── ✅ Onboarded: 12,181
   │   ├── ⏭️ Skipped: 888
   │   └── ❌ Errors: 338 (15 edited, ready to retry)
   │
   ├── Tab Navigation:
   │   ├── [Onboarded] [Skipped] [Errors]
   │   └── Active tab shows paginated table
   │
   ├── Error Records Table (with edit capability):
   │   ├── Each row has [Edit] [Retry] [Skip] [Delete] buttons
   │   ├── Inline editing or modal for editing raw_data fields
   │   ├── "Edited" badge shows on modified records
   │   └── [Retry All Edited] button at top
   │
   ├── Breakdown Charts:
   │   ├── By Type (pie chart)
   │   └── By Region (bar chart)
   │
   └── Actions:
       ├── [Confirm Import] (if dry run)
       ├── [Retry All Edited] (X records)
       └── [Download Error Report]

4. JOBS LIST PAGE
   ├── Table of all jobs:
   │   ├── File Name | Status | Progress | Created | Actions
   │   └── Pagination
   └── Click row to view details
```

### React Component Example

```jsx
// OnboardingUpload.jsx
import { useState } from 'react';
import { useOnboardingWebSocket } from './hooks/useOnboardingWebSocket';

function OnboardingUpload() {
  const [file, setFile] = useState(null);
  const [config, setConfig] = useState({
    dryRun: true,
    skipDuplicates: true,
    onboardFarmers: true,
    onboardProviders: false,
    onboardMixedRoles: true,
    mixedRoleAsType: 'farmer'
  });
  const [jobId, setJobId] = useState(null);
  const [progress, setProgress] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, uploading, processing, completed, failed

  // WebSocket hook for real-time updates
  const { connect, disconnect } = useOnboardingWebSocket({
    onProgress: (data) => {
      setProgress(data.progress);
      if (data.status === 'completed') {
        setStatus('completed');
      } else if (data.status === 'failed') {
        setStatus('failed');
      }
    }
  });

  const handleUpload = async () => {
    setStatus('uploading');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('dry_run', config.dryRun.toString());
    formData.append('skip_duplicates', config.skipDuplicates.toString());
    formData.append('onboard_farmers', config.onboardFarmers.toString());
    formData.append('onboard_providers', config.onboardProviders.toString());
    formData.append('onboard_mixed_roles', config.onboardMixedRoles.toString());
    formData.append('mixed_role_as_type', config.mixedRoleAsType);

    try {
      const response = await fetch('/api/v1/admin/onboard/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        setJobId(data.data.job_id);
        setStatus('processing');
        connect(); // Start listening for WebSocket updates
      } else {
        setStatus('failed');
        showError(data.message);
      }
    } catch (error) {
      setStatus('failed');
      showError(error.message);
    }
  };

  return (
    <div>
      {status === 'idle' && (
        <UploadForm 
          file={file}
          onFileChange={setFile}
          config={config}
          onConfigChange={setConfig}
          onUpload={handleUpload}
        />
      )}
      
      {status === 'processing' && (
        <ProgressView 
          progress={progress}
          onCancel={() => cancelJob(jobId)}
        />
      )}
      
      {status === 'completed' && (
        <ResultsView 
          jobId={jobId}
          onConfirm={() => confirmJob(jobId)}
        />
      )}
    </div>
  );
}
```

### Polling Fallback (if WebSocket unavailable)

```javascript
async function pollProgress(jobId, onUpdate, interval = 2000) {
  const poll = async () => {
    try {
      const response = await fetch(`/api/v1/admin/onboard/jobs/${jobId}/progress`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await response.json();
      
      if (data.success) {
        onUpdate(data.data);
        
        // Continue polling if not final
        if (!data.data.is_final) {
          setTimeout(poll, interval);
        }
      }
    } catch (error) {
      console.error('Polling error:', error);
      setTimeout(poll, interval * 2); // Backoff on error
    }
  };
  
  poll();
}

// Usage
pollProgress(jobId, (data) => {
  setProgress(data.progress);
  setStatus(data.status);
});
```

### Table Display Component

```jsx
// OnboardedTable.jsx
function OnboardedTable({ jobId }) {
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 0 });
  const [loading, setLoading] = useState(false);

  const fetchRecords = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/v1/admin/onboard/jobs/${jobId}/onboarded?page=${page}&limit=50`,
        { headers: { 'Authorization': `Bearer ${getToken()}` } }
      );
      const data = await response.json();
      
      if (data.success) {
        setRecords(data.data.records);
        setPagination({
          page: data.data.page,
          limit: data.data.limit,
          total: data.data.count,
          pages: data.data.pages
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [jobId]);

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Row #</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Region</th>
            <th>District</th>
            <th>Type</th>
            <th>Created As</th>
          </tr>
        </thead>
        <tbody>
          {records.map(record => (
            <tr key={record.row_number}>
              <td>{record.row_number}</td>
              <td>{record.full_name}</td>
              <td>{record.phone_number}</td>
              <td>{record.region}</td>
              <td>{record.district}</td>
              <td><Badge>{record.participant_type}</Badge></td>
              <td><Badge color="green">{record.created_as}</Badge></td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <Pagination
        page={pagination.page}
        pages={pagination.pages}
        total={pagination.total}
        onChange={fetchRecords}
      />
    </div>
  );
}
```

### Summary Dashboard Component

```jsx
// JobSummary.jsx
function JobSummary({ jobId }) {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchSummary();
  }, [jobId]);

  const fetchSummary = async () => {
    const response = await fetch(`/api/v1/admin/onboard/jobs/${jobId}/summary`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = await response.json();
    if (data.success) {
      setSummary(data.data);
    }
  };

  if (!summary) return <Loading />;

  return (
    <div>
      {/* Status Banner */}
      <StatusBanner status={summary.status} isDryRun={summary.is_dry_run} />
      
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <SummaryCard
          title="Total Rows"
          value={summary.result_summary.total_rows}
          icon="📄"
        />
        <SummaryCard
          title="Onboarded"
          value={summary.onboarded.count}
          icon="✅"
          color="green"
        />
        <SummaryCard
          title="Skipped"
          value={summary.skipped.count}
          icon="⏭️"
          color="yellow"
        />
        <SummaryCard
          title="Errors"
          value={summary.errors.count}
          icon="❌"
          color="red"
        />
      </div>

      {/* Breakdown Charts */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <PieChart
          title="By Participant Type"
          data={summary.type_breakdown}
        />
        <BarChart
          title="By Region"
          data={summary.region_breakdown}
        />
      </div>

      {/* Detailed Breakdowns */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <BreakdownList
          title="Onboarded by Type"
          data={summary.onboarded.by_type}
        />
        <BreakdownList
          title="Skipped by Reason"
          data={summary.skipped.by_reason}
        />
        <BreakdownList
          title="Errors by Type"
          data={summary.errors.by_type}
        />
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-4">
        {summary.can_confirm && (
          <Button
            onClick={() => confirmJob(jobId)}
            variant="primary"
          >
            🚀 Confirm Import ({summary.onboarded.count} records)
          </Button>
        )}
        <Button
          onClick={() => downloadErrorReport(jobId)}
          variant="secondary"
        >
          📥 Download Error Report
        </Button>
      </div>
    </div>
  );
}
```

---

## Appendix: Expected Excel File Format

The system automatically detects columns based on common header names:

| Expected Column | Alternative Names |
|-----------------|-------------------|
| `Name of Participant` | `Full Name`, `Name`, `Participant Name` |
| `Telephone Number` | `Phone`, `Phone Number`, `Mobile`, `Tel` |
| `Ghana Card Number` | `ID Number`, `National ID`, `Ghana Card` |
| `Gender` | - |
| `Region/State` | `Region`, `State` |
| `District` | - |
| `Community` | `Cmmunity`, `Town`, `Village` |
| `Activity` | `Which value chain activity (ies) are you involved in?`, `Value Chain Activity`, `Activities` |

### Activity Classification

**Farmer Keywords:** `producer`, `farmer`, `production`

**Provider Keywords:** `tractor operator`, `transportation`, `processor`, `aggregator`, `exporter`, `ag-tech`, `planting gang`, `spraying gang`, `food packaging`, `grain drying`, etc.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-01-15 | Initial release |
| 1.1.0 | 2024-01-15 | Added Edit & Retry endpoints for problematic records |

---

## Appendix B: Edit & Retry API Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/jobs/:job_id/problematic/:row_number` | Get single record |
| `PUT` | `/jobs/:job_id/problematic/:row_number` | Update/edit record |
| `POST` | `/jobs/:job_id/problematic/:row_number/retry` | Retry single record |
| `POST` | `/jobs/:job_id/problematic/:row_number/skip` | Move to skipped |
| `DELETE` | `/jobs/:job_id/problematic/:row_number` | Delete record |
| `GET` | `/jobs/:job_id/problematic/edited-count` | Count of edited records |
| `GET` | `/jobs/:job_id/problematic/export-edited` | Export edited as JSON |
| `POST` | `/jobs/:job_id/problematic/bulk-retry` | Retry multiple records |
| `POST` | `/jobs/:job_id/problematic/retry-edited` | Retry all edited records |

### Edit & Retry Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    EDIT & RETRY FLOW                             │
└─────────────────────────────────────────────────────────────────┘

1. View problematic records
   GET /jobs/:job_id/problematic

2. Click on a record to view details
   GET /jobs/:job_id/problematic/:row_number

3. Edit the record (fix phone, name, etc.)
   PUT /jobs/:job_id/problematic/:row_number
   Body: { "updated_data": { "Telephone Number": "0241234567" } }

4. Record is now marked as "_edited": "true"

5. Option A: Retry single record
   POST /jobs/:job_id/problematic/:row_number/retry
   
   Option B: Retry all edited at once
   POST /jobs/:job_id/problematic/retry-edited

6. If retry succeeds:
   - Record moves from problematic → onboarded
   - User account is created (if not dry run)
   - Counts are updated

7. If retry fails:
   - Record stays in problematic
   - New issue/issue_type is returned
   - User can edit again and retry

8. Alternative: Skip the record
   POST /jobs/:job_id/problematic/:row_number/skip
   - Record moves from problematic → skipped
   - No user account created
```
