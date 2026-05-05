# Política de Privacidade / Privacy Policy

**Expense Tracker**
Última atualização / Last updated: Maio de 2026 / May 2026
Contato / Contact: privacyexpensetracker@gmail.com

---

> 🇧🇷 [Português](#português---política-de-privacidade) | 🇺🇸 [English](#english---privacy-policy)

---

## Português — Política de Privacidade

### 1. Identificação do Controlador

Esta Política de Privacidade descreve como o Expense Tracker ("Serviço") coleta, utiliza, armazena e protege os dados pessoais dos Usuários, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).

| Campo | Informação |
|---|---|
| Responsável pelo Serviço (Controlador) | Expense Tracker |
| Natureza | Projeto de código aberto de pessoa física |
| Canal de privacidade | privacyexpensetracker@gmail.com |
| URL do Serviço | https://controle-de-gastos-tan-six.vercel.app |

### 2. Dados Pessoais Coletados

#### 2.1 Dados fornecidos diretamente pelo Usuário

- E-mail (obrigatório para autenticação por e-mail e senha);
- Senha (armazenada de forma criptografada pelo Supabase; nunca acessível em texto puro);
- Dados financeiros inseridos voluntariamente: valores, datas, descrições de transações, categorias e contas.

#### 2.2 Dados coletados via autenticação de terceiros

Ao utilizar login com Google ou GitHub, recebemos os seguintes dados fornecidos por essas plataformas:

- Nome de exibição;
- Endereço de e-mail;
- Identificador único (ID) da conta na plataforma de origem;
- URL do avatar/foto de perfil (quando disponível).

Não solicitamos acesso a outras informações de sua conta Google ou GitHub além das listadas acima.

#### 2.3 Dados coletados automaticamente

- Logs de acesso e autenticação (gerenciados pelo Supabase);
- Dados técnicos de sessão necessários para o funcionamento do Serviço.

Não utilizamos cookies de rastreamento, ferramentas de analytics comportamental ou pixels de rastreamento de terceiros.

### 3. Finalidade do Tratamento

Seus dados são coletados e tratados exclusivamente para as seguintes finalidades:

- Autenticação e controle de acesso à sua conta;
- Armazenamento e exibição dos seus dados financeiros pessoais;
- Possibilitar a exportação dos seus dados em formato CSV;
- Garantir a segurança e integridade do Serviço;
- Cumprir obrigações legais aplicáveis.

Não utilizamos seus dados para publicidade, marketing, criação de perfis comportamentais ou compartilhamento com terceiros para fins comerciais.

### 4. Base Legal do Tratamento (Art. 7º da LGPD)

O tratamento dos seus dados pessoais é fundamentado nas seguintes bases legais:

- **Consentimento (Art. 7º, I):** para dados coletados via autenticação por e-mail e senha;
- **Execução de contrato (Art. 7º, V):** para dados necessários ao funcionamento do Serviço que você contratou ao se cadastrar;
- **Legítimo interesse (Art. 7º, IX):** para logs de segurança e prevenção de fraudes, observados os limites do Art. 10 da LGPD.

### 5. Compartilhamento de Dados

#### 5.1 Prestadores de serviço (suboperadores)

Para o funcionamento do Serviço, seus dados são processados pelos seguintes terceiros:

| Empresa | País | Finalidade | Política de Privacidade |
|---|---|---|---|
| Supabase Inc. | Estados Unidos | Banco de dados, autenticação e armazenamento | https://supabase.com/privacy |
| Vercel Inc. | Estados Unidos | Hospedagem e entrega da aplicação web | https://vercel.com/legal/privacy-policy |
| Google LLC | Estados Unidos | Autenticação via Google OAuth (quando utilizado) | https://policies.google.com/privacy |
| GitHub Inc. | Estados Unidos | Autenticação via GitHub OAuth (quando utilizado) | https://docs.github.com/site-policy/privacy-policies/github-privacy-statement |

#### 5.2 Transferência internacional de dados

Os prestadores de serviço listados acima estão sediados nos Estados Unidos. A transferência internacional de dados ocorre com base nas garantias adequadas previstas no Art. 33 da LGPD, incluindo cláusulas contratuais padrão e certificações de conformidade mantidas pelos respectivos prestadores.

#### 5.3 Compartilhamento com autoridades

Seus dados poderão ser compartilhados com autoridades públicas quando exigido por lei, ordem judicial ou requisição de autoridade competente.

### 6. Retenção de Dados

Seus dados pessoais e financeiros são mantidos enquanto sua conta estiver ativa. Após a exclusão da conta:

