(() => {
  'use strict';

  const STORAGE_KEY = 'clareza-pagamentos-settings-v1';
  const DEFAULT_SETTINGS = {
    name: 'André Barros Costa',
    role: '',
    address: '',
    phone: '',
    email: ''
  };

  const IPTU_RATES = [
    { label: 'Residencial edificado · 0,50%', rate: 0.005 },
    { label: 'Comercial / não residencial · 1,00%', rate: 0.01 },
    { label: 'Uso misto · 0,75%', rate: 0.0075 },
    { label: 'Terreno com muro e calçada · 1,25%', rate: 0.0125 },
    { label: 'Com apenas muro ou calçada · 2,50%', rate: 0.025 },
    { label: 'Sem muro e sem calçada · 8,50%', rate: 0.085 },
    { label: 'Sem função social · 9% progressivo', rate: 0.09 }
  ];

  // Referências carregadas do material recebido. Cada coeficiente é multiplicado pela UPF informada.
  const TAX_CATALOG = [
    { category: 'OBRAS', name: 'Alvará de construção — residencial', type: 'm2', rate: 0.033, note: '0,033 UPF por m²' },
    { category: 'OBRAS', name: 'Alvará de construção — comercial', type: 'm2', rate: 0.055, note: '0,055 UPF por m²' },
    { category: 'OBRAS', name: 'Licença — condomínio residencial', type: 'm2', rate: 0.01, note: '0,01 UPF por m²' },
    { category: 'OBRAS', name: 'Licença — loteamento (infra geral)', type: 'm2', rate: 0.002, note: '0,002 UPF por m²' },
    { category: 'OBRAS', name: 'Licença — sítio de lazer', type: 'm2', rate: 0.0016, note: '0,0016 UPF por m²' },
    { category: 'OBRAS', name: 'Renovação de licença — residencial', type: 'upf', rate: 2, note: 'Licença vencida antes do fim da obra' },
    { category: 'OBRAS', name: 'Renovação de licença — comercial', type: 'upf', rate: 4 },
    { category: 'OBRAS', name: 'Vistoria Habite-se — residencial', type: 'upf', rate: 3, note: 'Pré-requisito para averbação da construção' },
    { category: 'OBRAS', name: 'Vistoria Habite-se — comercial', type: 'upf', rate: 4 },
    { category: 'OBRAS', name: 'Vistoria Habite-se — uso misto', type: 'upf', rate: 5 },
    { category: 'OBRAS', name: 'Vistoria Habite-se — condomínio até 20 unidades', type: 'upf', rate: 10 },
    { category: 'OBRAS', name: 'Vistoria Habite-se — condomínio acima de 20 unidades', type: 'upf', rate: 20 },
    { category: 'OBRAS', name: 'Autorização de demolição', type: 'upf', rate: 2, note: 'Total ou parcial' },
    { category: 'AMBIENTAL', name: 'Certidão de viabilidade ambiental — mínimo', type: 'upf', rate: 0.2 },
    { category: 'AMBIENTAL', name: 'Certidão de viabilidade ambiental — pequeno porte', type: 'upf', rate: 1 },
    { category: 'AMBIENTAL', name: 'Certidão de viabilidade ambiental — médio porte', type: 'upf', rate: 1.5 },
    { category: 'AMBIENTAL', name: 'Certidão de viabilidade ambiental — grande porte', type: 'upf', rate: 4 },
    { category: 'AMBIENTAL', name: 'Análise EIV/RIV — pequeno', type: 'upf', rate: 1 },
    { category: 'AMBIENTAL', name: 'Análise EIV/RIV — médio', type: 'upf', rate: 3 },
    { category: 'AMBIENTAL', name: 'Análise EIV/RIV — grande', type: 'upf', rate: 5 },
    { category: 'AMBIENTAL', name: 'Análise EIV/RIV — excepcional', type: 'upf', rate: 10 },
    { category: 'AMBIENTAL', name: 'Vistoria para poda de árvore', type: 'un', rate: 0.2, note: 'Por árvore' },
    { category: 'AMBIENTAL', name: 'Vistoria para supressão de árvore', type: 'un', rate: 0.25, note: 'Por árvore' },
    { category: 'VISTORIA', name: 'Vistoria de poder de polícia — até 250 m²', type: 'upf', rate: 1 },
    { category: 'VISTORIA', name: 'Vistoria — 250 a 500 m²', type: 'upf', rate: 1.5 },
    { category: 'VISTORIA', name: 'Vistoria — 500 a 750 m²', type: 'upf', rate: 3 },
    { category: 'VISTORIA', name: 'Vistoria — 750 a 1.000 m²', type: 'upf', rate: 4 },
    { category: 'VISTORIA', name: 'Vistoria — 1.000 a 1.250 m²', type: 'upf', rate: 4.5 },
    { category: 'VISTORIA', name: 'Vistoria — 1.250 a 1.500 m²', type: 'upf', rate: 5 },
    { category: 'VISTORIA', name: 'Vistoria — 1.500 a 1.750 m²', type: 'upf', rate: 5.5 },
    { category: 'VISTORIA', name: 'Vistoria — 1.750 a 2.000 m²', type: 'upf', rate: 6 },
    { category: 'VISTORIA', name: 'Vistoria — acima de 2.000 m²', type: 'upf', rate: 7 }
  ];

  const UNPRICED = [
    ['TRIBUTOS', 'TRSD (taxa de lixo)', 'Anual, junto com IPTU ou em guia própria · conferir no carnê ou DAM'],
    ['TRIBUTOS', 'ISSQN da construção civil', 'Habite-se ou regularização de obra · SEMFAZ / processo'],
    ['OBRAS', 'Taxa de regularização de obra', 'Obra sem licença ou área não cadastrada · SEMUR / processo'],
    ['OBRAS', 'Desmembramento', 'Divisão de terreno: varia conforme área e lotes · SEMUR / DAM do processo'],
    ['OBRAS', 'Remembramento / unificação', 'União de lotes · SEMUR / DAM do processo'],
    ['OBRAS', 'Loteamento (aprovação)', 'Análise, infraestrutura, EIV/RIV e fiscalização · SEMUR / SEMA'],
    ['ADMINISTRATIVAS', 'Taxa de expediente', 'Abertura ou tramitação de processo · guia no protocolo'],
    ['ADMINISTRATIVAS', 'Certidões municipais', 'Venal, narrativa, logradouro e outros pedidos · Portal de Serviços'],
    ['ADMINISTRATIVAS', 'Avaliação imobiliária municipal', 'Escritura plena, alienação ou regularização · processo administrativo'],
    ['ADMINISTRATIVAS', 'Demarcação / marcação de terreno', 'Definição de limites e alinhamento · SEMUR'],
    ['ADMINISTRATIVAS', 'Plantas, mapas, cópias e segunda via', 'Reprodução de documentos · guia no atendimento'],
    ['ADMINISTRATIVAS', 'Atualização cadastral / titularidade', 'Após registro ou alteração do imóvel · expediente + processo'],
    ['URBANÍSTICAS', 'Consulta de uso e ocupação do solo', 'Viabilidade de atividade ou empreendimento · SEMUR'],
    ['URBANÍSTICAS', 'Análise ou aprovação de projeto', 'Varia conforme área, unidades e complexidade · SEMUR'],
    ['URBANÍSTICAS', 'Outorga onerosa do direito de construir', 'Acima do coeficiente básico · Plano Diretor / SEMUR'],
    ['AMBIENTAL', 'Licenciamento ambiental (LP/LI/LO)', 'Varia conforme porte e atividade · SEMA'],
    ['AMBIENTAL', 'Supressão vegetal / compensação', 'Autorização e plantio compensatório · SEMA'],
    ['AMBIENTAL', 'Movimentação de terra', 'Terraplanagem, corte ou aterro · SEMA / SEMUR'],
    ['FUNDIÁRIO', 'Escritura plena (imóvel municipal)', 'Preço do terreno, avaliação, expediente e certidões · SEMUR'],
    ['FUNDIÁRIO', 'Foro anual / laudêmio', 'Imóvel aforado ou domínio útil · conferir matrícula e SEMFAZ'],
    ['FUNDIÁRIO', 'Anuência municipal', 'Transferência, escritura ou financiamento de imóvel municipal · SEMUR'],
    ['MULTAS', 'Obra sem licença / sem Habite-se', 'Fiscalização; pode se somar às taxas de regularização · auto de infração'],
    ['MULTAS', 'Multa ambiental', 'Corte sem autorização, dano ou área protegida · auto de infração SEMA'],
    ['MULTAS', 'Encargos de débito', 'Mora, juros, correção, dívida ativa ou protesto · extrato SEMFAZ']
  ];

  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));
  const moneyFmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const moneyNumberFmt = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const numberFmt = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });
  const state = {
    condition: 'cash',
    activeScenario: '',
    suppressScenarioReset: false,
    currentPlan: null,
    settings: loadSettings(),
    selectedTaxes: [],
    toastTimer: 0
  };

  function loadSettings() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch (_) {
      return { ...DEFAULT_SETTINGS };
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.settings));
      return true;
    } catch (_) {
      showToast('O navegador não conseguiu guardar as configurações.');
      return false;
    }
  }

  function cents(amount) { return Math.round((Number(amount) || 0) * 100); }
  function fromCents(value) { return (Number(value) || 0) / 100; }
  function parseMoney(value) {
    let text = String(value ?? '').trim().replace(/[^\d,.-]/g, '');
    if (!text) return 0;
    const comma = text.lastIndexOf(',');
    const dot = text.lastIndexOf('.');
    if (comma >= 0 && dot >= 0) {
      text = comma > dot ? text.replace(/\./g, '').replace(',', '.') : text.replace(/,/g, '');
    } else if (comma >= 0) {
      text = text.replace(/\./g, '').replace(',', '.');
    } else if ((text.match(/\./g) || []).length > 1 || (dot >= 0 && text.length - dot - 1 === 3 && text.length > 4)) {
      text = text.replace(/\./g, '');
    }
    const valueNumber = Number(text);
    return Number.isFinite(valueNumber) ? valueNumber : 0;
  }

  function moneyValue(id) { return parseMoney($('#' + id)?.value); }
  function formatMoney(value) { return moneyFmt.format(Number.isFinite(value) ? value : 0); }
  function formatMoneyInput(input) {
    const digits = input.value.replace(/\D/g, '').slice(0, 15);
    if (!digits) {
      input.value = '';
      return;
    }
    const amount = Number(digits) / 100;
    input.value = moneyNumberFmt.format(amount);
    if (document.activeElement === input && typeof input.setSelectionRange === 'function') {
      input.setSelectionRange(input.value.length, input.value.length);
    }
  }
  function safeText(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  }
  function todayISO() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }
  function isoDate(value) {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
  }
  function formatDate(value, includeYear = true) {
    const date = value instanceof Date ? value : isoDate(value);
    if (!date) return 'A combinar';
    const options = { day: '2-digit', month: '2-digit' };
    if (includeYear) options.year = 'numeric';
    return new Intl.DateTimeFormat('pt-BR', options).format(date);
  }
  function dateToISO(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
  function addMonths(value, amount) {
    const original = value instanceof Date ? value : isoDate(value);
    if (!original) return null;
    const day = original.getDate();
    const result = new Date(original.getFullYear(), original.getMonth() + amount, 1);
    result.setDate(Math.min(day, new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate()));
    return result;
  }
  function addDays(value, amount) {
    const original = value instanceof Date ? new Date(value) : isoDate(value);
    if (!original) return null;
    original.setDate(original.getDate() + amount);
    return original;
  }
  function distribute(totalCents, count) {
    if (!Number.isInteger(count) || count < 1 || totalCents < 0) return [];
    const base = Math.floor(totalCents / count);
    const rows = Array.from({ length: count }, () => base);
    rows[count - 1] += totalCents - base * count;
    return rows;
  }
  function setMoneyFieldBlur(input) {
    const value = parseMoney(input.value);
    if (value > 0) input.value = moneyNumberFmt.format(value);
  }

  function generateProposalReference() {
    const day = todayISO().replace(/-/g, '');
    const key = `clareza-proposal-sequence-${day}`;
    try {
      const next = Math.max(0, Number(localStorage.getItem(key)) || 0) + 1;
      localStorage.setItem(key, String(next));
      return `PROP-${day}-${String(next).padStart(3, '0')}`;
    } catch (_) {
      return `PROP-${day}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
    }
  }
  function invalidateActiveScenario() {
    if (!state.suppressScenarioReset) state.activeScenario = '';
  }

  function initDates() {
    const today = todayISO();
    $('#issueDate').value = today;
    $('#validUntil').value = dateToISO(addDays(today, 15));
    $('#cashDate').value = today;
    $('#installmentFirstDate').value = dateToISO(addMonths(today, 1));
    $('#downpaymentDate').value = today;
    $('#downpaymentFirstDate').value = dateToISO(addDays(today, 30));
  }

  function setCondition(condition, fromScenario = false) {
    state.condition = condition;
    if (!fromScenario) state.activeScenario = '';
    $$('[data-condition]').forEach(button => {
      const active = button.dataset.condition === condition;
      button.classList.toggle('is-selected', active);
      button.setAttribute('aria-pressed', String(active));
    });
    $$('[data-fields]').forEach(section => {
      const active = section.dataset.fields === condition;
      section.hidden = !active;
      section.classList.toggle('is-hidden', !active);
    });
    renderAll();
  }

  function calculatePlan() {
    const totalCents = cents(moneyValue('totalValue'));
    if (totalCents <= 0) return { plan: null, error: '' };
    const total = fromCents(totalCents);
    let rows = [];
    let dueCents = totalCents;
    let discountCents = 0;
    let entryCents = 0;
    let balanceCents = totalCents;
    let count = 1;
    let firstDate = null;
    let entryDate = null;
    let conditionLabel = '';
    let detail = '';

    if (state.condition === 'cash') {
      const raw = Math.max(0, Number($('#discountValue').value) || 0);
      if ($('#discountType').value === 'percent') {
        discountCents = Math.min(totalCents, Math.round(totalCents * Math.min(raw, 100) / 100));
        detail = raw > 0 ? `Pagamento à vista com ${numberFmt.format(Math.min(raw, 100))}% de desconto` : 'Pagamento à vista';
      } else {
        discountCents = Math.min(totalCents, cents(raw));
        detail = discountCents > 0 ? `Pagamento à vista com desconto de ${formatMoney(fromCents(discountCents))}` : 'Pagamento à vista';
      }
      dueCents = totalCents - discountCents;
      rows = [{ label: 'Pagamento único', date: $('#cashDate').value, cents: dueCents, remaining: 0 }];
      conditionLabel = 'À vista';
    } else if (state.condition === 'installments') {
      count = Math.floor(Number($('#installmentCount').value) || 0);
      if (count < 1 || count > 360) return { plan: null, error: 'Informe de 1 a 360 parcelas.' };
      firstDate = $('#installmentFirstDate').value;
      detail = `${count} parcelas sem entrada`;
      conditionLabel = 'Parcelado';
      const parts = distribute(totalCents, count);
      let remaining = totalCents;
      rows = parts.map((part, index) => {
        remaining -= part;
        const date = isoDate(firstDate);
        return { label: `Parcela ${index + 1} de ${count}`, date: date ? dateToISO(addMonths(date, index)) : '', cents: part, remaining };
      });
    } else {
      entryCents = cents(moneyValue('downpaymentValue'));
      if (entryCents >= totalCents) return { plan: null, error: 'A entrada precisa ser menor que o valor total.' };
      if (entryCents < 0) return { plan: null, error: 'Confira o valor da entrada.' };
      balanceCents = totalCents - entryCents;
      count = Math.floor(Number($('#downpaymentCount').value) || 0);
      if (count < 1 || count > 360) return { plan: null, error: 'Informe de 1 a 360 parcelas para o saldo.' };
      entryDate = $('#downpaymentDate').value;
      firstDate = $('#downpaymentFirstDate').value;
      detail = `${formatMoney(fromCents(entryCents))} de entrada + ${count} parcelas`;
      conditionLabel = 'Entrada + parcelas';
      let remaining = balanceCents;
      if (entryCents > 0) {
        rows.push({ label: 'Entrada', date: entryDate, cents: entryCents, remaining: balanceCents, isEntry: true });
      }
      const parts = distribute(balanceCents, count);
      rows.push(...parts.map((part, index) => {
        remaining -= part;
        const date = isoDate(firstDate);
        return { label: `Parcela ${index + 1} de ${count}`, date: date ? dateToISO(addMonths(date, index)) : '', cents: part, remaining };
      }));
    }

    const plan = {
      condition: state.condition,
      conditionLabel,
      detail,
      totalCents,
      total,
      dueCents,
      discountCents,
      entryCents,
      balanceCents,
      count,
      firstDate,
      entryDate,
      rows,
      lastDate: rows.length ? rows[rows.length - 1].date : ''
    };
    return { plan, error: '' };
  }

  function renderSummary(plan, error) {
    const host = $('#summaryContent');
    if (!plan) {
      const title = error ? 'Revise os dados da condição' : 'Comece pelo valor total';
      const message = error || 'As opções e o cronograma aparecem aqui enquanto você preenche.';
      host.innerHTML = `<div class="empty-summary"><span>${error ? '!' : '01'}</span><strong>${safeText(title)}</strong><p>${safeText(message)}</p></div>`;
      return;
    }

    const metrics = [];
    if (plan.condition === 'cash') {
      metrics.push(['Valor original', formatMoney(plan.total)]);
      if (plan.discountCents > 0) metrics.push(['Desconto', `− ${formatMoney(fromCents(plan.discountCents))}`]);
      metrics.push(['Data do pagamento', formatDate($('#cashDate').value)]);
    } else if (plan.condition === 'installments') {
      metrics.push(['Número de parcelas', `${plan.count}×`]);
      metrics.push(['Valor médio', formatMoney(fromCents(plan.dueCents / plan.count))]);
      metrics.push(['Primeiro vencimento', formatDate(plan.firstDate)]);
      metrics.push(['Último vencimento', formatDate(plan.lastDate)]);
    } else {
      metrics.push(['Valor de entrada', formatMoney(fromCents(plan.entryCents))]);
      metrics.push(['Saldo parcelado', formatMoney(fromCents(plan.balanceCents))]);
      metrics.push(['Valor médio', formatMoney(fromCents(plan.balanceCents / plan.count))]);
      metrics.push(['Primeiro vencimento', formatDate(plan.firstDate)]);
    }

    host.innerHTML = `<div class="summary-total-label">TOTAL DA CONDIÇÃO</div>
      <strong class="summary-total">${formatMoney(fromCents(plan.dueCents))}</strong>
      <div class="summary-subtitle">${safeText(plan.detail)}</div>
      <div class="summary-pairs">${metrics.map(([label, value]) => `<div class="summary-pair"><span>${safeText(label)}</span><strong>${safeText(value)}</strong></div>`).join('')}</div>
      ${state.selectedTaxes.length && $('#includeTaxCosts').checked ? `<p class="summary-note">Taxas municipais estimadas: ${formatMoney(fromCents(calculateTaxTotals().grandCents))} · discriminadas à parte na impressão.</p>` : ''}`;
  }

  function renderSchedule(plan, error) {
    const body = $('#scheduleBody');
    if (!plan) {
      $('#scheduleCount').textContent = error ? 'Dados para revisar' : 'Aguardando simulação';
      body.innerHTML = `<tr class="empty-row"><td colspan="4">${safeText(error || 'Informe o valor e a condição para montar o cronograma.')}</td></tr>`;
      return;
    }
    $('#scheduleCount').textContent = `${plan.rows.length} ${plan.rows.length === 1 ? 'etapa' : 'etapas'}`;
    body.innerHTML = plan.rows.map(row => `<tr class="${row.isEntry ? 'entry-row' : ''}">
      <td>${safeText(row.label)}</td><td>${formatDate(row.date)}</td><td>${formatMoney(fromCents(row.cents))}</td><td>${formatMoney(fromCents(row.remaining))}</td>
    </tr>`).join('');
  }

  function scenarioSettings() {
    return {
      discount: Math.min(100, Math.max(0, Number($('#scenarioDiscount').value) || 0)),
      a: Math.min(360, Math.max(1, Math.floor(Number($('#scenarioA').value) || 1))),
      b: Math.min(360, Math.max(1, Math.floor(Number($('#scenarioB').value) || 1))),
      entryPercent: Math.min(99, Math.max(0, Number($('#scenarioEntryPercent').value) || 0)),
      entryCount: Math.min(360, Math.max(1, Math.floor(Number($('#scenarioEntryCount').value) || 1)))
    };
  }

  function calculateScenarios() {
    const totalCents = cents(moneyValue('totalValue'));
    if (totalCents <= 0) return [];
    const setup = scenarioSettings();
    const firstInstallment = addMonths(todayISO(), 1);
    const firstEntryInstallment = addDays(todayISO(), 30);
    const cashDiscount = Math.min(totalCents, Math.round(totalCents * setup.discount / 100));
    const cashCents = totalCents - cashDiscount;
    const entryCents = Math.round(totalCents * setup.entryPercent / 100);
    const balance = totalCents - entryCents;
    const specs = [
      {
        id: 'cash', label: 'À vista', price: formatMoney(fromCents(cashCents)),
        detail: setup.discount ? `${setup.discount}% de desconto · economia de ${formatMoney(fromCents(cashDiscount))}` : 'Pagamento único',
        due: formatDate(todayISO()), recommend: true, condition: 'cash'
      },
      {
        id: 'a', label: `Opção A · ${setup.a}×`, price: `${setup.a}× de ${formatMoney(fromCents(totalCents / setup.a))}`,
        detail: `${formatMoney(fromCents(totalCents))} no total`, due: `1ª ${formatDate(dateToISO(firstInstallment))} · última ${formatDate(dateToISO(addMonths(firstInstallment, setup.a - 1)))}`, condition: 'installments'
      },
      {
        id: 'b', label: `Opção B · ${setup.b}×`, price: `${setup.b}× de ${formatMoney(fromCents(totalCents / setup.b))}`,
        detail: `${formatMoney(fromCents(totalCents))} no total`, due: `1ª ${formatDate(dateToISO(firstInstallment))} · última ${formatDate(dateToISO(addMonths(firstInstallment, setup.b - 1)))}`, condition: 'installments'
      },
      {
        id: 'entry', label: `Entrada ${setup.entryPercent}% + ${setup.entryCount}×`, price: `${formatMoney(fromCents(entryCents))} + ${setup.entryCount}× de ${formatMoney(fromCents(balance / setup.entryCount))}`,
        detail: `${formatMoney(fromCents(totalCents))} no total`, due: `Entrada hoje · 1ª ${formatDate(dateToISO(firstEntryInstallment))} · última ${formatDate(dateToISO(addMonths(firstEntryInstallment, setup.entryCount - 1)))}`, condition: 'downpayment'
      }
    ];
    return specs;
  }

  function renderScenarios() {
    const host = $('#scenarioGrid');
    const scenarios = calculateScenarios();
    if (!scenarios.length) {
      host.innerHTML = '<div class="scenario-empty">Digite o valor total para comparar os caminhos de pagamento.</div>';
      return;
    }
    host.innerHTML = scenarios.map(item => {
      const selected = state.activeScenario === item.id;
      return `<button type="button" class="scenario-card${selected ? ' is-selected' : ''}${item.recommend ? ' is-recommended' : ''}" data-scenario="${item.id}" aria-pressed="${selected}">
        <span class="scenario-tag">${safeText(item.label)}</span><strong class="scenario-price">${safeText(item.price)}</strong>
        <span class="scenario-detail">${safeText(item.detail)}</span><span class="scenario-select">${selected ? '✓ EM USO' : 'Usar esta opção →'}</span>
      </button>`;
    }).join('');
  }

  function applyScenario(id) {
    const scenarios = calculateScenarios();
    const item = scenarios.find(option => option.id === id);
    if (!item) return;
    const setup = scenarioSettings();
    state.suppressScenarioReset = true;
    state.activeScenario = id;
    if (id === 'cash') {
      setCondition('cash', true);
      $('#discountType').value = 'percent';
      $('#discountValue').value = String(setup.discount);
    } else if (id === 'a' || id === 'b') {
      setCondition('installments', true);
      $('#installmentCount').value = String(id === 'a' ? setup.a : setup.b);
    } else {
      setCondition('downpayment', true);
      $('#downpaymentValue').value = numberFmt.format(moneyValue('totalValue') * setup.entryPercent / 100);
      const first = addDays($('#downpaymentDate').value || todayISO(), 30);
      $('#downpaymentFirstDate').value = dateToISO(first);
      $('#downpaymentCount').value = String(setup.entryCount);
    }
    state.suppressScenarioReset = false;
    renderAll();
  }

  function renderAll() {
    const result = calculatePlan();
    state.currentPlan = result.plan;
    renderSummary(result.plan, result.error);
    renderSchedule(result.plan, result.error);
    renderScenarios();
    updatePreviews(result.plan);
  }

  function updatePreviews(plan) {
    $('#discountLabel').textContent = $('#discountType').value === 'percent' ? 'Percentual de desconto' : 'Valor do desconto';
    $('#discountSuffix').textContent = $('#discountType').value === 'percent' ? '%' : 'R$';
    const rawDiscount = Math.max(0, Number($('#discountValue').value) || 0);
    const base = cents(moneyValue('totalValue'));
    const discount = $('#discountType').value === 'percent' ? Math.min(base, Math.round(base * rawDiscount / 100)) : Math.min(base, cents(rawDiscount));
    $('#discountSaving').textContent = formatMoney(fromCents(discount));
    const installments = Math.max(1, Math.floor(Number($('#installmentCount').value) || 1));
    $('#installmentPreview').textContent = formatMoney(fromCents(base / installments));
    const down = cents(moneyValue('downpaymentValue'));
    const balance = Math.max(0, base - down);
    const downCount = Math.max(1, Math.floor(Number($('#downpaymentCount').value) || 1));
    $('#remainingBalance').textContent = formatMoney(fromCents(balance));
    $('#downpaymentPreview').textContent = formatMoney(fromCents(balance / downCount));
    if (plan?.condition === 'cash' && plan.discountCents > 0) $('#discountSaving').textContent = formatMoney(fromCents(plan.discountCents));
  }

  function calculateTaxItem(item) {
    const formula = item.formula;
    if (formula.type === 'upf') {
      const upfCents = cents(moneyValue('upfValue'));
      return Math.round(upfCents * formula.rate * formula.quantity);
    }
    if (formula.type === 'rate') return Math.round(formula.baseCents * formula.rate);
    return cents(formula.value || 0);
  }

  function calculateTaxTotals() {
    const subtotalCents = state.selectedTaxes.reduce((sum, item) => sum + calculateTaxItem(item), 0);
    const buffer = Math.max(0, Number($('#taxBuffer')?.value) || 0);
    const reserveCents = Math.round(subtotalCents * buffer / 100);
    return { subtotalCents, reserveCents, grandCents: subtotalCents + reserveCents, buffer };
  }

  function renderSelectedTaxes() {
    const host = $('#selectedTaxList');
    if (!state.selectedTaxes.length) {
      host.innerHTML = '<div class="tax-empty">Inclua uma estimativa rápida ou escolha um item do catálogo.</div>';
    } else {
      host.innerHTML = state.selectedTaxes.map((item, index) => `<div class="selected-tax-item"><span>${safeText(item.name)}</span><strong>${formatMoney(fromCents(calculateTaxItem(item)))}</strong><button type="button" class="tax-remove" data-remove-tax="${index}" aria-label="Remover ${safeText(item.name)}">×</button></div>`).join('');
    }
    const totals = calculateTaxTotals();
    $('#taxSubtotal').textContent = formatMoney(fromCents(totals.subtotalCents));
    $('#taxBufferAmount').textContent = formatMoney(fromCents(totals.reserveCents));
    $('#taxGrandTotal').textContent = formatMoney(fromCents(totals.grandCents));
    const include = $('#includeTaxCostsSecond').checked;
    $('#includeTaxCosts').checked = include;
    renderSummary(state.currentPlan, '');
  }

  function renderTaxRates() {
    $('#iptuRate').innerHTML = IPTU_RATES.map((item, index) => `<option value="${index}">${safeText(item.label)}</option>`).join('');
  }

  function updateQuickTaxResults() {
    const itbi = Math.round(cents(moneyValue('itbiBase')) * 0.02);
    const area = Math.max(0, Number($('#permitArea').value) || 0);
    const permitCents = Math.round(cents(moneyValue('upfValue')) * (Number($('#permitType').value) || 0) * area);
    const iptuRate = IPTU_RATES[Number($('#iptuRate').value) || 0]?.rate || 0;
    const iptu = Math.round(cents(moneyValue('iptuBase')) * iptuRate);
    $('#itbiResult').textContent = formatMoney(fromCents(itbi));
    $('#permitResult').textContent = formatMoney(fromCents(permitCents));
    $('#iptuResult').textContent = `${formatMoney(fromCents(iptu))} / ano`;
  }

  function renderCatalog() {
    const query = normalizeText($('#taxSearch').value.trim());
    const filtered = TAX_CATALOG.map((item, index) => ({ item, index })).filter(({ item }) => !query || normalizeText(`${item.category} ${item.name} ${item.note || ''}`).includes(query));
    if (!filtered.length) {
      $('#taxCatalog').innerHTML = '<div class="catalog-empty">Nenhuma taxa encontrada com esse termo.</div>';
      return;
    }
    let category = '';
    let html = '';
    filtered.forEach(({ item, index }) => {
      if (item.category !== category) {
        category = item.category;
        html += `<div class="catalog-category">${safeText(category)}</div>`;
      }
      const unit = item.type === 'm2' ? 'm²' : item.type === 'un' ? 'un.' : 'item';
      const upfCents = cents(moneyValue('upfValue'));
      const rateAmount = formatMoney(fromCents(Math.round(upfCents * item.rate)));
      html += `<div class="catalog-row"><div class="catalog-name">${safeText(item.name)}${item.note ? `<span class="catalog-note">${safeText(item.note)}</span>` : ''}</div><span class="catalog-amount">${rateAmount} / ${unit}</span><input type="number" class="catalog-quantity" id="taxQty-${index}" min="0.01" step="0.01" value="1" aria-label="Quantidade para ${safeText(item.name)}"><button type="button" class="catalog-add" data-add-catalog="${index}">Incluir</button></div>`;
    });
    $('#taxCatalog').innerHTML = html;
  }

  function normalizeText(value) {
    return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function renderUnpriced() {
    $('#unpricedList').innerHTML = UNPRICED.map(([category, name, note]) => `<div class="unpriced-item"><strong>${safeText(category)} · ${safeText(name)}</strong><span>${safeText(note)}</span></div>`).join('');
  }

  function addQuickTax(type) {
    if (type === 'itbi') {
      const base = cents(moneyValue('itbiBase'));
      if (base <= 0) return showToast('Informe a base de cálculo do ITBI primeiro.');
      state.selectedTaxes.push({ name: `ITBI · 2% sobre ${formatMoney(fromCents(base))}`, formula: { type: 'rate', baseCents: base, rate: 0.02 } });
    } else if (type === 'permit') {
      const area = Math.max(0, Number($('#permitArea').value) || 0);
      if (area <= 0) return showToast('Informe a área do imóvel primeiro.');
      const option = $('#permitType').selectedOptions[0];
      const rate = Number($('#permitType').value) || 0;
      state.selectedTaxes.push({ name: `Alvará · ${option.textContent.split(' · ')[0]} · ${numberFmt.format(area)} m²`, formula: { type: 'upf', rate, quantity: area } });
    } else if (type === 'iptu') {
      const base = cents(moneyValue('iptuBase'));
      if (base <= 0) return showToast('Informe o valor venal do imóvel primeiro.');
      const rateIndex = Number($('#iptuRate').value) || 0;
      const rate = IPTU_RATES[rateIndex].rate;
      state.selectedTaxes.push({ name: `IPTU anual · ${IPTU_RATES[rateIndex].label}`, formula: { type: 'rate', baseCents: base, rate } });
    }
    renderSelectedTaxes();
    showToast('Despesa incluída no atendimento.');
  }

  function addCatalogTax(index) {
    const item = TAX_CATALOG[index];
    const quantity = Math.max(0, Number($(`#taxQty-${index}`)?.value) || 0);
    if (!item || quantity <= 0) return showToast('Informe uma quantidade maior que zero.');
    const unit = item.type === 'm2' ? 'm²' : item.type === 'un' ? 'un.' : '';
    const suffix = unit ? ` · ${numberFmt.format(quantity)} ${unit}` : (quantity !== 1 ? ` · ${numberFmt.format(quantity)}×` : '');
    state.selectedTaxes.push({ name: `${item.name}${suffix}`, formula: { type: 'upf', rate: item.rate, quantity } });
    renderSelectedTaxes();
    showToast('Taxa incluída no atendimento.');
  }

  function printData() {
    return {
      client: $('#clientName').value.trim(),
      service: $('#serviceName').value.trim(),
      reference: $('#proposalRef').value.trim(),
      issue: $('#issueDate').value,
      valid: $('#validUntil').value,
      note: $('#proposalNote').value.trim()
    };
  }

  function printHeader(data) {
    const profile = state.settings;
    const contact = [profile.address, profile.phone, profile.email].filter(Boolean).map(safeText).join(' · ');
    return `<header class="print-header"><div class="print-brand"><span class="print-mark">✳</span><div><div class="print-professional">${safeText(profile.name || 'Profissional')}</div><div class="print-role">${safeText(profile.role)}</div><div class="print-contact">${contact}</div></div></div><span class="print-label">CLAREZA · PROPOSTA</span></header>
      <div class="print-title-row"><h1 class="print-title">Plano de pagamento</h1><span class="print-issued">Emitido em ${safeText(formatDate(data.issue))}${data.valid ? ` · Válido até ${safeText(formatDate(data.valid))}` : ''}</span></div>
      <div class="print-client-box">
        <div><span class="print-data-label">Cliente / destinatário</span><div class="print-data-value">${safeText(data.client || '—')}</div></div>
        <div><span class="print-data-label">Serviço ou negociação</span><div class="print-data-value">${safeText(data.service || '—')}</div></div>
        ${data.reference ? `<div><span class="print-data-label">Referência</span><div class="print-data-value">${safeText(data.reference)}</div></div>` : ''}
        ${data.valid ? `<div><span class="print-data-label">Validade</span><div class="print-data-value">${safeText(formatDate(data.valid))}</div></div>` : ''}
      </div>`;
  }

  function printCostBlock() {
    if (!$('#includeTaxCosts').checked || !state.selectedTaxes.length) return '';
    const totals = calculateTaxTotals();
    return `<section class="print-costs"><h2 class="print-section-title">Despesas municipais estimadas · discriminadas à parte</h2>
      ${state.selectedTaxes.map(item => `<div class="print-cost-line"><span>${safeText(item.name)}</span><strong>${formatMoney(fromCents(calculateTaxItem(item)))}</strong></div>`).join('')}
      <div class="print-cost-line"><span>Subtotal das despesas</span><strong>${formatMoney(fromCents(totals.subtotalCents))}</strong></div>
      <div class="print-cost-line"><span>Reserva adicional (${numberFmt.format(totals.buffer)}%)</span><strong>${formatMoney(fromCents(totals.reserveCents))}</strong></div>
      <div class="print-cost-total"><span>Total estimado de despesas</span><strong>${formatMoney(fromCents(totals.grandCents))}</strong></div>
      <p class="print-footnote">Estimativa com base nos parâmetros de referência. Confirme cada valor no DAM ou na tabela oficial vigente.</p></section>`;
  }

  function printDisclaimer() {
    return '<p class="print-disclaimer">Esta simulação apresenta condições para fins de proposta comercial e não substitui o contrato ou instrumento definitivo. Datas, condições e despesas devem ser confirmadas entre as partes e, quando aplicável, no órgão competente.</p>';
  }

  function printSelectedPlan(plan, data, costs = '') {
    if (!plan) return '';
    const metrics = [
      `<div class="print-metric"><span>VALOR ORIGINAL</span><strong>${formatMoney(plan.total)}</strong></div>`,
      `<div class="print-metric"><span>CONDIÇÃO</span><strong>${safeText(plan.conditionLabel)}</strong></div>`,
      `<div class="print-metric is-primary"><span>TOTAL DA CONDIÇÃO</span><strong>${formatMoney(fromCents(plan.dueCents))}</strong></div>`
    ];
    if (plan.discountCents > 0) metrics.push(`<div class="print-metric"><span>DESCONTO</span><strong>− ${formatMoney(fromCents(plan.discountCents))}</strong></div>`);
    if (plan.condition === 'downpayment') {
      metrics.push(`<div class="print-metric"><span>ENTRADA</span><strong>${formatMoney(fromCents(plan.entryCents))}</strong></div>`);
      metrics.push(`<div class="print-metric"><span>SALDO PARCELADO</span><strong>${formatMoney(fromCents(plan.balanceCents))}</strong></div>`);
    }
    const renderTable = (rows, compact = false) => `<table class="print-table${compact ? ' print-table-compact' : ''}"><thead><tr><th>Etapa</th><th>${compact ? 'Venc.' : 'Vencimento'}</th><th>Valor</th><th>${compact ? 'Saldo' : 'Saldo após pagamento'}</th></tr></thead><tbody>${rows.map(row => `<tr class="${row.isEntry ? 'entry-row' : ''}"><td>${safeText(row.label)}</td><td>${safeText(formatDate(row.date))}</td><td>${formatMoney(fromCents(row.cents))}</td><td>${formatMoney(fromCents(row.remaining))}</td></tr>`).join('')}</tbody></table>`;
    let table;
    if (plan.rows.length > 12) {
      const middle = Math.ceil(plan.rows.length / 2);
      table = `<div class="print-schedule-columns">${renderTable(plan.rows.slice(0, middle), true)}${renderTable(plan.rows.slice(middle), true)}</div>`;
    } else {
      table = renderTable(plan.rows);
    }
    const notes = data.note ? `<p class="print-note"><strong>Observações:</strong> ${safeText(data.note)}</p>` : '';
    const dateLine = plan.condition === 'cash'
      ? `<div class="print-condition-line"><span>${safeText(plan.detail)}</span><strong>Pagamento em ${safeText(formatDate($('#cashDate').value))}</strong></div>`
      : `<div class="print-condition-line"><span>${safeText(plan.detail)}</span><strong>${plan.count} ${plan.count === 1 ? 'parcela' : 'parcelas'}</strong></div>`;
    return `<section class="print-only-selected"><h2 class="print-section-title">Condição escolhida</h2><div class="print-summary">${metrics.join('')}</div>${dateLine}<h2 class="print-section-title">Cronograma</h2>${table}${costs}${notes}
      <div class="print-signoff"><div class="print-signature">${safeText(data.client || 'Cliente')}<br>Cliente / destinatário</div><div class="print-signature">${safeText(state.settings.name)}<br>Responsável pela proposta</div></div></section>`;
  }

  function printComparison(data, costs = '') {
    const scenarios = calculateScenarios();
    if (!scenarios.length) return '';
    const total = fromCents(cents(moneyValue('totalValue')));
    const cards = scenarios.map(item => `<article class="print-option"><h3>${safeText(item.label)}</h3><strong>${safeText(item.price)}</strong><p>${safeText(item.detail)}</p><p>${safeText(item.due)}</p></article>`).join('');
    const notes = data.note ? `<p class="print-note"><strong>Observações:</strong> ${safeText(data.note)}</p>` : '';
    return `<section class="print-only-comparison"><h2 class="print-section-title">Comparação de condições</h2><div class="print-condition-line"><span>Valor de referência</span><strong>${formatMoney(total)}</strong></div><div class="print-comparison">${cards}</div>${costs}${notes}
      <p class="print-footnote">Selecione a condição acordada antes de formalizar a proposta. A comparação é uma estimativa; confirme valores e vencimentos no momento da contratação.</p>
      <div class="print-signoff"><div class="print-signature">${safeText(data.client || 'Cliente')}<br>Cliente / destinatário</div><div class="print-signature">${safeText(state.settings.name)}<br>Responsável pela proposta</div></div></section>`;
  }

  function openPrintPreview() {
    if (cents(moneyValue('totalValue')) <= 0) return showToast('Informe o valor total para preparar a impressão.');
    if ($('#printMode').value === 'selected' && !state.currentPlan) return showToast('Revise os dados da condição antes de imprimir.');
    const data = printData();
    const selected = $('#printMode').value === 'selected';
    const documentRoot = $('#printDocument');
    documentRoot.dataset.mode = selected ? 'selected' : 'comparison';
    const costs = printCostBlock();
    documentRoot.innerHTML = `<div class="print-page">${printHeader(data)}${printSelectedPlan(state.currentPlan, data, costs)}${printComparison(data, costs)}${printDisclaimer()}</div>`;
    window.print();
  }

  function whatsAppText(plan) {
    const data = printData();
    const lines = ['*PLANO DE PAGAMENTO*', '━━━━━━━━━━━━━━━━━━━━'];
    if (data.client) lines.push(`*Cliente:* ${data.client}`);
    if (data.service) lines.push(`*Referência:* ${data.service}`);
    if (data.reference) lines.push(`*Proposta:* ${data.reference}`);
    lines.push(`*Valor original:* ${formatMoney(plan.total)}`);
    if (plan.discountCents > 0) lines.push(`*Desconto:* ${formatMoney(fromCents(plan.discountCents))}`);
    lines.push(`*Total da condição:* ${formatMoney(fromCents(plan.dueCents))}`);
    if (plan.condition === 'cash') lines.push(`*Pagamento:* À vista · ${formatDate($('#cashDate').value)}`);
    else if (plan.condition === 'installments') lines.push(`*Parcelamento:* ${plan.count}× · de ${formatDate(plan.firstDate)} a ${formatDate(plan.lastDate)}`);
    else {
      lines.push(`*Entrada:* ${formatMoney(fromCents(plan.entryCents))} · ${formatDate(plan.entryDate)}`);
      lines.push(`*Saldo:* ${formatMoney(fromCents(plan.balanceCents))} em ${plan.count}×`);
      lines.push(`*Parcelas:* de ${formatDate(plan.firstDate)} a ${formatDate(plan.lastDate)}`);
    }
    if ($('#includeTaxCosts').checked && state.selectedTaxes.length) {
      const totals = calculateTaxTotals();
      lines.push(`*Despesas estimadas à parte:* ${formatMoney(fromCents(totals.grandCents))}`);
    }
    if (data.valid) lines.push(`*Validade da proposta:* ${formatDate(data.valid)}`);
    if (data.note) lines.push(`*Observações:* ${data.note}`);
    if (plan.rows.length > 1) {
      lines.push('━━━━━━━━━━━━━━━━━━━━', '*Cronograma*');
      plan.rows.forEach(row => lines.push(`${row.label} · ${formatDate(row.date)} · ${formatMoney(fromCents(row.cents))}`));
    }
    lines.push('━━━━━━━━━━━━━━━━━━━━', '_Simulação para fins de proposta comercial._');
    return lines.join('\n');
  }

  async function copyWhatsApp() {
    if (!state.currentPlan) return showToast('Informe o valor e confira a condição para copiar o resumo.');
    const value = whatsAppText(state.currentPlan);
    try {
      await navigator.clipboard.writeText(value);
    } catch (_) {
      const textarea = document.createElement('textarea');
      textarea.value = value;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand('copy');
      textarea.remove();
      if (!copied) return showToast('Não foi possível copiar. Selecione e copie o resumo manualmente.');
    }
    $('#actionFeedback').textContent = 'Resumo copiado. Cole na conversa do WhatsApp.';
    showToast('Resumo copiado para a área de transferência.');
    window.setTimeout(() => { $('#actionFeedback').textContent = ''; }, 3500);
  }

  function showToast(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(state.toastTimer);
    state.toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 3000);
  }

  function togglePresentation() {
    const fields = $('#presentationFields');
    const button = $('#togglePresentation');
    const expanded = button.getAttribute('aria-expanded') === 'true';
    fields.hidden = expanded;
    button.setAttribute('aria-expanded', String(!expanded));
    button.innerHTML = expanded ? 'Expandir <span aria-hidden="true">⌄</span>' : 'Recolher <span aria-hidden="true">⌃</span>';
  }

  function resetSimulation() {
    ['clientName', 'serviceName', 'proposalRef', 'proposalNote', 'totalValue', 'discountValue', 'downpaymentValue', 'itbiBase', 'iptuBase', 'permitArea', 'taxSearch'].forEach(id => { $('#' + id).value = ''; });
    $('#discountType').value = 'percent';
    $('#discountValue').value = '0';
    $('#installmentCount').value = '6';
    $('#downpaymentCount').value = '6';
    $('#scenarioDiscount').value = '10';
    $('#scenarioA').value = '6';
    $('#scenarioB').value = '12';
    $('#scenarioEntryPercent').value = '20';
    $('#scenarioEntryCount').value = '10';
    $('#taxBuffer').value = '10';
    $('#includeTaxCosts').checked = false;
    $('#includeTaxCostsSecond').checked = false;
    $('#printMode').value = 'selected';
    $('#proposalRef').value = generateProposalReference();
    state.activeScenario = '';
    state.selectedTaxes = [];
    initDates();
    setCondition('cash');
    renderSelectedTaxes();
    updateQuickTaxResults();
    renderCatalog();
    switchTab('payments');
    showToast('Nova simulação pronta.');
  }

  function syncSettingsForm() {
    $('#profileName').value = state.settings.name || '';
    $('#profileRole').value = state.settings.role || '';
    $('#profileAddress').value = state.settings.address || '';
    $('#profilePhone').value = state.settings.phone || '';
    $('#profileEmail').value = state.settings.email || '';
  }

  function settingsFromForm() {
    state.settings = {
      name: $('#profileName').value.trim(),
      role: $('#profileRole').value.trim(),
      address: $('#profileAddress').value.trim(),
      phone: $('#profilePhone').value.trim(),
      email: $('#profileEmail').value.trim()
    };
    saveSettings();
  }

  function exportSettings() {
    const blob = new Blob([JSON.stringify({ app: 'Clareza', version: 1, profile: state.settings }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'clareza-configuracoes.json';
    link.click();
    URL.revokeObjectURL(url);
    showToast('Cópia das configurações baixada.');
  }

  async function importSettings(file) {
    if (!file) return;
    try {
      const payload = JSON.parse(await file.text());
      const profile = payload.profile || payload;
      state.settings = { ...DEFAULT_SETTINGS, ...profile };
      syncSettingsForm();
      saveSettings();
      showToast('Configurações importadas.');
    } catch (_) {
      showToast('Não consegui ler esse arquivo de configurações.');
    }
  }

  function switchTab(name) {
    $$('.nav-tab').forEach(button => {
      const active = button.dataset.tab === name;
      button.classList.toggle('is-active', active);
      if (active) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
    $$('[data-panel]').forEach(panel => {
      const active = panel.dataset.panel === name;
      panel.classList.toggle('is-active', active);
      panel.hidden = !active;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function bindEvents() {
    $$('[data-condition]').forEach(button => button.addEventListener('click', () => setCondition(button.dataset.condition)));
    $$('[data-tab]').forEach(button => button.addEventListener('click', () => switchTab(button.dataset.tab)));
    $$('[data-money]').forEach(input => {
      input.addEventListener('input', () => {
        formatMoneyInput(input);
        if (input.id === 'upfValue') {
          updateQuickTaxResults(); renderCatalog(); renderSelectedTaxes();
        } else if (input.id === 'itbiBase' || input.id === 'iptuBase') updateQuickTaxResults();
        if (input.id === 'totalValue' || input.id === 'downpaymentValue') {
          invalidateActiveScenario();
          renderAll();
        }
      });
      input.addEventListener('blur', () => setMoneyFieldBlur(input));
    });
    $('#permitArea').addEventListener('input', updateQuickTaxResults);
    $$('[data-stepper-target]').forEach(button => button.addEventListener('click', () => {
      const input = $('#' + button.dataset.stepperTarget);
      if (!input) return;
      const min = Number(input.min || 1);
      const max = Number(input.max || 360);
      const current = Number(input.value) || min;
      input.value = String(Math.min(max, Math.max(min, current + Number(button.dataset.step))));
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }));
    ['clientName', 'serviceName', 'proposalRef', 'proposalNote', 'issueDate', 'validUntil', 'cashDate', 'discountType', 'discountValue', 'installmentCount', 'installmentFirstDate', 'downpaymentDate', 'downpaymentCount', 'downpaymentFirstDate'].forEach(id => {
      const input = $('#' + id);
      input.addEventListener('input', () => { invalidateActiveScenario(); renderAll(); });
      input.addEventListener('change', () => { invalidateActiveScenario(); renderAll(); });
    });
    $('#downpaymentDate').addEventListener('change', () => {
      const start = isoDate($('#downpaymentDate').value);
      if (start) $('#downpaymentFirstDate').value = dateToISO(addDays(start, 30));
      renderAll();
    });
    ['scenarioDiscount', 'scenarioA', 'scenarioB', 'scenarioEntryPercent', 'scenarioEntryCount'].forEach(id => $('#' + id).addEventListener('input', renderAll));
    $('#scenarioGrid').addEventListener('click', event => {
      const button = event.target.closest('[data-scenario]');
      if (button) applyScenario(button.dataset.scenario);
    });
    $('#discountType').addEventListener('change', () => { renderAll(); });
    $('#printButton').addEventListener('click', openPrintPreview);
    $('#copyWhatsApp').addEventListener('click', copyWhatsApp);
    $('#newSimulation').addEventListener('click', resetSimulation);
    $('#togglePresentation').addEventListener('click', togglePresentation);
    $('#includeTaxCosts').addEventListener('change', event => { $('#includeTaxCostsSecond').checked = event.target.checked; renderAll(); });
    $('#includeTaxCostsSecond').addEventListener('change', event => { $('#includeTaxCosts').checked = event.target.checked; renderAll(); });
    $('[data-add-quick="itbi"]').addEventListener('click', () => addQuickTax('itbi'));
    $('[data-add-quick="permit"]').addEventListener('click', () => addQuickTax('permit'));
    $('[data-add-quick="iptu"]').addEventListener('click', () => addQuickTax('iptu'));
    $('#permitType').addEventListener('change', updateQuickTaxResults);
    $('#iptuRate').addEventListener('change', updateQuickTaxResults);
    $('#taxBuffer').addEventListener('input', renderSelectedTaxes);
    $('#taxSearch').addEventListener('input', renderCatalog);
    $('#taxCatalog').addEventListener('click', event => {
      const button = event.target.closest('[data-add-catalog]');
      if (button) addCatalogTax(Number(button.dataset.addCatalog));
    });
    $('#selectedTaxList').addEventListener('click', event => {
      const button = event.target.closest('[data-remove-tax]');
      if (button) { state.selectedTaxes.splice(Number(button.dataset.removeTax), 1); renderSelectedTaxes(); }
    });
    $('#clearTaxes').addEventListener('click', () => {
      state.selectedTaxes = [];
      renderSelectedTaxes();
      showToast('Lista de despesas esvaziada.');
    });
    $('#returnToPayment').addEventListener('click', () => switchTab('payments'));
    $('#openSettings').addEventListener('click', () => { syncSettingsForm(); $('#settingsDialog').showModal(); });
    $('#saveSettings').addEventListener('click', () => { settingsFromForm(); $('#settingsDialog').close(); showToast('Configurações salvas neste navegador.'); });
    $('#resetSettings').addEventListener('click', () => { state.settings = { ...DEFAULT_SETTINGS }; syncSettingsForm(); saveSettings(); showToast('Dados padrão restaurados.'); });
    $('#exportSettings').addEventListener('click', exportSettings);
    $('#importSettings').addEventListener('click', () => $('#settingsFile').click());
    $('#settingsFile').addEventListener('change', event => importSettings(event.target.files?.[0]));
    $('#taxSearch').addEventListener('keydown', event => { if (event.key === 'Escape') event.currentTarget.value = ''; renderCatalog(); });
    document.addEventListener('keydown', event => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k' && !$('#panel-taxes').hidden) {
        event.preventDefault(); $('#taxSearch').focus();
      }
    });
  }

  function boot() {
    initDates();
    $('#proposalRef').value = generateProposalReference();
    syncSettingsForm();
    renderTaxRates();
    renderUnpriced();
    renderCatalog();
    updateQuickTaxResults();
    bindEvents();
    setCondition('cash');
    renderSelectedTaxes();
  }

  boot();
})();
