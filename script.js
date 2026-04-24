document.addEventListener("DOMContentLoaded", () => {
    const toggleBtn = document.getElementById("theme-toggle");
    const html = document.documentElement;
    let isDark = localStorage.getItem("theme") === "dark";

    function applyTheme() {
        if (isDark) {
            html.classList.add("dark");
            toggleBtn.classList.remove("--light-theme");
            toggleBtn.classList.add("--dark-theme");
        } else {
            html.classList.remove("dark");
            toggleBtn.classList.add("--light-theme");
            toggleBtn.classList.remove("--dark-theme");
        }
    }
    applyTheme();

    toggleBtn.addEventListener("click", () => {
        isDark = !isDark;
        localStorage.setItem("theme", isDark ? "dark" : "light");
        applyTheme();
    });

    function updateDateTime() {
        const now = new Date();
        const timeEl = document.getElementById("time");
        const dateEl = document.getElementById("date");
        const weekdayEl = document.getElementById("weekday");

        timeEl.textContent = now.toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });

        dateEl.textContent = now.toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "long",
        });

        let weekday = now.toLocaleDateString("ru-RU", {
            weekday: "long",
        });
        weekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
        weekdayEl.textContent = `| ${weekday}`;
    }

    setInterval(updateDateTime, 1000);
    updateDateTime();

    const TEMP_MIN = 35,
        TEMP_MAX = 85;
    const HUM_MIN = 20,
        HUM_MAX = 60;
    const MEM_MIN = 1.2,
        MEM_MAX = 16.0;

    // Функция для получения текущего радиуса из CSS
    function getCurrentRadius(progressEl) {
        if (!progressEl) return 120;
        // Пробуем получить вычисленный радиус из CSS
        const computedStyle = window.getComputedStyle(progressEl);
        const rValue = progressEl.getAttribute("r");
        if (rValue) return parseFloat(rValue);
        return 120;
    }

    // Функция для вычисления circumference на основе текущего радиуса
    function getCircumference(progressEl) {
        if (!progressEl) return 753.98;
        const radius = getCurrentRadius(progressEl);
        return 2 * Math.PI * radius;
    }

    function updateProgress(id, value, min, max) {
        const percentage = Math.min(
            Math.max(((value - min) / (max - min)) * 100, 0),
            100,
        );

        const progressEl = document.getElementById(`progress-${id}`);
        if (progressEl) {
            const circumference = getCircumference(progressEl);
            const offset = circumference - (circumference * percentage) / 100;
            progressEl.setAttribute("stroke-dashoffset", offset);

            // Обновляем stroke-dasharray при изменении радиуса (для адаптива)
            const currentDasharray =
                progressEl.getAttribute("stroke-dasharray");
            if (
                !currentDasharray ||
                parseFloat(currentDasharray) !== circumference
            ) {
                progressEl.setAttribute("stroke-dasharray", circumference);
            }

            let color =
                percentage <= 50
                    ? "#26DC35"
                    : percentage <= 80
                      ? "#EFDA3E"
                      : "#DC2626";
            progressEl.style.stroke = color;
        }

        const valueEl = document.getElementById(`value-${id}`);
        if (valueEl) {
            if (id === "cpu") valueEl.textContent = value.toFixed(1);
            else if (id === "humidity") valueEl.textContent = Math.round(value);
            else valueEl.textContent = value.toFixed(1);
        }
    }

    // Функция для обновления stroke-dasharray при ресайзе (адаптив)
    function updateAllDasharrays() {
        const ids = ["cpu", "humidity", "memory"];
        ids.forEach((id) => {
            const progressEl = document.getElementById(`progress-${id}`);
            if (progressEl) {
                const circumference = getCircumference(progressEl);
                progressEl.setAttribute("stroke-dasharray", circumference);

                // Пересчитываем текущее значение
                const valueEl = document.getElementById(`value-${id}`);
                if (valueEl) {
                    let currentValue;
                    if (id === "cpu")
                        currentValue = parseFloat(valueEl.textContent);
                    else if (id === "humidity")
                        currentValue = parseFloat(valueEl.textContent);
                    else currentValue = parseFloat(valueEl.textContent);

                    if (!isNaN(currentValue)) {
                        let min, max;
                        if (id === "cpu") {
                            min = TEMP_MIN;
                            max = TEMP_MAX;
                        } else if (id === "humidity") {
                            min = HUM_MIN;
                            max = HUM_MAX;
                        } else {
                            min = MEM_MIN;
                            max = MEM_MAX;
                        }

                        const percentage = Math.min(
                            Math.max(
                                ((currentValue - min) / (max - min)) * 100,
                                0,
                            ),
                            100,
                        );
                        const offset =
                            circumference - (circumference * percentage) / 100;
                        progressEl.setAttribute("stroke-dashoffset", offset);
                    }
                }
            }
        });
    }

    // Следим за изменением размера экрана для обновления dasharray
    window.addEventListener("resize", () => {
        setTimeout(updateAllDasharrays, 100);
    });

    function getRandom(min, max, decimals = 1) {
        return (Math.random() * (max - min) + min).toFixed(decimals) * 1;
    }

    let currentCpuTemp = 42.3;

    function updateTempAndHumidity() {
        currentCpuTemp = getRandom(TEMP_MIN, TEMP_MAX, 1);
        updateProgress("cpu", currentCpuTemp, TEMP_MIN, TEMP_MAX);

        const humidity = getRandom(HUM_MIN, HUM_MAX, 0);
        updateProgress("humidity", humidity, HUM_MIN, HUM_MAX);
    }

    function updateMemory() {
        const memory = getRandom(MEM_MIN, MEM_MAX, 1);
        updateProgress("memory", memory, MEM_MIN, MEM_MAX);

        const now = new Date();
        const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}`;
        document.getElementById("memory-last-update").textContent =
            `Обновлено в ${timeStr}`;
    }

    setInterval(updateTempAndHumidity, 2000);
    updateTempAndHumidity();
    updateMemory();

    // Инициализация dasharray после загрузки
    setTimeout(updateAllDasharrays, 50);

    document
        .getElementById("memory-update-link")
        .addEventListener("click", (e) => {
            e.preventDefault();
            updateMemory();
        });

    let cpuChart;
    let chartLabels = [];
    let chartDataPoints = [];

    function initCpuChart() {
        const ctx = document.getElementById("cpu-chart");

        cpuChart = new Chart(ctx, {
            type: "line",
            data: {
                labels: chartLabels,
                datasets: [
                    {
                        label: "Температура CPU (°C)",
                        data: chartDataPoints,
                        borderColor: "#3b82f6",
                        backgroundColor: "transparent",
                        borderWidth: 3,
                        tension: 0,
                        pointRadius: 5,
                        pointHoverRadius: 8,
                        pointBorderWidth: 2,
                        pointBackgroundColor: "#fff",
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: "top",
                        labels: {
                            font: { size: 20 },
                        },
                    },
                    tooltip: {
                        enabled: true,
                        backgroundColor: "rgba(15, 23, 42, 0.95)",
                        titleColor: "#94a5b7",
                        bodyColor: "#94a5b7",
                        borderColor: "#3b82f6",
                        borderWidth: 1,
                        displayColors: false,
                        callbacks: {
                            label: (context) =>
                                context.parsed.y.toFixed(1) + " °C",
                        },
                    },
                },
                scales: {
                    y: {
                        min: 30,
                        max: 90,
                        grid: {
                            color: "#D9D9D9",
                            lineWidth: 1,
                        },
                        ticks: {
                            color: "#94a5b7",
                            font: { size: 14 },
                        },
                    },
                    x: {
                        grid: {
                            color: "#D9D9D9",
                            lineWidth: 1,
                            drawOnChartArea: true,
                        },
                        ticks: {
                            color: "#94a5b7",
                            font: {
                                size: 14,
                                family: "var(--light)",
                            },
                            padding: 10,
                            callback: function (value, index) {
                                return chartLabels[index] || "";
                            },
                        },
                    },
                },
                elements: {
                    line: { tension: 0 },
                    point: { radius: 5 },
                },
            },
        });
    }

    function updateChartLegendFont() {
        if (!cpuChart) return;

        const screenWidth = window.innerWidth;
        let legendFontSize = 20;

        if (screenWidth <= 320) {
            legendFontSize = 14;
        } else if (screenWidth <= 1024) {
            legendFontSize = 17;
        }

        cpuChart.options.plugins.legend.labels.font.size = legendFontSize;
        cpuChart.update();
    }

    window.addEventListener("resize", () => {
        setTimeout(updateChartLegendFont, 100);
    });

    setTimeout(updateChartLegendFont, 200);

    function initChartHistory() {
        chartLabels = [];
        chartDataPoints = [];
        const now = new Date();

        for (let i = 19; i >= 0; i--) {
            const past = new Date(now.getTime() - i * 10000);
            const label = past.toLocaleTimeString("ru-RU", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            });
            chartLabels.push(label);
            chartDataPoints.push(getRandom(38, 55, 1));
        }
    }

    function updateCpuChart() {
        const now = new Date();
        const label = now.toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });

        chartLabels.push(label);
        chartDataPoints.push(currentCpuTemp);

        if (chartLabels.length > 20) {
            chartLabels.shift();
            chartDataPoints.shift();
        }

        if (cpuChart) {
            cpuChart.data.labels = chartLabels;
            cpuChart.data.datasets[0].data = chartDataPoints;
            cpuChart.update("none");
        }
    }

    initChartHistory();
    initCpuChart();
    updateCpuChart();
    setInterval(updateCpuChart, 10000);

    const OPENWEATHER_API_KEY = "e72f58430f1f01f2392996e063393911";

    async function fetchWeather(city = "Vologda") {
        const tempElement = document.getElementById("weather-temp");
        const input = document.getElementById("city-input");

        tempElement.textContent = "Загрузка...";

        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=ru`,
            );

            if (!response.ok) {
                tempElement.textContent =
                    response.status === 404 ? "Город не найден" : "Ошибка";
                return;
            }

            const data = await response.json();
            tempElement.textContent = `${Math.round(data.main.temp)}°C`;
            input.placeholder = data.name || city;
        } catch (err) {
            console.error("Ошибка погоды:", err);
            tempElement.textContent = "Город не найден";
        }
    }

    function handleCitySearch() {
        let city = document.getElementById("city-input").value.trim();
        if (!city) city = "Vologda";
        fetchWeather(city);
    }

    document
        .getElementById("city-search-btn")
        .addEventListener("click", handleCitySearch);
    document.getElementById("city-input").addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleCitySearch();
    });

    fetchWeather("Vologda");

    async function fetchCurrencies() {
        try {
            const res = await fetch(
                "https://www.cbr-xml-daily.ru/daily_json.js",
            );
            const data = await res.json();
            document.getElementById("usd-price").textContent =
                `${parseFloat(data.Valute.USD.Value).toFixed(2)} ₽`;
            document.getElementById("cny-price").textContent =
                `${parseFloat(data.Valute.CNY.Value).toFixed(2)} ₽`;
        } catch (err) {
            console.error(err);
        }
    }

    async function translateText(text) {
        try {
            const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|ru`;
            const res = await fetch(url);
            const data = await res.json();

            if (
                data.responseStatus === 200 &&
                data.responseData?.translatedText
            ) {
                return data.responseData.translatedText;
            }
        } catch {
            console.warn("Переводчик временно недоступен");
        }
        return text;
    }

    async function updateQuote() {
        const textEl = document.querySelector(".api__card-quote");
        const authorEl = document.querySelector(".api__card-author");
        if (!textEl || !authorEl) return;

        try {
            textEl.textContent = "Загрузка...";
            authorEl.textContent = "";

            const res = await fetch("https://dummyjson.com/quotes/random");
            if (!res.ok) throw new Error("Ошибка загрузки цитаты");
            const data = await res.json();

            const [ruQuote, ruAuthor] = await Promise.all([
                translateText(data.quote),
                translateText(data.author),
            ]);

            textEl.textContent = ruQuote;
            authorEl.textContent = `— ${ruAuthor}`;
        } catch (err) {
            console.error("Ошибка:", err);
            textEl.textContent = "Не удалось загрузить цитату";
            authorEl.textContent = "";
        }
    }

    setInterval(updateQuote, 5 * 60 * 1000);

    fetchCurrencies();
    updateQuote();
});
