// Compact Old School Design System for User/Branch Pages
export const SharedStyles = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap');

        :root {
            --primary: #0F766E;
            --primary-dark: #0D9488;
            --primary-light: #14B8A6;
            --success: #059669;
            --danger: #DC2626;
            --warning: #D97706;
            --info: #0284C7;
            --text-dark: #111827;
            --text-base: #374151;
            --text-muted: #6B7280;
            --text-light: #9CA3AF;
            --bg-page: #F3F4F6;
            --bg-white: #FFFFFF;
            --bg-light: #F9FAFB;
            --border: #D1D5DB;
            --border-dark: #9CA3AF;
        }

        .user-page {
            background: var(--bg-page);
            min-height: 100vh;
            padding: 1rem;
            font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 13px;
            color: var(--text-base);
        }

        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            padding-bottom: 0.75rem;
            border-bottom: 2px solid var(--border);
        }

        .page-title {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--text-dark);
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin: 0;
        }

        .page-title svg {
            color: var(--primary);
        }

        .panel {
            background: var(--bg-white);
            border: 1px solid var(--border);
            border-radius: 4px;
            margin-bottom: 1rem;
        }

        .panel-header {
            background: var(--bg-light);
            border-bottom: 1px solid var(--border);
            padding: 0.5rem 0.75rem;
            font-weight: 600;
            font-size: 0.8125rem;
            color: var(--text-dark);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .panel-body {
            padding: 0.75rem;
        }

        .stats-row {
            display: flex;
            gap: 0.75rem;
            margin-bottom: 1rem;
            flex-wrap: wrap;
        }

        .stat-box {
            background: var(--bg-white);
            border: 1px solid var(--border);
            border-radius: 4px;
            padding: 0.625rem 0.875rem;
            flex: 1;
            min-width: 140px;
        }

        .stat-box:hover {
            border-color: var(--primary-light);
        }

        .stat-label {
            font-size: 0.6875rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--text-muted);
            margin-bottom: 0.25rem;
        }

        .stat-value {
            font-size: 1.125rem;
            font-weight: 700;
            color: var(--text-dark);
        }

        .stat-value.primary { color: var(--primary); }
        .stat-value.success { color: var(--success); }
        .stat-value.danger { color: var(--danger); }

        .btn {
            display: inline-flex;
            align-items: center;
            gap: 0.375rem;
            padding: 0.375rem 0.75rem;
            font-size: 0.8125rem;
            font-weight: 500;
            border-radius: 3px;
            cursor: pointer;
            transition: all 0.15s ease;
            border: 1px solid transparent;
            font-family: inherit;
        }

        .btn-sm {
            padding: 0.25rem 0.5rem;
            font-size: 0.75rem;
        }

        .btn-primary {
            background: var(--primary);
            color: white;
            border-color: var(--primary-dark);
        }

        .btn-primary:hover {
            background: var(--primary-dark);
        }

        .btn-success {
            background: var(--success);
            color: white;
            border-color: #047857;
        }

        .btn-success:hover {
            background: #047857;
        }

        .btn-danger {
            background: var(--danger);
            color: white;
            border-color: #B91C1C;
        }

        .btn-danger:hover {
            background: #B91C1C;
        }

        .btn-secondary {
            background: var(--bg-light);
            color: var(--text-base);
            border-color: var(--border);
        }

        .btn-secondary:hover {
            background: var(--border);
        }

        .btn-icon {
            width: 28px;
            height: 28px;
            padding: 0;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 3px;
        }

        .form-control {
            width: 100%;
            padding: 0.375rem 0.5rem;
            font-size: 0.8125rem;
            border: 1px solid var(--border);
            border-radius: 3px;
            background: var(--bg-white);
            color: var(--text-base);
            font-family: inherit;
        }

        .form-control:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 2px rgba(15, 118, 110, 0.15);
        }

        .form-control::placeholder {
            color: var(--text-light);
        }

        .form-select {
            padding: 0.375rem 1.75rem 0.375rem 0.5rem;
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
            background-position: right 0.375rem center;
            background-repeat: no-repeat;
            background-size: 1.25rem 1.25rem;
            appearance: none;
        }

        .form-label {
            display: block;
            font-size: 0.75rem;
            font-weight: 600;
            color: var(--text-muted);
            margin-bottom: 0.25rem;
        }

        .form-group {
            margin-bottom: 0.75rem;
        }

        .filter-bar {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
            align-items: center;
            padding: 0.5rem 0.75rem;
            background: var(--bg-white);
            border: 1px solid var(--border);
            border-radius: 4px;
            margin-bottom: 1rem;
        }

        .filter-bar .form-control,
        .filter-bar .form-select {
            width: auto;
            min-width: 150px;
        }

        .table-container {
            background: var(--bg-white);
            border: 1px solid var(--border);
            border-radius: 4px;
            overflow: hidden;
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.8125rem;
        }

        .data-table thead {
            background: #E5E7EB;
        }

        .data-table th {
            padding: 0.5rem 0.75rem;
            text-align: left;
            font-weight: 600;
            font-size: 0.6875rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--text-dark);
            border-bottom: 1px solid var(--border);
            white-space: nowrap;
        }

        .data-table td {
            padding: 0.5rem 0.75rem;
            border-bottom: 1px solid #F3F4F6;
            color: var(--text-base);
            vertical-align: middle;
        }

        .data-table tbody tr:hover {
            background: #F9FAFB;
        }

        .data-table tbody tr:last-child td {
            border-bottom: none;
        }

        .data-table .actions {
            display: flex;
            gap: 0.25rem;
        }

        .badge {
            display: inline-block;
            padding: 0.125rem 0.5rem;
            font-size: 0.6875rem;
            font-weight: 600;
            border-radius: 2px;
        }

        .badge-primary {
            background: #CCFBF1;
            color: #0F766E;
        }

        .badge-success {
            background: #D1FAE5;
            color: #065F46;
        }

        .badge-danger {
            background: #FEE2E2;
            color: #991B1B;
        }

        .badge-warning {
            background: #FEF3C7;
            color: #92400E;
        }

        .badge-info {
            background: #E0F2FE;
            color: #075985;
        }

        .badge-gray {
            background: #F3F4F6;
            color: var(--text-muted);
        }

        .code {
            font-family: 'IBM Plex Mono', monospace;
            font-size: 0.75rem;
            background: #F3F4F6;
            padding: 0.125rem 0.375rem;
            border-radius: 2px;
            color: var(--primary-dark);
        }

        .currency {
            font-weight: 600;
            color: var(--success);
        }

        .currency.negative {
            color: var(--danger);
        }

        .pagination {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.75rem;
            background: var(--bg-light);
            border-top: 1px solid var(--border);
        }

        .pagination-info {
            font-size: 0.75rem;
            color: var(--text-muted);
            margin: 0 0.5rem;
        }

        .empty-state {
            text-align: center;
            padding: 2rem 1rem;
            color: var(--text-muted);
        }

        .empty-state svg {
            color: var(--border);
            margin-bottom: 0.5rem;
        }

        .empty-state-text {
            font-size: 0.875rem;
        }

        .loading {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            color: var(--text-muted);
            gap: 0.5rem;
        }

        .spinner {
            width: 20px;
            height: 20px;
            border: 2px solid var(--border);
            border-top-color: var(--primary);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .modal-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }

        .modal {
            background: var(--bg-white);
            border-radius: 4px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            max-height: 90vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }

        .modal-sm { width: 360px; }
        .modal-md { width: 500px; }
        .modal-lg { width: 700px; }
        .modal-xl { width: 900px; }

        .modal-header {
            background: var(--primary);
            color: white;
            padding: 0.625rem 1rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .modal-title {
            font-size: 0.875rem;
            font-weight: 600;
            margin: 0;
        }

        .modal-close {
            background: transparent;
            border: none;
            color: white;
            cursor: pointer;
            padding: 0.25rem;
            display: flex;
            opacity: 0.8;
        }

        .modal-close:hover {
            opacity: 1;
        }

        .modal-body {
            padding: 1rem;
            overflow-y: auto;
            max-height: calc(90vh - 120px);
        }

        .modal-footer {
            padding: 0.75rem 1rem;
            background: var(--bg-light);
            border-top: 1px solid var(--border);
            display: flex;
            justify-content: flex-end;
            gap: 0.5rem;
        }

        .grid-2 {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
        }

        .grid-3 {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.75rem;
        }

        .grid-4 {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 0.75rem;
        }

        .flex {
            display: flex;
        }

        .flex-between {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .flex-center {
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .gap-1 { gap: 0.25rem; }
        .gap-2 { gap: 0.5rem; }
        .gap-3 { gap: 0.75rem; }

        .text-primary { color: var(--primary); }
        .text-success { color: var(--success); }
        .text-danger { color: var(--danger); }
        .text-warning { color: var(--warning); }
        .text-muted { color: var(--text-muted); }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
        .font-bold { font-weight: 700; }

        .mb-1 { margin-bottom: 0.25rem; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mb-3 { margin-bottom: 0.75rem; }
        .mt-2 { margin-top: 0.5rem; }

        .chart-panel {
            background: var(--bg-white);
            border: 1px solid var(--border);
            border-radius: 4px;
            padding: 0.75rem;
        }

        .chart-title {
            font-size: 0.8125rem;
            font-weight: 600;
            color: var(--text-dark);
            margin-bottom: 0.75rem;
            display: flex;
            align-items: center;
            gap: 0.375rem;
        }

        .thumb {
            width: 40px;
            height: 40px;
            object-fit: cover;
            border-radius: 3px;
            border: 1px solid var(--border);
        }

        .progress {
            height: 6px;
            background: #E5E7EB;
            border-radius: 3px;
            overflow: hidden;
        }

        .progress-bar {
            height: 100%;
            background: var(--primary);
            transition: width 0.3s ease;
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.5rem;
        }

        .info-item {
            background: var(--bg-light);
            padding: 0.5rem 0.75rem;
            border-radius: 3px;
            border: 1px solid var(--border);
        }

        .info-label {
            font-size: 0.625rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--text-muted);
        }

        .info-value {
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--text-dark);
        }

        @media (max-width: 1024px) {
            .grid-4 { grid-template-columns: repeat(2, 1fr); }
            .grid-3 { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 640px) {
            .grid-2,
            .grid-3,
            .grid-4 { grid-template-columns: 1fr; }
            
            .filter-bar {
                flex-direction: column;
            }
            
            .filter-bar .form-control,
            .filter-bar .form-select {
                width: 100%;
            }

            .stats-row {
                flex-direction: column;
            }

            .stat-box {
                min-width: 100%;
            }
        }
    `}</style>
);

export default SharedStyles;

