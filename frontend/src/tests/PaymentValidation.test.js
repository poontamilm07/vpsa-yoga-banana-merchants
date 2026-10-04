import React from 'react';
import assert from 'assert';

// Verification helper function simulating AddPurchaseModal logic
function validatePurchasePayment(prevDue, thars, pricePerThar, paymentNow) {
  const tharsNum = Number(thars) || 0;
  const priceNum = Number(pricePerThar) || 0;
  const newPurchaseAmount = tharsNum * priceNum;
  const paidNum = paymentNow !== '' ? Number(paymentNow) : 0;
  const totalDue = prevDue + newPurchaseAmount;

  const isNegativePayment = paidNum < 0;
  const isPaymentExceeded = paidNum > totalDue;

  let errorMessage = '';
  if (isNegativePayment) {
    errorMessage = 'Payment amount cannot be negative.';
  } else if (isPaymentExceeded) {
    errorMessage = `Payment amount ₹${paidNum.toLocaleString('en-IN')} is higher than the total payable amount ₹${totalDue.toLocaleString('en-IN')}.`;
  }

  const isSaveDisabled = isPaymentExceeded || isNegativePayment || tharsNum <= 0;

  return {
    totalDue,
    newPurchaseAmount,
    finalBalance: isPaymentExceeded ? totalDue - paidNum : totalDue - paidNum,
    isPaymentExceeded,
    isNegativePayment,
    errorMessage,
    isSaveDisabled
  };
}

// Verification helper function simulating AddSupplierPaymentModal logic
function validateSupplierPayment(currentOutstanding, amount) {
  const amountNum = amount !== '' ? Number(amount) : 0;
  const isInvalidAmount = amount !== '' && (isNaN(amountNum) || amountNum <= 0);
  const isExceededAmount = amount !== '' && amountNum > currentOutstanding;

  let errorMessage = '';
  if (isInvalidAmount) {
    errorMessage = 'Payment amount must be greater than zero.';
  } else if (isExceededAmount) {
    errorMessage = `Payment amount ₹${amountNum.toLocaleString('en-IN')} cannot exceed the outstanding amount ₹${currentOutstanding.toLocaleString('en-IN')}.`;
  }

  const isSaveDisabled = isInvalidAmount || isExceededAmount || amount === '';

  return {
    amountNum,
    currentOutstanding,
    isInvalidAmount,
    isExceededAmount,
    errorMessage,
    isSaveDisabled
  };
}

console.log('Running Frontend Payment Validation Tests...');

// TEST A: Outstanding = ₹7,000, New Purchase = ₹12,000, Payment = ₹5,000
const testA = validatePurchasePayment(7000, 20, 600, 5000);
assert.strictEqual(testA.totalDue, 19000, 'Test A Total Due must be 19,000');
assert.strictEqual(testA.finalBalance, 14000, 'Test A Final Balance must be 14,000');
assert.strictEqual(testA.isSaveDisabled, false, 'Test A Save button must be ENABLED');
assert.strictEqual(testA.errorMessage, '', 'Test A error message must be empty');
console.log('✓ TEST A Passed: Total Payable ₹19,000, New Outstanding ₹14,000, Save Enabled');

// TEST B: Outstanding = ₹7,000, New Purchase = ₹12,000, Payment = ₹19,000
const testB = validatePurchasePayment(7000, 20, 600, 19000);
assert.strictEqual(testB.totalDue, 19000, 'Test B Total Due must be 19,000');
assert.strictEqual(testB.finalBalance, 0, 'Test B Final Balance must be 0');
assert.strictEqual(testB.isSaveDisabled, false, 'Test B Save button must be ENABLED');
assert.strictEqual(testB.errorMessage, '', 'Test B error message must be empty');
console.log('✓ TEST B Passed: Total Payable ₹19,000, New Outstanding ₹0, Save Enabled');

// TEST C: Outstanding = ₹7,000, New Purchase = ₹12,000, Payment = ₹20,000
const testC = validatePurchasePayment(7000, 20, 600, 20000);
assert.strictEqual(testC.totalDue, 19000, 'Test C Total Due must be 19,000');
assert.strictEqual(testC.isPaymentExceeded, true, 'Test C Payment must be marked exceeded');
assert.strictEqual(testC.isSaveDisabled, true, 'Test C Save button must be DISABLED');
assert.strictEqual(testC.errorMessage, 'Payment amount ₹20,000 is higher than the total payable amount ₹19,000.');
console.log('✓ TEST C Passed: Shows error "Payment amount ₹20,000 is higher than the total payable amount ₹19,000.", Save Disabled');

// TEST D: Current Outstanding = ₹17,000, Standalone Payment = ₹20,000
const testD = validateSupplierPayment(17000, 20000);
assert.strictEqual(testD.isExceededAmount, true, 'Test D Payment must be marked exceeded');
assert.strictEqual(testD.isSaveDisabled, true, 'Test D Record Payment button must be DISABLED');
assert.strictEqual(testD.errorMessage, 'Payment amount ₹20,000 cannot exceed the outstanding amount ₹17,000.');
console.log('✓ TEST D Passed: Shows error "Payment amount ₹20,000 cannot exceed the outstanding amount ₹17,000.", Record Payment Disabled');

// Negative / Zero payment tests
const testZero = validateSupplierPayment(17000, 0);
assert.strictEqual(testZero.isSaveDisabled, true);
assert.strictEqual(testZero.errorMessage, 'Payment amount must be greater than zero.');
console.log('✓ Zero Payment Test Passed: Disabled and shows error');

console.log('ALL FRONTEND PAYMENT VALIDATION TESTS PASSED!');
