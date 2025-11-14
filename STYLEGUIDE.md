# Micro-Timeline Style Guide

## Color Palette

### Dominant Color
- **Medical Blue** - `hsl(217, 91%, 60%)` (#4A90E2)
  - Used for: Primary actions, medication indicators, primary CTA buttons
  - Represents trust, professionalism, and healthcare

### Secondary Color
- **Calming Green** - `hsl(152, 69%, 31%)` (#1A8B5E)
  - Used for: Success states, completed items, positive confirmations
  - Represents health, wellness, and completion

### Accent Colors
- **Accent Purple** - `hsl(271, 81%, 56%)` (#9D4EDD)
  - Used for: Appointments, scheduled events
  - Adds visual distinction for calendar-based items

- **Accent Cyan** - `hsl(199, 89%, 48%)` (#13B5EA)
  - Used for: Lab results, clinical data
  - Represents scientific/medical data

- **Accent Amber** - `hsl(38, 92%, 50%)` (#F59E0B)
  - Used for: Warnings, pending items, attention-needed states
  - Signals caution without alarm

- **Alert Red** - `hsl(0, 84%, 60%)` (#E74C3C)
  - Used for: Missed medications, critical alerts, errors
  - Represents urgency and important notifications

## Typography

### Primary Font Family
**System Font Stack**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
- Provides native feel across different operating systems
- Ensures fast loading and optimal rendering
- Excellent readability for medical information

### Font Weights & Usage

#### Regular (400)
- **Body Text**: All paragraph text, descriptions, standard UI text
- **Small Text**: Helper text, timestamps, metadata
- Example: Entry descriptions, provider information

#### Medium (500)
- **Labels**: Form labels, section labels
- **Navigation**: Tab labels, menu items
- Example: "Entry Type", "Time", "Provider"

#### Semibold (600)
- **Headings**: All heading levels (H1-H4)
- **Card Titles**: Timeline entry titles
- **Important Labels**: Status indicators, badge text
- Example: "Morning Medication - Lisinopril 10mg", "Today's Timeline"

#### Bold (700)
- **Primary Heading**: Main page title
- **Emphasis**: Critical information that needs strong emphasis
- Example: "Micro-Timeline" header

### Font Sizes
- **3XL (30px)**: Main page heading
- **2XL (24px)**: Section headings
- **Base (16px)**: Body text, entry descriptions
- **SM (14px)**: Labels, metadata
- **XS (12px)**: Timestamps, helper text

## Icon System

### Library
**Lucide React** - A clean, consistent icon set with medical-appropriate styling

### Usage Examples

#### Medication Tracking
- **Icon**: `Pill`
- **Context**: Medication entries, dosage tracking
- **Color**: Medical Blue
- **Example**: Shown alongside "Morning Medication - Lisinopril 10mg"

#### Appointments
- **Icon**: `Calendar`
- **Context**: Scheduled appointments, future events
- **Color**: Accent Purple
- **Example**: Shown with "Cardiology Follow-up"

#### Lab Results
- **Icon**: `FlaskConical`
- **Context**: Clinical test results, lab data
- **Color**: Accent Cyan
- **Example**: Displayed with "Returned Lab Result"

### Additional Icons in Use
- `CheckCircle2` - Completed status
- `AlertCircle` - Warning states
- `XCircle` - Missed/error states
- `Clock` - Time indicators
- `TrendingUp` - Summary/analytics view
- `Plus` - Add new entry action
- `Download` - Export functionality

## Design Principles

### Accessibility
- Minimum contrast ratio of 4.5:1 for normal text
- Color is never the only indicator (icons + text for status)
- Touch targets minimum 44x44px

### Visual Hierarchy
- Important information (medication checkboxes, status) prominently displayed
- Timeline structure provides clear chronological flow
- Color-coded entries for quick visual scanning

### Responsiveness
- Mobile-first approach
- Flexible layouts that adapt to screen size
- Touch-friendly interactive elements

### Consistency
- All colors use HSL values for easy theming
- Semantic tokens ensure design system coherence
- Icons from single library maintain visual consistency