| Tipo de dado | Prazo de exclusão |
|---|---|
| Dados de autenticação | Até 30 dias |
| Dados financeiros inseridos | Até 30 dias |
| Logs de segurança | Até 6 meses (Marco Civil da Internet, Art. 15) |

### 7. Segurança dos Dados

Adotamos as seguintes medidas técnicas e organizacionais para proteger seus dados:

- **Row Level Security (RLS) do Supabase:** cada Usuário acessa exclusivamente seus próprios dados, com isolamento garantido em nível de banco de dados;
- **HTTPS/TLS:** transmissão criptografada em todas as comunicações entre o navegador e os servidores;
- **Hashing seguro de senhas:** gerenciado pelo Supabase Auth;
- **OAuth 2.0:** para logins com Google e GitHub;
- **Código aberto:** auditável publicamente no GitHub.

Em caso de incidente de segurança que afete seus dados, você será notificado conforme exigido pela LGPD.

### 8. Direitos dos Titulares (Arts. 17 a 22 da LGPD)

Você tem os seguintes direitos em relação aos seus dados pessoais, exercíveis a qualquer momento pelo e-mail **privacyexpensetracker@gmail.com**:

- **Confirmação:** saber se tratamos seus dados;
- **Acesso:** obter cópia dos seus dados pessoais tratados;
- **Correção:** solicitar correção de dados incompletos, inexatos ou desatualizados;
- **Anonimização, bloqueio ou eliminação:** solicitar a anonimização ou exclusão de dados desnecessários ou excessivos;
- **Portabilidade:** receber seus dados em formato estruturado (disponível via exportação CSV no próprio Serviço);
- **Eliminação:** solicitar a exclusão completa da sua conta e todos os dados associados;
- **Revogação do consentimento:** retirar seu consentimento a qualquer momento, sem prejuízo do tratamento realizado anteriormente;
- **Informação sobre compartilhamento:** saber com quais entidades seus dados foram compartilhados;
- **Oposição:** opor-se ao tratamento realizado com base em legítimo interesse.

Responderemos às suas solicitações em até 15 (quinze) dias úteis.

### 9. Cookies

O Serviço utiliza exclusivamente cookies estritamente necessários ao funcionamento técnico da aplicação:

- Tokens de sessão de autenticação (necessários para manter o Usuário logado);
- Preferências básicas de interface armazenadas localmente no navegador.

Não utilizamos cookies de publicidade, rastreamento comportamental ou analytics de terceiros.

### 10. Menores de Idade

O Serviço não é direcionado a menores de 18 (dezoito) anos. Não coletamos intencionalmente dados pessoais de menores. Caso identifiquemos que um menor forneceu dados pessoais sem o consentimento dos pais ou responsáveis, excluiremos tais dados imediatamente.

### 11. Alterações nesta Política

Esta Política de Privacidade pode ser atualizada periodicamente. Alterações significativas serão comunicadas com antecedência mínima de 15 (quinze) dias por meio de aviso no próprio Serviço. O uso continuado do Serviço após a entrada em vigor das alterações implica aceitação da nova Política.

### 12. Canal de Privacidade

Para exercer seus direitos, esclarecer dúvidas ou registrar reclamações sobre o tratamento dos seus dados pessoais, entre em contato pelo canal oficial de privacidade:

**privacyexpensetracker@gmail.com**

Você também tem o direito de peticionar à Autoridade Nacional de Proteção de Dados (ANPD) em caso de descumprimento da LGPD: https://www.gov.br/anpd

---

## English — Privacy Policy

### 1. Controller Identification

This Privacy Policy describes how Expense Tracker (the "Service") collects, uses, stores, and protects Users' personal data, in compliance with Brazil's General Data Protection Law (Lei nº 13.709/2018 — LGPD).

| Field | Information |
|---|---|
| Service Responsible (Controller) | Expense Tracker |
| Nature | Open-source project by an individual developer |
| Privacy contact | privacyexpensetracker@gmail.com |
| Service URL | https://controle-de-gastos-tan-six.vercel.app |

### 2. Personal Data Collected

#### 2.1 Data provided directly by the User

- Email address (required for email and password authentication);
- Password (stored in encrypted form by Supabase; never accessible in plain text);
- Financial data voluntarily entered by the User: amounts, dates, transaction descriptions, categories, and accounts.

#### 2.2 Data collected via third-party authentication

When logging in with Google or GitHub, we receive the following data provided by those platforms:

- Display name;
- Email address;
- Unique identifier (ID) from the originating platform;
- Avatar/profile picture URL (when available).

We do not request access to any other information from your Google or GitHub account beyond what is listed above.

#### 2.3 Automatically collected data

- Access and authentication logs (managed by Supabase);
- Technical session data required for the Service to function.

