  app.post("/api/sales/:id/start-execution", canManageSaleOperations, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      const sale = await storage.getSale(id);
      if (!sale) {
        return res.status(404).json({ error: "Venda não encontrada" });
      }
      
      // Verificar se a venda está no status correto para iniciar execução
      if (sale.status !== "pending" && sale.status !== "corrected") {
        return res.status(400).json({ 
          error: "Não é possível iniciar execução", 
          message: "Só é possível iniciar a execução de vendas com status pendente ou corrigidas."
        });
      }
      
      // Extrair e validar tipo de serviço (obrigatório)
      const { serviceTypeId, serviceProviderId } = req.body;
      
      if (!serviceTypeId) {
        return res.status(400).json({ 
          error: "Tipo de execução obrigatório", 
          message: "É necessário selecionar um tipo de execução para iniciar"
        });
      }
      
      const serviceTypeIdNum = parseInt(serviceTypeId);
      if (isNaN(serviceTypeIdNum)) {
        return res.status(400).json({ error: "ID do tipo de serviço inválido" });
      }
      
      // Verificar se o tipo de serviço existe
      const serviceType = await storage.getServiceType(serviceTypeIdNum);
      if (!serviceType) {
        return res.status(400).json({ error: "Tipo de serviço não encontrado" });
      }
      
      // Processar dados de prestador parceiro
      let finalServiceProviderId = null;
      
      if (serviceType.name === "SINDICATO") {
        // Prestador é obrigatório para SINDICATO
        if (!serviceProviderId) {
          return res.status(400).json({ 
            error: "ID do prestador de serviço parceiro é obrigatório para tipo SINDICATO", 
            message: "Para execução via SINDICATO, é necessário informar o prestador parceiro"
          });
        }
        
        const serviceProviderIdNum = parseInt(serviceProviderId);
        if (isNaN(serviceProviderIdNum)) {
          return res.status(400).json({ error: "ID do prestador de serviço inválido" });
        }
        
        // Verificar se o prestador existe e está ativo
        const serviceProvider = await storage.getServiceProvider(serviceProviderIdNum);
        if (!serviceProvider) {
          return res.status(400).json({ error: "Prestador de serviço não encontrado" });
        }
        
        if (!serviceProvider.active) {
          return res.status(400).json({ 
            error: "Prestador inativo", 
            message: "O prestador de serviço selecionado está inativo"
          });
        }
        
        finalServiceProviderId = serviceProviderIdNum;
      } else if (serviceProviderId) {
        // Se não for SINDICATO mas um prestador foi fornecido, vamos validar
        const serviceProviderIdNum = parseInt(serviceProviderId);
        if (!isNaN(serviceProviderIdNum)) {
          const serviceProvider = await storage.getServiceProvider(serviceProviderIdNum);
          if (serviceProvider && serviceProvider.active) {
            finalServiceProviderId = serviceProviderIdNum;
          }
        }
      }
      
      // Iniciar a execução da venda com os dados processados
      const updatedSale = await storage.markSaleInProgress(
        id, 
        req.user.id, 
        serviceTypeIdNum, 
        finalServiceProviderId
      );
      
      if (!updatedSale) {
        return res.status(500).json({ error: "Erro ao iniciar execução da venda" });
      }
      
      // Notificar clientes via WebSocket
      notifySalesUpdate();
      
      res.json(updatedSale);
    } catch (error) {
      console.error("Erro ao iniciar execução da venda:", error);
      res.status(500).json({ error: "Erro ao iniciar execução da venda" });
    }
  });