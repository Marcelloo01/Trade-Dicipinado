const missions = [
  { id: 'm1', title: 'Anti-Raiva: Aceitei o resultado sem tentar me vingar.' },
  { id: 'm2', title: 'Anti-Pressa: Esperei a confirmação antes de clicar.' },
  { id: 'm3', title: 'Anti-Ansiedade: Fiz pausa quando senti agitação.' },
  { id: 'm4', title: 'Anti-Ganância: Mantive o lote padrão sem inventar.' },
  { id: 'm5', title: 'Anti-Medo: O setup deu sinal e entrei sem hesitar.' },
  { id: 'm6', title: 'Anti-Foco: Operei sem distrações ou tédio.' }
];

let records = JSON.parse(localStorage.getItem('trader_records')) || [];
let streak = parseInt(localStorage.getItem('trader_streak')) || 0;
let disciplineChart, pnlChart;

function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

// Renderizar Missões Diárias
function renderMissions() {
  const container = document.getElementById('missions-list');
  container.innerHTML = '';

  missions.forEach(m => {
    const isChecked = localStorage.getItem(`mission_${m.id}_${getTodayDate()}`) === 'true';
    
    const div = document.createElement('div');
    div.className = 'flex items-start space-x-3 bg-gray-700/50 p-2.5 rounded-lg border border-gray-700';
    div.innerHTML = `
      <input type="checkbox" id="${m.id}" ${isChecked ? 'checked' : ''} class="mt-1 h-5 w-5 rounded text-yellow-500 cursor-pointer">
      <div>
        <label for="${m.id}" class="font-semibold text-sm cursor-pointer block">${m.title}</label>
        <p class="text-xs text-gray-400">${m.desc}</p>
      </div>
    `;
    container.appendChild(div);

    div.querySelector('input').addEventListener('change', (e) => {
      localStorage.setItem(`mission_${m.id}_${getTodayDate()}`, e.target.checked);
    });
  });
}

// Salvar o dia completo
document.getElementById('pnl-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const pnlValue = parseFloat(document.getElementById('pnl-input').value);
  const date = getTodayDate();

  // Verifica se cumpriu todas as 6 missões hoje
  const allMissionsChecked = missions.every(m => localStorage.getItem(`mission_${m.id}_${date}`) === 'true');

  if (allMissionsChecked) {
    streak += 1;
    alert('🎉 Parabéns! Dia 100% disciplinado registrado!');
  } else {
    streak = 0; // Reset do Streak se errou o plano
    alert('⚠️ Atitude fora do plano registrada. Streak resetado para 0 dias.');
  }

  localStorage.setItem('trader_streak', streak);

  // Adiciona ou atualiza registro do dia
  const existingIndex = records.findIndex(r => r.date === date);
  const newRecord = { date, pnl: pnlValue, disciplined: allMissionsChecked };

  if (existingIndex >= 0) {
    records[existingIndex] = newRecord;
  } else {
    records.push(newRecord);
  }

  localStorage.setItem('trader_records', JSON.stringify(records));
  
  document.getElementById('pnl-input').value = '';
  updateUI();
});

// Atualizar Interface, Histórico e Gráficos
function updateUI() {
  // Atualiza Streak
  document.getElementById('streak-count').innerText = `${streak} / 30 Dias`;
  const percentage = Math.min((streak / 30) * 100, 100);
  document.getElementById('progress-bar').style.width = `${percentage}%`;

  // Atualiza Histórico
  const historyList = document.getElementById('history-list');
  historyList.innerHTML = '';
  
  if (records.length === 0) {
    historyList.innerHTML = '<p class="text-gray-500 italic text-center">Nenhum registro ainda.</p>';
  } else {
    records.slice().reverse().forEach(r => {
      const div = document.createElement('div');
      div.className = 'flex justify-between items-center bg-gray-700/30 p-2 rounded border border-gray-700';
      const pnlColor = r.pnl >= 0 ? 'text-green-400' : 'text-red-400';
      const statusBadge = r.disciplined ? '🟢 Disciplinado' : '🔴 Indisciplinado';
      div.innerHTML = `
        <span>${r.date}</span>
        <span class="${pnlColor} font-bold">R$ ${r.pnl.toFixed(2)}</span>
        <span>${statusBadge}</span>
      `;
      historyList.appendChild(div);
    });
  }

  updateCharts();
}

// Criar/Atualizar Gráficos Chart.js
function updateCharts() {
  const disciplinedCount = records.filter(r => r.disciplined).length;
  const undisciplinedCount = records.filter(r => !r.disciplined).length;

  // Gráfico Rosca (Disciplina)
  const ctxDisc = document.getElementById('disciplineChart').getContext('2d');
  if (disciplineChart) disciplineChart.destroy();
  disciplineChart = new Chart(ctxDisc, {
    type: 'doughnut',
    data: {
      labels: ['Disciplinado', 'Indisciplinado'],
      datasets: [{
        data: [disciplinedCount, undisciplinedCount],
        backgroundColor: ['#22c55e', '#ef4444'],
        borderWidth: 0
      }]
    },
    options: { plugins: { legend: { labels: { color: '#fff' } } } }
  });

  // Gráfico Linha (Evolução de PnL)
  const ctxPnl = document.getElementById('pnlChart').getContext('2d');
  if (pnlChart) pnlChart.destroy();
  pnlChart = new Chart(ctxPnl, {
    type: 'line',
    data: {
      labels: records.map(r => r.date),
      datasets: [{
        label: 'Resultado (R$)',
        data: records.map(r => r.pnl),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        fill: true,
        tension: 0.2
      }]
    },
    options: {
      scales: {
        x: { ticks: { color: '#9ca3af' } },
        y: { ticks: { color: '#9ca3af' } }
      },
      plugins: { legend: { display: false } }
    }
  });
}

// Inicialização
renderMissions();
updateUI();