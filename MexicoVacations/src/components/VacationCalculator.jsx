// src/components/VacationCalculator.jsx
import React, { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import './VacationCalculator.css';
import logo from '../assets/logo.png'; 
import VacationPeriodCalendar from './VacationPeriodCalendar';

const calculateYearsOfService = (startDate) => {
    if (!startDate) return 0;
    const start = new Date(startDate);
    const now = new Date();
    return Math.floor((now - start) / (365.25 * 24 * 60 * 60 * 1000));
};

// Add calculation function
const calculateSeniority = (startDate, checkingDate) => {
    if (!startDate || !checkingDate) return 0;
    const start = new Date(startDate);
    const check = new Date(checkingDate);
    const diffTime = Math.abs(check - start);
    const diffYears = diffTime / (365.25 * 24 * 60 * 60 * 1000);
    return Number(diffYears.toFixed(1));
};

const VacationCalculator = () => {
    const [isAccrual, setIsAccrual] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [vacationDaysTaken, setVacationDaysTaken] = useState(0);
    const [checkingDate, setCheckingDate] = useState(new Date().toISOString().split('T')[0]);
    const [showHelp, setShowHelp] = useState(false);
    
    const [currentBalance, setCurrentBalance] = useState({
        availableDays: 0,
        expirationDate: null,
        isExpired: false,
        tier: ''
    });
    
    const [nextBalance, setNextBalance] = useState({
        availableDays: 0,
        expirationDate: null,
        tier: ''
    });

    const getTierLabel = (years) => {
        if (years < 1) return `First Year (12 Days)`;
        if (years < 2) return `1-2 Years (12 Days)`;
        if (years < 3) return `2-3 Years (14 Days)`;
        if (years < 4) return `3-4 Years (16 Days)`;
        if (years < 5) return `4-5 Years (18 Days)`;
        if (years < 6) return `5-6 Years (20 Days)`;
        if (years < 11) return `6-10 Years (22 Days)`;
        if (years < 16) return `11-15 Years (24 Days)`;
        if (years < 21) return `16-20 Years (26 Days)`;
        if (years < 26) return `20-25 Years (28 Days)`;
        return `25-30 Years (30 Days)`;
    };

    const calculateVacationDays = (yearsOfService) => {
        if (yearsOfService < 1) return 12;
        if (yearsOfService < 2) return 12;
        if (yearsOfService < 3) return 14;
        if (yearsOfService < 4) return 16;
        if (yearsOfService < 5) return 18;
        if (yearsOfService < 6) return 20;
        if (yearsOfService < 11) return 22;
        if (yearsOfService < 16) return 24;
        if (yearsOfService < 21) return 26;
        if (yearsOfService < 26) return 28;
        return 30;
    };

    const calculateAccruedDays = (startDateObj, checkDateObj) => {
        const monthsDiff = (checkDateObj.getFullYear() - startDateObj.getFullYear()) * 12 + 
                          (checkDateObj.getMonth() - startDateObj.getMonth()) +
                          (checkDateObj.getDate() >= startDateObj.getDate() ? 0 : -1);
        
        const yearsOfService = monthsDiff / 12;
        
        if (monthsDiff < 12) {
            return {
                current: Math.min(monthsDiff, 12),
                next: 0,
                currentTier: getTierLabel(yearsOfService),
                nextTier: 'N/A'
            };
        }

        const currentYearsOfService = Math.floor(yearsOfService);
        const annualDays = calculateVacationDays(currentYearsOfService);
        const nextYearAnnualDays = calculateVacationDays(currentYearsOfService + 1);
        const monthsSinceLastAnniversary = monthsDiff % 12;
        
        const nextPeriodDays = (nextYearAnnualDays / 12) * monthsSinceLastAnniversary;
        
        return {
            current: annualDays,
            next: Math.round(nextPeriodDays * 10) / 10,
            currentTier: getTierLabel(currentYearsOfService),
            nextTier: getTierLabel(currentYearsOfService + 1)
        };
    };

    const isDateExpired = (expirationDate, checkDate, startDate) => {
        const startDateObj = new Date(startDate);
        const checkDateObj = new Date(checkDate);
        const monthsDiff = (checkDateObj.getFullYear() - startDateObj.getFullYear()) * 12 + 
                          (checkDateObj.getMonth() - startDateObj.getMonth()) +
                          (checkDateObj.getDate() >= startDateObj.getDate() ? 0 : -1);
        
        if (monthsDiff < 12) {
            return false;
        }
        
        const expDate = new Date(expirationDate);
        return expDate < checkDateObj;
    };

    const calculateExpirationDate = (dateObj) => {
        const result = new Date(dateObj);
        result.setMonth(result.getMonth() + 6);
        return result.toISOString().split('T')[0];
    };

    const handleCalculate = () => {
        if (!startDate || !checkingDate) {
            alert("Please fill in all required dates");
            return;
        }

        const startDateObj = new Date(startDate);
        const checkDateObj = new Date(checkingDate);
        
        if (isAccrual) {
            const accrued = calculateAccruedDays(startDateObj, checkDateObj);
            
            const anniversaryDate = new Date(startDate);
            anniversaryDate.setFullYear(checkDateObj.getFullYear());
            if (checkDateObj < anniversaryDate) {
                anniversaryDate.setFullYear(anniversaryDate.getFullYear() - 1);
            }
            
            const currentExpirationDate = calculateExpirationDate(anniversaryDate);
            const isCurrentPeriodExpired = isDateExpired(currentExpirationDate, checkingDate, startDate);
            
            const nextAnniversaryDate = new Date(anniversaryDate);
            nextAnniversaryDate.setFullYear(nextAnniversaryDate.getFullYear() + 1);
            const nextExpirationDate = calculateExpirationDate(nextAnniversaryDate);

            let remainingDaysTaken = vacationDaysTaken;
            let currentPeriodBalance = isCurrentPeriodExpired ? 0 : Math.round(accrued.current * 10) / 10;
            
            if (currentPeriodBalance >= remainingDaysTaken) {
                currentPeriodBalance -= remainingDaysTaken;
                remainingDaysTaken = 0;
            } else {
                remainingDaysTaken -= currentPeriodBalance;
                currentPeriodBalance = 0;
            }

            let nextPeriodBalance = accrued.next;
            if (remainingDaysTaken > 0) {
                nextPeriodBalance = Math.max(0, nextPeriodBalance - remainingDaysTaken);
            }
            
            setCurrentBalance({
                availableDays: Math.round(currentPeriodBalance * 10) / 10,
                expirationDate: currentExpirationDate,
                isExpired: isCurrentPeriodExpired,
                tier: accrued.currentTier
            });
            
            setNextBalance({
                availableDays: Math.round(nextPeriodBalance * 10) / 10,
                expirationDate: nextExpirationDate,
                tier: accrued.nextTier
            });
        } else {
            const anniversaryDate = new Date(startDate);
            anniversaryDate.setFullYear(checkDateObj.getFullYear());
            
            if (checkDateObj < anniversaryDate) {
                anniversaryDate.setFullYear(anniversaryDate.getFullYear() - 1);
            }
            
            const currentExpirationDate = calculateExpirationDate(anniversaryDate);
            const yearsOfService = Math.floor(
                (checkDateObj - startDateObj) / (365.25 * 24 * 60 * 60 * 1000)
            );
            
            const currentYearDays = calculateVacationDays(yearsOfService);
            const isCurrentPeriodExpired = isDateExpired(currentExpirationDate, checkingDate, startDate);
            
            const availableDays = isCurrentPeriodExpired ? 0 : Math.max(0, currentYearDays - vacationDaysTaken);
            
            setCurrentBalance({
                availableDays: availableDays,
                expirationDate: currentExpirationDate,
                isExpired: isCurrentPeriodExpired,
                tier: getTierLabel(yearsOfService)
            });
            
            setNextBalance({
                availableDays: "N/A",
                expirationDate: "N/A",
                tier: "N/A"
            });
        }
    };

    const formatDate = (dateString) => {
        if (!dateString || dateString === 'N/A') return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
        });
    };

   // Update the layout portion of your return statement
