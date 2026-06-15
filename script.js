const budgetInput = document.getElementById("budgetInput");
const setBudgetBtn = document.getElementById("setBudgetBtn");
const resetBtn = document.getElementById("resetBtn");

const totalBudgetEl = document.getElementById("totalBudget");
const totalSpentEl = document.getElementById("totalSpent");
const remainingBudgetEl = document.getElementById("remainingBudget");

const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const addExpenseBtn = document.getElementById("addExpenseBtn");

const expenseTable = document.getElementById("expenseTable");

const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");

const dailyLimitEl = document.getElementById("dailyLimit");
const savingsForecastEl = document.getElementById("savingsForecast");

const warningBox = document.getElementById("warningBox");

let budget = Number(localStorage.getItem("budget")) || 0;
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

// Set Budget
setBudgetBtn.addEventListener("click", () => {
    const value = Number(budgetInput.value);

    if (value <= 0) {
        alert("Please enter a valid budget.");
        return;
    }

    budget = value;
    localStorage.setItem("budget", budget);

    budgetInput.value = "";

    updateDashboard();
});

// Add Expense
addExpenseBtn.addEventListener("click", () => {
    const amount = Number(amountInput.value);
    const category = categoryInput.value;
    const date = dateInput.value;

    if (!amount || amount <= 0 || !date) {
        alert("Please fill all fields.");
        return;
    }

    expenses.push({
        amount,
        category,
        date
    });

    localStorage.setItem("expenses", JSON.stringify(expenses));

    amountInput.value = "";
    dateInput.value = "";

    renderExpenses();
    updateDashboard();
});

// Render Expense History
function renderExpenses() {
    expenseTable.innerHTML = "";

    expenses.forEach(expense => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${expense.date}</td>
            <td>${expense.category}</td>
            <td>₹${expense.amount}</td>
        `;

        expenseTable.appendChild(row);
    });
}

// Update Dashboard
function updateDashboard() {

    const totalSpent = expenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
    );

    const remaining = budget - totalSpent;

    totalBudgetEl.textContent = `₹${budget.toFixed(2)}`;
    totalSpentEl.textContent = `₹${totalSpent.toFixed(2)}`;
    remainingBudgetEl.textContent = `₹${remaining.toFixed(2)}`;

    updateProgress(totalSpent);
    calculateAnalytics(totalSpent, remaining);
}

// Progress Bar
function updateProgress(totalSpent) {

    if (budget <= 0) {
        progressFill.style.width = "0%";
        progressText.textContent = "0%";
        return;
    }

    const percent = Math.min(
        (totalSpent / budget) * 100,
        100
    );

    progressFill.style.width = percent + "%";
    progressText.textContent = percent.toFixed(1) + "% Used";

    progressText.className = "";

    if (percent < 60) {
        progressText.classList.add("green");
    } else if (percent < 85) {
        progressText.classList.add("yellow");
    } else {
        progressText.classList.add("red");
    }
}

// Analytics + Velocity Alert
function calculateAnalytics(totalSpent, remaining) {

    if (budget <= 0) return;

    const today = new Date();

    const currentDay = today.getDate();

    const totalDaysInMonth = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0
    ).getDate();

    const remainingDays = totalDaysInMonth - currentDay;

    const dailyVelocity =
        currentDay > 0
            ? totalSpent / currentDay
            : 0;

    const safeLimit =
        remainingDays > 0
            ? remaining / remainingDays
            : 0;

    dailyLimitEl.textContent =
        `₹${Math.max(0, safeLimit).toFixed(2)}`;

    const projectedMonthlySpend =
        dailyVelocity * totalDaysInMonth;

    const expectedSavings =
        budget - projectedMonthlySpend;

    savingsForecastEl.textContent =
        `₹${expectedSavings.toFixed(2)}`;

    warningBox.classList.add("hidden");

    if (dailyVelocity > 0 && remaining > 0) {

        const projectedDaysLeft =
            remaining / dailyVelocity;

        if (projectedDaysLeft < remainingDays) {

            warningBox.classList.remove("hidden");

            warningBox.innerHTML = `
                ⚠️ Warning: At this rate,
                your budget will run out in
                <strong>${projectedDaysLeft.toFixed(0)}</strong> days.
                <br><br>
                Suggested Daily Limit:
                <strong>₹${safeLimit.toFixed(2)}</strong>
            `;
        }
    }

    if (remaining < 0) {

        warningBox.classList.remove("hidden");

        warningBox.innerHTML = `
            🚨 Over Budget by
            <strong>₹${Math.abs(remaining).toFixed(2)}</strong>
        `;
    }
}

// Reset Data Button
resetBtn.addEventListener("click", () => {

    const confirmReset = confirm(
        "Are you sure you want to delete all budget and expense data?"
    );

    if (confirmReset) {
        localStorage.removeItem("budget");
        localStorage.removeItem("expenses");
        location.reload();
    }

});

// Initial Load
renderExpenses();
updateDashboard();