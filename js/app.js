const LINE_URL = "https://line.me/R/ti/p/@你的LINE官方帳號";
// 請把上面改成你的 LINE 官方帳號連結

let current=0;
let answers=Array(questions.length).fill(null);
let scores={A:0,B:0,C:0,D:0};
let axisScores={cash:0,growth:0,risk:0,plan:0,mind:0};
let lastLead=null;

const answerAxisScore = {
  A:{cash:78,growth:42,risk:86,plan:66,mind:58},
  B:{cash:62,growth:90,risk:54,plan:70,mind:80},
  C:{cash:42,growth:58,risk:44,plan:46,mind:68},
  D:{cash:70,growth:76,risk:74,plan:92,mind:88}
};

const maturityByAnswer = {
  A:74,
  B:80,
  C:62,
  D:88
};

function show(id){
  ["start","quiz","leadForm","result"].forEach(x=>document.getElementById(x).classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
  window.scrollTo({top:0,behavior:"smooth"});
}

function startQuiz(){show("quiz");render();}

function render(){
  const item=questions[current];
  document.getElementById("counter").innerText=`第 ${current+1} 題 / 共 ${questions.length} 題`;
  document.getElementById("category").innerText=item.cat;
  document.getElementById("bar").style.width=`${(current/questions.length)*100}%`;
  document.getElementById("questionTitle").innerText=item.q;
  document.getElementById("options").innerHTML=item.o.map((x,i)=>`
    <label class="option">
      <input type="radio" name="ans" value="${x[1]}" ${answers[current]===x[1]?"checked":""}>
      <div><strong>${String.fromCharCode(65+i)}</strong>${x[0]}</div>
    </label>`).join("");
}

function nextQuestion(){
  const selected=document.querySelector('input[name="ans"]:checked');
  if(!selected){alert("請先選擇一個答案");return;}
  answers[current]=selected.value;
  current++;
  if(current<questions.length){render();}else{show("leadForm");}
}

function prevQuestion(){
  if(current>0){
    current--;
    render();
  }
}

function calc(){
  scores={A:0,B:0,C:0,D:0};
  answers.forEach(a=>{if(a)scores[a]++;});
  let top="A";
  Object.keys(scores).forEach(k=>{
    if(scores[k]>scores[top]) top=k;
  });
  return top;
}

function calculateAxisScores(){
  const totals={cash:0,growth:0,risk:0,plan:0,mind:0};
  let count=0;

  answers.forEach(answer=>{
    if(!answer) return;
    const profile = answerAxisScore[answer];
    Object.keys(totals).forEach(axis=>{
      totals[axis] += profile[axis];
    });
    count++;
  });

  const result={};
  Object.keys(totals).forEach(axis=>{
    result[axis] = count ? Math.round(totals[axis] / count) : 50;
  });

  // 關鍵題加權：讓雷達圖真的反映回答差異
  // Q1：100萬第一反應
  if(answers[0]==="A"){ result.cash += 8; result.risk += 6; result.growth -= 8; }
  if(answers[0]==="B"){ result.growth += 10; result.mind += 4; result.risk -= 4; }
  if(answers[0]==="C"){ result.mind += 4; result.cash -= 10; result.plan -= 6; }
  if(answers[0]==="D"){ result.plan += 10; result.mind += 6; }

  // Q3：月底剩錢
  if(answers[2]==="A"){ result.cash += 10; result.risk += 4; result.growth -= 4; }
  if(answers[2]==="B"){ result.growth += 8; result.cash += 2; }
  if(answers[2]==="C"){ result.cash -= 15; result.plan -= 8; }
  if(answers[2]==="D"){ result.cash += 8; result.plan += 6; }

  // Q6：檢視財務狀況
  if(answers[5]==="A"){ result.plan -= 3; }
  if(answers[5]==="B"){ result.plan += 5; }
  if(answers[5]==="C"){ result.plan -= 12; result.mind -= 5; }
  if(answers[5]==="D"){ result.plan += 14; result.mind += 6; }

  // Q8：保險功能
  if(answers[7]==="A"){ result.risk -= 2; }
  if(answers[7]==="B"){ result.risk += 10; }
  if(answers[7]==="C"){ result.risk -= 12; result.cash += 2; }
  if(answers[7]==="D"){ result.risk += 12; result.plan += 6; }

  // Q10：朋友投資賺很多
  if(answers[9]==="A"){ result.risk += 4; result.growth -= 4; }
  if(answers[9]==="B"){ result.growth += 7; result.mind += 5; }
  if(answers[9]==="C"){ result.growth += 8; result.risk -= 14; result.mind -= 4; }
  if(answers[9]==="D"){ result.growth += 5; result.risk += 8; result.plan += 4; }

  // Q14：貸款觀念
  if(answers[13]==="A"){ result.risk += 4; result.growth -= 4; }
  if(answers[13]==="B"){ result.growth += 8; result.risk -= 2; }
  if(answers[13]==="C"){ result.cash -= 6; result.risk -= 6; }
  if(answers[13]==="D"){ result.plan += 10; result.risk += 8; }

  // Q15：五年後
  if(answers[14]==="A"){ result.cash += 6; result.growth -= 3; }
  if(answers[14]==="B"){ result.growth += 8; }
  if(answers[14]==="C"){ result.mind += 4; result.plan -= 8; }
  if(answers[14]==="D"){ result.plan += 12; result.mind += 6; }

  Object.keys(result).forEach(axis=>{
    result[axis] = Math.max(25, Math.min(98, Math.round(result[axis])));
  });

  return result;
}

function maturity(){
  let base = 0;
  let count = 0;

  answers.forEach(answer=>{
    if(answer){
      base += maturityByAnswer[answer];
      count++;
    }
  });

  let score = count ? base / count : 65;

  // 依關鍵財務行為加減分
  if(answers[2]==="C") score -= 8;      // 月底犒賞花掉
  if(answers[2]==="D") score += 6;      // 留一部分、投資一部分

  if(answers[5]==="D") score += 8;      // 固定追蹤
  if(answers[5]==="C") score -= 8;      // 有需要才看

  if(answers[7]==="D") score += 6;      // 保險是整體規劃
  if(answers[7]==="C") score -= 6;      // 別花太多就好

  if(answers[9]==="C") score -= 6;      // 看到朋友賺就跟進
  if(answers[9]==="D") score += 6;      // 評估是否符合目標

  if(answers[13]==="D") score += 6;     // 貸款看用途與整體規劃
  if(answers[13]==="C") score -= 5;     // 讓生活更輕鬆就好

  if(answers[14]==="D") score += 7;     // 完整人生財務藍圖
  if(answers[14]==="C") score -= 4;     // 只看喜歡的生活

  // 雷達平均也影響成熟度，但不讓它完全支配結果
  const radarAvg = (
    axisScores.cash +
    axisScores.growth +
    axisScores.risk +
    axisScores.plan +
    axisScores.mind
  ) / 5;

  score = score * 0.72 + radarAvg * 0.28;

  return Math.max(45, Math.min(96, Math.round(score)));
}

function listHTML(arr){
  return arr.map(x=>`<li>${x}</li>`).join("");
}

function buildPriorities(axisScores){
  const sorted = Object.entries(axisScores).sort((a,b)=>a[1]-b[1]);
  const lowest = sorted.slice(0,3);

  return lowest.map(([axis,score],index)=>{
    let label = "";
    if(score < 55) label = "優先處理";
    else if(score < 70) label = "建議強化";
    else label = "可再優化";

    return `<li>
      <strong>${index+1}. ${axisLabels[axis]}｜${score}/100｜${label}</strong><br>
      ${priorityText[axis]}
    </li>`;
  }).join("");
}

function showResult(){
  const name=document.getElementById("name").value.trim();
  if(!name){
    alert("請填寫姓名");
    return;
  }

  const top=calc();
  const res=resultMap[top];
  axisScores = calculateAxisScores();
  const m=maturity();

  document.getElementById("resultTitle").innerText=res.t;
  document.getElementById("resultSub").innerText=res.sub;
  document.getElementById("resultContent").innerText=res.c;
  document.getElementById("maturityScore").innerText=m;
  document.getElementById("strengthList").innerHTML=listHTML(res.s);
  document.getElementById("blindList").innerHTML=listHTML(res.b);
  document.getElementById("nextList").innerHTML=listHTML(res.n);
  document.getElementById("priorityList").innerHTML=buildPriorities(axisScores);

  const total=questions.length;
  document.getElementById("scoreBlock").innerHTML=Object.keys(scores).map(k=>`
    <div class="score-row">
      <div class="top"><span>${resultMap[k].t}</span><b>${scores[k]}</b></div>
      <div class="mini"><span style="width:${scores[k]/total*100}%"></span></div>
    </div>`).join("");

  lastLead={
    name,
    focus:document.getElementById("focus").value,
    wish:document.getElementById("wish").value.trim(),
    result:res.t,
    maturity:m,
    scores:{...scores},
    radar:{...axisScores},
    time:new Date().toLocaleString()
  };
  localStorage.setItem("moneyMirrorLead", JSON.stringify(lastLead));
  console.log("Money Mirror Lead", lastLead);

  show("result");
  setTimeout(()=>createRadarChart(axisScores), 80);
}

function bookConsult(){
  if(LINE_URL.includes("你的LINE官方帳號")){
    alert("請把 js/app.js 裡的 LINE_URL 改成你的 LINE 官方帳號連結。");
    return;
  }
  window.open(LINE_URL,"_blank");
}

function downloadReport(){
  const lead=lastLead || JSON.parse(localStorage.getItem("moneyMirrorLead") || "{}");
  const radar = lead.radar || {};
  const text=`Money Mirror｜財富DNA分析報告

姓名：${lead.name||""}
財富DNA：${lead.result||""}
財商成熟度：${lead.maturity||""}/100
目前最想改善：${lead.focus||""}
希望會談協助：${lead.wish||""}

財富雷達圖：
現金流管理：${radar.cash||""}/100
財富成長：${radar.growth||""}/100
風險管理：${radar.risk||""}/100
財務規劃：${radar.plan||""}/100
財商思維：${radar.mind||""}/100

建議：
預約 60 分鐘「財務教練體驗」，完整整理收入、支出、資產、負債、保單、房貸與退休目標。`;

  const blob=new Blob([text],{type:"text/plain;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;
  a.download="Money-Mirror-財富DNA報告.txt";
  a.click();
  URL.revokeObjectURL(url);
}

function restart(){
  current=0;
  answers=Array(questions.length).fill(null);
  scores={A:0,B:0,C:0,D:0};
  axisScores={cash:0,growth:0,risk:0,plan:0,mind:0};
  lastLead=null;
  show("start");
}
