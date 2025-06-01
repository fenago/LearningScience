# Admin Page & Profile Page Specifications

Below are detailed specifications for both the Admin Page and Profile Page using 21st.dev and MagicUI components, with a focus on API key management and per-user token tracking.

## Admin Page Specification

### Overview
The Admin Page provides a comprehensive dashboard for administrators to monitor user activity, manage API keys, and track token usage across the platform.

### Layout Structure
- **Header**: MagicUI Navbar with admin profile dropdown and notification bell
- **Sidebar**: 21st.dev SideNav with collapsible sections and active indicators
- **Main Content Area**: Responsive grid layout with MagicUI Card components
- **Footer**: Minimal footer with version info and support links

### Key Sections

#### 1. Dashboard Overview
- **Component**: MagicUI Stats Grid with 21st.dev Stat Cards
- **Content**:
  - Total active users counter with MagicUI CountUp animation
  - Platform-wide token usage with MagicUI Sparkline charts
  - API key status summary (active/inactive/expired)
  - System health indicators with MagicUI StatusIndicator

#### 2. User Management
- **Component**: 21st.dev DataTable with MagicUI TableShine effect
- **Features**:
  - Sortable/filterable user list with pagination
  - Quick view of API key status per user (own key/admin key/none)
  - Token usage indicators with MagicUI LinearProgress
  - Inline actions menu with MagicUI DropdownMenu
  - Bulk actions with MagicUI MultiSelect

#### 3. API Key Management
- **Component**: MagicUI TabGroup with 21st.dev ContentCards
- **Tabs**:
  - **Platform Keys**: Admin-managed keys for system-wide use
  - **User Keys**: Overview of user-provided keys with status
  - **Key Policies**: Rules for key usage and override conditions

#### 4. Key Override Controls
- **Component**: 21st.dev SettingsPanel with MagicUI ToggleGroup
- **Features**:
  - Global override toggle with MagicUI Switch
  - Conditional override rules builder:
    - Override when user key is missing
    - Override when user key has exceeded rate limits
    - Override for specific user groups/roles
  - Override notification settings with MagicUI RadioGroup
  - Default model selection for admin key usage

#### 5. Token Tracking Dashboard
- **Component**: MagicUI DataView with 21st.dev ChartCards
- **Features**:
  - User-by-user token consumption with MagicUI BarChart
  - Model-specific usage breakdown with MagicUI PieChart
  - Time-series usage data with MagicUI LineChart and SparkBars
  - Cost analysis with 21st.dev MetricCards
  - Export functionality with MagicUI DropdownMenu

#### 6. Alerts & Notifications
- **Component**: 21st.dev AlertPanel with MagicUI Toast integration
- **Features**:
  - Usage threshold alerts configuration
  - API key expiration notifications
  - Unusual activity detection settings
  - Notification delivery preferences (email, in-app, webhook)

### Interactive Elements

#### User Detail Modal
- **Component**: MagicUI Dialog with 21st.dev Tabs
- **Content**:
  - User profile information
  - API key details with MagicUI SecretField (partial visibility)
  - Token usage history with MagicUI TimelineChart
  - Admin actions panel:
    - Force API key override toggle
    - Reset token count button
    - Set usage limits controls
    - Access restriction options

#### API Key Override Confirmation
- **Component**: MagicUI ConfirmDialog with 21st.dev ActionButtons
- **Features**:
  - Clear explanation of override impact
  - Duration selection for temporary overrides
  - Option to notify user of override
  - Reason documentation field

### Animations & Microinteractions
- MagicUI Spotlight effect on hovering over user cards
- MagicUI ShimmerButton for primary actions
- MagicUI BorderBeam effect for highlighting selected users
- 21st.dev MotionCard for expanding user details
- MagicUI TabIndicator with smooth transitions between sections

### Responsive Behavior
- Collapsible sidebar on smaller screens
- Stacked card layout on mobile devices
- Simplified data tables with expandable rows on mobile
- Touch-optimized controls for tablet users

## Profile Page Specification

### Overview
The Profile Page allows users to manage their personal information, API key settings, and monitor their token usage.

