-- ConstruLoc Database Schema
-- Sistema de Locação de Equipamentos de Construção

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE equipment_status AS ENUM ('disponivel', 'locado', 'manutencao', 'inativo');
CREATE TYPE contract_status AS ENUM ('ativo', 'finalizado', 'cancelado', 'pendente');
CREATE TYPE payment_status AS ENUM ('pendente', 'pago', 'atrasado', 'cancelado');
CREATE TYPE user_role AS ENUM ('admin', 'operador', 'cliente');

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telefone VARCHAR(20),
  role user_role DEFAULT 'cliente',
  empresa VARCHAR(255),
  documento VARCHAR(20),
  endereco TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Equipment categories table
CREATE TABLE IF NOT EXISTS public.categorias_equipamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Equipment table
CREATE TABLE IF NOT EXISTS public.equipamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  categoria_id UUID REFERENCES categorias_equipamentos(id),
  modelo VARCHAR(255),
  marca VARCHAR(255),
  ano_fabricacao INTEGER,
  numero_serie VARCHAR(255) UNIQUE,
  valor_diario DECIMAL(10,2) NOT NULL,
  valor_semanal DECIMAL(10,2),
  valor_mensal DECIMAL(10,2),
  status equipment_status DEFAULT 'disponivel',
  localizacao VARCHAR(255),
  observacoes TEXT,
  imagem_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clients table
CREATE TABLE IF NOT EXISTS public.clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telefone VARCHAR(20),
  documento VARCHAR(20) UNIQUE NOT NULL,
  tipo_documento VARCHAR(10) DEFAULT 'CPF', -- CPF ou CNPJ
  empresa VARCHAR(255),
  endereco TEXT,
  cep VARCHAR(10),
  cidade VARCHAR(255),
  estado VARCHAR(2),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contracts table
CREATE TABLE IF NOT EXISTS public.contratos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero_contrato VARCHAR(50) UNIQUE NOT NULL,
  cliente_id UUID REFERENCES clientes(id) NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL,
  status contract_status DEFAULT 'pendente',
  observacoes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contract items table (equipments in each contract)
CREATE TABLE IF NOT EXISTS public.itens_contrato (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contrato_id UUID REFERENCES contratos(id) ON DELETE CASCADE,
  equipamento_id UUID REFERENCES equipamentos(id),
  quantidade INTEGER DEFAULT 1,
  valor_unitario DECIMAL(10,2) NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL,
  data_retirada TIMESTAMP WITH TIME ZONE,
  data_devolucao TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS public.pagamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contrato_id UUID REFERENCES contratos(id) NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status payment_status DEFAULT 'pendente',
  forma_pagamento VARCHAR(50),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Maintenance table
CREATE TABLE IF NOT EXISTS public.manutencoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipamento_id UUID REFERENCES equipamentos(id) NOT NULL,
  tipo VARCHAR(100) NOT NULL, -- preventiva, corretiva, revisao
  descricao TEXT NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE,
  custo DECIMAL(10,2),
  responsavel VARCHAR(255),
  status VARCHAR(50) DEFAULT 'em_andamento',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Equipment availability calendar
CREATE TABLE IF NOT EXISTS public.disponibilidade_equipamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipamento_id UUID REFERENCES equipamentos(id) NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  disponivel BOOLEAN DEFAULT true,
  motivo VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System settings table
CREATE TABLE IF NOT EXISTS public.configuracoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chave VARCHAR(255) UNIQUE NOT NULL,
  valor TEXT,
  descricao TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias_equipamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_contrato ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manutencoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disponibilidade_equipamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for admin/operator access to all data
CREATE POLICY "Admin and operators can view all equipment categories" ON public.categorias_equipamentos FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'operador'))
);

CREATE POLICY "Admin and operators can manage equipment categories" ON public.categorias_equipamentos FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'operador'))
);

CREATE POLICY "Admin and operators can view all equipment" ON public.equipamentos FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'operador'))
);

CREATE POLICY "Admin and operators can manage equipment" ON public.equipamentos FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'operador'))
);

CREATE POLICY "Admin and operators can view all clients" ON public.clientes FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'operador'))
);

CREATE POLICY "Admin and operators can manage clients" ON public.clientes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'operador'))
);

CREATE POLICY "Admin and operators can view all contracts" ON public.contratos FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'operador'))
);

CREATE POLICY "Admin and operators can manage contracts" ON public.contratos FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'operador'))
);

-- Similar policies for other tables
CREATE POLICY "Admin and operators can view all contract items" ON public.itens_contrato FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'operador'))
);

CREATE POLICY "Admin and operators can manage contract items" ON public.itens_contrato FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'operador'))
);

CREATE POLICY "Admin and operators can view all payments" ON public.pagamentos FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'operador'))
);

CREATE POLICY "Admin and operators can manage payments" ON public.pagamentos FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'operador'))
);

CREATE POLICY "Admin and operators can view all maintenance" ON public.manutencoes FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'operador'))
);

CREATE POLICY "Admin and operators can manage maintenance" ON public.manutencoes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'operador'))
);

CREATE POLICY "Admin and operators can view equipment availability" ON public.disponibilidade_equipamentos FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'operador'))
);

CREATE POLICY "Admin and operators can manage equipment availability" ON public.disponibilidade_equipamentos FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'operador'))
);

CREATE POLICY "Admin can view all settings" ON public.configuracoes FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin can manage settings" ON public.configuracoes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Create indexes for better performance
CREATE INDEX idx_equipamentos_status ON public.equipamentos(status);
CREATE INDEX idx_equipamentos_categoria ON public.equipamentos(categoria_id);
CREATE INDEX idx_contratos_cliente ON public.contratos(cliente_id);
CREATE INDEX idx_contratos_status ON public.contratos(status);
CREATE INDEX idx_contratos_data_inicio ON public.contratos(data_inicio);
CREATE INDEX idx_pagamentos_contrato ON public.pagamentos(contrato_id);
CREATE INDEX idx_pagamentos_status ON public.pagamentos(status);
CREATE INDEX idx_itens_contrato_equipamento ON public.itens_contrato(equipamento_id);
CREATE INDEX idx_manutencoes_equipamento ON public.manutencoes(equipamento_id);
