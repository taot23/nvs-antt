// Arquivo de Web Worker para processamento de dados da tabela
// Este worker executa operações pesadas fora da thread principal

// Função para processar e otimizar dados
function processTableData(data, options) {
  const { sortField, sortDirection, searchTerm, statusFilter } = options;
  
  console.log('Worker: Iniciando processamento de dados para tabela');
  const startTime = performance.now();
  
  // Primeiro filtrar os dados
  let filteredData = data;
  
  // Aplicar filtro de status se existir
  if (statusFilter) {
    console.log(`Worker: Aplicando filtro de status: ${statusFilter}`);
    filteredData = filteredData.filter(item => item.status === statusFilter);
  }
  
  // Aplicar filtro de busca se existir
  if (searchTerm) {
    console.log(`Worker: Aplicando termo de busca: ${searchTerm}`);
    const searchLower = searchTerm.toLowerCase();
    filteredData = filteredData.filter(item => 
      (item.orderNumber && item.orderNumber.toLowerCase().includes(searchLower)) ||
      (item.customerName && item.customerName.toLowerCase().includes(searchLower)) ||
      (item.sellerName && item.sellerName.toLowerCase().includes(searchLower))
    );
  }
  
  // Ordenar os dados
  console.log(`Worker: Ordenando por ${sortField} em ordem ${sortDirection}`);
  
  // Ordenação com cache de valores para melhorar performance
  const valueCache = new Map();
  
  const getValue = (item, field) => {
    const cacheKey = `${item.id}-${field}`;
    if (valueCache.has(cacheKey)) {
      return valueCache.get(cacheKey);
    }
    
    let value;
    
    // Tratamento especial para campos específicos
    if (field === 'totalAmount') {
      value = parseFloat(item[field] || '0');
    } else if (field === 'date') {
      value = item[field] ? new Date(item[field]).getTime() : new Date(item.createdAt).getTime();
    } else {
      value = item[field];
    }
    
    valueCache.set(cacheKey, value);
    return value;
  };
  
  filteredData.sort((a, b) => {
    const aValue = getValue(a, sortField);
    const bValue = getValue(b, sortField);
    
    // Se os valores são iguais, ordenar pelo ID
    if (aValue === bValue) {
      return sortDirection === 'asc' ? a.id - b.id : b.id - a.id;
    }
    
    // Ordenação específica para diferentes tipos de dados
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    
    // Fallback para outros tipos de dados
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
  
  // Pré-calcular propriedades para cada linha para evitar recálculos no frontend
  const optimizedData = filteredData.map(item => {
    // Formatações e cálculos comuns
    const formattedAmount = `R$ ${parseFloat(item.totalAmount || 0).toFixed(2).replace('.', ',')}`;
    
    // Pré-calcular classes CSS baseadas no status
    const statusClasses = {
      row: getStatusClassName(item.status, 'row'),
      cell: getStatusClassName(item.status, 'cell'),
      firstCell: getStatusClassName(item.status, 'firstCell')
    };
    
    return {
      ...item,
      formattedAmount,
      statusClasses,
      optimized: true
    };
  });
  
  const endTime = performance.now();
  console.log(`Worker: Processamento concluído em ${(endTime - startTime).toFixed(2)}ms. Geradas ${optimizedData.length} linhas otimizadas.`);
  
  return {
    data: optimizedData,
    count: optimizedData.length,
    processingTime: endTime - startTime
  };
}

// Função auxiliar para gerar classes CSS com base no status
function getStatusClassName(status, type) {
  const baseClasses = {
    completed: {
      row: "bg-green-100 border-green-300 border",
      cell: "bg-green-100",
      firstCell: "bg-green-100 border-l-4 border-l-green-500 font-medium"
    },
    in_progress: {
      row: "bg-orange-100 border-orange-300 border",
      cell: "bg-orange-100",
      firstCell: "bg-orange-100 border-l-4 border-l-orange-500 font-medium"
    },
    returned: {
      row: "bg-red-100 border-red-300 border",
      cell: "bg-red-100",
      firstCell: "bg-red-100 border-l-4 border-l-red-500 font-medium"
    },
    corrected: {
      row: "bg-yellow-100 border-yellow-300 border",
      cell: "bg-yellow-100",
      firstCell: "bg-yellow-100 border-l-4 border-l-yellow-500 font-medium"
    },
    pending: {
      row: "",
      cell: "",
      firstCell: "font-medium"
    }
  };
  
  return baseClasses[status]?.[type] || baseClasses.pending[type] || "";
}

// Registrar listeners de eventos do worker
self.addEventListener('message', (event) => {
  const { action, data, options } = event.data;
  
  switch (action) {
    case 'process':
      const result = processTableData(data, options);
      self.postMessage({ action: 'processed', result });
      break;
      
    default:
      console.error(`Worker: Ação desconhecida: ${action}`);
      self.postMessage({ action: 'error', error: `Ação desconhecida: ${action}` });
  }
});

// Enviar mensagem de inicialização
self.postMessage({ action: 'initialized' });