### Layout Structure
- **Header**: MagicUI ProfileHeader with user avatar and cover image
- **Navigation**: 21st.dev TabNav with underline indicators
- **Content Area**: Single column layout with responsive sections
- **Action Bar**: Sticky bottom bar on mobile for primary actions

### Key Sections

#### 1. Personal Information
- **Component**: 21st.dev ProfileCard with MagicUI FormFields
- **Content**:
  - User avatar with MagicUI AvatarUpload
  - Basic information (name, email, role)
  - Account preferences
  - Theme selector with MagicUI ThemeSwitch

#### 2. API Key Management
- **Component**: MagicUI Card with 21st.dev ContentSection
- **Features**:
  - API key input field with MagicUI SecretInput
  - Key validation status with MagicUI StatusBadge
  - Key generation date and expiration information
  - Usage limits visualization with MagicUI RadialProgress
  - Admin override status indicator with tooltip explanation

#### 3. Token Usage Analytics
- **Component**: 21st.dev MetricsPanel with MagicUI Charts
- **Content**:
  - Current billing period usage summary
  - Daily/weekly/monthly toggle with MagicUI SegmentedControl
  - Usage breakdown by model with MagicUI StackedBarChart
  - Cost estimation with MagicUI ValueCard
  - Usage history with MagicUI AreaChart

#### 4. Usage Preferences
- **Component**: 21st.dev SettingsForm with MagicUI FormControls
- **Features**:
  - Default model selection with MagicUI Select
  - Usage alerts configuration with MagicUI Slider
  - Token conservation options with MagicUI CheckboxGroup
  - Response length preferences

#### 5. Admin Override Status
- **Component**: MagicUI InfoCard with 21st.dev StatusSection
- **Content**:
  - Current override status (active/inactive)
  - Reason for override if applicable
  - Duration of override if temporary
  - Request removal option with MagicUI Button
  - History of previous overrides with MagicUI Timeline

### Interactive Elements

#### API Key Management Dialog
- **Component**: MagicUI Dialog with 21st.dev ActionPanel
- **Features**:
  - Generate new key option
  - Validate existing key
  - View key usage statistics
  - Set key restrictions
  - Delete key confirmation

#### Usage Alert Configuration
- **Component**: MagicUI SlideOver with 21st.dev FormGrid
- **Content**:
  - Daily/weekly/monthly threshold settings
  - Notification preferences
  - Auto-pause options
  - Cost limit controls

### Animations & Microinteractions
- MagicUI TextReveal for sensitive information
- MagicUI GlowButton for primary actions
- MagicUI ShineHover effect on cards
- 21st.dev MotionFade for section transitions
- MagicUI SuccessConfetti on successful key validation

### Responsive Behavior
- Full-width cards on mobile
- Collapsible sections for better mobile navigation
- Touch-friendly input controls
- Simplified charts on smaller screens

## API Key Management & Override Logic

### User-Provided API Key Flow
1. User enters their Gemini API key in the Profile Page
2. System validates the key through a secure backend call
3. On validation success:
   - Key is stored securely (encrypted)
   - User's token tracking is initialized
   - Override status is set to inactive
4. On validation failure:
   - Error message is displayed with MagicUI ErrorToast
   - Option to retry or use admin key is presented

### Admin Override Logic
1. Override can be activated:
   - Globally for all users
   - For specific users
   - Based on conditions (missing key, exceeded limits)
2. When override is active:
   - User is notified via MagicUI Notification
   - Profile page shows override status
   - All API calls use admin key instead of user key
3. Override can be:
   - Temporary (time-based)
   - Conditional (triggers when conditions are met)
   - Permanent (until manually disabled)

### Token Tracking Implementation
1. Per-user token tracking:
   - Tracks input and output tokens separately
   - Records model used for each request
   - Timestamps all usage for time-series analysis
2. Real-time updates:
   - Profile page shows live token usage
   - Admin dashboard updates with minimal delay
3. Reporting features:
   - Exportable usage reports
   - Cost estimation based on current pricing
   - Usage forecasting with trend analysis

This specification provides a comprehensive framework for implementing both the Admin and Profile pages with a focus on API key management and per-user token tracking, using modern 21st.dev and MagicUI components for an engaging, interactive user experience.
