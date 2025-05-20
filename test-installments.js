// Script para testar a nova rota de definição exata de datas
import fetch from 'node-fetch';

async function testInstallmentsExact() {
  console.log('Iniciando teste de datas exatas nas parcelas...');
  
  // Testar com a venda ID 333 (adapte conforme necessário)
  const saleId = 333;
  
  // Primeiro, fazer login como admin
  console.log('Fazendo login...');
  const credentials = {
    username: 'admin',
    password: 'admin'
  };
  
  let cookies = '';
  try {
    const loginResponse = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    
    // Capturar cookies da sessão
    const rawCookies = loginResponse.headers.get('set-cookie');
    if (rawCookies) {
      cookies = rawCookies;
      console.log('Login bem-sucedido, cookies capturados.');
    } else {
      console.log('Login bem-sucedido, mas nenhum cookie retornado.');
    }
  } catch (error) {
    console.error('Erro ao fazer login:', error);
  }
  
  // Primeiro, vamos verificar a estrutura da tabela de parcelas
  console.log('Verificando estrutura da tabela...');
  try {
    const debugResponse = await fetch('http://localhost:5000/api/debug/installments-dates', {
      headers: {
        Cookie: cookies
      }
    });
    const debugData = await debugResponse.json();
    
    console.log('Estrutura da tabela sale_installments:');
    console.table(debugData.tableSchema);
    
    console.log('\nParcelas existentes:');
    console.table(debugData.installments);
  } catch (error) {
    console.error('Erro ao buscar informações de debug:', error);
  }
  
  // Agora, vamos configurar parcelas com datas exatas
  console.log('\nDefinindo parcelas com datas específicas...');
  const testDates = [
    '2023-05-15', // Primeira parcela
    '2023-06-15', // Segunda parcela
    '2023-07-15'  // Terceira parcela
  ];
  
  const testValues = [
    '33.33', // Primeira parcela
    '33.33', // Segunda parcela
    '33.34'  // Terceira parcela
  ];
  
  try {
    const response = await fetch(`http://localhost:5000/api/sales/${saleId}/set-installments-exact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookies
      },
      body: JSON.stringify({
        dates: testDates,
        values: testValues
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('Parcelas definidas com sucesso:');
      console.table(data.installments);
    } else {
      console.error('Erro ao definir parcelas:', data.error);
    }
  } catch (error) {
    console.error('Erro na requisição:', error);
  }
  
  // Verificar se as parcelas foram salvas corretamente
  console.log('\nVerificando parcelas da venda...');
  try {
    const response = await fetch(`http://localhost:5000/api/sales/${saleId}/installments`, {
      headers: {
        Cookie: cookies
      }
    });
    const data = await response.json();
    
    console.log('Parcelas recuperadas:');
    console.table(data);
    
    // Verificar se as datas estão exatamente como definidas
    let datasOk = true;
    data.forEach((parcela, index) => {
      if (parcela.dueDate !== testDates[index]) {
        console.error(`❌ Erro: Parcela ${index + 1} - Data esperada: ${testDates[index]}, data recebida: ${parcela.dueDate}`);
        datasOk = false;
      }
    });
    
    if (datasOk) {
      console.log('✅ Sucesso! Todas as datas foram preservadas exatamente como definidas.');
    }
  } catch (error) {
    console.error('Erro ao buscar parcelas:', error);
  }
}

testInstallmentsExact().catch(console.error);