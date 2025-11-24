const stocks = [
    "AAPL",
    "MSFT",
    "GOOGL",
    "AMZN",
    "PYPL",
    "TSLA",
    "JPM",
    "NVDA",
    "NFLX",
    "DIS",
];

async function render() {
    document.getElementById("chart").style.display = "none";
    let stockChartsData, stockStatsData, stockSummary;

    try {
        const [chartsRes, statsRes, summaryRes] = await Promise.all([
            fetch("https://stocksapi-uhe1.onrender.com/api/stocks/getstocksdata"),
            fetch("https://stocksapi-uhe1.onrender.com/api/stocks/getstockstatsdata"),
            fetch(
                "https://stocksapi-uhe1.onrender.com/api/stocks/getstocksprofiledata"
            ),
        ]);

        stockChartsData = await chartsRes.json();
        stockStatsData = await statsRes.json();
        stockSummary = await summaryRes.json();
    } finally {
        document.getElementById("chart").style.display = "block";
    }

    initializeUI(stockChartsData, stockStatsData, stockSummary);
}

function initializeUI(stockChartsData, stockStatsData, stockSummary) {
    const stockListEle = document.getElementById("stockList");
    const defaultStock = stocks[0];
    const defaultTime = "5y";

    let chart = initializeChart(
        stockChartsData,
        stockStatsData,
        stockSummary,
        defaultStock,
        defaultTime
    );

    stocks.forEach((stock) => {
        const stockDetailsDivEle = createStockElement(stock, stockStatsData);
        stockDetailsDivEle.querySelector("button").onclick = () => {
            const data = createChartData(
                stockChartsData,
                stockStatsData,
                stockSummary,
                stock,
                defaultTime
            );
            updateChart(chart, stock, data);
        };
        stockListEle.appendChild(stockDetailsDivEle);
    });

    ["1mo", "3mo", "1y", "5y"].forEach((period) => {
        document.getElementById(`${period}_button`).onclick = () => {
            const currentStock = document.getElementById("stockName").textContent;
            const data = createChartData(
                stockChartsData,
                stockStatsData,
                stockSummary,
                currentStock,
                period
            );
            updateChart(chart, currentStock, data);
        };
    });
}

function initializeChart(
    stockChartsData,
    stockStatsData,
    stockSummary,
    stock,
    time
) {
    const data = createChartData(
        stockChartsData,
        stockStatsData,
        stockSummary,
        stock,
        time
    );
    const options = {
        series: [{ name: stock, data }],
        chart: {
            id: "area-datetime",
            type: "area",
            height: 350,
            zoom: { autoScaleYaxis: true },
        },
        dataLabels: { enabled: false },
        markers: { size: 2, style: "hollow" },
        xaxis: {
            type: "datetime",
            min: data[0][0],
            tickAmount: 10,
        },
        tooltip: {
            x: { format: "dd MMM yyyy" },
        },
        fill: {
            type: "gradient",
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.7,
                opacityTo: 0.9,
                stops: [0, 100],
            },
        },
    };
    const chart = new ApexCharts(
        document.querySelector("#chart-timeline"),
        options
    );
    chart.render();
    return chart;
}

function createStockElement(stock, stockStatsData) {
    const stockDetailsDivEle = document.createElement("div");
    stockDetailsDivEle.classList.add("stockDetailsDiv");

    const stockBtnEle = document.createElement("button");
    const stockPriceEle = document.createElement("span");
    const stockProfitEle = document.createElement("span");

    stockBtnEle.textContent = stock;
    stockPriceEle.textContent = `$${stockStatsData.stocksStatsData[0][stock].bookValue.toFixed(2)}`;
    stockProfitEle.textContent = `${stockStatsData.stocksStatsData[0][stock].profit.toFixed(2)}%`;
    stockProfitEle.style.color = stockStatsData.stocksStatsData[0][stock].profit > 0 ? "green" : "red";

    stockDetailsDivEle.append(stockBtnEle, stockPriceEle, stockProfitEle);
    return stockDetailsDivEle;
}

function createChartData(stockChartsData, stockStatsData, stockSummary, stock, time) {
    const timeArr = stockChartsData.stocksData[0][stock][time].timeStamp;
    const valArr = stockChartsData.stocksData[0][stock][time].value;
    const dataArr = timeArr.map((time, i) => [time * 1000, valArr[i].toFixed(2)]);

    updateStockDetails(stockStatsData, stockSummary, stock, valArr);
    return dataArr;
}

function updateStockDetails(stockStatsData, stockSummary, stock, values) {
    const minVal = Math.min(...values).toFixed(2);
    const maxVal = Math.max(...values).toFixed(2);

    document.getElementById("stockName").textContent = stock;
    document.getElementById("book_Value").textContent = `$${stockStatsData.stocksStatsData[0][stock].bookValue}`;
    document.getElementById("profit").textContent = `${stockStatsData.stocksStatsData[0][stock].profit}%`;
    document.getElementById("profit").style.color = stockStatsData.stocksStatsData[0][stock].profit > 0 ? "green" : "red";
    document.getElementById("stockSummary").textContent = stockSummary.stocksProfileData[0][stock].summary;
    document.getElementById("stockMin").textContent = `Low value: $${minVal}`;
    document.getElementById("stockMax").textContent = `Peak value: $${maxVal}`;
}

function updateChart(chart, stock, data) {
    chart.updateOptions({
        series: [{ name: stock, data }],
        xaxis: { min: data[0][0] },
    });
}

render();
