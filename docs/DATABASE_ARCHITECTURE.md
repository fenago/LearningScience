# LearningScience.ai Database Architecture

## Overview
This document provides a comprehensive visual representation of the MongoDB database structure for the LearningScience.ai application after the collection refactoring.

## Database: `learningscience`

The application now uses a single MongoDB database (`learningscience`) with all collections properly prefixed with `ls_` to avoid conflicts with other applications sharing the same MongoDB instance.

## Collection Structure

```mermaid
graph TB
    subgraph "MongoDB Instance"
        subgraph "learningscience Database"
            subgraph "LearningScience.ai Collections (ls_ prefix)"
                UP[ls_userProfiles<br/>📊 1 document<br/>👤 User profiles & roles]
                RL[ls_rateLimits<br/>📊 0 documents<br/>⏱️ Rate limiting data]
                UQ[ls_userQuotas<br/>📊 0 documents<br/>📈 User quota tracking]
                US[ls_users<br/>📊 1 document<br/>👥 Mongoose user model]
                LD[ls_leads<br/>📊 0 documents<br/>📧 Lead generation data]
            end
            
            subgraph "Legacy Collections (deprecated)"
                OLD_UP[userProfiles<br/>📊 2 documents<br/>⚠️ Legacy data]
                OLD_US[users<br/>📊 1 document<br/>⚠️ Legacy data]
            end
        end
        
        subgraph "Other App Collections (DO NOT TOUCH)"
            DLG[drleegpt_*<br/>🚫 DrLeeGPT app data]
            AV[av_*<br/>🚫 Audio/Video app data]
        end
    end

    %% Data flow relationships
    UP --> |User Profile Data| APP[LearningScience.ai App]
    RL --> |Rate Limiting| APP
    UQ --> |Quota Management| APP
    US --> |User Authentication| APP
    LD --> |Lead Management| APP
    
    %% Migration arrows
    OLD_UP -.->|Migrated| UP
    OLD_US -.->|Migrated| US
    
    %% Styling
    classDef activeCollection fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef legacyCollection fill:#fff3e0,stroke:#ef6c00,stroke-width:2px,stroke-dasharray: 5 5
    classDef otherAppCollection fill:#ffebee,stroke:#c62828,stroke-width:2px
    classDef app fill:#e8f5e8,stroke:#2e7d32,stroke-width:3px
    
    class UP,RL,UQ,US,LD activeCollection
    class OLD_UP,OLD_US legacyCollection
    class DLG,AV otherAppCollection
    class APP app
```

## Collection Details

### Active Collections (ls_ prefix)

| Collection | Purpose | Documents | Connection Method | File Location |
|------------|---------|-----------|-------------------|---------------|
| `ls_userProfiles` | User profiles, roles, and features | 1 | MongoDB Native Driver | `libs/userProfile.ts` |
| `ls_rateLimits` | API rate limiting tracking | 0 | MongoDB Native Driver | `libs/rateLimiter.ts` |
| `ls_userQuotas` | User quota management | 0 | MongoDB Native Driver | `libs/rateLimiter.ts` |
| `ls_users` | Mongoose user model | 1 | Mongoose ODM | `models/User.ts` |
| `ls_leads` | Lead generation from landing page | 0 | Mongoose ODM | `models/Lead.ts` |

### Current User Data

```mermaid
erDiagram
    ls_userProfiles {
        string userId PK "6816c101f3d0b212dafdccea"
        string email "socrates73@gmail.com"
        string name "User Name"
        enum role "ADMIN"
        object features "Feature flags"
        object usage "Usage statistics"
        date createdAt "Creation timestamp"
        date updatedAt "Last update timestamp"
    }
    
    ls_users {
        string _id PK "MongoDB ObjectId"
        string name "User display name"
        string email "User email address"
        string image "Profile image URL"
        string customerId "Stripe customer ID"
        string priceId "Stripe price ID"
        boolean hasAccess "Product access flag"
        date createdAt "Account creation"
        date updatedAt "Last modification"
    }
    
    ls_rateLimits {
        string userId FK "User identifier"
        string endpoint "API endpoint"
        number requestCount "Request count"
        date windowStart "Rate limit window start"
        date lastRequest "Last request timestamp"
    }
    
    ls_userQuotas {
        string userId FK "User identifier"
        number tokensUsed "Tokens consumed"
        number tokensAllowed "Token limit"
        date resetDate "Quota reset date"
        object monthlyUsage "Monthly breakdown"
    }
    
    ls_leads {
        string email PK "Lead email address"
        date createdAt "Lead capture timestamp"
        object metadata "Additional lead data"
    }
    
    ls_userProfiles ||--|| ls_users : "Same User"
    ls_userProfiles ||--o{ ls_rateLimits : "Rate Limits"
    ls_userProfiles ||--|| ls_userQuotas : "Usage Quotas"
```

