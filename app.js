
// Подключение Telegram
const tg = window.Telegram?.WebApp;

if (tg) {
    tg.ready();
    tg.expand();
}


// Работа с данными
const today = new Date().toLocaleDateString("ru-RU");

const storageKey = `nutrition-food-${today}`;

let foods = JSON.parse(localStorage.getItem(storageKey) || "[]");

const mealTypes = ["Завтрак", "Обед", "Ужин", "Перекус"];


// Элементы страницы
const modal = document.getElementById("modal");
const foodForm = document.getElementById("food-form");


// Сохранение данных
function saveFoods() {
    localStorage.setItem(storageKey, JSON.stringify(foods));
}


// Форматирование чисел
function formatNumber(number) {
    return Number(number.toFixed(1));
}


// Подсчёт общей пищевой ценности
function calculateTotals(items) {
    return items.reduce((total, food) => {
        total.calories += food.calories;
        total.protein += food.protein;
        total.fat += food.fat;
        total.carbs += food.carbs;

        return total;
    }, {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0
    });
}


// Отображение статистики
function updateStats() {
    const totals = calculateTotals(foods);

    document.getElementById("total-calories").innerHTML =
        `${formatNumber(totals.calories)} <span>ккал</span>`;

    document.getElementById("total-protein").textContent =
        `${formatNumber(totals.protein)} г`;

    document.getElementById("total-fat").textContent =
        `${formatNumber(totals.fat)} г`;

    document.getElementById("total-carbs").textContent =
        `${formatNumber(totals.carbs)} г`;

    document.getElementById("stats-calories").textContent =
        `${formatNumber(totals.calories)} ккал`;

    document.getElementById("stats-protein").textContent =
        `${formatNumber(totals.protein)} г`;

    document.getElementById("stats-fat").textContent =
        `${formatNumber(totals.fat)} г`;

    document.getElementById("stats-carbs").textContent =
        `${formatNumber(totals.carbs)} г`;

    const mealCount = new Set(foods.map(food => food.meal)).size;

    document.getElementById("food-count").textContent =
        foods.length === 0
            ? "Пока нет добавленных продуктов"
            : `${foods.length} продуктов · ${mealCount} приёмов пищи`;

    // Индикатор отражает количество заполненных приёмов пищи,
    // а не достижение нормы калорий.
    document.getElementById("calorie-progress").style.width =
        `${mealCount / mealTypes.length * 100}%`;
}


// Создание карточки приёма пищи
function createMealCard(meal) {
    const mealFoods = foods.filter(food => food.meal === meal);
    const totals = calculateTotals(mealFoods);

    const card = document.createElement("div");
    card.className = "meal-card";

    const heading = document.createElement("div");
    heading.className = "meal-heading";

    const title = document.createElement("h3");
    title.textContent = meal;

    const mealTotal = document.createElement("span");
    mealTotal.className = "meal-total";
    mealTotal.textContent =
        `${formatNumber(totals.calories)} ккал`;

    heading.append(title, mealTotal);
    card.appendChild(heading);

    if (mealFoods.length === 0) {
        const empty = document.createElement("p");
        empty.className = "empty-message";
        empty.textContent = "Пока ничего не добавлено";
        card.appendChild(empty);
    }

    mealFoods.forEach(food => {
        const item = document.createElement("div");
        item.className = "food-item";

        const info = document.createElement("div");

        const name = document.createElement("strong");
        name.textContent = food.name;

        const description = document.createElement("p");
        description.className = "food-description";
        description.textContent =
            `Б ${food.protein} · Ж ${food.fat} · У ${food.carbs}`;

        info.append(name, description);

        const right = document.createElement("div");
        right.className = "food-right";

        const calories = document.createElement("strong");
        calories.textContent = `${food.calories} ккал`;

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-food";
        deleteButton.textContent = "Удалить";

        deleteButton.addEventListener("click", () => {
            foods = foods.filter(item => item.id !== food.id);

            saveFoods();
            renderApp();
        });

        right.append(calories, deleteButton);
        item.append(info, right);
        card.appendChild(item);
    });

    return card;
}


// Отображение приёмов пищи
function renderMeals() {
    const homeMeals = document.getElementById("home-meals");
    const diaryMeals = document.getElementById("diary-meals");

    homeMeals.replaceChildren();
    diaryMeals.replaceChildren();

    mealTypes.forEach(meal => {
        const card = createMealCard(meal);

        diaryMeals.appendChild(card.cloneNode(true));

        if (foods.some(food => food.meal === meal)) {
            homeMeals.appendChild(card);
        }
    });

    if (foods.length === 0) {
        const empty = document.createElement("p");
        empty.className = "empty-message";
        empty.textContent = "Твой дневник пока пуст. Добавь первый продукт!";
        homeMeals.appendChild(empty);
    }
}


// Обновление всего интерфейса
function renderApp() {
    updateStats();
    renderMeals();
}


// Переключение вкладок
function switchPage(pageName) {
    document.querySelectorAll(".page").forEach(page => {
        page.classList.toggle("active", page.id === pageName);
    });

    document.querySelectorAll(".nav-button").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.page === pageName
        );
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
}


// Обработчики навигации
document.querySelectorAll("[data-page]").forEach(button => {
    button.addEventListener("click", () => {
        switchPage(button.dataset.page);
    });
});


// Открытие и закрытие окна
function openModal() {
    modal.classList.add("open");
}

function closeModal() {
    modal.classList.remove("open");
    foodForm.reset();
}

document.getElementById("open-modal").addEventListener("click", openModal);
document.getElementById("open-modal-diary").addEventListener("click", openModal);
document.getElementById("close-modal").addEventListener("click", closeModal);

modal.addEventListener("click", event => {
    if (event.target === modal) {
        closeModal();
    }
});


// Добавление продукта
foodForm.addEventListener("submit", event => {
    event.preventDefault();

    const name = document.getElementById("food-name").value.trim();

    const meal = document.getElementById("food-meal").value;

    const calories = Number(document.getElementById("food-calories").value);
    const protein = Number(document.getElementById("food-protein").value);
    const fat = Number(document.getElementById("food-fat").value);
    const carbs = Number(document.getElementById("food-carbs").value);

    const values = [calories, protein, fat, carbs];

    if (!name || !values.every(value =>
        Number.isFinite(value) && value >= 0
    )) {
        alert("Проверь введённые данные.");
        return;
    }

    const newFood = {
        id: crypto.randomUUID(),
        name,
        meal,
        calories,
        protein,
        fat,
        carbs
    };

    foods.push(newFood);

    saveFoods();
    renderApp();
    closeModal();

    if (tg) {
        tg.HapticFeedback?.notificationOccurred("success");
    }
});


// Имя пользователя из Telegram
if (tg?.initDataUnsafe?.user?.first_name) {
    document.getElementById("profile-name").textContent =
        tg.initDataUnsafe.user.first_name;
}


// Первый запуск
renderApp();
