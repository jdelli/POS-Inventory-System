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

        /* ===== POS SYSTEM STYLES ===== */
        .pos-container {
            background: var(--bg-page);
            min-height: 100vh;
            font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 13px;
            color: var(--text-base);
        }

        .pos-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem 1rem;
            background: var(--bg-white);
            border-bottom: 2px solid var(--border);
        }

        .pos-view-toggle {
            display: flex;
            gap: 0.25rem;
            background: var(--bg-light);
            padding: 0.25rem;
            border-radius: 6px;
        }

        .pos-toggle-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.375rem;
            padding: 0.375rem 0.75rem;
            font-size: 0.75rem;
            font-weight: 500;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.15s ease;
            background: transparent;
            color: var(--text-muted);
        }

        .pos-toggle-btn:hover {
            color: var(--text-base);
        }

        .pos-toggle-btn.active {
            background: var(--primary);
            color: white;
            box-shadow: 0 1px 3px rgba(15, 118, 110, 0.3);
        }

        .pos-layout {
            display: grid;
            grid-template-columns: 1fr 340px;
            gap: 0;
            height: calc(100vh - 120px);
        }

        /* Products Panel */
        .pos-products-panel {
            display: flex;
            flex-direction: column;
            padding: 1rem;
            overflow: hidden;
        }

        .pos-search {
            position: relative;
            margin-bottom: 0.75rem;
        }

        .pos-search-icon {
            position: absolute;
            left: 10px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-light);
        }

        .pos-search-input {
            width: 100%;
            padding: 0.5rem 2rem 0.5rem 2.25rem;
            font-size: 0.8125rem;
            border: 1px solid var(--border);
            border-radius: 6px;
            background: var(--bg-white);
            transition: all 0.15s ease;
        }

        .pos-search-input:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 2px rgba(15, 118, 110, 0.15);
        }

        .pos-search-clear {
            position: absolute;
            right: 8px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            cursor: pointer;
            color: var(--text-muted);
            padding: 0.25rem;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .pos-search-clear:hover {
            color: var(--danger);
        }

        /* Category Tabs */
        .pos-categories {
            display: flex;
            gap: 0.375rem;
            flex-wrap: wrap;
            margin-bottom: 0.75rem;
            padding-bottom: 0.75rem;
            border-bottom: 1px solid var(--border);
        }

        .pos-category-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.375rem;
            padding: 0.375rem 0.625rem;
            font-size: 0.6875rem;
            font-weight: 500;
            border: 1px solid var(--border);
            border-radius: 100px;
            background: var(--bg-white);
            color: var(--text-muted);
            cursor: pointer;
            transition: all 0.15s ease;
            white-space: nowrap;
        }

        .pos-category-btn:hover {
            border-color: var(--primary-light);
            color: var(--primary);
        }

        .pos-category-btn.active {
            background: var(--primary);
            border-color: var(--primary);
            color: white;
        }

        /* Products Grid */
        .pos-products-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
            gap: 0.5rem;
            overflow-y: auto;
            padding-right: 0.5rem;
            flex: 1;
            align-content: start;
        }

        .pos-products-grid::-webkit-scrollbar {
            width: 6px;
        }

        .pos-products-grid::-webkit-scrollbar-thumb {
            background: var(--border);
            border-radius: 3px;
        }

        .pos-products-grid::-webkit-scrollbar-thumb:hover {
            background: var(--border-dark);
        }

        .pos-product-card {
            background: var(--bg-white);
            border: 1px solid var(--border);
            border-radius: 6px;
            overflow: hidden;
            cursor: pointer;
            transition: all 0.2s ease;
            position: relative;
        }

        .pos-product-card:hover {
            border-color: var(--primary-light);
            box-shadow: 0 4px 12px rgba(15, 118, 110, 0.12);
            transform: translateY(-2px);
        }

        .pos-product-card.out-of-stock {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .pos-product-card.out-of-stock:hover {
            border-color: var(--border);
            box-shadow: none;
            transform: none;
        }

        .pos-product-image {
            position: relative;
            aspect-ratio: 5/4;
            background: var(--bg-light);
            overflow: hidden;
            max-height: 100px;
        }

        .pos-product-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.2s ease;
        }

        .pos-product-card:hover .pos-product-image img {
            transform: scale(1.05);
        }

        .pos-stock-badge {
            position: absolute;
            top: 6px;
            right: 6px;
            padding: 0.125rem 0.375rem;
            font-size: 0.625rem;
            font-weight: 700;
            border-radius: 3px;
        }

        .pos-stock-ok {
            background: #D1FAE5;
            color: #065F46;
        }

        .pos-stock-low {
            background: #FEF3C7;
            color: #92400E;
        }

        .pos-stock-out {
            background: #FEE2E2;
            color: #991B1B;
        }

        .pos-product-info {
            padding: 0.375rem 0.5rem;
        }

        .pos-product-code {
            font-family: 'IBM Plex Mono', monospace;
            font-size: 0.625rem;
            color: var(--text-light);
            display: block;
            margin-bottom: 0.125rem;
        }

        .pos-product-name {
            font-size: 0.6875rem;
            font-weight: 600;
            color: var(--text-dark);
            margin: 0 0 0.125rem;
            line-height: 1.25;
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        .pos-product-price {
            font-size: 0.75rem;
            font-weight: 700;
            color: var(--primary);
        }

        .pos-product-add {
            position: absolute;
            bottom: 6px;
            right: 6px;
            width: 24px;
            height: 24px;
            background: var(--primary);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: all 0.2s ease;
            transform: scale(0.8);
        }

        .pos-product-card:hover .pos-product-add {
            opacity: 1;
            transform: scale(1);
        }

        .pos-loading,
        .pos-empty {
            grid-column: 1 / -1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 3rem;
            color: var(--text-muted);
            gap: 0.5rem;
        }

        .pos-empty svg {
            color: var(--border);
        }

        .pos-pagination {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.75rem 0 0;
            border-top: 1px solid var(--border);
            margin-top: 0.75rem;
        }

        /* Cart Panel */
        .pos-cart-panel {
            display: flex;
            flex-direction: column;
            background: var(--bg-white);
            border-left: 1px solid var(--border);
        }

        .pos-cart-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem 1rem;
            background: var(--primary);
            color: white;
        }

        .pos-cart-header h3 {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.875rem;
            font-weight: 600;
            margin: 0;
        }

        .pos-cart-count {
            background: white;
            color: var(--primary);
            padding: 0.125rem 0.5rem;
            border-radius: 100px;
            font-size: 0.6875rem;
            font-weight: 700;
        }

        .pos-clear-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            padding: 0.25rem 0.5rem;
            font-size: 0.6875rem;
            background: rgba(255, 255, 255, 0.15);
            border: none;
            border-radius: 3px;
            color: white;
            cursor: pointer;
            transition: all 0.15s ease;
        }

        .pos-clear-btn:hover {
            background: rgba(255, 255, 255, 0.25);
        }

        .pos-cart-items {
            flex: 1;
            overflow-y: auto;
            padding: 0.75rem;
        }

        .pos-cart-items::-webkit-scrollbar {
            width: 4px;
        }

        .pos-cart-items::-webkit-scrollbar-thumb {
            background: var(--border);
            border-radius: 2px;
        }

        .pos-cart-item {
            background: var(--bg-light);
            border: 1px solid var(--border);
            border-radius: 4px;
            padding: 0.625rem;
            margin-bottom: 0.5rem;
        }

        .pos-cart-item-info {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 0.375rem;
        }

        .pos-cart-item-name {
            font-size: 0.75rem;
            font-weight: 600;
            color: var(--text-dark);
            line-height: 1.3;
            flex: 1;
            padding-right: 0.5rem;
        }

        .pos-cart-item-price {
            font-size: 0.6875rem;
            color: var(--text-muted);
            white-space: nowrap;
        }

        .pos-cart-item-controls {
            display: flex;
            align-items: center;
            gap: 0.375rem;
        }

        .pos-cart-item-controls button {
            width: 22px;
            height: 22px;
            border: 1px solid var(--border);
            border-radius: 3px;
            background: var(--bg-white);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-base);
            transition: all 0.15s ease;
        }

        .pos-cart-item-controls button:hover {
            border-color: var(--primary);
            color: var(--primary);
        }

        .pos-cart-item-controls button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .pos-cart-item-qty {
            font-size: 0.75rem;
            font-weight: 600;
            min-width: 24px;
            text-align: center;
        }

        .pos-remove-btn:hover {
            border-color: var(--danger) !important;
            color: var(--danger) !important;
        }

        .pos-cart-item-subtotal {
            text-align: right;
            font-size: 0.8125rem;
            font-weight: 700;
            color: var(--primary);
            margin-top: 0.375rem;
            padding-top: 0.375rem;
            border-top: 1px dashed var(--border);
        }

        .pos-cart-empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            color: var(--text-muted);
            text-align: center;
            height: 100%;
        }

        .pos-cart-empty svg {
            color: var(--border);
            margin-bottom: 0.5rem;
        }

        .pos-cart-empty span {
            font-size: 0.8125rem;
            font-weight: 500;
        }

        .pos-cart-empty small {
            font-size: 0.6875rem;
            color: var(--text-light);
        }

        /* Order Form */
        .pos-order-form {
            padding: 0.75rem;
            border-top: 1px solid var(--border);
            background: var(--bg-light);
        }

        .pos-form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.5rem;
            margin-bottom: 0.5rem;
        }

        .pos-form-row:last-child {
            margin-bottom: 0;
        }

        .pos-form-group label {
            display: block;
            font-size: 0.625rem;
            font-weight: 600;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.3px;
            margin-bottom: 0.25rem;
        }

        .pos-form-group input,
        .pos-form-group select {
            width: 100%;
            padding: 0.375rem 0.5rem;
            font-size: 0.75rem;
            border: 1px solid var(--border);
            border-radius: 3px;
            background: var(--bg-white);
            transition: all 0.15s ease;
        }

        .pos-form-group input:focus,
        .pos-form-group select:focus {
            outline: none;
            border-color: var(--primary);
        }

        .pos-form-group select {
            appearance: none;
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
            background-position: right 0.375rem center;
            background-repeat: no-repeat;
            background-size: 1rem 1rem;
            padding-right: 1.5rem;
        }

        /* Cart Footer */
        .pos-cart-footer {
            padding: 0.75rem;
            background: var(--bg-white);
            border-top: 2px solid var(--primary);
        }

        .pos-cart-total {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.75rem;
        }

        .pos-cart-total span {
            font-size: 0.75rem;
            color: var(--text-muted);
            text-transform: uppercase;
            font-weight: 600;
        }

        .pos-total-amount {
            font-size: 1.25rem !important;
            font-weight: 700 !important;
            color: var(--primary) !important;
        }

        .pos-checkout-btn {
            width: 100%;
            padding: 0.75rem;
            font-size: 0.875rem;
            font-weight: 600;
            background: var(--primary);
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.15s ease;
        }

        .pos-checkout-btn:hover {
            background: var(--primary-dark);
        }

        .pos-checkout-btn:disabled {
            background: var(--text-light);
            cursor: not-allowed;
        }

        /* Responsive */
        @media (max-width: 1024px) {
            .pos-layout {
                grid-template-columns: 1fr 300px;
            }

            .pos-products-grid {
                grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            }
        }

        @media (max-width: 768px) {
            .pos-layout {
                grid-template-columns: 1fr;
                grid-template-rows: 1fr auto;
            }

            .pos-cart-panel {
                border-left: none;
                border-top: 1px solid var(--border);
                max-height: 50vh;
            }

            .pos-products-panel {
                max-height: 50vh;
            }
        }
    `}</style>
);

export default SharedStyles;