return (
    <div className="min-h-screen p-4">
        {/* Header Section */}
        <div className="max-w-7xl mx-auto mb-8">
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4">
                <div className="flex justify-start">
                    <img 
                        src={logo} 
                        alt="Company Logo" 
                        className="w-16 h-16 object-contain"
                    />
                </div>
                <h1 className="text-3xl font-bold text-gray-800 text-center">
                    Mexico Vacations Calculator
                </h1>
                <button 
                    onClick={() => setShowHelp(true)}
                    className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                    Help
                </button>
            </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-[350px_1fr] gap-6">
                {/* Input Section - Left Side */}
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-bold mb-6 text-gray-700 border-b pb-3">
                            Input Information
                        </h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block">
                                    <div className="flex items-center mb-2">
                                        <span className="font-bold">Calculation Method:</span>
                                        <div className="relative group ml-2">
                                            <Info className="h-5 w-5 text-gray-500" />
                                            <div className="absolute left-0 mt-1 bg-gray-100 p-2 rounded text-sm w-64 invisible group-hover:visible z-10">
                                                {isAccrual ? 
                                                    "Loading prorated amount of days as time passes based on the anniversary date" :
                                                    "Full Vacation Days loaded at the anniversary"}
                                            </div>
                                        </div>
                                    </div>
                                    <select 
                                        className="border rounded p-2 w-full"
                                        value={isAccrual ? "accrual" : "frontloaded"}
                                        onChange={(e) => setIsAccrual(e.target.value === "accrual")}
                                    >
                                        <option value="accrual">Accrual</option>
                                        <option value="frontloaded">Front Loaded</option>
                                    </select>
                                </label>
                            </div>

                            <div>
                                <label className="block">
                                    <span className="font-bold block mb-2">Start Date:</span>
                                    <input
                                        type="date"
                                        className="border rounded p-2 w-full"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        required
                                    />
                                </label>
                            </div>

                            <div>
                                <label className="block">
                                    <span className="font-bold block mb-2">Checking Date:</span>
                                    <input
                                        type="date"
                                        className="border rounded p-2 w-full"
                                        value={checkingDate}
                                        onChange={(e) => setCheckingDate(e.target.value)}
                                        required
                                    />
                                </label>
                            </div>

                            <div>
                                <label className="block">
                                    <span className="font-bold block mb-2">Vacation Days Taken:</span>
                                    <input
                                        type="number"
                                        min="0"
                                        className="border rounded p-2 w-full"
                                        value={vacationDaysTaken}
                                        onChange={(e) => setVacationDaysTaken(Number(e.target.value))}
                                    />
                                </label>
                            </div>

                            <button 
                                onClick={handleCalculate}
                                className="w-full bg-green-600 text-white py-2 px-6 rounded hover:bg-green-700 transition-colors"
                            >
                                Calculate
                            </button>
                        </div>
                    </div>
                </div>

                {/* Output Section - Right Side */}
                <div className="space-y-6">
                    {/* Balance Information */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-bold mb-6 text-gray-700 border-b pb-3">
                            Output Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Current Period Balance */}
                            <div>
                                <h3 className="text-lg mb-3">Current Period Balance</h3>
                                <div className="rounded-lg border border-gray-200 overflow-hidden">
                                    <table className="w-full">
                                        <tbody>
                                            <tr className="border-b">
                                                <td className="py-2 px-4 text-left">Current Tier:</td>
                                                <td className="py-2 px-4">{currentBalance.tier}</td>
                                            </tr>
                                            <tr className="border-b">
                                                <td className="py-2 px-4 text-left">Available Vacation Days:</td>
                                                <td className="py-2 px-4">{currentBalance.availableDays}</td>
                                            </tr>
                                            <tr className="border-b">
                                                <td className="py-2 px-4 text-left">Expiration Date:</td>
                                                <td className="py-2 px-4">{formatDate(currentBalance.expirationDate)}</td>
                                            </tr>
                                            {currentBalance.isExpired && (
                                                <tr>
                                                    <td colSpan="2" className="py-2 px-4 text-red-600 text-center">
                                                        Period Expired
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Add display between Current and Next Period sections */}
                                    <div className="mt-4 text-left">
                                        <span>Seniority: </span>
                                        <span className='font-bold'>{calculateSeniority(startDate, checkingDate)} years</span>
                                    </div>
                            </div>
                      

                            {/* Next Period Balance */}
                            <div>
                                <h3 className="text-lg mb-3">Next Period Balance</h3>
                                {isAccrual ? (
                                    <>
                                        <div className="rounded-lg border border-gray-200 overflow-hidden">
                                            <table className="w-full">
                                                <tbody>
                                                    <tr className="border-b">
                                                        <td className="py-2 px-4 text-left">Next Tier:</td>
                                                        <td className="py-2 px-4">{nextBalance.tier}</td>
                                                    </tr>
                                                    <tr className="border-b">
                                                        <td className="py-2 px-4 text-left">Available Vacation Days:</td>
                                                        <td className="py-2 px-4">{nextBalance.availableDays}</td>
                                                    </tr>
                                                    <tr className="border-b">
                                                        <td className="py-2 px-4 text-left">Expiration Date:</td>
                                                        <td className="py-2 px-4">{formatDate(nextBalance.expirationDate)}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="mt-4">
                                            <span>Total Available Vacation Days: </span>
                                            <span className="font-bold">
                                                {typeof currentBalance.availableDays === 'number' && 
                                                 typeof nextBalance.availableDays === 'number' 
                                                    ? (currentBalance.availableDays + nextBalance.availableDays).toFixed(1)
                                                    : 'N/A'}
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="italic">Not Applicable for Front-loaded Calculation</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Calendar Section */}
                    <VacationPeriodCalendar
                        startDate={startDate}
                        checkingDate={checkingDate}
                        currentBalance={currentBalance}
                        nextBalance={nextBalance}
                        isAccrual={isAccrual}
                    />
                </div>
            </div>
        </div>

        {/* Help Modal */}
        {showHelp && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg max-w-lg">
                    <h3 className="text-xl font-bold mb-4">How to use this calculator:</h3>
                    <ol className="space-y-2">
                        <li>1. Select your calculation method (Front Loaded or Accrual)</li>
                        <li>2. Enter the employee's start date</li>
                        <li>3. Input any vacation days already taken</li>
                        <li>4. Select a date to check the balance for</li>
                        <li>5. Click Calculate to see results</li>
                    </ol>
                    <button 
                        onClick={() => setShowHelp(false)}
                        className="mt-4 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                    >
                        Got it!
                    </button>
                </div>
            </div>
        )}
    </div>
);
};

export default VacationCalculator;