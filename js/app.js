const LINE_URL = "https://line.me/R/ti/p/@你的LINE官方帳號";
// 請把上面改成你的 LINE 官方帳號連結

let current=0;
let answers=Array(questions.length).fill(null);
let scores={A:0,B:0,C:0,D:0};
let axisScores={cash:0,growth:0,risk:0,plan:0,mind:0};
let lastLead=null;

const typeAxisBonus = {
  A:{cash:8,risk:10,mind:4,plan:5,growth:0},
  B:{growth:10,mind:7,plan:4,cash:2,risk:1},
  C:{mind:5,cash:2,growth:1,plan:0,risk:0},
  D:{plan:10,mind:8,risk:5,cash:3,growth:4}
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

function prevQuestion(){if(current>0){current--;render();}}

function calc(){
  scores={A:0,B:0,C:0,D:0};
  answers.forEach(a=>{if(a)scores[a]++;});
  let top="A";
  Object.keys(scores).forEach(k=>{if(scores[k]>scores[top]) top=k;});
  return top;
}

function calculateAxisScores(){
  const raw={cash:45,growth:45,risk:45,plan:45,mind:45};

  answers.forEach((answer, idx)=>{
    if(!answer) return;
    const q = questions[idx];
    const bonus = typeAxisBonus[answer] || {};
    Object.keys(q.axis || {}).forEach(axis=>{
      raw[axis] += (q.axis[axis] || 0) * 0.7;
    });
    Object.keys(bonus).forEach(axis=>{
      raw[axis] += bonus[axis] * 0.7;
    });
  });

  Object.keys(raw).forEach(axis=>{
    raw[axis] = Math.max(35, Math.min(96, Math.round(raw[axis])));
  });
  return raw;
}

function maturity(){
  return Math.round(
    axisScores.cash*0.2 +
    axisScores.growth*0.2 +
    axisScores.risk*0.2 +
    axisScores.plan*0.22 +
    axisScores.mind*0.18
  );
}

function listHTML(arr){return arr.map(x=>`<li>${x}</li>`).join("");}

function buildPriorities(axisScores){
  const order = Object.entries(axisScores).sort((a,b)=>a[1]-b[1]).slice(0,3);
  return order.map(([axis,score])=>`<li><strong>${axisLabels[axis]}｜${score}/100</strong><br>${priorityText[axis]}</li>`).join("");
}

function showResult(){
  const name=document.getElementById("name").value.trim();
  if(!name){alert("請填寫姓名");return;}

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
