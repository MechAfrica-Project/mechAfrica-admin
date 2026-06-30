# MechAfrica Admin API: "Option B" Pending Requests Management

This document outlines the APIs required for the Frontend Engineering team to build the "Option B" feature on the Admin Dashboard.

If a Service Request is placed but no provider accepts it, it will remain in the `pending` state. The Admin Dashboard will flag these requests so your internal team can manually match them with a nearby provider.

---

## 1. Fetch All Requests (Filter for Pending)

Retrieves all service requests on the platform. The frontend should filter this list where `status === 'pending'` to highlight unaccepted requests.

- **Endpoint:** `/api/v1/admin/service-requests`
- **Method:** `GET`
- **Auth Required:** ✅ Yes (Admin Token)

### Response Snippet

```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid-here",
      "request_id": "REQ123456",
      "status": "pending",
      "service_type": "tractor_plowing",
      "farm_size": 15
      // ...
    }
  ]
}
```

---

## 2. Get Eligible Providers (Sorted by Distance)

When an admin clicks on a specific pending request, call this endpoint to get a list of providers who offer the requested service (e.g., Tractor Plowing).

**Crucially**, this API dynamically calculates the exact GPS distance between the farm and the provider and sorts the list so the **closest providers are at the very top**.

- **Endpoint:** `/api/v1/admin/service-requests/:id/eligible-providers`
- **Method:** `GET`
- **Auth Required:** ✅ Yes (Admin Token)

### Response Format

```json
{
  "status": "success",
  "data": [
    {
      "service_provider_id": "provider-uuid",
      "name": "Kwame Mensah",
      "phone_number": "+233540000000",
      "distance_km": 5.4,
      "rating": 4.8,
      "completed_jobs": 12
    }
  ]
}
```

---

## 3. Manually Assign Provider (Admin Intervention)

Once the admin decides which provider to assign the job to (or after calling the provider to confirm), they will trigger this API.

**Note:** This backend route automatically sends SMS notifications to both the Farmer and the newly assigned Provider informing them of the manual assignment.

- **Endpoint:** `/api/v1/admin/service-requests/:id/reassign`
- **Method:** `PUT`
- **Auth Required:** ✅ Yes (Admin Token)

### Request Body

```json
{
  "new_service_provider_id": "provider-uuid-here"
}
```

### Response Format

```json
{
  "status": "success",
  "message": "Service request reassigned successfully"
}
```
