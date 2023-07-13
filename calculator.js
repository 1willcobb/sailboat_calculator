const totalCostInput = document.getElementById('total-cost');
const moneyDownInput = document.getElementById('money-down');
const percentageRateInput = document.getElementById('percentage-rate');
const yearsToPayInput = document.getElementById('years-to-pay');
const resultContainer = document.getElementById('result');

function calculateLoan() {
    const totalCost = parseFloat(totalCostInput.value) || 0;
    const moneyDown = parseFloat(moneyDownInput.value) || 0;
    const percentageRate = parseFloat(percentageRateInput.value) || 0;
    const yearsToPay = parseFloat(yearsToPayInput.value) || 0;
  

  const loanAmount = totalCost - moneyDown;
  const monthlyInterestRate = percentageRate / 100 / 12;
  const totalMonths = yearsToPay * 12;

  const numerator = loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalMonths);
  const denominator = Math.pow(1 + monthlyInterestRate, totalMonths) - 1;
  const monthlyPayment = numerator / denominator;

  const totalInterestPaid = monthlyPayment * totalMonths - loanAmount;
  const interestPerMonth = totalInterestPaid / totalMonths;
  const totalLifetimePaid = loanAmount + totalInterestPaid + moneyDown;

  const isFiniteValue = (value) => Number.isFinite(value) ? value : 0.00;

  resultContainer.innerHTML = `
    <p>Monthly Payment: $${isFiniteValue(monthlyPayment).toFixed(2)}</p>
    <p>Total Lifetime Paid: $${isFiniteValue(totalLifetimePaid).toFixed(2)}</p>
    <p>Interest per Month: $${isFiniteValue(interestPerMonth).toFixed(2)}</p>
    <p>Interest over Lifetime: $${isFiniteValue(totalInterestPaid).toFixed(2)}</p>
  `;
}

totalCostInput.addEventListener('input', calculateLoan);
moneyDownInput.addEventListener('input', calculateLoan);
percentageRateInput.addEventListener('input', calculateLoan);
yearsToPayInput.addEventListener('input', calculateLoan);