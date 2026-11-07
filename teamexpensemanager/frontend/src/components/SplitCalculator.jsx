import React, { useState, useEffect } from 'react';
import { Users, Percent, DollarSign, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function SplitCalculator({ members = [], totalAmount = 0, onChange }) {
  const [splitType, setSplitType] = useState('EQUAL'); // EQUAL, EXACT, PERCENTAGE
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [customAmounts, setCustomAmounts] = useState({}); // userId -> amount
  const [customPercentages, setCustomPercentages] = useState({}); // userId -> percentage

  // Default select all members when members load
  useEffect(() => {
    if (members.length > 0 && selectedUserIds.length === 0) {
      const allIds = members.map((m) => m.id);
      setSelectedUserIds(allIds);

      // Default equal percentages
      const equalPct = (100 / members.length).toFixed(2);
      const initialPctMap = {};
      members.forEach((m) => {
        initialPctMap[m.id] = equalPct;
      });
      setCustomPercentages(initialPctMap);
    }
  }, [members]);

  const numAmount = parseFloat(totalAmount) || 0;

  // Toggle user inclusion in equal split
  const toggleUser = (userId) => {
    if (selectedUserIds.includes(userId)) {
      if (selectedUserIds.length === 1) return; // Must keep at least one
      setSelectedUserIds(selectedUserIds.filter((id) => id !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  // Recalculate and trigger onChange
  useEffect(() => {
    if (members.length === 0) {
      if (onChange) onChange({ splitType, splits: [], isValid: true, error: null });
      return;
    }

    if (splitType === 'EQUAL') {
      const count = selectedUserIds.length;
      if (count === 0) {
        if (onChange) onChange({ splitType, splits: [], isValid: false, error: 'Select at least one member' });
        return;
      }
      const share = (numAmount / count).toFixed(2);
      const splits = selectedUserIds.map((userId) => ({
        userId,
        allocatedAmount: parseFloat(share),
        percentage: parseFloat((100 / count).toFixed(2)),
      }));

      if (onChange) {
        onChange({ splitType: 'EQUAL', splits, isValid: true, error: null });
      }
    } else if (splitType === 'EXACT') {
      let sum = 0;
      const splits = [];
      members.forEach((m) => {
        const val = parseFloat(customAmounts[m.id]) || 0;
        sum += val;
        if (val > 0) {
          splits.push({
            userId: m.id,
            allocatedAmount: val,
            percentage: numAmount > 0 ? parseFloat(((val / numAmount) * 100).toFixed(2)) : 0,
          });
        }
      });

      const diff = Math.abs(sum - numAmount);
      const isExactMatch = diff < 0.01;
      let error = null;
      if (!isExactMatch) {
        if (sum < numAmount) {
          error = `Under allocated by ₹${(numAmount - sum).toFixed(2)}`;
        } else {
          error = `Over allocated by ₹${(sum - numAmount).toFixed(2)}`;
        }
      }

      if (onChange) {
        onChange({
          splitType: 'EXACT',
          splits,
          isValid: isExactMatch && splits.length > 0,
          error,
          sum,
        });
      }
    } else if (splitType === 'PERCENTAGE') {
      let sumPct = 0;
      const splits = [];
      members.forEach((m) => {
        const pct = parseFloat(customPercentages[m.id]) || 0;
        sumPct += pct;
        if (pct > 0) {
          const val = parseFloat(((numAmount * pct) / 100).toFixed(2));
          splits.push({
            userId: m.id,
            allocatedAmount: val,
            percentage: pct,
          });
        }
      });

      const isExact100 = Math.abs(sumPct - 100.0) < 0.05;
      let error = null;
      if (!isExact100) {
        if (sumPct < 100) {
          error = `Percentages total ${sumPct.toFixed(1)}% (Need ${(100 - sumPct).toFixed(1)}% more)`;
        } else {
          error = `Percentages total ${sumPct.toFixed(1)}% (Over by ${(sumPct - 100).toFixed(1)}%)`;
        }
      }

      if (onChange) {
        onChange({
          splitType: 'PERCENTAGE',
          splits,
          isValid: isExact100 && splits.length > 0,
          error,
          sumPct,
        });
      }
    }
  }, [splitType, selectedUserIds, customAmounts, customPercentages, numAmount, members]);

  return (
    <div style={{ marginTop: '16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px', backgroundColor: '#F8FAFC' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
          Expense Split Method
        </span>
        <div style={{ display: 'flex', gap: '4px', backgroundColor: '#E2E8F0', padding: '3px', borderRadius: '8px' }}>
          <button
            type="button"
            onClick={() => setSplitType('EQUAL')}
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: splitType === 'EQUAL' ? '#FFFFFF' : 'transparent',
              color: splitType === 'EQUAL' ? 'var(--primary)' : 'var(--text-secondary)',
              boxShadow: splitType === 'EQUAL' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            Equal
          </button>
          <button
            type="button"
            onClick={() => setSplitType('EXACT')}
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: splitType === 'EXACT' ? '#FFFFFF' : 'transparent',
              color: splitType === 'EXACT' ? 'var(--primary)' : 'var(--text-secondary)',
              boxShadow: splitType === 'EXACT' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            Exact (₹)
          </button>
          <button
            type="button"
            onClick={() => setSplitType('PERCENTAGE')}
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: splitType === 'PERCENTAGE' ? '#FFFFFF' : 'transparent',
              color: splitType === 'PERCENTAGE' ? 'var(--primary)' : 'var(--text-secondary)',
              boxShadow: splitType === 'PERCENTAGE' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            Percentage (%)
          </button>
        </div>
      </div>

      {/* Participant List based on mode */}
      <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {members.map((member) => {
          const isSelected = selectedUserIds.includes(member.id);
          const equalShare = selectedUserIds.length > 0 ? (numAmount / selectedUserIds.length).toFixed(2) : '0.00';

          return (
            <div
              key={member.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '6px',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-color)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {splitType === 'EQUAL' && (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleUser(member.id)}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                )}
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {member.name}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {member.email}
                  </div>
                </div>
              </div>

              {/* Dynamic input per mode */}
              <div>
                {splitType === 'EQUAL' && (
                  <span style={{ fontSize: '12px', fontWeight: 700, color: isSelected ? 'var(--primary)' : '#94A3B8' }}>
                    {isSelected ? `₹${equalShare}` : 'Excluded'}
                  </span>
                )}

                {splitType === 'EXACT' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>₹</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={customAmounts[member.id] || ''}
                      onChange={(e) =>
                        setCustomAmounts({ ...customAmounts, [member.id]: e.target.value })
                      }
                      placeholder="0.00"
                      style={{
                        width: '80px',
                        padding: '4px 8px',
                        fontSize: '12px',
                        borderRadius: '4px',
                        border: '1px solid var(--border-color)',
                        textAlign: 'right',
                      }}
                    />
                  </div>
                )}

                {splitType === 'PERCENTAGE' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={customPercentages[member.id] || ''}
                      onChange={(e) =>
                        setCustomPercentages({ ...customPercentages, [member.id]: e.target.value })
                      }
                      placeholder="0.0"
                      style={{
                        width: '60px',
                        padding: '4px 8px',
                        fontSize: '12px',
                        borderRadius: '4px',
                        border: '1px solid var(--border-color)',
                        textAlign: 'right',
                      }}
                    />
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>%</span>
                    <span style={{ fontSize: '11px', color: 'var(--primary)', minWidth: '55px', textAlign: 'right' }}>
                      ₹{(((parseFloat(customPercentages[member.id]) || 0) * numAmount) / 100).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
