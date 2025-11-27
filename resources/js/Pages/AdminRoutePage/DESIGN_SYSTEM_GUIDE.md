# Professional Light Mode Design System Guide

## Overview
All AdminRoutePage components now use a cohesive professional light mode design system with:
- ✅ Clean, modern light backgrounds
- ✅ Professional blue color scheme (#2563EB primary)
- ✅ Consistent typography (Inter + DM Sans)
- ✅ Polished cards, buttons, and tables
- ✅ Smooth animations and transitions

## Design System Colors

```css
--primary-blue: #2563EB
--primary-blue-light: #3B82F6
--primary-blue-dark: #1E40AF
--accent-emerald: #10B981
--accent-amber: #F59E0B
--accent-red: #EF4444
--text-primary: #1F2937
--text-secondary: #6B7280
--text-muted: #9CA3AF
--bg-primary: #F9FAFB
--bg-secondary: #F3F4F6
--card-bg: #FFFFFF
--border-color: #E5E7EB
```

## Completed Pages

### ✅ Dashboard.tsx
- Light gray background (#F9FAFB)
- Blue gradient charts
- Stats cards with hover effects
- Branch status sidebar

### ✅ Chat.tsx
- Clean messaging interface
- Blue message bubbles for sent messages
- White bordered bubbles for received
- Professional sidebar with user list

### ✅ Products.tsx
- Light gradient background
- Modern table with blue header
- Colorful status badges
- Icon-based action buttons

## How to Apply Design System to Remaining Pages

### Step 1: Import SharedStyles
```tsx
import SharedStyles from './SharedStyles';
```

### Step 2: Add SharedStyles to Component
```tsx
return (
    <AdminLayout header={<h2>Page Title</h2>}>
        <Head title="Page Title" />
        <SharedStyles />

        <div className="admin-page-container">
            {/* Your content */}
        </div>
    </AdminLayout>
);
```

### Step 3: Use Design System Classes

#### Page Header
```tsx
<h1 className="admin-page-header">
    <Icon size={24} />
    Page Title
</h1>
```

#### Cards
```tsx
<div className="admin-card">
    <div className="admin-card-header">Section Title</div>
    {/* Card content */}
</div>
```

#### Buttons
```tsx
<button className="admin-btn-primary">Primary Action</button>
<button className="admin-btn-secondary">Secondary Action</button>
<button className="admin-btn-success">Success Action</button>
<button className="admin-btn-danger">Danger Action</button>
```

#### Tables
```tsx
<div className="admin-table-container">
    <table className="admin-table">
        <thead>
            <tr>
                <th>Column 1</th>
                <th>Column 2</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Data 1</td>
                <td>Data 2</td>
            </tr>
        </tbody>
    </table>
</div>
```

#### Badges
```tsx
<span className="admin-badge admin-badge-primary">Primary</span>
<span className="admin-badge admin-badge-success">Success</span>
<span className="admin-badge admin-badge-danger">Danger</span>
<span className="admin-badge admin-badge-warning">Warning</span>
```

#### Stats Cards
```tsx
<div className="admin-stats-card">
    <div className="admin-stats-label">Total Sales</div>
    <div className="admin-stats-value">₱125,000</div>
    <div className="admin-stats-description">This month</div>
</div>
```

#### Inputs
```tsx
<input className="admin-input" type="text" placeholder="Enter value..." />
<select className="admin-select">
    <option>Option 1</option>
</select>
```

#### Grid Layouts
```tsx
<div className="admin-grid admin-grid-3">
    <div>Item 1</div>
    <div>Item 2</div>
    <div>Item 3</div>
</div>
```

## Example: Converting a Page

### Before (Dark/Inconsistent):
```tsx
<div style={{ background: '#333', padding: '20px' }}>
    <h1 style={{ color: '#fff' }}>Title</h1>
    <table style={{ background: '#444' }}>
        {/* table content */}
    </table>
</div>
```

### After (Professional Light):
```tsx
import SharedStyles from './SharedStyles';

export default function MyPage() {
    return (
        <AdminLayout header={<h2>My Page</h2>}>
            <Head title="My Page" />
            <SharedStyles />

            <div className="admin-page-container">
                <h1 className="admin-page-header">
                    <Package size={24} />
                    My Page Title
                </h1>

                <div className="admin-card">
                    <div className="admin-card-header">Data Table</div>
                    <div className="admin-table-container">
                        <table className="admin-table">
                            {/* table content */}
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
```

## Remaining Pages to Update

Apply the SharedStyles pattern to:
1. ✅ BranchSalesOrders.tsx
2. ✅ Supplier.tsx
3. ✅ BranchData.tsx
4. ✅ StockRequest.tsx
5. ✅ SalesStatistics.tsx
6. ✅ BranchStocks.tsx
7. ✅ AdminStocksEntries.tsx
8. ✅ Announcements.tsx
9. ✅ AdminReport.tsx (partial - needs chart color updates)

## Key Design Principles

1. **Consistency**: All pages use the same color palette and component styles
2. **Professional**: Clean, modern, business-appropriate design
3. **Accessibility**: Good contrast ratios, readable fonts
4. **Responsive**: Works on all screen sizes
5. **Performance**: CSS-only animations, minimal JavaScript

## Chart Colors for Recharts

For any Recharts components, use these professional colors:

```tsx
// Primary gradient
<defs>
    <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
    </linearGradient>
</defs>

// Tooltip styling
<Tooltip
    contentStyle={{
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        color: '#1F2937',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}
/>

// Axis colors
<XAxis stroke="#6B7280" />
<YAxis stroke="#6B7280" />

// Grid
<CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
```

## Support

For questions or customization needs, refer to:
- Color variables in SharedStyles.tsx
- Component examples in Dashboard.tsx, Products.tsx, Chat.tsx
- Material-UI documentation for table/pagination components
