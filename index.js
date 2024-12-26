const express = require('express');
const sql = require('mssql');
const cors = require('cors'); // Importa o pacote CORS
const app = express();
const port = 3000;

// Configuração do CORS para permitir requisições apenas de http://localhost:4200
app.use(cors({
  origin: 'http://localhost:4200', // Substitua pela URL do seu front-end
}));

const config = {
  server: 'DESKTOP-59DPHE9',  // Nome do servidor (ou localhost)
  database: 'projeto-zero',  // Nome do banco de dados
  options: {
    encrypt: true,            // Para conexões seguras
    trustServerCertificate: true, // Para certificados SSL autossinados
  },
  authentication: {
    type: 'default', // Usar autenticação SQL Server
    options: {
      userName: 'sa',         // Nome do usuário
      password: '321123', // Senha do usuário
    },
  },
};
app.use(express.json());

// Rota para pegar dados da tabela TB_FUNCIONARIO
app.get('/api/funcionarios', async (req, res) => {
  try {
    // Conectar ao banco de dados
    await sql.connect(config);

    // Query para pegar todos os dados da tabela TB_FUNCIONARIO
    const result = await sql.query('SELECT * FROM TB_FUNCIONARIO');

    // Enviar os dados como resposta
    res.json(result.recordset);
  } catch (err) {
    console.error('Erro ao acessar o banco de dados:', err);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
});


app.post('/api/novo-usuario', async (req, res) => {
  try {
    const { nome, email, senha } = req.body; // Desestruturando os dados da requisição

    // Verificar se os dados necessários foram enviados
    if (!nome || !email || !senha) {
      return res.status(400).json({ mensagem: 'Nome, email e senha são obrigatórios.' });
    }

    // Conectar ao banco de dados
    const pool = await sql.connect(config); // Armazene a conexão no pool

    // Query para inserir dados na tabela TB_NOVO_USUARIO com parâmetros
    const query = `
      INSERT INTO TB_NOVO_USUARIO (NOME, EMAIL, SENHA)
      VALUES (@nome, @email, @senha)
    `;

    // Realizando o insert com parâmetros para prevenir SQL Injection
    await pool.request()
      .input('nome', sql.VarChar, nome)
      .input('email', sql.VarChar, email)
      .input('senha', sql.VarChar, senha)
      .query(query);

    // Enviar resposta de sucesso
    res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!' });
  } catch (err) {
    console.error('Erro ao acessar o banco de dados:', err);
    res.status(500).json({ mensagem: 'Erro no servidor ao cadastrar usuário.' });
  }
});



// Iniciar o servidor
app.listen(port, () => {
  console.log(`API rodando na porta ${port}`);
});
