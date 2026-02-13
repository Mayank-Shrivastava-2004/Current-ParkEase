# ParkEase - Smart Parking Management System Flowchart

```mermaid
graph TD
    %% Styling
    classDef actor fill:#f9f,stroke:#333,stroke-width:2px,color:black,font-weight:bold;
    classDef frontend fill:#d4f1f4,stroke:#333,stroke-width:1px,color:black;
    classDef backend fill:#ffcc99,stroke:#333,stroke-width:1px,color:black;
    classDef db fill:#cdeb8b,stroke:#333,stroke-width:1px,color:black;

    %% Actors
    User((User)):::actor
    Admin((Admin)):::actor
    Provider((Provider)):::actor
    Driver((Driver)):::actor

    %% Entry Points
    subgraph "Frontend (Mobile App)"
        Login[Login / Register Screen]:::frontend
        AuthLogic{Role Check}:::frontend

        %% Admin Flow
        subgraph "Admin Module"
            AdminDash[Admin Dashboard]:::frontend
            UserMgmt[User Management]:::frontend
            SysSettings[System Settings]:::frontend
            Reports[Global Reports]:::frontend
        end

        %% Provider Flow
        subgraph "Provider Module"
            ProvDash[Provider Dashboard]:::frontend
            SpaceMgmt[Manage Spaces / Slots]:::frontend
            Earnings[Earnings & Analytics]:::frontend
            LiveTraffic[Live Traffic View]:::frontend
            EVTools[EV Station Mgmt]:::frontend
        end

        %% Driver Flow
        subgraph "Driver Module"
            DriverDash[Driver Dashboard]:::frontend
            FindSpot[Find Parking / Map]:::frontend
            Booking[My Bookings]:::frontend
            Payments[Wallet & Payments]:::frontend
            EVScan[EV Charging Tools]:::frontend
        end
    end

    %% Backend System
    subgraph "Backend (Spring Boot)"
        API_Gateway[API Controllers]:::backend
        Security[Auth & Security Filter]:::backend
        
        subgraph "Core Services"
            AuthService[Auth Service]:::backend
            AdminService[Admin Service]:::backend
            ProviderService[Provider Service]:::backend
            DriverService[Driver Service]:::backend
            BookingService[Booking Service]:::backend
        end
    end

    %% Database
    subgraph "Data Layer"
        Database[(MySQL Database)]:::db
    end

    %% Connections
    User --> Login
    Login -->|Credentials| API_Gateway
    API_Gateway --> Security
    Security --> AuthService
    AuthService -->|Token & Role| Login
    
    Login --> AuthLogic
    AuthLogic -->|Role: Admin| AdminDash
    AuthLogic -->|Role: Provider| ProvDash
    AuthLogic -->|Role: Driver| DriverDash

    %% Admin Interactions
    Admin --> AdminDash
    AdminDash -->|Fetch Data| API_Gateway
    API_Gateway --> AdminService
    
    %% Provider Interactions
    Provider --> ProvDash
    ProvDash --> SpaceMgmt & Earnings & LiveTraffic & EVTools
    SpaceMgmt -->|Add/Update Slot| API_Gateway
    API_Gateway --> ProviderService

    %% Driver Interactions
    Driver --> DriverDash
    DriverDash --> FindSpot & Booking & Payments
    FindSpot -->|Search| API_Gateway
    Booking -->|Reserve| API_Gateway
    API_Gateway --> DriverService & BookingService

    %% Service to DB
    AuthService & AdminService & ProviderService & DriverService & BookingService --> Database

```

## Core Workflows Description

### 1. Authentication Flow
- **User** logs in via the mobile app.
- **Frontend** sends credentials to the Backend API.
- **Backend** validates credentials and returns a secure **JWT Token** and **User Role**.
- App routes the user to the specific Dashboard based on their role (Admin, Provider, or Driver).

### 2. Provider Workflow
- **Dashboard:** View real-time occupancy, revenue, and active chargers.
- **Space Management:** Add parking slots, toggle availability, and set pricing.
- **Analytics:** Visualize earnings trends (daily/weekly/monthly).

### 3. Driver Workflow
- **Search:** Find parking spots on a map with real-time availability.
- **Booking:** Reserve a spot in advance.
- **Navigation:** Get directions to the parking lot.
- **Eco:** View EV charging infrastructure and track eco-points.

### 4. Admin Workflow
- **Oversight:** Monitor total system health, user registrations, and platform revenue.
- **Management:** Approve providers and manage user accounts.
