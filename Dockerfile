FROM node:20

WORKDIR /app

# Copiar arquivos de configuração de dependências
COPY package*.json ./
RUN npm install

# Copiar código-fonte
COPY . .

# Variáveis de ambiente para produção
ENV NODE_ENV=production
ENV PORT=8080

# Expor a porta que o app vai usar
EXPOSE 8080

# Comando para iniciar o app
CMD ["npm", "run", "start"]