## Migration Status

### ✅ Completed Migrations

1. **userProfiles → ls_userProfiles**
   - ✅ Valid admin user migrated
   - ✅ Role corrected to ADMIN
   - ✅ Invalid records cleaned up

2. **users → ls_users**
   - ✅ Mongoose model data migrated
   - ✅ 1 document successfully transferred

### 📋 Collections with No Source Data

- **rateLimits → ls_rateLimits**: No source data found
- **userQuotas → ls_userQuotas**: No source data found  
- **leads → ls_leads**: No source data found

## Database Connection Configuration

```javascript
// Environment Configuration
MONGODB_URI=mongodb+srv://admin:Descartes2!@cluster0.e8syucq.mongodb.net/learningscience?retryWrites=true&w=majority&appName=Cluster0

// The URI explicitly specifies the 'learningscience' database
// All collections automatically use this database
```

## Security & Isolation

```mermaid
graph LR
    subgraph "Database Isolation Strategy"
        A[LearningScience.ai] --> |ls_*| LS[learningscience database]
        B[DrLeeGPT] --> |drleegpt_*| DL[shared database]
        C[Audio/Video App] --> |av_*| AV[shared database]
    end
    
    LS --> |Isolated| D[No Conflicts]
    DL --> |Separated| D
    AV --> |Separated| D
    
    classDef app fill:#e1f5fe,stroke:#01579b
    classDef db fill:#f3e5f5,stroke:#7b1fa2
    classDef result fill:#e8f5e8,stroke:#2e7d32
    
    class A,B,C app
    class LS,DL,AV db
    class D result
```

## Usage Patterns

### User Profile Access
```mermaid
sequenceDiagram
    participant App as LearningScience.ai
    participant Auth as Authentication
    participant UP as ls_userProfiles
    participant US as ls_users
    
    App->>Auth: User login
    Auth->>UP: getUserProfile(userId)
    UP-->>Auth: Profile with role & features
    Auth->>US: Check Mongoose user data
    US-->>Auth: User account details
    Auth-->>App: Complete user session
```

### Rate Limiting Flow
```mermaid
sequenceDiagram
    participant API as API Request
    participant RL as RateLimiterService
    participant RLC as ls_rateLimits
    participant UQC as ls_userQuotas
    
    API->>RL: checkRateLimit(userId)
    RL->>RLC: Query current limits
    RL->>UQC: Check quota usage
    RLC-->>RL: Rate limit status
    UQC-->>RL: Quota availability
    RL-->>API: Allow/Deny request
```

## Maintenance & Monitoring

### Health Check Query
```javascript
// Check all collections have expected data
db.ls_userProfiles.countDocuments()  // Should be > 0
db.ls_rateLimits.countDocuments()    // May be 0 (rate limits created on demand)
db.ls_userQuotas.countDocuments()    // May be 0 (quotas created on demand)
db.ls_users.countDocuments()         // Should match userProfiles count
db.ls_leads.countDocuments()         // May be 0 (leads from marketing)
```

### Data Integrity Validation
```javascript
// Ensure all users have both profile and user record
const profiles = await db.ls_userProfiles.find({}).toArray()
const users = await db.ls_users.find({}).toArray()
// Profile count should match user count
```

---

**Status**: ✅ All data successfully migrated and verified  
**Last Updated**: 2025-05-30  
**Migration Completed**: Yes  
**Total Active Collections**: 5  
**Total Documents**: 2 (1 user profile + 1 user record)
