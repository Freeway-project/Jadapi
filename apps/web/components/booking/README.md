# BookingFlow Component Architecture

## Overview
The BookingFlow component has been refactored into a modular, maintainable architecture following best practices for React component composition.

## Component Structure

```
components/booking/
├── BookingFlow.tsx          # Main orchestrator component
├── components/
│   ├── ProgressSteps.tsx    # Progress indicator with step navigation
│   ├── FareEstimate.tsx     # Fare display card
│   ├── UserInfoForm.tsx     # Reusable sender/recipient form
│   ├── ReviewOrder.tsx      # Order review step
│   ├── PaymentSection.tsx   # Payment step UI
│   └── index.ts            # Barrel exports
└── README.md
```

## Component Details

### 1. BookingFlow (Main Component)
**Location**: `BookingFlow.tsx`
**Responsibility**: Orchestrates the booking flow, manages state, and coordinates child components

**Props**:
- `estimate: FareEstimateResponse` - Fare calculation data
- `pickupAddress?: string` - Prefilled pickup address
- `dropoffAddress?: string` - Prefilled delivery address
- `onBack?: () => void` - Callback for back navigation
- `onComplete?: () => void` - Callback on booking completion

**State Management**:
- `currentStep` - Tracks current booking step
- `sender` - Sender details
- `recipient` - Recipient details

### 2. ProgressSteps
**Location**: `components/ProgressSteps.tsx`
**Responsibility**: Visual progress indicator showing current step

**Props**:
- `steps: Step[]` - Array of step definitions
- `currentStep: BookingStep` - Currently active step

**Features**:
- Blue gradient header with Porter-style design
- Active/completed/pending state visualization
- Responsive step indicators

### 3. FareEstimate
**Location**: `components/FareEstimate.tsx`
**Responsibility**: Display fare summary with distance and duration

**Props**:
- `estimate: FareEstimateResponse` - Fare data

**Features**:
- Gradient blue background
- Large, prominent price display
- Distance and duration metadata

### 4. UserInfoForm
**Location**: `components/UserInfoForm.tsx`
**Responsibility**: Reusable form for sender and recipient information

**Props**:
- `type: 'sender' | 'recipient'` - Form type
- `icon: LucideIcon` - Section icon
- `title: string` - Section title
- `userDetails: UserDetails` - Current form values
- `onUpdate: (details: UserDetails) => void` - Update callback

**Features**:
- UUID-based quick autofill
- Debounced user search (500ms)
- Phone number extraction from `auth.phone`
- Adaptive placeholders and labels based on type
- Professional blue focus states

**User Search Flow**:
1. User types UUID (e.g., "JAD12345")
2. 500ms debounce delay
3. API call to `/api/users/uuid/:uuid`
4. Display suggestion with name and phone
5. One-click autofill of all fields

### 5. ReviewOrder
**Location**: `components/ReviewOrder.tsx`
**Responsibility**: Display order summary for review

**Props**:
- `sender: UserDetails` - Sender information
- `recipient: UserDetails` - Recipient information
- `estimate: FareEstimateResponse` - Fare data

**Features**:
- Visual route display with blue/green markers
- Contact details display
- Pickup/delivery notes
- Price breakdown (subtotal, tax, total)

### 6. PaymentSection
**Location**: `components/PaymentSection.tsx`
**Responsibility**: Payment step UI

**Props**:
- `estimate: FareEstimateResponse` - Fare data

**Features**:
- Large amount display
- Stripe integration placeholder
- Professional blue theme

## Shared Utilities

### useDebounce Hook
**Location**: `hooks/useDebounce.ts`
**Purpose**: Debounce input values to reduce API calls

```typescript
const debouncedValue = useDebounce(value, 500);
```

## Type Definitions

### BookingStep
```typescript
type BookingStep = 'sender' | 'recipient' | 'review' | 'payment';
```

### UserDetails
```typescript
interface UserDetails {
  name: string;
  phone: string;
  address: string;
  notes?: string;
}
```

## Design System

### Color Palette (Porter-Inspired)
- **Primary Blue**: `from-blue-600 to-blue-700`
- **Hover**: `from-blue-700 to-blue-800`
- **Background**: `from-blue-50 to-indigo-50`
- **Accents**: `bg-blue-100`, `text-blue-600`
- **Success**: `bg-green-500`
- **Borders**: `border-gray-200`, `border-blue-100`

### Typography
- **Headings**: `text-lg font-semibold text-gray-900`
- **Labels**: `text-sm font-medium text-gray-700`
- **Body**: `text-sm text-gray-600`
- **Price**: `text-3xl font-bold text-blue-600`

### Spacing
- **Section Gap**: `space-y-5`
- **Form Gap**: `space-y-4`
- **Padding**: `p-5`, `p-6`

## Benefits of Modular Architecture

1. **Reusability**: UserInfoForm serves both sender and recipient
2. **Maintainability**: Each component has single responsibility
3. **Testability**: Components can be tested in isolation
4. **Scalability**: Easy to add new steps or modify existing ones
5. **Type Safety**: Full TypeScript support with proper interfaces
6. **Code Organization**: Clear separation of concerns
7. **Performance**: Components can be optimized individually

## Usage Example

```typescript
import BookingFlow from '@/components/booking/BookingFlow';

function CheckoutPage() {
  const estimate = useFareEstimate();

  return (
    <BookingFlow
      estimate={estimate}
      pickupAddress="123 Main St, Vancouver, BC"
      dropoffAddress="456 Oak Ave, Burnaby, BC"
      onBack={() => router.back()}
      onComplete={() => router.push('/orders')}
    />
  );
}
```

## Future Enhancements

1. **Validation**: Add form validation with error messages
2. **Loading States**: Add loading indicators for API calls
3. **Error Handling**: Display user-friendly error messages
4. **Animations**: Add smooth transitions between steps
5. **Accessibility**: Enhance ARIA labels and keyboard navigation
6. **Mobile Optimization**: Improve responsive design
7. **Stripe Integration**: Complete payment processing
8. **Order Creation**: Implement actual API calls

## Testing Strategy

Each component should be tested:
- **Unit Tests**: Component rendering and props
- **Integration Tests**: User interactions and state updates
- **E2E Tests**: Complete booking flow
- **Accessibility Tests**: WCAG compliance

## Version History

- **v2.0** (Current): Modular architecture with Porter design
- **v1.0**: Monolithic BookingFlow component
