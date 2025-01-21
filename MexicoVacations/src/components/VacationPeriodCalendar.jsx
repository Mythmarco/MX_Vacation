// src/components/VacationPeriodCalendar.jsx
import React from 'react';

const VacationPeriodCalendar = ({ 
    startDate, 
    checkingDate,
    currentBalance,
    nextBalance,
    isAccrual 
}) => {
    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    
    const isFirstYear = () => {
        const start = new Date(startDate);
        const check = new Date(checkingDate);
        const yearDiff = check.getFullYear() - start.getFullYear();
        const monthDiff = check.getMonth() - start.getMonth();
        const totalMonths = (yearDiff * 12) + monthDiff;
        return totalMonths < 12;
    };

    const generateYearRows = () => {
        if (!startDate || !checkingDate) return [];
        
        const start = new Date(startDate);
        const check = new Date(checkingDate);
        const startYear = start.getFullYear();
        const endYear = check.getFullYear() + 1;
        const rows = [];

        for (let year = startYear; year <= endYear; year++) {
            const monthsInYear = [];
            for (let month = 0; month < 12; month++) {
                const currentDate = new Date(year, month, 1);
                monthsInYear.push(currentDate);
            }
            rows.push({
                year,
                months: monthsInYear
            });
        }
        return rows;
    };

    const isInCurrentPeriod = (date) => {
        if (!currentBalance.expirationDate) return false;
        
        if (isFirstYear()) {
            const testDate = new Date(date);
            const startMonthYear = new Date(startDate);
            const checkMonthYear = new Date(checkingDate);
            
            // Exclude start month, include check month
            return testDate > startMonthYear && testDate <= checkMonthYear;
        } else {
            const expirationDate = new Date(currentBalance.expirationDate);
            const periodStart = new Date(expirationDate);
            periodStart.setMonth(periodStart.getMonth() - 18); // Go back 17 months from expiration (12 + 5)
            const periodEnd = new Date(periodStart);
            periodEnd.setMonth(periodStart.getMonth() + 12); // 12 months period
    
            const testDate = new Date(date);
            testDate.setDate(1);
            return testDate >= periodStart && testDate <= periodEnd;
        }
    };

    const isInNextPeriod = (date) => {
        if (isFirstYear() || !isAccrual || !nextBalance.expirationDate || nextBalance.expirationDate === 'N/A') return false;
    
        const currentPeriodEnd = new Date(currentBalance.expirationDate);
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() - 5); // Go back 5 months to get to Feb 2026
        const nextPeriodStart = new Date(currentPeriodEnd);
        nextPeriodStart.setMonth(nextPeriodStart.getMonth() + -1); // Start in March 2026
        const nextPeriodEnd = new Date(nextPeriodStart);
        nextPeriodEnd.setMonth(nextPeriodStart.getMonth() + 12); // 12 months until Feb 2027
    
        const testDate = new Date(date);
        testDate.setDate(1);
        return testDate >= nextPeriodStart && testDate <= nextPeriodEnd;
    };

    const getPeriodStyle = (date) => {
        if (!startDate || !checkingDate) return 'bg-gray-100';
        
        // Current period
        if (isInCurrentPeriod(date)) {
            return 'bg-blue-100 border-blue-200';
        }

        // Next period (only for accrual and not first year)
        if (!isFirstYear() && isAccrual && isInNextPeriod(date)) {
            return 'bg-green-100 border-green-200';
        }

        return 'bg-gray-100';
    };

    const isExpirationMonth = (date) => {
        if (!currentBalance.expirationDate) return false;
        
        const expDate = new Date(currentBalance.expirationDate);
        return date.getMonth() === expDate.getMonth() && 
               date.getFullYear() === expDate.getFullYear();
    };
    const isStartMonth = (date) => {
        if (!startDate) return false;
        
        const startDateObj = new Date(startDate);
        return date.getMonth() === startDateObj.getMonth() && 
               date.getFullYear() === startDateObj.getFullYear();
    };
    const yearRows = generateYearRows();

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-xl font-bold mb-4">Period Calendar View</h3>
            <div className="space-y-2">
                {yearRows.map((yearRow) => (
                    <div key={yearRow.year} className="flex gap-4 items-center">
                        <div className="w-16 font-semibold text-gray-700">
                            {yearRow.year}
                        </div>
                        <div className="flex-1 grid grid-cols-12 gap-2">
                            {yearRow.months.map((date, index) => (
                                <div
                                    key={index}
                                    className={`p-2 rounded border ${getPeriodStyle(date)} relative`}
                                >
                                    <div className="text-sm font-medium">
                                        {months[date.getMonth()]}
                                    </div>
                                    {isExpirationMonth(date) && (
                                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                                    )}
                                    {isStartMonth(date) && (
                                        <div className="absolute -top-1 -left-1 w-2 h-2 bg-green-500 rounded-full" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-6 flex flex-wrap gap-4">
                <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded mr-2"></div>
                    <span className="text-sm">Current Period</span>
                </div>
                {isAccrual && !isFirstYear() && (
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-100 border border-green-200 rounded mr-2"></div>
                        <span className="text-sm">Next Period</span>
                    </div>
                )}
                <div className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                    <span className="text-sm">Current Period Expiration Date</span>
                </div>
                <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm">Start Date</span>
                </div>
            </div>
        </div>
    );
};

export default VacationPeriodCalendar;