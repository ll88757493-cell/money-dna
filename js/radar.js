let radarChart = null;

function createRadarChart(axisScores){
  const canvas = document.getElementById("radarChart");
  if(!canvas || typeof Chart === "undefined") return;

  if(radarChart){
    radarChart.destroy();
  }

  const values = [
    axisScores.cash,
    axisScores.growth,
    axisScores.risk,
    axisScores.plan,
    axisScores.mind
  ];

  radarChart = new Chart(canvas, {
    type: "radar",
    data: {
      labels: ["現金流管理", "財富成長", "風險管理", "財務規劃", "財商思維"],
      datasets: [{
        label: "財富雷達圖",
        data: values,
        fill: true,
        backgroundColor: "rgba(216, 180, 106, 0.22)",
        borderColor: "rgba(255, 231, 163, 0.95)",
        pointBackgroundColor: "rgba(121, 215, 255, 1)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgba(216, 180, 106, 1)",
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          suggestedMin: 0,
          suggestedMax: 100,
          ticks: {
            stepSize: 20,
            color: "rgba(248,250,252,.70)",
            backdropColor: "transparent"
          },
          angleLines: { color: "rgba(255,255,255,.16)" },
          grid: { color: "rgba(255,255,255,.12)" },
          pointLabels: {
            color: "rgba(248,250,252,.92)",
            font: { size: 13, weight: "700" }
          }
        }
      },
      plugins: {
        legend: {
          labels: { color: "rgba(248,250,252,.88)" }
        },
        tooltip: {
          callbacks: {
            label: function(context){
              return context.label + "：" + context.raw + "/100";
            }
          }
        }
      }
    }
  });
}
