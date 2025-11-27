// Shared professional light mode design system for all Admin pages
export const SharedStyles = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=DM+Sans:wght@400;500;600;700;800&display=swap');

        :root {
            --primary-blue: #2563EB;
            --primary-blue-light: #3B82F6;
            --primary-blue-dark: #1E40AF;
            --accent-emerald: #10B981;
            --accent-amber: #F59E0B;
            --accent-red: #EF4444;
            --text-primary: #1F2937;
            --text-secondary: #6B7280;
            --text-muted: #9CA3AF;
            --bg-primary: #F9FAFB;
            --bg-secondary: #F3F4F6;
            --card-bg: #FFFFFF;
            --border-color: #E5E7EB;
            --success-green: #10B981;
            --danger-red: #EF4444;
            --warning-amber: #F59E0B;
        }

        /* Page Container */
        .admin-page-container {
            background: var(--bg-primary);
            min-height: 100vh;
            padding: 2rem;
            font-family: 'Inter', sans-serif;
        }

        /* Page Header */
        .admin-page-header {
            font-family: 'DM Sans', sans-serif;
            font-size: 1.875rem;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 1.75rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        /* Card Styles */
        .admin-card {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
            margin-bottom: 1.5rem;
        }

        .admin-card-header {
            font-family: 'DM Sans', sans-serif;
            font-size: 1.125rem;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 1.25rem;
            padding-bottom: 0.875rem;
            border-bottom: 1px solid var(--border-color);
        }

        /* Button Styles */
        .admin-btn-primary {
            background: linear-gradient(135deg, var(--primary-blue-light) 0%, var(--primary-blue) 100%);
            color: white;
            padding: 0.625rem 1.25rem;
            border-radius: 8px;
            border: none;
            font-weight: 600;
            font-size: 0.9375rem;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
        }

        .admin-btn-primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(37, 99, 235, 0.3);
        }

        .admin-btn-secondary {
            background: var(--bg-secondary);
            color: var(--text-primary);
            padding: 0.625rem 1.25rem;
            border-radius: 8px;
            border: 1px solid var(--border-color);
            font-weight: 600;
            font-size: 0.9375rem;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .admin-btn-secondary:hover {
            background: var(--card-bg);
            border-color: var(--primary-blue-light);
        }

        .admin-btn-success {
            background: var(--success-green);
            color: white;
            padding: 0.625rem 1.25rem;
            border-radius: 8px;
            border: none;
            font-weight: 600;
            font-size: 0.9375rem;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .admin-btn-danger {
            background: var(--danger-red);
            color: white;
            padding: 0.625rem 1.25rem;
            border-radius: 8px;
            border: none;
            font-weight: 600;
            font-size: 0.9375rem;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        /* Input Styles */
        .admin-input {
            width: 100%;
            padding: 0.625rem 0.875rem;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            font-size: 0.9375rem;
            font-weight: 400;
            font-family: 'Inter', sans-serif;
            transition: all 0.2s ease;
            background: var(--card-bg);
            color: var(--text-primary);
        }

        .admin-input:focus {
            outline: none;
            border-color: var(--primary-blue);
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .admin-select {
            width: 100%;
            padding: 0.625rem 0.875rem;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            font-size: 0.9375rem;
            font-weight: 500;
            font-family: 'Inter', sans-serif;
            transition: all 0.2s ease;
            background: var(--card-bg);
            color: var(--text-primary);
        }

        .admin-select:focus {
            outline: none;
            border-color: var(--primary-blue);
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        /* Table Styles */
        .admin-table-container {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }

        .admin-table {
            width: 100%;
            border-collapse: collapse;
        }

        .admin-table thead {
            background: linear-gradient(135deg, var(--primary-blue-dark) 0%, var(--primary-blue) 100%);
        }

        .admin-table th {
            color: white;
            font-weight: 600;
            font-size: 0.875rem;
            text-align: left;
            padding: 1rem;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        .admin-table td {
            padding: 0.875rem 1rem;
            border-bottom: 1px solid var(--border-color);
            color: var(--text-primary);
            font-size: 0.9375rem;
        }

        .admin-table tr:last-child td {
            border-bottom: none;
        }

        .admin-table tbody tr {
            transition: background 0.2s ease;
        }

        .admin-table tbody tr:hover {
            background: var(--bg-primary);
        }

        /* Badge Styles */
        .admin-badge {
            display: inline-block;
            padding: 0.375rem 0.75rem;
            border-radius: 12px;
            font-size: 0.8125rem;
            font-weight: 600;
        }

        .admin-badge-primary {
            background: rgba(37, 99, 235, 0.1);
            color: var(--primary-blue-dark);
            border: 1px solid rgba(37, 99, 235, 0.2);
        }

        .admin-badge-success {
            background: rgba(16, 185, 129, 0.1);
            color: #059669;
            border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .admin-badge-danger {
            background: rgba(239, 68, 68, 0.1);
            color: #DC2626;
            border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .admin-badge-warning {
            background: rgba(245, 158, 11, 0.1);
            color: #D97706;
            border: 1px solid rgba(245, 158, 11, 0.2);
        }

        /* Stats Card */
        .admin-stats-card {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 1.5rem;
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }

        .admin-stats-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, var(--primary-blue) 0%, var(--primary-blue-light) 100%);
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .admin-stats-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
        }

        .admin-stats-card:hover::before {
            opacity: 1;
        }

        .admin-stats-label {
            font-size: 0.75rem;
            font-weight: 600;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 0.5rem;
        }

        .admin-stats-value {
            font-size: 1.875rem;
            font-weight: 700;
            color: var(--primary-blue);
            font-family: 'DM Sans', sans-serif;
        }

        .admin-stats-description {
            font-size: 0.875rem;
            color: var(--text-secondary);
            margin-top: 0.5rem;
        }

        /* Loading State */
        .admin-loading {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 3rem;
            color: var(--text-muted);
        }

        /* Empty State */
        .admin-empty-state {
            text-align: center;
            padding: 3rem;
            color: var(--text-muted);
        }

        .admin-empty-state-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
            color: var(--border-color);
        }

        .admin-empty-state-text {
            font-size: 1rem;
            font-weight: 500;
            color: var(--text-secondary);
        }

        /* Animation */
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .admin-fade-in {
            animation: fadeIn 0.4s ease-out;
        }

        /* Utility Classes */
        .admin-flex {
            display: flex;
        }

        .admin-flex-between {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .admin-flex-center {
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .admin-grid {
            display: grid;
            gap: 1.5rem;
        }

        .admin-grid-2 {
            grid-template-columns: repeat(2, 1fr);
        }

        .admin-grid-3 {
            grid-template-columns: repeat(3, 1fr);
        }

        .admin-grid-4 {
            grid-template-columns: repeat(4, 1fr);
        }

        @media (max-width: 1024px) {
            .admin-grid-4 {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        @media (max-width: 640px) {
            .admin-grid-2,
            .admin-grid-3,
            .admin-grid-4 {
                grid-template-columns: 1fr;
            }
        }
    `}</style>
);

export default SharedStyles;