We do not use tracking cookies, behavioral analytics tools, or third-party tracking pixels.

### 3. Purpose of Processing

Your data is collected and processed exclusively for the following purposes:

- Authentication and account access control;
- Storage and display of your personal financial data;
- Enabling export of your data in CSV format;
- Ensuring the security and integrity of the Service;
- Complying with applicable legal obligations.

We do not use your data for advertising, marketing, behavioral profiling, or sharing with third parties for commercial purposes.

### 4. Legal Basis for Processing (Art. 7 of the LGPD)

The processing of your personal data is based on the following legal grounds:

- **Consent (Art. 7, I):** for data collected via email and password authentication;
- **Contract performance (Art. 7, V):** for data necessary to provide the Service you signed up for;
- **Legitimate interest (Art. 7, IX):** for security logs and fraud prevention, within the limits of Art. 10 of the LGPD.

### 5. Data Sharing

#### 5.1 Service providers (sub-processors)

To operate the Service, your data is processed by the following third parties:

| Company | Country | Purpose | Privacy Policy |
|---|---|---|---|
| Supabase Inc. | United States | Database, authentication, and storage | https://supabase.com/privacy |
| Vercel Inc. | United States | Application hosting and delivery | https://vercel.com/legal/privacy-policy |
| Google LLC | United States | Google OAuth authentication (when used) | https://policies.google.com/privacy |
| GitHub Inc. | United States | GitHub OAuth authentication (when used) | https://docs.github.com/site-policy/privacy-policies/github-privacy-statement |

#### 5.2 International data transfers

The service providers listed above are based in the United States. International data transfers occur based on the adequate safeguards set forth in Art. 33 of the LGPD, including standard contractual clauses and compliance certifications maintained by each provider.

#### 5.3 Sharing with authorities

Your data may be shared with public authorities when required by law, court order, or request from a competent authority.

### 6. Data Retention

Your personal and financial data is retained for as long as your account is active. Upon account deletion:

| Data type | Retention period |
|---|---|
| Authentication data | Up to 30 days |
| User-entered financial data | Up to 30 days |
| Security logs | Up to 6 months (Brazil's Internet Civil Framework, Art. 15) |

### 7. Data Security

We implement the following technical and organizational measures to protect your data:

- **Supabase Row Level Security (RLS):** each User can only access their own data, enforced at the database level;
- **HTTPS/TLS encryption:** all communications between your browser and our servers are encrypted;
- **Secure password hashing:** managed by Supabase Auth;
- **OAuth 2.0:** used for Google and GitHub logins;
- **Open source:** our codebase is publicly auditable on GitHub.

In the event of a security incident affecting your data, you will be notified as required by the LGPD.

### 8. Data Subject Rights (Arts. 17–22 of the LGPD)

You have the following rights regarding your personal data, exercisable at any time by contacting **privacyexpensetracker@gmail.com**:

- **Confirmation:** to know whether we process your data;
- **Access:** to obtain a copy of your personal data being processed;
- **Correction:** to request correction of incomplete, inaccurate, or outdated data;
- **Anonymization, blocking, or deletion:** to request anonymization or deletion of unnecessary or excessive data;
- **Portability:** to receive your data in a structured format (available via CSV export within the Service);
- **Deletion:** to request complete deletion of your account and all associated data;
- **Withdrawal of consent:** to withdraw consent at any time, without affecting processing carried out prior to withdrawal;
- **Information about sharing:** to know which entities your data has been shared with;
- **Opposition:** to object to processing carried out on the basis of legitimate interest.

We will respond to your requests within 15 (fifteen) business days.

### 9. Cookies

The Service uses only strictly necessary cookies for technical operation:

- Authentication session tokens (required to keep the User logged in);
- Basic interface preferences stored locally in the browser.

We do not use advertising cookies, behavioral tracking, or third-party analytics.

### 10. Minors

The Service is not directed at individuals under 18 (eighteen) years of age. We do not intentionally collect personal data from minors. If we identify that a minor has provided personal data without parental or guardian consent, we will delete such data immediately.

### 11. Changes to this Policy

This Privacy Policy may be updated periodically. Significant changes will be communicated at least 15 (fifteen) days in advance via a notice within the Service. Continued use of the Service after the updated Policy takes effect constitutes acceptance of the new terms.

### 12. Privacy Contact

To exercise your rights, clarify questions, or file complaints regarding the processing of your personal data, please contact our official privacy channel:

**privacyexpensetracker@gmail.com**

You also have the right to file a complaint with Brazil's National Data Protection Authority (ANPD) in case of non-compliance with the LGPD: https://www.gov.br/anpd

---

*Expense Tracker — Privacy Policy — May 2026*
