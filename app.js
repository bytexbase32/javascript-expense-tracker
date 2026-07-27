const totalSpentElement = document.getElementById("total-spent");
let totalSpent = 0;

const formElement = document.getElementById("add-expense");
const indexElement = document.getElementById("index");
const titleElement = document.getElementById("title");
const amountElement = document.getElementById("amount");
const categoryElement = document.getElementById("expense-category");
const dateElement = document.getElementById("date");

const emptyElement = document.getElementById("empty-state");
const errorElement = document.getElementById("error");

const expensesElement = document.getElementById("expenses");

const submitElement = document.getElementById("submit");

const searchElement = document.getElementById("search");
const filterElement = document.getElementById("filter-category");
const sortElement = document.getElementById("sort");

let expenses = [];


formElement.addEventListener("submit", (e) => {
    e.preventDefault();
    const index = Number(indexElement.value);
    const title = titleElement.value.trim();
    const amount = Number.parseFloat(amountElement.value.trim());
    const category = categoryElement.value.trim();
    const date = dateElement.value.trim();

    if (title === "" || amount <= 0 || Number.isNaN(amount) || category === "" || date === "") {
        errorElement.style.display = "block";
        errorElement.innerText = "Please fill all fields and enter a valid amount.";
        return;
    }
    errorElement.style.display = "none";

    const expense = {
        id:index >= 0 ? expenses[index].id: crypto.randomUUID(),
        title,
        amount,
        category,
        date
    };

    if (index >= 0) {
        expenses[index] = {
            ...expense
        };
        submitElement.value = "Add Expense";
    }else {
        expenses.push(expense);
    }

    saveExpenses();
    renderExpenses(expenses);
    titleElement.value = "";
    amountElement.value = "";
    categoryElement.value = "";
    dateElement.value = "";
    titleElement.focus();
    indexElement.value = "-1";
});

expensesElement.addEventListener("click", (e) => {
    e.preventDefault();

    const id = e.target.dataset.index;

    if (e.target.classList.contains("delete-btn")) {

        expenses = expenses.filter((expense) => expense.id !== id);

        saveExpenses();
        updateTotal();
        renderExpenses(expenses);

    } else if (e.target.classList.contains("edit-btn")) {

        const expense = expenses.find((expense) => expense.id === id);

        const index = expenses.findIndex((expense) => expense.id === id);

        indexElement.value = index;

        titleElement.value = expense.title;
        amountElement.value = expense.amount;
        categoryElement.value = expense.category;
        dateElement.value = expense.date;

        submitElement.value = "Save";
    }
});

searchElement.addEventListener("input", (e) => {
    renderExpenses(getVisibleExpenses());
});

filterElement.addEventListener("change", (e) => {
    renderExpenses(getVisibleExpenses());
});

sortElement.addEventListener("change", (e) => {
    renderExpenses(getVisibleExpenses());
});

function getVisibleExpenses() {
    let visibleExpenses = expenses;

    const searchValue = searchElement.value.trim().toLowerCase();
    if (searchValue !== "") {
        visibleExpenses = visibleExpenses.filter(expense =>
            expense.title.toLowerCase().includes(searchValue)
        );
    }
    
    if (filterElement.value !== "all")
        visibleExpenses = visibleExpenses.filter((expense) =>  expense.category === filterElement.value);
    visibleExpenses = sortExpenses(visibleExpenses);
    return visibleExpenses;
}

function sortExpenses(expenses) {
    let sorted = [...expenses];
    if(sortElement.value !== "default") {
        if (sortElement.value === "oldest")
            sorted.sort(by("date"));
        else if (sortElement.value === "newest")
            sorted.sort(by("date", "desc"));
        else if (sortElement.value === "amountInc")
            sorted.sort(by("amount"));
        else if (sortElement.value === "amountDecr")
            sorted.sort(by("amount", "desc"));
        else if (sortElement.value === "titleAZ")
            sorted.sort(by("title"));
        else if (sortElement.value === "titleZA")
            sorted.sort(by("title", "desc"));
    }
    return sorted;
}

function by(key, direction = "asc") {
    return (a, b) => {
        let result;
        if (key === "date")
            result = new Date(a.date) - new Date(b.date)
        else if (key === "amount")
            result = a.amount - b.amount;
        else
            result = a.title.localeCompare(b.title, undefined, {sensitivity: "base", numeric: true});
        
        return direction === "asc"? result: -result;
    }
}

function saveExpenses() {
    localStorage.setItem("expenses-tracker-app", JSON.stringify(expenses));
} 

function loadExpenses() {
    expenses = JSON.parse(localStorage.getItem("expenses-tracker-app")) || [];
}

function renderExpenses(expenses) {

    document.querySelectorAll(".expense").forEach(element => {
        element.remove();
    });

    totalSpent = 0;
    if (expenses.length === 0) {
        totalSpentElement.innerText = "$0.00";
        emptyElement.style.display = "block";
        return;
    }
    emptyElement.style.display = "none";
    errorElement.style.display = "none";
    expenses.forEach((expense, index) => {
        const expenseElement = createExpense(expense);
        expensesElement.appendChild(expenseElement);

        totalSpent += expense.amount;
    })

    totalSpentElement.innerText = `$${totalSpent.toFixed(2)}`;
}

function createExpense(expense) {
    const expenseElement = document.createElement("div");
    expenseElement.classList.add("expense");
    const titleEle = document.createElement("h3");
    titleEle.innerText = expense.title;
    expenseElement.appendChild(titleEle);

    const amountEle = document.createElement("p");
    amountEle.innerText = `$${expense.amount.toFixed(2)}`;
    expenseElement.appendChild(amountEle);

    const categoryEle = document.createElement("p");
    categoryEle.innerText = expense.category;
    expenseElement.appendChild(categoryEle);


    const dateEl = document.createElement("p");
    const formattedDate = new Date(expense.date).toLocaleDateString();
    dateEl.innerText = formattedDate;
    expenseElement.appendChild(dateEl);

    const actionsEl = document.createElement("div");
    actionsEl.classList.add("actions")

    const editEl = document.createElement("button");
    editEl.innerText = "Edit"
    
    const deleteEl = document.createElement("button");
    deleteEl.innerText = "Delete";
    
    editEl.dataset.index = expense.id;
    deleteEl.dataset.index = expense.id;

    editEl.classList.add("edit-btn");
    deleteEl.classList.add("delete-btn");

    actionsEl.appendChild(editEl);
    actionsEl.appendChild(deleteEl);
    expenseElement.appendChild(actionsEl);
    return expenseElement;
}

function updateTotal(){
    totalSpent = expenses.reduce((sum, expense)=> sum + expense.amount, 0);

    totalSpentElement.innerText = `$${totalSpent.toFixed(2)}`;
}
function init() {
    loadExpenses();
    updateTotal();
    renderExpenses(expenses);
}

init();