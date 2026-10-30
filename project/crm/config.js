/* ════════════════════════════════════════════════════════════════
   CRM: CONFIGURAÇÃO
   --------------------------------------------------------------
   Enquanto os dois campos abaixo estiverem VAZIOS, o CRM abre em
   MODO DEMONSTRAÇÃO: dados fictícios, em memória, nada é salvo.

   Para ligar ao banco de verdade (depois de criar o projeto Supabase
   separado e aplicar os arquivos de docs/crm/sql):

     supabaseUrl      https://<seu-projeto>.supabase.co
     supabaseAnonKey  a chave PÚBLICA ("anon public") do projeto

   A chave anon é pública por desenho: quem a vê não consegue ler nada
   sem login e sem 2FA (as regras de RLS cuidam disso). NUNCA cole aqui
   a chave "service_role": essa é secreta e este arquivo é público.
   ════════════════════════════════════════════════════════════════ */
window.CRM_CONFIG = {
  supabaseUrl: 'https://ogoinwjduestsqhcozob.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nb2lud2pkdWVzdHNxaGNvem9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzNTE2MDMsImV4cCI6MjEwODkyNzYwM30.e8pHW8YX_hgYfhHtLm1bfSkWqImJqsTUVrtZLwCvTXg',
};
