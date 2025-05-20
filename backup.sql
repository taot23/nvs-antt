--
-- PostgreSQL database dump
--

-- Dumped from database version 16.8
-- Dumped by pg_dump version 16.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity_logs (
    id integer NOT NULL,
    user_id integer NOT NULL,
    action character varying(100) NOT NULL,
    description text NOT NULL,
    details text,
    entity_id integer,
    entity_type character varying(100),
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: activity_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.activity_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: activity_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.activity_logs_id_seq OWNED BY public.activity_logs.id;


--
-- Name: cost_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cost_types (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: cost_types_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cost_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cost_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cost_types_id_seq OWNED BY public.cost_types.id;


--
-- Name: customers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customers (
    id integer NOT NULL,
    name text NOT NULL,
    document text NOT NULL,
    document_type text DEFAULT 'cpf'::text NOT NULL,
    contact_name text,
    phone text NOT NULL,
    phone2 text,
    email text NOT NULL,
    user_id integer NOT NULL
);


--
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- Name: debug_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.debug_logs (
    id integer NOT NULL,
    "timestamp" timestamp without time zone DEFAULT now(),
    module character varying(255),
    message text,
    data jsonb
);


--
-- Name: debug_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.debug_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: debug_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.debug_logs_id_seq OWNED BY public.debug_logs.id;


--
-- Name: payment_methods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_methods (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    active boolean DEFAULT true NOT NULL,
    created_at integer DEFAULT 1746194276 NOT NULL
);


--
-- Name: payment_methods_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payment_methods_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payment_methods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payment_methods_id_seq OWNED BY public.payment_methods.id;


--
-- Name: report_executions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.report_executions (
    id integer NOT NULL,
    report_id integer NOT NULL,
    user_id integer NOT NULL,
    parameters jsonb,
    execution_time double precision,
    status character varying(50) NOT NULL,
    results jsonb,
    error_message text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: report_executions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.report_executions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: report_executions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.report_executions_id_seq OWNED BY public.report_executions.id;


--
-- Name: reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reports (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    type character varying(50) NOT NULL,
    query text NOT NULL,
    parameters jsonb,
    permissions character varying(255) NOT NULL,
    created_by integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: reports_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reports_id_seq OWNED BY public.reports.id;


--
-- Name: sale_installments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sale_installments (
    id integer NOT NULL,
    sale_id integer NOT NULL,
    installment_number integer NOT NULL,
    amount numeric NOT NULL,
    due_date text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    payment_date text,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    admin_edit_history jsonb DEFAULT '[]'::jsonb,
    payment_method_id integer,
    payment_notes text
);


--
-- Name: sale_installments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sale_installments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sale_installments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sale_installments_id_seq OWNED BY public.sale_installments.id;


--
-- Name: sale_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sale_items (
    id integer NOT NULL,
    sale_id integer NOT NULL,
    service_id integer NOT NULL,
    service_type_id integer NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    price numeric NOT NULL,
    total_price numeric NOT NULL,
    notes text,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: sale_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sale_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sale_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sale_items_id_seq OWNED BY public.sale_items.id;


--
-- Name: sale_operational_costs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sale_operational_costs (
    id integer NOT NULL,
    sale_id integer NOT NULL,
    description text NOT NULL,
    cost_type_id integer,
    amount numeric NOT NULL,
    date date NOT NULL,
    responsible_id integer NOT NULL,
    service_provider_id integer,
    notes text,
    payment_receipt_url text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    payment_date date
);


--
-- Name: sale_operational_costs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sale_operational_costs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sale_operational_costs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sale_operational_costs_id_seq OWNED BY public.sale_operational_costs.id;


--
-- Name: sale_payment_receipts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sale_payment_receipts (
    id integer NOT NULL,
    installment_id integer NOT NULL,
    receipt_type text NOT NULL,
    receipt_url text,
    receipt_data json,
    confirmed_by integer NOT NULL,
    confirmation_date timestamp without time zone DEFAULT now() NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: sale_payment_receipts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sale_payment_receipts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sale_payment_receipts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sale_payment_receipts_id_seq OWNED BY public.sale_payment_receipts.id;


--
-- Name: sale_service_providers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sale_service_providers (
    id integer NOT NULL,
    sale_id integer NOT NULL,
    service_provider_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: sale_service_providers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sale_service_providers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sale_service_providers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sale_service_providers_id_seq OWNED BY public.sale_service_providers.id;


--
-- Name: sales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sales (
    id integer NOT NULL,
    order_number text NOT NULL,
    date timestamp without time zone DEFAULT now() NOT NULL,
    customer_id integer NOT NULL,
    payment_method_id integer NOT NULL,
    seller_id integer NOT NULL,
    service_type_id integer,
    service_provider_id integer,
    total_amount numeric DEFAULT '0'::numeric NOT NULL,
    installments integer DEFAULT 1 NOT NULL,
    installment_value numeric,
    status text DEFAULT 'pending'::text NOT NULL,
    execution_status text DEFAULT 'waiting'::text,
    financial_status text DEFAULT 'pending'::text,
    notes text,
    return_reason text,
    responsible_operational_id integer,
    responsible_financial_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: sales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sales_id_seq OWNED BY public.sales.id;


--
-- Name: sales_status_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sales_status_history (
    id integer NOT NULL,
    sale_id integer NOT NULL,
    from_status text NOT NULL,
    to_status text NOT NULL,
    user_id integer NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: sales_status_history_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sales_status_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sales_status_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sales_status_history_id_seq OWNED BY public.sales_status_history.id;


--
-- Name: service_providers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_providers (
    id integer NOT NULL,
    name text NOT NULL,
    document text NOT NULL,
    document_type text DEFAULT 'cpf'::text NOT NULL,
    contact_name text,
    phone text NOT NULL,
    phone2 text,
    email text NOT NULL,
    address text,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: service_providers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.service_providers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: service_providers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.service_providers_id_seq OWNED BY public.service_providers.id;


--
-- Name: service_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_types (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: service_types_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.service_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: service_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.service_types_id_seq OWNED BY public.service_types.id;


--
-- Name: services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.services (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    active boolean DEFAULT true NOT NULL,
    created_at integer DEFAULT 1746194276 NOT NULL
);


--
-- Name: services_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.services_id_seq OWNED BY public.services.id;


--
-- Name: session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    role text DEFAULT 'user'::text
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: activity_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs ALTER COLUMN id SET DEFAULT nextval('public.activity_logs_id_seq'::regclass);


--
-- Name: cost_types id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cost_types ALTER COLUMN id SET DEFAULT nextval('public.cost_types_id_seq'::regclass);


--
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- Name: debug_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.debug_logs ALTER COLUMN id SET DEFAULT nextval('public.debug_logs_id_seq'::regclass);


--
-- Name: payment_methods id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_methods ALTER COLUMN id SET DEFAULT nextval('public.payment_methods_id_seq'::regclass);


--
-- Name: report_executions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_executions ALTER COLUMN id SET DEFAULT nextval('public.report_executions_id_seq'::regclass);


--
-- Name: reports id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports ALTER COLUMN id SET DEFAULT nextval('public.reports_id_seq'::regclass);


--
-- Name: sale_installments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_installments ALTER COLUMN id SET DEFAULT nextval('public.sale_installments_id_seq'::regclass);


--
-- Name: sale_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_items ALTER COLUMN id SET DEFAULT nextval('public.sale_items_id_seq'::regclass);


--
-- Name: sale_operational_costs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_operational_costs ALTER COLUMN id SET DEFAULT nextval('public.sale_operational_costs_id_seq'::regclass);


--
-- Name: sale_payment_receipts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_payment_receipts ALTER COLUMN id SET DEFAULT nextval('public.sale_payment_receipts_id_seq'::regclass);


--
-- Name: sale_service_providers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_service_providers ALTER COLUMN id SET DEFAULT nextval('public.sale_service_providers_id_seq'::regclass);


--
-- Name: sales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales ALTER COLUMN id SET DEFAULT nextval('public.sales_id_seq'::regclass);


--
-- Name: sales_status_history id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_status_history ALTER COLUMN id SET DEFAULT nextval('public.sales_status_history_id_seq'::regclass);


--
-- Name: service_providers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_providers ALTER COLUMN id SET DEFAULT nextval('public.service_providers_id_seq'::regclass);


--
-- Name: service_types id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_types ALTER COLUMN id SET DEFAULT nextval('public.service_types_id_seq'::regclass);


--
-- Name: services id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services ALTER COLUMN id SET DEFAULT nextval('public.services_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.activity_logs (id, user_id, action, description, details, entity_id, entity_type, created_at) FROM stdin;
1	1	EDIT_PAYMENT	Edição de pagamento da parcela #1 da venda #48 - Nova data: 05/05/2025	{"previousDate":"06/05/2025","newDate":"05/05/2025","installmentId":50,"saleId":48}	\N	\N	2025-05-06 20:24:06.390251
2	1	EDIT_PAYMENT	Edição de pagamento da parcela #1 da venda #49 - Nova data: 02/05/2025	{"previousDate":"02/05/2025","newDate":"02/05/2025","installmentId":51,"saleId":49}	\N	\N	2025-05-06 20:33:23.016125
3	1	EDIT_PAYMENT	Edição de pagamento da parcela #1 da venda #68 - Nova data: 02/05/2025	{"previousDate":"02/05/2025","newDate":"02/05/2025","installmentId":70,"saleId":68}	\N	\N	2025-05-06 20:33:49.442584
\.


--
-- Data for Name: cost_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cost_types (id, name, description, active, created_at, updated_at) FROM stdin;
1	TAXA SINDICAL		t	2025-05-02 14:07:17.90196	2025-05-02 14:07:17.90196
2	EMONUMENTO		t	2025-05-05 13:19:29.162661	2025-05-05 13:19:29.162661
3	TAXA AET		t	2025-05-05 13:19:37.148633	2025-05-05 13:19:37.148633
4	EMISSÃO CERTIFICADO DIGITAL		t	2025-05-05 13:19:58.21006	2025-05-05 13:19:58.21006
5	CUSTO PARCEIRO CHAVE		t	2025-05-05 13:20:06.503718	2025-05-05 13:20:06.503718
6	CURSO TAC		t	2025-05-05 13:20:18.872802	2025-05-05 13:20:18.872802
7	ICETRAN		t	2025-05-05 13:20:25.167469	2025-05-05 13:20:25.167469
8	CUSTO CARTÃO CREDITO		t	2025-05-05 13:20:59.462757	2025-05-05 13:20:59.462757
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customers (id, name, document, document_type, contact_name, phone, phone2, email, user_id) FROM stdin;
1	dasjhdjshdksj	191.000.000-00	cpf	\N	(11) 11111-1111	(11) 11111-1111	teste@teste.com	1
2	JOAO TESTE	81.718.751/0001-40	cnpj	DHSAJDHAS	(11) 11111-1111	(11) 11111-1111	TESTE@TESTE.COM	2
3	jessica	401.811.948-80	cpf	\N	(47) 99999-9999	\N	timmm@gmail.com	15
4	MARIA 	048.326.414-84	cpf	\N	(11) 92654-8264	\N	mariam@gmail.com	13
5	V.MAFISSONI LTDA	51.924.932/0001-61	cnpj	HUMBERTO MAFISSONI	(65) 99956-3811	\N	V.MAFISSONI@GMAIL.COM	16
6	mARCOS 	028.458.239-59	cpf	\N	(44) 99567-8968	\N	marcos@nvslicenca.com.br	1
7	 R. &. F. COMERCIO E SERVICOS S.A. - EM RECUPERACAO JUDICIAL	07.694.626/0001-94	cnpj	EDINIR	(81) 71120-0504	\N	BMATHIELY@GMAIL.COM	11
8	gustavo caetano almeida 	075.271.961-06	cpf	\N	(43) 99902-4264	\N	ggu7491@gmail.com	9
9	fsdhjhkjgjfgf	449.671.250-42	cpf	\N	(11) 11111-1111	\N		1
10	VAGNO SEIXAS DE OLIVEIRA	016.053.635-96	cpf	\N	(74) 99928-1900	\N	VAGNOSEIXAS@GMAIL.COM	16
11	60.591.516 CAMONGE DELFINO DOS SANTOS	60.591.516/0001-80	cnpj	CAMONGE DELFINO DOS SANTOS	(64) 99675-6434	\N	camonge@gmail.com	13
12	VOE BRASILIA TRANSPORTE E TURISMO LTDA	16.881.192/0001-22	cnpj	\N	(61) 81561-2110	\N		15
13	JOSE DOS SANTOS	469.701.265-87	cpf	\N	(77) 99976-2026	\N	josedossantos@gmail.com	13
14	AUTO SOCORRO MARACANA LTDA	32.026.661/0001-82	cnpj	\N	(38) 98556-1930	\N		15
15	ARY SOUZA BORGES	096.659.199-20	cpf	\N	(47) 99998-2241	\N	arysouza@gmail.com	13
16	ELISIO MILTON KRUG	656.209.410-00	cpf	\N	(51) 99978-7004	\N	elisio@gmail.com	13
17	MARCELO RIBEIRO GOZZO 	33.886.310/0001-04	cnpj	\N	(14) 99690-0308	\N		15
18	PAULINO FRANCISCO DE SOUZA OLICHESKI	496.262.990-53	cpf	\N	(51) 99750-7921	\N		10
19	DANIEL DALBOSCO	463.889.820-34	cpf	\N	(51) 99993-7255	\N		13
20	 MARTINS COMERCIO DE VERDURAS LTDA	30.865.516/0001-60	cnpj	\N	(48) 99004-0040	\N		15
21	PAULO ROBERTO DA SILVA	517.973.996-91	cpf	\N	(35) 99802-4210	\N		10
22	MOREL TRANSPORTES	00.926.810/0001-73	cnpj	\N	(41) 98837-3440	\N		15
23	 LOCARGA TRANSPORTES LTDA	59.182.503/0001-78	cnpj	\N	(28) 99949-7841	\N		15
24	 PASMEC TRANSPORTES E CONFECCOES LTDA	00.924.471/0001-96	cnpj	\N	(11) 91756-4213	\N		15
25	MARCFREIRE TRANSPORTES LTDA	07.826.376/0001-07	cnpj	\N	(22) 97401-3414	\N		15
26	WM SERVICES LTDA	49.607.064/0001-44	cnpj	\N	(62) 99142-4260	\N		15
27	Transmaria Transportes Ltda	38.542.944/0001-63	cnpj	\N	(21) 99319-4939	\N		15
29	ETC - Transmaria Agregados Ltda	44.344.963/0001-88	cnpj	\N	(21) 99319-4939	\N		15
30	 SARA TRANSPORTES LTDA	26.827.257/0001-05	cnpj	\N	(41) 98482-2807	\N		15
31	MONTEIRO JUNIOR LOGISTICA E TRANSPORTE LTDA	60.620.613/0001-53	cnpj	Ailton	(55) 27998-0090	\N	antturgente@gmail.com	1
32	CSB TRANSPORTES E COMERCIO DE MATERIAIS DE CONSTRUCAO LTDA	33.506.267/0001-04	cnpj	CASSIO	(92) 99168-1133	\N		11
28	TRANSMARIA FC LTDA	52.015.874/0001-16	cnpj	\N	(21) 99319-4939	\N		15
33	 50.232.547 MESSIAS DE ALMEIDA DOS SANTOS	50.232.547/0001-90	cnpj	MESSIAS	(33) 98703-0330	\N		11
34	50.799.910 RAUL MORAES E SILVA NETO	50.799.910/0001-54	cnpj	RAUL	(41) 99992-0075	\N		11
35	45.696.035 FERNANDO NUNES DA SILVA	45.696.035/0001-45	cnpj	FERNANDO	(31) 98621-5264	\N		11
36	 59.590.082 JOSE DE JESUS	59.590.082/0001-14	cnpj	SERGIO	(27) 99840-7914	\N		11
37	SERGIO DOS SANTOS SILVA	855.944.747-49	cpf	855.944.747-49	(22) 99782-2350	\N		11
38	 37.146.728 ADRIANO ALCANTARA PARESQUI	37.146.728/0001-36	cnpj	\N	(27) 99271-9950	\N		11
39	46.084.655 ADENILSON CASAGRANDE	46.084.655/0001-96	cnpj	\N	(49) 99997-0142	\N		11
40	BONA FIDE TRANSPORTE LTDA	21.715.682/0001-99	cnpj	\N	(71) 99620-7048	\N		12
41	AGRO VELOZ 77 LTDA	39.309.391/0001-66	cnpj	\N	(42) 99949-4766	\N		12
42	DARIU ANTONIO SANTOS DA SILVA	038.652.119-09	cpf	\N	(11) 96882-5730	(11) 96882-5730		12
43	REINALDO ARAUJO ALBERNAZ	276.569.505-91	cpf	\N	(61) 99672-2075	\N		12
44	MARCIO JASON CORREA	15.244.851/0001-57	cnpj	\N	(65) 99613-8569	\N		7
45	IN GLOW BRASIL INTERMEDIACAO DE NEGOCIOS LTDA	45.814.425/0001-72	cnpj	DESPACHANTE	(13) 99195-1162	\N		7
46	KEURIANY DE ALMEIDA MORAIS 04961592161	38.313.295/0001-29	cnpj	\N	(64) 98115-5691	\N		11
47	ISMAIL JOSE FERREIRA	020.101.418-14	cpf	\N	(16) 93133-1591	\N		11
48	 JOSE SILVIO COSTA DE OLIVEIRA	636.446.065-87	cpf	\N	(61) 98427-4518	\N		11
49	BRUNO HENRIQUE PEREIRA DA SILVA 	499.573.248-96	cpf	\N	(11) 97790-8127	\N		11
50	 PRISCILA BENTO DIAS	287.909.648-02	cpf	\N	(11) 96535-9015	\N		11
51	RAFAEL BENTO DE SOUSA SENA 	099.907.059-25	cpf	\N	(11) 96535-9015	\N		11
52	VALTEIR ALVES DA SILVA	612.817.861-87	cpf	\N	(62) 99949-7257	\N		11
53	A M PRADO TRANSPORTES LTDA	15.565.887/0001-32	cnpj	\N	(19) 98310-0211	\N		11
54	M A ELIAS CONSERVADORA LTDA	39.756.416/0001-70	cnpj	\N	(24) 99263-6241	\N		11
55	THAIS CONCEICAO SANTOS NASCIMENTO	36.362.856/0001-54	cnpj	\N	(71) 98625-1056	\N		11
56	MILTON BENINI	444.715.800-00	cpf	\N	(54) 99643-8890	\N		11
57	LGVAZ TRANSPORTES LTDA	50.398.964/0001-08	cnpj	LGVAZ TRANSPORTES LTDA	(11) 97478-4555	\N	antt@gmail.com	14
58	 HOPE TRANSPORTES LTDA	51.342.661/0001-36	cnpj	\N	(13) 99645-9003	\N		11
59	VANDO ALOISIO TAVARES	219.458.478-16	cpf	\N	(19) 99867-0320	\N		14
60	 FLAVIANO MARCOS RIBEIRO	032.612.816-69	cpf	\N	(31) 98349-4470	\N	antt@gmail.com	14
61	BHDG TRANSPORTE E COMERCIO DE METAIS LTDA	49.398.872/0001-49	cnpj	bhdg	(11) 91023-2703	\N	antt@gmail.com	14
62	FELIPE LUCIANO FRANCESCATTO	019.997.770-42	cpf	\N	(51) 82244-1260	\N		14
63	JOÃO GUSTAVO SIGOLO DE OLIVEIRA 	059.423.097-79	cpf	\N	(21) 98318-3702	\N		12
64	 MSC TRANSPORTES LTDA	49.362.622/0001-59	cnpj	\N	(88) 99969-6030	\N		12
65	 LUCAS RODRIGUES DOS SANTOS 	069.829.873-02	cpf	\N	(86) 99533-6877	\N		12
66	JOSE RICARDO LOPES DUARTE 	111.267.587-60	cpf	\N	(21) 96753-5722	\N		12
67	 TRANSPORTE CATAPANO LTDA	04.380.209/0001-89	cnpj	 TRANSPORTE CATAPANO LTDA	(11) 99872-1630	\N		9
68	MEIRINESIO DOS SANTOS	098.709.338-07	cpf	\N	(12) 99137-4707	\N		13
69	 JIONATHAN PIVETTA	016.256.330-25	cpf	\N	(66) 96499-9270	\N		14
70	SAMUEL HENRIQUE SOUZA DOS SANTOS	55.014.297/0001-36	cnpj	\N	(55) 31998-4609	\N		15
71	 WALTUIR INACIO DA SILVA	181.488.596-04	cpf	\N	(32) 99870-8227	\N		11
72	35.235.788 MARCOS ROBERTO BORGES VESPA	35.235.788/0001-08	cnpj	MARCOS ROBERTO BORGES VESPA	(11) 91451-5942	\N		9
73	ELOI ROQUE GABE	320.204.140-15	cpf	\N	(51) 99995-9051	\N		10
74	NOVO MUNDO QUIMICA LTDA	26.213.951/0001-32	cnpj	NOVO MUNDO QUIMICA LTDA	(81) 99858-9400	\N		9
75	 D ANGELYS SOUZA DA SILVA LTDA	42.653.298/0001-89	cnpj	 D ANGELYS SOUZA DA SILVA LTDA	(77) 98159-4535	\N		9
76	Gilberto da Silva Bino	179.371.987-02	cpf	\N	(28) 99917-2082	\N		9
77	GLEITON SERGIO PEREIRA DE SOUSA	992.251.071-53	cpf	\N	(61) 99915-2024	\N		9
78	TRANSJETTO LTDA	50.191.202/0001-36	cnpj	TRANSJETTO LTDA	(47) 99936-9491	\N		9
79	53.486.102 CARLOS PEREIRA DE PAIVA	53.486.102/0001-25	cnpj	CARLOS PEREIRA DE PAIVA	(15) 98131-8631	\N		9
80	RAFAEL SOARES DOS SANTOS 	322.620.448-30	cpf	\N	(16) 99439-8821	\N		9
81	 JORGE LUIS SANTANA 28984438839	35.346.610/0001-26	cnpj	JORGE LUIS SANTANA	(11) 94791-4461	\N		9
82	MARCIO HENRIQUE DE SOUZA 	559.215.076-87	cpf	\N	(31) 99846-0964	\N		15
83	 WP TRANSPORTES LTDA	60.673.497/0001-30	cnpj	\N	(55) 11940-3483	\N		15
84	BRAVO LOCACAO E MANUTENCAO DE EQUIPAMENTOS LTDA	43.592.966/0001-78	cnpj	BRAVO LOCACAO E MANUTENCAO DE EQUIPAMENTOS LTDA	(21) 98000-7069	\N		9
85	CLAUDINEI FREITAS MEIRELES	075.089.256-02	cpf	\N	(31) 99750-5596	\N		1
86	 ALMIR ROGERIO PIRES 	27.816.599/0001-92	cnpj	\N	(24) 99212-5575	\N		15
87	VALENTE & CASTILHO LTDA	01.584.703/0001-77	cnpj	Nilson	(67) 99975-2666	\N		1
88	SIDNEI PEREIRA TRISTAO	332.128.418-93	cpf	\N	(14) 99779-4797	\N	sidtristao03@gmail.com	16
89	DANUBIA GRACIELE MIRANDA TRANSPORTES LTDA	16.790.930/0001-26	cnpj	\N	(11) 91756-4213	\N		15
90	 ALEX SANDRO VALEJO EVES	001.928.701-14	cpf	\N	(67) 99618-9453	\N		9
91	45.233.297 WALDECIR BES	45.233.297/0001-73	cnpj	WALDECIR BES	(54) 99656-6002	\N		9
92	VALDEILSON DOURADO DA SILVA TRANSPORTES	31.227.854/0001-39	cnpj	VALDEILSON DOURADO DA SILVA TRANSPORTES	(85) 99693-3017	\N		9
93	EDER CARLOS PEREIRA	337.912.208-45	cpf	\N	(14) 99736-8206	\N	edercarlospereira6@gmail.com	16
94	JOÃO CARLOS GUELIS	033.744.878-74	cpf	\N	(65) 99206-4582	\N		10
95	COOPERATIVA DE TRANSPORTE DE CARGAS DIVERSAS DE  BH E REGIAO - COOPSTAR	47.640.953/0001-88	cnpj	COOPSTAR	(31) 99952-8907	\N		9
96	ANDRE VIEIRA ANDRADE LTDA	51.709.550/0001-15	cnpj	ANDRE VIEIRA ANDRADE LTDA	(66) 99955-6414	\N		9
97	RICARDO PERES DE SENA	339.311.618-54	cpf	\N	(11) 94478-8119	\N		10
98	Nassir Joao Contiero	03.786.516/0001-00	cnpj	Nassir Joao Contiero	(11) 99930-4430	\N		9
99	FLAVIO IZABEL	52.549.511/0001-60	cnpj	 52.549.511 FLAVIO IZABE	(55) 11987-4958	\N		9
100	SUL AIR DEMOLICOES E LOCACOES DE MAQUINAS LTDA	87.936.795/0001-22	cnpj	SUL AIR DEMOLICOES E LOCACOES DE MAQUINAS LTDA	(55) 95196-0293	\N		9
101	 JUGLAIR JUANINI	090.064.399-40	cpf	\N	(55) 47927-7454	\N		9
102	 DJALMA CRISPIM DE OLIVEIRA	325.386.341-72	cpf	\N	(55) 47965-2292	\N		9
103	CAMPOS TRANSPORTADORA LTDA	54.130.508/0001-33	cnpj	54.130.508/0001-33	(44) 99953-7851	\N		9
104	SOUZA TRANSPORTES E SERVICOS DE ESCOLTA LTDA	27.931.090/0001-90	cnpj	SOUZA TRANSPORTES E SERVICOS DE ESCOLTA LTDA	(55) 48842-8866	\N		9
105	LEANDRO GOMES DA COSTA	012.915.831-30	cpf	\N	(55) 62968-8764	\N		9
106	RHUAN HENRIQUE BASSANi	055.201.970-40	cpf	\N	(55) 54915-8413	\N		14
107	54.287.004 CRISMARY OLIVEIRA DA SILVA	54.287.004/0001-21	cnpj	54.287.004 CRISMARY OLIVEIRA DA SILVA	(55) 82911-6926	\N		9
108	AMERICO GULHERME  ROCHA	658.840.437-91	cpf	\N	(55) 27999-2670	\N		15
109	RODRIGO MATHEUS BONIFACIO	303.695.408-24	cpf	\N	(55) 11940-2748	\N		9
110	GERSON DE OLIVEIRA CERCAL 	599.278.879-49	cpf	\N	(47) 99942-3575	\N		9
111	Ana Paula Ross	967.275.190-72	cpf	\N	(55) 51981-9456	\N		9
112	 MINERADORA MX LTDA	27.504.914/0001-46	cnpj	\N	(55) 87999-7087	\N		9
113	COOPERLUBRA COOPERATIVA DE TRANSPORTES RODOVIARIOS, DE CONSUMO DE LUBRIFICANTES E COMBUSTIVEIS E DE AGENCIAMENTO DE FRETES PLANALTO LTDA	08.083.315/0001-51	cnpj	\N	(54) 99996-3807	\N		9
114	 FRANCISCO DAS CHAGAS ARAUJO	287.309.548-27	cpf	\N	(55) 89940-3291	\N		9
115	RAFAEL DE SOUZA CAFARO	320.788.888-77	cpf	\N	(55) 11991-9996	\N		15
116	 PEDRO AUGUSTO DAUBERMANN M E	97.142.434/0001-68	cnpj	\N	(51) 99557-8086	\N		11
117	CLOVIS LIMA DA CUNHA JUNIOR	039.402.294-74	cpf	\N	(84) 99865-3664	\N		11
118	 JOAO PAULO PEREIRA	343.719.938-26	cpf	\N	(16) 99281-5917	\N		11
119	 ADENIR RODRIGUES AUGUSTO & CIA LTDA	05.271.593/0001-44	cnpj	\N	(66) 99726-6928	\N		11
120	 IVANILCE MARIA PALUDO BASSO 	445.750.920-53	cpf	\N	(65) 99907-5906	\N		11
121	PETERSON BEZERRA DE SOUZA	827.930.771-00	cpf	\N	(61) 99148-0901	\N		11
122	JULIO CESAR MOREIRA	203.971.718-89	cpf	\N	(11) 98435-8455	\N		11
123	 WESLLEY FERNANDES BARBOSA LTDA	46.977.610/0001-40	cnpj	yuri	(62) 85292-6660	\N		14
124	ALYSSON DE OLIVEIRA DA SILVA	122.334.589-07	cpf	\N	(41) 96547-2310	\N		14
125	EUROLATINA QUIMICA LTDA	37.611.975/0001-66	cnpj	gabriela	(16) 99950-5544	\N		14
126	39.881.306 FRANCISCO SALES ALVES DE LIMA E SA	39.881.306/0001-30	cnpj	\N	(15) 99741-9096	\N		11
127	 JR RIBOLI TRANSPORTES SOCIEDADE EMPRESARIA LIMITADA	56.037.956/0001-12	cnpj	\N	(19) 99171-1897	\N		11
128	 AUGUSTO LEAO TRANSPORTES E MUDANCAS LTDA	47.207.999/0001-08	cnpj	\N	(11) 98623-6500	\N		11
129	 TRANS ARAUJO LTDA	25.054.609/0001-74	cnpj	\N	(55) 81999-3185	\N		15
130	MARCOS ANTONIO & VICENCA COMERCIO DE GRAOS LTDA	05.983.860/0001-06	cnpj	\N	(89) 99457-8333	\N		15
131	 GAZIN LOG TRANSPORTE E LOGISTICA LTDA	26.519.585/0001-44	cnpj	\N	(44) 88272-5377	\N		15
132	OSMAR ROSA DA SILVA	057.690.208-06	cpf	\N	(17) 99108-3380	\N		13
133	JULIANO OLIVEIRA DA SILVA 	825.392.510-72	cpf	\N	(51) 99272-4672	\N		10
134	 PAULO ALEXANDRE SILVA DE OLIVEIRA	14.380.259/0001-10	cnpj	\N	(51) 99817-3762	\N		11
135	 AFONSO TRANSPORTES PESADOS LTDA	09.063.628/0001-00	cnpj	\N	(41) 99972-6634	\N		11
136	MOACIR ALVES DE ALMEIDA JUNIOR	111.466.478-24	cpf	\N	(11) 95290-4420	\N		11
137	 JAIR PEIXOTO 	976.886.228-91	cpf	\N	(12) 99675-1998	\N		11
138	PRA FUZZI LOGISTICA E TRANSPORTES LTDA	60.441.699/0001-57	cnpj	\N	(13) 97421-1012	\N		11
139	 ANDERSON ADRIANO DO NASCIMENTO	031.627.036-97	cpf	\N	(32) 98833-4355	\N		11
140	JONAS MAURICIO CURCIO	657.109.597-15	cpf	\N	(32) 99136-9334	\N		11
141	46.382.756 ALAN MENDES DE ARAUJO	46.382.756/0001-43	cnpj	\N	(62) 99900-2499	\N		11
142	MOACIR DE ARAUJO	427.062.381-00	cpf	\N	(62) 99900-2499	\N		11
143	HILQUIAS DA SILVA ALMEIDA	11.814.463/0001-03	cnpj	\N	(75) 98336-4124	\N		11
144	DEL NERO COMERCIO DE EMBALAGENS LTDA	03.407.094/0001-06	cnpj	\N	(11) 96508-9062	\N		11
145	57.095.456 ARLINDO DE OLIVEIRA FRANCO	57.095.456/0001-08	cnpj	\N	(91) 98535-0349	\N		11
146	 S&L LOCACAO DE VEICULOS	29.833.237/0001-35	cnpj	\N	(84) 99646-2036	\N		11
147	CRISTIANO PEREIRA DA COSTA	831.279.921-49	cpf	\N	(94) 99163-0872	\N		11
148	52.449.646 JOSE PAULO BEZERRA DA COSTA	52.449.646/0001-54	cnpj	\N	(75) 98323-2661	\N		11
149	R. A. ESPINDOLA LTDA	60.538.353/0001-71	cnpj	\N	(31) 97746-1090	\N		15
150	DELAIR GATO	037.081.688-95	cpf	\N	(17) 99645-4137	\N		13
151	DANILO DOS SANTOS NEGREIROS 	094.515.697-90	cpf	\N	(21) 98628-1114	\N		15
152	RAIO PARAUNA TRANSPORTES LTDA	31.751.839/0001-95	cnpj	\N	(64) 99284-7260	\N		15
153	FEPECA COMERCIO DE GAS LTDA	74.245.556/0001-84	cnpj	FEPECA COMERCIO DE GAS LTDA	(55) 12981-0934	\N		14
154	 LOGLILOG LOGISTICA E TRANSPORTES LTDA	07.977.467/0001-35	cnpj	 LOGLILOG LOGISTICA E TRANSPORTES LTDA	(55) 34996-6284	\N		9
155	 C O DA SILVA PONTES TRANSPORTES	58.908.532/0001-01	cnpj	 C O DA SILVA PONTES TRANSPORTES	(55) 82911-6926	\N		9
156	TRANSPORTADORA VALE VERDE LTDA 	12.820.354/0001-61	cnpj	ÉRICA	(43) 99171-2801	\N		7
157	 SERGIO RODRIGO MACHADO	000.297.860-10	cpf	\N	(55) 51997-6653	\N		9
158	RODRIGO OLIVEIRA LEAL	112.270.816-50	cpf	\N	(37) 99966-7440	\N		13
159	 J K ASSAD NOGUEIRA TRANSPORTES	15.567.959/0001-80	cnpj	 J K ASSAD NOGUEIRA TRANSPORTES	(55) 91910-8840	\N		9
160	EVERTON SOUZA MEDEIROS	375.427.758-80	cpf	\N	(55) 19992-7914	\N		9
161	 CARLOS EDUARDO ALVES SUKENSKI	077.751.869-41	cpf	\N	(55) 44997-7417	\N		9
162	MAGNO MATOS REIS	006.559.365-05	cpf	\N	(74) 99998-3535	\N		12
163	MOISES CARLOS FERREIRA	477.693.436-15	cpf	\N	(31) 99375-8423	\N	moisescarlos873@gmail.com	16
164	VIA GROUP PARTICIPACOES LTDA	07.031.916/0001-58	cnpj	\N	(45) 99147-6799	\N		12
165	ROBISON RIBAS FLORENCIANO	989.550.201-04	cpf	\N	(67) 99211-4383	\N		12
166	SANDERSON SANTANA MENDES	46.396.188/0001-30	cnpj	\N	(38) 99194-7234	\N		12
167	ETC - Cajufe Transportes Ltda	04.902.674/0001-32	cnpj	\N	(55) 66963-6046	\N		15
168	Ronivon Venancio Barbosa	016.010.861-64	cpf	\N	(55) 62968-8764	\N		9
169	 25.247.095 VILMAR DEBASTIANI	25.247.095/0001-73	cnpj	 25.247.095 VILMAR DEBASTIANI	(51) 99932-9086	\N		9
170	 18.325.715 JORGE VINICIUS SANTOS SILVA	18.325.715/0001-80	cnpj	 18.325.715 JORGE VINICIUS SANTOS SILVA	(55) 71937-5042	\N		9
171	GABRIEL NUNES DE BRITO	129.966.466-06	cpf	\N	(55) 35973-6802	\N		9
172	LAZARO ANTONIO DE ALVARENGA	121.260.556-04	cpf	\N	(35) 99969-7230	\N		13
173	LAZARO ANTONIO DE ALVARENGA - ME	17.603.135/0001-44	cnpj	LAZARO ANTONIO DE ALVARENGA	(35) 99969-7230	\N		13
174	Ivan Emilio Dalla Corte	300.501.709-53	cpf	\N	(55) 66998-5515	\N		9
175	MARCOS PAULO MATOS REIS	844.441.935-49	cpf	\N	(74) 99998-3535	\N		12
176	CARLOS ALBERTO DE PAULA SILVA	316.998.805-06	cpf	\N	(75) 99968-1148	\N		10
177	 46.079.633 FRANCISCO SILVA DE SOUZA	46.079.633/0001-38	cnpj	\N	(91) 99194-5501	\N		11
178	V C LOGGI TRANSPORTES E COMERCIO DE LUBRIFICANTE LTDA.	60.027.945/0001-29	cnpj	\N	(51) 99733-8822	\N		11
179	SERGIO LUIZ BRUGNAGO	476.753.229-91	cpf	\N	(47) 99729-7606	\N		11
180	FERNANDES TRANSPORTES DE CARGAS LTDA	12.988.377/0001-80	cnpj	\N	(11) 99846-5628	\N		12
181	INDUSTRIA DE MOVEIS RIO VERDE LTDA	08.003.034/0001-41	cnpj	\N	(35) 98896-0068	\N		11
182	FABIANA PRAZERES DE SOUZA PEREIRA	036.428.814-08	cpf	\N	(81) 99684-9602	\N		11
183	WILSON CEZAR DE PAULA 	926.248.716-91	cpf	\N	(31) 99141-7343	\N		11
184	TIAGO FERNANDES GAMEIRO	337.085.398-18	cpf	\N	(16) 99710-2832	\N		16
185	 R & SOUSA TRANSPORTES LTDA	48.825.478/0001-87	cnpj	\N	(55) 91830-2100	\N		15
186	57.763.619 BRUNO DE LIMA ANDRIGHETTI	57.763.619/0001-75	cnpj	\N	(55) 99732-7327	\N		11
187	CHEGLOG TRANSPORTES E LOGISTICA LTDA	36.231.233/0001-42	cnpj	\N	(55) 99732-7327	\N		11
188	ITANIR BILIBIO & CIA LTDA	06.177.908/0001-51	cnpj	\N	(55) 99975-2127	\N		11
189	EXPRESSO AMAZON CGB TRANSPORTE E LOCACAO VEICULOS LTDA	37.519.057/0001-01	cnpj	\N	(31) 99414-0881	\N		11
190	DIEGO LOPES FERNANDES	099.754.456-24	cpf	\N	(35) 99705-2807	\N		11
191	BALTAZAR DOS REIS CARDOSO	826.937.736-87	cpf	\N	(74) 99971-3438	\N		11
192	Maria Cristina	23.270.400/0001-12	cnpj	Maria Cristina	(55) 64928-6016	\N		14
193	 TZ TRANSPORTES EIRELI	19.125.144/0001-00	cnpj	\N	(47) 99229-1195	\N		11
194	AMARANTE TRANSPORTES LTDA	60.743.908/0001-17	cnpj	\N	(46) 98803-2444	\N		11
195	RJ TRANSPORTES E SERVICOS LTDA	38.825.870/0001-72	cnpj	\N	(32) 98487-4947	\N		11
196	ALEXANDRE DA SILVA DOS SANTOS	088.269.229-18	cpf	\N	(41) 98455-0744	\N		7
197	RODA VIVA - DISTRIBUIDORA DE DERIVADOS DE PETROLEO LTDA	03.560.854/0001-10	cnpj	\N	(91) 93007-7510	\N		15
198	DALLAS WICHOSCKI	019.006.089-10	cpf	\N	(41) 99800-3281	\N		12
199	FELIPE E HELOISA TRANSPORTADORA E LOGISTICA  LTDA	60.363.971/0001-28	cnpj	\N	(11) 96222-7802	\N		12
200	JEAN CARLO MACHADO 	087.527.169-37	cpf	\N	(47) 99730-3707	\N		12
201	VINICIUS RIBEIRO DE SOUZA	950.194.641-04	cpf	\N	(55) 61981-1073	\N		9
202	ADRIANO FERREIRA DOS SANTOS	156.811.748-59	cpf	\N	(11) 97163-0675	\N		12
203	 E H F COMERCIAL LTDA	03.833.393/0001-02	cnpj	 E H F COMERCIAL LTDA	(47) 99983-3888	\N		9
204	51.938.014 RINALDO LUIZ DE FRANCA	51.938.014/0001-91	cnpj	51.938.014 RINALDO LUIZ DE FRANCA	(81) 98968-9725	\N		9
205	EMPRESAS DELBONE LTDA	52.408.081/0001-67	cnpj	\N	(55) 65994-6698	\N		9
206	Clarice	294.837.958-00	cpf	\N	(55) 11978-0203	\N		14
207	ELENICE PERES DE OLIVEIRA	667.466.471-53	cpf	\N	(66) 99900-2756	\N		13
208	DAVID DE SOUZA	161.789.098-70	cpf	\N	(43) 99914-2114	\N		16
209	NOTTAR & NOTTAR LTDA	06.368.449/0001-93	cnpj	\N	(45) 99111-9097	\N		11
210	AUCOBRE GESTAO DE RESIDUOS LTDA	10.418.979/0001-76	cnpj	\N	(21) 97093-3365	\N		11
211	ANDERSON SANTOS FURLANI	090.017.407-23	cpf	\N	(27) 99749-4171	\N		11
212	DANIEL BRAHM SCHEUNEMANN	804.931.300-04	cpf	\N	(53) 98147-2313	\N		10
213	JOEL BARBIERO	006.094.340-80	cpf	\N	(54) 99609-0691	\N		11
214	MARNINES DA SILVA FLORES	005.390.050-29	cpf	\N	(55) 99946-2770	\N		11
215	IVO GOMES DA SILVA	480.234.937-87	cpf	\N	(21) 97029-9938	\N		10
216	 LM MARTINS TRANSPORTES LTDA	60.311.295/0001-49	cnpj	\N	(11) 99469-8113	\N		11
217	JOSEMAR CAMPAGNOLO	051.437.399-77	cpf	\N	(45) 99126-0885	\N		11
218	 RENATO DIAS DO AMARAL 04047171956	40.120.684/0001-80	cnpj	\N	(41) 99191-9742	\N		11
219	INGRIND BERG VIEIRA MORAIS	000.075.943-05	cpf	\N	(85) 99994-6794	\N		11
220	REGINALDO SALES SANTOS	786.706.165-72	cpf	\N	(71) 99720-1843	\N		11
221	GILBERTO FERREIRA SILVA	192.620.838-23	cpf	\N	(11) 99326-1736	\N		13
222	RODNEY TESTA	262.125.188-90	cpf	\N	(19) 99738-5342	\N		13
223	ELIO CARASSA DOS SANTOS	667.887.060-34	cpf	\N	(54) 99975-7990	\N		13
224	JOSE OLIVEIRA DE AMORIN	052.538.388-30	cpf	\N	(15) 99728-1511	\N		13
225	SERGIO EDUARDO DE PAULA PINTO	470.310.859-34	cpf	\N	(41) 98833-1662	\N		16
226	IVONE QUEIROZ DE SOUZA 	081.973.788-78	cpf	\N	(55) 16997-9872	\N		9
227	 DEIVSON EXPEDITO DE ALMEIDA	068.405.396-95	cpf	\N	(55) 37987-2235	\N		9
228	 Kleber Luis Daleprane	250.826.408-36	cpf	\N	(55) 11986-8092	\N		9
229	FRANCISCO WELLINGTON ALMEIDA BENEDITO	673.814.993-04	cpf	\N	(85) 98638-0074	\N		9
230	JULIO CESAR OLIVEIRA	12.240.286/0001-61	cnpj	julio	(67) 91139-4260	\N		14
231	 TOTINHO SOARES VIEIRA 05662113602	24.088.313/0001-01	cnpj	 TOTINHO SOARES VIEIRA 05662113602	(55) 11959-5107	\N		9
232	SANDRO APARECIDO DA SILVA	038.497.948-30	cpf	\N	(18) 99735-6394	\N		13
233	LUIS CEZAR COCATO	695.567.259-20	cpf	\N	(44) 99963-4582	\N		14
234	GILBERTO NUNNES DA SIQUEIRA	52.359.762/0001-82	cnpj	gilberto	(15) 99757-7363	\N		14
235	 GILMAR BARBOSA DA SILVA 14013452200	29.772.751/0001-08	cnpj	 GILMAR BARBOSA DA SILVA 14013452200	(91) 99158-2963	\N		9
236	TR BELON TRANSPORTES LTDA	54.238.071/0001-56	cnpj	TR BELON TRANSPORTES LTDA	(19) 97421-9664	\N		9
237	CARLOS ROCHA	308.114.088-92	cpf	\N	(13) 99695-6490	\N		14
238	 R Y TRANSPORTES RODOVIARIO DE CARGAS LTDA	55.927.177/0001-20	cnpj	 R Y TRANSPORTES RODOVIARIO DE CARGAS LTDA	(55) 21980-3869	\N		9
239	J E DE OLIVEIRA TRANSPORTE	13.751.465/0001-26	cnpj	J E DE OLIVEIRA TRANSPORTE	(11) 96444-8990	\N		9
240	CARLOS ROCHA	197.529.888-81	cpf	\N	(13) 99695-6490	\N		14
241	BRAZ DOMINGOS LUIZ	801.492.949-72	cpf	\N	(41) 99706-7695	\N		9
242	 MADRID TRANSPORTES LTDA	40.089.436/0001-13	cnpj	 MADRID TRANSPORTES LTDA	(64) 99310-8228	\N		9
243	A G X CONSTRUTORA LTDA	16.606.217/0001-80	cnpj	A G X CONSTRUTORA LTDA	(21) 98988-3949	\N		9
244	JAIRO LUZ DE OLIVEIRA	53.406.110/0001-14	cnpj	\N	(11) 91794-9708	\N		14
245	ROGERIO DE SOUZA BARBOSA	045.916.969-60	cpf	\N	(41) 96166-4280	\N		14
246	19.055.468 RAFAEL ALEXANDRE DE RESENDE	19.055.468/0001-01	cnpj	19.055.468 RAFAEL ALEXANDRE DE RESENDE	(55) 16999-4697	\N		9
247	MARCOS ROGERIO DA SILVA	167.430.078-62	cpf	\N	(27) 98133-5041	\N		14
248	FRIOZEM LOGISTICA LTDA	03.639.682/0011-47	cnpj	FRIOZEM LOGISTICA LTDA	(55) 11964-7993	\N		9
249	JOSE ALVES DA CRUZ	035.240.508-24	cpf	\N	(19) 99887-7555	\N		13
250	JOAO SARLENO FERREIRA DOS SANTOS	60.597.236/0001-89	cnpj	JOÃO	(91) 84760-0010	\N		14
251	Marcos Roberto Bar da Silva	264.171.868-57	cpf	\N	(11) 98312-7476	\N		14
252	SILVIA DOS SANTOS	27.650.968/0001-10	cnpj	SILVIA	(11) 95873-4849	\N		14
253	 M&K TRANSPORTES E LOCACOES LTDA	42.926.846/0001-05	cnpj	\N	(19) 98270-3333	\N		15
254	JOSE FERNANDES VIANA ALENCAR	51.749.261/0001-40	cnpj	JOSÉ	(85) 99175-5838	\N		14
255	TARCISIO TEIXEIRA DA SILVA	037.580.205-30	cpf	\N	(74) 98103-4312	\N		14
256	FS RIBEIRO TRANSPORTES LTDA	06.372.708/0001-50	cnpj	RIBEIRO	(11) 94523-0779	\N		14
257	Felipe Penteado Borges	061.362.629-08	cpf	\N	(41) 88084-8030	\N		14
258	LIMA DISTRIBUIDORA DE GAS E AGUA LTDA	11.419.506/0001-56	cnpj	\N	(47) 91163-1810	\N		14
259	CLAIR TRANSPORTES LTDA	11.046.578/0001-03	cnpj	LUCAS	(65) 99248-4066	\N		7
260	CLEYSON BARBOSA SATURINO FILHO 	119.765.584-09	cpf	\N	(19) 98270-3333	\N		15
261	GLICERIO JOHANN LTDA	93.087.294/0001-11	cnpj	\N	(55) 51835-0508	\N		14
262	RAFAEL ROSADO DA SILVA 	097.250.654-33	cpf	\N	(41) 99662-1133	\N		1
263	DANILO BRUNO ALVES LUIZ	336.212.058-02	cpf	\N	(12) 99155-5414	\N		1
264	 CARLOS ALBERTO HERCULANO DA SILVA	085.708.274-40	cpf	\N	(21) 97295-5615	\N		15
265	TAC - Maria de Lourdes Dos Santos Ribeiro	721.081.005-63	cpf	\N	(38) 91569-8870	\N		15
266	 VELOZ TRANSPORTES RODOVIARIOS LTDA	19.197.857/0001-71	cnpj	\N	(69) 81110-8990	\N		15
267	JOSE MARIA DA SILVA 	785.689.431-87	cpf	\N	(62) 99235-4014	\N		15
268	SUPERMERCADO PI KENO LTDA	07.684.186/0001-94	cnpj	SUPERMERCADO PI KENO LTDA	(89) 98143-5968	\N		1
269	JOSÉ VENICIOS DE ASSIS	791.669.897-87	cpf	\N	(21) 99633-4419	\N		16
270	JUAREZ SOUSA CAMPELO	238.726.751-68	cpf	\N	(62) 98409-2858	\N		10
271	RACOES SERTANEJA LTDA	10.291.465/0001-00	cnpj	\N	(55) 49352-4047	\N		15
272	JVA CABRA BOM TRANSPORTES LTDA	26.476.034/0001-40	cnpj	JOSÉ VENICIOS DE ASSIS	(21) 99633-4419	\N		16
273	TAC - Rodolfo Bruno Martins Meliani	389.890.808-94	cpf	\N	(11) 96904-7024	\N		15
274	VALERIA CRISTINA BARBOSA DE CARVALHO 	003.813.361-07	cpf	\N	(65) 92210-1950	\N		15
275	ANTONIO FLAVIO RIBEIRO DE SOUSA 	018.308.812-30	cpf	\N	(91) 99862-9780	\N		15
276	RUBENS COELHO CALDAS 	153.204.995-15	cpf	\N	(55) 71997-3147	\N		9
277	C D ALMEIDA TRANSPORTES E LOGISTICA LTDA	03.771.985/0001-47	cnpj	C D ALMEIDA TRANSPORTES E LOGISTICA LTDA	(55) 41979-8940	\N		9
278	JOSE PACANHA DE OLIVEIRA	968.542.869-72	cpf	\N	(45) 99107-3234	\N		1
279	 RICARDO DE MELO 	824.679.609-78	cpf	\N	(48) 98477-8371	\N		1
280	ALEXANDRO KANOPP TRANSPORTES LTDA	46.957.562/0001-29	cnpj	ALEXANDRO KANOPP TRANSPORTES LTDA	(55) 45991-1234	\N		9
281	Jaianne Almeida Amorim	076.017.404-04	cpf	\N	(55) 84875-3025	\N		14
282	J&A TRANSPORTES LTDA	35.961.132/0001-64	cnpj	J&A TRANSPORTES LTDA	(19) 99679-3150	\N		1
283	 MERCADO FREITAS ARIPUANA LTDA	06.934.732/0001-35	cnpj	\N	(55) 66844-4822	\N		15
284	MARCELO MARCOS RIGATTO	037.327.139-54	cpf	\N	(55) 99923-0833	\N		9
285	ETC - Locavia Ltda.	02.912.081/0001-21	cnpj	\N	(55) 31910-7254	\N		15
286	FABIO GOES DE OLIVEIRA	024.702.249-77	cpf	\N	(45) 99126-0885	\N		11
287	V C TRANSPORTE LTDA	39.801.837/0001-75	cnpj	\N	(38) 99890-7986	\N		11
288	EMERSON ADORNO GOMES 03262518980	42.591.244/0001-36	cnpj	\N	(67) 99192-5101	\N		11
289	 MARCIO JOSE DA SILVA 	921.937.069-72	cpf	\N	(45) 99831-2053	\N		11
290	GENILDO ALMEIDA DA SILVA	037.062.094-11	cpf	\N	(35) 99827-7508	\N		11
291	SILVIO GONSALES D AMELIO	038.353.008-30	cpf	\N	(11) 94728-5336	\N		11
292	MARLENE PORTELA DE SOUZA 	857.196.921-34	cpf	\N	(55) 91914-2711	\N		9
293	 LL DIAS TRANSPORTES LTDA	33.473.142/0001-25	cnpj	 LL DIAS TRANSPORTES LTDA	(21) 99789-5849	\N		1
294	KORCHAK REBOQUES E TRANSPORTES LTDA	11.206.194/0001-00	cnpj	KORCHAK REBOQUES E TRANSPORTES LTDA	(55) 47926-4131	\N		9
295	 THORK TRANSPORTES LTDA	58.274.601/0001-72	cnpj	 THORK TRANSPORTES LTDA	(55) 16997-9872	\N		9
296	 HELPER LOGISTCS LTDA	27.144.585/0001-70	cnpj	 HELPER LOGISTCS LTDA	(55) 11995-0452	\N		9
297	OSCAR SETIN	100.648.318-76	cpf	\N	(19) 99633-4617	\N		13
298	JUNIOR ARRUDA SIQUEIRA	017.336.161-79	cpf	\N	(55) 65993-1061	\N		14
\.


--
-- Data for Name: debug_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.debug_logs (id, "timestamp", module, message, data) FROM stdin;
1	2025-05-05 17:12:13.014095	complete-execution	Iniciando conclusão da venda #20	{"userId": 4}
2	2025-05-05 17:12:13.299556	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
3	2025-05-05 17:12:14.170099	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
4	2025-05-05 17:37:53.531338	complete-execution	Iniciando conclusão da venda #21	{"userId": 4}
5	2025-05-05 17:37:53.827103	complete-execution	Prestadores ANTES da conclusão: 1	{"providers": [{"id": 3, "saleId": 21, "createdAt": "2025-05-05T17:37:52.941Z", "serviceProviderId": 2}]}
6	2025-05-05 17:37:54.631988	complete-execution	Prestadores APÓS a conclusão: 1	{"providers": [{"id": 4, "saleId": 21, "createdAt": "2025-05-05T17:37:54.111Z", "serviceProviderId": 2}]}
7	2025-05-05 19:07:41.709275	complete-execution	Iniciando conclusão da venda #22	{"userId": 1}
8	2025-05-05 19:07:42.092195	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
9	2025-05-05 19:07:42.824691	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
10	2025-05-05 19:21:26.864168	complete-execution	Iniciando conclusão da venda #26	{"userId": 4}
11	2025-05-05 19:21:27.019794	complete-execution	Prestadores ANTES da conclusão: 2	{"providers": [{"id": 5, "saleId": 26, "createdAt": "2025-05-05T19:21:26.489Z", "serviceProviderId": 1}, {"id": 6, "saleId": 26, "createdAt": "2025-05-05T19:21:26.489Z", "serviceProviderId": 2}]}
12	2025-05-05 19:21:27.408419	complete-execution	Prestadores APÓS a conclusão: 2	{"providers": [{"id": 7, "saleId": 26, "createdAt": "2025-05-05T19:21:27.199Z", "serviceProviderId": 1}, {"id": 8, "saleId": 26, "createdAt": "2025-05-05T19:21:27.199Z", "serviceProviderId": 2}]}
13	2025-05-05 19:31:15.721211	complete-execution	Iniciando conclusão da venda #27	{"userId": 1}
14	2025-05-05 19:31:15.832786	complete-execution	Prestadores ANTES da conclusão: 1	{"providers": [{"id": 9, "saleId": 27, "createdAt": "2025-05-05T19:31:15.327Z", "serviceProviderId": 2}]}
15	2025-05-05 19:31:16.32504	complete-execution	Prestadores APÓS a conclusão: 1	{"providers": [{"id": 10, "saleId": 27, "createdAt": "2025-05-05T19:31:15.959Z", "serviceProviderId": 2}]}
16	2025-05-05 19:51:24.770318	complete-execution	Iniciando conclusão da venda #25	{"userId": 4}
17	2025-05-05 19:51:24.886322	complete-execution	Prestadores ANTES da conclusão: 1	{"providers": [{"id": 15, "saleId": 25, "createdAt": "2025-05-05T19:51:24.416Z", "serviceProviderId": 3}]}
18	2025-05-05 19:51:25.212449	complete-execution	Prestadores APÓS a conclusão: 1	{"providers": [{"id": 16, "saleId": 25, "createdAt": "2025-05-05T19:51:24.997Z", "serviceProviderId": 3}]}
19	2025-05-06 13:42:01.651707	complete-execution	Iniciando conclusão da venda #48	{"userId": 8}
20	2025-05-06 13:42:01.774466	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
21	2025-05-06 13:42:02.043141	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
22	2025-05-06 14:10:17.004008	complete-execution	Iniciando conclusão da venda #49	{"userId": 7}
23	2025-05-06 14:10:17.141195	complete-execution	Prestadores ANTES da conclusão: 1	{"providers": [{"id": 17, "saleId": 49, "createdAt": "2025-05-06T14:10:16.610Z", "serviceProviderId": 1}]}
24	2025-05-06 14:10:17.488028	complete-execution	Prestadores APÓS a conclusão: 1	{"providers": [{"id": 18, "saleId": 49, "createdAt": "2025-05-06T14:10:17.261Z", "serviceProviderId": 1}]}
25	2025-05-06 14:30:27.806104	complete-execution	Iniciando conclusão da venda #50	{"userId": 8}
26	2025-05-06 14:30:27.923063	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
27	2025-05-06 14:30:28.285671	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
28	2025-05-06 14:32:43.280652	complete-execution	Iniciando conclusão da venda #51	{"userId": 8}
29	2025-05-06 14:32:43.390322	complete-execution	Prestadores ANTES da conclusão: 1	{"providers": [{"id": 19, "saleId": 51, "createdAt": "2025-05-06T14:32:42.929Z", "serviceProviderId": 1}]}
30	2025-05-06 14:32:43.709094	complete-execution	Prestadores APÓS a conclusão: 1	{"providers": [{"id": 20, "saleId": 51, "createdAt": "2025-05-06T14:32:43.502Z", "serviceProviderId": 1}]}
31	2025-05-06 14:33:35.062184	complete-execution	Iniciando conclusão da venda #52	{"userId": 8}
32	2025-05-06 14:33:35.178748	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
33	2025-05-06 14:33:35.437979	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
34	2025-05-06 14:35:31.233132	complete-execution	Iniciando conclusão da venda #53	{"userId": 8}
35	2025-05-06 14:35:31.347297	complete-execution	Prestadores ANTES da conclusão: 2	{"providers": [{"id": 25, "saleId": 53, "createdAt": "2025-05-06T14:35:30.866Z", "serviceProviderId": 3}, {"id": 26, "saleId": 53, "createdAt": "2025-05-06T14:35:30.866Z", "serviceProviderId": 1}]}
36	2025-05-06 14:35:31.672229	complete-execution	Prestadores APÓS a conclusão: 2	{"providers": [{"id": 27, "saleId": 53, "createdAt": "2025-05-06T14:35:31.454Z", "serviceProviderId": 3}, {"id": 28, "saleId": 53, "createdAt": "2025-05-06T14:35:31.454Z", "serviceProviderId": 1}]}
37	2025-05-06 14:35:59.824138	complete-execution	Iniciando conclusão da venda #54	{"userId": 8}
38	2025-05-06 14:35:59.953039	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
39	2025-05-06 14:36:00.225164	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
40	2025-05-06 14:36:43.825961	complete-execution	Iniciando conclusão da venda #55	{"userId": 8}
41	2025-05-06 14:36:43.963059	complete-execution	Prestadores ANTES da conclusão: 1	{"providers": [{"id": 33, "saleId": 55, "createdAt": "2025-05-06T14:36:43.404Z", "serviceProviderId": 1}]}
42	2025-05-06 14:36:44.405574	complete-execution	Prestadores APÓS a conclusão: 1	{"providers": [{"id": 34, "saleId": 55, "createdAt": "2025-05-06T14:36:44.085Z", "serviceProviderId": 1}]}
43	2025-05-06 14:37:45.554128	complete-execution	Iniciando conclusão da venda #56	{"userId": 8}
44	2025-05-06 14:37:45.672898	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
45	2025-05-06 14:37:45.935555	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
46	2025-05-06 14:38:26.688075	complete-execution	Iniciando conclusão da venda #57	{"userId": 8}
47	2025-05-06 14:38:26.800287	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
48	2025-05-06 14:38:27.085251	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
49	2025-05-06 14:46:10.445266	complete-execution	Iniciando conclusão da venda #58	{"userId": 8}
50	2025-05-06 14:46:10.563799	complete-execution	Prestadores ANTES da conclusão: 1	{"providers": [{"id": 37, "saleId": 58, "createdAt": "2025-05-06T14:46:09.728Z", "serviceProviderId": 1}]}
51	2025-05-06 14:46:10.923893	complete-execution	Prestadores APÓS a conclusão: 1	{"providers": [{"id": 38, "saleId": 58, "createdAt": "2025-05-06T14:46:10.675Z", "serviceProviderId": 1}]}
52	2025-05-06 14:46:42.813293	complete-execution	Iniciando conclusão da venda #59	{"userId": 8}
53	2025-05-06 14:46:42.922083	complete-execution	Prestadores ANTES da conclusão: 1	{"providers": [{"id": 39, "saleId": 59, "createdAt": "2025-05-06T14:46:42.365Z", "serviceProviderId": 2}]}
54	2025-05-06 14:46:43.27688	complete-execution	Prestadores APÓS a conclusão: 1	{"providers": [{"id": 40, "saleId": 59, "createdAt": "2025-05-06T14:46:43.041Z", "serviceProviderId": 2}]}
55	2025-05-06 16:57:05.988331	complete-execution	Iniciando conclusão da venda #60	{"userId": 8}
56	2025-05-06 16:57:06.134939	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
57	2025-05-06 16:57:06.400051	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
58	2025-05-06 16:57:49.889804	complete-execution	Iniciando conclusão da venda #61	{"userId": 8}
59	2025-05-06 16:57:50.016245	complete-execution	Prestadores ANTES da conclusão: 1	{"providers": [{"id": 41, "saleId": 61, "createdAt": "2025-05-06T16:57:49.533Z", "serviceProviderId": 1}]}
60	2025-05-06 16:57:50.338932	complete-execution	Prestadores APÓS a conclusão: 1	{"providers": [{"id": 42, "saleId": 61, "createdAt": "2025-05-06T16:57:50.132Z", "serviceProviderId": 1}]}
61	2025-05-06 16:58:24.842538	complete-execution	Iniciando conclusão da venda #62	{"userId": 8}
62	2025-05-06 16:58:24.964694	complete-execution	Prestadores ANTES da conclusão: 1	{"providers": [{"id": 43, "saleId": 62, "createdAt": "2025-05-06T16:58:24.285Z", "serviceProviderId": 1}]}
63	2025-05-06 16:58:25.37307	complete-execution	Prestadores APÓS a conclusão: 1	{"providers": [{"id": 44, "saleId": 62, "createdAt": "2025-05-06T16:58:25.082Z", "serviceProviderId": 1}]}
64	2025-05-06 16:59:00.624769	complete-execution	Iniciando conclusão da venda #63	{"userId": 8}
65	2025-05-06 16:59:00.732723	complete-execution	Prestadores ANTES da conclusão: 1	{"providers": [{"id": 47, "saleId": 63, "createdAt": "2025-05-06T16:59:00.271Z", "serviceProviderId": 1}]}
66	2025-05-06 16:59:01.047656	complete-execution	Prestadores APÓS a conclusão: 1	{"providers": [{"id": 48, "saleId": 63, "createdAt": "2025-05-06T16:59:00.846Z", "serviceProviderId": 1}]}
67	2025-05-06 16:59:29.07456	complete-execution	Iniciando conclusão da venda #64	{"userId": 8}
68	2025-05-06 16:59:29.208197	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
69	2025-05-06 16:59:29.509795	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
70	2025-05-06 17:00:09.728598	complete-execution	Iniciando conclusão da venda #66	{"userId": 8}
71	2025-05-06 17:00:10.028016	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
72	2025-05-06 17:00:10.618892	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
73	2025-05-06 17:01:01.153108	complete-execution	Iniciando conclusão da venda #67	{"userId": 8}
74	2025-05-06 17:01:01.368446	complete-execution	Prestadores ANTES da conclusão: 1	{"providers": [{"id": 49, "saleId": 67, "createdAt": "2025-05-06T17:01:00.217Z", "serviceProviderId": 1}]}
75	2025-05-06 17:01:01.719773	complete-execution	Prestadores APÓS a conclusão: 1	{"providers": [{"id": 50, "saleId": 67, "createdAt": "2025-05-06T17:01:01.502Z", "serviceProviderId": 1}]}
76	2025-05-06 18:09:20.784854	complete-execution	Iniciando conclusão da venda #68	{"userId": 8}
77	2025-05-06 18:09:20.94507	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
78	2025-05-06 18:09:21.2126	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
79	2025-05-06 18:09:56.677959	complete-execution	Iniciando conclusão da venda #69	{"userId": 8}
80	2025-05-06 18:09:56.810167	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
81	2025-05-06 18:09:57.110863	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
82	2025-05-06 18:10:18.246773	complete-execution	Iniciando conclusão da venda #71	{"userId": 8}
83	2025-05-06 18:10:18.365804	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
84	2025-05-06 18:10:18.695295	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
85	2025-05-06 18:12:06.20046	complete-execution	Iniciando conclusão da venda #73	{"userId": 8}
86	2025-05-06 18:12:06.324071	complete-execution	Prestadores ANTES da conclusão: 1	{"providers": [{"id": 53, "saleId": 73, "createdAt": "2025-05-06T18:12:05.809Z", "serviceProviderId": 1}]}
87	2025-05-06 18:12:06.656709	complete-execution	Prestadores APÓS a conclusão: 1	{"providers": [{"id": 54, "saleId": 73, "createdAt": "2025-05-06T18:12:06.439Z", "serviceProviderId": 1}]}
88	2025-05-06 18:14:06.093407	complete-execution	Iniciando conclusão da venda #76	{"userId": 8}
89	2025-05-06 18:14:06.209287	complete-execution	Prestadores ANTES da conclusão: 1	{"providers": [{"id": 57, "saleId": 76, "createdAt": "2025-05-06T18:14:05.625Z", "serviceProviderId": 1}]}
90	2025-05-06 18:14:06.549357	complete-execution	Prestadores APÓS a conclusão: 1	{"providers": [{"id": 58, "saleId": 76, "createdAt": "2025-05-06T18:14:06.333Z", "serviceProviderId": 1}]}
91	2025-05-06 18:14:35.253015	complete-execution	Iniciando conclusão da venda #77	{"userId": 8}
92	2025-05-06 18:14:35.372582	complete-execution	Prestadores ANTES da conclusão: 1	{"providers": [{"id": 59, "saleId": 77, "createdAt": "2025-05-06T18:14:34.667Z", "serviceProviderId": 1}]}
93	2025-05-06 18:14:35.701219	complete-execution	Prestadores APÓS a conclusão: 1	{"providers": [{"id": 60, "saleId": 77, "createdAt": "2025-05-06T18:14:35.485Z", "serviceProviderId": 1}]}
94	2025-05-06 18:15:08.766772	complete-execution	Iniciando conclusão da venda #78	{"userId": 8}
95	2025-05-06 18:15:08.877118	complete-execution	Prestadores ANTES da conclusão: 1	{"providers": [{"id": 61, "saleId": 78, "createdAt": "2025-05-06T18:15:08.409Z", "serviceProviderId": 1}]}
96	2025-05-06 18:15:09.216526	complete-execution	Prestadores APÓS a conclusão: 1	{"providers": [{"id": 62, "saleId": 78, "createdAt": "2025-05-06T18:15:08.994Z", "serviceProviderId": 1}]}
97	2025-05-06 18:15:47.500095	complete-execution	Iniciando conclusão da venda #79	{"userId": 8}
98	2025-05-06 18:15:47.682907	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
99	2025-05-06 18:15:48.257607	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
100	2025-05-06 18:15:53.343125	complete-execution	Iniciando conclusão da venda #79	{"userId": 8}
101	2025-05-06 18:15:55.345583	complete-execution	Iniciando conclusão da venda #79	{"userId": 8}
102	2025-05-06 18:16:35.149202	complete-execution	Iniciando conclusão da venda #80	{"userId": 8}
103	2025-05-06 18:16:35.260807	complete-execution	Prestadores ANTES da conclusão: 1	{"providers": [{"id": 67, "saleId": 80, "createdAt": "2025-05-06T18:16:34.700Z", "serviceProviderId": 1}]}
104	2025-05-06 18:16:35.581405	complete-execution	Prestadores APÓS a conclusão: 1	{"providers": [{"id": 68, "saleId": 80, "createdAt": "2025-05-06T18:16:35.376Z", "serviceProviderId": 1}]}
105	2025-05-06 18:16:51.84102	complete-execution	Iniciando conclusão da venda #81	{"userId": 8}
106	2025-05-06 18:16:51.964886	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
107	2025-05-06 18:16:52.254696	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
108	2025-05-06 18:17:05.926477	complete-execution	Iniciando conclusão da venda #82	{"userId": 8}
109	2025-05-06 18:17:06.031468	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
110	2025-05-06 18:17:06.292811	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
111	2025-05-06 18:17:19.507407	complete-execution	Iniciando conclusão da venda #83	{"userId": 8}
112	2025-05-06 18:17:19.610429	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
113	2025-05-06 18:17:19.940284	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
114	2025-05-06 18:30:15.563426	complete-execution	Iniciando conclusão da venda #74	{"userId": 8}
115	2025-05-06 18:30:15.866144	complete-execution	Prestadores ANTES da conclusão: 1	{"providers": [{"id": 69, "saleId": 74, "createdAt": "2025-05-06T18:30:15.154Z", "serviceProviderId": 1}]}
116	2025-05-06 18:30:16.623149	complete-execution	Prestadores APÓS a conclusão: 1	{"providers": [{"id": 70, "saleId": 74, "createdAt": "2025-05-06T18:30:16.129Z", "serviceProviderId": 1}]}
117	2025-05-06 18:47:55.350844	complete-execution	Iniciando conclusão da venda #96	{"userId": 7}
118	2025-05-06 18:47:55.456362	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
119	2025-05-06 18:47:55.766942	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
120	2025-05-06 18:54:40.095537	complete-execution	Iniciando conclusão da venda #97	{"userId": 8}
121	2025-05-06 18:54:40.205693	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
122	2025-05-06 18:54:40.458766	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
123	2025-05-07 11:39:47.501627	complete-execution	Iniciando conclusão da venda #119	{"userId": 8}
124	2025-05-07 11:39:47.617171	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
125	2025-05-07 11:39:47.892871	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
126	2025-05-07 11:41:48.123652	complete-execution	Iniciando conclusão da venda #98	{"userId": 8}
127	2025-05-07 11:41:48.230368	complete-execution	Prestadores ANTES da conclusão: 1	{"providers": [{"id": 71, "saleId": 98, "createdAt": "2025-05-07T11:41:47.699Z", "serviceProviderId": 1}]}
128	2025-05-07 11:41:48.523297	complete-execution	Prestadores APÓS a conclusão: 1	{"providers": [{"id": 72, "saleId": 98, "createdAt": "2025-05-07T11:41:48.334Z", "serviceProviderId": 1}]}
129	2025-05-07 11:42:36.446113	complete-execution	Iniciando conclusão da venda #123	{"userId": 8}
130	2025-05-07 11:42:36.564023	complete-execution	Prestadores ANTES da conclusão: 1	{"providers": [{"id": 73, "saleId": 123, "createdAt": "2025-05-07T11:42:36.061Z", "serviceProviderId": 2}]}
131	2025-05-07 11:42:36.905993	complete-execution	Prestadores APÓS a conclusão: 1	{"providers": [{"id": 74, "saleId": 123, "createdAt": "2025-05-07T11:42:36.701Z", "serviceProviderId": 2}]}
132	2025-05-07 11:42:54.253973	complete-execution	Iniciando conclusão da venda #118	{"userId": 8}
133	2025-05-07 11:42:54.363105	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
134	2025-05-07 11:42:54.634768	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
135	2025-05-07 11:43:15.685028	complete-execution	Iniciando conclusão da venda #116	{"userId": 8}
136	2025-05-07 11:43:15.787549	complete-execution	Prestadores ANTES da conclusão: 1	{"providers": [{"id": 75, "saleId": 116, "createdAt": "2025-05-07T11:43:15.347Z", "serviceProviderId": 1}]}
137	2025-05-07 11:43:16.221739	complete-execution	Prestadores APÓS a conclusão: 1	{"providers": [{"id": 76, "saleId": 116, "createdAt": "2025-05-07T11:43:15.892Z", "serviceProviderId": 1}]}
138	2025-05-07 11:43:34.855709	complete-execution	Iniciando conclusão da venda #115	{"userId": 8}
139	2025-05-07 11:43:34.954485	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
140	2025-05-07 11:43:35.196394	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
141	2025-05-07 11:43:49.020638	complete-execution	Iniciando conclusão da venda #114	{"userId": 8}
142	2025-05-07 11:43:49.128205	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
143	2025-05-07 11:43:49.376353	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
144	2025-05-07 11:44:08.014765	complete-execution	Iniciando conclusão da venda #113	{"userId": 8}
145	2025-05-07 11:44:08.117789	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
146	2025-05-07 11:44:08.370609	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
147	2025-05-07 11:44:47.579841	complete-execution	Iniciando conclusão da venda #109	{"userId": 8}
148	2025-05-07 11:44:47.696965	complete-execution	Prestadores ANTES da conclusão: 1	{"providers": [{"id": 77, "saleId": 109, "createdAt": "2025-05-07T11:44:47.230Z", "serviceProviderId": 1}]}
149	2025-05-07 11:44:48.336374	complete-execution	Prestadores APÓS a conclusão: 1	{"providers": [{"id": 78, "saleId": 109, "createdAt": "2025-05-07T11:44:47.840Z", "serviceProviderId": 1}]}
150	2025-05-07 11:45:22.78446	complete-execution	Iniciando conclusão da venda #112	{"userId": 8}
151	2025-05-07 11:45:22.887683	complete-execution	Prestadores ANTES da conclusão: 2	{"providers": [{"id": 79, "saleId": 112, "createdAt": "2025-05-07T11:45:22.430Z", "serviceProviderId": 1}, {"id": 80, "saleId": 112, "createdAt": "2025-05-07T11:45:22.430Z", "serviceProviderId": 3}]}
152	2025-05-07 11:45:23.387448	complete-execution	Prestadores APÓS a conclusão: 2	{"providers": [{"id": 81, "saleId": 112, "createdAt": "2025-05-07T11:45:23.023Z", "serviceProviderId": 1}, {"id": 82, "saleId": 112, "createdAt": "2025-05-07T11:45:23.023Z", "serviceProviderId": 3}]}
153	2025-05-07 11:50:58.458857	complete-execution	Iniciando conclusão da venda #122	{"userId": 8}
154	2025-05-07 11:50:58.585152	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
155	2025-05-07 11:50:59.040935	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
156	2025-05-07 12:35:31.051043	complete-execution	Iniciando conclusão da venda #125	{"userId": 8}
157	2025-05-07 12:35:31.165353	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
158	2025-05-07 12:35:31.418336	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
159	2025-05-07 14:43:14.905172	complete-execution	Iniciando conclusão da venda #127	{"userId": 8}
160	2025-05-07 14:43:15.021427	complete-execution	Prestadores ANTES da conclusão: 1	{"providers": [{"id": 85, "saleId": 127, "createdAt": "2025-05-07T14:43:14.527Z", "serviceProviderId": 1}]}
161	2025-05-07 14:43:15.326042	complete-execution	Prestadores APÓS a conclusão: 1	{"providers": [{"id": 86, "saleId": 127, "createdAt": "2025-05-07T14:43:15.132Z", "serviceProviderId": 1}]}
162	2025-05-07 19:01:53.463512	complete-execution	Iniciando conclusão da venda #154	{"userId": 7}
163	2025-05-07 19:01:53.623651	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
164	2025-05-07 19:01:53.901253	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
165	2025-05-07 19:03:13.983216	complete-execution	Iniciando conclusão da venda #153	{"userId": 7}
166	2025-05-07 19:03:14.156143	complete-execution	Prestadores ANTES da conclusão: 1	{"providers": [{"id": 87, "saleId": 153, "createdAt": "2025-05-07T19:03:13.470Z", "serviceProviderId": 1}]}
167	2025-05-07 19:03:14.466113	complete-execution	Prestadores APÓS a conclusão: 1	{"providers": [{"id": 88, "saleId": 153, "createdAt": "2025-05-07T19:03:14.261Z", "serviceProviderId": 1}]}
168	2025-05-07 19:04:03.55427	complete-execution	Iniciando conclusão da venda #148	{"userId": 7}
169	2025-05-07 19:04:03.667164	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
170	2025-05-07 19:04:03.947937	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
171	2025-05-07 19:04:57.135197	complete-execution	Iniciando conclusão da venda #140	{"userId": 7}
172	2025-05-07 19:04:57.240854	complete-execution	Prestadores ANTES da conclusão: 1	{"providers": [{"id": 91, "saleId": 140, "createdAt": "2025-05-07T19:04:56.801Z", "serviceProviderId": 1}]}
173	2025-05-07 19:04:57.551701	complete-execution	Prestadores APÓS a conclusão: 1	{"providers": [{"id": 92, "saleId": 140, "createdAt": "2025-05-07T19:04:57.345Z", "serviceProviderId": 1}]}
174	2025-05-07 19:15:59.187409	complete-execution	Iniciando conclusão da venda #157	{"userId": 7}
175	2025-05-07 19:15:59.346538	complete-execution	Prestadores ANTES da conclusão: 2	{"providers": [{"id": 93, "saleId": 157, "createdAt": "2025-05-07T19:15:58.835Z", "serviceProviderId": 2}, {"id": 94, "saleId": 157, "createdAt": "2025-05-07T19:15:58.835Z", "serviceProviderId": 3}]}
176	2025-05-07 19:15:59.671377	complete-execution	Prestadores APÓS a conclusão: 2	{"providers": [{"id": 95, "saleId": 157, "createdAt": "2025-05-07T19:15:59.458Z", "serviceProviderId": 2}, {"id": 96, "saleId": 157, "createdAt": "2025-05-07T19:15:59.458Z", "serviceProviderId": 3}]}
177	2025-05-07 20:35:26.874879	complete-execution	Iniciando conclusão da venda #152	{"userId": 7}
178	2025-05-07 20:35:26.98412	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
179	2025-05-07 20:35:27.27614	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
180	2025-05-07 20:36:53.430658	complete-execution	Iniciando conclusão da venda #106	{"userId": 7}
181	2025-05-07 20:36:53.536479	complete-execution	Prestadores ANTES da conclusão: 1	{"providers": [{"id": 97, "saleId": 106, "createdAt": "2025-05-07T20:36:53.074Z", "serviceProviderId": 2}]}
182	2025-05-07 20:36:53.993668	complete-execution	Prestadores APÓS a conclusão: 1	{"providers": [{"id": 98, "saleId": 106, "createdAt": "2025-05-07T20:36:53.647Z", "serviceProviderId": 2}]}
183	2025-05-09 17:42:02.671855	complete-execution	Iniciando conclusão da venda #99	{"userId": 8}
184	2025-05-09 17:42:02.833014	complete-execution	Prestadores ANTES da conclusão: 1	{"providers": [{"id": 99, "saleId": 99, "createdAt": "2025-05-09T17:42:02.298Z", "serviceProviderId": 1}]}
185	2025-05-09 17:42:03.163621	complete-execution	Prestadores APÓS a conclusão: 1	{"providers": [{"id": 100, "saleId": 99, "createdAt": "2025-05-09T17:42:02.946Z", "serviceProviderId": 1}]}
186	2025-05-09 17:42:21.493268	complete-execution	Iniciando conclusão da venda #100	{"userId": 8}
187	2025-05-09 17:42:21.600548	complete-execution	Prestadores ANTES da conclusão: 1	{"providers": [{"id": 101, "saleId": 100, "createdAt": "2025-05-09T17:42:20.988Z", "serviceProviderId": 3}]}
188	2025-05-09 17:42:21.900976	complete-execution	Prestadores APÓS a conclusão: 1	{"providers": [{"id": 102, "saleId": 100, "createdAt": "2025-05-09T17:42:21.702Z", "serviceProviderId": 3}]}
189	2025-05-09 17:42:44.386425	complete-execution	Iniciando conclusão da venda #101	{"userId": 8}
190	2025-05-09 17:42:44.491227	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
191	2025-05-09 17:42:44.742848	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
192	2025-05-09 17:42:58.351268	complete-execution	Iniciando conclusão da venda #102	{"userId": 8}
193	2025-05-09 17:42:58.458683	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
194	2025-05-09 17:42:58.75209	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
195	2025-05-09 17:43:27.191337	complete-execution	Iniciando conclusão da venda #104	{"userId": 8}
196	2025-05-09 17:43:27.296493	complete-execution	Prestadores ANTES da conclusão: 1	{"providers": [{"id": 103, "saleId": 104, "createdAt": "2025-05-09T17:43:26.836Z", "serviceProviderId": 1}]}
197	2025-05-09 17:43:27.611253	complete-execution	Prestadores APÓS a conclusão: 1	{"providers": [{"id": 104, "saleId": 104, "createdAt": "2025-05-09T17:43:27.411Z", "serviceProviderId": 1}]}
198	2025-05-09 17:43:54.627264	complete-execution	Iniciando conclusão da venda #105	{"userId": 8}
199	2025-05-09 17:43:54.733741	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
200	2025-05-09 17:43:54.985169	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
201	2025-05-09 17:44:11.699465	complete-execution	Iniciando conclusão da venda #107	{"userId": 8}
202	2025-05-09 17:44:11.815457	complete-execution	Prestadores ANTES da conclusão: 1	{"providers": [{"id": 105, "saleId": 107, "createdAt": "2025-05-09T17:44:11.305Z", "serviceProviderId": 1}]}
203	2025-05-09 17:44:12.188857	complete-execution	Prestadores APÓS a conclusão: 1	{"providers": [{"id": 106, "saleId": 107, "createdAt": "2025-05-09T17:44:11.923Z", "serviceProviderId": 1}]}
204	2025-05-09 17:44:46.09911	complete-execution	Iniciando conclusão da venda #111	{"userId": 8}
205	2025-05-09 17:44:46.217608	complete-execution	Prestadores ANTES da conclusão: 1	{"providers": [{"id": 107, "saleId": 111, "createdAt": "2025-05-09T17:44:45.726Z", "serviceProviderId": 1}]}
206	2025-05-09 17:44:46.552086	complete-execution	Prestadores APÓS a conclusão: 1	{"providers": [{"id": 108, "saleId": 111, "createdAt": "2025-05-09T17:44:46.344Z", "serviceProviderId": 1}]}
207	2025-05-09 17:45:25.09342	complete-execution	Iniciando conclusão da venda #133	{"userId": 8}
208	2025-05-09 17:45:25.208331	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
209	2025-05-09 17:45:25.614879	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
210	2025-05-13 18:04:52.581641	complete-execution	Iniciando conclusão da venda #171	{"userId": 7}
211	2025-05-13 18:04:52.729721	complete-execution	Prestadores ANTES da conclusão: 1	{"providers": [{"id": 109, "saleId": 171, "createdAt": "2025-05-13T18:04:51.915Z", "serviceProviderId": 1}]}
212	2025-05-13 18:04:53.110352	complete-execution	Prestadores APÓS a conclusão: 1	{"providers": [{"id": 110, "saleId": 171, "createdAt": "2025-05-13T18:04:52.868Z", "serviceProviderId": 1}]}
213	2025-05-13 18:15:47.504672	complete-execution	Iniciando conclusão da venda #185	{"userId": 7}
214	2025-05-13 18:15:47.640106	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
215	2025-05-13 18:15:47.949572	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
216	2025-05-13 18:16:40.906355	complete-execution	Iniciando conclusão da venda #264	{"userId": 7}
217	2025-05-13 18:16:41.026096	complete-execution	Prestadores ANTES da conclusão: 1	{"providers": [{"id": 111, "saleId": 264, "createdAt": "2025-05-13T18:16:40.382Z", "serviceProviderId": 1}]}
218	2025-05-13 18:16:41.350059	complete-execution	Prestadores APÓS a conclusão: 1	{"providers": [{"id": 112, "saleId": 264, "createdAt": "2025-05-13T18:16:41.138Z", "serviceProviderId": 1}]}
219	2025-05-13 18:22:36.444148	complete-execution	Iniciando conclusão da venda #216	{"userId": 7}
220	2025-05-13 18:22:36.579867	complete-execution	Prestadores ANTES da conclusão: 1	{"providers": [{"id": 113, "saleId": 216, "createdAt": "2025-05-13T18:22:36.067Z", "serviceProviderId": 1}]}
221	2025-05-13 18:22:36.985215	complete-execution	Prestadores APÓS a conclusão: 1	{"providers": [{"id": 114, "saleId": 216, "createdAt": "2025-05-13T18:22:36.745Z", "serviceProviderId": 1}]}
222	2025-05-13 18:23:14.786119	complete-execution	Iniciando conclusão da venda #214	{"userId": 7}
223	2025-05-13 18:23:14.968652	complete-execution	Prestadores ANTES da conclusão: 1	{"providers": [{"id": 117, "saleId": 214, "createdAt": "2025-05-13T18:23:14.112Z", "serviceProviderId": 1}]}
224	2025-05-13 18:23:15.475175	complete-execution	Prestadores APÓS a conclusão: 1	{"providers": [{"id": 118, "saleId": 214, "createdAt": "2025-05-13T18:23:15.137Z", "serviceProviderId": 1}]}
225	2025-05-13 18:23:19.745855	complete-execution	Iniciando conclusão da venda #214	{"userId": 7}
226	2025-05-13 18:23:21.606367	complete-execution	Iniciando conclusão da venda #214	{"userId": 7}
227	2025-05-13 18:28:03.611384	complete-execution	Iniciando conclusão da venda #219	{"userId": 7}
228	2025-05-13 18:28:03.745108	complete-execution	Prestadores ANTES da conclusão: 1	{"providers": [{"id": 121, "saleId": 219, "createdAt": "2025-05-13T18:28:03.220Z", "serviceProviderId": 2}]}
229	2025-05-13 18:28:04.313069	complete-execution	Prestadores APÓS a conclusão: 1	{"providers": [{"id": 122, "saleId": 219, "createdAt": "2025-05-13T18:28:03.892Z", "serviceProviderId": 2}]}
230	2025-05-13 18:47:30.477186	complete-execution	Iniciando conclusão da venda #226	{"userId": 7}
231	2025-05-13 18:47:30.62239	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
232	2025-05-13 18:47:30.911126	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
233	2025-05-13 19:15:49.598237	complete-execution	Iniciando conclusão da venda #190	{"userId": 7}
234	2025-05-13 19:15:49.719829	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
235	2025-05-13 19:15:49.999697	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
236	2025-05-13 19:17:16.592255	complete-execution	Iniciando conclusão da venda #182	{"userId": 7}
237	2025-05-13 19:17:16.856704	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
238	2025-05-13 19:17:17.38961	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
239	2025-05-13 19:18:17.862428	complete-execution	Iniciando conclusão da venda #222	{"userId": 7}
240	2025-05-13 19:18:17.983118	complete-execution	Prestadores ANTES da conclusão: 1	{"providers": [{"id": 123, "saleId": 222, "createdAt": "2025-05-13T19:18:15.397Z", "serviceProviderId": 1}]}
241	2025-05-13 19:18:18.444597	complete-execution	Prestadores APÓS a conclusão: 1	{"providers": [{"id": 124, "saleId": 222, "createdAt": "2025-05-13T19:18:18.097Z", "serviceProviderId": 1}]}
242	2025-05-13 19:19:15.864308	complete-execution	Iniciando conclusão da venda #205	{"userId": 7}
243	2025-05-13 19:19:15.979048	complete-execution	Prestadores ANTES da conclusão: 1	{"providers": [{"id": 125, "saleId": 205, "createdAt": "2025-05-13T19:19:15.346Z", "serviceProviderId": 1}]}
244	2025-05-13 19:19:16.310802	complete-execution	Prestadores APÓS a conclusão: 1	{"providers": [{"id": 126, "saleId": 205, "createdAt": "2025-05-13T19:19:16.086Z", "serviceProviderId": 1}]}
245	2025-05-13 19:36:01.612626	complete-execution	Iniciando conclusão da venda #220	{"userId": 7}
246	2025-05-13 19:36:01.794129	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
247	2025-05-13 19:36:02.510305	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
248	2025-05-13 19:38:21.455351	complete-execution	Iniciando conclusão da venda #186	{"userId": 7}
249	2025-05-13 19:38:21.566631	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
250	2025-05-13 19:38:21.974159	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
251	2025-05-13 19:40:40.918136	complete-execution	Iniciando conclusão da venda #191	{"userId": 7}
252	2025-05-13 19:40:41.051996	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
253	2025-05-13 19:40:41.449551	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
254	2025-05-13 21:02:58.093694	complete-execution	Iniciando conclusão da venda #158	{"userId": 7}
255	2025-05-13 21:02:58.528813	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
256	2025-05-13 21:02:59.369856	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
257	2025-05-13 21:19:07.745811	complete-execution	Iniciando conclusão da venda #238	{"userId": 7}
258	2025-05-13 21:19:08.27862	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
259	2025-05-13 21:19:08.881384	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
260	2025-05-14 14:16:44.032194	complete-execution	Iniciando conclusão da venda #189	{"userId": 7}
261	2025-05-14 14:16:44.21303	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
262	2025-05-14 14:16:44.637067	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
263	2025-05-14 14:17:14.614705	complete-execution	Iniciando conclusão da venda #188	{"userId": 7}
264	2025-05-14 14:17:14.78997	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
265	2025-05-14 14:17:15.158308	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
266	2025-05-14 14:17:48.322398	complete-execution	Iniciando conclusão da venda #187	{"userId": 7}
267	2025-05-14 14:17:48.431206	complete-execution	Prestadores ANTES da conclusão: 1	{"providers": [{"id": 127, "saleId": 187, "createdAt": "2025-05-14T14:17:47.984Z", "serviceProviderId": 3}]}
268	2025-05-14 14:17:48.944095	complete-execution	Prestadores APÓS a conclusão: 1	{"providers": [{"id": 128, "saleId": 187, "createdAt": "2025-05-14T14:17:48.538Z", "serviceProviderId": 3}]}
269	2025-05-14 14:19:45.861086	complete-execution	Iniciando conclusão da venda #167	{"userId": 7}
270	2025-05-14 14:19:45.980962	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
271	2025-05-14 14:19:46.327084	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
272	2025-05-14 14:20:22.270498	complete-execution	Iniciando conclusão da venda #162	{"userId": 7}
273	2025-05-14 14:20:22.49857	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
274	2025-05-14 14:20:22.951935	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
275	2025-05-14 14:21:55.285433	complete-execution	Iniciando conclusão da venda #361	{"userId": 7}
276	2025-05-14 14:21:55.433192	complete-execution	Prestadores ANTES da conclusão: 1	{"providers": [{"id": 131, "saleId": 361, "createdAt": "2025-05-14T14:21:54.902Z", "serviceProviderId": 3}]}
277	2025-05-14 14:21:55.829367	complete-execution	Prestadores APÓS a conclusão: 1	{"providers": [{"id": 132, "saleId": 361, "createdAt": "2025-05-14T14:21:55.554Z", "serviceProviderId": 3}]}
278	2025-05-14 14:22:57.465448	complete-execution	Iniciando conclusão da venda #362	{"userId": 7}
279	2025-05-14 14:22:57.567614	complete-execution	Prestadores ANTES da conclusão: 1	{"providers": [{"id": 135, "saleId": 362, "createdAt": "2025-05-14T14:22:57.128Z", "serviceProviderId": 1}]}
280	2025-05-14 14:22:58.022759	complete-execution	Prestadores APÓS a conclusão: 1	{"providers": [{"id": 136, "saleId": 362, "createdAt": "2025-05-14T14:22:57.668Z", "serviceProviderId": 1}]}
281	2025-05-14 14:24:39.186033	complete-execution	Iniciando conclusão da venda #352	{"userId": 7}
282	2025-05-14 14:24:39.297929	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
283	2025-05-14 14:24:39.572782	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
284	2025-05-14 14:28:45.584583	complete-execution	Iniciando conclusão da venda #343	{"userId": 7}
285	2025-05-14 14:28:45.728994	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
286	2025-05-14 14:28:46.230215	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
287	2025-05-14 14:30:31.199041	complete-execution	Iniciando conclusão da venda #327	{"userId": 7}
288	2025-05-14 14:30:31.336982	complete-execution	Prestadores ANTES da conclusão: 1	{"providers": [{"id": 137, "saleId": 327, "createdAt": "2025-05-14T14:30:29.377Z", "serviceProviderId": 1}]}
289	2025-05-14 14:30:31.725945	complete-execution	Prestadores APÓS a conclusão: 1	{"providers": [{"id": 138, "saleId": 327, "createdAt": "2025-05-14T14:30:31.484Z", "serviceProviderId": 1}]}
290	2025-05-14 14:31:13.275146	complete-execution	Iniciando conclusão da venda #344	{"userId": 7}
291	2025-05-14 14:31:13.431349	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
292	2025-05-14 14:31:13.960468	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
293	2025-05-14 14:32:04.412782	complete-execution	Iniciando conclusão da venda #353	{"userId": 7}
294	2025-05-14 14:32:04.719444	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
295	2025-05-14 14:32:05.170667	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
296	2025-05-14 14:32:46.173526	complete-execution	Iniciando conclusão da venda #322	{"userId": 7}
297	2025-05-14 14:32:46.326377	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
298	2025-05-14 14:32:46.825888	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
299	2025-05-14 14:34:38.017648	complete-execution	Iniciando conclusão da venda #146	{"userId": 7}
300	2025-05-14 14:34:38.124718	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
301	2025-05-14 14:34:38.400515	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
302	2025-05-14 14:34:41.922577	complete-execution	Iniciando conclusão da venda #146	{"userId": 7}
303	2025-05-14 14:34:43.629143	complete-execution	Iniciando conclusão da venda #146	{"userId": 7}
304	2025-05-14 14:35:51.135571	complete-execution	Iniciando conclusão da venda #179	{"userId": 7}
305	2025-05-14 14:35:51.252233	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
306	2025-05-14 14:35:51.57698	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
307	2025-05-14 14:37:11.608911	complete-execution	Iniciando conclusão da venda #178	{"userId": 7}
308	2025-05-14 14:37:11.777301	complete-execution	Prestadores ANTES da conclusão: 0	{"providers": []}
309	2025-05-14 14:37:12.283945	complete-execution	Prestadores APÓS a conclusão: 0	{"providers": []}
310	2025-05-14 14:38:37.52712	complete-execution	Iniciando conclusão da venda #141	{"userId": 7}
311	2025-05-14 14:38:37.655805	complete-execution	Prestadores ANTES da conclusão: 1	{"providers": [{"id": 139, "saleId": 141, "createdAt": "2025-05-14T14:38:37.178Z", "serviceProviderId": 2}]}
312	2025-05-14 14:38:38.010967	complete-execution	Prestadores APÓS a conclusão: 1	{"providers": [{"id": 140, "saleId": 141, "createdAt": "2025-05-14T14:38:37.779Z", "serviceProviderId": 2}]}
313	2025-05-14 14:39:42.789155	complete-execution	Iniciando conclusão da venda #142	{"userId": 7}
314	2025-05-14 14:39:42.898613	complete-execution	Prestadores ANTES da conclusão: 1	{"providers": [{"id": 141, "saleId": 142, "createdAt": "2025-05-14T14:39:42.462Z", "serviceProviderId": 1}]}
315	2025-05-14 14:39:43.477863	complete-execution	Prestadores APÓS a conclusão: 1	{"providers": [{"id": 142, "saleId": 142, "createdAt": "2025-05-14T14:39:43.137Z", "serviceProviderId": 1}]}
\.


--
-- Data for Name: payment_methods; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payment_methods (id, name, description, active, created_at) FROM stdin;
1	CARTAO		t	1746194276
2	PIX		t	1746194276
3	BOLETO		t	1746194276
\.


--
-- Data for Name: report_executions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.report_executions (id, report_id, user_id, parameters, execution_time, status, results, error_message, created_at, updated_at) FROM stdin;
1	2	2	{"endDate": "2025-05-31", "startDate": "2025-05-01"}	\N	error	\N	syntax error at or near ":"	2025-05-02 19:41:02.487335+00	2025-05-02 19:41:02.487335+00
2	2	2	{"endDate": "2025-05-31", "startDate": "2025-05-01"}	\N	error	\N	syntax error at or near ":"	2025-05-02 19:41:04.466981+00	2025-05-02 19:41:04.466981+00
3	2	2	{"endDate": "2025-05-31", "startDate": "2025-05-01"}	\N	error	\N	syntax error at or near ":"	2025-05-02 19:41:08.720476+00	2025-05-02 19:41:08.720476+00
4	2	2	{"endDate": "2025-05-31", "startDate": "2025-05-01"}	\N	error	\N	syntax error at or near ":"	2025-05-02 19:41:10.702042+00	2025-05-02 19:41:10.702042+00
5	5	2	{"endDate": "2025-05-31", "startDate": "2025-05-01"}	0.07508833399997093	completed	[]	\N	2025-05-02 19:41:33.295245+00	2025-05-02 19:41:33.295245+00
6	1	1	{"endDate": "2025-05-02", "startDate": "2025-05-01"}	0.06919320700000389	completed	[{"status": "pending", "quantidade": "3", "valor_medio": "1633.3333333333333333", "valor_total": "4900.00"}, {"status": "completed", "quantidade": "1", "valor_medio": "2500.0000000000000000", "valor_total": "2500.00"}, {"status": "in_progress", "quantidade": "1", "valor_medio": "350.0000000000000000", "valor_total": "350.00"}]	\N	2025-05-02 19:46:49.000611+00	2025-05-02 19:46:49.000611+00
7	2	2	{"endDate": "2025-05-02", "startDate": "2025-05-01"}	0.06108718700002646	completed	[{"id": 5, "date": "2025-05-02T00:00:00.000Z", "status": "in_progress", "cliente": "dasjhdjshdksj", "order_number": "1", "tipo_servico": "SINDICATO", "total_amount": "350.00", "financial_status": "pending"}, {"id": 7, "date": "2025-05-01T19:44:32.149Z", "status": "completed", "cliente": "dasjhdjshdksj", "order_number": "V-72149", "tipo_servico": "SINDICATO", "total_amount": "2500.00", "financial_status": "paid"}]	\N	2025-05-02 19:50:09.242749+00	2025-05-02 19:50:09.242749+00
8	3	1	{"endDate": "2025-05-02", "startDate": "2025-05-01"}	0.0673261829999974	completed	[{"id": 5, "date": "2025-05-02T00:00:00.000Z", "cliente": "dasjhdjshdksj", "vendedor": "vendedor", "valor_pago": "0", "order_number": "1", "total_amount": "350.00", "total_parcelas": "1", "valor_pendente": "350.00"}, {"id": 9, "date": "2025-05-02T00:00:00.000Z", "cliente": "dasjhdjshdksj", "vendedor": "supervisor", "valor_pago": "0", "order_number": "2", "total_amount": "400", "total_parcelas": "1", "valor_pendente": "400.00"}, {"id": 7, "date": "2025-05-01T19:44:32.149Z", "cliente": "dasjhdjshdksj", "vendedor": "vendedor", "valor_pago": "2500.00", "order_number": "V-72149", "total_amount": "2500.00", "total_parcelas": "1", "valor_pendente": "0"}]	\N	2025-05-02 19:55:54.298552+00	2025-05-02 19:55:54.298552+00
9	1	3	{}	0.058976022999995624	completed	[{"status": "pending", "quantidade": "3", "valor_medio": "1633.3333333333333333", "valor_total": "4900.00"}, {"status": "completed", "quantidade": "1", "valor_medio": "2500.0000000000000000", "valor_total": "2500.00"}, {"status": "in_progress", "quantidade": "1", "valor_medio": "350.0000000000000000", "valor_total": "350.00"}]	\N	2025-05-02 19:59:43.325631+00	2025-05-02 19:59:43.325631+00
10	1	3	{}	0.05903370799997356	completed	[{"status": "pending", "quantidade": "3", "valor_medio": "1633.3333333333333333", "valor_total": "4900.00"}, {"status": "completed", "quantidade": "1", "valor_medio": "2500.0000000000000000", "valor_total": "2500.00"}, {"status": "in_progress", "quantidade": "1", "valor_medio": "350.0000000000000000", "valor_total": "350.00"}]	\N	2025-05-02 20:05:00.787829+00	2025-05-02 20:05:00.787829+00
11	3	3	{}	\N	error	\N	syntax error at or near ":"	2025-05-02 20:10:38.762768+00	2025-05-02 20:10:38.762768+00
12	3	3	{}	\N	error	\N	syntax error at or near ":"	2025-05-02 20:10:40.826734+00	2025-05-02 20:10:40.826734+00
13	3	3	{}	\N	error	\N	syntax error at or near ":"	2025-05-02 20:10:46.715834+00	2025-05-02 20:10:46.715834+00
14	3	3	{}	\N	error	\N	syntax error at or near ":"	2025-05-02 20:10:48.815402+00	2025-05-02 20:10:48.815402+00
15	3	3	{}	\N	error	\N	syntax error at or near ":"	2025-05-02 20:10:53.537766+00	2025-05-02 20:10:53.537766+00
16	3	3	{}	\N	error	\N	syntax error at or near ":"	2025-05-02 20:10:55.585426+00	2025-05-02 20:10:55.585426+00
17	3	3	{}	\N	error	\N	syntax error at or near ":"	2025-05-02 20:12:23.788534+00	2025-05-02 20:12:23.788534+00
18	3	3	{}	\N	error	\N	syntax error at or near ":"	2025-05-02 20:12:25.811452+00	2025-05-02 20:12:25.811452+00
19	3	3	{}	\N	error	\N	syntax error at or near ":"	2025-05-02 20:12:32.179913+00	2025-05-02 20:12:32.179913+00
20	3	3	{}	\N	error	\N	syntax error at or near ":"	2025-05-02 20:12:34.215014+00	2025-05-02 20:12:34.215014+00
21	3	3	{}	\N	error	\N	syntax error at or near ":"	2025-05-02 20:13:35.42583+00	2025-05-02 20:13:35.42583+00
22	3	3	{}	\N	error	\N	syntax error at or near ":"	2025-05-02 20:13:37.494841+00	2025-05-02 20:13:37.494841+00
23	3	3	{"endDate": "2025-05-02", "startDate": "2025-05-01"}	\N	error	\N	syntax error at or near ":"	2025-05-02 20:15:51.716583+00	2025-05-02 20:15:51.716583+00
24	3	3	{"endDate": "2025-05-02", "startDate": "2025-05-01"}	\N	error	\N	syntax error at or near ":"	2025-05-02 20:15:53.786184+00	2025-05-02 20:15:53.786184+00
25	3	3	{"endDate": "2025-05-02", "startDate": "2025-05-01"}	0.06693392199999652	completed	[{"id": 5, "cliente": "dasjhdjshdksj", "vendedor": "vendedor", "data_venda": "02/05/2025", "valor_pago": "0", "valor_total": "350.00", "numero_pedido": "1", "total_parcelas": "1", "valor_pendente": "350.00", "datas_pagamentos": null, "parcelas_pendentes": "Parcela 1: 02/05/2025"}, {"id": 9, "cliente": "dasjhdjshdksj", "vendedor": "supervisor", "data_venda": "02/05/2025", "valor_pago": "0", "valor_total": "400", "numero_pedido": "2", "total_parcelas": "1", "valor_pendente": "400.00", "datas_pagamentos": null, "parcelas_pendentes": "Parcela 1: 02/05/2025"}, {"id": 7, "cliente": "dasjhdjshdksj", "vendedor": "vendedor", "data_venda": "01/05/2025", "valor_pago": "2500.00", "valor_total": "2500.00", "numero_pedido": "V-72149", "total_parcelas": "1", "valor_pendente": "0", "datas_pagamentos": "Parcela 1: Sem data", "parcelas_pendentes": null}]	\N	2025-05-02 20:16:54.807251+00	2025-05-02 20:16:54.807251+00
26	3	3	{"endDate": "2025-05-02", "startDate": "2025-05-01"}	0.058678753999993206	completed	[{"id": 10, "cliente": "dasjhdjshdksj", "vendedor": "vendedor", "data_venda": "02/05/2025", "valor_pago": "175.00", "valor_total": "350.00", "numero_pedido": "1", "total_parcelas": "2", "valor_pendente": "175.00", "datas_pagamentos": "Parcela 1: 05/02/2025", "parcelas_pendentes": "Parcela 2: 02/07/2025"}]	\N	2025-05-02 20:22:14.287811+00	2025-05-02 20:22:14.287811+00
27	3	3	{}	0.06138544399999955	completed	[]	\N	2025-05-02 20:23:52.770223+00	2025-05-02 20:23:52.770223+00
28	3	3	{"endDate": "2025-05-02", "startDate": "2025-05-01"}	0.05888138400000025	completed	[{"id": 10, "cliente": "dasjhdjshdksj", "vendedor": "vendedor", "data_venda": "02/05/2025", "valor_pago": "175.00", "valor_total": "350.00", "numero_pedido": "1", "total_parcelas": "2", "valor_pendente": "175.00", "datas_pagamentos": "Parcela 1: 05/02/2025", "parcelas_pendentes": "Parcela 2: 02/07/2025"}, {"id": 11, "cliente": "dasjhdjshdksj", "vendedor": "vendedor", "data_venda": "02/05/2025", "valor_pago": "116.67", "valor_total": "350.00", "numero_pedido": "2", "total_parcelas": "3", "valor_pendente": "233.34", "datas_pagamentos": "Parcela 1: 05/02/2025", "parcelas_pendentes": "Parcela 2: 02/07/2025, Parcela 3: 02/08/2025"}]	\N	2025-05-02 20:24:11.641304+00	2025-05-02 20:24:11.641304+00
29	3	3	{}	0.0582348639999982	completed	[]	\N	2025-05-02 20:25:57.515135+00	2025-05-02 20:25:57.515135+00
48	10	3	{"endDate": "2025-05-02", "startDate": "2025-05-01"}	\N	error	\N	function to_char(text, unknown) does not exist	2025-05-02 21:01:06.548499+00	2025-05-02 21:01:06.548499+00
49	10	3	{"endDate": "2025-05-02", "startDate": "2025-05-01"}	\N	error	\N	function to_char(text, unknown) does not exist	2025-05-02 21:01:08.566617+00	2025-05-02 21:01:08.566617+00
30	3	3	{"endDate": "2025-05-31", "startDate": "2025-05-01"}	0.06913452400000096	completed	[{"id": 10, "cliente": "dasjhdjshdksj", "vendedor": "vendedor", "data_venda": "02/05/2025", "valor_pago": "175.00", "valor_total": "350.00", "numero_pedido": "1", "total_parcelas": "2", "valor_pendente": "175.00", "datas_pagamentos": "Parcela 1: 05/02/2025", "parcelas_pendentes": "Parcela 2: 02/07/2025"}, {"id": 11, "cliente": "dasjhdjshdksj", "vendedor": "vendedor", "data_venda": "02/05/2025", "valor_pago": "350.01", "valor_total": "350.00", "numero_pedido": "2", "total_parcelas": "3", "valor_pendente": "0", "datas_pagamentos": "Parcela 1: 05/02/2025, Parcela 2: 05/02/2025, Parcela 3: 05/03/2025", "parcelas_pendentes": null}]	\N	2025-05-02 20:26:08.583746+00	2025-05-02 20:26:08.583746+00
31	1	3	{}	0.06055383799999981	completed	[{"status": "pending", "quantidade": "1", "valor_medio": "350.0000000000000000", "valor_total": "350.00"}, {"status": "in_progress", "quantidade": "1", "valor_medio": "350.0000000000000000", "valor_total": "350.00"}]	\N	2025-05-02 20:28:50.728705+00	2025-05-02 20:28:50.728705+00
32	3	3	{"endDate": "2025-05-02", "startDate": "2025-05-01"}	0.05947468300000037	completed	[{"id": 10, "cliente": "dasjhdjshdksj", "vendedor": "vendedor", "data_venda": "02/05/2025", "valor_pago": "175.00", "valor_total": "350.00", "numero_pedido": "1", "total_parcelas": "2", "valor_pendente": "175.00", "datas_pagamentos": "Parcela 1: 05/02/2025", "parcelas_pendentes": "Parcela 2: 02/07/2025"}, {"id": 11, "cliente": "dasjhdjshdksj", "vendedor": "vendedor", "data_venda": "02/05/2025", "valor_pago": "350.01", "valor_total": "350.00", "numero_pedido": "2", "total_parcelas": "3", "valor_pendente": "0", "datas_pagamentos": "Parcela 1: 05/02/2025, Parcela 2: 05/02/2025, Parcela 3: 05/03/2025", "parcelas_pendentes": null}]	\N	2025-05-02 20:46:39.325793+00	2025-05-02 20:46:39.325793+00
33	3	1	{"endDate": "2025-05-02", "startDate": "2025-05-01"}	0.05898055400000885	completed	[{"id": 10, "cliente": "dasjhdjshdksj", "vendedor": "vendedor", "data_venda": "02/05/2025", "valor_pago": "175.00", "valor_total": "350.00", "numero_pedido": "1", "total_parcelas": "2", "valor_pendente": "175.00", "datas_pagamentos": "Parcela 1: 05/02/2025", "parcelas_pendentes": "Parcela 2: 02/07/2025"}, {"id": 11, "cliente": "dasjhdjshdksj", "vendedor": "vendedor", "data_venda": "02/05/2025", "valor_pago": "350.01", "valor_total": "350.00", "numero_pedido": "2", "total_parcelas": "3", "valor_pendente": "0", "datas_pagamentos": "Parcela 1: 05/02/2025, Parcela 2: 05/02/2025, Parcela 3: 05/03/2025", "parcelas_pendentes": null}]	\N	2025-05-02 20:48:44.287229+00	2025-05-02 20:48:44.287229+00
34	7	3	{}	0.057304903999989616	completed	[]	\N	2025-05-02 20:49:27.838265+00	2025-05-02 20:49:27.838265+00
35	10	3	{"endDate": "2025-05-02", "startDate": "2025-05-01"}	0.05784559399999853	completed	[]	\N	2025-05-02 20:49:44.154505+00	2025-05-02 20:49:44.154505+00
36	10	3	{"endDate": "2025-05-02", "startDate": "2025-05-01"}	0.06588592199998675	completed	[]	\N	2025-05-02 20:51:24.503447+00	2025-05-02 20:51:24.503447+00
37	11	3	{"endDate": "2025-05-02", "startDate": "2025-05-01"}	0.069831371999986	completed	[{"cliente": "dasjhdjshdksj", "data_venda": "02/05/2025", "valor_bruto": "350.00", "qtd_parcelas": "2", "status_venda": "in_progress", "total_custos": "100.00", "ordem_servico": "1", "lucro_estimado": "250.00", "parcelas_pagas": "1", "valor_recebido": "175.00", "lucro_realizado": "75.00", "margem_percentual": "71.43", "status_financeiro": "in_progress"}, {"cliente": "dasjhdjshdksj", "data_venda": "02/05/2025", "valor_bruto": "350.00", "qtd_parcelas": "3", "status_venda": "pending", "total_custos": "500.00", "ordem_servico": "2", "lucro_estimado": "-150.00", "parcelas_pagas": "3", "valor_recebido": "350.01", "lucro_realizado": "-149.99", "margem_percentual": "-42.86", "status_financeiro": "paid"}]	\N	2025-05-02 20:51:52.467634+00	2025-05-02 20:51:52.467634+00
38	10	1	{"endDate": "2025-05-03", "startDate": "2025-05-01"}	0.06514571300003445	completed	[{"cliente": "dasjhdjshdksj", "vendedor": "vendedor", "data_venda": "02/05/2025", "ordem_servico": "1", "valor_parcela": "175.00", "data_pagamento": "02/05/2025", "numero_parcela": 1, "status_parcela": "paid", "data_vencimento": "02/06/2025", "metodo_pagamento": "CARTAO", "status_financeiro_venda": "in_progress"}, {"cliente": "dasjhdjshdksj", "vendedor": "vendedor", "data_venda": "02/05/2025", "ordem_servico": "1", "valor_parcela": "175.00", "data_pagamento": "", "numero_parcela": 2, "status_parcela": "pending", "data_vencimento": "02/07/2025", "metodo_pagamento": "CARTAO", "status_financeiro_venda": "in_progress"}, {"cliente": "dasjhdjshdksj", "vendedor": "vendedor", "data_venda": "02/05/2025", "ordem_servico": "2", "valor_parcela": "116.67", "data_pagamento": "02/05/2025", "numero_parcela": 1, "status_parcela": "paid", "data_vencimento": "02/06/2025", "metodo_pagamento": "CARTAO", "status_financeiro_venda": "paid"}, {"cliente": "dasjhdjshdksj", "vendedor": "vendedor", "data_venda": "02/05/2025", "ordem_servico": "2", "valor_parcela": "116.67", "data_pagamento": "02/05/2025", "numero_parcela": 2, "status_parcela": "paid", "data_vencimento": "02/07/2025", "metodo_pagamento": "CARTAO", "status_financeiro_venda": "paid"}, {"cliente": "dasjhdjshdksj", "vendedor": "vendedor", "data_venda": "02/05/2025", "ordem_servico": "2", "valor_parcela": "116.67", "data_pagamento": "03/05/2025", "numero_parcela": 3, "status_parcela": "paid", "data_vencimento": "02/08/2025", "metodo_pagamento": "CARTAO", "status_financeiro_venda": "paid"}]	\N	2025-05-02 20:54:35.963211+00	2025-05-02 20:54:35.963211+00
39	11	3	{"endDate": "2025-05-02", "startDate": "2025-05-01"}	0.0588977040000027	completed	[{"cliente": "dasjhdjshdksj", "data_venda": "02/05/2025", "valor_bruto": "350.00", "qtd_parcelas": "2", "status_venda": "in_progress", "total_custos": "100.00", "ordem_servico": "1", "lucro_estimado": "250.00", "parcelas_pagas": "1", "valor_recebido": "175.00", "lucro_realizado": "75.00", "margem_percentual": "71.43", "status_financeiro": "in_progress"}, {"cliente": "dasjhdjshdksj", "data_venda": "02/05/2025", "valor_bruto": "350.00", "qtd_parcelas": "3", "status_venda": "pending", "total_custos": "500.00", "ordem_servico": "2", "lucro_estimado": "-150.00", "parcelas_pagas": "3", "valor_recebido": "350.01", "lucro_realizado": "-149.99", "margem_percentual": "-42.86", "status_financeiro": "paid"}]	\N	2025-05-02 20:56:56.300782+00	2025-05-02 20:56:56.300782+00
40	10	3	{"endDate": "2025-05-02", "startDate": "2025-05-01"}	\N	error	\N	UNION types text and date cannot be matched	2025-05-02 20:57:52.014142+00	2025-05-02 20:57:52.014142+00
41	10	3	{"endDate": "2025-05-02", "startDate": "2025-05-01"}	\N	error	\N	UNION types text and date cannot be matched	2025-05-02 20:57:53.755566+00	2025-05-02 20:57:53.755566+00
42	10	3	{"endDate": "2025-05-02", "startDate": "2025-05-01"}	\N	error	\N	UNION types text and date cannot be matched	2025-05-02 20:57:59.750624+00	2025-05-02 20:57:59.750624+00
43	10	3	{"endDate": "2025-05-02", "startDate": "2025-05-01"}	\N	error	\N	UNION types text and date cannot be matched	2025-05-02 20:58:01.411279+00	2025-05-02 20:58:01.411279+00
44	10	3	{"endDate": "2025-05-02", "startDate": "2025-05-01"}	\N	error	\N	function to_char(text, unknown) does not exist	2025-05-02 20:59:49.41425+00	2025-05-02 20:59:49.41425+00
45	10	3	{"endDate": "2025-05-02", "startDate": "2025-05-01"}	\N	error	\N	function to_char(text, unknown) does not exist	2025-05-02 20:59:51.435728+00	2025-05-02 20:59:51.435728+00
46	10	3	{"endDate": "2025-05-02", "startDate": "2025-05-01"}	\N	error	\N	function to_char(text, unknown) does not exist	2025-05-02 20:59:57.382455+00	2025-05-02 20:59:57.382455+00
47	10	3	{"endDate": "2025-05-02", "startDate": "2025-05-01"}	\N	error	\N	function to_char(text, unknown) does not exist	2025-05-02 20:59:59.064358+00	2025-05-02 20:59:59.064358+00
50	10	1	{"endDate": "2025-05-02", "startDate": "2025-05-01"}	\N	error	\N	column reference "status" is ambiguous	2025-05-02 21:03:15.148134+00	2025-05-02 21:03:15.148134+00
51	10	1	{"endDate": "2025-05-02", "startDate": "2025-05-01"}	\N	error	\N	column reference "status" is ambiguous	2025-05-02 21:03:17.203475+00	2025-05-02 21:03:17.203475+00
52	10	1	{"endDate": "2025-05-02", "startDate": "2025-05-01"}	\N	error	\N	column reference "status" is ambiguous	2025-05-02 21:03:21.299982+00	2025-05-02 21:03:21.299982+00
53	10	1	{"endDate": "2025-05-02", "startDate": "2025-05-01"}	\N	error	\N	column reference "status" is ambiguous	2025-05-02 21:03:23.388312+00	2025-05-02 21:03:23.388312+00
54	10	3	{"endDate": "2025-05-02", "startDate": "2025-05-01"}	0.06576922899996862	completed	[{"valor": "100.00", "cliente": "dasjhdjshdksj", "descricao": "TAXA SINDICAL", "data_venda": "02/05/2025", "responsavel": "admin", "data_prevista": "02/05/2025", "ordem_servico": "1", "data_pagamento": "", "tipo_transacao": "DESPESA", "metodo_pagamento": "CARTAO", "status_transacao": "pending", "status_financeiro": "in_progress"}, {"valor": "175.00", "cliente": "dasjhdjshdksj", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "vendedor", "data_prevista": "02/06/2025", "ordem_servico": "1", "data_pagamento": "02/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "CARTAO", "status_transacao": "paid", "status_financeiro": "in_progress"}, {"valor": "175.00", "cliente": "dasjhdjshdksj", "descricao": "Parcela 2", "data_venda": "02/05/2025", "responsavel": "vendedor", "data_prevista": "02/07/2025", "ordem_servico": "1", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "CARTAO", "status_transacao": "pending", "status_financeiro": "in_progress"}, {"valor": "200.00", "cliente": "dasjhdjshdksj", "descricao": "TAXA SINDICAL", "data_venda": "02/05/2025", "responsavel": "financeiro", "data_prevista": "02/05/2025", "ordem_servico": "2", "data_pagamento": "02/05/2025", "tipo_transacao": "DESPESA", "metodo_pagamento": "CARTAO", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "300.00", "cliente": "dasjhdjshdksj", "descricao": "TAXA SINDICAL", "data_venda": "02/05/2025", "responsavel": "financeiro", "data_prevista": "02/05/2025", "ordem_servico": "2", "data_pagamento": "03/05/2025", "tipo_transacao": "DESPESA", "metodo_pagamento": "CARTAO", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "116.67", "cliente": "dasjhdjshdksj", "descricao": "Parcela 2", "data_venda": "02/05/2025", "responsavel": "vendedor", "data_prevista": "02/07/2025", "ordem_servico": "2", "data_pagamento": "02/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "CARTAO", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "116.67", "cliente": "dasjhdjshdksj", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "vendedor", "data_prevista": "02/06/2025", "ordem_servico": "2", "data_pagamento": "02/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "CARTAO", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "116.67", "cliente": "dasjhdjshdksj", "descricao": "Parcela 3", "data_venda": "02/05/2025", "responsavel": "vendedor", "data_prevista": "02/08/2025", "ordem_servico": "2", "data_pagamento": "03/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "CARTAO", "status_transacao": "paid", "status_financeiro": "paid"}]	\N	2025-05-02 21:04:23.346779+00	2025-05-02 21:04:23.346779+00
55	10	3	{"endDate": "2025-05-02", "startDate": "2025-05-01"}	0.05868480099993758	completed	[{"valor": "100.00", "cliente": "dasjhdjshdksj", "descricao": "TAXA SINDICAL", "data_venda": "02/05/2025", "responsavel": "financeiro", "data_prevista": "02/05/2025", "ordem_servico": "1", "data_pagamento": "02/05/2025", "tipo_transacao": "DESPESA", "metodo_pagamento": "CARTAO", "status_transacao": "paid", "status_financeiro": "in_progress"}, {"valor": "175.00", "cliente": "dasjhdjshdksj", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "vendedor", "data_prevista": "02/06/2025", "ordem_servico": "1", "data_pagamento": "02/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "CARTAO", "status_transacao": "paid", "status_financeiro": "in_progress"}, {"valor": "175.00", "cliente": "dasjhdjshdksj", "descricao": "Parcela 2", "data_venda": "02/05/2025", "responsavel": "vendedor", "data_prevista": "02/07/2025", "ordem_servico": "1", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "CARTAO", "status_transacao": "pending", "status_financeiro": "in_progress"}, {"valor": "300.00", "cliente": "dasjhdjshdksj", "descricao": "TAXA SINDICAL", "data_venda": "02/05/2025", "responsavel": "financeiro", "data_prevista": "02/05/2025", "ordem_servico": "2", "data_pagamento": "03/05/2025", "tipo_transacao": "DESPESA", "metodo_pagamento": "CARTAO", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "200.00", "cliente": "dasjhdjshdksj", "descricao": "TAXA SINDICAL", "data_venda": "02/05/2025", "responsavel": "financeiro", "data_prevista": "02/05/2025", "ordem_servico": "2", "data_pagamento": "02/05/2025", "tipo_transacao": "DESPESA", "metodo_pagamento": "CARTAO", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "116.67", "cliente": "dasjhdjshdksj", "descricao": "Parcela 2", "data_venda": "02/05/2025", "responsavel": "vendedor", "data_prevista": "02/07/2025", "ordem_servico": "2", "data_pagamento": "02/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "CARTAO", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "116.67", "cliente": "dasjhdjshdksj", "descricao": "Parcela 3", "data_venda": "02/05/2025", "responsavel": "vendedor", "data_prevista": "02/08/2025", "ordem_servico": "2", "data_pagamento": "03/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "CARTAO", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "116.67", "cliente": "dasjhdjshdksj", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "vendedor", "data_prevista": "02/06/2025", "ordem_servico": "2", "data_pagamento": "02/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "CARTAO", "status_transacao": "paid", "status_financeiro": "paid"}]	\N	2025-05-02 21:06:37.142417+00	2025-05-02 21:06:37.142417+00
56	9	1	{"endDate": "2025-05-02", "startDate": "2025-05-01"}	0.06588763100001961	completed	[{"id": 10, "cliente": "dasjhdjshdksj", "vendedor": "vendedor", "data_venda": "02/05/2025", "qtd_custos": "1", "valor_pago": "175.00", "valor_total": "350.00", "qtd_parcelas": "2", "status_venda": "in_progress", "total_custos": "100.00", "ordem_servico": "1", "parcelas_pagas": "1", "valor_pendente": "175.00", "metodo_pagamento": "CARTAO", "ultimo_pagamento": "02/05/2025", "status_financeiro": "in_progress", "parcelas_pendentes": "1"}, {"id": 11, "cliente": "dasjhdjshdksj", "vendedor": "vendedor", "data_venda": "02/05/2025", "qtd_custos": "2", "valor_pago": "350.01", "valor_total": "350.00", "qtd_parcelas": "3", "status_venda": "pending", "total_custos": "500.00", "ordem_servico": "2", "parcelas_pagas": "3", "valor_pendente": null, "metodo_pagamento": "CARTAO", "ultimo_pagamento": "03/05/2025", "status_financeiro": "paid", "parcelas_pendentes": "0"}]	\N	2025-05-02 21:07:22.464011+00	2025-05-02 21:07:22.464011+00
57	10	1	{"endDate": "2025-05-02", "startDate": "2025-05-01"}	0.059444402000051924	completed	[{"valor": "100.00", "cliente": "dasjhdjshdksj", "descricao": "TAXA SINDICAL", "data_venda": "02/05/2025", "responsavel": "financeiro", "data_prevista": "02/05/2025", "ordem_servico": "1", "data_pagamento": "02/05/2025", "tipo_transacao": "DESPESA", "metodo_pagamento": "CARTAO", "status_transacao": "paid", "status_financeiro": "in_progress"}, {"valor": "175.00", "cliente": "dasjhdjshdksj", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "vendedor", "data_prevista": "02/06/2025", "ordem_servico": "1", "data_pagamento": "02/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "CARTAO", "status_transacao": "paid", "status_financeiro": "in_progress"}, {"valor": "175.00", "cliente": "dasjhdjshdksj", "descricao": "Parcela 2", "data_venda": "02/05/2025", "responsavel": "vendedor", "data_prevista": "02/07/2025", "ordem_servico": "1", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "CARTAO", "status_transacao": "pending", "status_financeiro": "in_progress"}, {"valor": "300.00", "cliente": "dasjhdjshdksj", "descricao": "TAXA SINDICAL", "data_venda": "02/05/2025", "responsavel": "financeiro", "data_prevista": "02/05/2025", "ordem_servico": "2", "data_pagamento": "03/05/2025", "tipo_transacao": "DESPESA", "metodo_pagamento": "CARTAO", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "200.00", "cliente": "dasjhdjshdksj", "descricao": "TAXA SINDICAL", "data_venda": "02/05/2025", "responsavel": "financeiro", "data_prevista": "02/05/2025", "ordem_servico": "2", "data_pagamento": "02/05/2025", "tipo_transacao": "DESPESA", "metodo_pagamento": "CARTAO", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "116.67", "cliente": "dasjhdjshdksj", "descricao": "Parcela 2", "data_venda": "02/05/2025", "responsavel": "vendedor", "data_prevista": "02/07/2025", "ordem_servico": "2", "data_pagamento": "02/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "CARTAO", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "116.67", "cliente": "dasjhdjshdksj", "descricao": "Parcela 3", "data_venda": "02/05/2025", "responsavel": "vendedor", "data_prevista": "02/08/2025", "ordem_servico": "2", "data_pagamento": "03/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "CARTAO", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "116.67", "cliente": "dasjhdjshdksj", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "vendedor", "data_prevista": "02/06/2025", "ordem_servico": "2", "data_pagamento": "02/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "CARTAO", "status_transacao": "paid", "status_financeiro": "paid"}]	\N	2025-05-02 21:21:59.143567+00	2025-05-02 21:21:59.143567+00
58	4	1	{"endDate": "2025-05-09", "startDate": "2025-05-01"}	0.07498967300000003	completed	[{"id": 14, "date": "2025-05-05T00:00:00.000Z", "cliente": "dasjhdjshdksj", "prestador": null, "qtd_itens": "2", "order_number": "1", "tipo_servico": "CERTIFICADO DIGITAL"}, {"id": 15, "date": "2025-05-05T00:00:00.000Z", "cliente": "dasjhdjshdksj", "prestador": null, "qtd_itens": "2", "order_number": "2", "tipo_servico": "GOV"}, {"id": 16, "date": "2025-05-05T00:00:00.000Z", "cliente": "dasjhdjshdksj", "prestador": "MARIO", "qtd_itens": "2", "order_number": "3", "tipo_servico": "SINDICATO"}, {"id": 17, "date": "2025-05-05T00:00:00.000Z", "cliente": "dasjhdjshdksj", "prestador": null, "qtd_itens": "1", "order_number": "5", "tipo_servico": "SINDICATO"}]	\N	2025-05-05 16:35:46.569298+00	2025-05-05 16:35:46.569298+00
59	8	1	{}	0.028838303000666202	completed	[]	\N	2025-05-05 20:35:10.547167+00	2025-05-05 20:35:10.547167+00
60	1	1	{"endDate": "2025-05-05", "startDate": "2025-05-05"}	0.0316007369980216	completed	[{"status": "completed", "quantidade": "44", "valor_medio": "539.0909090909090909", "valor_total": "23720.00"}, {"status": "pending", "quantidade": "36", "valor_medio": "461.6666666666666667", "valor_total": "16620.00"}, {"status": "returned", "quantidade": "1", "valor_medio": "500.0000000000000000", "valor_total": "500.00"}]	\N	2025-05-07 18:51:34.540085+00	2025-05-07 18:51:34.540085+00
61	7	1	{"endDate": "2025-05-05", "startDate": "2025-05-05"}	0.022960914000868797	completed	[{"id": 110, "status": "returned", "cliente": " R. &. F. COMERCIO E SERVICOS S.A. - EM RECUPERACAO JUDICIAL", "vendedor": "mathiely", "data_venda": "05/05/2025", "valor_total": "500.00", "tipo_servico": "SINDICATO", "ordem_servico": "533659", "status_financeiro": "pending"}, {"id": 48, "status": "completed", "cliente": "VAGNO SEIXAS DE OLIVEIRA", "vendedor": "dafni", "data_venda": "05/05/2025", "valor_total": "450.00", "tipo_servico": "OPERACIONAL", "ordem_servico": "90371", "status_financeiro": "paid"}, {"id": 50, "status": "completed", "cliente": "JOSE DOS SANTOS", "vendedor": "larissa", "data_venda": "05/05/2025", "valor_total": "350.00", "tipo_servico": "OPERACIONAL", "ordem_servico": "0202025", "status_financeiro": "pending"}, {"id": 52, "status": "completed", "cliente": "ARY SOUZA BORGES", "vendedor": "larissa", "data_venda": "05/05/2025", "valor_total": "250.00", "tipo_servico": "OPERACIONAL", "ordem_servico": "0202026", "status_financeiro": "pending"}, {"id": 55, "status": "completed", "cliente": "ELISIO MILTON KRUG", "vendedor": "larissa", "data_venda": "05/05/2025", "valor_total": "750.00", "tipo_servico": "OPERACIONAL", "ordem_servico": "0202027", "status_financeiro": "paid"}, {"id": 56, "status": "completed", "cliente": "DANIEL DALBOSCO", "vendedor": "larissa", "data_venda": "05/05/2025", "valor_total": "650.00", "tipo_servico": "OPERACIONAL", "ordem_servico": "0202028", "status_financeiro": "paid"}, {"id": 62, "status": "completed", "cliente": "MARCFREIRE TRANSPORTES LTDA", "vendedor": "jessica priscila", "data_venda": "05/05/2025", "valor_total": "750.00", "tipo_servico": "SINDICATO", "ordem_servico": "1235997", "status_financeiro": "paid"}, {"id": 63, "status": "completed", "cliente": "WM SERVICES LTDA", "vendedor": "jessica priscila", "data_venda": "05/05/2025", "valor_total": "350.00", "tipo_servico": "SINDICATO", "ordem_servico": "1235999", "status_financeiro": "paid"}, {"id": 66, "status": "completed", "cliente": "ETC - Transmaria Agregados Ltda", "vendedor": "jessica priscila", "data_venda": "05/05/2025", "valor_total": "0", "tipo_servico": "OPERACIONAL", "ordem_servico": "1236001", "status_financeiro": "pending"}, {"id": 67, "status": "completed", "cliente": " SARA TRANSPORTES LTDA", "vendedor": "jessica priscila", "data_venda": "05/05/2025", "valor_total": "350.00", "tipo_servico": "SINDICATO", "ordem_servico": "1236002", "status_financeiro": "paid"}, {"id": 119, "status": "completed", "cliente": "BONA FIDE TRANSPORTE LTDA", "vendedor": "paola", "data_venda": "05/05/2025", "valor_total": "200.00", "tipo_servico": "CERTIFICADO DIGITAL", "ordem_servico": "642704", "status_financeiro": "pending"}, {"id": 96, "status": "completed", "cliente": "MARCIO JASON CORREA", "vendedor": "angelica", "data_venda": "05/05/2025", "valor_total": "500.00", "tipo_servico": "CERTIFICADO DIGITAL", "ordem_servico": "1001561", "status_financeiro": "pending"}, {"id": 98, "status": "completed", "cliente": "KEURIANY DE ALMEIDA MORAIS 04961592161", "vendedor": "mathiely", "data_venda": "05/05/2025", "valor_total": "450.00", "tipo_servico": "SINDICATO", "ordem_servico": "533648", "status_financeiro": "pending"}, {"id": 99, "status": "pending", "cliente": "ISMAIL JOSE FERREIRA", "vendedor": "mathiely", "data_venda": "05/05/2025", "valor_total": "600.00", "tipo_servico": "SINDICATO", "ordem_servico": "533649", "status_financeiro": "pending"}, {"id": 100, "status": "pending", "cliente": " JOSE SILVIO COSTA DE OLIVEIRA", "vendedor": "mathiely", "data_venda": "05/05/2025", "valor_total": "450.00", "tipo_servico": "GOV", "ordem_servico": "533650", "status_financeiro": "pending"}, {"id": 101, "status": "pending", "cliente": "BRUNO HENRIQUE PEREIRA DA SILVA ", "vendedor": "mathiely", "data_venda": "05/05/2025", "valor_total": "250.00", "tipo_servico": "OPERACIONAL", "ordem_servico": "533651", "status_financeiro": "pending"}, {"id": 102, "status": "pending", "cliente": " PRISCILA BENTO DIAS", "vendedor": "mathiely", "data_venda": "05/05/2025", "valor_total": "100.00", "tipo_servico": "OPERACIONAL", "ordem_servico": "533652", "status_financeiro": "pending"}, {"id": 103, "status": "pending", "cliente": "RAFAEL BENTO DE SOUSA SENA ", "vendedor": "mathiely", "data_venda": "05/05/2025", "valor_total": "300.00", "tipo_servico": "OPERACIONAL", "ordem_servico": "533653", "status_financeiro": "pending"}, {"id": 104, "status": "pending", "cliente": "VALTEIR ALVES DA SILVA", "vendedor": "mathiely", "data_venda": "05/05/2025", "valor_total": "350.00", "tipo_servico": "OPERACIONAL", "ordem_servico": "533654", "status_financeiro": "pending"}, {"id": 105, "status": "pending", "cliente": "A M PRADO TRANSPORTES LTDA", "vendedor": "mathiely", "data_venda": "05/05/2025", "valor_total": "50.00", "tipo_servico": "OPERACIONAL", "ordem_servico": "533655", "status_financeiro": "pending"}, {"id": 106, "status": "pending", "cliente": "M A ELIAS CONSERVADORA LTDA", "vendedor": "mathiely", "data_venda": "05/05/2025", "valor_total": "350.00", "tipo_servico": "SINDICATO", "ordem_servico": "533656", "status_financeiro": "pending"}, {"id": 107, "status": "pending", "cliente": "THAIS CONCEICAO SANTOS NASCIMENTO", "vendedor": "mathiely", "data_venda": "05/05/2025", "valor_total": "300.00", "tipo_servico": "OPERACIONAL", "ordem_servico": "533657", "status_financeiro": "pending"}, {"id": 108, "status": "pending", "cliente": "MILTON BENINI", "vendedor": "mathiely", "data_venda": "05/05/2025", "valor_total": "200.00", "tipo_servico": "OPERACIONAL", "ordem_servico": "533658", "status_financeiro": "pending"}, {"id": 111, "status": "pending", "cliente": " HOPE TRANSPORTES LTDA", "vendedor": "mathiely", "data_venda": "05/05/2025", "valor_total": "500.00", "tipo_servico": "SINDICATO", "ordem_servico": "533660", "status_financeiro": "in_progress"}, {"id": 113, "status": "completed", "cliente": " FLAVIANO MARCOS RIBEIRO", "vendedor": "luana", "data_venda": "05/05/2025", "valor_total": "50.00", "tipo_servico": "OPERACIONAL", "ordem_servico": "881010294", "status_financeiro": "pending"}, {"id": 114, "status": "completed", "cliente": "BHDG TRANSPORTE E COMERCIO DE METAIS LTDA", "vendedor": "luana", "data_venda": "05/05/2025", "valor_total": "50.00", "tipo_servico": "OPERACIONAL", "ordem_servico": "881010295", "status_financeiro": "in_progress"}, {"id": 115, "status": "completed", "cliente": "FELIPE LUCIANO FRANCESCATTO", "vendedor": "luana", "data_venda": "05/05/2025", "valor_total": "250.00", "tipo_servico": "OPERACIONAL", "ordem_servico": "881010299", "status_financeiro": "in_progress"}, {"id": 116, "status": "completed", "cliente": "JOÃO GUSTAVO SIGOLO DE OLIVEIRA ", "vendedor": "paola", "data_venda": "05/05/2025", "valor_total": "500.00", "tipo_servico": "SINDICATO", "ordem_servico": "642700", "status_financeiro": "pending"}, {"id": 118, "status": "completed", "cliente": " MSC TRANSPORTES LTDA", "vendedor": "paola", "data_venda": "05/05/2025", "valor_total": "450.00", "tipo_servico": "CERTIFICADO DIGITAL", "ordem_servico": "642702", "status_financeiro": "pending"}, {"id": 123, "status": "completed", "cliente": "JOSE RICARDO LOPES DUARTE ", "vendedor": "paola", "data_venda": "05/05/2025", "valor_total": "300.00", "tipo_servico": "SINDICATO", "ordem_servico": "642707", "status_financeiro": "in_progress"}, {"id": 150, "status": "pending", "cliente": "BRAVO LOCACAO E MANUTENCAO DE EQUIPAMENTOS LTDA", "vendedor": "gustavo", "data_venda": "05/05/2025", "valor_total": "510.00", "tipo_servico": "SINDICATO", "ordem_servico": "5603663", "status_financeiro": "pending"}, {"id": 159, "status": "pending", "cliente": " ALEX SANDRO VALEJO EVES", "vendedor": "gustavo", "data_venda": "05/05/2025", "valor_total": "350.00", "tipo_servico": "SINDICATO", "ordem_servico": "5603664", "status_financeiro": "pending"}, {"id": 160, "status": "pending", "cliente": "45.233.297 WALDECIR BES", "vendedor": "gustavo", "data_venda": "05/05/2025", "valor_total": "350.00", "tipo_servico": "SINDICATO", "ordem_servico": "5603666", "status_financeiro": "pending"}, {"id": 161, "status": "pending", "cliente": "VALDEILSON DOURADO DA SILVA TRANSPORTES", "vendedor": "gustavo", "data_venda": "05/05/2025", "valor_total": "510.00", "tipo_servico": "SINDICATO", "ordem_servico": "5603667", "status_financeiro": "pending"}]	\N	2025-05-07 18:52:16.890905+00	2025-05-07 18:52:16.890905+00
62	10	1	{"endDate": "2025-05-02", "startDate": "2025-05-02"}	0.023725104998797177	completed	[{"valor": "581.00", "cliente": "60.591.516 CAMONGE DELFINO DOS SANTOS", "descricao": "TAXA SINDICAL", "data_venda": "02/05/2025", "responsavel": "jack", "data_prevista": "06/05/2025", "ordem_servico": "0202024", "data_pagamento": "05/05/2025", "tipo_transacao": "DESPESA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "80.00", "cliente": "60.591.516 CAMONGE DELFINO DOS SANTOS", "descricao": "TAXA SINDICAL", "data_venda": "02/05/2025", "responsavel": "jack", "data_prevista": "06/05/2025", "ordem_servico": "0202024", "data_pagamento": "05/05/2025", "tipo_transacao": "DESPESA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "1250.00", "cliente": "60.591.516 CAMONGE DELFINO DOS SANTOS", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "larissa", "data_prevista": "06/05/2025", "ordem_servico": "0202024", "data_pagamento": "02/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "750.00", "cliente": "IN GLOW BRASIL INTERMEDIACAO DE NEGOCIOS LTDA", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "angelica", "data_prevista": "06/05/2025", "ordem_servico": "1001558", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "BOLETO", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "110.00", "cliente": " PASMEC TRANSPORTES E CONFECCOES LTDA", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "jessica priscila", "data_prevista": "06/05/2025", "ordem_servico": "1235986", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "1390.00", "cliente": "AUTO SOCORRO MARACANA LTDA", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "jessica priscila", "data_prevista": "06/05/2025", "ordem_servico": "1235992", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "CARTAO", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "650.00", "cliente": "MARCELO RIBEIRO GOZZO ", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "jessica priscila", "data_prevista": "06/05/2025", "ordem_servico": "1235993", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "CARTAO", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "750.00", "cliente": " MARTINS COMERCIO DE VERDURAS LTDA", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "jessica priscila", "data_prevista": "06/05/2025", "ordem_servico": "1235994", "data_pagamento": "02/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "266.00", "cliente": "MOREL TRANSPORTES", "descricao": "TAXA SINDICAL", "data_venda": "02/05/2025", "responsavel": "jack", "data_prevista": "07/05/2025", "ordem_servico": "1235995", "data_pagamento": "", "tipo_transacao": "DESPESA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "paid"}, {"valor": "350.00", "cliente": "MOREL TRANSPORTES", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "jessica priscila", "data_prevista": "06/05/2025", "ordem_servico": "1235995", "data_pagamento": "03/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "187.50", "cliente": " LOCARGA TRANSPORTES LTDA", "descricao": "TAXA SINDICAL", "data_venda": "02/05/2025", "responsavel": "jack", "data_prevista": "07/05/2025", "ordem_servico": "1235996", "data_pagamento": "02/05/2025", "tipo_transacao": "DESPESA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "350.00", "cliente": " LOCARGA TRANSPORTES LTDA", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "jessica priscila", "data_prevista": "06/05/2025", "ordem_servico": "1235996", "data_pagamento": "03/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "600.00", "cliente": "CSB TRANSPORTES E COMERCIO DE MATERIAIS DE CONSTRUCAO LTDA", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "mathiely", "data_prevista": "06/05/2025", "ordem_servico": "533638", "data_pagamento": "05/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "50.00", "cliente": " 50.232.547 MESSIAS DE ALMEIDA DOS SANTOS", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "mathiely", "data_prevista": "06/05/2025", "ordem_servico": "533639", "data_pagamento": "02/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "266.00", "cliente": "50.799.910 RAUL MORAES E SILVA NETO", "descricao": "TAXA SINDICAL", "data_venda": "02/05/2025", "responsavel": "jack", "data_prevista": "07/05/2025", "ordem_servico": "533640", "data_pagamento": "02/05/2025", "tipo_transacao": "DESPESA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "300.00", "cliente": "50.799.910 RAUL MORAES E SILVA NETO", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "mathiely", "data_prevista": "06/05/2025", "ordem_servico": "533640", "data_pagamento": "02/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "532.00", "cliente": "45.696.035 FERNANDO NUNES DA SILVA", "descricao": "TAXA SINDICAL", "data_venda": "02/05/2025", "responsavel": "jack", "data_prevista": "07/05/2025", "ordem_servico": "533641", "data_pagamento": "", "tipo_transacao": "DESPESA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "paid"}, {"valor": "65.05", "cliente": "45.696.035 FERNANDO NUNES DA SILVA", "descricao": "CUSTO CARTÃO CREDITO", "data_venda": "02/05/2025", "responsavel": "jack", "data_prevista": "07/05/2025", "ordem_servico": "533641", "data_pagamento": "02/05/2025", "tipo_transacao": "DESPESA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "500.00", "cliente": "45.696.035 FERNANDO NUNES DA SILVA", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "mathiely", "data_prevista": "06/05/2025", "ordem_servico": "533641", "data_pagamento": "02/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "286.00", "cliente": " 59.590.082 JOSE DE JESUS", "descricao": "TAXA SINDICAL", "data_venda": "02/05/2025", "responsavel": "jack", "data_prevista": "07/05/2025", "ordem_servico": "533642", "data_pagamento": "", "tipo_transacao": "DESPESA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "paid"}, {"valor": "500.00", "cliente": " 59.590.082 JOSE DE JESUS", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "mathiely", "data_prevista": "06/05/2025", "ordem_servico": "533642", "data_pagamento": "02/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "250.00", "cliente": "SERGIO DOS SANTOS SILVA", "descricao": "TAXA SINDICAL", "data_venda": "02/05/2025", "responsavel": "jack", "data_prevista": "07/05/2025", "ordem_servico": "533643", "data_pagamento": "02/05/2025", "tipo_transacao": "DESPESA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "490.00", "cliente": "SERGIO DOS SANTOS SILVA", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "mathiely", "data_prevista": "06/05/2025", "ordem_servico": "533643", "data_pagamento": "02/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "300.00", "cliente": " WALTUIR INACIO DA SILVA", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "mathiely", "data_prevista": "07/05/2025", "ordem_servico": "533644", "data_pagamento": "02/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "450.00", "cliente": " 37.146.728 ADRIANO ALCANTARA PARESQUI", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "mathiely", "data_prevista": "06/05/2025", "ordem_servico": "533645", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "750.00", "cliente": "46.084.655 ADENILSON CASAGRANDE", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "mathiely", "data_prevista": "06/05/2025", "ordem_servico": "533646", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "110.00", "cliente": " PASMEC TRANSPORTES E CONFECCOES LTDA", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "mathiely", "data_prevista": "07/05/2025", "ordem_servico": "533647", "data_pagamento": "02/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "266.00", "cliente": "35.235.788 MARCOS ROBERTO BORGES VESPA", "descricao": "TAXA SINDICAL", "data_venda": "02/05/2025", "responsavel": "jack", "data_prevista": "07/05/2025", "ordem_servico": "5603635", "data_pagamento": "02/05/2025", "tipo_transacao": "DESPESA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "300.00", "cliente": "35.235.788 MARCOS ROBERTO BORGES VESPA", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "gustavo", "data_prevista": "07/05/2025", "ordem_servico": "5603635", "data_pagamento": "29/04/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "1670.00", "cliente": "NOVO MUNDO QUIMICA LTDA", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "gustavo", "data_prevista": "07/05/2025", "ordem_servico": "5603651", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "BOLETO", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "350.00", "cliente": " D ANGELYS SOUZA DA SILVA LTDA", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "gustavo", "data_prevista": "07/05/2025", "ordem_servico": "5603652", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "950.00", "cliente": "SUL AIR DEMOLICOES E LOCACOES DE MAQUINAS LTDA", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "gustavo", "data_prevista": "07/05/2025", "ordem_servico": "5603653", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "BOLETO", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "50.00", "cliente": " JUGLAIR JUANINI", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "gustavo", "data_prevista": "07/05/2025", "ordem_servico": "5603654", "data_pagamento": "05/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "500.00", "cliente": "Gilberto da Silva Bino", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "gustavo", "data_prevista": "07/05/2025", "ordem_servico": "5603655", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "350.00", "cliente": "GLEITON SERGIO PEREIRA DE SOUSA", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "gustavo", "data_prevista": "07/05/2025", "ordem_servico": "5603656", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "300.00", "cliente": "TRANSJETTO LTDA", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "gustavo", "data_prevista": "07/05/2025", "ordem_servico": "5603657", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "480.00", "cliente": "53.486.102 CARLOS PEREIRA DE PAIVA", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "gustavo", "data_prevista": "07/05/2025", "ordem_servico": "5603658", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "BOLETO", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "310.00", "cliente": " DJALMA CRISPIM DE OLIVEIRA", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "gustavo", "data_prevista": "07/05/2025", "ordem_servico": "5603659", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "150.00", "cliente": "RAFAEL SOARES DOS SANTOS ", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "gustavo", "data_prevista": "07/05/2025", "ordem_servico": "5603660", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "300.00", "cliente": "COOPERATIVA DE TRANSPORTE DE CARGAS DIVERSAS DE  BH E REGIAO - COOPSTAR", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "gustavo", "data_prevista": "07/05/2025", "ordem_servico": "5603661", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "330.94", "cliente": " JORGE LUIS SANTANA 28984438839", "descricao": "CUSTO CARTÃO CREDITO", "data_venda": "02/05/2025", "responsavel": "jack", "data_prevista": "07/05/2025", "ordem_servico": "5603662", "data_pagamento": "", "tipo_transacao": "DESPESA", "metodo_pagamento": "CARTAO", "status_transacao": "pending", "status_financeiro": "paid"}, {"valor": "1330.00", "cliente": " JORGE LUIS SANTANA 28984438839", "descricao": "TAXA SINDICAL", "data_venda": "02/05/2025", "responsavel": "jack", "data_prevista": "07/05/2025", "ordem_servico": "5603662", "data_pagamento": "", "tipo_transacao": "DESPESA", "metodo_pagamento": "CARTAO", "status_transacao": "pending", "status_financeiro": "paid"}, {"valor": "2550.00", "cliente": " JORGE LUIS SANTANA 28984438839", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "gustavo", "data_prevista": "07/05/2025", "ordem_servico": "5603662", "data_pagamento": "03/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "CARTAO", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "240.00", "cliente": "AGRO VELOZ 77 LTDA", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "paola", "data_prevista": "06/05/2025", "ordem_servico": "642694", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "2860.00", "cliente": "BONA FIDE TRANSPORTE LTDA", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "paola", "data_prevista": "06/05/2025", "ordem_servico": "642696", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "650", "cliente": "DARIU ANTONIO SANTOS DA SILVA", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "paola", "data_prevista": "02/05/2025", "ordem_servico": "642699", "data_pagamento": "2023-06-15", "tipo_transacao": "RECEITA", "metodo_pagamento": "CARTAO", "status_transacao": "paid", "status_financeiro": "in_progress"}, {"valor": "650", "cliente": "DARIU ANTONIO SANTOS DA SILVA", "descricao": "Parcela 2", "data_venda": "02/05/2025", "responsavel": "paola", "data_prevista": "02/06/2025", "ordem_servico": "642699", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "CARTAO", "status_transacao": "pending", "status_financeiro": "in_progress"}, {"valor": "200.00", "cliente": "PAULINO FRANCISCO DE SOUZA OLICHESKI", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "jessica santos", "data_prevista": "06/05/2025", "ordem_servico": "700386", "data_pagamento": "02/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "1000.00", "cliente": "PAULO ROBERTO DA SILVA", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "jessica santos", "data_prevista": "06/05/2025", "ordem_servico": "700387", "data_pagamento": "02/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "12.29", "cliente": "LGVAZ TRANSPORTES LTDA", "descricao": "CUSTO CARTÃO CREDITO", "data_venda": "02/05/2025", "responsavel": "jack", "data_prevista": "07/05/2025", "ordem_servico": "881010292", "data_pagamento": "", "tipo_transacao": "DESPESA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "paid"}, {"valor": "390.00", "cliente": "LGVAZ TRANSPORTES LTDA", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "luana", "data_prevista": "06/05/2025", "ordem_servico": "881010292", "data_pagamento": "02/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "67.65", "cliente": "VANDO ALOISIO TAVARES", "descricao": "CUSTO CARTÃO CREDITO", "data_venda": "02/05/2025", "responsavel": "jack", "data_prevista": "07/05/2025", "ordem_servico": "881010293", "data_pagamento": "", "tipo_transacao": "DESPESA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "paid"}, {"valor": "250.00", "cliente": "VANDO ALOISIO TAVARES", "descricao": "TAXA SINDICAL", "data_venda": "02/05/2025", "responsavel": "jack", "data_prevista": "07/05/2025", "ordem_servico": "881010293", "data_pagamento": "", "tipo_transacao": "DESPESA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "paid"}, {"valor": "25.00", "cliente": "VANDO ALOISIO TAVARES", "descricao": "CURSO TAC", "data_venda": "02/05/2025", "responsavel": "jack", "data_prevista": "07/05/2025", "ordem_servico": "881010293", "data_pagamento": "", "tipo_transacao": "DESPESA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "paid"}, {"valor": "520.00", "cliente": "VANDO ALOISIO TAVARES", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "luana", "data_prevista": "06/05/2025", "ordem_servico": "881010293", "data_pagamento": "02/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}]	\N	2025-05-07 21:24:02.159661+00	2025-05-07 21:24:02.159661+00
63	2	11	{"startDate": "2025-05-02"}	0.021381855010986328	completed	[]	\N	2025-05-08 17:02:29.028469+00	2025-05-08 17:02:29.028469+00
64	10	1	{"endDate": "2025-05-08", "startDate": "2025-05-02"}	0.048658525004982946	completed	[{"valor": "581.00", "cliente": "60.591.516 CAMONGE DELFINO DOS SANTOS", "descricao": "TAXA SINDICAL", "data_venda": "02/05/2025", "responsavel": "jack", "data_prevista": "06/05/2025", "ordem_servico": "0202024", "data_pagamento": "05/05/2025", "tipo_transacao": "DESPESA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "80.00", "cliente": "60.591.516 CAMONGE DELFINO DOS SANTOS", "descricao": "TAXA SINDICAL", "data_venda": "02/05/2025", "responsavel": "jack", "data_prevista": "06/05/2025", "ordem_servico": "0202024", "data_pagamento": "05/05/2025", "tipo_transacao": "DESPESA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "1250.00", "cliente": "60.591.516 CAMONGE DELFINO DOS SANTOS", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "larissa", "data_prevista": "06/05/2025", "ordem_servico": "0202024", "data_pagamento": "02/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "350.00", "cliente": "JOSE DOS SANTOS", "descricao": "Parcela 1", "data_venda": "05/05/2025", "responsavel": "larissa", "data_prevista": "06/05/2025", "ordem_servico": "0202025", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "250.00", "cliente": "ARY SOUZA BORGES", "descricao": "Parcela 1", "data_venda": "05/05/2025", "responsavel": "larissa", "data_prevista": "06/05/2025", "ordem_servico": "0202026", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "250.00", "cliente": "ELISIO MILTON KRUG", "descricao": "TAXA SINDICAL", "data_venda": "05/05/2025", "responsavel": "jack", "data_prevista": "07/05/2025", "ordem_servico": "0202027", "data_pagamento": "02/05/2025", "tipo_transacao": "DESPESA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "750.00", "cliente": "ELISIO MILTON KRUG", "descricao": "Parcela 1", "data_venda": "05/05/2025", "responsavel": "larissa", "data_prevista": "06/05/2025", "ordem_servico": "0202027", "data_pagamento": "02/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "650.00", "cliente": "DANIEL DALBOSCO", "descricao": "Parcela 1", "data_venda": "05/05/2025", "responsavel": "larissa", "data_prevista": "06/05/2025", "ordem_servico": "0202028", "data_pagamento": "02/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "400.00", "cliente": "DELAIR GATO", "descricao": "Parcela 1", "data_venda": "06/05/2025", "responsavel": "larissa", "data_prevista": "08/05/2025", "ordem_servico": "0202029", "data_pagamento": "06/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "500.00", "cliente": "MEIRINESIO DOS SANTOS", "descricao": "Parcela 1", "data_venda": "07/05/2025", "responsavel": "larissa", "data_prevista": "07/05/2025", "ordem_servico": "0202030", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "100.00", "cliente": "OSMAR ROSA DA SILVA", "descricao": "Parcela 3", "data_venda": "08/05/2025", "responsavel": "larissa", "data_prevista": "08/08/2025", "ordem_servico": "0202031", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "CARTAO", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "100.00", "cliente": "OSMAR ROSA DA SILVA", "descricao": "Parcela 1", "data_venda": "08/05/2025", "responsavel": "larissa", "data_prevista": "08/06/2025", "ordem_servico": "0202031", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "CARTAO", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "100.00", "cliente": "OSMAR ROSA DA SILVA", "descricao": "Parcela 4", "data_venda": "08/05/2025", "responsavel": "larissa", "data_prevista": "08/09/2025", "ordem_servico": "0202031", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "CARTAO", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "100.00", "cliente": "OSMAR ROSA DA SILVA", "descricao": "Parcela 2", "data_venda": "08/05/2025", "responsavel": "larissa", "data_prevista": "08/07/2025", "ordem_servico": "0202031", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "CARTAO", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "75.00", "cliente": "RODRIGO OLIVEIRA LEAL", "descricao": "Parcela 3", "data_venda": "08/05/2025", "responsavel": "larissa", "data_prevista": "08/08/2025", "ordem_servico": "0202032", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "CARTAO", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "75.00", "cliente": "RODRIGO OLIVEIRA LEAL", "descricao": "Parcela 4", "data_venda": "08/05/2025", "responsavel": "larissa", "data_prevista": "08/09/2025", "ordem_servico": "0202032", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "CARTAO", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "75.00", "cliente": "RODRIGO OLIVEIRA LEAL", "descricao": "Parcela 1", "data_venda": "08/05/2025", "responsavel": "larissa", "data_prevista": "08/06/2025", "ordem_servico": "0202032", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "CARTAO", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "75.00", "cliente": "RODRIGO OLIVEIRA LEAL", "descricao": "Parcela 2", "data_venda": "08/05/2025", "responsavel": "larissa", "data_prevista": "08/07/2025", "ordem_servico": "0202032", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "CARTAO", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "750.00", "cliente": "IN GLOW BRASIL INTERMEDIACAO DE NEGOCIOS LTDA", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "angelica", "data_prevista": "06/05/2025", "ordem_servico": "1001558", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "BOLETO", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "500.00", "cliente": "MARCIO JASON CORREA", "descricao": "Parcela 1", "data_venda": "05/05/2025", "responsavel": "angelica", "data_prevista": "06/05/2025", "ordem_servico": "1001561", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "800.00", "cliente": "TRANSPORTADORA VALE VERDE LTDA ", "descricao": "Parcela 1", "data_venda": "07/05/2025", "responsavel": "angelica", "data_prevista": "08/05/2025", "ordem_servico": "1001563", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "110.00", "cliente": " PASMEC TRANSPORTES E CONFECCOES LTDA", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "jessica priscila", "data_prevista": "06/05/2025", "ordem_servico": "1235986", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "1390.00", "cliente": "AUTO SOCORRO MARACANA LTDA", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "jessica priscila", "data_prevista": "06/05/2025", "ordem_servico": "1235992", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "CARTAO", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "650.00", "cliente": "MARCELO RIBEIRO GOZZO ", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "jessica priscila", "data_prevista": "06/05/2025", "ordem_servico": "1235993", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "CARTAO", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "750.00", "cliente": " MARTINS COMERCIO DE VERDURAS LTDA", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "jessica priscila", "data_prevista": "06/05/2025", "ordem_servico": "1235994", "data_pagamento": "02/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "266.00", "cliente": "MOREL TRANSPORTES", "descricao": "TAXA SINDICAL", "data_venda": "02/05/2025", "responsavel": "jack", "data_prevista": "07/05/2025", "ordem_servico": "1235995", "data_pagamento": "", "tipo_transacao": "DESPESA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "paid"}, {"valor": "350.00", "cliente": "MOREL TRANSPORTES", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "jessica priscila", "data_prevista": "06/05/2025", "ordem_servico": "1235995", "data_pagamento": "03/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "187.50", "cliente": " LOCARGA TRANSPORTES LTDA", "descricao": "TAXA SINDICAL", "data_venda": "02/05/2025", "responsavel": "jack", "data_prevista": "07/05/2025", "ordem_servico": "1235996", "data_pagamento": "02/05/2025", "tipo_transacao": "DESPESA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "350.00", "cliente": " LOCARGA TRANSPORTES LTDA", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "jessica priscila", "data_prevista": "06/05/2025", "ordem_servico": "1235996", "data_pagamento": "03/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "266.00", "cliente": "MARCFREIRE TRANSPORTES LTDA", "descricao": "TAXA SINDICAL", "data_venda": "05/05/2025", "responsavel": "jack", "data_prevista": "07/05/2025", "ordem_servico": "1235997", "data_pagamento": "", "tipo_transacao": "DESPESA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "paid"}, {"valor": "750.00", "cliente": "MARCFREIRE TRANSPORTES LTDA", "descricao": "Parcela 1", "data_venda": "05/05/2025", "responsavel": "jessica priscila", "data_prevista": "06/05/2025", "ordem_servico": "1235997", "data_pagamento": "02/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "350.00", "cliente": "WM SERVICES LTDA", "descricao": "Parcela 1", "data_venda": "05/05/2025", "responsavel": "jessica priscila", "data_prevista": "06/05/2025", "ordem_servico": "1235999", "data_pagamento": "05/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "0.00", "cliente": "ETC - Transmaria Agregados Ltda", "descricao": "Parcela 1", "data_venda": "05/05/2025", "responsavel": "jessica priscila", "data_prevista": "06/05/2025", "ordem_servico": "1236001", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "CARTAO", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "187.50", "cliente": " SARA TRANSPORTES LTDA", "descricao": "TAXA SINDICAL", "data_venda": "05/05/2025", "responsavel": "jack", "data_prevista": "07/05/2025", "ordem_servico": "1236002", "data_pagamento": "05/05/2025", "tipo_transacao": "DESPESA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "350.00", "cliente": " SARA TRANSPORTES LTDA", "descricao": "Parcela 1", "data_venda": "05/05/2025", "responsavel": "jessica priscila", "data_prevista": "06/05/2025", "ordem_servico": "1236002", "data_pagamento": "05/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "750.00", "cliente": "SAMUEL HENRIQUE SOUZA DOS SANTOS", "descricao": "Parcela 1", "data_venda": "07/05/2025", "responsavel": "jessica priscila", "data_prevista": "07/05/2025", "ordem_servico": "1236003", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "190.00", "cliente": "MARCIO HENRIQUE DE SOUZA ", "descricao": "Parcela 1", "data_venda": "07/05/2025", "responsavel": "jessica priscila", "data_prevista": "07/05/2025", "ordem_servico": "1236004", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "690.00", "cliente": " WP TRANSPORTES LTDA", "descricao": "Parcela 1", "data_venda": "07/05/2025", "responsavel": "jessica priscila", "data_prevista": "07/05/2025", "ordem_servico": "1236005", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "300.00", "cliente": " ALMIR ROGERIO PIRES ", "descricao": "Parcela 1", "data_venda": "07/05/2025", "responsavel": "jessica priscila", "data_prevista": "07/05/2025", "ordem_servico": "1236007", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "110.00", "cliente": "DANUBIA GRACIELE MIRANDA TRANSPORTES LTDA", "descricao": "Parcela 1", "data_venda": "07/05/2025", "responsavel": "jessica priscila", "data_prevista": "07/05/2025", "ordem_servico": "1236009", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "350", "cliente": "AMERICO GULHERME  ROCHA", "descricao": "Parcela 1", "data_venda": "07/05/2025", "responsavel": "jessica priscila", "data_prevista": "07/05/2025", "ordem_servico": "1236010", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "100.00", "cliente": "RAFAEL DE SOUZA CAFARO", "descricao": "Parcela 1", "data_venda": "07/05/2025", "responsavel": "jessica priscila", "data_prevista": "08/05/2025", "ordem_servico": "1236011", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "650.00", "cliente": " TRANS ARAUJO LTDA", "descricao": "Parcela 1", "data_venda": "08/05/2025", "responsavel": "jessica priscila", "data_prevista": "08/05/2025", "ordem_servico": "1236012", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "50.00", "cliente": " GAZIN LOG TRANSPORTE E LOGISTICA LTDA", "descricao": "Parcela 1", "data_venda": "08/05/2025", "responsavel": "jessica priscila", "data_prevista": "08/05/2025", "ordem_servico": "1236013", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "BOLETO", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "500.00", "cliente": "MARCOS ANTONIO & VICENCA COMERCIO DE GRAOS LTDA", "descricao": "Parcela 1", "data_venda": "08/05/2025", "responsavel": "jessica priscila", "data_prevista": "08/05/2025", "ordem_servico": "1236014", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "160.00", "cliente": "R. A. ESPINDOLA LTDA", "descricao": "Parcela 1", "data_venda": "08/05/2025", "responsavel": "jessica priscila", "data_prevista": "08/05/2025", "ordem_servico": "1236015", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "650.00", "cliente": "DANILO DOS SANTOS NEGREIROS ", "descricao": "Parcela 1", "data_venda": "08/05/2025", "responsavel": "jessica priscila", "data_prevista": "08/05/2025", "ordem_servico": "1236016", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "550.00", "cliente": "RAIO PARAUNA TRANSPORTES LTDA", "descricao": "Parcela 1", "data_venda": "08/05/2025", "responsavel": "jessica priscila", "data_prevista": "08/05/2025", "ordem_servico": "1236017", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "600.00", "cliente": "CSB TRANSPORTES E COMERCIO DE MATERIAIS DE CONSTRUCAO LTDA", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "mathiely", "data_prevista": "06/05/2025", "ordem_servico": "533638", "data_pagamento": "05/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "50.00", "cliente": " 50.232.547 MESSIAS DE ALMEIDA DOS SANTOS", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "mathiely", "data_prevista": "06/05/2025", "ordem_servico": "533639", "data_pagamento": "02/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "266.00", "cliente": "50.799.910 RAUL MORAES E SILVA NETO", "descricao": "TAXA SINDICAL", "data_venda": "02/05/2025", "responsavel": "jack", "data_prevista": "07/05/2025", "ordem_servico": "533640", "data_pagamento": "02/05/2025", "tipo_transacao": "DESPESA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "300.00", "cliente": "50.799.910 RAUL MORAES E SILVA NETO", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "mathiely", "data_prevista": "06/05/2025", "ordem_servico": "533640", "data_pagamento": "02/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "65.05", "cliente": "45.696.035 FERNANDO NUNES DA SILVA", "descricao": "CUSTO CARTÃO CREDITO", "data_venda": "02/05/2025", "responsavel": "jack", "data_prevista": "07/05/2025", "ordem_servico": "533641", "data_pagamento": "02/05/2025", "tipo_transacao": "DESPESA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "532.00", "cliente": "45.696.035 FERNANDO NUNES DA SILVA", "descricao": "TAXA SINDICAL", "data_venda": "02/05/2025", "responsavel": "jack", "data_prevista": "07/05/2025", "ordem_servico": "533641", "data_pagamento": "", "tipo_transacao": "DESPESA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "paid"}, {"valor": "500.00", "cliente": "45.696.035 FERNANDO NUNES DA SILVA", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "mathiely", "data_prevista": "06/05/2025", "ordem_servico": "533641", "data_pagamento": "02/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "286.00", "cliente": " 59.590.082 JOSE DE JESUS", "descricao": "TAXA SINDICAL", "data_venda": "02/05/2025", "responsavel": "jack", "data_prevista": "07/05/2025", "ordem_servico": "533642", "data_pagamento": "", "tipo_transacao": "DESPESA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "paid"}, {"valor": "500.00", "cliente": " 59.590.082 JOSE DE JESUS", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "mathiely", "data_prevista": "06/05/2025", "ordem_servico": "533642", "data_pagamento": "02/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "250.00", "cliente": "SERGIO DOS SANTOS SILVA", "descricao": "TAXA SINDICAL", "data_venda": "02/05/2025", "responsavel": "jack", "data_prevista": "07/05/2025", "ordem_servico": "533643", "data_pagamento": "02/05/2025", "tipo_transacao": "DESPESA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "490.00", "cliente": "SERGIO DOS SANTOS SILVA", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "mathiely", "data_prevista": "06/05/2025", "ordem_servico": "533643", "data_pagamento": "02/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "300.00", "cliente": " WALTUIR INACIO DA SILVA", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "mathiely", "data_prevista": "07/05/2025", "ordem_servico": "533644", "data_pagamento": "02/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "450.00", "cliente": " 37.146.728 ADRIANO ALCANTARA PARESQUI", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "mathiely", "data_prevista": "06/05/2025", "ordem_servico": "533645", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "750.00", "cliente": "46.084.655 ADENILSON CASAGRANDE", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "mathiely", "data_prevista": "06/05/2025", "ordem_servico": "533646", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "110.00", "cliente": " PASMEC TRANSPORTES E CONFECCOES LTDA", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "mathiely", "data_prevista": "07/05/2025", "ordem_servico": "533647", "data_pagamento": "02/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "266.00", "cliente": "KEURIANY DE ALMEIDA MORAIS 04961592161", "descricao": "TAXA SINDICAL", "data_venda": "05/05/2025", "responsavel": "jack", "data_prevista": "07/05/2025", "ordem_servico": "533648", "data_pagamento": "05/05/2025", "tipo_transacao": "DESPESA", "metodo_pagamento": "CARTAO", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "58.57", "cliente": "KEURIANY DE ALMEIDA MORAIS 04961592161", "descricao": "CUSTO CARTÃO CREDITO", "data_venda": "05/05/2025", "responsavel": "jack", "data_prevista": "07/05/2025", "ordem_servico": "533648", "data_pagamento": "05/05/2025", "tipo_transacao": "DESPESA", "metodo_pagamento": "CARTAO", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "450.00", "cliente": "KEURIANY DE ALMEIDA MORAIS 04961592161", "descricao": "Parcela 1", "data_venda": "05/05/2025", "responsavel": "mathiely", "data_prevista": "06/05/2025", "ordem_servico": "533648", "data_pagamento": "05/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "CARTAO", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "500.00", "cliente": "ISMAIL JOSE FERREIRA", "descricao": "TAXA SINDICAL", "data_venda": "05/05/2025", "responsavel": "jack", "data_prevista": "07/05/2025", "ordem_servico": "533649", "data_pagamento": "05/05/2025", "tipo_transacao": "DESPESA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "600.00", "cliente": "ISMAIL JOSE FERREIRA", "descricao": "Parcela 1", "data_venda": "05/05/2025", "responsavel": "mathiely", "data_prevista": "06/05/2025", "ordem_servico": "533649", "data_pagamento": "05/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "25.00", "cliente": " JOSE SILVIO COSTA DE OLIVEIRA", "descricao": "CURSO TAC", "data_venda": "05/05/2025", "responsavel": "jack", "data_prevista": "07/05/2025", "ordem_servico": "533650", "data_pagamento": "", "tipo_transacao": "DESPESA", "metodo_pagamento": "CARTAO", "status_transacao": "pending", "status_financeiro": "paid"}, {"valor": "42.82", "cliente": " JOSE SILVIO COSTA DE OLIVEIRA", "descricao": "CUSTO CARTÃO CREDITO", "data_venda": "05/05/2025", "responsavel": "jack", "data_prevista": "07/05/2025", "ordem_servico": "533650", "data_pagamento": "", "tipo_transacao": "DESPESA", "metodo_pagamento": "CARTAO", "status_transacao": "pending", "status_financeiro": "paid"}, {"valor": "450.00", "cliente": " JOSE SILVIO COSTA DE OLIVEIRA", "descricao": "Parcela 1", "data_venda": "05/05/2025", "responsavel": "mathiely", "data_prevista": "06/05/2025", "ordem_servico": "533650", "data_pagamento": "05/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "CARTAO", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "21.63", "cliente": "BRUNO HENRIQUE PEREIRA DA SILVA ", "descricao": "CUSTO CARTÃO CREDITO", "data_venda": "05/05/2025", "responsavel": "jack", "data_prevista": "07/05/2025", "ordem_servico": "533651", "data_pagamento": "", "tipo_transacao": "DESPESA", "metodo_pagamento": "CARTAO", "status_transacao": "pending", "status_financeiro": "paid"}, {"valor": "250.00", "cliente": "BRUNO HENRIQUE PEREIRA DA SILVA ", "descricao": "Parcela 1", "data_venda": "05/05/2025", "responsavel": "mathiely", "data_prevista": "06/05/2025", "ordem_servico": "533651", "data_pagamento": "05/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "CARTAO", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "100.00", "cliente": " PRISCILA BENTO DIAS", "descricao": "Parcela 1", "data_venda": "05/05/2025", "responsavel": "mathiely", "data_prevista": "06/05/2025", "ordem_servico": "533652", "data_pagamento": "05/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "69.00", "cliente": "RAFAEL BENTO DE SOUSA SENA ", "descricao": "ICETRAN", "data_venda": "05/05/2025", "responsavel": "admin", "data_prevista": "07/05/2025", "ordem_servico": "533653", "data_pagamento": "07/05/2025", "tipo_transacao": "DESPESA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "300.00", "cliente": "RAFAEL BENTO DE SOUSA SENA ", "descricao": "Parcela 1", "data_venda": "05/05/2025", "responsavel": "mathiely", "data_prevista": "06/05/2025", "ordem_servico": "533653", "data_pagamento": "05/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "350.00", "cliente": "VALTEIR ALVES DA SILVA", "descricao": "Parcela 1", "data_venda": "05/05/2025", "responsavel": "mathiely", "data_prevista": "06/05/2025", "ordem_servico": "533654", "data_pagamento": "05/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "50.00", "cliente": "A M PRADO TRANSPORTES LTDA", "descricao": "Parcela 1", "data_venda": "05/05/2025", "responsavel": "mathiely", "data_prevista": "06/05/2025", "ordem_servico": "533655", "data_pagamento": "05/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "350.00", "cliente": "M A ELIAS CONSERVADORA LTDA", "descricao": "Parcela 1", "data_venda": "05/05/2025", "responsavel": "mathiely", "data_prevista": "06/05/2025", "ordem_servico": "533656", "data_pagamento": "05/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "300.00", "cliente": "THAIS CONCEICAO SANTOS NASCIMENTO", "descricao": "Parcela 1", "data_venda": "05/05/2025", "responsavel": "mathiely", "data_prevista": "06/05/2025", "ordem_servico": "533657", "data_pagamento": "05/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "200.00", "cliente": "MILTON BENINI", "descricao": "Parcela 1", "data_venda": "05/05/2025", "responsavel": "mathiely", "data_prevista": "06/05/2025", "ordem_servico": "533658", "data_pagamento": "05/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "BOLETO", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "500.00", "cliente": " R. &. F. COMERCIO E SERVICOS S.A. - EM RECUPERACAO JUDICIAL", "descricao": "Parcela 1", "data_venda": "05/05/2025", "responsavel": "mathiely", "data_prevista": "06/05/2025", "ordem_servico": "533659", "data_pagamento": "05/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "500.00", "cliente": " HOPE TRANSPORTES LTDA", "descricao": "Parcela 1", "data_venda": "05/05/2025", "responsavel": "mathiely", "data_prevista": "06/05/2025", "ordem_servico": "533660", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "in_progress"}, {"valor": "70.00", "cliente": " PEDRO AUGUSTO DAUBERMANN M E", "descricao": "Parcela 1", "data_venda": "05/05/2025", "responsavel": "mathiely", "data_prevista": "08/05/2025", "ordem_servico": "533661", "data_pagamento": "05/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "1190", "cliente": " PEDRO AUGUSTO DAUBERMANN M E", "descricao": "Parcela 1", "data_venda": "06/05/2025", "responsavel": "mathiely", "data_prevista": "08/05/2025", "ordem_servico": "533661 / 1", "data_pagamento": "06/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "250.00", "cliente": "CLOVIS LIMA DA CUNHA JUNIOR", "descricao": "TAXA SINDICAL", "data_venda": "06/05/2025", "responsavel": "jack", "data_prevista": "08/05/2025", "ordem_servico": "533662", "data_pagamento": "", "tipo_transacao": "DESPESA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "paid"}, {"valor": "400.00", "cliente": "CLOVIS LIMA DA CUNHA JUNIOR", "descricao": "Parcela 1", "data_venda": "06/05/2025", "responsavel": "mathiely", "data_prevista": "08/05/2025", "ordem_servico": "533662", "data_pagamento": "06/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "300.00", "cliente": " JOAO PAULO PEREIRA", "descricao": "Parcela 1", "data_venda": "06/05/2025", "responsavel": "mathiely", "data_prevista": "08/05/2025", "ordem_servico": "533663", "data_pagamento": "06/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "300.00", "cliente": " ADENIR RODRIGUES AUGUSTO & CIA LTDA", "descricao": "Parcela 1", "data_venda": "06/05/2025", "responsavel": "mathiely", "data_prevista": "08/05/2025", "ordem_servico": "533664", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "300.00", "cliente": " IVANILCE MARIA PALUDO BASSO ", "descricao": "Parcela 1", "data_venda": "06/05/2025", "responsavel": "mathiely", "data_prevista": "08/05/2025", "ordem_servico": "533665", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "300.00", "cliente": "PETERSON BEZERRA DE SOUZA", "descricao": "Parcela 1", "data_venda": "06/05/2025", "responsavel": "mathiely", "data_prevista": "08/05/2025", "ordem_servico": "533666", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "50.00", "cliente": "JULIO CESAR MOREIRA", "descricao": "Parcela 1", "data_venda": "06/05/2025", "responsavel": "mathiely", "data_prevista": "08/05/2025", "ordem_servico": "533667", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "266.00", "cliente": "39.881.306 FRANCISCO SALES ALVES DE LIMA E SA", "descricao": "TAXA SINDICAL", "data_venda": "06/05/2025", "responsavel": "jack", "data_prevista": "08/05/2025", "ordem_servico": "533668", "data_pagamento": "", "tipo_transacao": "DESPESA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "paid"}, {"valor": "400.00", "cliente": "39.881.306 FRANCISCO SALES ALVES DE LIMA E SA", "descricao": "Parcela 1", "data_venda": "06/05/2025", "responsavel": "mathiely", "data_prevista": "08/05/2025", "ordem_servico": "533668", "data_pagamento": "06/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "266.00", "cliente": " JR RIBOLI TRANSPORTES SOCIEDADE EMPRESARIA LIMITADA", "descricao": "TAXA SINDICAL", "data_venda": "06/05/2025", "responsavel": "jack", "data_prevista": "08/05/2025", "ordem_servico": "533669", "data_pagamento": "", "tipo_transacao": "DESPESA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "paid"}, {"valor": "350.00", "cliente": " JR RIBOLI TRANSPORTES SOCIEDADE EMPRESARIA LIMITADA", "descricao": "Parcela 1", "data_venda": "06/05/2025", "responsavel": "mathiely", "data_prevista": "08/05/2025", "ordem_servico": "533669", "data_pagamento": "06/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "266.00", "cliente": " AUGUSTO LEAO TRANSPORTES E MUDANCAS LTDA", "descricao": "TAXA SINDICAL", "data_venda": "06/05/2025", "responsavel": "jack", "data_prevista": "08/05/2025", "ordem_servico": "533670", "data_pagamento": "", "tipo_transacao": "DESPESA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "paid"}, {"valor": "300.00", "cliente": " AUGUSTO LEAO TRANSPORTES E MUDANCAS LTDA", "descricao": "Parcela 1", "data_venda": "06/05/2025", "responsavel": "mathiely", "data_prevista": "08/05/2025", "ordem_servico": "533670", "data_pagamento": "06/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "266.00", "cliente": " PAULO ALEXANDRE SILVA DE OLIVEIRA", "descricao": "TAXA SINDICAL", "data_venda": "07/05/2025", "responsavel": "jack", "data_prevista": "08/05/2025", "ordem_servico": "533671", "data_pagamento": "07/05/2025", "tipo_transacao": "DESPESA", "metodo_pagamento": "BOLETO", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "400.00", "cliente": " PAULO ALEXANDRE SILVA DE OLIVEIRA", "descricao": "Parcela 1", "data_venda": "07/05/2025", "responsavel": "mathiely", "data_prevista": "08/05/2025", "ordem_servico": "533671", "data_pagamento": "07/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "BOLETO", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "187.50", "cliente": " AFONSO TRANSPORTES PESADOS LTDA", "descricao": "TAXA SINDICAL", "data_venda": "07/05/2025", "responsavel": "jack", "data_prevista": "08/05/2025", "ordem_servico": "533672", "data_pagamento": "", "tipo_transacao": "DESPESA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "paid"}, {"valor": "350.00", "cliente": " AFONSO TRANSPORTES PESADOS LTDA", "descricao": "Parcela 1", "data_venda": "07/05/2025", "responsavel": "mathiely", "data_prevista": "08/05/2025", "ordem_servico": "533672", "data_pagamento": "07/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "300.00", "cliente": "MOACIR ALVES DE ALMEIDA JUNIOR", "descricao": "Parcela 1", "data_venda": "07/05/2025", "responsavel": "mathiely", "data_prevista": "08/05/2025", "ordem_servico": "533673", "data_pagamento": "07/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "88.19", "cliente": " JAIR PEIXOTO ", "descricao": "CUSTO CARTÃO CREDITO", "data_venda": "07/05/2025", "responsavel": "jack", "data_prevista": "08/05/2025", "ordem_servico": "533674", "data_pagamento": "07/05/2025", "tipo_transacao": "DESPESA", "metodo_pagamento": "CARTAO", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "250.00", "cliente": " JAIR PEIXOTO ", "descricao": "TAXA SINDICAL", "data_venda": "07/05/2025", "responsavel": "jack", "data_prevista": "08/05/2025", "ordem_servico": "533674", "data_pagamento": "07/05/2025", "tipo_transacao": "DESPESA", "metodo_pagamento": "CARTAO", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "25.00", "cliente": " JAIR PEIXOTO ", "descricao": "CURSO TAC", "data_venda": "07/05/2025", "responsavel": "jack", "data_prevista": "08/05/2025", "ordem_servico": "533674", "data_pagamento": "07/02/2025", "tipo_transacao": "DESPESA", "metodo_pagamento": "CARTAO", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "680.00", "cliente": " JAIR PEIXOTO ", "descricao": "Parcela 1", "data_venda": "07/05/2025", "responsavel": "mathiely", "data_prevista": "08/05/2025", "ordem_servico": "533674", "data_pagamento": "07/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "CARTAO", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "266.00", "cliente": "PRA FUZZI LOGISTICA E TRANSPORTES LTDA", "descricao": "TAXA SINDICAL", "data_venda": "07/05/2025", "responsavel": "jack", "data_prevista": "08/05/2025", "ordem_servico": "533675", "data_pagamento": "07/05/2025", "tipo_transacao": "DESPESA", "metodo_pagamento": "BOLETO", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "500.00", "cliente": "PRA FUZZI LOGISTICA E TRANSPORTES LTDA", "descricao": "Parcela 1", "data_venda": "07/05/2025", "responsavel": "mathiely", "data_prevista": "08/05/2025", "ordem_servico": "533675", "data_pagamento": "07/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "BOLETO", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "320.00", "cliente": " ANDERSON ADRIANO DO NASCIMENTO", "descricao": "Parcela 1", "data_venda": "07/05/2025", "responsavel": "mathiely", "data_prevista": "08/05/2025", "ordem_servico": "533676", "data_pagamento": "07/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "20.41", "cliente": "JONAS MAURICIO CURCIO", "descricao": "CUSTO CARTÃO CREDITO", "data_venda": "07/05/2025", "responsavel": "jack", "data_prevista": "08/05/2025", "ordem_servico": "533677", "data_pagamento": "07/05/2025", "tipo_transacao": "DESPESA", "metodo_pagamento": "CARTAO", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "350.00", "cliente": "JONAS MAURICIO CURCIO", "descricao": "Parcela 1", "data_venda": "07/05/2025", "responsavel": "mathiely", "data_prevista": "08/05/2025", "ordem_servico": "533677", "data_pagamento": "07/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "CARTAO", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "300.00", "cliente": "46.382.756 ALAN MENDES DE ARAUJO", "descricao": "Parcela 1", "data_venda": "07/05/2025", "responsavel": "mathiely", "data_prevista": "08/05/2025", "ordem_servico": "533678", "data_pagamento": "07/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "250.00", "cliente": "MOACIR DE ARAUJO", "descricao": "TAXA SINDICAL", "data_venda": "07/05/2025", "responsavel": "jack", "data_prevista": "08/05/2025", "ordem_servico": "533679", "data_pagamento": "", "tipo_transacao": "DESPESA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "paid"}, {"valor": "450.00", "cliente": "MOACIR DE ARAUJO", "descricao": "Parcela 1", "data_venda": "07/05/2025", "responsavel": "mathiely", "data_prevista": "08/05/2025", "ordem_servico": "533679", "data_pagamento": "07/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "250.00", "cliente": "HILQUIAS DA SILVA ALMEIDA", "descricao": "Parcela 1", "data_venda": "07/05/2025", "responsavel": "mathiely", "data_prevista": "08/05/2025", "ordem_servico": "533680", "data_pagamento": "07/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "300.00", "cliente": "DEL NERO COMERCIO DE EMBALAGENS LTDA", "descricao": "Parcela 1", "data_venda": "07/05/2025", "responsavel": "mathiely", "data_prevista": "08/05/2025", "ordem_servico": "533681", "data_pagamento": "07/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "266.00", "cliente": "57.095.456 ARLINDO DE OLIVEIRA FRANCO", "descricao": "TAXA SINDICAL", "data_venda": "07/05/2025", "responsavel": "jack", "data_prevista": "08/05/2025", "ordem_servico": "533682", "data_pagamento": "07/05/2025", "tipo_transacao": "DESPESA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "300.00", "cliente": "57.095.456 ARLINDO DE OLIVEIRA FRANCO", "descricao": "Parcela 1", "data_venda": "07/05/2025", "responsavel": "mathiely", "data_prevista": "08/05/2025", "ordem_servico": "533682", "data_pagamento": "07/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "50.00", "cliente": " S&L LOCACAO DE VEICULOS", "descricao": "Parcela 1", "data_venda": "07/05/2025", "responsavel": "mathiely", "data_prevista": "08/05/2025", "ordem_servico": "533683", "data_pagamento": "07/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "250.00", "cliente": "CRISTIANO PEREIRA DA COSTA", "descricao": "TAXA SINDICAL", "data_venda": "07/05/2025", "responsavel": "jack", "data_prevista": "08/05/2025", "ordem_servico": "533684", "data_pagamento": "07/05/2025", "tipo_transacao": "DESPESA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "25.00", "cliente": "CRISTIANO PEREIRA DA COSTA", "descricao": "CURSO TAC", "data_venda": "07/05/2025", "responsavel": "jack", "data_prevista": "08/05/2025", "ordem_servico": "533684", "data_pagamento": "07/05/2025", "tipo_transacao": "DESPESA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "450.00", "cliente": "CRISTIANO PEREIRA DA COSTA", "descricao": "Parcela 1", "data_venda": "07/05/2025", "responsavel": "mathiely", "data_prevista": "08/05/2025", "ordem_servico": "533684", "data_pagamento": "07/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "300.00", "cliente": "ISMAIL JOSE FERREIRA", "descricao": "Parcela 1", "data_venda": "08/05/2025", "responsavel": "mathiely", "data_prevista": "08/05/2025", "ordem_servico": "533685", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "58.57", "cliente": "52.449.646 JOSE PAULO BEZERRA DA COSTA", "descricao": "TAXA SINDICAL", "data_venda": "07/05/2025", "responsavel": "jack", "data_prevista": "08/05/2025", "ordem_servico": "533686", "data_pagamento": "07/05/2025", "tipo_transacao": "DESPESA", "metodo_pagamento": "CARTAO", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "266.00", "cliente": "52.449.646 JOSE PAULO BEZERRA DA COSTA", "descricao": "TAXA SINDICAL", "data_venda": "07/05/2025", "responsavel": "jack", "data_prevista": "08/05/2025", "ordem_servico": "533686", "data_pagamento": "07/05/2025", "tipo_transacao": "DESPESA", "metodo_pagamento": "CARTAO", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "450.00", "cliente": "52.449.646 JOSE PAULO BEZERRA DA COSTA", "descricao": "Parcela 1", "data_venda": "07/05/2025", "responsavel": "mathiely", "data_prevista": "08/05/2025", "ordem_servico": "533686", "data_pagamento": "07/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "CARTAO", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "266.00", "cliente": "35.235.788 MARCOS ROBERTO BORGES VESPA", "descricao": "TAXA SINDICAL", "data_venda": "02/05/2025", "responsavel": "jack", "data_prevista": "07/05/2025", "ordem_servico": "5603635", "data_pagamento": "02/05/2025", "tipo_transacao": "DESPESA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "300.00", "cliente": "35.235.788 MARCOS ROBERTO BORGES VESPA", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "gustavo", "data_prevista": "07/05/2025", "ordem_servico": "5603635", "data_pagamento": "29/04/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "1670.00", "cliente": "NOVO MUNDO QUIMICA LTDA", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "gustavo", "data_prevista": "07/05/2025", "ordem_servico": "5603651", "data_pagamento": "02/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "BOLETO", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "187.50", "cliente": " D ANGELYS SOUZA DA SILVA LTDA", "descricao": "TAXA SINDICAL", "data_venda": "02/05/2025", "responsavel": "jack", "data_prevista": "08/05/2025", "ordem_servico": "5603652", "data_pagamento": "", "tipo_transacao": "DESPESA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "paid"}, {"valor": "350.00", "cliente": " D ANGELYS SOUZA DA SILVA LTDA", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "gustavo", "data_prevista": "07/05/2025", "ordem_servico": "5603652", "data_pagamento": "02/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "950.00", "cliente": "SUL AIR DEMOLICOES E LOCACOES DE MAQUINAS LTDA", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "gustavo", "data_prevista": "07/05/2025", "ordem_servico": "5603653", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "BOLETO", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "50.00", "cliente": " JUGLAIR JUANINI", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "gustavo", "data_prevista": "07/05/2025", "ordem_servico": "5603654", "data_pagamento": "05/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "500.00", "cliente": "Gilberto da Silva Bino", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "gustavo", "data_prevista": "07/05/2025", "ordem_servico": "5603655", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "350.00", "cliente": "GLEITON SERGIO PEREIRA DE SOUSA", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "gustavo", "data_prevista": "07/05/2025", "ordem_servico": "5603656", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "300.00", "cliente": "TRANSJETTO LTDA", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "gustavo", "data_prevista": "07/05/2025", "ordem_servico": "5603657", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "480.00", "cliente": "53.486.102 CARLOS PEREIRA DE PAIVA", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "gustavo", "data_prevista": "07/05/2025", "ordem_servico": "5603658", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "BOLETO", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "310.00", "cliente": " DJALMA CRISPIM DE OLIVEIRA", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "gustavo", "data_prevista": "07/05/2025", "ordem_servico": "5603659", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "150.00", "cliente": "RAFAEL SOARES DOS SANTOS ", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "gustavo", "data_prevista": "07/05/2025", "ordem_servico": "5603660", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "300.00", "cliente": "COOPERATIVA DE TRANSPORTE DE CARGAS DIVERSAS DE  BH E REGIAO - COOPSTAR", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "gustavo", "data_prevista": "07/05/2025", "ordem_servico": "5603661", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "330.94", "cliente": " JORGE LUIS SANTANA 28984438839", "descricao": "CUSTO CARTÃO CREDITO", "data_venda": "02/05/2025", "responsavel": "jack", "data_prevista": "07/05/2025", "ordem_servico": "5603662", "data_pagamento": "", "tipo_transacao": "DESPESA", "metodo_pagamento": "CARTAO", "status_transacao": "pending", "status_financeiro": "paid"}, {"valor": "1330.00", "cliente": " JORGE LUIS SANTANA 28984438839", "descricao": "TAXA SINDICAL", "data_venda": "02/05/2025", "responsavel": "jack", "data_prevista": "07/05/2025", "ordem_servico": "5603662", "data_pagamento": "", "tipo_transacao": "DESPESA", "metodo_pagamento": "CARTAO", "status_transacao": "pending", "status_financeiro": "paid"}, {"valor": "2550.00", "cliente": " JORGE LUIS SANTANA 28984438839", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "gustavo", "data_prevista": "07/05/2025", "ordem_servico": "5603662", "data_pagamento": "03/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "CARTAO", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "510.00", "cliente": "BRAVO LOCACAO E MANUTENCAO DE EQUIPAMENTOS LTDA", "descricao": "Parcela 1", "data_venda": "05/05/2025", "responsavel": "gustavo", "data_prevista": "07/05/2025", "ordem_servico": "5603663", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "350.00", "cliente": " ALEX SANDRO VALEJO EVES", "descricao": "Parcela 1", "data_venda": "05/05/2025", "responsavel": "gustavo", "data_prevista": "07/05/2025", "ordem_servico": "5603664", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "170.11", "cliente": "COOPERATIVA DE TRANSPORTE DE CARGAS DIVERSAS DE  BH E REGIAO - COOPSTAR", "descricao": "CUSTO CARTÃO CREDITO", "data_venda": "05/05/2025", "responsavel": "jack", "data_prevista": "07/05/2025", "ordem_servico": "5603665", "data_pagamento": "", "tipo_transacao": "DESPESA", "metodo_pagamento": "CARTAO", "status_transacao": "pending", "status_financeiro": "paid"}, {"valor": "1310.00", "cliente": "COOPERATIVA DE TRANSPORTE DE CARGAS DIVERSAS DE  BH E REGIAO - COOPSTAR", "descricao": "Parcela 1", "data_venda": "05/05/2025", "responsavel": "gustavo", "data_prevista": "07/05/2025", "ordem_servico": "5603665", "data_pagamento": "05/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "CARTAO", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "350.00", "cliente": "45.233.297 WALDECIR BES", "descricao": "Parcela 1", "data_venda": "05/05/2025", "responsavel": "gustavo", "data_prevista": "07/05/2025", "ordem_servico": "5603666", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "510.00", "cliente": "VALDEILSON DOURADO DA SILVA TRANSPORTES", "descricao": "Parcela 1", "data_venda": "05/05/2025", "responsavel": "gustavo", "data_prevista": "07/05/2025", "ordem_servico": "5603667", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "710.00", "cliente": "ANDRE VIEIRA ANDRADE LTDA", "descricao": "Parcela 1", "data_venda": "05/05/2025", "responsavel": "gustavo", "data_prevista": "07/05/2025", "ordem_servico": "5603668", "data_pagamento": "05/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "410.00", "cliente": "Nassir Joao Contiero", "descricao": "Parcela 1", "data_venda": "05/05/2025", "responsavel": "gustavo", "data_prevista": "07/05/2025", "ordem_servico": "5603669", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "410.00", "cliente": "FLAVIO IZABEL", "descricao": "Parcela 1", "data_venda": "07/05/2025", "responsavel": "gustavo", "data_prevista": "07/05/2025", "ordem_servico": "5603670", "data_pagamento": "05/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "200.00", "cliente": "CAMPOS TRANSPORTADORA LTDA", "descricao": "Parcela 1", "data_venda": "06/05/2025", "responsavel": "gustavo", "data_prevista": "07/05/2025", "ordem_servico": "5603671", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "350.00", "cliente": "SOUZA TRANSPORTES E SERVICOS DE ESCOLTA LTDA", "descricao": "Parcela 1", "data_venda": "07/05/2025", "responsavel": "gustavo", "data_prevista": "07/05/2025", "ordem_servico": "5603672", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "290.00", "cliente": "LEANDRO GOMES DA COSTA", "descricao": "Parcela 1", "data_venda": "07/05/2025", "responsavel": "gustavo", "data_prevista": "07/05/2025", "ordem_servico": "5603673", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "350.00", "cliente": "54.287.004 CRISMARY OLIVEIRA DA SILVA", "descricao": "Parcela 1", "data_venda": "07/05/2025", "responsavel": "gustavo", "data_prevista": "07/05/2025", "ordem_servico": "5603674", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "780.00", "cliente": "RODRIGO MATHEUS BONIFACIO", "descricao": "Parcela 1", "data_venda": "07/05/2025", "responsavel": "gustavo", "data_prevista": "07/05/2025", "ordem_servico": "5603675", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "350.00", "cliente": "GERSON DE OLIVEIRA CERCAL ", "descricao": "Parcela 1", "data_venda": "07/05/2025", "responsavel": "gustavo", "data_prevista": "07/05/2025", "ordem_servico": "5603676", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "BOLETO", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "440.00", "cliente": "Ana Paula Ross", "descricao": "Parcela 1", "data_venda": "07/05/2025", "responsavel": "gustavo", "data_prevista": "07/05/2025", "ordem_servico": "5603677", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "CARTAO", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "540.00", "cliente": " MINERADORA MX LTDA", "descricao": "Parcela 1", "data_venda": "07/05/2025", "responsavel": "gustavo", "data_prevista": "07/05/2025", "ordem_servico": "5603678", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "CARTAO", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "1050.00", "cliente": "COOPERLUBRA COOPERATIVA DE TRANSPORTES RODOVIARIOS, DE CONSUMO DE LUBRIFICANTES E COMBUSTIVEIS E DE AGENCIAMENTO DE FRETES PLANALTO LTDA", "descricao": "Parcela 1", "data_venda": "07/05/2025", "responsavel": "gustavo", "data_prevista": "07/05/2025", "ordem_servico": "5603679", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "350.00", "cliente": " FRANCISCO DAS CHAGAS ARAUJO", "descricao": "Parcela 1", "data_venda": "07/05/2025", "responsavel": "gustavo", "data_prevista": "07/05/2025", "ordem_servico": "5603680", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "1000.00", "cliente": " C O DA SILVA PONTES TRANSPORTES", "descricao": "Parcela 1", "data_venda": "08/05/2025", "responsavel": "gustavo", "data_prevista": "08/05/2025", "ordem_servico": "5603681", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "580.00", "cliente": " LOGLILOG LOGISTICA E TRANSPORTES LTDA", "descricao": "Parcela 1", "data_venda": "08/05/2025", "responsavel": "gustavo", "data_prevista": "08/05/2025", "ordem_servico": "5603682", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "780.00", "cliente": "COOPERLUBRA COOPERATIVA DE TRANSPORTES RODOVIARIOS, DE CONSUMO DE LUBRIFICANTES E COMBUSTIVEIS E DE AGENCIAMENTO DE FRETES PLANALTO LTDA", "descricao": "Parcela 1", "data_venda": "08/05/2025", "responsavel": "gustavo", "data_prevista": "08/05/2025", "ordem_servico": "5603683", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "340.00", "cliente": " SERGIO RODRIGO MACHADO", "descricao": "Parcela 1", "data_venda": "08/05/2025", "responsavel": "gustavo", "data_prevista": "08/05/2025", "ordem_servico": "5603684", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "440.00", "cliente": " J K ASSAD NOGUEIRA TRANSPORTES", "descricao": "Parcela 1", "data_venda": "08/05/2025", "responsavel": "gustavo", "data_prevista": "08/05/2025", "ordem_servico": "5603685", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "440.00", "cliente": "EVERTON SOUZA MEDEIROS", "descricao": "Parcela 1", "data_venda": "08/05/2025", "responsavel": "gustavo", "data_prevista": "08/05/2025", "ordem_servico": "5603686", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "CARTAO", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "240.00", "cliente": "AGRO VELOZ 77 LTDA", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "paola", "data_prevista": "06/05/2025", "ordem_servico": "642694", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "2860.00", "cliente": "BONA FIDE TRANSPORTE LTDA", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "paola", "data_prevista": "06/05/2025", "ordem_servico": "642696", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "520.00", "cliente": "DARIU ANTONIO SANTOS DA SILVA", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "paola", "data_prevista": "08/05/2025", "ordem_servico": "642698", "data_pagamento": "02/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "650", "cliente": "DARIU ANTONIO SANTOS DA SILVA", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "paola", "data_prevista": "02/05/2025", "ordem_servico": "642699", "data_pagamento": "2023-06-15", "tipo_transacao": "RECEITA", "metodo_pagamento": "CARTAO", "status_transacao": "paid", "status_financeiro": "in_progress"}, {"valor": "650", "cliente": "DARIU ANTONIO SANTOS DA SILVA", "descricao": "Parcela 2", "data_venda": "02/05/2025", "responsavel": "paola", "data_prevista": "02/06/2025", "ordem_servico": "642699", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "CARTAO", "status_transacao": "pending", "status_financeiro": "in_progress"}, {"valor": "250.00", "cliente": "JOÃO GUSTAVO SIGOLO DE OLIVEIRA ", "descricao": "TAXA SINDICAL", "data_venda": "05/05/2025", "responsavel": "jack", "data_prevista": "07/05/2025", "ordem_servico": "642700", "data_pagamento": "", "tipo_transacao": "DESPESA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "paid"}, {"valor": "25.00", "cliente": "JOÃO GUSTAVO SIGOLO DE OLIVEIRA ", "descricao": "CURSO TAC", "data_venda": "05/05/2025", "responsavel": "jack", "data_prevista": "07/05/2025", "ordem_servico": "642700", "data_pagamento": "", "tipo_transacao": "DESPESA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "paid"}, {"valor": "500.00", "cliente": "JOÃO GUSTAVO SIGOLO DE OLIVEIRA ", "descricao": "Parcela 1", "data_venda": "05/05/2025", "responsavel": "paola", "data_prevista": "06/05/2025", "ordem_servico": "642700", "data_pagamento": "05/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "450.00", "cliente": " MSC TRANSPORTES LTDA", "descricao": "Parcela 1", "data_venda": "05/05/2025", "responsavel": "paola", "data_prevista": "06/05/2025", "ordem_servico": "642702", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "200.00", "cliente": "BONA FIDE TRANSPORTE LTDA", "descricao": "Parcela 1", "data_venda": "05/05/2025", "responsavel": "paola", "data_prevista": "06/05/2025", "ordem_servico": "642704", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "300.00", "cliente": "JOSE RICARDO LOPES DUARTE ", "descricao": "Parcela 1", "data_venda": "05/05/2025", "responsavel": "paola", "data_prevista": "06/05/2025", "ordem_servico": "642707", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "in_progress"}, {"valor": "107.50", "cliente": "JOÃO CARLOS GUELIS", "descricao": "Parcela 1", "data_venda": "05/05/2025", "responsavel": "jessica santos", "data_prevista": "05/05/2025", "ordem_servico": "700362", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "BOLETO", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "200.00", "cliente": "PAULINO FRANCISCO DE SOUZA OLICHESKI", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "jessica santos", "data_prevista": "06/05/2025", "ordem_servico": "700386", "data_pagamento": "02/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "1000.00", "cliente": "PAULO ROBERTO DA SILVA", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "jessica santos", "data_prevista": "06/05/2025", "ordem_servico": "700387", "data_pagamento": "02/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "430.00", "cliente": "ELOI ROQUE GABE", "descricao": "Parcela 1", "data_venda": "07/05/2025", "responsavel": "jessica santos", "data_prevista": "07/05/2025", "ordem_servico": "700388", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "250.00", "cliente": "RICARDO PERES DE SENA", "descricao": "Parcela 1", "data_venda": "07/05/2025", "responsavel": "jessica santos", "data_prevista": "07/05/2025", "ordem_servico": "700390", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "550.00", "cliente": "JULIANO OLIVEIRA DA SILVA ", "descricao": "Parcela 1", "data_venda": "08/05/2025", "responsavel": "jessica santos", "data_prevista": "08/05/2025", "ordem_servico": "700391", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "350.00", "cliente": "CLAUDINEI FREITAS MEIRELES", "descricao": "Parcela 1", "data_venda": "07/05/2025", "responsavel": "supervisor", "data_prevista": "07/05/2025", "ordem_servico": "80266", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "700.00", "cliente": "VALENTE & CASTILHO LTDA", "descricao": "Parcela 1", "data_venda": "07/05/2025", "responsavel": "supervisor", "data_prevista": "07/05/2025", "ordem_servico": "80267", "data_pagamento": "2023-06-15", "tipo_transacao": "RECEITA", "metodo_pagamento": "CARTAO", "status_transacao": "paid", "status_financeiro": "pending"}, {"valor": "12.29", "cliente": "LGVAZ TRANSPORTES LTDA", "descricao": "CUSTO CARTÃO CREDITO", "data_venda": "02/05/2025", "responsavel": "jack", "data_prevista": "07/05/2025", "ordem_servico": "881010292", "data_pagamento": "", "tipo_transacao": "DESPESA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "paid"}, {"valor": "390.00", "cliente": "LGVAZ TRANSPORTES LTDA", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "luana", "data_prevista": "06/05/2025", "ordem_servico": "881010292", "data_pagamento": "02/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "250.00", "cliente": "VANDO ALOISIO TAVARES", "descricao": "TAXA SINDICAL", "data_venda": "02/05/2025", "responsavel": "jack", "data_prevista": "07/05/2025", "ordem_servico": "881010293", "data_pagamento": "", "tipo_transacao": "DESPESA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "paid"}, {"valor": "25.00", "cliente": "VANDO ALOISIO TAVARES", "descricao": "CURSO TAC", "data_venda": "02/05/2025", "responsavel": "jack", "data_prevista": "07/05/2025", "ordem_servico": "881010293", "data_pagamento": "", "tipo_transacao": "DESPESA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "paid"}, {"valor": "67.65", "cliente": "VANDO ALOISIO TAVARES", "descricao": "CUSTO CARTÃO CREDITO", "data_venda": "02/05/2025", "responsavel": "jack", "data_prevista": "07/05/2025", "ordem_servico": "881010293", "data_pagamento": "", "tipo_transacao": "DESPESA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "paid"}, {"valor": "520.00", "cliente": "VANDO ALOISIO TAVARES", "descricao": "Parcela 1", "data_venda": "02/05/2025", "responsavel": "luana", "data_prevista": "06/05/2025", "ordem_servico": "881010293", "data_pagamento": "02/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "50.00", "cliente": " FLAVIANO MARCOS RIBEIRO", "descricao": "Parcela 1", "data_venda": "05/05/2025", "responsavel": "luana", "data_prevista": "06/05/2025", "ordem_servico": "881010294", "data_pagamento": "05/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "50.00", "cliente": "BHDG TRANSPORTE E COMERCIO DE METAIS LTDA", "descricao": "Parcela 1", "data_venda": "05/05/2025", "responsavel": "luana", "data_prevista": "06/05/2025", "ordem_servico": "881010295", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "in_progress"}, {"valor": "250.00", "cliente": "FELIPE LUCIANO FRANCESCATTO", "descricao": "Parcela 1", "data_venda": "05/05/2025", "responsavel": "luana", "data_prevista": "06/05/2025", "ordem_servico": "881010299", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "in_progress"}, {"valor": "250.00", "cliente": "FELIPE LUCIANO FRANCESCATTO", "descricao": "Parcela 1", "data_venda": "05/05/2025", "responsavel": "luana", "data_prevista": "07/05/2025", "ordem_servico": "8810102998", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "532.00", "cliente": "MONTEIRO JUNIOR LOGISTICA E TRANSPORTE LTDA", "descricao": "TAXA SINDICAL", "data_venda": "06/05/2025", "responsavel": "jack", "data_prevista": "07/05/2025", "ordem_servico": "881010301", "data_pagamento": "", "tipo_transacao": "DESPESA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "paid"}, {"valor": "720.00", "cliente": "MONTEIRO JUNIOR LOGISTICA E TRANSPORTE LTDA", "descricao": "Parcela 1", "data_venda": "06/05/2025", "responsavel": "luana", "data_prevista": "06/05/2025", "ordem_servico": "881010301", "data_pagamento": "06/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "690.00", "cliente": "FEPECA COMERCIO DE GAS LTDA", "descricao": "Parcela 1", "data_venda": "06/05/2025", "responsavel": "luana", "data_prevista": "08/05/2025", "ordem_servico": "881010303", "data_pagamento": "06/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "320.00", "cliente": "EUROLATINA QUIMICA LTDA", "descricao": "Parcela 1", "data_venda": "07/05/2025", "responsavel": "luana", "data_prevista": "08/05/2025", "ordem_servico": "881010304", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "550.00", "cliente": " WESLLEY FERNANDES BARBOSA LTDA", "descricao": "Parcela 1", "data_venda": "07/05/2025", "responsavel": "luana", "data_prevista": "08/05/2025", "ordem_servico": "881010305", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "CARTAO", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "550.00", "cliente": "ALYSSON DE OLIVEIRA DA SILVA", "descricao": "Parcela 1", "data_venda": "07/05/2025", "responsavel": "luana", "data_prevista": "08/05/2025", "ordem_servico": "881010308", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "CARTAO", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "450.00", "cliente": "VAGNO SEIXAS DE OLIVEIRA", "descricao": "Parcela 1", "data_venda": "05/05/2025", "responsavel": "dafni", "data_prevista": "06/05/2025", "ordem_servico": "90371", "data_pagamento": "05/05/2025", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "paid", "status_financeiro": "paid"}, {"valor": "270.00", "cliente": "EDER CARLOS PEREIRA", "descricao": "Parcela 1", "data_venda": "07/05/2025", "responsavel": "dafni", "data_prevista": "07/05/2025", "ordem_servico": "90372", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}, {"valor": "300.00", "cliente": "SIDNEI PEREIRA TRISTAO", "descricao": "Parcela 1", "data_venda": "07/05/2025", "responsavel": "dafni", "data_prevista": "07/05/2025", "ordem_servico": "90373", "data_pagamento": "", "tipo_transacao": "RECEITA", "metodo_pagamento": "PIX", "status_transacao": "pending", "status_financeiro": "pending"}]	\N	2025-05-08 22:25:15.434742+00	2025-05-08 22:25:15.434742+00
\.


--
-- Data for Name: reports; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reports (id, name, description, type, query, parameters, permissions, created_by, created_at, updated_at) FROM stdin;
6	Desempenho de Vendedores	Análise comparativa do desempenho dos vendedores	table	SELECT \n    u.username as vendedor, \n    COUNT(s.id) as total_vendas, \n    SUM(s.total_amount::numeric) as valor_total, \n    AVG(s.total_amount::numeric) as ticket_medio, \n    COUNT(CASE WHEN s.status = 'completed' THEN 1 END) as vendas_concluidas, \n    COUNT(CASE WHEN s.status = 'returned' THEN 1 END) as vendas_devolvidas\nFROM users u \nLEFT JOIN sales s ON u.id = s.seller_id \nWHERE u.role = 'vendedor' AND (s.date IS NULL OR s.date BETWEEN :startDate AND :endDate) \nGROUP BY u.username \nORDER BY SUM(s.total_amount::numeric) DESC NULLS LAST	{"endDate": {"type": "date", "required": true}, "startDate": {"type": "date", "required": true}}	admin,supervisor	1	2025-05-02 14:46:30.043996+00	2025-05-02 14:46:30.043996+00
7	Ordens de Serviço	Lista completa de vendas com suas respectivas ordens de serviço	table	SELECT \n     s.id, \n     s.order_number as ordem_servico, \n     to_char(s.date::date, 'DD/MM/YYYY') as data_venda, \n     c.name as cliente, \n     u.username as vendedor, \n     st.name as tipo_servico, \n     s.total_amount as valor_total, \n     s.status, \n     s.financial_status as status_financeiro \n   FROM sales s \n   LEFT JOIN customers c ON s.customer_id = c.id \n   LEFT JOIN users u ON s.seller_id = u.id \n   LEFT JOIN service_types st ON s.service_type_id = st.id \n   WHERE s.date BETWEEN :startDate AND :endDate \n   ORDER BY s.date DESC	{"endDate": {"type": "date", "label": "Data Final", "required": true}, "startDate": {"type": "date", "label": "Data Inicial", "required": true}}	admin,supervisor,financeiro,vendedor,operacional	1	2025-05-02 20:45:57.956736+00	2025-05-02 20:45:57.956736+00
3	Análise de Pagamentos	Situação financeira das vendas com detalhes de pagamentos, parcelas pagas (com datas) e parcelas pendentes (com datas de vencimento)	table	SELECT \n    s.id, \n    s.order_number as numero_pedido, \n    to_char(s.date::date, 'DD/MM/YYYY') as data_venda, \n    c.name as cliente, \n    u.username as vendedor, \n    s.total_amount as valor_total, \n    COUNT(i.id) as total_parcelas,\n    SUM(CASE WHEN i.status = 'paid' THEN i.amount::numeric ELSE 0 END) as valor_pago,\n    SUM(CASE WHEN i.status = 'pending' THEN i.amount::numeric ELSE 0 END) as valor_pendente,\n    string_agg(CASE WHEN i.status = 'paid' THEN 'Parcela ' || i.installment_number || ': ' || COALESCE(to_char(i.payment_date::date, 'DD/MM/YYYY'), 'Sem data') ELSE NULL END, ', ') as datas_pagamentos,\n    string_agg(CASE WHEN i.status = 'pending' THEN 'Parcela ' || i.installment_number || ': ' || to_char(i.due_date::date, 'DD/MM/YYYY') ELSE NULL END, ', ') as parcelas_pendentes\nFROM \n    sales s \n    LEFT JOIN customers c ON s.customer_id = c.id \n    LEFT JOIN users u ON s.seller_id = u.id \n    LEFT JOIN sale_installments i ON s.id = i.sale_id \nWHERE \n    s.date BETWEEN :startDate AND :endDate \nGROUP BY \n    s.id, s.order_number, s.date, c.name, u.username, s.total_amount \nORDER BY \n    s.date DESC	{"endDate": {"type": "date", "required": true}, "startDate": {"type": "date", "required": true}}	admin,financeiro	1	2025-05-02 14:46:29.866286+00	2025-05-02 14:46:29.866286+00
2	Minhas Vendas do Período	Lista de vendas por período para o vendedor atual	table	SELECT s.id, s.order_number, s.date, c.name as cliente, st.name as tipo_servico, s.total_amount, s.status, s.financial_status FROM sales s LEFT JOIN customers c ON s.customer_id = c.id LEFT JOIN service_types st ON s.service_type_id = st.id WHERE s.date BETWEEN :startDate AND :endDate ORDER BY s.date DESC	{"endDate": {"type": "date", "required": true}, "startDate": {"type": "date", "required": true}}	admin,supervisor,vendedor	1	2025-05-02 14:46:29.8079+00	2025-05-02 14:46:29.8079+00
8	Detalhamento de Custos por Ordem de Serviço	Análise detalhada dos custos operacionais por ordem de serviço	table	SELECT \n     s.order_number as ordem_servico, \n     to_char(s.date::date, 'DD/MM/YYYY') as data_venda, \n     c.name as cliente,\n     s.total_amount as valor_venda,\n     ct.name as tipo_custo, \n     oc.amount as valor_custo,\n     to_char(oc.date::date, 'DD/MM/YYYY') as data_custo,\n     to_char(oc.payment_date::date, 'DD/MM/YYYY') as data_pagamento_custo,\n     oc.description as descricao_custo\n   FROM sales s \n   LEFT JOIN customers c ON s.customer_id = c.id \n   LEFT JOIN sale_operational_costs oc ON s.id = oc.sale_id \n   LEFT JOIN cost_types ct ON oc.cost_type_id = ct.id\n   WHERE s.date BETWEEN :startDate AND :endDate \n   ORDER BY s.date DESC, s.order_number, oc.date	{"endDate": {"type": "date", "label": "Data Final", "required": true}, "startDate": {"type": "date", "label": "Data Inicial", "required": true}}	admin,supervisor,financeiro,operacional	1	2025-05-02 20:46:06.551366+00	2025-05-02 20:46:06.551366+00
4	Serviços Entregues	Lista de serviços entregues no período	table	SELECT s.id, s.order_number, s.date, c.name as cliente, sp.name as prestador, st.name as tipo_servico, COUNT(si.id) as qtd_itens FROM sales s LEFT JOIN customers c ON s.customer_id = c.id LEFT JOIN service_providers sp ON s.service_provider_id = sp.id LEFT JOIN service_types st ON s.service_type_id = st.id LEFT JOIN sale_items si ON s.id = si.sale_id WHERE s.status = 'completed' AND s.date BETWEEN :startDate AND :endDate GROUP BY s.id, s.order_number, s.date, c.name, sp.name, st.name ORDER BY s.date DESC	{"endDate": {"type": "date", "required": true}, "startDate": {"type": "date", "required": true}}	admin,operacional	1	2025-05-02 14:46:29.92434+00	2025-05-02 14:46:29.92434+00
12	Custos Operacionais por Ordem de Serviço	Análise de custos operacionais das vendas, incluindo tipo, valor e data de pagamento	table	SELECT \n    s.order_number as ordem_servico,\n    to_char(s.date::date, 'DD/MM/YYYY') as data_venda,\n    c.name as cliente,\n    ct.name as tipo_custo,\n    soc.amount as valor_custo,\n    to_char(soc.date::date, 'DD/MM/YYYY') as data_cadastro,\n    CASE \n      WHEN soc.payment_date IS NOT NULL THEN to_char(soc.payment_date::date, 'DD/MM/YYYY')\n      ELSE ''\n    END as data_pagamento,\n    CASE \n      WHEN soc.payment_date IS NULL THEN 'Pendente'\n      ELSE 'Pago'\n    END as status_pagamento,\n    u.username as responsavel,\n    s.status as status_venda,\n    s.financial_status as status_financeiro_venda\n  FROM \n    sale_operational_costs soc\n    JOIN sales s ON soc.sale_id = s.id\n    LEFT JOIN customers c ON s.customer_id = c.id\n    LEFT JOIN cost_types ct ON soc.cost_type_id = ct.id\n    LEFT JOIN users u ON soc.responsible_id = u.id\n  WHERE \n    s.date BETWEEN :startDate AND :endDate\n  ORDER BY \n    s.order_number, soc.date	{"endDate": {"type": "date", "label": "Data Final", "required": true}, "startDate": {"type": "date", "label": "Data Inicial", "required": true}}	admin,supervisor,financeiro	1	2025-05-02 21:01:49.030327+00	2025-05-02 21:01:49.030327+00
1	Visão Geral de Vendas	Resumo consolidado de todas as vendas, agrupadas por status	table	SELECT status, COUNT(*) as quantidade, SUM(total_amount::numeric) as valor_total, AVG(total_amount::numeric) as valor_medio \nFROM sales \nGROUP BY status \nORDER BY COUNT(*) DESC	{}	admin,supervisor,financeiro	1	2025-05-02 14:46:29.74721+00	2025-05-02 14:46:29.74721+00
5	Histórico de Status	Acompanhamento das mudanças de status de uma venda específica	table	SELECT s.order_number as ordem_servico, h.created_at, h.from_status, h.to_status, u.username as usuario, h.notes \nFROM sales_status_history h \nLEFT JOIN users u ON h.user_id = u.id \nLEFT JOIN sales s ON h.sale_id = s.id\nWHERE h.sale_id = :saleId \nORDER BY h.created_at	{"saleId": {"type": "number", "required": true}}	admin,supervisor,vendedor,financeiro,operacional	1	2025-05-02 14:46:29.983491+00	2025-05-02 14:46:29.983491+00
9	Relatório Financeiro Detalhado	Análise financeira detalhada incluindo ordem de serviço, parcelas, pagamentos e custos operacionais	table	SELECT \n    s.id, \n    s.order_number as ordem_servico, \n    to_char(s.date::date, 'DD/MM/YYYY') as data_venda, \n    c.name as cliente, \n    u.username as vendedor, \n    pm.name as metodo_pagamento,\n    s.total_amount as valor_total, \n    (SELECT COUNT(*) FROM sale_installments si WHERE si.sale_id = s.id) as qtd_parcelas,\n    (SELECT COUNT(*) FROM sale_installments si WHERE si.sale_id = s.id AND si.status = 'paid') as parcelas_pagas,\n    (SELECT COUNT(*) FROM sale_installments si WHERE si.sale_id = s.id AND si.status = 'pending') as parcelas_pendentes,\n    (SELECT SUM(si.amount::numeric) FROM sale_installments si WHERE si.sale_id = s.id AND si.status = 'paid') as valor_pago,\n    (SELECT SUM(si.amount::numeric) FROM sale_installments si WHERE si.sale_id = s.id AND si.status = 'pending') as valor_pendente,\n    (SELECT MAX(si.payment_date) FROM sale_installments si WHERE si.sale_id = s.id AND si.status = 'paid') as ultimo_pagamento,\n    (SELECT COUNT(*) FROM sale_operational_costs soc WHERE soc.sale_id = s.id) as qtd_custos,\n    (SELECT SUM(soc.amount::numeric) FROM sale_operational_costs soc WHERE soc.sale_id = s.id) as total_custos,\n    s.status as status_venda,\n    s.financial_status as status_financeiro\n  FROM \n    sales s \n    LEFT JOIN customers c ON s.customer_id = c.id \n    LEFT JOIN users u ON s.seller_id = u.id \n    LEFT JOIN payment_methods pm ON s.payment_method_id = pm.id\n  WHERE \n    s.date BETWEEN :startDate AND :endDate \n  ORDER BY \n    s.date DESC	{"endDate": {"type": "date", "label": "Data Final", "required": true}, "startDate": {"type": "date", "label": "Data Inicial", "required": true}}	admin,supervisor,financeiro	1	2025-05-02 20:49:14.99586+00	2025-05-02 20:49:14.99586+00
11	Resumo Financeiro por Ordem de Serviço	Visão consolidada das informações financeiras por ordem de serviço, incluindo receitas, custos e margem de lucro	table	SELECT \n    s.order_number as ordem_servico,\n    to_char(s.date::date, 'DD/MM/YYYY') as data_venda,\n    c.name as cliente,\n    s.total_amount as valor_bruto,\n    COALESCE((SELECT SUM(si.amount::numeric) FROM sale_installments si WHERE si.sale_id = s.id AND si.status = 'paid'), 0) as valor_recebido,\n    COALESCE((SELECT SUM(soc.amount::numeric) FROM sale_operational_costs soc WHERE soc.sale_id = s.id), 0) as total_custos,\n    (s.total_amount::numeric - COALESCE((SELECT SUM(soc.amount::numeric) FROM sale_operational_costs soc WHERE soc.sale_id = s.id), 0)) as lucro_estimado,\n    COALESCE((SELECT SUM(si.amount::numeric) FROM sale_installments si WHERE si.sale_id = s.id AND si.status = 'paid'), 0) - COALESCE((SELECT SUM(soc.amount::numeric) FROM sale_operational_costs soc WHERE soc.sale_id = s.id), 0) as lucro_realizado,\n    CASE \n      WHEN s.total_amount::numeric > 0 THEN \n        ROUND(((s.total_amount::numeric - COALESCE((SELECT SUM(soc.amount::numeric) FROM sale_operational_costs soc WHERE soc.sale_id = s.id), 0)) / s.total_amount::numeric) * 100, 2)\n      ELSE 0\n    END as margem_percentual,\n    (SELECT COUNT(*) FROM sale_installments si WHERE si.sale_id = s.id) as qtd_parcelas,\n    (SELECT COUNT(*) FROM sale_installments si WHERE si.sale_id = s.id AND si.status = 'paid') as parcelas_pagas,\n    s.status as status_venda,\n    s.financial_status as status_financeiro\n  FROM \n    sales s \n    LEFT JOIN customers c ON s.customer_id = c.id \n  WHERE \n    s.date BETWEEN :startDate AND :endDate\n  ORDER BY \n    s.date DESC	{"endDate": {"type": "date", "label": "Data Final", "required": true}, "startDate": {"type": "date", "label": "Data Inicial", "required": true}}	admin,supervisor,financeiro	1	2025-05-02 20:49:43.661205+00	2025-05-02 20:49:43.661205+00
10	Fluxo de Caixa Consolidado (Parcelas e Custos)	Análise detalhada de todas as transações financeiras: receitas (parcelas) e despesas (custos)	table	SELECT\n  s.order_number as ordem_servico,\n  to_char(s.date::date, 'DD/MM/YYYY') as data_venda,\n  c.name as cliente,\n  CASE\n    WHEN transacao_tipo = 'P' THEN 'RECEITA'\n    WHEN transacao_tipo = 'C' THEN 'DESPESA'\n  END as tipo_transacao,\n  descricao,\n  valor,\n  data_prevista,\n  data_pagamento,\n  transacoes.status as status_transacao,\n  responsavel,\n  pm.name as metodo_pagamento,\n  s.financial_status as status_financeiro\nFROM (\n  -- Parcelas de pagamento\n  SELECT\n    si.sale_id,\n    'P' as transacao_tipo,\n    'Parcela ' || si.installment_number as descricao,\n    si.amount as valor,\n    to_char(si.due_date::date, 'DD/MM/YYYY') as data_prevista,\n    COALESCE(si.payment_date, '') as data_pagamento,\n    si.status,\n    u_seller.username as responsavel,\n    NULL::timestamp as data_ordem\n  FROM\n    sale_installments si\n    JOIN sales s ON si.sale_id = s.id\n    LEFT JOIN users u_seller ON s.seller_id = u_seller.id\n  \n  UNION ALL\n  \n  -- Custos operacionais\n  SELECT\n    soc.sale_id,\n    'C' as transacao_tipo,\n    COALESCE(ct.name, soc.description, 'Custo Operacional') as descricao,\n    soc.amount as valor,\n    to_char(soc.date::date, 'DD/MM/YYYY') as data_prevista,\n    CASE\n      WHEN soc.payment_date IS NOT NULL THEN to_char(soc.payment_date::date, 'DD/MM/YYYY')\n      ELSE ''\n    END as data_pagamento,\n    CASE\n      WHEN soc.payment_date IS NULL THEN 'pending'\n      ELSE 'paid'\n    END as status,\n    u_resp.username as responsavel,\n    soc.date as data_ordem\n  FROM\n    sale_operational_costs soc\n    LEFT JOIN cost_types ct ON soc.cost_type_id = ct.id\n    LEFT JOIN users u_resp ON soc.responsible_id = u_resp.id\n) AS transacoes\nJOIN sales s ON transacoes.sale_id = s.id\nLEFT JOIN customers c ON s.customer_id = c.id\nLEFT JOIN payment_methods pm ON s.payment_method_id = pm.id\nWHERE\n  s.date BETWEEN :startDate AND :endDate\nORDER BY\n  ordem_servico,\n  transacao_tipo,\n  data_ordem	{"endDate": {"type": "date", "label": "Data Final", "required": true}, "startDate": {"type": "date", "label": "Data Inicial", "required": true}}	admin,supervisor,financeiro	1	2025-05-02 20:49:25.522877+00	2025-05-02 20:49:25.522877+00
\.


--
-- Data for Name: sale_installments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sale_installments (id, sale_id, installment_number, amount, due_date, status, payment_date, notes, created_at, updated_at, admin_edit_history, payment_method_id, payment_notes) FROM stdin;
154	162	1	270.00	2025-05-07	pending	\N	\N	2025-05-07 18:48:08.573715	2025-05-07 18:48:08.573715	[]	\N	\N
96	98	1	450.00	2025-05-06	paid	05/05/2025	\N	2025-05-06 19:27:40.001929	2025-05-07 19:12:36.413634	[]	\N	\N
97	99	1	600.00	2025-05-06	paid	05/05/2025	\N	2025-05-06 19:28:34.419243	2025-05-07 19:15:16.999297	[]	\N	\N
157	164	1	107.50	2025-05-05	pending	\N	\N	2025-05-07 19:17:30.373175	2025-05-07 19:17:30.373175	[]	\N	\N
99	101	1	250.00	2025-05-06	paid	05/05/2025	\N	2025-05-06 19:30:57.369168	2025-05-07 19:20:15.499014	[]	\N	\N
100	102	1	100.00	2025-05-06	paid	05/05/2025	\N	2025-05-06 19:31:54.777936	2025-05-07 19:22:10.069302	[]	\N	\N
101	103	1	300.00	2025-05-06	paid	05/05/2025	\N	2025-05-06 19:32:38.890981	2025-05-07 19:23:49.819925	[]	\N	\N
104	106	1	350.00	2025-05-06	paid	05/05/2025	\N	2025-05-06 19:43:09.983489	2025-05-07 19:39:12.294305	[]	\N	\N
105	107	1	300.00	2025-05-06	paid	05/05/2025	\N	2025-05-06 19:44:23.30567	2025-05-07 19:41:34.018726	[]	\N	\N
106	108	1	200.00	2025-05-06	paid	05/05/2025	\N	2025-05-06 19:45:35.002689	2025-05-07 19:42:36.705442	[]	\N	\N
68	66	1	0.00	2025-05-06	pending	\N	\N	2025-05-06 16:51:17.442219	2025-05-06 16:51:17.442219	[]	\N	\N
107	109	1	390.00	2025-05-06	paid	02/05/2025	\N	2025-05-06 19:46:40.3116	2025-05-07 19:46:09.193366	[]	\N	\N
108	110	1	500.00	2025-05-06	paid	05/05/2025	\N	2025-05-06 19:48:38.074332	2025-05-07 19:48:26.435826	[]	\N	\N
110	112	1	520.00	2025-05-06	paid	02/05/2025	\N	2025-05-06 19:53:27.676797	2025-05-07 19:52:14.726437	[]	\N	\N
111	113	1	50.00	2025-05-06	paid	05/05/2025	\N	2025-05-06 19:59:05.915212	2025-05-07 19:54:41.348998	[]	\N	\N
114	116	1	500.00	2025-05-06	paid	05/05/2025	\N	2025-05-06 20:52:06.537888	2025-05-07 19:55:36.850715	[]	\N	\N
124	133	1	1050.00	2025-05-07	paid	01/05/2025	\N	2025-05-07 14:16:13.711674	2025-05-07 21:11:54.741021	[]	\N	\N
125	134	1	110.00	2025-05-07	paid	02/05/2025	\N	2025-05-07 14:43:05.667118	2025-05-07 21:13:30.288511	[]	\N	\N
126	135	1	300.00	2025-05-07	paid	02/05/2025	\N	2025-05-07 14:48:39.59735	2025-05-07 21:14:54.312913	[]	\N	\N
113	115	1	450	2025-05-06	pending	\N	\N	2025-05-06 20:13:50.619513	2025-05-06 20:13:50.619513	[]	\N	\N
130	139	1	1670.00	2025-05-07	paid	02/05/2025	\N	2025-05-07 17:40:38.274083	2025-05-08 11:10:52.561224	[]	3	\N
132	141	1	350.00	2025-05-07	paid	02/05/2025	\N	2025-05-07 17:42:38.444009	2025-05-08 11:12:17.074725	[]	2	\N
117	119	1	200.00	2025-05-06	pending	\N	\N	2025-05-06 20:56:07.799728	2025-05-06 20:56:07.799728	[]	\N	\N
52	50	1	350.00	2025-05-06	pending	\N	\N	2025-05-06 14:29:09.1829	2025-05-06 14:29:09.1829	[]	\N	\N
53	51	1	1390.00	2025-05-06	pending	\N	\N	2025-05-06 14:30:57.760031	2025-05-06 14:30:57.760031	[]	\N	\N
54	52	1	250.00	2025-05-06	pending	\N	\N	2025-05-06 14:31:54.59636	2025-05-06 14:31:54.59636	[]	\N	\N
55	53	1	650.00	2025-05-06	pending	\N	\N	2025-05-06 14:34:11.328984	2025-05-06 14:34:11.328984	[]	\N	\N
80	79	1	450.00	2025-05-06	pending	\N	\N	2025-05-06 17:29:17.295529	2025-05-06 17:29:17.295529	[]	\N	\N
81	80	1	750.00	2025-05-06	pending	\N	\N	2025-05-06 17:31:26.738586	2025-05-06 17:31:26.738586	[]	\N	\N
82	81	1	2860.00	2025-05-06	pending	\N	\N	2025-05-06 17:38:19.941198	2025-05-06 17:38:19.941198	[]	\N	\N
83	82	1	240.00	2025-05-06	pending	\N	\N	2025-05-06 17:43:48.783396	2025-05-06 17:43:48.783396	[]	\N	\N
94	96	1	500.00	2025-05-06	pending	\N	\N	2025-05-06 18:43:10.304708	2025-05-06 18:43:10.304708	[]	\N	\N
95	97	1	750.00	2025-05-06	pending	\N	\N	2025-05-06 18:45:55.797051	2025-05-06 18:45:55.797051	[]	\N	\N
109	111	1	500.00	2025-05-06	pending	\N	\N	2025-05-06 19:50:00.773979	2025-05-06 19:50:00.773979	[]	\N	\N
112	114	1	50.00	2025-05-06	pending	\N	\N	2025-05-06 20:09:42.452978	2025-05-06 20:09:42.452978	[]	\N	\N
50	48	1	450.00	2025-05-06	paid	05/05/2025	\N	2025-05-06 13:35:53.935874	2025-05-06 20:24:06.216853	[{"timestamp": "2025-05-06T19:51:02.895Z", "updatedByUserId": 1, "previousPaymentDate": "05/05/2025"}, {"timestamp": "2025-05-06T19:51:04.607Z", "updatedByUserId": 1, "previousPaymentDate": "06/05/2025"}, {"timestamp": "2025-05-06T19:55:24.195Z", "updatedByUserId": 1, "previousPaymentDate": "06/05/2025"}, {"timestamp": "2025-05-06T19:55:26.278Z", "updatedByUserId": 1, "previousPaymentDate": "05/05/2025"}, {"timestamp": "2025-05-06T20:16:37.344Z", "updatedByUserId": 1, "previousPaymentDate": "05/05/2025"}, {"timestamp": "2025-05-06T20:16:39.368Z", "updatedByUserId": 1, "previousPaymentDate": "06/05/2025"}, {"timestamp": "2025-05-06T20:24:06.170Z", "updatedByUserId": 1, "previousPaymentDate": "06/05/2025"}]	2	\N
51	49	1	1250.00	2025-05-06	paid	02/05/2025	\N	2025-05-06 14:01:41.89831	2025-05-06 20:33:22.887371	[{"timestamp": "2025-05-06T20:33:22.856Z", "updatedByUserId": 1, "previousPaymentDate": "02/05/2025"}]	2	\N
70	68	1	1000.00	2025-05-06	paid	02/05/2025	\N	2025-05-06 17:09:41.980803	2025-05-06 20:33:49.316789	[{"timestamp": "2025-05-06T20:33:49.286Z", "updatedByUserId": 1, "previousPaymentDate": "02/05/2025"}]	2	\N
116	118	1	450.00	2025-05-06	pending	\N	\N	2025-05-06 20:55:08.311931	2025-05-06 20:55:08.311931	[]	\N	\N
119	123	1	300.00	2025-05-06	pending	\N	\N	2025-05-06 20:59:02.243274	2025-05-06 20:59:02.243274	[]	\N	\N
56	54	1	200.00	2025-05-06	paid	02/05/2025	\N	2025-05-06 14:34:59.255972	2025-05-07 11:47:01.29716	[]	\N	\N
57	55	1	750.00	2025-05-06	paid	02/05/2025	\N	2025-05-06 14:35:05.987569	2025-05-07 11:48:12.286324	[]	\N	\N
58	56	1	650.00	2025-05-06	paid	02/05/2025	\N	2025-05-06 14:36:50.029081	2025-05-07 11:52:35.130889	[]	\N	\N
74	73	1	300.00	2025-05-06	paid	02/05/2025	\N	2025-05-06 17:20:37.693171	2025-05-07 11:54:25.178695	[]	\N	\N
121	125	1	500.00	2025-05-07	pending	\N	\N	2025-05-07 12:24:35.835008	2025-05-07 12:24:35.835008	[]	\N	\N
59	57	1	750.00	2025-05-06	paid	02/05/2025	\N	2025-05-06 14:37:21.460299	2025-05-07 12:27:55.597825	[]	\N	\N
61	59	1	350.00	2025-05-06	paid	03/05/2025	\N	2025-05-06 14:46:08.176869	2025-05-07 12:29:40.80231	[]	\N	\N
63	61	1	350.00	2025-05-06	paid	03/05/2025	\N	2025-05-06 16:34:52.918929	2025-05-07 12:34:41.487732	[]	\N	\N
64	62	1	750.00	2025-05-06	paid	02/05/2025	\N	2025-05-06 16:44:18.82164	2025-05-07 12:36:50.417632	[]	\N	\N
123	127	1	750.00	2025-05-07	pending	\N	\N	2025-05-07 13:52:02.892722	2025-05-07 13:52:02.892722	[]	\N	\N
93	83	1	650	2025-05-02	paid	2023-06-15	\N	2025-05-06 17:46:06.757531	2025-05-06 17:46:06.757531	[]	1	PAGAMENTO DIVIDIDO | CARTAO: R$ 350,00 | PIX: R$ 300,00
65	63	1	350.00	2025-05-06	paid	05/05/2025	\N	2025-05-06 16:46:29.440634	2025-05-07 17:29:54.321619	[]	\N	\N
69	67	1	350.00	2025-05-06	paid	05/05/2025	\N	2025-05-06 16:53:34.624986	2025-05-07 17:36:24.708407	[]	\N	\N
71	69	1	600.00	2025-05-06	paid	05/05/2025	\N	2025-05-06 17:11:50.132395	2025-05-07 17:38:39.230576	[]	\N	\N
72	71	1	50.00	2025-05-06	paid	02/05/2025	\N	2025-05-06 17:15:44.053206	2025-05-07 17:40:06.422407	[]	\N	\N
75	74	1	720.00	2025-05-06	paid	06/05/2025	\N	2025-05-06 17:20:45.547161	2025-05-07 17:41:11.98089	[]	\N	\N
131	140	1	430.00	2025-05-07	pending	\N	\N	2025-05-07 17:42:01.326	2025-05-07 17:42:01.326	[]	\N	\N
78	77	1	500.00	2025-05-06	paid	02/05/2025	\N	2025-05-06 17:24:48.703189	2025-05-07 17:46:31.252469	[]	\N	\N
79	78	1	490.00	2025-05-06	paid	02/05/2025	\N	2025-05-06 17:26:59.244746	2025-05-07 17:58:11.423089	[]	\N	\N
77	76	1	500.00	2025-05-06	paid	02/05/2025	\N	2025-05-06 17:23:15.639147	2025-05-07 17:43:44.142211	[]	\N	\N
133	142	1	500.00	2025-05-07	pending	\N	\N	2025-05-07 17:45:47.997881	2025-05-07 17:45:47.997881	[]	\N	\N
134	143	1	350.00	2025-05-07	pending	\N	\N	2025-05-07 17:48:37.075239	2025-05-07 17:48:37.075239	[]	\N	\N
135	144	1	300.00	2025-05-07	pending	\N	\N	2025-05-07 17:50:23.059994	2025-05-07 17:50:23.059994	[]	\N	\N
136	145	1	480.00	2025-05-07	pending	\N	\N	2025-05-07 17:57:39.989367	2025-05-07 17:57:39.989367	[]	\N	\N
137	146	1	150.00	2025-05-07	pending	\N	\N	2025-05-07 18:00:06.752638	2025-05-07 18:00:06.752638	[]	\N	\N
140	148	1	190.00	2025-05-07	pending	\N	\N	2025-05-07 18:05:31.177838	2025-05-07 18:05:31.177838	[]	\N	\N
141	149	1	690.00	2025-05-07	pending	\N	\N	2025-05-07 18:07:30.207586	2025-05-07 18:07:30.207586	[]	\N	\N
142	150	1	510.00	2025-05-07	pending	\N	\N	2025-05-07 18:07:53.836356	2025-05-07 18:07:53.836356	[]	\N	\N
174	176	1	50.00	2025-05-07	paid	05/05/2025	\N	2025-05-07 19:58:04.239065	2025-05-07 20:46:45.954472	[]	\N	\N
98	100	1	450.00	2025-05-06	paid	05/05/2025	\N	2025-05-06 19:29:46.71103	2025-05-07 19:17:40.267289	[]	\N	\N
186	186	1	780.00	2025-05-07	pending	\N	\N	2025-05-07 20:47:48.126721	2025-05-07 20:47:48.126721	[]	\N	\N
145	152	1	350.00	2025-05-07	pending	\N	\N	2025-05-07 18:11:02.245164	2025-05-07 18:11:02.245164	[]	\N	\N
146	153	1	300.00	2025-05-07	pending	\N	\N	2025-05-07 18:11:33.313513	2025-05-07 18:11:33.313513	[]	\N	\N
147	154	1	700.00	2025-05-07	paid	2023-06-15	\N	2025-05-07 18:17:14.088134	2025-05-07 18:17:14.088134	[]	1	PAGAMENTO DIVIDIDO | CARTAO: R$ 450,00 | PIX: R$ 250,00
149	157	1	300.00	2025-05-07	pending	\N	\N	2025-05-07 18:20:00.892326	2025-05-07 18:20:00.892326	[]	\N	\N
150	158	1	110.00	2025-05-07	pending	\N	\N	2025-05-07 18:20:07.29684	2025-05-07 18:20:07.29684	[]	\N	\N
151	159	1	350.00	2025-05-07	pending	\N	\N	2025-05-07 18:20:49.625962	2025-05-07 18:20:49.625962	[]	\N	\N
152	160	1	350.00	2025-05-07	pending	\N	\N	2025-05-07 18:22:21.799175	2025-05-07 18:22:21.799175	[]	\N	\N
153	161	1	510.00	2025-05-07	pending	\N	\N	2025-05-07 18:23:52.309637	2025-05-07 18:23:52.309637	[]	\N	\N
187	187	1	350.00	2025-05-07	pending	\N	\N	2025-05-07 20:51:30.72876	2025-05-07 20:51:30.72876	[]	\N	\N
188	188	1	440.00	2025-05-07	pending	\N	\N	2025-05-07 20:56:52.887153	2025-05-07 20:56:52.887153	[]	\N	\N
189	189	1	540.00	2025-05-07	pending	\N	\N	2025-05-07 20:59:34.091263	2025-05-07 20:59:34.091263	[]	\N	\N
162	167	1	250.00	2025-05-07	pending	\N	\N	2025-05-07 19:36:33.354043	2025-05-07 19:36:33.354043	[]	\N	\N
102	104	1	350.00	2025-05-06	paid	05/05/2025	\N	2025-05-06 19:36:34.796033	2025-05-07 19:37:09.86202	[]	\N	\N
185	185	1	350	2025-05-07	pending	\N	\N	2025-05-07 20:44:06.881722	2025-05-07 20:44:06.881722	[]	\N	\N
103	105	1	50.00	2025-05-06	paid	05/05/2025	\N	2025-05-06 19:38:46.716545	2025-05-07 19:38:34.627085	[]	\N	\N
165	169	1	410.00	2025-05-07	pending	\N	\N	2025-05-07 19:38:40.754853	2025-05-07 19:38:40.754853	[]	\N	\N
166	170	1	250.00	2025-05-07	pending	\N	\N	2025-05-07 19:38:59.594219	2025-05-07 19:38:59.594219	[]	\N	\N
190	190	1	1050.00	2025-05-07	pending	\N	\N	2025-05-07 21:03:17.586883	2025-05-07 21:03:17.586883	[]	\N	\N
191	191	1	350.00	2025-05-07	pending	\N	\N	2025-05-07 21:07:01.363802	2025-05-07 21:07:01.363802	[]	\N	\N
216	213	1	550.00	2025-05-08	pending	\N	\N	2025-05-08 16:28:54.926268	2025-05-08 16:28:54.926268	[]	\N	\N
193	193	1	100.00	2025-05-08	pending	\N	\N	2025-05-08 11:23:55.110956	2025-05-08 11:23:55.110956	[]	\N	\N
171	174	1	950.00	2025-05-07	pending	\N	\N	2025-05-07 19:54:19.965944	2025-05-07 19:54:19.965944	[]	\N	\N
160	165	1	1310.00	2025-05-07	paid	05/05/2025	\N	2025-05-07 19:31:04.327771	2025-05-07 20:00:42.619078	[]	\N	\N
178	178	1	310.00	2025-05-07	pending	\N	\N	2025-05-07 20:02:36.317685	2025-05-07 20:02:36.317685	[]	\N	\N
161	166	1	710.00	2025-05-07	paid	05/05/2025	\N	2025-05-07 19:32:40.99413	2025-05-07 20:04:51.340908	[]	\N	\N
179	179	1	300.00	2025-05-07	pending	\N	\N	2025-05-07 20:07:30.006979	2025-05-07 20:07:30.006979	[]	\N	\N
180	180	1	200.00	2025-05-07	pending	\N	\N	2025-05-07 20:25:11.643968	2025-05-07 20:25:11.643968	[]	\N	\N
181	181	1	350.00	2025-05-07	pending	\N	\N	2025-05-07 20:30:33.008114	2025-05-07 20:30:33.008114	[]	\N	\N
182	182	1	290.00	2025-05-07	pending	\N	\N	2025-05-07 20:35:07.323613	2025-05-07 20:35:07.323613	[]	\N	\N
167	171	1	410.00	2025-05-07	paid	05/05/2025	\N	2025-05-07 19:43:34.691554	2025-05-07 20:36:40.1329	[]	\N	\N
183	183	1	0.00	2025-05-07	pending	\N	\N	2025-05-07 20:37:47.102521	2025-05-07 20:37:47.102521	[]	\N	\N
170	173	1	2550.00	2025-05-07	paid	03/05/2025	\N	2025-05-07 19:51:20.231905	2025-05-07 20:39:37.729644	[]	\N	\N
184	184	1	350.00	2025-05-07	pending	\N	\N	2025-05-07 20:40:54.346137	2025-05-07 20:40:54.346137	[]	\N	\N
198	198	1	300.00	2025-05-08	pending	\N	\N	2025-05-08 13:07:25.51138	2025-05-08 13:07:25.51138	[]	\N	\N
199	199	1	300.00	2025-05-08	pending	\N	\N	2025-05-08 13:08:49.333893	2025-05-08 13:08:49.333893	[]	\N	\N
200	200	1	300.00	2025-05-08	pending	\N	\N	2025-05-08 13:10:00.055977	2025-05-08 13:10:00.055977	[]	\N	\N
201	201	1	50.00	2025-05-08	pending	\N	\N	2025-05-08 13:11:56.054449	2025-05-08 13:11:56.054449	[]	\N	\N
202	202	1	550.00	2025-05-08	pending	\N	\N	2025-05-08 13:13:37.760053	2025-05-08 13:13:37.760053	[]	\N	\N
203	203	1	550.00	2025-05-08	pending	\N	\N	2025-05-08 13:17:30.729199	2025-05-08 13:17:30.729199	[]	\N	\N
205	205	1	320.00	2025-05-08	pending	\N	\N	2025-05-08 13:23:53.577374	2025-05-08 13:23:53.577374	[]	\N	\N
211	211	1	50.00	2025-05-08	pending	\N	\N	2025-05-08 16:21:57.768641	2025-05-08 16:21:57.768641	[]	\N	\N
212	212	1	100.00	2025-06-08	pending	\N	\N	2025-05-08 16:26:39.68215	2025-05-08 16:26:39.68215	[]	\N	\N
213	212	2	100.00	2025-07-08	pending	\N	\N	2025-05-08 16:26:39.758543	2025-05-08 16:26:39.758543	[]	\N	\N
214	212	3	100.00	2025-08-08	pending	\N	\N	2025-05-08 16:26:39.80613	2025-05-08 16:26:39.80613	[]	\N	\N
215	212	4	100.00	2025-09-08	pending	\N	\N	2025-05-08 16:26:39.847522	2025-05-08 16:26:39.847522	[]	\N	\N
228	225	1	300.00	2025-05-08	paid	07/05/2025	\N	2025-05-08 16:53:24.58385	2025-05-08 18:18:59.714053	[]	2	\N
229	226	1	50.00	2025-05-08	paid	07/05/2025	\N	2025-05-08 16:55:28.864181	2025-05-08 18:20:43.089995	[]	2	\N
218	215	1	350.00	2025-05-08	paid	07/05/2025	\N	2025-05-08 16:37:53.685555	2025-05-08 18:27:39.778036	[]	2	\N
219	216	1	300.00	2025-05-08	paid	07/05/2025	\N	2025-05-08 16:39:11.666767	2025-05-08 18:28:43.148651	[]	2	\N
220	217	1	680.00	2025-05-08	paid	07/05/2025	\N	2025-05-08 16:40:23.954954	2025-05-08 18:32:25.178622	[]	1	\N
223	220	1	350.00	2025-05-08	paid	07/05/2025	\N	2025-05-08 16:44:57.005438	2025-05-08 19:25:40.67102	[]	1	\N
224	221	1	300.00	2025-05-08	paid	07/05/2025	\N	2025-05-08 16:46:53.317033	2025-05-08 19:27:12.040733	[]	2	\N
225	222	1	450.00	2025-05-08	paid	07/05/2025	\N	2025-05-08 16:48:40.527948	2025-05-08 19:28:23.523426	[]	2	\N
226	223	1	250.00	2025-05-08	paid	07/05/2025	\N	2025-05-08 16:49:58.777502	2025-05-08 19:29:54.911875	[]	2	\N
206	206	1	400.00	2025-05-08	paid	06/05/2025	\N	2025-05-08 13:51:14.703928	2025-05-08 19:31:27.518689	[]	2	\N
208	208	1	300.00	2025-05-08	paid	06/05/2025	\N	2025-05-08 13:53:32.260803	2025-05-08 19:35:04.637782	[]	2	\N
195	195	1	70.00	2025-05-08	paid	05/05/2025	\N	2025-05-08 12:59:18.639856	2025-05-08 19:37:21.363213	[]	2	\N
196	196	1	400.00	2025-05-08	paid	06/05/2025	\N	2025-05-08 13:03:35.764441	2025-05-08 19:38:12.676213	[]	2	\N
197	197	1	300.00	2025-05-08	paid	06/05/2025	\N	2025-05-08 13:05:30.797445	2025-05-08 19:40:15.462652	[]	2	\N
209	209	1	650.00	2025-05-08	paid	08/05/2025	\N	2025-05-08 14:05:53.618092	2025-05-09 20:48:13.910149	[]	2	\N
221	218	1	550	2025-05-08	paid	07/05/2025	\N	2025-05-08 16:42:01.886938	2025-05-08 18:35:19.914931	[]	3	\N
233	230	1	1190	2025-05-08	paid	06/05/2025	\N	2025-05-08 17:00:51.552295	2025-05-08 18:06:50.653016	[]	2	\N
234	231	1	520.00	2025-05-08	paid	02/05/2025	\N	2025-05-08 17:08:18.916808	2025-05-08 18:12:09.186306	[]	2	\N
236	233	1	400.00	2025-05-08	paid	06/05/2025	\N	2025-05-08 17:44:37.722541	2025-05-08 18:14:00.710651	[]	2	\N
232	229	1	450.00	2025-05-08	paid	07/05/2025	\N	2025-05-08 16:59:19.542959	2025-05-08 18:15:18.779928	[]	1	\N
227	224	1	300.00	2025-05-08	paid	07/05/2025	\N	2025-05-08 16:51:45.473007	2025-05-08 18:18:04.950823	[]	2	\N
230	227	1	450.00	2025-05-08	paid	07/05/2025	\N	2025-05-08 16:56:58.978972	2025-05-08 18:21:33.199613	[]	2	\N
217	214	1	400.00	2025-05-08	paid	07/05/2025	\N	2025-05-08 16:36:06.842941	2025-05-08 18:25:42.720448	[]	3	\N
222	219	1	320.00	2025-05-08	paid	07/05/2025	\N	2025-05-08 16:43:34.502901	2025-05-08 19:23:18.653303	[]	2	\N
207	207	1	350.00	2025-05-08	paid	06/05/2025	\N	2025-05-08 13:52:20.961627	2025-05-08 19:33:05.754713	[]	2	\N
239	236	1	690.00	2025-05-08	paid	06/05/2025	\N	2025-05-08 19:38:47.49424	2025-05-08 19:42:53.179206	[]	2	\N
242	239	1	800.00	2025-05-08	paid	07/05/2025	\N	2025-05-08 20:25:35.391198	2025-05-09 11:16:29.631469	[]	2	\N
251	245	1	440.00	2025-05-09	pending	\N	\N	2025-05-09 11:26:58.142152	2025-05-09 11:26:58.142152	[]	\N	\N
254	248	1	250.00	2025-05-09	pending	\N	\N	2025-05-09 13:40:59.175608	2025-05-09 13:40:59.175608	[]	\N	\N
259	253	1	590.00	2025-05-09	pending	\N	\N	2025-05-09 16:12:22.154679	2025-05-09 16:12:22.154679	[]	\N	\N
260	254	1	440.00	2025-05-09	pending	\N	\N	2025-05-09 16:16:53.27992	2025-05-09 16:16:53.27992	[]	\N	\N
261	255	1	440.00	2025-05-09	pending	\N	\N	2025-05-09 16:26:15.465314	2025-05-09 16:26:15.465314	[]	\N	\N
262	256	1	400.00	2025-05-09	pending	\N	\N	2025-05-09 16:46:00.184981	2025-05-09 16:46:00.184981	[]	\N	\N
263	257	1	300.00	2025-05-09	pending	\N	\N	2025-05-09 16:47:16.658912	2025-05-09 16:47:16.658912	[]	\N	\N
264	258	1	300.00	2025-05-09	pending	\N	\N	2025-05-09 16:49:36.640355	2025-05-09 16:49:36.640355	[]	\N	\N
265	259	1	450.00	2025-05-09	pending	\N	\N	2025-05-09 16:52:03.328241	2025-05-09 16:52:03.328241	[]	\N	\N
268	262	1	0.00	2025-05-09	pending	\N	\N	2025-05-09 17:24:26.926222	2025-05-09 17:24:26.926222	[]	\N	\N
250	244	1	440.00	2025-05-08	paid	08/05/2025	\N	2025-05-08 20:41:08.084196	2025-05-09 17:32:33.575253	[]	1	\N
253	247	1	300.00	2025-05-09	paid	05/05/2025	\N	2025-05-09 12:19:23.616401	2025-05-09 17:35:48.790628	[]	2	\N
255	249	1	110.00	2025-05-09	paid	06/05/2025	\N	2025-05-09 14:07:56.361734	2025-05-09 17:37:22.980993	[]	3	\N
256	250	1	390.00	2025-05-09	paid	06/05/2025	\N	2025-05-09 14:09:45.950717	2025-05-09 17:39:01.193305	[]	2	\N
258	252	1	350.00	2025-05-09	paid	07/05/2025	\N	2025-05-09 14:21:05.306144	2025-05-09 17:40:33.114028	[]	2	\N
266	260	1	110.00	2025-05-09	paid	08/05/2025	\N	2025-05-09 17:15:44.154737	2025-05-09 17:42:28.504822	[]	3	\N
267	261	1	3835.00	2025-05-09	paid	05/05/2025	\N	2025-05-09 17:22:14.533529	2025-05-09 17:43:23.894465	[]	3	\N
279	273	1	350.00	2025-05-09	pending	\N	\N	2025-05-09 17:50:16.927673	2025-05-09 17:50:16.927673	[]	\N	\N
280	274	1	450.00	2025-05-09	pending	\N	\N	2025-05-09 17:51:11.458113	2025-05-09 17:51:11.458113	[]	\N	\N
269	263	1	350.00	2025-05-09	paid	05/05/2025	\N	2025-05-09 17:24:39.787206	2025-05-09 17:52:11.348216	[]	2	\N
274	268	1	200.00	2025-05-09	paid	08/05/2025	\N	2025-05-09 17:36:12.203552	2025-05-09 17:53:57.599501	[]	2	\N
277	271	1	200.00	2025-05-09	paid	08/05/2025	\N	2025-05-09 17:38:51.234982	2025-05-09 17:56:04.576339	[]	2	\N
278	272	1	250.00	2025-05-09	paid	08/05/2025	\N	2025-05-09 17:40:20.9065	2025-05-09 17:56:57.570857	[]	2	\N
288	282	1	450.00	2025-05-09	pending	\N	\N	2025-05-09 17:57:02.428928	2025-05-09 17:57:02.428928	[]	\N	\N
281	275	1	400.00	2025-05-09	paid	08/05/2025	\N	2025-05-09 17:51:16.822573	2025-05-09 17:57:57.794748	[]	2	\N
282	276	1	1650.00	2025-05-09	paid	05/05/2025	\N	2025-05-09 17:51:47.475281	2025-05-09 17:59:01.593032	[]	2	\N
289	283	1	900.00	2025-05-09	pending	\N	\N	2025-05-09 18:00:41.112663	2025-05-09 18:00:41.112663	[]	\N	\N
292	286	1	50.00	2025-05-09	pending	\N	\N	2025-05-09 18:03:15.992196	2025-05-09 18:03:15.992196	[]	\N	\N
293	287	1	600.00	2025-05-09	pending	\N	\N	2025-05-09 18:04:01.17636	2025-05-09 18:04:01.17636	[]	\N	\N
294	288	1	350.00	2025-05-09	pending	\N	\N	2025-05-09 18:05:07.610825	2025-05-09 18:05:07.610825	[]	\N	\N
285	279	1	550.00	2025-05-09	paid	08/05/2025	\N	2025-05-09 17:54:27.0809	2025-05-09 18:10:19.430276	[]	2	\N
287	281	1	750.00	2025-05-09	paid	08/05/2025	\N	2025-05-09 17:55:43.340614	2025-05-09 18:12:53.055663	[]	2	\N
290	284	1	1200.00	2025-05-09	paid	08/05/2025	\N	2025-05-09 18:01:52.277761	2025-05-09 18:14:06.798138	[]	1	\N
283	277	1	650.00	2025-05-09	paid	08/05/2025	\N	2025-05-09 17:52:26.09089	2025-05-09 19:12:52.294246	[]	2	\N
270	264	1	300.00	2025-05-09	paid	07/05/2025	\N	2025-05-09 17:32:22.683772	2025-05-09 18:21:34.922874	[]	2	\N
271	265	1	700.00	2025-05-09	paid	07/05/2025	\N	2025-05-09 17:32:40.115491	2025-05-09 18:23:41.778438	[]	2	\N
272	266	1	310.00	2025-05-09	paid	08/05/2025	\N	2025-05-09 17:34:30.347609	2025-05-09 18:25:57.98376	[]	2	\N
295	289	1	450.00	2025-05-09	pending	\N	\N	2025-05-09 18:40:16.14235	2025-05-09 18:40:16.14235	[]	\N	\N
276	270	1	80.00	2025-05-09	paid	05/05/2025	\N	2025-05-09 17:37:55.887294	2025-05-09 18:42:45.10738	[]	2	\N
275	269	1	390.00	2025-05-09	paid	08/05/2025	\N	2025-05-09 17:37:41.32407	2025-05-09 18:43:26.114768	[]	3	\N
273	267	1	320.00	2025-05-09	paid	08/05/2025	\N	2025-05-09 17:35:12.898634	2025-05-09 18:44:48.252202	[]	2	\N
296	291	1	450.00	2025-05-09	pending	\N	\N	2025-05-09 18:45:55.052992	2025-05-09 18:45:55.052992	[]	\N	\N
257	251	1	600.00	2025-05-09	paid	06/05/2025	\N	2025-05-09 14:11:57.936196	2025-05-09 18:46:11.351759	[]	2	\N
297	292	1	850.00	2025-05-09	paid	12/05/2025	\N	2025-05-09 20:23:34.285272	2025-05-13 20:27:31.689917	[]	2	\N
244	241	1	340.00	2025-05-08	paid	08/05/2025	\N	2025-05-08 20:31:10.729806	2025-05-09 18:50:50.546903	[]	2	\N
245	242	1	75.00	2025-06-08	paid	08/05/2025	\N	2025-05-08 20:31:48.98631	2025-05-09 18:56:28.692267	[]	1	\N
246	242	2	75.00	2025-07-08	paid	08/05/2025	\N	2025-05-08 20:31:49.007229	2025-05-09 18:56:36.142986	[]	1	\N
247	242	3	75.00	2025-08-08	paid	08/05/2025	\N	2025-05-08 20:31:49.028628	2025-05-09 18:56:41.436059	[]	1	\N
248	242	4	75.00	2025-09-08	paid	08/05/2025	\N	2025-05-08 20:31:49.054587	2025-05-09 18:56:48.915376	[]	1	\N
249	243	1	440.00	2025-05-08	paid	08/05/2025	\N	2025-05-08 20:34:56.162874	2025-05-09 19:00:39.088316	[]	2	\N
252	246	1	350.00	2025-05-09	paid	05/05/2025	\N	2025-05-09 12:15:02.261999	2025-05-09 19:03:34.978075	[]	2	\N
235	232	1	160.00	2025-05-08	paid	08/05/2025	\N	2025-05-08 17:19:40.471678	2025-05-09 19:24:18.907059	[]	2	\N
237	234	1	650.00	2025-05-08	paid	08/05/2025	\N	2025-05-08 18:25:10.372406	2025-05-09 19:25:51.35407	[]	2	\N
238	235	1	550.00	2025-05-08	paid	08/05/2025	\N	2025-05-08 18:31:34.196971	2025-05-09 19:28:54.737966	[]	2	\N
300	295	1	290.00	2025-05-09	pending	\N	\N	2025-05-09 20:26:30.784585	2025-05-09 20:26:30.784585	[]	\N	\N
241	238	1	780.00	2025-05-08	paid	08/05/2025	\N	2025-05-08 20:17:57.445719	2025-05-09 20:43:26.857817	[]	2	\N
298	293	1	350.00	2025-05-09	paid	09/05/2025	\N	2025-05-09 20:24:47.769279	2025-05-13 20:49:18.499715	[]	1	\N
299	294	1	350.00	2025-05-09	paid	09/05/2025	\N	2025-05-09 20:26:12.938437	2025-05-13 20:51:17.239244	[]	3	\N
301	296	1	400.00	2025-05-09	pending	\N	\N	2025-05-09 20:28:34.072028	2025-05-09 20:28:34.072028	[]	\N	\N
302	297	1	840.00	2025-05-09	pending	\N	\N	2025-05-09 20:33:21.89577	2025-05-09 20:33:21.89577	[]	\N	\N
303	298	1	540.00	2025-05-09	pending	\N	\N	2025-05-09 20:38:10.069673	2025-05-09 20:38:10.069673	[]	\N	\N
240	237	1	580.00	2025-05-08	paid	08/05/2025	\N	2025-05-08 20:11:36.609977	2025-05-09 20:41:52.854605	[]	2	\N
305	300	1	770.00	2025-05-09	paid	06/05/2025	\N	2025-05-09 20:53:20.689973	2025-05-09 21:05:12.612361	[]	1	\N
210	210	1	500.00	2025-05-08	paid	08/05/2025	\N	2025-05-08 14:50:46.505482	2025-05-09 21:10:59.994588	[]	2	\N
312	307	1	250.00	2025-05-13	pending	\N	\N	2025-05-13 13:48:56.535715	2025-05-13 13:48:56.535715	[]	\N	\N
324	319	1	300.00	2025-05-13	pending	\N	\N	2025-05-13 14:13:11.379362	2025-05-13 14:13:11.379362	[]	\N	\N
347	339	1	50.00	2025-05-13	pending	\N	\N	2025-05-13 20:35:53.75761	2025-05-13 20:35:53.75761	[]	\N	\N
325	320	1	300.00	2025-05-13	pending	\N	\N	2025-05-13 17:13:56.985295	2025-05-13 17:13:56.985295	[]	\N	\N
326	321	1	300.00	2025-05-13	pending	\N	\N	2025-05-13 18:13:46.518841	2025-05-13 18:13:46.518841	[]	\N	\N
327	322	1	600.00	2025-05-13	pending	\N	\N	2025-05-13 18:19:50.95984	2025-05-13 18:19:50.95984	[]	\N	\N
328	323	1	250.00	2025-05-13	pending	\N	\N	2025-05-13 18:26:31.070868	2025-05-13 18:26:31.070868	[]	\N	\N
329	324	1	60.00	2025-05-13	pending	\N	\N	2025-05-13 18:30:47.642024	2025-05-13 18:30:47.642024	[]	\N	\N
320	315	1	350.00	2025-05-13	paid	12/05/2025	\N	2025-05-13 13:57:11.15198	2025-05-13 18:36:30.294796	[]	2	\N
330	325	1	300.00	2025-05-13	pending	\N	\N	2025-05-13 18:44:33.17685	2025-05-13 18:44:33.17685	[]	\N	\N
332	327	1	400.00	2025-05-13	pending	\N	\N	2025-05-13 18:57:25.307956	2025-05-13 18:57:25.307956	[]	\N	\N
321	316	1	300.00	2025-05-13	paid	12/05/2025	\N	2025-05-13 14:07:02.23898	2025-05-13 19:07:16.392232	[]	2	\N
331	326	1	300.00	2025-05-13	paid	09/05/2025	\N	2025-05-13 18:56:44.079525	2025-05-13 19:27:51.032306	[]	1	\N
243	240	1	600	2025-05-08	paid	08/05/2025	\N	2025-05-08 20:25:42.706955	2025-05-09 18:47:24.875953	[]	2	\N
314	309	1	350.00	2025-05-13	paid	12/05/2025	\N	2025-05-13 13:50:38.713174	2025-05-13 19:56:44.167526	[]	2	\N
337	329	1	690.00	2025-05-13	pending	\N	\N	2025-05-13 19:57:41.946067	2025-05-13 19:57:41.946067	[]	\N	\N
315	310	1	250.00	2025-05-13	paid	09/05/2025	\N	2025-05-13 13:52:01.050637	2025-05-13 19:58:24.771771	[]	2	\N
316	311	1	500.00	2025-05-13	paid	12/05/2025	\N	2025-05-13 13:52:12.499607	2025-05-13 20:00:47.568197	[]	1	\N
317	312	1	950.00	2025-05-13	paid	12/05/2025	\N	2025-05-13 13:53:36.377695	2025-05-13 20:02:50.765432	[]	2	\N
318	313	1	300.00	2025-05-13	paid	12/05/2025	\N	2025-05-13 13:55:37.717015	2025-05-13 20:04:19.117386	[]	2	\N
319	314	1	300.00	2025-05-13	paid	12/05/2025	\N	2025-05-13 13:56:18.521668	2025-05-13 20:05:21.446163	[]	2	\N
322	317	1	250.00	2025-05-13	paid	12/05/2025	\N	2025-05-13 14:10:13.445204	2025-05-13 20:07:44.052764	[]	2	\N
306	301	1	300.00	2025-05-09	paid	09/05/2025	\N	2025-05-09 20:55:38.780123	2025-05-13 20:09:45.243989	[]	2	\N
308	303	1	300.00	2025-05-13	paid	12/05/2025	\N	2025-05-13 12:37:07.921098	2025-05-13 20:10:30.13874	[]	2	\N
304	299	1	900.00	2025-05-09	paid	09/05/2025	\N	2025-05-09 20:42:49.243608	2025-05-13 20:11:25.573487	[]	1	\N
309	304	1	798.00	2025-05-13	paid	09/05/2025	\N	2025-05-13 13:44:51.038765	2025-05-13 20:13:55.202785	[]	2	\N
310	305	1	2000	2025-05-13	paid	09/05/2025	\N	2025-05-13 13:47:09.986161	2025-05-13 20:15:28.932119	[]	3	\N
311	306	1	50.00	2025-05-13	paid	12/05/2025	\N	2025-05-13 13:48:15.611522	2025-05-13 20:18:31.689967	[]	2	\N
338	330	1	50.00	2025-05-13	pending	\N	\N	2025-05-13 20:18:52.590352	2025-05-13 20:18:52.590352	[]	\N	\N
313	308	1	400.00	2025-05-13	paid	12/05/2025	\N	2025-05-13 13:49:29.958952	2025-05-13 20:19:05.940484	[]	2	\N
339	331	1	300.00	2025-05-13	pending	\N	\N	2025-05-13 20:24:01.817634	2025-05-13 20:24:01.817634	[]	\N	\N
340	332	1	560.00	2025-05-13	pending	\N	\N	2025-05-13 20:25:12.973678	2025-05-13 20:25:12.973678	[]	\N	\N
341	333	1	50.00	2025-05-13	pending	\N	\N	2025-05-13 20:29:08.021079	2025-05-13 20:29:08.021079	[]	\N	\N
342	334	1	300.00	2025-05-13	pending	\N	\N	2025-05-13 20:30:56.453483	2025-05-13 20:30:56.453483	[]	\N	\N
348	340	1	300.00	2025-05-13	pending	\N	\N	2025-05-13 20:37:47.933342	2025-05-13 20:37:47.933342	[]	\N	\N
350	342	1	480.00	2025-05-13	pending	\N	\N	2025-05-13 20:40:05.276482	2025-05-13 20:40:05.276482	[]	\N	\N
351	343	1	1000.00	2025-05-13	pending	\N	\N	2025-05-13 20:53:40.676246	2025-05-13 20:53:40.676246	[]	\N	\N
352	344	1	125.00	2025-06-13	pending	\N	\N	2025-05-13 21:00:36.682384	2025-05-13 21:00:36.682384	[]	\N	\N
353	344	2	125.00	2025-07-13	pending	\N	\N	2025-05-13 21:00:36.91357	2025-05-13 21:00:36.91357	[]	\N	\N
354	344	3	125.00	2025-08-13	pending	\N	\N	2025-05-13 21:00:37.044301	2025-05-13 21:00:37.044301	[]	\N	\N
355	344	4	125.00	2025-09-13	pending	\N	\N	2025-05-13 21:00:37.164201	2025-05-13 21:00:37.164201	[]	\N	\N
307	302	1	350	2025-05-09	paid	06/05/2025	\N	2025-05-09 20:57:27.444921	2025-05-09 21:07:36.999267	[]	2	\N
343	335	1	350.00	2025-05-13	paid	09/05/2025	\N	2025-05-13 20:31:05.780417	2025-05-14 11:34:59.201807	[]	3	\N
356	345	1	980.00	2025-05-14	pending	\N	\N	2025-05-14 11:36:43.877434	2025-05-14 11:36:43.877434	[]	\N	\N
344	336	1	310.00	2025-05-13	paid	12/05/2025	\N	2025-05-13 20:32:18.461995	2025-05-14 11:37:50.822955	[]	2	\N
345	337	1	150.00	2025-05-13	paid	12/05/2025	\N	2025-05-13 20:33:33.264123	2025-05-14 11:39:33.3306	[]	2	\N
357	346	1	550.00	2025-05-14	pending	\N	\N	2025-05-14 11:40:11.732839	2025-05-14 11:40:11.732839	[]	\N	\N
346	338	1	400.00	2025-05-13	paid	12/05/2025	\N	2025-05-13 20:35:19.084347	2025-05-14 11:40:30.532702	[]	1	\N
367	357	1	260.00	2025-05-14	pending	\N	\N	2025-05-14 12:20:55.626882	2025-05-14 12:20:55.626882	[]	\N	\N
349	341	1	490	2025-05-13	pending	\N	\N	2025-05-13 20:38:01.818192	2025-05-13 20:38:01.818192	[]	\N	\N
323	318	1	250	2025-05-13	paid	12/05/2025	\N	2025-05-13 14:12:08.101952	2025-05-13 20:08:51.308864	[]	2	\N
377	371	1	280.00	2025-05-14	pending	\N	\N	2025-05-14 14:39:15.60026	2025-05-14 14:39:15.60026	[]	\N	\N
371	362	1	550.00	2025-05-14	paid	12/05/2025	\N	2025-05-14 12:56:54.294532	2025-05-14 18:29:56.786119	[]	1	\N
373	364	1	59.00	2025-05-14	paid	12/05/2025	\N	2025-05-14 13:45:46.801846	2025-05-14 19:16:03.090093	[]	2	\N
370	361	1	650.00	2025-05-14	paid	12/05/2025	\N	2025-05-14 12:45:57.543477	2025-05-14 19:17:29.814273	[]	3	\N
374	365	1	400.00	2025-05-14	paid	12/05/2025	\N	2025-05-14 13:47:37.381774	2025-05-14 20:21:40.182096	[]	3	\N
368	358	1	280.00	2025-05-14	paid	13/05/2025	\N	2025-05-14 12:29:03.253121	2025-05-14 20:23:16.919019	[]	1	\N
366	355	1	950.00	2025-05-14	paid	12/05/2025	\N	2025-05-14 12:02:12.632121	2025-05-14 20:30:04.96642	[]	2	\N
376	367	1	450.00	2025-05-14	paid	12/05/2025	\N	2025-05-14 14:31:54.06494	2025-05-14 20:32:30.29485	[]	2	\N
365	354	1	0.00	2025-05-14	paid	13/05/2025	\N	2025-05-14 11:56:40.471386	2025-05-14 20:33:51.852548	[]	2	\N
364	353	1	50.00	2025-05-14	paid	13/05/2025	\N	2025-05-14 11:54:14.929984	2025-05-14 20:35:31.292721	[]	2	\N
363	352	1	300.00	2025-05-14	paid	13/05/2025	\N	2025-05-14 11:52:30.90326	2025-05-14 20:37:22.66078	[]	2	\N
361	350	1	490.00	2025-05-14	paid	12/05/2025	\N	2025-05-14 11:46:43.213621	2025-05-14 20:40:47.622033	[]	1	\N
360	349	1	650.00	2025-05-14	paid	12/05/2025	\N	2025-05-14 11:44:59.165736	2025-05-14 20:42:41.474889	[]	2	\N
359	348	1	350.00	2025-05-14	paid	12/05/2025	\N	2025-05-14 11:44:09.593241	2025-05-14 20:44:11.733861	[]	2	\N
358	347	1	50.00	2025-05-14	paid	09/05/2025	\N	2025-05-14 11:41:51.98128	2025-05-14 20:53:49.740802	[]	2	\N
378	372	1	800.00	2025-05-14	pending	\N	\N	2025-05-14 14:57:23.251217	2025-05-14 14:57:23.251217	[]	\N	\N
379	373	1	100.00	2025-05-14	pending	\N	\N	2025-05-14 14:58:57.270897	2025-05-14 14:58:57.270897	[]	\N	\N
380	374	1	59.00	2025-05-14	pending	\N	\N	2025-05-14 15:38:56.535814	2025-05-14 15:38:56.535814	[]	\N	\N
381	375	1	650.00	2025-05-14	pending	\N	\N	2025-05-14 15:44:05.793493	2025-05-14 15:44:05.793493	[]	\N	\N
382	376	1	650.00	2025-05-14	pending	\N	\N	2025-05-14 15:49:45.066265	2025-05-14 15:49:45.066265	[]	\N	\N
383	377	1	250.00	2025-05-14	pending	\N	\N	2025-05-14 16:28:13.163415	2025-05-14 16:28:13.163415	[]	\N	\N
384	378	1	700.00	2025-05-14	pending	\N	\N	2025-05-14 16:37:47.680876	2025-05-14 16:37:47.680876	[]	\N	\N
386	380	1	300.00	2025-05-14	pending	\N	\N	2025-05-14 16:48:43.126343	2025-05-14 16:48:43.126343	[]	\N	\N
390	388	1	350.00	2025-05-14	pending	\N	\N	2025-05-14 17:54:25.620844	2025-05-14 17:54:25.620844	[]	\N	\N
391	390	1	610.00	2025-05-14	pending	\N	\N	2025-05-14 18:01:08.141637	2025-05-14 18:01:08.141637	[]	\N	\N
385	379	1	350.00	2025-05-14	paid	12/05/2025	\N	2025-05-14 16:45:05.733922	2025-05-14 18:05:05.160061	[]	2	\N
387	381	1	400.00	2025-05-14	paid	12/05/2025	\N	2025-05-14 16:49:28.320743	2025-05-14 18:07:23.219581	[]	2	\N
388	382	1	250.00	2025-05-14	paid	05/05/2025	\N	2025-05-14 17:26:43.241802	2025-05-14 18:08:32.502876	[]	2	\N
389	383	1	700.00	2025-05-14	paid	12/05/2025	\N	2025-05-14 17:47:33.502471	2025-05-14 18:09:46.81065	[]	2	\N
392	391	1	3500.00	2025-05-14	paid	12/05/2025	\N	2025-05-14 18:06:31.494278	2025-05-14 18:11:19.126168	[]	1	\N
397	396	1	250.00	2025-05-14	pending	\N	\N	2025-05-14 18:17:22.458067	2025-05-14 18:17:22.458067	[]	\N	\N
398	397	1	50.00	2025-05-14	pending	\N	\N	2025-05-14 18:18:06.095251	2025-05-14 18:18:06.095251	[]	\N	\N
399	398	1	550.00	2025-05-14	pending	\N	\N	2025-05-14 18:18:51.618467	2025-05-14 18:18:51.618467	[]	\N	\N
393	392	1	500.00	2025-05-14	paid	13/05/2025	\N	2025-05-14 18:09:48.687332	2025-05-14 18:21:20.655886	[]	2	\N
394	393	1	50.00	2025-05-14	paid	13/05/2025	\N	2025-05-14 18:12:48.21058	2025-05-14 18:22:58.825123	[]	2	\N
395	394	1	500.00	2025-05-14	paid	13/05/2025	\N	2025-05-14 18:14:15.878738	2025-05-14 18:23:38.492548	[]	2	\N
396	395	1	450.00	2025-05-14	paid	13/05/2025	\N	2025-05-14 18:15:59.835863	2025-05-14 18:27:54.482436	[]	2	\N
401	400	1	1050.00	2025-05-14	pending	\N	\N	2025-05-14 18:31:03.50466	2025-05-14 18:31:03.50466	[]	\N	\N
372	363	1	300.00	2025-05-14	paid	12/05/2025	\N	2025-05-14 13:44:35.841996	2025-05-14 18:32:00.535155	[]	2	\N
402	401	1	400.00	2025-05-14	pending	\N	\N	2025-05-14 19:11:33.528765	2025-05-14 19:11:33.528765	[]	\N	\N
400	399	1	350.00	2025-05-14	paid	10/05/2025	\N	2025-05-14 18:27:57.871276	2025-05-14 19:14:22.189625	[]	2	\N
369	359	1	950	2025-05-14	paid	08/05/2025	\N	2025-05-14 12:34:02.293981	2025-05-14 20:16:04.79969	[]	2	\N
403	402	1	240.00	2025-05-14	pending	\N	\N	2025-05-14 20:18:18.490204	2025-05-14 20:18:18.490204	[]	\N	\N
375	366	1	750.00	2025-05-14	paid	12/05/2025	\N	2025-05-14 13:49:31.202868	2025-05-14 20:28:30.595412	[]	2	\N
404	403	1	410.00	2025-05-14	pending	\N	\N	2025-05-14 20:30:29.039907	2025-05-14 20:30:29.039907	[]	\N	\N
362	351	1	350.00	2025-05-14	paid	12/05/2025	\N	2025-05-14 11:49:00.270615	2025-05-14 20:39:39.205029	[]	2	\N
405	404	1	300.00	2025-05-14	pending	\N	\N	2025-05-14 20:53:12.928618	2025-05-14 20:53:12.928618	[]	\N	\N
406	405	1	490.00	2025-05-15	pending	\N	\N	2025-05-15 11:33:49.281545	2025-05-15 11:33:49.281545	[]	\N	\N
\.


--
-- Data for Name: sale_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sale_items (id, sale_id, service_id, service_type_id, quantity, price, total_price, notes, status, created_at) FROM stdin;
44	48	5	3	1	0	0	\N	pending	2025-05-06 13:35:53.872335
45	49	2	1	1	0	0	\N	pending	2025-05-06 14:01:41.838144
46	50	7	5	1	0	0	\N	pending	2025-05-06 14:29:08.841803
47	50	6	5	1	0	0	\N	pending	2025-05-06 14:29:09.128045
48	51	2	1	1	0	0	\N	pending	2025-05-06 14:30:57.650756
49	51	1	1	3	0	0	\N	pending	2025-05-06 14:30:57.705701
50	52	7	5	1	0	0	\N	pending	2025-05-06 14:31:54.540481
51	53	2	1	1	0	0	\N	pending	2025-05-06 14:34:11.20819
52	53	1	1	1	0	0	\N	pending	2025-05-06 14:34:11.276597
53	54	4	5	1	0	0	\N	pending	2025-05-06 14:34:59.198734
54	55	1	5	1	0	0	\N	pending	2025-05-06 14:35:05.875408
55	55	7	5	1	0	0	\N	pending	2025-05-06 14:35:05.937832
56	56	7	5	1	0	0	\N	pending	2025-05-06 14:36:49.978693
57	57	1	2	2	0	0	\N	pending	2025-05-06 14:37:21.408357
59	59	1	1	1	0	0	\N	pending	2025-05-06 14:46:08.120632
61	61	1	1	1	0	0	\N	pending	2025-05-06 16:34:52.858769
62	62	6	1	2	0	0	\N	pending	2025-05-06 16:44:18.560042
63	62	7	1	1	0	0	\N	pending	2025-05-06 16:44:18.767487
64	63	1	1	1	0	0	\N	pending	2025-05-06 16:46:29.388677
67	66	7	5	1	0	0	\N	pending	2025-05-06 16:51:17.391924
68	67	1	1	1	0	0	\N	pending	2025-05-06 16:53:34.57126
69	68	7	5	1	0	0	\N	pending	2025-05-06 17:09:41.919418
70	69	1	2	4	0	0	\N	pending	2025-05-06 17:11:50.078436
71	71	4	5	1	0	0	\N	pending	2025-05-06 17:15:43.996605
73	73	1	1	1	0	0	\N	pending	2025-05-06 17:20:37.621272
74	74	2	1	1	0	0	\N	pending	2025-05-06 17:20:45.397355
75	74	1	1	2	0	0	\N	pending	2025-05-06 17:20:45.483706
77	76	7	1	1	0	0	\N	pending	2025-05-06 17:23:15.291704
78	76	1	1	1	0	0	\N	pending	2025-05-06 17:23:15.516568
79	77	2	1	1	0	0	\N	pending	2025-05-06 17:24:48.143405
80	77	1	1	1	0	0	\N	pending	2025-05-06 17:24:48.620267
81	78	7	1	1	0	0	\N	pending	2025-05-06 17:26:58.887409
82	78	1	1	1	0	0	\N	pending	2025-05-06 17:26:59.191453
83	79	7	1	1	0	0	\N	pending	2025-05-06 17:29:17.203344
84	80	7	1	1	0	0	\N	pending	2025-05-06 17:31:26.629184
85	80	1	1	1	0	0	\N	pending	2025-05-06 17:31:26.685106
86	81	1	2	13	0	0	\N	pending	2025-05-06 17:38:19.881739
87	82	1	2	1	0	0	\N	pending	2025-05-06 17:43:48.729912
88	83	4	5	1	0	0	\N	pending	2025-05-06 17:46:06.261772
89	96	1	2	1	0	0	\N	pending	2025-05-06 18:43:10.060056
90	96	25	2	1	0	0	\N	pending	2025-05-06 18:43:10.256101
91	97	2	4	1	0	0	\N	pending	2025-05-06 18:45:55.74554
92	98	2	1	1	0	0	\N	pending	2025-05-06 19:27:39.753304
93	98	1	1	1	0	0	\N	pending	2025-05-06 19:27:39.951388
94	99	1	1	2	0	0	\N	pending	2025-05-06 19:28:34.359197
95	100	2	3	1	0	0	\N	pending	2025-05-06 19:29:46.606131
96	100	1	3	2	0	0	\N	pending	2025-05-06 19:29:46.657726
97	101	7	5	1	0	0	\N	pending	2025-05-06 19:30:57.302443
98	102	13	5	1	0	0	\N	pending	2025-05-06 19:31:54.727466
99	103	14	5	1	0	0	\N	pending	2025-05-06 19:32:38.834414
100	104	7	5	1	0	0	\N	pending	2025-05-06 19:36:34.745376
101	105	4	5	1	0	0	\N	pending	2025-05-06 19:38:46.665009
102	106	1	1	1	0	0	\N	pending	2025-05-06 19:43:09.930951
103	107	7	5	1	0	0	\N	pending	2025-05-06 19:44:23.247774
104	108	9	5	1	0	0	\N	pending	2025-05-06 19:45:34.954252
105	109	2	1	1	0	0	\N	pending	2025-05-06 19:46:40.243041
106	110	2	1	1	0	0	\N	pending	2025-05-06 19:48:37.813138
107	110	1	1	1	0	0	\N	pending	2025-05-06 19:48:38.023791
108	111	2	1	1	0	0	\N	pending	2025-05-06 19:50:00.291759
109	111	1	1	1	0	0	\N	pending	2025-05-06 19:50:00.631379
110	112	2	1	1	0	0	\N	pending	2025-05-06 19:53:27.411988
111	112	1	1	1	0	0	\N	pending	2025-05-06 19:53:27.627479
112	113	4	5	1	0	0	\N	pending	2025-05-06 19:59:05.865579
113	114	4	5	1	0	0	\N	pending	2025-05-06 20:09:42.399443
114	115	7	5	1	0	0	\N	pending	2025-05-06 20:13:50.564447
115	116	10	1	1	0	0	\N	pending	2025-05-06 20:52:06.487154
117	118	5	2	1	0	0	\N	pending	2025-05-06 20:55:08.25698
118	119	6	2	2	0	0	\N	pending	2025-05-06 20:56:07.732575
120	123	1	1	1	0	0	\N	pending	2025-05-06 20:59:02.196254
122	125	7	5	1	0	0	\N	pending	2025-05-07 12:24:35.777385
124	127	2	1	1	0	0	\N	pending	2025-05-07 13:52:02.622481
125	127	1	1	1	0	0	\N	pending	2025-05-07 13:52:02.838944
126	133	5	2	1	0	0	\N	pending	2025-05-07 14:16:13.651684
127	134	4	5	1	0	0	\N	pending	2025-05-07 14:43:05.611507
128	135	1	1	1	0	0	\N	pending	2025-05-07 14:48:39.535049
132	139	5	5	1	0	0	\N	pending	2025-05-07 17:40:38.205048
133	140	7	1	1	0	0	\N	pending	2025-05-07 17:42:01.214794
134	140	6	1	1	0	0	\N	pending	2025-05-07 17:42:01.26951
135	141	1	1	1	0	0	\N	pending	2025-05-07 17:42:38.389456
136	142	5	1	1	0	0	\N	pending	2025-05-07 17:45:47.947864
137	143	5	1	1	0	0	\N	pending	2025-05-07 17:48:37.022622
138	144	1	1	1	0	0	\N	pending	2025-05-07 17:50:23.011921
139	145	5	1	1	0	0	\N	pending	2025-05-07 17:57:39.935673
140	146	5	5	1	0	0	\N	pending	2025-05-07 18:00:06.690759
142	148	4	5	1	0	0	\N	pending	2025-05-07 18:05:31.126843
143	149	2	1	1	0	0	\N	pending	2025-05-07 18:07:30.104268
144	149	1	1	1	0	0	\N	pending	2025-05-07 18:07:30.155142
145	150	5	1	1	0	0	\N	pending	2025-05-07 18:07:53.780439
147	152	7	5	1	0	0	\N	pending	2025-05-07 18:11:02.194456
148	153	1	1	1	0	0	\N	pending	2025-05-07 18:11:33.269002
149	154	1	2	3	0	0	\N	pending	2025-05-07 18:17:14.044759
150	157	1	3	1	0	0	\N	pending	2025-05-07 18:20:00.839145
151	158	25	5	1	0	0	\N	pending	2025-05-07 18:20:07.238988
152	159	1	1	1	0	0	\N	pending	2025-05-07 18:20:49.581043
153	160	1	1	1	0	0	\N	pending	2025-05-07 18:22:21.75514
154	161	1	1	1	0	0	\N	pending	2025-05-07 18:23:52.261254
155	162	7	1	1	0	0	\N	pending	2025-05-07 18:48:08.52495
157	164	7	2	1	0	0	\N	pending	2025-05-07 19:17:30.283916
158	164	6	2	1	0	0	\N	pending	2025-05-07 19:17:30.327825
159	165	5	2	1	0	0	\N	pending	2025-05-07 19:31:04.242957
160	166	10	5	1	0	0	\N	pending	2025-05-07 19:32:40.94953
161	167	9	5	1	0	0	\N	pending	2025-05-07 19:36:33.298422
163	169	6	5	1	0	0	\N	pending	2025-05-07 19:38:40.706421
164	170	7	5	1	0	0	\N	pending	2025-05-07 19:38:59.549466
165	171	1	1	1	0	0	\N	pending	2025-05-07 19:43:34.644028
167	173	1	1	6	0	0	\N	pending	2025-05-07 19:51:20.183654
168	174	2	1	1	0	0	\N	pending	2025-05-07 19:54:19.922667
170	176	4	5	1	0	0	\N	pending	2025-05-07 19:58:04.171444
172	178	4	5	1	0	0	\N	pending	2025-05-07 20:02:36.27367
173	179	1	2	3	0	0	\N	pending	2025-05-07 20:07:29.963091
174	180	6	5	4	0	0	\N	pending	2025-05-07 20:25:11.60025
175	181	1	4	1	0	0	\N	pending	2025-05-07 20:30:32.964673
176	182	1	1	1	0	0	\N	pending	2025-05-07 20:35:07.278968
177	183	1	5	1	0	0	\N	pending	2025-05-07 20:37:47.054875
178	184	1	4	3	0	0	\N	pending	2025-05-07 20:40:54.302817
179	185	7	5	1	0	0	\N	pending	2025-05-07 20:44:06.837419
180	186	5	1	1	0	0	\N	pending	2025-05-07 20:47:48.068307
181	187	2	1	1	0	0	\N	pending	2025-05-07 20:51:30.686187
182	188	4	5	1	0	0	\N	pending	2025-05-07 20:56:52.841081
183	189	4	5	1	0	0	\N	pending	2025-05-07 20:59:34.046275
184	190	4	5	1	0	0	\N	pending	2025-05-07 21:03:17.541947
185	191	3	1	1	0	0	\N	pending	2025-05-07 21:07:01.320684
187	193	3	1	1	0	0	\N	pending	2025-05-08 11:23:55.058433
190	195	7	5	1	0	0	\N	pending	2025-05-08 12:59:18.505627
191	195	3	5	1	0	0	\N	pending	2025-05-08 12:59:18.589188
192	196	1	1	1	0	0	\N	pending	2025-05-08 13:03:35.687854
193	197	1	1	1	0	0	\N	pending	2025-05-08 13:05:30.703594
194	198	1	1	1	0	0	\N	pending	2025-05-08 13:07:25.072377
195	198	6	1	2	0	0	\N	pending	2025-05-08 13:07:25.439466
196	199	1	1	1	0	0	\N	pending	2025-05-08 13:08:49.220987
197	200	1	1	1	0	0	\N	pending	2025-05-08 13:10:00.01006
198	201	4	5	1	0	0	\N	pending	2025-05-08 13:11:55.939208
199	202	2	1	1	0	0	\N	pending	2025-05-08 13:13:37.716874
200	203	2	1	1	0	0	\N	pending	2025-05-08 13:17:30.47708
201	203	1	1	1	0	0	\N	pending	2025-05-08 13:17:30.66436
203	205	1	1	1	0	0	\N	pending	2025-05-08 13:23:53.533821
204	206	7	1	1	0	0	\N	pending	2025-05-08 13:51:14.643392
205	207	1	1	1	0	0	\N	pending	2025-05-08 13:52:20.90692
206	208	1	1	1	0	0	\N	pending	2025-05-08 13:53:32.218228
207	209	7	5	1	0	0	\N	pending	2025-05-08 14:05:53.572645
208	210	7	1	1	0	0	\N	pending	2025-05-08 14:50:46.032847
209	210	1	1	1	0	0	\N	pending	2025-05-08 14:50:46.23861
210	210	6	1	1	0	0	\N	pending	2025-05-08 14:50:46.448751
211	211	1	2	1	0	0	\N	pending	2025-05-08 16:21:57.6929
212	212	7	5	1	0	0	\N	pending	2025-05-08 16:26:39.094799
213	212	5	5	1	0	0	\N	pending	2025-05-08 16:26:39.571341
214	213	7	2	1	0	0	\N	pending	2025-05-08 16:28:53.884435
215	213	1	2	1	0	0	\N	pending	2025-05-08 16:28:53.989717
216	213	6	2	1	0	0	\N	pending	2025-05-08 16:28:54.251498
217	213	5	2	1	0	0	\N	pending	2025-05-08 16:28:54.761912
218	214	7	1	1	0	0	\N	pending	2025-05-08 16:36:06.743384
219	215	1	1	1	0	0	\N	pending	2025-05-08 16:37:53.607491
220	216	1	1	1	0	0	\N	pending	2025-05-08 16:39:11.546157
221	217	2	1	1	0	0	\N	pending	2025-05-08 16:40:23.31995
222	217	1	1	2	0	0	\N	pending	2025-05-08 16:40:23.785649
223	218	2	1	1	0	0	\N	pending	2025-05-08 16:42:01.198754
224	218	1	1	1	0	0	\N	pending	2025-05-08 16:42:01.749939
225	219	1	1	1	0	0	\N	pending	2025-05-08 16:43:34.454631
226	220	7	5	1	0	0	\N	pending	2025-05-08 16:44:56.960912
227	221	7	5	1	0	0	\N	pending	2025-05-08 16:46:53.274295
228	222	7	1	1	0	0	\N	pending	2025-05-08 16:48:40.480462
229	223	6	5	2	0	0	\N	pending	2025-05-08 16:49:58.73299
230	224	1	5	2	0	0	\N	pending	2025-05-08 16:51:45.232927
231	224	6	5	2	0	0	\N	pending	2025-05-08 16:51:45.422766
232	225	1	1	1	0	0	\N	pending	2025-05-08 16:53:24.536576
233	226	4	5	1	0	0	\N	pending	2025-05-08 16:55:28.820482
234	227	2	1	1	0	0	\N	pending	2025-05-08 16:56:58.855982
235	227	1	1	1	0	0	\N	pending	2025-05-08 16:56:58.913135
237	229	2	1	1	0	0	\N	pending	2025-05-08 16:59:19.257828
238	229	1	1	1	0	0	\N	pending	2025-05-08 16:59:19.493682
239	230	7	5	1	0	0	\N	pending	2025-05-08 17:00:51.509462
240	231	7	5	1	0	0	\N	pending	2025-05-08 17:08:18.87493
241	232	25	5	1	0	0	\N	pending	2025-05-08 17:19:40.429214
242	233	5	5	1	0	0	\N	pending	2025-05-08 17:44:37.113001
243	233	1	5	1	0	0	\N	pending	2025-05-08 17:44:37.288577
244	233	6	5	1	0	0	\N	pending	2025-05-08 17:44:37.4613
245	233	7	5	1	0	0	\N	pending	2025-05-08 17:44:37.665635
246	234	7	1	1	0	0	\N	pending	2025-05-08 18:25:10.246064
247	234	1	1	1	0	0	\N	pending	2025-05-08 18:25:10.315841
248	235	1	1	1	0	0	\N	pending	2025-05-08 18:31:33.97499
249	235	7	1	1	0	0	\N	pending	2025-05-08 18:31:34.154036
250	236	10	1	1	0	0	\N	pending	2025-05-08 19:38:47.388728
251	236	1	1	2	0	0	\N	pending	2025-05-08 19:38:47.442298
252	237	1	1	2	0	0	\N	pending	2025-05-08 20:11:36.550671
253	238	1	2	13	0	0	\N	pending	2025-05-08 20:17:57.398215
254	239	1	2	4	0	0	\N	pending	2025-05-08 20:25:35.343009
255	240	1	2	6	0	0	\N	pending	2025-05-08 20:25:42.617903
256	240	2	2	1	0	0	\N	pending	2025-05-08 20:25:42.660304
257	241	10	1	1	0	0	\N	pending	2025-05-08 20:31:10.685662
258	242	7	5	1	0	0	\N	pending	2025-05-08 20:31:48.938841
259	243	1	1	1	0	0	\N	pending	2025-05-08 20:34:55.932591
260	243	2	1	1	0	0	\N	pending	2025-05-08 20:34:56.114384
261	244	2	1	1	0	0	\N	pending	2025-05-08 20:41:07.869417
262	244	1	1	1	0	0	\N	pending	2025-05-08 20:41:08.042774
263	245	2	1	1	0	0	\N	pending	2025-05-09 11:26:57.862777
264	245	1	1	1	0	0	\N	pending	2025-05-09 11:26:58.098758
265	246	1	1	1	0	0	\N	pending	2025-05-09 12:15:02.21981
266	247	1	3	1	0	0	\N	pending	2025-05-09 12:19:23.571432
267	248	5	5	1	0	0	\N	pending	2025-05-09 13:40:59.128304
268	249	1	2	1	0	0	\N	pending	2025-05-09 14:07:56.318208
269	250	7	3	1	0	0	\N	pending	2025-05-09 14:09:45.906731
270	251	2	1	1	0	0	\N	pending	2025-05-09 14:11:57.891078
271	252	1	1	1	0	0	\N	pending	2025-05-09 14:21:05.181863
272	253	1	3	2	0	0	\N	pending	2025-05-09 16:12:22.09697
273	254	1	1	1	0	0	\N	pending	2025-05-09 16:16:53.186756
274	254	2	1	1	0	0	\N	pending	2025-05-09 16:16:53.236544
275	255	1	1	1	0	0	\N	pending	2025-05-09 16:26:15.343567
276	256	4	5	1	0	0	\N	pending	2025-05-09 16:46:00.142158
277	257	7	5	1	0	0	\N	pending	2025-05-09 16:47:16.616728
278	258	7	5	1	0	0	\N	pending	2025-05-09 16:49:36.59005
279	259	4	5	1	0	0	\N	pending	2025-05-09 16:52:03.283982
280	260	1	2	1	0	0	\N	pending	2025-05-09 17:15:44.079448
281	261	4	5	1	0	0	\N	pending	2025-05-09 17:22:14.488065
282	262	4	5	1	0	0	\N	pending	2025-05-09 17:24:26.882045
283	263	1	1	1	0	0	\N	pending	2025-05-09 17:24:39.662451
284	264	1	1	1	0	0	\N	pending	2025-05-09 17:32:22.626989
285	265	1	5	1	0	0	\N	pending	2025-05-09 17:32:40.044478
286	266	1	1	1	0	0	\N	pending	2025-05-09 17:34:30.251195
287	267	1	1	1	0	0	\N	pending	2025-05-09 17:35:12.844232
288	268	1	3	1	0	0	\N	pending	2025-05-09 17:36:12.159797
289	269	7	1	1	0	0	\N	pending	2025-05-09 17:37:41.27857
290	270	7	1	1	0	0	\N	pending	2025-05-09 17:37:55.692183
291	271	1	2	1	0	0	\N	pending	2025-05-09 17:38:51.188251
292	272	13	5	1	0	0	\N	pending	2025-05-09 17:40:20.806719
293	272	7	5	1	0	0	\N	pending	2025-05-09 17:40:20.848068
294	273	1	1	1	0	0	\N	pending	2025-05-09 17:50:16.886421
295	274	7	2	1	0	0	\N	pending	2025-05-09 17:51:11.22383
296	274	6	2	2	0	0	\N	pending	2025-05-09 17:51:11.416239
297	275	26	5	1	0	0	\N	pending	2025-05-09 17:51:16.737033
298	276	1	1	3	0	0	\N	pending	2025-05-09 17:51:47.388132
299	276	33	1	1	0	0	\N	pending	2025-05-09 17:51:47.432026
300	277	2	1	1	0	0	\N	pending	2025-05-09 17:52:25.999718
301	277	1	1	2	0	0	\N	pending	2025-05-09 17:52:26.046277
303	279	26	5	1	0	0	\N	pending	2025-05-09 17:54:27.025154
305	281	1	2	3	0	0	\N	pending	2025-05-09 17:55:43.295779
306	282	2	1	1	0	0	\N	pending	2025-05-09 17:57:02.297394
307	282	1	1	1	0	0	\N	pending	2025-05-09 17:57:02.347113
308	283	2	1	1	0	0	\N	pending	2025-05-09 18:00:40.871027
309	283	1	1	3	0	0	\N	pending	2025-05-09 18:00:41.063954
310	284	1	2	6	0	0	\N	pending	2025-05-09 18:01:52.234228
312	286	5	5	1	0	0	\N	pending	2025-05-09 18:03:15.945544
313	287	2	1	1	0	0	\N	pending	2025-05-09 18:04:00.918329
314	287	1	1	2	0	0	\N	pending	2025-05-09 18:04:01.008787
315	288	1	1	1	0	0	\N	pending	2025-05-09 18:05:07.392845
316	288	6	1	1	0	0	\N	pending	2025-05-09 18:05:07.567943
317	289	2	3	1	0	0	\N	pending	2025-05-09 18:40:15.778335
318	289	1	3	1	0	0	\N	pending	2025-05-09 18:40:16.086826
319	291	1	4	1	0	0	\N	pending	2025-05-09 18:45:55.004678
320	292	10	2	1	0	0	\N	pending	2025-05-09 20:23:33.998534
321	292	1	2	3	0	0	\N	pending	2025-05-09 20:23:34.221575
322	293	1	1	1	0	0	\N	pending	2025-05-09 20:24:47.722108
323	294	1	1	1	0	0	\N	pending	2025-05-09 20:26:12.889944
324	295	1	1	1	0	0	\N	pending	2025-05-09 20:26:30.667498
325	296	1	1	1	0	0	\N	pending	2025-05-09 20:28:33.964204
326	297	1	4	4	0	0	\N	pending	2025-05-09 20:33:21.800637
327	297	10	4	1	0	0	\N	pending	2025-05-09 20:33:21.846314
328	298	4	5	1	0	0	\N	pending	2025-05-09 20:38:09.888671
329	299	1	1	3	0	0	\N	pending	2025-05-09 20:42:49.198706
330	300	1	1	1	0	0	\N	pending	2025-05-09 20:53:20.411202
331	300	7	1	1	0	0	\N	pending	2025-05-09 20:53:20.647435
332	301	7	5	1	0	0	\N	pending	2025-05-09 20:55:38.730138
333	302	7	5	1	0	0	\N	pending	2025-05-09 20:57:27.275074
334	303	7	5	1	0	0	\N	pending	2025-05-13 12:37:07.866241
335	304	1	1	2	0	0	\N	pending	2025-05-13 13:44:50.977791
336	305	1	2	10	0	0	\N	pending	2025-05-13 13:47:09.941294
337	306	4	5	1	0	0	\N	pending	2025-05-13 13:48:15.55938
338	307	7	5	1	0	0	\N	pending	2025-05-13 13:48:56.478396
339	308	1	3	2	0	0	\N	pending	2025-05-13 13:49:29.907718
340	309	7	1	1	0	0	\N	pending	2025-05-13 13:50:38.656324
341	310	9	5	1	0	0	\N	pending	2025-05-13 13:52:00.999522
342	311	2	1	1	0	0	\N	pending	2025-05-13 13:52:12.258927
343	311	1	1	1	0	0	\N	pending	2025-05-13 13:52:12.454901
344	312	7	1	1	0	0	\N	pending	2025-05-13 13:53:36.331723
345	313	1	1	1	0	0	\N	pending	2025-05-13 13:55:37.672195
346	314	1	1	1	0	0	\N	pending	2025-05-13 13:56:18.262624
347	314	6	1	1	0	0	\N	pending	2025-05-13 13:56:18.47639
348	315	1	1	1	0	0	\N	pending	2025-05-13 13:57:11.107055
349	316	7	5	1	0	0	\N	pending	2025-05-13 14:07:02.193128
350	317	7	5	1	0	0	\N	pending	2025-05-13 14:10:13.380114
351	318	7	5	1	0	0	\N	pending	2025-05-13 14:12:08.047433
352	319	7	5	1	0	0	\N	pending	2025-05-13 14:13:11.33003
353	320	1	1	1	0	0	\N	pending	2025-05-13 17:13:56.735339
354	320	6	1	1	0	0	\N	pending	2025-05-13 17:13:56.883536
355	321	2	1	1	0	0	\N	pending	2025-05-13 18:13:46.46943
356	322	1	3	1	0	0	\N	pending	2025-05-13 18:19:50.853164
357	322	1	3	1	0	0	\N	pending	2025-05-13 18:19:50.906899
358	323	9	5	1	0	0	\N	pending	2025-05-13 18:26:31.025947
359	324	1	2	1	0	0	\N	pending	2025-05-13 18:30:47.400019
360	325	1	1	1	0	0	\N	pending	2025-05-13 18:44:33.105907
361	326	1	1	1	0	0	\N	pending	2025-05-13 18:56:43.850464
362	327	7	1	1	0	0	\N	pending	2025-05-13 18:57:24.825238
364	329	9	1	1	0	0	\N	pending	2025-05-13 19:57:41.687354
365	329	26	1	1	0	0	\N	pending	2025-05-13 19:57:41.892229
366	330	4	1	1	0	0	\N	pending	2025-05-13 20:18:52.441068
367	331	1	1	1	0	0	\N	pending	2025-05-13 20:24:01.131973
368	332	26	5	1	0	0	\N	pending	2025-05-13 20:25:12.900825
369	333	4	5	1	0	0	\N	pending	2025-05-13 20:29:07.971072
370	334	1	1	1	0	0	\N	pending	2025-05-13 20:30:56.185759
371	335	4	5	1	0	0	\N	pending	2025-05-13 20:31:05.735603
372	336	1	1	1	0	0	\N	pending	2025-05-13 20:32:18.409707
373	337	3	1	1	0	0	\N	pending	2025-05-13 20:33:33.119232
374	338	10	1	1	0	0	\N	pending	2025-05-13 20:35:18.825704
375	338	1	1	1	0	0	\N	pending	2025-05-13 20:35:19.033029
376	339	4	5	1	0	0	\N	pending	2025-05-13 20:35:53.684689
377	340	1	1	1	0	0	\N	pending	2025-05-13 20:37:47.884887
378	341	4	5	1	0	0	\N	pending	2025-05-13 20:38:01.755059
379	342	1	1	1	0	0	\N	pending	2025-05-13 20:40:05.228229
380	343	5	5	1	0	0	\N	pending	2025-05-13 20:53:40.582544
381	344	7	5	1	0	0	\N	pending	2025-05-13 21:00:36.140769
382	345	7	5	1	0	0	\N	pending	2025-05-14 11:36:43.81914
383	346	1	1	1	0	0	\N	pending	2025-05-14 11:40:11.493939
384	346	2	1	1	0	0	\N	pending	2025-05-14 11:40:11.688697
385	347	4	5	1	0	0	\N	pending	2025-05-14 11:41:51.929697
386	348	1	1	1	0	0	\N	pending	2025-05-14 11:44:09.533447
387	349	7	1	1	0	0	\N	pending	2025-05-14 11:44:58.788367
388	349	1	1	1	0	0	\N	pending	2025-05-14 11:44:59.118983
389	350	1	1	1	0	0	\N	pending	2025-05-14 11:46:43.000447
390	350	2	1	1	0	0	\N	pending	2025-05-14 11:46:43.170939
391	351	1	1	1	0	0	\N	pending	2025-05-14 11:49:00.211937
392	352	1	5	1	0	0	\N	pending	2025-05-14 11:52:30.844741
393	353	4	5	1	0	0	\N	pending	2025-05-14 11:54:14.863591
394	354	1	1	1	0	0	\N	pending	2025-05-14 11:56:40.212578
395	354	2	1	1	0	0	\N	pending	2025-05-14 11:56:40.420928
396	355	7	2	1	0	0	\N	pending	2025-05-14 12:02:12.566011
397	357	27	5	1	0	0	\N	pending	2025-05-14 12:20:55.57811
398	358	9	5	1	0	0	\N	pending	2025-05-14 12:29:03.205037
399	359	10	2	1	0	0	\N	pending	2025-05-14 12:34:02.022601
400	359	1	2	3	0	0	\N	pending	2025-05-14 12:34:02.244982
401	361	2	1	1	0	0	\N	pending	2025-05-14 12:45:57.488844
402	362	7	1	1	0	0	\N	pending	2025-05-14 12:56:54.230394
403	363	1	3	1	0	0	\N	pending	2025-05-14 13:44:35.779539
404	364	4	5	1	0	0	\N	pending	2025-05-14 13:45:46.717271
405	365	1	1	1	0	0	\N	pending	2025-05-14 13:47:37.33597
406	366	7	1	1	0	0	\N	pending	2025-05-14 13:49:30.957993
407	366	1	1	1	0	0	\N	pending	2025-05-14 13:49:31.155141
408	367	1	1	1	0	0	\N	pending	2025-05-14 14:31:53.984336
409	371	7	5	1	0	0	\N	pending	2025-05-14 14:39:15.533089
410	372	1	1	2	0	0	\N	pending	2025-05-14 14:57:22.760478
411	372	6	1	2	0	0	\N	pending	2025-05-14 14:57:22.979579
412	373	7	5	1	0	0	\N	pending	2025-05-14 14:58:57.003283
413	374	4	5	1	0	0	\N	pending	2025-05-14 15:38:56.474614
414	375	2	1	1	0	0	\N	pending	2025-05-14 15:44:05.531518
415	375	1	1	1	0	0	\N	pending	2025-05-14 15:44:05.737008
416	376	2	1	1	0	0	\N	pending	2025-05-14 15:49:44.49119
417	376	1	1	1	0	0	\N	pending	2025-05-14 15:49:44.973703
418	377	5	5	1	0	0	\N	pending	2025-05-14 16:28:13.092406
419	378	1	1	1	0	0	\N	pending	2025-05-14 16:37:47.334784
420	378	1	1	1	0	0	\N	pending	2025-05-14 16:37:47.595243
421	379	1	1	1	0	0	\N	pending	2025-05-14 16:45:05.662801
422	380	26	5	1	0	0	\N	pending	2025-05-14 16:48:43.059153
423	381	1	3	1	0	0	\N	pending	2025-05-14 16:49:28.273154
424	382	4	5	1	0	0	\N	pending	2025-05-14 17:26:43.165448
425	383	1	2	1	0	0	\N	pending	2025-05-14 17:47:33.217021
426	383	6	2	1	0	0	\N	pending	2025-05-14 17:47:33.451377
427	388	1	1	1	0	0	\N	pending	2025-05-14 17:54:25.501839
428	390	1	1	2	0	0	\N	pending	2025-05-14 18:01:08.094759
429	391	1	2	14	0	0	\N	pending	2025-05-14 18:06:31.366901
430	391	3	2	2	0	0	\N	pending	2025-05-14 18:06:31.434154
431	392	2	1	1	0	0	\N	pending	2025-05-14 18:09:48.582397
432	392	1	1	1	0	0	\N	pending	2025-05-14 18:09:48.638849
433	393	4	5	1	0	0	\N	pending	2025-05-14 18:12:48.099664
434	394	2	1	1	0	0	\N	pending	2025-05-14 18:14:15.757654
435	394	1	1	1	0	0	\N	pending	2025-05-14 18:14:15.811673
436	395	2	3	1	0	0	\N	pending	2025-05-14 18:15:59.305337
437	395	1	3	1	0	0	\N	pending	2025-05-14 18:15:59.739019
438	396	7	5	1	0	0	\N	pending	2025-05-14 18:17:22.412527
439	397	4	5	1	0	0	\N	pending	2025-05-14 18:18:05.72305
440	398	2	1	1	0	0	\N	pending	2025-05-14 18:18:51.308163
441	398	1	1	1	0	0	\N	pending	2025-05-14 18:18:51.559018
442	399	1	1	1	0	0	\N	pending	2025-05-14 18:27:57.818951
443	400	7	2	1	0	0	\N	pending	2025-05-14 18:31:03.403083
444	400	1	2	4	0	0	\N	pending	2025-05-14 18:31:03.449525
445	401	2	1	1	0	0	\N	pending	2025-05-14 19:11:33.267707
446	401	1	1	1	0	0	\N	pending	2025-05-14 19:11:33.473785
447	402	1	4	4	0	0	\N	pending	2025-05-14 20:18:18.366251
448	403	4	5	1	0	0	\N	pending	2025-05-14 20:30:28.982033
449	404	7	5	1	0	0	\N	pending	2025-05-14 20:53:12.840387
450	405	1	1	1	0	0	\N	pending	2025-05-15 11:33:49.024668
451	405	10	1	1	0	0	\N	pending	2025-05-15 11:33:49.224413
\.


--
-- Data for Name: sale_operational_costs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sale_operational_costs (id, sale_id, description, cost_type_id, amount, date, responsible_id, service_provider_id, notes, payment_receipt_url, created_at, updated_at, payment_date) FROM stdin;
22	49	ABERTURA DE CADASTRO COM TRÊS PLACAS	1	581.00	2025-05-06	18	\N	\N	\N	2025-05-06 14:29:58.913883	2025-05-06 14:29:58.913883	2025-05-05
23	49	CHAVE MÁRIO	1	80.00	2025-05-06	18	\N	\N	\N	2025-05-06 14:33:54.874268	2025-05-06 14:33:54.874268	2025-05-05
25	55	 	1	250.00	2025-05-07	18	\N	\N	\N	2025-05-07 11:51:34.675557	2025-05-07 11:51:34.675557	2025-05-02
26	73	 	1	266.00	2025-05-07	18	\N	\N	\N	2025-05-07 11:56:14.633139	2025-05-07 11:56:14.633139	2025-05-02
27	59	 	1	187.50	2025-05-07	18	\N	\N	\N	2025-05-07 12:31:53.278255	2025-05-07 12:31:53.278255	2025-05-02
28	61	 	1	266.00	2025-05-07	18	\N	\N	\N	2025-05-07 12:36:01.426943	2025-05-07 12:36:01.426943	\N
29	62	 	1	266.00	2025-05-07	18	\N	\N	\N	2025-05-07 12:37:24.877028	2025-05-07 12:37:24.877028	\N
30	67	 	1	187.50	2025-05-07	18	\N	\N	\N	2025-05-07 17:37:28.900286	2025-05-07 17:37:28.900286	2025-05-05
31	74	 	1	532.00	2025-05-07	18	\N	\N	\N	2025-05-07 17:42:24.260162	2025-05-07 17:42:24.260162	\N
32	76	 	8	65.05	2025-05-07	18	\N	\N	\N	2025-05-07 17:44:15.833146	2025-05-07 17:44:15.833146	2025-05-02
33	76	 	1	532.00	2025-05-07	18	\N	\N	\N	2025-05-07 17:44:51.467053	2025-05-07 17:44:51.467053	\N
34	77	FEITO CADASTRO NO DIA GERADO CUSTA DA CHAVE DE 20 E SERÁ FEITO MAIS UMA INCLUSÃO  POSTERIOR DE 246 MAIS 20 DE CHAVE TOLATIZANDO ASSIM O CUSTO EM 286,00	1	286.00	2025-05-07	18	\N	\N	\N	2025-05-07 17:52:05.941632	2025-05-07 17:52:05.941632	\N
35	78	 	1	250.00	2025-05-07	18	\N	\N	\N	2025-05-07 18:00:30.922198	2025-05-07 18:00:30.922198	2025-05-02
36	98	 	8	58.57	2025-05-07	18	\N	\N	\N	2025-05-07 19:13:05.381969	2025-05-07 19:13:05.381969	2025-05-05
37	98	 	1	266.00	2025-05-07	18	\N	\N	\N	2025-05-07 19:14:08.648394	2025-05-07 19:14:08.648394	2025-05-05
38	99	 	1	500.00	2025-05-07	18	\N	\N	\N	2025-05-07 19:16:10.208082	2025-05-07 19:16:10.208082	2025-05-05
39	100	 	8	42.82	2025-05-07	18	\N	\N	\N	2025-05-07 19:17:21.845138	2025-05-07 19:17:21.845138	\N
40	100	 	6	25.00	2025-05-07	18	\N	\N	\N	2025-05-07 19:19:38.361442	2025-05-07 19:19:38.361442	\N
41	101	 	8	21.63	2025-05-07	18	\N	\N	\N	2025-05-07 19:20:27.354042	2025-05-07 19:20:27.354042	\N
42	103	 	7	69.00	2025-05-07	1	\N	\N	\N	2025-05-07 19:31:27.673008	2025-05-07 19:31:27.673008	2025-05-07
43	109	 	8	12.29	2025-05-07	18	\N	\N	\N	2025-05-07 19:46:35.475493	2025-05-07 19:46:35.475493	\N
44	112	 	8	67.65	2025-05-07	18	\N	\N	\N	2025-05-07 19:52:27.422959	2025-05-07 19:52:27.422959	\N
45	112	 	1	250.00	2025-05-07	18	\N	\N	\N	2025-05-07 19:53:07.769889	2025-05-07 19:53:07.769889	\N
46	112	 	6	25.00	2025-05-07	18	\N	\N	\N	2025-05-07 19:53:25.588453	2025-05-07 19:53:25.588453	\N
48	116	 	1	250.00	2025-05-07	18	\N	\N	\N	2025-05-07 19:56:32.89884	2025-05-07 19:56:32.89884	\N
49	116	 	6	25.00	2025-05-07	18	\N	\N	\N	2025-05-07 19:56:41.432863	2025-05-07 19:56:41.432863	\N
50	165	 	8	170.11	2025-05-07	18	\N	\N	\N	2025-05-07 20:00:56.393975	2025-05-07 20:00:56.393975	\N
51	173	 	8	330.94	2025-05-07	18	\N	\N	\N	2025-05-07 20:40:10.716	2025-05-07 20:40:10.716	\N
52	173	 	1	1330.00	2025-05-07	18	\N	\N	\N	2025-05-07 20:42:58.246958	2025-05-07 20:42:58.246958	\N
55	141	 	1	187.50	2025-05-08	18	\N	\N	\N	2025-05-08 11:14:15.448737	2025-05-08 11:14:15.448737	\N
56	229	 	1	58.57	2025-05-08	18	\N	\N	\N	2025-05-08 18:15:53.222815	2025-05-08 18:15:53.222815	2025-05-07
57	229	 	1	266.00	2025-05-08	18	\N	\N	\N	2025-05-08 18:16:52.798893	2025-05-08 18:16:52.798893	2025-05-07
59	225	 	1	266.00	2025-05-08	18	\N	\N	\N	2025-05-08 18:19:58.169344	2025-05-08 18:19:58.169344	2025-05-07
60	227	 	1	250.00	2025-05-08	18	\N	\N	\N	2025-05-08 18:23:31.659443	2025-05-08 18:23:31.659443	2025-05-07
61	227	 	6	25.00	2025-05-08	18	\N	\N	\N	2025-05-08 18:23:54.863187	2025-05-08 18:23:54.863187	2025-05-07
62	214	 	1	266.00	2025-05-08	18	\N	\N	\N	2025-05-08 18:26:54.055906	2025-05-08 18:26:54.055906	2025-05-07
63	215	 	1	187.50	2025-05-08	18	\N	\N	\N	2025-05-08 18:28:10.864061	2025-05-08 18:28:10.864061	\N
65	217	 	1	250.00	2025-05-08	18	\N	\N	\N	2025-05-08 18:33:46.957583	2025-05-08 18:33:46.957583	2025-05-07
66	217	 	6	25.00	2025-05-08	18	\N	\N	\N	2025-05-08 18:34:03.709644	2025-05-08 18:34:03.709644	2025-02-07
67	217	 	8	88.19	2025-05-08	18	\N	\N	\N	2025-05-08 18:34:36.53223	2025-05-08 18:34:36.53223	2025-05-07
68	218	 	1	266.00	2025-05-08	18	\N	\N	\N	2025-05-08 18:36:14.030006	2025-05-08 18:36:14.030006	2025-05-07
69	220	 	8	20.41	2025-05-08	18	\N	\N	\N	2025-05-08 19:26:04.736715	2025-05-08 19:26:04.736715	2025-05-07
70	222	 	1	250.00	2025-05-08	18	\N	\N	\N	2025-05-08 19:29:09.625912	2025-05-08 19:29:09.625912	\N
71	206	 	1	266.00	2025-05-08	18	\N	\N	\N	2025-05-08 19:32:01.471391	2025-05-08 19:32:01.471391	\N
72	207	 	1	266.00	2025-05-08	18	\N	\N	\N	2025-05-08 19:33:47.855114	2025-05-08 19:33:47.855114	\N
73	208	 	1	266.00	2025-05-08	18	\N	\N	\N	2025-05-08 19:35:39.632521	2025-05-08 19:35:39.632521	\N
74	196	 	1	250.00	2025-05-08	18	\N	\N	\N	2025-05-08 19:39:16.297038	2025-05-08 19:39:16.297038	\N
75	244	 	8	29.82	2025-05-09	18	\N	\N	\N	2025-05-09 17:32:57.093444	2025-05-09 17:32:57.093444	2025-05-08
77	244	 	1	250.00	2025-05-09	18	\N	\N	\N	2025-05-09 17:33:56.972889	2025-05-09 17:33:56.972889	2025-05-08
78	244	 	6	25.00	2025-05-09	18	\N	\N	\N	2025-05-09 17:34:09.102849	2025-05-09 17:34:09.102849	2025-05-08
80	276	 	1	880.00	2025-05-09	18	\N	\N	\N	2025-05-09 18:08:55.142055	2025-05-09 18:08:55.142055	2025-05-05
81	284	 	8	155.84	2025-05-09	18	\N	\N	\N	2025-05-09 18:14:33.616766	2025-05-09 18:14:33.616766	2025-05-08
84	264	 	1	250.00	2025-05-09	18	\N	\N	\N	2025-05-09 18:22:35.914499	2025-05-09 18:22:35.914499	2025-05-07
85	269	 	1	266.00	2025-05-09	18	\N	\N	\N	2025-05-09 18:44:01.118805	2025-05-09 18:44:01.118805	\N
86	251	 	1	266.00	2025-05-09	18	\N	\N	\N	2025-05-09 18:46:47.072738	2025-05-09 18:46:47.072738	2025-05-06
88	240	 	4	80.00	2025-05-09	18	\N	\N	\N	2025-05-09 18:49:40.564697	2025-05-09 18:49:40.564697	2025-05-08
89	241	 	1	250.00	2025-05-09	18	\N	\N	\N	2025-05-09 18:52:15.949918	2025-05-09 18:52:15.949918	2025-05-08
90	242	 	1	23.15	2025-05-09	18	\N	\N	\N	2025-05-09 18:59:31.331689	2025-05-09 18:59:31.331689	2025-05-07
91	243	 	1	266.00	2025-05-09	18	\N	\N	\N	2025-05-09 19:01:23.288987	2025-05-09 19:01:23.288987	2025-05-08
92	232	 	4	80.00	2025-05-09	18	\N	\N	\N	2025-05-09 19:24:53.762222	2025-05-09 19:24:53.762222	2025-05-08
93	234	 	1	250.00	2025-05-09	18	\N	\N	\N	2025-05-09 19:26:38.902558	2025-05-09 19:26:38.902558	2025-05-08
94	237	 	1	375.00	2025-05-09	18	\N	\N	\N	2025-05-09 20:42:42.209367	2025-05-09 20:42:42.209367	2025-05-08
95	300	 	8	66.19	2025-05-09	18	\N	\N	\N	2025-05-09 21:05:28.028413	2025-05-09 21:05:28.028413	\N
96	300	 	1	220.00	2025-05-09	18	\N	\N	\N	2025-05-09 21:06:37.082031	2025-05-09 21:06:37.082031	2025-05-06
98	210	 	1	266.00	2025-05-09	18	\N	\N	\N	2025-05-09 21:11:59.138904	2025-05-09 21:11:59.138904	2025-05-08
100	315	 	1	220.00	2025-05-13	18	\N	\N	\N	2025-05-13 18:38:10.247526	2025-05-13 18:38:10.247526	2025-05-12
101	326	 	8	17.54	2025-05-13	18	\N	\N	\N	2025-05-13 19:28:15.135448	2025-05-13 19:28:15.135448	\N
102	309	 	1	250.00	2025-05-13	18	\N	\N	\N	2025-05-13 19:57:16.072038	2025-05-13 19:57:16.072038	2025-05-12
103	311	 	8	65.05	2025-05-13	18	\N	\N	\N	2025-05-13 20:01:09.937136	2025-05-13 20:01:09.937136	2025-05-12
104	311	 	1	266.00	2025-05-13	18	\N	\N	\N	2025-05-13 20:01:41.6284	2025-05-13 20:01:41.6284	2025-05-12
106	312	 	1	250.00	2025-05-13	18	\N	\N	\N	2025-05-13 20:03:37.088467	2025-05-13 20:03:37.088467	2025-05-12
107	313	 	1	187.50	2025-05-13	18	\N	\N	\N	2025-05-13 20:04:48.284052	2025-05-13 20:04:48.284052	2025-05-12
108	314	 	1	250.00	2025-05-13	18	\N	\N	\N	2025-05-13 20:05:49.139739	2025-05-13 20:05:49.139739	2025-05-12
109	299	 	8	85.43	2025-05-13	18	\N	\N	\N	2025-05-13 20:11:53.090072	2025-05-13 20:11:53.090072	2025-05-09
111	299	 	1	562.50	2025-05-13	18	\N	\N	\N	2025-05-13 20:13:01.457755	2025-05-13 20:13:01.457755	2025-05-09
112	304	 	1	443.50	2025-05-13	18	\N	\N	\N	2025-05-13 20:14:50.372441	2025-05-13 20:14:50.372441	2025-05-09
113	292	 	6	25.00	2025-05-13	18	\N	\N	\N	2025-05-13 20:47:27.79932	2025-05-13 20:47:27.79932	2025-05-09
114	292	 	4	61.83	2025-05-13	18	\N	\N	\N	2025-05-13 20:47:57.967153	2025-05-13 20:47:57.967153	2025-05-09
115	293	 	8	23.76	2025-05-13	18	\N	\N	\N	2025-05-13 20:49:41.003136	2025-05-13 20:49:41.003136	2025-05-09
116	293	 	1	266.00	2025-05-13	18	\N	\N	\N	2025-05-13 20:50:15.135005	2025-05-13 20:50:15.135005	2025-05-09
117	294	 	1	220.00	2025-05-13	18	\N	\N	\N	2025-05-13 20:55:33.817012	2025-05-13 20:55:33.817012	2025-05-09
118	336	 	1	220.00	2025-05-14	18	\N	\N	\N	2025-05-14 11:38:52.333023	2025-05-14 11:38:52.333023	2025-05-12
119	338	 	8	23.32	2025-05-14	18	\N	\N	\N	2025-05-14 11:40:44.875616	2025-05-14 11:40:44.875616	2025-05-12
120	338	 	1	266.00	2025-05-14	18	\N	\N	\N	2025-05-14 11:41:13.776327	2025-05-14 11:41:13.776327	\N
121	379	 	1	250.00	2025-05-14	18	\N	\N	\N	2025-05-14 18:05:38.996166	2025-05-14 18:05:38.996166	2025-05-12
122	391	 	8	454.15	2025-05-14	18	\N	\N	\N	2025-05-14 18:11:31.167122	2025-05-14 18:11:31.167122	2025-05-12
124	392	 	1	275.00	2025-05-14	18	\N	\N	\N	2025-05-14 18:22:11.033566	2025-05-14 18:22:11.033566	2025-05-13
125	394	 	1	286.00	2025-05-14	18	\N	\N	\N	2025-05-14 18:26:41.777205	2025-05-14 18:26:41.777205	\N
126	395	 	6	25.00	2025-05-14	18	\N	\N	\N	2025-05-14 18:28:33.081797	2025-05-14 18:28:33.081797	\N
127	362	 	8	17.25	2025-05-14	18	\N	\N	\N	2025-05-14 18:30:19.344002	2025-05-14 18:30:19.344002	\N
128	362	 	1	250.00	2025-05-14	18	\N	\N	\N	2025-05-14 18:31:06.402831	2025-05-14 18:31:06.402831	\N
129	399	 	1	266.00	2025-05-14	18	\N	\N	\N	2025-05-14 19:15:09.021887	2025-05-14 19:15:09.021887	2025-05-09
130	361	 	1	275.00	2025-05-14	18	\N	\N	\N	2025-05-14 19:18:11.940549	2025-05-14 19:18:11.940549	\N
131	365	 	1	266.00	2025-05-14	18	\N	\N	\N	2025-05-14 20:22:11.777706	2025-05-14 20:22:11.777706	\N
132	358	 	8	21.62	2025-05-14	18	\N	\N	\N	2025-05-14 20:23:28.197881	2025-05-14 20:23:28.197881	\N
133	367	 	1	187.50	2025-05-14	18	\N	\N	\N	2025-05-14 20:33:10.331147	2025-05-14 20:33:10.331147	2025-05-12
134	351	 	1	250.00	2025-05-14	18	\N	\N	\N	2025-05-14 20:40:10.190174	2025-05-14 20:40:10.190174	\N
135	350	 	8	63.75	2025-05-14	18	\N	\N	\N	2025-05-14 20:41:06.681996	2025-05-14 20:41:06.681996	\N
136	350	 	8	266.00	2025-05-14	18	\N	\N	\N	2025-05-14 20:41:35.592033	2025-05-14 20:41:35.592033	2025-05-12
137	349	 	1	532.00	2025-05-14	18	\N	\N	\N	2025-05-14 20:43:36.417642	2025-05-14 20:43:36.417642	2025-05-12
\.


--
-- Data for Name: sale_payment_receipts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sale_payment_receipts (id, installment_id, receipt_type, receipt_url, receipt_data, confirmed_by, confirmation_date, notes, created_at) FROM stdin;
12	50	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-06 14:08:06.308202	ITAU F-19	2025-05-06 14:08:06.308202
13	51	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-06 14:11:54.288698	PIX ITAU F-19	2025-05-06 14:11:54.288698
14	70	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-06 18:22:52.025077	PIX ITAU 	2025-05-06 18:22:52.025077
15	50	admin_edit	\N	{"detail":"Pagamento editado por admin (admin)","paymentMethod":"PIX","editDetails":{"previousPaymentDate":"06/05/2025","newPaymentDate":"05/05/2025"}}	1	2025-05-06 20:24:06.29475	Edição administrativa de pagamento realizada por usuário ID 1	2025-05-06 20:24:06.29475
16	51	admin_edit	\N	{"detail":"Pagamento editado por admin (admin)","paymentMethod":"PIX","editDetails":{"previousPaymentDate":"02/05/2025","newPaymentDate":"02/05/2025"}}	1	2025-05-06 20:33:22.947732	Edição administrativa de pagamento realizada por usuário ID 1	2025-05-06 20:33:22.947732
17	70	admin_edit	\N	{"detail":"Pagamento editado por admin (admin)","paymentMethod":"PIX","editDetails":{"previousPaymentDate":"02/05/2025","newPaymentDate":"02/05/2025"}}	1	2025-05-06 20:33:49.377376	Edição administrativa de pagamento realizada por usuário ID 1	2025-05-06 20:33:49.377376
18	56	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-07 11:47:01.342997	\N	2025-05-07 11:47:01.342997
19	57	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-07 11:48:12.308178	\N	2025-05-07 11:48:12.308178
20	58	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-07 11:52:35.152704	\N	2025-05-07 11:52:35.152704
21	74	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-07 11:54:25.21191	\N	2025-05-07 11:54:25.21191
22	59	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-07 12:27:55.621039	\N	2025-05-07 12:27:55.621039
23	61	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-07 12:29:40.824672	\N	2025-05-07 12:29:40.824672
24	63	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-07 12:34:41.509385	\N	2025-05-07 12:34:41.509385
25	64	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-07 12:36:50.441787	\N	2025-05-07 12:36:50.441787
30	65	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-07 17:29:54.347522	\N	2025-05-07 17:29:54.347522
32	69	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-07 17:36:24.733388	\N	2025-05-07 17:36:24.733388
33	71	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-07 17:38:39.252163	\N	2025-05-07 17:38:39.252163
34	72	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-07 17:40:06.445705	\N	2025-05-07 17:40:06.445705
35	75	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-07 17:41:12.004552	\N	2025-05-07 17:41:12.004552
36	77	manual	\N	{"detail":"Confirmação manual","paymentMethod":"CARTAO"}	18	2025-05-07 17:43:44.179285	\N	2025-05-07 17:43:44.179285
37	78	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-07 17:46:31.275727	\N	2025-05-07 17:46:31.275727
38	79	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-07 17:58:11.44538	\N	2025-05-07 17:58:11.44538
45	96	manual	\N	{"detail":"Confirmação manual","paymentMethod":"CARTAO"}	18	2025-05-07 19:12:36.438578	\N	2025-05-07 19:12:36.438578
46	97	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-07 19:15:17.024896	\N	2025-05-07 19:15:17.024896
47	98	manual	\N	{"detail":"Confirmação manual","paymentMethod":"CARTAO"}	18	2025-05-07 19:17:40.29113	\N	2025-05-07 19:17:40.29113
48	99	manual	\N	{"detail":"Confirmação manual","paymentMethod":"CARTAO"}	18	2025-05-07 19:20:15.522598	\N	2025-05-07 19:20:15.522598
49	100	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-07 19:22:10.091235	\N	2025-05-07 19:22:10.091235
50	101	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-07 19:23:49.841945	\N	2025-05-07 19:23:49.841945
53	102	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-07 19:37:09.885698	\N	2025-05-07 19:37:09.885698
56	103	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-07 19:38:34.649076	\N	2025-05-07 19:38:34.649076
57	104	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-07 19:39:12.319606	\N	2025-05-07 19:39:12.319606
58	105	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-07 19:41:34.040167	\N	2025-05-07 19:41:34.040167
59	106	manual	\N	{"detail":"Confirmação manual","paymentMethod":"BOLETO"}	18	2025-05-07 19:42:36.727273	\N	2025-05-07 19:42:36.727273
62	107	manual	\N	{"detail":"Confirmação manual","paymentMethod":"CARTAO"}	18	2025-05-07 19:46:09.216152	\N	2025-05-07 19:46:09.216152
63	108	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-07 19:48:26.458706	\N	2025-05-07 19:48:26.458706
66	110	manual	\N	{"detail":"Confirmação manual","paymentMethod":"CARTAO"}	18	2025-05-07 19:52:14.749876	\N	2025-05-07 19:52:14.749876
69	111	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-07 19:54:41.371415	\N	2025-05-07 19:54:41.371415
70	114	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-07 19:55:36.872895	\N	2025-05-07 19:55:36.872895
148	257	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-09 18:46:11.373493	\N	2025-05-09 18:46:11.373493
149	243	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-09 18:47:24.900084	\N	2025-05-09 18:47:24.900084
150	244	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-09 18:50:50.581646	\N	2025-05-09 18:50:50.581646
151	245	manual	\N	{"detail":"Confirmação manual","paymentMethod":"CARTAO"}	18	2025-05-09 18:56:28.716228	\N	2025-05-09 18:56:28.716228
152	246	manual	\N	{"detail":"Confirmação manual","paymentMethod":"CARTAO"}	18	2025-05-09 18:56:36.167085	\N	2025-05-09 18:56:36.167085
153	247	manual	\N	{"detail":"Confirmação manual","paymentMethod":"CARTAO"}	18	2025-05-09 18:56:41.459447	\N	2025-05-09 18:56:41.459447
154	248	manual	\N	{"detail":"Confirmação manual","paymentMethod":"CARTAO"}	18	2025-05-09 18:56:48.947706	\N	2025-05-09 18:56:48.947706
155	249	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-09 19:00:39.113995	\N	2025-05-09 19:00:39.113995
156	252	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-09 19:03:35.000885	\N	2025-05-09 19:03:35.000885
158	235	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-09 19:24:18.935593	\N	2025-05-09 19:24:18.935593
159	237	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-09 19:25:51.379074	\N	2025-05-09 19:25:51.379074
160	238	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-09 19:28:54.761179	\N	2025-05-09 19:28:54.761179
161	240	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-09 20:41:52.879536	\N	2025-05-09 20:41:52.879536
162	241	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-09 20:43:26.880796	\N	2025-05-09 20:43:26.880796
163	209	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-09 20:48:13.933571	\N	2025-05-09 20:48:13.933571
164	305	manual	\N	{"detail":"Confirmação manual","paymentMethod":"CARTAO"}	18	2025-05-09 21:05:12.642184	\N	2025-05-09 21:05:12.642184
165	307	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-09 21:07:37.030673	\N	2025-05-09 21:07:37.030673
166	210	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-09 21:11:00.05537	\N	2025-05-09 21:11:00.05537
74	160	manual	\N	{"detail":"Confirmação manual","paymentMethod":"CARTAO"}	18	2025-05-07 20:00:42.641058	\N	2025-05-07 20:00:42.641058
78	161	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-07 20:04:51.365865	\N	2025-05-07 20:04:51.365865
79	167	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-07 20:36:40.154522	\N	2025-05-07 20:36:40.154522
80	170	manual	\N	{"detail":"Confirmação manual","paymentMethod":"CARTAO"}	18	2025-05-07 20:39:37.752315	\N	2025-05-07 20:39:37.752315
88	174	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-07 20:46:45.97911	\N	2025-05-07 20:46:45.97911
89	124	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-07 21:11:54.764285	\N	2025-05-07 21:11:54.764285
90	125	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-07 21:13:30.31976	\N	2025-05-07 21:13:30.31976
91	126	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-07 21:14:54.336393	\N	2025-05-07 21:14:54.336393
96	130	manual	\N	{"detail":"Confirmação manual","paymentMethod":"BOLETO"}	18	2025-05-08 11:10:52.594142	\N	2025-05-08 11:10:52.594142
97	132	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-08 11:12:17.098417	\N	2025-05-08 11:12:17.098417
98	233	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-08 18:06:50.681955	\N	2025-05-08 18:06:50.681955
99	234	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-08 18:12:09.208266	\N	2025-05-08 18:12:09.208266
100	236	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-08 18:14:00.733083	\N	2025-05-08 18:14:00.733083
101	232	manual	\N	{"detail":"Confirmação manual","paymentMethod":"CARTAO"}	18	2025-05-08 18:15:18.811491	\N	2025-05-08 18:15:18.811491
102	227	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-08 18:18:04.979936	\N	2025-05-08 18:18:04.979936
103	228	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-08 18:18:59.740643	\N	2025-05-08 18:18:59.740643
104	229	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-08 18:20:43.112305	\N	2025-05-08 18:20:43.112305
105	230	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-08 18:21:33.22288	\N	2025-05-08 18:21:33.22288
106	217	manual	\N	{"detail":"Confirmação manual","paymentMethod":"BOLETO"}	18	2025-05-08 18:25:42.745745	\N	2025-05-08 18:25:42.745745
107	218	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-08 18:27:39.801419	\N	2025-05-08 18:27:39.801419
108	219	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-08 18:28:43.170666	\N	2025-05-08 18:28:43.170666
109	220	manual	\N	{"detail":"Confirmação manual","paymentMethod":"CARTAO"}	18	2025-05-08 18:32:25.208495	\N	2025-05-08 18:32:25.208495
110	221	manual	\N	{"detail":"Confirmação manual","paymentMethod":"BOLETO"}	18	2025-05-08 18:35:19.938129	\N	2025-05-08 18:35:19.938129
111	222	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-08 19:23:18.68733	\N	2025-05-08 19:23:18.68733
112	223	manual	\N	{"detail":"Confirmação manual","paymentMethod":"CARTAO"}	18	2025-05-08 19:25:40.695804	\N	2025-05-08 19:25:40.695804
113	224	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-08 19:27:12.078062	\N	2025-05-08 19:27:12.078062
114	225	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-08 19:28:23.545458	\N	2025-05-08 19:28:23.545458
115	226	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-08 19:29:54.9493	\N	2025-05-08 19:29:54.9493
116	206	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-08 19:31:27.542262	\N	2025-05-08 19:31:27.542262
117	207	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-08 19:33:05.776165	\N	2025-05-08 19:33:05.776165
118	208	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-08 19:35:04.662547	\N	2025-05-08 19:35:04.662547
119	195	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-08 19:37:21.386137	\N	2025-05-08 19:37:21.386137
120	196	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-08 19:38:12.698077	\N	2025-05-08 19:38:12.698077
121	197	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-08 19:40:15.498641	\N	2025-05-08 19:40:15.498641
122	239	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-08 19:42:53.206285	\N	2025-05-08 19:42:53.206285
123	242	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-09 11:16:29.662062	\N	2025-05-09 11:16:29.662062
124	250	manual	\N	{"detail":"Confirmação manual","paymentMethod":"CARTAO"}	18	2025-05-09 17:32:33.599453	\N	2025-05-09 17:32:33.599453
125	253	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-09 17:35:48.821114	\N	2025-05-09 17:35:48.821114
126	255	manual	\N	{"detail":"Confirmação manual","paymentMethod":"BOLETO"}	18	2025-05-09 17:37:23.015724	\N	2025-05-09 17:37:23.015724
127	256	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-09 17:39:01.227311	\N	2025-05-09 17:39:01.227311
128	258	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-09 17:40:33.142759	\N	2025-05-09 17:40:33.142759
129	266	manual	\N	{"detail":"Confirmação manual","paymentMethod":"BOLETO"}	18	2025-05-09 17:42:28.529548	\N	2025-05-09 17:42:28.529548
130	267	manual	\N	{"detail":"Confirmação manual","paymentMethod":"BOLETO"}	18	2025-05-09 17:43:23.918584	\N	2025-05-09 17:43:23.918584
131	269	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-09 17:52:11.379762	\N	2025-05-09 17:52:11.379762
132	274	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-09 17:53:57.629229	\N	2025-05-09 17:53:57.629229
133	277	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-09 17:56:04.599347	\N	2025-05-09 17:56:04.599347
134	278	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-09 17:56:57.593358	\N	2025-05-09 17:56:57.593358
135	281	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-09 17:57:57.817839	\N	2025-05-09 17:57:57.817839
136	282	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-09 17:59:01.620316	\N	2025-05-09 17:59:01.620316
137	285	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-09 18:10:19.453378	\N	2025-05-09 18:10:19.453378
139	287	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-09 18:12:53.169379	\N	2025-05-09 18:12:53.169379
140	290	manual	\N	{"detail":"Confirmação manual","paymentMethod":"CARTAO"}	18	2025-05-09 18:14:06.821269	\N	2025-05-09 18:14:06.821269
142	270	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-09 18:21:34.957117	\N	2025-05-09 18:21:34.957117
143	271	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-09 18:23:41.806506	\N	2025-05-09 18:23:41.806506
144	272	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-09 18:25:58.006431	\N	2025-05-09 18:25:58.006431
145	276	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-09 18:42:45.129102	\N	2025-05-09 18:42:45.129102
146	275	manual	\N	{"detail":"Confirmação manual","paymentMethod":"BOLETO"}	18	2025-05-09 18:43:26.136608	\N	2025-05-09 18:43:26.136608
147	273	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-09 18:44:48.278509	\N	2025-05-09 18:44:48.278509
157	283	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-09 19:12:52.322935	\N	2025-05-09 19:12:52.322935
167	320	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-13 18:36:30.332617	\N	2025-05-13 18:36:30.332617
168	321	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-13 19:07:17.049394	\N	2025-05-13 19:07:17.049394
169	331	manual	\N	{"detail":"Confirmação manual","paymentMethod":"CARTAO"}	18	2025-05-13 19:27:51.067001	\N	2025-05-13 19:27:51.067001
170	314	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-13 19:56:44.194834	\N	2025-05-13 19:56:44.194834
171	315	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-13 19:58:24.802773	\N	2025-05-13 19:58:24.802773
172	316	manual	\N	{"detail":"Confirmação manual","paymentMethod":"CARTAO"}	18	2025-05-13 20:00:47.594564	\N	2025-05-13 20:00:47.594564
173	317	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-13 20:02:50.789051	\N	2025-05-13 20:02:50.789051
174	318	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-13 20:04:19.148192	\N	2025-05-13 20:04:19.148192
175	319	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-13 20:05:21.611811	\N	2025-05-13 20:05:21.611811
176	322	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-13 20:07:44.079621	\N	2025-05-13 20:07:44.079621
177	323	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-13 20:08:51.340755	\N	2025-05-13 20:08:51.340755
178	306	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-13 20:09:45.277004	\N	2025-05-13 20:09:45.277004
179	308	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-13 20:10:30.167735	\N	2025-05-13 20:10:30.167735
180	304	manual	\N	{"detail":"Confirmação manual","paymentMethod":"CARTAO"}	18	2025-05-13 20:11:25.60623	\N	2025-05-13 20:11:25.60623
181	309	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-13 20:13:55.22945	\N	2025-05-13 20:13:55.22945
182	310	manual	\N	{"detail":"Confirmação manual","paymentMethod":"BOLETO"}	18	2025-05-13 20:15:28.96077	\N	2025-05-13 20:15:28.96077
183	311	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-13 20:18:31.726288	\N	2025-05-13 20:18:31.726288
184	313	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-13 20:19:05.969274	\N	2025-05-13 20:19:05.969274
185	297	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-13 20:27:31.91289	\N	2025-05-13 20:27:31.91289
186	298	manual	\N	{"detail":"Confirmação manual","paymentMethod":"CARTAO"}	18	2025-05-13 20:49:18.525018	\N	2025-05-13 20:49:18.525018
187	299	manual	\N	{"detail":"Confirmação manual","paymentMethod":"BOLETO"}	18	2025-05-13 20:51:17.273148	\N	2025-05-13 20:51:17.273148
188	343	manual	\N	{"detail":"Confirmação manual","paymentMethod":"BOLETO"}	18	2025-05-14 11:34:59.24105	\N	2025-05-14 11:34:59.24105
189	344	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-14 11:37:50.844664	\N	2025-05-14 11:37:50.844664
190	345	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-14 11:39:33.357216	\N	2025-05-14 11:39:33.357216
191	346	manual	\N	{"detail":"Confirmação manual","paymentMethod":"CARTAO"}	18	2025-05-14 11:40:30.55425	\N	2025-05-14 11:40:30.55425
192	385	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-14 18:05:05.235622	\N	2025-05-14 18:05:05.235622
193	387	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-14 18:07:23.253209	\N	2025-05-14 18:07:23.253209
194	388	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-14 18:08:32.528194	\N	2025-05-14 18:08:32.528194
195	389	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-14 18:09:46.857298	\N	2025-05-14 18:09:46.857298
196	392	manual	\N	{"detail":"Confirmação manual","paymentMethod":"CARTAO"}	18	2025-05-14 18:11:19.158419	\N	2025-05-14 18:11:19.158419
197	393	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-14 18:21:20.74858	\N	2025-05-14 18:21:20.74858
198	394	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-14 18:22:58.863476	\N	2025-05-14 18:22:58.863476
199	395	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-14 18:23:38.59253	\N	2025-05-14 18:23:38.59253
200	396	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-14 18:27:54.527716	\N	2025-05-14 18:27:54.527716
201	371	manual	\N	{"detail":"Confirmação manual","paymentMethod":"CARTAO"}	18	2025-05-14 18:29:56.859106	\N	2025-05-14 18:29:56.859106
202	372	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-14 18:32:00.614344	\N	2025-05-14 18:32:00.614344
203	400	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-14 19:14:22.764179	\N	2025-05-14 19:14:22.764179
204	373	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-14 19:16:03.863511	\N	2025-05-14 19:16:03.863511
205	370	manual	\N	{"detail":"Confirmação manual","paymentMethod":"BOLETO"}	18	2025-05-14 19:17:30.315133	\N	2025-05-14 19:17:30.315133
206	369	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-14 20:16:04.832625	\N	2025-05-14 20:16:04.832625
207	374	manual	\N	{"detail":"Confirmação manual","paymentMethod":"BOLETO"}	18	2025-05-14 20:21:40.222808	\N	2025-05-14 20:21:40.222808
208	368	manual	\N	{"detail":"Confirmação manual","paymentMethod":"CARTAO"}	18	2025-05-14 20:23:16.950886	\N	2025-05-14 20:23:16.950886
209	375	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-14 20:28:30.625123	\N	2025-05-14 20:28:30.625123
210	366	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-14 20:30:05.056682	\N	2025-05-14 20:30:05.056682
211	376	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-14 20:32:30.436571	\N	2025-05-14 20:32:30.436571
212	365	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-14 20:33:51.947226	\N	2025-05-14 20:33:51.947226
213	364	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-14 20:35:31.34404	\N	2025-05-14 20:35:31.34404
214	363	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-14 20:37:22.731066	\N	2025-05-14 20:37:22.731066
215	362	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-14 20:39:39.309798	\N	2025-05-14 20:39:39.309798
216	361	manual	\N	{"detail":"Confirmação manual","paymentMethod":"CARTAO"}	18	2025-05-14 20:40:47.653288	\N	2025-05-14 20:40:47.653288
217	360	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-14 20:42:41.498522	\N	2025-05-14 20:42:41.498522
218	359	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-14 20:44:11.762099	\N	2025-05-14 20:44:11.762099
219	358	manual	\N	{"detail":"Confirmação manual","paymentMethod":"PIX"}	18	2025-05-14 20:53:49.856617	\N	2025-05-14 20:53:49.856617
\.


--
-- Data for Name: sale_service_providers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sale_service_providers (id, sale_id, service_provider_id, created_at) FROM stdin;
18	49	1	2025-05-06 14:10:17.261806
20	51	1	2025-05-06 14:32:43.502971
27	53	3	2025-05-06 14:35:31.454675
28	53	1	2025-05-06 14:35:31.454675
34	55	1	2025-05-06 14:36:44.085521
40	59	2	2025-05-06 14:46:43.041123
42	61	1	2025-05-06 16:57:50.132826
44	62	1	2025-05-06 16:58:25.08296
48	63	1	2025-05-06 16:59:00.846596
50	67	1	2025-05-06 17:01:01.502767
54	73	1	2025-05-06 18:12:06.439296
58	76	1	2025-05-06 18:14:06.33359
60	77	1	2025-05-06 18:14:35.485546
62	78	1	2025-05-06 18:15:08.994451
64	79	1	2025-05-06 18:15:54.931088
68	80	1	2025-05-06 18:16:35.376019
70	74	1	2025-05-06 18:30:16.129372
72	98	1	2025-05-07 11:41:48.334285
74	123	2	2025-05-07 11:42:36.701397
76	116	1	2025-05-07 11:43:15.892588
78	109	1	2025-05-07 11:44:47.8406
81	112	1	2025-05-07 11:45:23.023746
82	112	3	2025-05-07 11:45:23.023746
86	127	1	2025-05-07 14:43:15.132323
88	153	1	2025-05-07 19:03:14.261315
92	140	1	2025-05-07 19:04:57.3454
95	157	2	2025-05-07 19:15:59.458017
96	157	3	2025-05-07 19:15:59.458017
98	106	2	2025-05-07 20:36:53.647558
100	99	1	2025-05-09 17:42:02.946039
102	100	3	2025-05-09 17:42:21.702182
104	104	1	2025-05-09 17:43:27.411113
106	107	1	2025-05-09 17:44:11.923946
108	111	1	2025-05-09 17:44:46.344381
110	171	1	2025-05-13 18:04:52.868825
112	264	1	2025-05-13 18:16:41.138656
114	216	1	2025-05-13 18:22:36.745925
120	214	1	2025-05-13 18:23:21.198383
122	219	2	2025-05-13 18:28:03.892436
124	222	1	2025-05-13 19:18:18.097533
126	205	1	2025-05-13 19:19:16.086794
128	187	3	2025-05-14 14:17:48.538108
132	361	3	2025-05-14 14:21:55.5543
136	362	1	2025-05-14 14:22:57.668816
138	327	1	2025-05-14 14:30:31.484469
140	141	2	2025-05-14 14:38:37.779349
142	142	1	2025-05-14 14:39:43.137187
\.


--
-- Data for Name: sales; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sales (id, order_number, date, customer_id, payment_method_id, seller_id, service_type_id, service_provider_id, total_amount, installments, installment_value, status, execution_status, financial_status, notes, return_reason, responsible_operational_id, responsible_financial_id, created_at, updated_at) FROM stdin;
68	700387	2025-05-02 00:00:00	21	2	10	5	\N	1000.00	1	\N	completed	completed	paid	2 VIA 	\N	8	18	2025-05-06 17:09:41.693192	2025-05-06 18:22:52.266
73	533640	2025-05-02 00:00:00	34	2	11	1	1	300.00	1	\N	completed	completed	paid		\N	8	18	2025-05-06 17:20:37.568213	2025-05-07 11:54:25.388
83	642699	2025-05-02 00:00:00	42	1	12	5	\N	650	10	\N	completed	completed	in_progress		\N	8	18	2025-05-06 17:46:05.823305	2025-05-06 18:28:47.578
74	881010301	2025-05-06 00:00:00	31	2	14	1	\N	720.00	1	\N	completed	completed	paid	Cadastro PJ+ inclusão de duas placas	\N	8	18	2025-05-06 17:20:45.318901	2025-05-07 17:41:12.161
103	533653	2025-05-05 00:00:00	51	2	11	5	\N	300.00	1	\N	in_progress	in_progress	paid		\N	8	18	2025-05-06 19:32:38.618626	2025-05-09 17:43:09.34
97	1001558	2025-05-02 00:00:00	45	3	7	4	\N	750.00	1	\N	completed	completed	pending		\N	8	\N	2025-05-06 18:45:55.692172	2025-05-06 18:54:40.365
108	533658	2025-05-05 00:00:00	56	3	11	5	\N	200.00	1	\N	in_progress	in_progress	paid		\N	8	18	2025-05-06 19:45:34.894174	2025-05-09 17:44:20.786
48	90371	2025-05-05 00:00:00	10	2	16	5	\N	450.00	1	\N	completed	completed	paid	INCLUSÃO TAX AUXILIAR (RONILSON DE SOUZA  OLIVEIRA	\N	8	18	2025-05-06 13:35:53.781403	2025-05-06 14:08:06.469
82	642694	2025-05-02 00:00:00	41	2	12	2	\N	240.00	1	\N	completed	completed	pending	inclusão de uma placa	\N	8	\N	2025-05-06 17:43:48.526634	2025-05-06 18:17:06.198
96	1001561	2025-05-05 00:00:00	44	2	7	2	\N	500.00	1	\N	completed	completed	pending	aGENDAMENTO REALIZADO AS 11:55 	\N	7	\N	2025-05-06 18:43:09.875283	2025-05-06 18:47:55.643
98	533648	2025-05-05 00:00:00	46	1	11	1	\N	450.00	1	\N	completed	completed	paid		\N	8	18	2025-05-06 19:27:39.544347	2025-05-07 19:12:36.606
59	1235996	2025-05-02 00:00:00	23	2	15	1	\N	350.00	1	\N	completed	completed	paid		\N	8	18	2025-05-06 14:46:08.068434	2025-05-07 12:29:40.97
99	533649	2025-05-05 00:00:00	47	2	11	1	\N	600.00	1	\N	completed	completed	paid		\N	8	18	2025-05-06 19:28:34.166733	2025-05-09 17:42:03.013
100	533650	2025-05-05 00:00:00	48	1	11	3	\N	450.00	1	\N	completed	completed	paid		\N	8	18	2025-05-06 19:29:46.558019	2025-05-09 17:42:21.757
101	533651	2025-05-05 00:00:00	49	1	11	5	\N	250.00	1	\N	completed	completed	paid	REVALIDAÇÃO CONCLUIDA	\N	8	18	2025-05-06 19:30:57.128058	2025-05-09 17:42:44.65
49	0202024	2025-05-02 00:00:00	11	2	13	1	\N	1250.00	1	\N	completed	completed	paid	ABERTURA DE CADASTRO, TRÊS PLACAS PJ	\N	7	18	2025-05-06 14:01:41.785885	2025-05-06 14:11:54.448
102	533652	2025-05-05 00:00:00	50	2	11	5	\N	100.00	1	\N	completed	completed	paid		\N	8	18	2025-05-06 19:31:54.683306	2025-05-09 17:42:58.649
104	533654	2025-05-05 00:00:00	52	2	11	5	\N	350.00	1	\N	completed	completed	paid	revalidação concluida	\N	8	18	2025-05-06 19:36:34.549152	2025-05-09 17:43:27.464
105	533655	2025-05-05 00:00:00	53	2	11	5	\N	50.00	1	\N	completed	completed	paid		\N	8	18	2025-05-06 19:38:46.4781	2025-05-09 17:43:54.892
106	533656	2025-05-05 00:00:00	54	2	11	1	\N	350.00	1	\N	completed	completed	paid		\N	7	18	2025-05-06 19:43:09.886125	2025-05-07 20:36:53.857
50	0202025	2025-05-05 00:00:00	13	2	13	5	\N	350.00	1	\N	completed	completed	pending	EXCLUSÃO DA PLACA ( NZS-0J49) E REVALIDAÇÃO (SEGUNDA VIA)	\N	8	\N	2025-05-06 14:29:08.781913	2025-05-06 14:30:28.131
107	533657	2025-05-05 00:00:00	55	2	11	5	\N	300.00	1	\N	completed	completed	paid	revalidação concluida	\N	8	18	2025-05-06 19:44:23.05871	2025-05-09 17:44:12.026
109	881010292	2025-05-02 00:00:00	57	2	14	1	\N	390.00	1	\N	completed	completed	paid	CADASTRO PJ	\N	8	18	2025-05-06 19:46:40.196542	2025-05-07 19:46:09.366
77	533642	2025-05-02 00:00:00	36	2	11	1	\N	500.00	1	\N	completed	completed	paid	CADASTRO ANTT PJ + INCLUIR PPF1H09 POTSTERIOR	\N	8	18	2025-05-06 17:24:47.900823	2025-05-07 17:46:31.426
54	700386	2025-05-02 00:00:00	18	2	10	5	\N	200.00	1	\N	completed	completed	paid	2 VIA 	\N	8	18	2025-05-06 14:34:59.007059	2025-05-07 11:47:01.527
113	881010294	2025-05-05 00:00:00	60	2	14	5	\N	50.00	1	\N	completed	completed	paid	segunda via	\N	8	18	2025-05-06 19:59:05.690041	2025-05-07 19:54:41.521
51	1235992	2025-05-02 00:00:00	14	1	15	1	\N	1390	1	\N	completed	completed	pending		\N	8	\N	2025-05-06 14:30:57.593548	2025-05-06 14:32:43.568
112	881010293	2025-05-02 00:00:00	59	2	14	1	\N	520.00	1	\N	completed	completed	paid	cadastro+ inclusão de uma placa	\N	8	18	2025-05-06 19:53:27.237993	2025-05-07 19:52:14.913
52	0202026	2025-05-05 00:00:00	15	2	13	5	\N	250.00	1	\N	completed	completed	pending	REVALIDAÇÃO CONCLUÍDA	\N	8	\N	2025-05-06 14:31:54.487349	2025-05-06 14:33:35.342
55	0202027	2025-05-05 00:00:00	16	2	13	5	1	750.00	1	\N	completed	completed	paid	INCLUSÃO DE PLACA (JDL2I15);\nREVALIDAÇÃO CONCLUÍDA.	\N	8	18	2025-05-06 14:35:05.812055	2025-05-07 11:48:12.45
111	533660	2025-05-05 00:00:00	58	2	11	1	\N	500.00	1	\N	completed	completed	in_progress		\N	8	18	2025-05-06 19:50:00.242843	2025-05-09 17:44:46.399
56	0202028	2025-05-05 00:00:00	19	2	13	5	\N	650.00	1	\N	completed	completed	paid	REVALIDAÇÃO CONCLUIDA	\N	8	18	2025-05-06 14:36:49.922684	2025-05-07 11:52:35.294
57	1235994	2025-05-02 00:00:00	20	2	15	2	\N	750.00	1	\N	completed	completed	paid		\N	8	18	2025-05-06 14:37:21.214703	2025-05-07 12:27:55.759
61	1235995	2025-05-02 00:00:00	22	2	15	1	\N	350.00	1	\N	completed	completed	paid		\N	8	18	2025-05-06 16:34:52.629333	2025-05-07 12:34:41.652
62	1235997	2025-05-05 00:00:00	25	2	15	1	\N	750.00	1	\N	completed	completed	paid	reativação com duas placas + exclusão de duas 	\N	8	18	2025-05-06 16:44:18.212721	2025-05-07 12:36:50.637
63	1235999	2025-05-05 00:00:00	26	2	15	1	1	350.00	1	\N	completed	completed	paid		\N	8	18	2025-05-06 16:46:29.191675	2025-05-07 17:29:54.503
67	1236002	2025-05-05 00:00:00	30	2	15	1	\N	350.00	1	\N	completed	completed	paid		\N	8	18	2025-05-06 16:53:34.352907	2025-05-07 17:36:24.887
53	1235993	2025-05-02 00:00:00	17	1	15	1	3	650.00	1	\N	completed	completed	pending		\N	8	\N	2025-05-06 14:34:11.152562	2025-05-06 14:35:31.514
69	533638	2025-05-02 00:00:00	32	2	11	2	\N	600.00	1	\N	completed	completed	paid	INCLUSÃO DAS PLACAS TSC7F14, TSC8D24, TSC8E14, TSC7F14	\N	8	18	2025-05-06 17:11:49.891033	2025-05-07 17:38:39.402
71	533639	2025-05-02 00:00:00	33	2	11	5	\N	50.00	1	\N	completed	completed	paid		\N	8	18	2025-05-06 17:15:43.792344	2025-05-07 17:40:06.6
76	533641	2025-05-02 00:00:00	35	2	11	1	1	500.00	1	\N	completed	completed	paid	REVALIDAÇÃO ANTT + INCLUSÃO DA PLACA  RJL5J95	\N	8	18	2025-05-06 17:23:15.043576	2025-05-07 17:43:44.323
78	533643	2025-05-02 00:00:00	37	2	11	1	\N	490.00	1	\N	completed	completed	paid	RENOVAÇÃO ANTT PF + INCLUIR CUA0E66	\N	8	18	2025-05-06 17:26:58.700095	2025-05-07 17:58:11.593
79	533645	2025-05-02 00:00:00	38	2	11	1	\N	450.00	1	\N	completed	completed	pending	REVALIDAÇÃO ANTT PJ	\N	8	\N	2025-05-06 17:29:16.988221	2025-05-06 18:15:48.129
66	1236001	2025-05-05 00:00:00	29	1	15	5	\N	0	1	\N	completed	completed	pending	CADASTRO ATIVO (SEGUNAD VIA)	\N	8	\N	2025-05-06 16:51:17.201123	2025-05-06 17:00:10.484
80	533646	2025-05-02 00:00:00	39	2	11	1	1	750.00	1	\N	completed	completed	pending	REVALIDAÇÃO ANTT PJ + INCLUIR MLT3C13	\N	8	\N	2025-05-06 17:31:26.556035	2025-05-06 18:16:35.432
81	642696	2025-05-02 00:00:00	40	2	12	2	\N	2860.00	1	\N	completed	completed	pending	INCLUSÃO DE 13 PLACAS	\N	8	\N	2025-05-06 17:38:19.81633	2025-05-06 18:16:52.139
135	533644	2025-05-02 00:00:00	71	2	11	1	\N	300.00	1	\N	in_progress	in_progress	paid	DEIXARA O VALOR DE CREDITO 	\N	8	18	2025-05-07 14:48:39.321084	2025-05-09 17:46:48.267
127	1236003	2025-05-07 00:00:00	70	2	15	1	1	750.00	1	\N	completed	completed	pending		\N	8	\N	2025-05-07 13:52:02.407483	2025-05-07 14:43:15.186
181	5603672	2025-05-07 00:00:00	104	2	9	4	\N	350.00	1	\N	returned	in_progress	pending	TESTE	PEDIDO EM ABERTO COM CLIENTE	1	\N	2025-05-07 20:30:32.784068	2025-05-13 19:08:48.597
119	642704	2025-05-05 00:00:00	40	2	12	2	\N	200.00	1	\N	completed	completed	pending	a	\N	8	\N	2025-05-06 20:56:07.687272	2025-05-07 11:39:47.785
146	5603660	2025-05-02 00:00:00	80	2	9	5	\N	150.00	1	\N	completed	completed	pending	CURSO RT	\N	7	\N	2025-05-07 18:00:06.472368	2025-05-14 14:34:38.298
123	642707	2025-05-05 00:00:00	66	2	12	1	\N	300.00	1	\N	completed	completed	in_progress	INCLUSÃO DE UMA PLACA	\N	8	18	2025-05-06 20:59:02.151082	2025-05-07 11:42:36.756
118	642702	2025-05-05 00:00:00	64	2	12	2	\N	450.00	1	\N	completed	completed	pending	matriz e filial	\N	8	\N	2025-05-06 20:55:08.068409	2025-05-07 11:42:54.538
116	642700	2025-05-05 00:00:00	63	2	12	1	\N	500.00	1	\N	completed	completed	paid		\N	8	18	2025-05-06 20:52:06.295457	2025-05-07 19:55:37.042
133	5603650	2025-04-30 00:00:00	67	2	9	2	\N	1050.00	1	\N	completed	completed	paid	RENOVAÇÃO DE CADASTRO, EXCLUIR A PLACA cth3i48 E MANTER AS DEMAIS 	\N	8	18	2025-05-07 14:16:13.439591	2025-05-09 17:45:25.521
114	881010295	2025-05-05 00:00:00	61	2	14	5	\N	50.00	1	\N	completed	completed	in_progress	segunda via	\N	8	18	2025-05-06 20:09:42.210859	2025-05-07 11:43:49.284
158	1236009	2025-05-07 00:00:00	89	2	15	5	\N	110.00	1	\N	completed	completed	pending	certificado digital pj	\N	7	\N	2025-05-07 18:20:07.17748	2025-05-13 21:02:59.219
115	881010299	2025-05-05 00:00:00	62	2	14	5	\N	450	1	\N	completed	completed	in_progress	Revalidação finalizada	\N	8	18	2025-05-06 20:13:50.388524	2025-05-07 11:43:35.107
171	5603670	2025-05-05 00:00:00	99	2	9	1	\N	410.00	1	\N	completed	completed	paid	INCLUSÃO DE PLACA 	\N	7	18	2025-05-07 19:43:34.453956	2025-05-13 18:04:52.941
125	0202030	2025-05-07 00:00:00	68	2	13	5	\N	500.00	1	\N	completed	completed	pending	REVALIDAÇÃO!	\N	8	\N	2025-05-07 12:24:35.587125	2025-05-07 12:35:31.324
170	881010298	2025-05-05 00:00:00	62	2	14	5	\N	250.00	1	\N	pending	waiting	pending	REVALIDAÇÃO /SEGUNDA VIA	\N	\N	\N	2025-05-07 19:38:59.369225	2025-05-07 19:39:00.207
139	5603651	2025-05-02 00:00:00	74	3	9	5	\N	1670.00	1	\N	pending	waiting	paid	 Assessoria Administrativa e Judicial das Multas da ANTT em Execução Fiscal 	\N	\N	18	2025-05-07 17:40:38.159378	2025-05-08 11:10:52.775
165	5603665	2025-05-05 00:00:00	95	1	9	2	\N	1310.00	1	\N	pending	waiting	paid	SEGUNDA VIA 	\N	\N	18	2025-05-07 19:31:04.18265	2025-05-07 20:00:42.78
141	5603652	2025-05-02 00:00:00	75	2	9	1	\N	350.00	1	\N	completed	completed	paid		\N	7	18	2025-05-07 17:42:38.206025	2025-05-14 14:38:37.841
142	5603655	2025-05-02 00:00:00	76	2	9	1	\N	500.00	1	\N	completed	completed	pending	INCLUSÃO DE PLACA E EXCLUIR A PLACA BTO0D19	\N	7	\N	2025-05-07 17:45:47.767609	2025-05-14 14:39:43.334
143	5603656	2025-05-02 00:00:00	77	2	9	1	\N	350.00	1	\N	pending	waiting	pending	INCLUSÃO DE PLACA E EXCLUIR A PLACA EUF1E85	\N	\N	\N	2025-05-07 17:48:36.976702	2025-05-07 17:48:37.527
144	5603657	2025-05-02 00:00:00	78	2	9	1	\N	300.0	1	\N	pending	waiting	pending		\N	\N	\N	2025-05-07 17:50:22.965574	2025-05-07 17:50:23.517
145	5603658	2025-05-02 00:00:00	79	3	9	1	\N	480.00	1	\N	pending	waiting	pending	CADASTRO PJ COM 01 PLACA	\N	\N	\N	2025-05-07 17:57:39.74881	2025-05-07 17:57:40.475
149	1236005	2025-05-07 00:00:00	83	2	15	1	\N	690.00	1	\N	pending	waiting	pending		\N	\N	\N	2025-05-07 18:07:30.059623	2025-05-07 18:07:30.651
150	5603663	2025-05-05 00:00:00	84	2	9	1	\N	510.00	1	\N	pending	waiting	pending	CADASTRO PJ COM 01 PLACA	\N	\N	\N	2025-05-07 18:07:53.59305	2025-05-07 18:07:54.403
159	5603664	2025-05-05 00:00:00	90	2	9	1	\N	350.00	1	\N	pending	waiting	pending	INCLUSÃO DE PLACA	\N	\N	\N	2025-05-07 18:20:49.402826	2025-05-07 18:20:50.207
160	5603666	2025-05-05 00:00:00	91	2	9	1	\N	350.00	1	\N	pending	waiting	pending	INCLUSÃO DE PLACA	\N	\N	\N	2025-05-07 18:22:21.703082	2025-05-07 18:22:22.41
152	80266	2025-05-07 00:00:00	85	2	5	5	\N	350.00	1	\N	completed	completed	pending	Revalidação/ Segunda via 	\N	7	\N	2025-05-07 18:11:02.139373	2025-05-07 20:35:27.176
153	1236007	2025-05-07 00:00:00	86	2	15	1	\N	300.00	1	\N	completed	completed	pending		\N	7	\N	2025-05-07 18:11:33.093236	2025-05-07 19:03:14.314
166	5603668	2025-05-05 00:00:00	96	2	9	5	\N	710.00	1	\N	pending	waiting	paid	 Assessoria Administrativa e Judicial das Multas da ANTT em Execução Fiscal 	\N	\N	18	2025-05-07 19:32:40.772704	2025-05-07 20:04:51.547
161	5603667	2025-05-05 00:00:00	92	2	9	1	\N	510.00	1	\N	pending	waiting	pending	INCLUSÃO DE PLACA E EXCLUIR A PLACA JXF-0579	\N	\N	\N	2025-05-07 18:23:52.199977	2025-05-07 18:23:52.877
162	90372	2025-05-07 00:00:00	93	2	16	1	\N	270.00	1	\N	completed	completed	pending	REVALIDAÇÃO	\N	7	\N	2025-05-07 18:48:08.475873	2025-05-14 14:20:22.772
148	1236004	2025-05-07 00:00:00	82	2	15	5	\N	190	1	\N	completed	completed	pending		\N	7	\N	2025-05-07 18:05:30.895208	2025-05-07 19:04:03.842
154	80267	2025-05-07 00:00:00	87	1	5	2	\N	700.00	1	\N	completed	completed	pending	INCLUSÃO TRES PLACAS   TBI0G73// TBI0G74//  TBI0G64  JA POSSUE CERTIFICADO	\N	7	\N	2025-05-07 18:17:13.999135	2025-05-07 19:01:53.792
167	700390	2025-05-07 00:00:00	97	2	10	5	\N	250	1	\N	completed	completed	pending	CANCELAMENTO 	\N	7	\N	2025-05-07 19:36:33.247732	2025-05-14 14:19:46.208
140	700388	2025-05-07 00:00:00	73	2	10	1	1	430	1	\N	completed	completed	pending	REVALIDAÇÃO+ EXCLUSÃO DE PLACA (IEJ-1219/RS)	\N	7	\N	2025-05-07 17:42:01.163137	2025-05-07 19:04:57.402
157	90373	2025-05-07 00:00:00	88	2	16	3	\N	300.00	1	\N	completed	completed	pending	INCLUSÃO DA PLACA (DAU9J65)	\N	7	\N	2025-05-07 18:20:00.786035	2025-05-07 19:15:59.526
169	5603669	2025-05-05 00:00:00	98	2	9	5	\N	410.00	1	\N	pending	waiting	pending	EXCLUIR AS PLACAS  EJX 0079 E DJB 7031	\N	\N	\N	2025-05-07 19:38:40.662392	2025-05-07 19:38:41.3
164	700362	2025-05-05 00:00:00	94	3	10	2	\N	107.5	3	\N	pending	waiting	pending	REVALIDAÇÃO+ EXCLUSÃO DE PLACA (KEL-2453/MT), OBS ENTREGAR O SERVIÇO SÓMENTE APOS TODAS AS PARCELAS PAGAS	\N	\N	\N	2025-05-07 19:17:30.240955	2025-05-07 19:17:30.998
110	533659	2025-05-05 00:00:00	7	2	11	1	\N	500.00	1	\N	returned	waiting	paid	s cnae	EMPRESA NÃO POSSUÍ CNAE	\N	18	2025-05-06 19:48:37.617628	2025-05-07 19:48:26.75
173	5603662	2025-05-02 00:00:00	81	1	9	1	\N	2550.00	1	\N	pending	waiting	paid	INCLUSÃO DE 06 PLACAS 	\N	\N	18	2025-05-07 19:51:19.998408	2025-05-07 20:39:37.888
176	5603654	2025-05-02 00:00:00	101	2	9	5	\N	50.00	1	\N	pending	waiting	paid	SEGUNDA VIA 	\N	\N	18	2025-05-07 19:58:04.123335	2025-05-07 20:46:46.126
174	5603653	2025-05-02 00:00:00	100	3	9	1	\N	950.00	1	\N	pending	waiting	pending	SEM CNAE/CADASTRO PJ COM 01 PLACA 	\N	\N	\N	2025-05-07 19:54:19.878714	2025-05-07 19:54:20.534
134	533647	2025-05-02 00:00:00	24	2	11	5	\N	110.00	1	\N	in_progress	in_progress	paid		\N	8	18	2025-05-07 14:43:05.549652	2025-05-09 17:46:39.665
178	5603659	2025-05-02 00:00:00	102	2	9	5	\N	310.00	1	\N	completed	completed	pending	SEGUNDA VIA/REVALIDAÇÃO 	\N	7	\N	2025-05-07 20:02:36.09695	2025-05-14 14:37:12.15
179	5603661	2025-05-02 00:00:00	95	2	9	2	\N	300.00	1	\N	completed	completed	pending	INCLUSÃO DE 03 PLACAS	\N	7	\N	2025-05-07 20:07:29.919579	2025-05-14 14:35:51.457
180	5603671	2025-05-06 00:00:00	103	2	9	5	\N	200.00	1	\N	pending	waiting	pending	EXCLUIR PLACAS	\N	\N	\N	2025-05-07 20:25:11.555147	2025-05-07 20:25:12.041
183	881010153/1	2025-03-18 00:00:00	106	2	14	5	\N	0	1	\N	in_progress	in_progress	pending	INCLUSÃO DE PLACA POSTERIOR	\N	1	\N	2025-05-07 20:37:47.010175	2025-05-13 19:20:24.698
186	5603675	2025-05-07 00:00:00	109	2	9	1	\N	780.00	1	\N	completed	completed	pending	RENOVAÇÃO DE CADASTRO COM 01 PLACA + EXCLUIR A PLACA  KLQ-0208/MG E INCLUIR A NOVA PLACA QUE ESTÁ NA PASTA 	\N	7	\N	2025-05-07 20:47:47.86888	2025-05-13 19:38:21.875
187	5603676	2025-05-07 00:00:00	110	3	9	1	\N	350.00	1	\N	completed	completed	pending	CADASTRO PF SEM PLACA 	\N	7	\N	2025-05-07 20:51:30.511948	2025-05-14 14:17:48.788
188	5603677	2025-05-07 00:00:00	111	1	9	5	\N	440.00	1	\N	completed	completed	pending	RENOVAÇÃO/SEGUNDA VIA 	\N	7	\N	2025-05-07 20:56:52.796776	2025-05-14 14:17:15.014
189	5603678	2025-05-07 00:00:00	112	1	9	5	\N	540.00	1	\N	completed	completed	pending	SEGUNDA VIA/RENOVAÇÃO	\N	7	\N	2025-05-07 20:59:33.853843	2025-05-14 14:16:44.485
185	1236010	2025-05-07 00:00:00	108	2	15	5	\N	350	1	\N	completed	completed	pending	REVALIDAÇÃO CONCLUIDA / SEGUNDA VIA SÓ	\N	7	\N	2025-05-07 20:44:06.791349	2025-05-13 18:15:47.829
182	5603673	2025-05-07 00:00:00	105	2	9	1	\N	290.00	1	\N	completed	completed	pending		\N	7	\N	2025-05-07 20:35:07.234972	2025-05-13 19:17:17.22
191	5603680	2025-05-07 00:00:00	114	2	9	1	\N	350.00	1	\N	completed	completed	pending	ATUALIZAÇÃO MERCOSUL 	\N	7	\N	2025-05-07 21:07:01.27377	2025-05-13 19:40:41.258
205	881010304	2025-05-07 00:00:00	125	2	14	1	\N	320.00	1	\N	completed	completed	pending	inclusão de uma placa	\N	7	\N	2025-05-08 13:23:53.348342	2025-05-13 19:19:16.148
193	1236011	2025-05-07 00:00:00	115	2	15	1	\N	100.00	1	\N	pending	waiting	pending		\N	\N	\N	2025-05-08 11:23:55.008592	2025-05-08 11:23:55.59
206	533668	2025-05-06 00:00:00	126	2	11	1	\N	400.00	1	\N	pending	waiting	paid		\N	\N	18	2025-05-08 13:51:14.373152	2025-05-08 19:31:27.8
195	533661	2025-05-05 00:00:00	116	2	11	5	\N	70.00	1	\N	pending	waiting	paid	CLIENTE PAGOU O RESTANTE DIA 06/05	\N	\N	18	2025-05-08 12:59:18.404198	2025-05-08 19:37:21.562
196	533662	2025-05-06 00:00:00	117	2	11	1	\N	400.00	1	\N	pending	waiting	paid	FICOU R$100,00 DE CREDITO PQ ELE TINHA PAGO A REVALIDAÇÃO EM OUTRO CADASTRO E NAO DEU PRA FAZER	\N	\N	18	2025-05-08 13:03:35.463193	2025-05-08 19:38:12.874
197	533663	2025-05-06 00:00:00	118	2	11	1	\N	300.00	1	\N	pending	waiting	paid		\N	\N	18	2025-05-08 13:05:30.404624	2025-05-08 19:40:15.763
198	533664	2025-05-06 00:00:00	119	2	11	1	\N	300.00	1	\N	pending	waiting	pending	INCLUIR FEI4H30 + EXCLUIR JZI8J37 E GEV3I70	\N	\N	\N	2025-05-08 13:07:24.852681	2025-05-08 13:07:26.1
199	533665	2025-05-06 00:00:00	120	2	11	1	\N	300.00	1	\N	pending	waiting	pending		\N	\N	\N	2025-05-08 13:08:48.893667	2025-05-08 13:08:49.972
200	533666	2025-05-06 00:00:00	121	2	11	1	\N	300.00	1	\N	pending	waiting	pending		\N	\N	\N	2025-05-08 13:09:59.966748	2025-05-08 13:10:00.826
201	533667	2025-05-06 00:00:00	122	2	11	5	\N	50.00	1	\N	pending	waiting	pending		\N	\N	\N	2025-05-08 13:11:55.867647	2025-05-08 13:11:56.628
202	881010305	2025-05-07 00:00:00	123	1	14	1	\N	550.00	1	\N	pending	waiting	pending	cadastro + inclusão posterior	\N	\N	\N	2025-05-08 13:13:37.523935	2025-05-08 13:13:38.317
203	881010308	2025-05-07 00:00:00	124	1	14	1	\N	550.00	1	\N	pending	waiting	pending	cadastro+ inclusão de placa	\N	\N	\N	2025-05-08 13:17:30.282805	2025-05-08 13:17:31.405
215	533672	2025-05-07 00:00:00	135	2	11	1	\N	350.00	1	\N	pending	waiting	paid		\N	\N	18	2025-05-08 16:37:53.322144	2025-05-08 18:27:39.976
207	533669	2025-05-06 00:00:00	127	2	11	1	\N	350.00	1	\N	pending	waiting	paid		\N	\N	18	2025-05-08 13:52:20.695162	2025-05-08 19:33:05.951
208	533670	2025-05-06 00:00:00	128	2	11	1	\N	300.00	1	\N	pending	waiting	paid		\N	\N	18	2025-05-08 13:53:32.174478	2025-05-08 19:35:04.901
209	1236012	2025-05-08 00:00:00	129	2	15	5	\N	650.00	1	\N	pending	waiting	paid	revalidação concluida / segunda via somente 	\N	\N	18	2025-05-08 14:05:53.525883	2025-05-09 20:48:14.113
210	1236014	2025-05-08 00:00:00	130	2	15	1	\N	500.00	1	\N	pending	waiting	paid	reativação com um a placa  PIE7354 + EXCLUSÃO DA PLACA NIB00391 	\N	\N	18	2025-05-08 14:50:45.829111	2025-05-09 21:11:00.241
211	1236013	2025-05-08 00:00:00	131	3	15	2	\N	50.00	1	\N	pending	waiting	pending	valor é placa somente n final do mes, empresa ja as inclusoes durante o mes e paga de uma vez no ultimo dia 	\N	\N	\N	2025-05-08 16:21:57.4302	2025-05-08 16:21:58.166
212	0202031	2025-05-08 00:00:00	132	1	13	5	\N	400.00	4	\N	pending	waiting	pending	REVALIDAÇÃO E ALTERAÇÃO DE ENDEREÇO: R. Ângelo Del Grossi, 73 - Bairro Boa Vista, Fernandópolis - SP, 15610036	\N	\N	\N	2025-05-08 16:26:38.657054	2025-05-08 16:26:41.411
213	700391	2025-05-08 00:00:00	133	2	10	2	\N	550	1	\N	pending	waiting	pending	REVALIDAÇÃO + EXCLUSÃO DE PLACA ( IOD-9268/RS)+ ALTERAÇÃO DE ENDEREÇO\nRUA ALBERTO ZIMMERMANN,1529 RIO BRANCO\nCEP 93032-370 SAO LEOPOLDO/RS\nE UMA INCLUSÃO DE PLACA (KEB8F92)\n	\N	\N	\N	2025-05-08 16:28:53.731583	2025-05-08 16:28:56.267
214	533671	2025-05-07 00:00:00	134	3	11	1	1	400.00	1	\N	completed	completed	paid		\N	7	18	2025-05-08 16:36:06.426446	2025-05-13 18:23:15.218
216	533673	2025-05-07 00:00:00	136	2	11	1	\N	300.00	1	\N	completed	completed	paid		\N	7	18	2025-05-08 16:39:11.314939	2025-05-13 18:22:36.808
217	533674	2025-05-07 00:00:00	137	1	11	1	\N	680.00	1	\N	pending	waiting	paid		\N	\N	18	2025-05-08 16:40:23.072092	2025-05-08 18:32:25.427
219	533676	2025-05-07 00:00:00	139	2	11	1	\N	320.00	1	\N	completed	completed	paid		\N	7	18	2025-05-08 16:43:34.273969	2025-05-13 18:28:04.115
220	533677	2025-05-07 00:00:00	140	1	11	5	\N	350.00	1	\N	completed	completed	paid	revalidação */ 2 via	\N	7	18	2025-05-08 16:44:56.901817	2025-05-13 19:36:02.116
221	533678	2025-05-07 00:00:00	141	2	11	5	\N	300.00	1	\N	pending	waiting	paid	2 via	\N	\N	18	2025-05-08 16:46:53.094506	2025-05-08 19:27:12.313
222	533679	2025-05-07 00:00:00	142	2	11	1	\N	450.00	1	\N	completed	completed	paid		\N	7	18	2025-05-08 16:48:40.290966	2025-05-13 19:18:18.296
223	533680	2025-05-07 00:00:00	143	2	11	5	\N	250.00	1	\N	pending	waiting	paid		\N	\N	18	2025-05-08 16:49:58.561934	2025-05-08 19:29:55.181
224	533681	2025-05-07 00:00:00	144	2	11	5	\N	300.00	1	\N	pending	waiting	paid	Irá pagar 300 posterior	\N	\N	18	2025-05-08 16:51:45.011914	2025-05-08 18:18:05.157
225	533682	2025-05-07 00:00:00	145	2	11	1	\N	300.00	1	\N	pending	waiting	paid		\N	\N	18	2025-05-08 16:53:24.337847	2025-05-08 18:18:59.977
226	533683	2025-05-07 00:00:00	146	2	11	5	\N	50.00	1	\N	completed	completed	paid		\N	7	18	2025-05-08 16:55:28.649587	2025-05-13 18:47:30.807
227	533684	2025-05-07 00:00:00	147	2	11	1	\N	450.00	1	\N	pending	waiting	paid		\N	\N	18	2025-05-08 16:56:58.810955	2025-05-08 18:21:33.406
283	533699	2025-05-09 00:00:00	191	2	11	1	\N	900.00	1	\N	pending	waiting	pending		\N	\N	\N	2025-05-09 18:00:40.679091	2025-05-09 18:00:41.682
229	533686	2025-05-07 00:00:00	148	1	11	1	\N	450.00	1	\N	pending	waiting	paid		\N	\N	18	2025-05-08 16:59:19.079066	2025-05-08 18:15:19.02
231	642698	2025-05-02 00:00:00	42	2	12	5	\N	520	1	\N	pending	waiting	paid	Segunda via 	\N	\N	18	2025-05-08 17:08:18.695731	2025-05-08 18:12:09.427
232	1236015	2025-05-08 00:00:00	149	2	15	5	\N	160.00	1	\N	pending	waiting	paid	certificado digital pj 	\N	\N	18	2025-05-08 17:19:40.383257	2025-05-09 19:24:19.121
230	533661 / 1	2025-05-06 00:00:00	116	2	11	5	\N	1190	1	\N	pending	waiting	paid	2 via	\N	\N	18	2025-05-08 17:00:51.466346	2025-05-08 18:06:50.87
286	533700	2025-05-09 00:00:00	193	2	11	5	\N	50.00	1	\N	pending	waiting	pending	atualização de propriedade de placa	\N	\N	\N	2025-05-09 18:03:15.898546	2025-05-09 18:03:16.61
184	5603674	2025-05-07 00:00:00	107	2	9	4	\N	350.00	1	\N	in_progress	in_progress	pending	INCLUSÃO DE PLACAS	\N	1	\N	2025-05-07 20:40:54.114573	2025-05-13 19:10:10.371
218	533675	2025-05-07 00:00:00	138	3	11	1	\N	550	1	\N	pending	waiting	paid		\N	\N	18	2025-05-08 16:42:00.81803	2025-05-08 18:35:20.111
233	0202029	2025-05-06 00:00:00	150	2	13	5	\N	400.00	1	\N	pending	waiting	paid	NO AGUARDO DO ENVIO DOS DOCUMENTOS! - ATUALIZAÇÃO DE ENDEREÇO, EXCLUSÃO E INCLUSÃO.	\N	\N	18	2025-05-08 17:44:36.942742	2025-05-08 18:14:00.911
234	1236016	2025-05-08 00:00:00	151	2	15	1	\N	650.00	1	\N	pending	waiting	paid	REATIVAÇÃO COM UMA PLACA  LUB5I53	\N	\N	18	2025-05-08 18:25:10.185474	2025-05-09 19:25:51.573
235	1236017	2025-05-08 00:00:00	152	2	15	1	\N	550.00	1	\N	pending	waiting	paid	reativação com a placa NWU7B01	\N	\N	18	2025-05-08 18:31:33.771509	2025-05-09 19:28:54.97
253	5603689	2025-05-09 00:00:00	168	2	9	3	\N	590.00	1	\N	pending	waiting	pending	INCLUSÃO DE PLACA VIA GOV 	\N	\N	\N	2025-05-09 16:12:21.872236	2025-05-09 16:12:22.701
236	881010303	2025-05-06 00:00:00	153	2	14	1	\N	690.00	1	\N	pending	waiting	paid	CLENTE VAI ENCAMINHAR OS DOCUMENTOS NA SEXTA 09/05/2025	\N	\N	18	2025-05-08 19:38:47.336581	2025-05-08 19:42:53.43
237	5603682	2025-05-08 00:00:00	154	2	9	1	\N	580.00	1	\N	pending	waiting	paid	INCLUSÃO DE PLACA 	\N	\N	18	2025-05-08 20:11:36.354565	2025-05-09 20:41:53.094
238	5603683	2025-05-08 00:00:00	113	2	9	2	\N	780.00	1	\N	completed	completed	paid	INCLUSÃO DE 13 PLACAS 	\N	7	18	2025-05-08 20:17:57.203252	2025-05-13 21:19:08.711
254	5603690	2025-05-09 00:00:00	169	1	9	1	\N	440.00	1	\N	pending	waiting	pending	CADASTRO PJ COM 01 PLACA	\N	\N	\N	2025-05-09 16:16:53.143562	2025-05-09 16:16:53.908
245	5603688	2025-05-08 00:00:00	161	2	9	1	\N	440.00	1	\N	pending	waiting	pending	CADASTRO PF COM 01 PLACA	\N	\N	\N	2025-05-09 11:26:57.654194	2025-05-09 11:26:58.718
241	5603684	2025-05-08 00:00:00	157	2	9	1	\N	340.00	1	\N	pending	waiting	paid	RENOVAÇÃO DE CADASTRO SEM PLACA 	\N	\N	18	2025-05-08 20:31:10.514012	2025-05-09 18:50:50.811
265	700389	2025-05-07 00:00:00	176	2	10	5	\N	700	1	\N	in_progress	in_progress	paid	INCLUSÃO DE PLACA (BYE3667) OBS CLIENTE NÃO ENCAMINHOU A DOCUMENTAÇÃO AINDA.	\N	7	18	2025-05-09 17:32:39.990968	2025-05-13 18:24:14.764
243	5603685	2025-05-08 00:00:00	159	2	9	1	\N	440.00	1	\N	pending	waiting	paid	CADASTRO PJ COM 01 PLACA	\N	\N	18	2025-05-08 20:34:55.760938	2025-05-09 19:00:39.335
239	1001563	2025-05-07 00:00:00	156	2	7	2	\N	800.00	1	\N	pending	waiting	paid	SERVIÇO ENTREGUE	\N	\N	18	2025-05-08 20:25:35.294744	2025-05-09 11:16:29.887
246	642703	2025-05-05 00:00:00	162	2	12	1	\N	350.00	1	\N	pending	waiting	paid		\N	\N	18	2025-05-09 12:15:02.171206	2025-05-09 19:03:35.188
270	642670	2025-05-05 00:00:00	180	2	12	1	\N	80.00	1	\N	pending	waiting	paid	diferença para fazer por sindicato 	\N	\N	18	2025-05-09 17:37:55.473665	2025-05-09 18:42:45.325
248	90374	2025-05-09 00:00:00	163	3	16	5	\N	250.00	1	\N	pending	waiting	pending	\nALTERAÇÃO CADASTRAL: EUDECIA FERREIRA MACHADO MENESES 305 CS B/RESIDENCIAL CAMPESTRE/SETE LAGOAS-MG/CEP:357.035-13	\N	\N	\N	2025-05-09 13:40:59.080913	2025-05-09 13:40:59.765
274	90375	2025-05-09 00:00:00	184	1	16	2	\N	450.00	1	\N	pending	waiting	pending	REVALIDAÇÃO + EXCLUSÃO DAS PLACAS (BWD3474) + (BWG 4872)	\N	\N	\N	2025-05-09 17:51:11.179717	2025-05-09 17:51:12.192
260	642710	2025-05-08 00:00:00	164	3	12	2	\N	110.00	1	\N	pending	waiting	paid		\N	\N	18	2025-05-09 17:15:43.773129	2025-05-09 17:42:28.761
251	642709	2025-05-06 00:00:00	166	2	12	1	\N	600.00	1	\N	pending	waiting	paid	CADASTRO PJ COM UMA PLACA	\N	\N	18	2025-05-09 14:11:57.709376	2025-05-09 18:46:11.577
255	5603691	2025-05-09 00:00:00	170	2	9	1	\N	440.00	1	\N	pending	waiting	pending	INCLUSÃO DE PLACA	\N	\N	\N	2025-05-09 16:26:15.212967	2025-05-09 16:26:16.408
256	5603692	2025-05-09 00:00:00	171	2	9	5	\N	400.00	1	\N	pending	waiting	pending	SEGUNDA VIA/RENOVAÇÃO 	\N	\N	\N	2025-05-09 16:45:59.964606	2025-05-09 16:46:00.783
257	0202033	2025-05-09 00:00:00	172	2	13	5	\N	300.00	1	\N	pending	waiting	pending	REVALIDAÇÃO DUAS PLACAS	\N	\N	\N	2025-05-09 16:47:16.437543	2025-05-09 16:47:17.3
258	0202034	2025-05-09 00:00:00	173	2	13	5	\N	300.00	1	\N	pending	waiting	pending	REVALIDAÇÃO PJ\nPAGAMENTO ESTA JUNTO COM A ORDEM 0202033	\N	\N	\N	2025-05-09 16:49:36.369817	2025-05-09 16:49:37.302
259	5603693	2025-05-09 00:00:00	174	2	9	5	\N	450.00	1	\N	pending	waiting	pending	Segunda via/renovação 	\N	\N	\N	2025-05-09 16:52:03.087152	2025-05-09 16:52:03.998
275	533693	2025-05-08 00:00:00	183	2	11	5	\N	400.00	1	\N	pending	waiting	paid		\N	\N	18	2025-05-09 17:51:16.567596	2025-05-09 17:57:58
263	642706	2025-05-05 00:00:00	175	2	12	1	\N	350.00	1	\N	pending	waiting	paid	INCLUSÃO DE UMA PLACA pago com a ordem 642703	\N	\N	18	2025-05-09 17:24:39.403853	2025-05-09 17:52:11.598
240	5603681	2025-05-08 00:00:00	155	2	9	2	\N	600	1	\N	pending	waiting	paid	CADASTRO PJ COM 06 PLACAS	\N	\N	18	2025-05-08 20:25:42.573589	2025-05-09 18:47:25.086
264	533685	2025-05-07 00:00:00	47	2	11	1	\N	300.00	1	\N	completed	completed	paid		\N	7	18	2025-05-09 17:32:22.576542	2025-05-13 18:16:41.196
244	5603686	2025-05-08 00:00:00	160	1	9	1	\N	440.00	1	\N	pending	waiting	paid	CADASTRO PF COM 01 INCLSÃO POSTERIOR 	\N	\N	18	2025-05-08 20:41:07.684157	2025-05-09 17:32:33.8
266	533687	2025-05-08 00:00:00	177	2	11	1	\N	310.00	1	\N	pending	waiting	paid		\N	\N	18	2025-05-09 17:34:29.973533	2025-05-09 18:25:58.195
267	533688	2025-05-08 00:00:00	178	2	11	1	\N	320.00	1	\N	pending	waiting	paid		\N	\N	18	2025-05-09 17:35:12.796503	2025-05-09 18:44:48.462
247	642705	2025-05-05 00:00:00	65	2	12	3	\N	300.00	1	\N	pending	waiting	paid		\N	\N	18	2025-05-09 12:19:23.239876	2025-05-09 17:35:49.016
268	533689	2025-05-08 00:00:00	179	2	11	3	\N	200.00	1	\N	pending	waiting	paid	S17e18r$	\N	\N	18	2025-05-09 17:36:12.111693	2025-05-09 17:53:58.108
271	533691	2025-05-08 00:00:00	32	2	11	2	\N	200.00	1	\N	pending	waiting	paid		\N	\N	18	2025-05-09 17:38:51.140481	2025-05-09 17:56:04.829
249	642701	2025-05-06 00:00:00	164	3	12	2	\N	110.00	1	\N	pending	waiting	paid		\N	\N	18	2025-05-09 14:07:56.135613	2025-05-09 17:37:23.267
269	533690	2025-05-08 00:00:00	181	3	11	1	\N	390.00	1	\N	pending	waiting	paid		\N	\N	18	2025-05-09 17:37:41.229461	2025-05-09 18:43:26.33
250	642708	2025-05-06 00:00:00	165	2	12	3	\N	390.00	1	\N	pending	waiting	paid		\N	\N	18	2025-05-09 14:09:45.726255	2025-05-09 17:39:01.471
261	1235998	2025-05-05 00:00:00	27	3	15	5	\N	3835.00	1	\N	pending	waiting	paid	revalidação concluida 	\N	\N	18	2025-05-09 17:22:14.43456	2025-05-09 17:43:24.102
272	533692	2025-05-08 00:00:00	182	2	11	5	\N	250.00	1	\N	pending	waiting	paid	2 via 	\N	\N	18	2025-05-09 17:40:20.753499	2025-05-09 17:56:57.773
252	1236008	2025-05-07 00:00:00	167	2	15	1	\N	350.00	1	\N	pending	waiting	paid	placa particular 	\N	\N	18	2025-05-09 14:21:04.649949	2025-05-09 17:40:33.393
273	1236019	2025-05-09 00:00:00	185	2	15	1	\N	350.00	1	\N	pending	waiting	pending		\N	\N	\N	2025-05-09 17:50:16.840365	2025-05-09 17:50:17.516
276	881010296	2025-05-05 00:00:00	69	2	14	1	\N	1650.00	1	\N	pending	waiting	paid	inclusão de tres placas + AET MT	\N	\N	18	2025-05-09 17:51:47.336	2025-05-09 17:59:01.85
277	533694	2025-05-08 00:00:00	186	2	11	1	\N	650.00	1	\N	pending	waiting	paid		\N	\N	18	2025-05-09 17:52:25.950742	2025-05-09 19:12:52.606
262	1236000	2025-05-05 00:00:00	28	3	15	5	\N	0.00	1	\N	pending	waiting	in_progress	revalidação concluida 	\N	\N	18	2025-05-09 17:24:26.699823	2025-05-09 18:19:41.121
281	533697	2025-05-08 00:00:00	189	2	11	2	\N	750.00	1	\N	pending	waiting	paid		\N	\N	18	2025-05-09 17:55:43.243534	2025-05-09 18:12:53.44
282	533698	2025-05-09 00:00:00	190	2	11	1	\N	450.00	1	\N	pending	waiting	pending	CADASTRO ANTT PF + 01 INCLUSÃO POSTERIOR	\N	\N	\N	2025-05-09 17:57:02.236375	2025-05-09 17:57:03.077
284	533695	2025-05-08 00:00:00	187	1	11	2	\N	1200.00	1	\N	pending	waiting	paid		\N	\N	18	2025-05-09 18:01:52.187193	2025-05-09 18:14:07.042
242	0202032	2025-05-08 00:00:00	158	1	13	5	\N	300.00	4	\N	pending	waiting	paid	REVALIDAÇÃO	\N	\N	18	2025-05-08 20:31:48.760749	2025-05-09 18:56:49.433
287	533701	2025-05-09 00:00:00	194	1	11	1	\N	600.00	1	\N	pending	waiting	pending		\N	\N	\N	2025-05-09 18:04:00.795676	2025-05-09 18:04:01.935
288	533702	2025-05-09 00:00:00	195	2	11	1	\N	350.00	1	\N	pending	waiting	pending		\N	\N	\N	2025-05-09 18:05:07.215136	2025-05-09 18:05:08.281
279	533696	2025-05-08 00:00:00	188	2	11	5	\N	550.00	1	\N	pending	waiting	paid		\N	\N	18	2025-05-09 17:54:26.98071	2025-05-09 18:10:19.687
289	1001564	2025-05-09 00:00:00	196	2	7	3	\N	450.00	1	\N	pending	waiting	pending		\N	\N	\N	2025-05-09 18:40:15.577308	2025-05-09 18:40:16.748
291	1236018	2025-05-09 00:00:00	197	3	15	4	\N	450.00	1	\N	pending	waiting	pending	gustavo habilitado	\N	\N	\N	2025-05-09 18:45:54.957482	2025-05-09 18:45:55.723
333	5603700	2025-05-12 00:00:00	238	2	9	5	\N	50.00	1	\N	pending	waiting	pending		\N	\N	\N	2025-05-13 20:29:07.761848	2025-05-13 20:29:08.645
293	642712	2025-05-09 00:00:00	199	1	12	1	\N	350.00	1	\N	pending	waiting	paid		\N	\N	18	2025-05-09 20:24:47.679986	2025-05-13 20:49:18.758
294	642713	2025-05-09 00:00:00	200	3	12	1	\N	350.00	1	\N	pending	waiting	paid		\N	\N	18	2025-05-09 20:26:12.653229	2025-05-13 20:51:17.565
295	5603694	2025-05-09 00:00:00	201	2	9	1	\N	290.00	1	\N	pending	waiting	pending	inclusão de placa	\N	\N	\N	2025-05-09 20:26:30.439762	2025-05-09 20:26:31.556
296	642714	2025-05-09 00:00:00	202	2	12	1	\N	400.00	1	\N	pending	waiting	pending		\N	\N	\N	2025-05-09 20:28:33.919033	2025-05-09 20:28:34.809
297	5603695	2025-05-09 00:00:00	203	2	9	4	\N	840.00	1	\N	pending	waiting	pending	RENOVAÇÃO DE CADASTRO PJ COM 04 PLACAS 	\N	\N	\N	2025-05-09 20:33:21.752339	2025-05-09 20:33:22.348
298	5603696	2025-05-09 00:00:00	204	1	9	5	\N	540.00	1	\N	pending	waiting	pending	SEGUNDA VIA/RENOVAÇÃO 	\N	\N	\N	2025-05-09 20:38:09.541493	2025-05-09 20:38:10.977
304	533703	2025-05-09 00:00:00	209	2	11	1	\N	798.00	1	\N	pending	waiting	paid		\N	\N	18	2025-05-13 13:44:50.735287	2025-05-13 20:13:55.425
311	533708	2025-05-12 00:00:00	216	1	11	1	\N	500.00	1	\N	pending	waiting	paid		\N	\N	18	2025-05-13 13:52:12.02699	2025-05-13 20:00:47.877
301	0202035	2025-05-09 00:00:00	207	2	13	5	\N	300.00	1	\N	pending	waiting	paid	REVALIDAÇÃO	\N	\N	18	2025-05-09 20:55:38.462602	2025-05-13 20:09:45.53
314	533711	2025-05-12 00:00:00	219	2	11	1	\N	300.00	1	\N	pending	waiting	paid		\N	\N	18	2025-05-13 13:56:18.077742	2025-05-13 20:05:22.302
312	533709	2025-05-12 00:00:00	217	2	11	1	\N	950.00	1	\N	pending	waiting	paid	REVALIDAÇÃO ANTT PF (04 PLACAS) 	\N	\N	18	2025-05-13 13:53:36.140575	2025-05-13 20:02:50.982
300	881010302	2025-05-06 00:00:00	206	1	14	1	\N	770.00	1	\N	pending	waiting	paid	Inclusão de uma placa+ revalidação ja feita	\N	\N	18	2025-05-09 20:53:19.773508	2025-05-09 21:05:12.826
332	5603699	2025-05-12 00:00:00	236	2	9	5	\N	560.00	1	\N	pending	waiting	pending		\N	\N	\N	2025-05-13 20:25:12.592226	2025-05-13 20:25:13.443
305	533704	2025-05-09 00:00:00	210	3	11	2	\N	2000	1	\N	pending	waiting	paid		\N	\N	18	2025-05-13 13:47:09.755817	2025-05-13 20:15:29.224
308	533706	2025-05-12 00:00:00	213	2	11	3	\N	400.00	1	\N	pending	waiting	paid	Actros2651JB@	\N	\N	18	2025-05-13 13:49:29.858331	2025-05-13 20:19:06.271
307	700393	2025-05-13 00:00:00	212	2	10	5	\N	250	1	\N	pending	waiting	pending	2 VIA 	\N	\N	\N	2025-05-13 13:48:56.286643	2025-05-13 13:48:57.014
317	0202037	2025-05-12 00:00:00	222	2	13	5	\N	250.00	1	\N	pending	waiting	paid	REVALIDAÇÃO!	\N	\N	18	2025-05-13 14:10:13.167356	2025-05-13 20:07:44.331
303	90376	2025-05-09 00:00:00	208	2	16	5	\N	300.00	1	\N	pending	waiting	paid	2 VIA	\N	\N	18	2025-05-13 12:37:07.66147	2025-05-13 20:10:30.483
306	533705	2025-05-12 00:00:00	211	2	11	5	\N	50.00	1	\N	pending	waiting	paid		\N	\N	18	2025-05-13 13:48:15.348331	2025-05-13 20:18:32.15
299	5603697	2025-05-09 00:00:00	205	1	9	1	\N	900.00	1	\N	pending	waiting	paid	INCLUSÃO DE 03 PLACAS PJ	\N	\N	18	2025-05-09 20:42:49.149374	2025-05-13 20:11:25.905
319	0202039	2025-05-13 00:00:00	224	2	13	5	\N	300.00	1	\N	pending	waiting	pending	REVALIDAÇÃO!	\N	\N	\N	2025-05-13 14:13:11.033997	2025-05-13 14:13:11.952
331	5603698	2025-05-12 00:00:00	235	2	9	1	\N	300.00	1	\N	pending	waiting	pending		\N	\N	\N	2025-05-13 20:23:59.582732	2025-05-13 20:24:02.843
320	90377	2025-05-13 00:00:00	225	2	16	1	\N	300.00	1	\N	pending	waiting	pending	EXCLUSÃO DA PLACA (ABF 3273) + INCLUSÃO DA PLACA (ARM 0F41)	\N	\N	\N	2025-05-13 17:13:56.65383	2025-05-13 17:13:57.532
321	5603706	2025-05-13 00:00:00	226	2	9	1	\N	300.00	1	\N	pending	waiting	pending	CADASTRO PF SEM PLACA 	\N	\N	\N	2025-05-13 18:13:46.419834	2025-05-13 18:13:47.018
322	5603707	2025-05-13 00:00:00	227	2	9	3	\N	600.00	1	\N	completed	completed	pending	INCLUSÃO DE 02 PLACAS 	\N	7	\N	2025-05-13 18:19:50.794958	2025-05-14 14:32:46.544
323	5603708	2025-05-13 00:00:00	228	2	9	5	\N	250.00	1	\N	pending	waiting	pending		\N	\N	\N	2025-05-13 18:26:30.96939	2025-05-13 18:26:31.641
324	5603709	2025-05-13 00:00:00	113	2	9	2	\N	60.00	1	\N	pending	waiting	pending		\N	\N	\N	2025-05-13 18:30:46.996669	2025-05-13 18:30:48.468
190	5603679	2025-05-07 00:00:00	113	2	9	5	\N	1050.00	1	\N	completed	completed	pending	Segunda via /renovação 	\N	7	\N	2025-05-07 21:03:17.362028	2025-05-13 19:15:49.892
315	533712	2025-05-12 00:00:00	220	2	11	1	\N	350.00	1	\N	pending	waiting	paid		\N	\N	18	2025-05-13 13:57:10.903173	2025-05-13 18:36:30.543
325	5603710	2025-05-13 00:00:00	229	1	9	1	\N	300.00	1	\N	pending	waiting	pending	INCLUSÃO DE PLACA	\N	\N	\N	2025-05-13 18:44:32.378621	2025-05-13 18:44:33.748
309	533707	2025-05-12 00:00:00	214	2	11	1	\N	350.00	1	\N	pending	waiting	paid		\N	\N	18	2025-05-13 13:50:38.594857	2025-05-13 19:56:44.426
327	5603711	2025-05-13 00:00:00	231	2	9	1	\N	400.00	1	\N	completed	completed	pending		\N	7	\N	2025-05-13 18:57:24.318496	2025-05-14 14:30:31.552
316	0202036	2025-05-12 00:00:00	221	2	13	5	\N	300.00	1	\N	pending	waiting	paid	REVALIDAÇÃO	\N	\N	18	2025-05-13 14:07:02.002171	2025-05-13 19:07:21.817
318	0202038	2025-05-12 00:00:00	223	2	13	5	\N	250	1	\N	pending	waiting	paid	REVALIDAÇÃO!	\N	\N	18	2025-05-13 14:12:07.814739	2025-05-13 20:08:51.583
329	881010313	2025-05-09 00:00:00	233	2	14	1	\N	690.00	1	\N	in_progress	in_progress	pending		\N	7	\N	2025-05-13 19:57:41.44834	2025-05-14 14:26:36.607
313	533710	2025-05-12 00:00:00	218	2	11	1	\N	300.00	1	\N	pending	waiting	paid		\N	\N	18	2025-05-13 13:55:37.610653	2025-05-13 20:04:19.386
310	700392	2025-05-09 00:00:00	215	3	10	5	\N	250	1	\N	pending	waiting	paid		\N	\N	18	2025-05-13 13:52:00.540916	2025-05-13 19:58:25.044
330	881010315	2025-05-13 00:00:00	234	2	14	1	\N	50.00	1	\N	pending	waiting	pending	segunda via	\N	\N	\N	2025-05-13 20:18:52.367358	2025-05-13 20:18:53.503
292	642711	2025-05-09 00:00:00	198	2	12	2	\N	850.00	1	\N	pending	waiting	paid		\N	\N	18	2025-05-09 20:23:33.790434	2025-05-13 20:27:32.635
334	5603701	2025-05-12 00:00:00	239	2	9	1	\N	300.00	1	\N	pending	waiting	pending		\N	\N	\N	2025-05-13 20:30:55.596693	2025-05-13 20:30:57.602
335	881010316	2025-05-09 00:00:00	240	2	14	5	\N	350.00	1	\N	pending	waiting	paid	revalidação/segunda via	\N	\N	18	2025-05-13 20:31:05.159296	2025-05-14 11:34:59.498
336	5603702	2025-05-12 00:00:00	241	2	9	1	\N	310.00	1	\N	pending	waiting	paid		\N	\N	18	2025-05-13 20:32:18.314253	2025-05-14 11:37:51.03
337	5603703	2025-05-12 00:00:00	242	2	9	1	\N	150.00	1	\N	pending	waiting	paid		\N	\N	18	2025-05-13 20:33:32.981023	2025-05-14 11:39:33.594
338	5603704	2025-05-12 00:00:00	243	1	9	1	\N	400.00	1	\N	pending	waiting	paid		\N	\N	18	2025-05-13 20:35:18.597656	2025-05-14 11:40:30.73
339	881010317	2025-05-09 00:00:00	244	2	14	5	\N	50.00	1	\N	pending	waiting	pending	segunda via	\N	\N	\N	2025-05-13 20:35:53.568912	2025-05-13 20:35:54.613
340	5603705	2025-05-12 00:00:00	246	2	9	1	\N	300.00	1	\N	pending	waiting	pending		\N	\N	\N	2025-05-13 20:37:47.837848	2025-05-13 20:37:48.602
302	881010306	2025-05-06 00:00:00	192	2	14	5	\N	350	1	\N	pending	waiting	paid	Segunda via extrato/revalidação	\N	\N	18	2025-05-09 20:57:27.217466	2025-05-09 21:07:37.222
342	881010319	2025-05-09 00:00:00	247	2	14	1	\N	480.00	1	\N	pending	waiting	pending	inclusão de uma placa	\N	\N	\N	2025-05-13 20:40:05.014348	2025-05-13 20:40:06.013
372	1236026	2025-05-14 00:00:00	271	2	15	1	\N	800.00	1	\N	pending	waiting	pending	"INCLUSÃO DE DUAS PLACAS QJQ6A53\nSXM0G84 \n+ EXCLUSÃO DE DUAS PLACAS QII9F73\nQIU8B78"	\N	\N	\N	2025-05-14 14:57:22.433544	2025-05-14 14:57:24.353
345	881010320	2025-05-09 00:00:00	192	2	14	5	\N	980.00	1	\N	pending	waiting	pending	segunda via/revalidação	\N	\N	\N	2025-05-14 11:36:43.592559	2025-05-14 11:36:44.357
346	881010321	2025-05-09 00:00:00	250	1	14	1	\N	550.00	1	\N	pending	waiting	pending	CADASTRO+ INCLUSÃO DE UMA PLACA	\N	\N	\N	2025-05-14 11:40:11.264839	2025-05-14 11:40:12.304
347	881010322	2025-05-09 00:00:00	251	2	14	5	\N	50.00	1	\N	pending	waiting	paid	SEGUNDA VIA	\N	\N	18	2025-05-14 11:41:51.733099	2025-05-14 20:53:50.691
348	881010323	2025-05-12 00:00:00	252	2	14	1	\N	350.00	1	\N	pending	waiting	paid	INCLUSÃO DE PLACA/placa ainda não pertence a categoria aluguel	\N	\N	18	2025-05-14 11:44:09.316824	2025-05-14 20:44:11.982
349	1236025	2025-05-12 00:00:00	253	2	15	1	\N	650	1	\N	pending	waiting	paid		\N	\N	18	2025-05-14 11:44:58.725464	2025-05-14 20:42:41.693
365	1236021	2025-05-12 00:00:00	266	3	15	1	\N	400.00	1	\N	pending	waiting	paid		\N	\N	18	2025-05-14 13:47:37.130168	2025-05-14 20:21:40.58
351	881010324	2025-05-12 00:00:00	255	2	14	1	\N	350.00	1	\N	pending	waiting	paid	INCLUSÃO DE UMA PLACA	\N	\N	18	2025-05-14 11:49:00.013685	2025-05-14 20:39:39.988
373	90379	2025-05-14 00:00:00	272	1	16	5	\N	100.00	1	\N	pending	waiting	pending	2VIA	\N	\N	\N	2025-05-14 14:58:56.199151	2025-05-14 14:58:58.92
355	1001567	2025-05-13 00:00:00	259	2	7	2	\N	950.00	1	\N	pending	waiting	paid	REVALIDAÇÃO DE CADASTRO COM 3 PLACAS	\N	\N	18	2025-05-14 12:02:12.308674	2025-05-14 20:30:06.32
357	1236006	2025-05-07 00:00:00	260	2	15	5	\N	260.00	1	\N	pending	waiting	pending		\N	\N	\N	2025-05-14 12:20:55.512726	2025-05-14 12:20:56.15
341	881010318	2025-05-09 00:00:00	245	2	14	5	\N	490	1	\N	pending	waiting	pending	Segunda via /revalidação	\N	\N	\N	2025-05-13 20:38:01.51227	2025-05-13 20:38:02.517
350	881010325	2025-05-12 00:00:00	254	2	14	1	\N	490.00	1	\N	pending	waiting	paid	CADASTRO+ INCLUSÃO DE UMA PLACA	\N	\N	18	2025-05-14 11:46:42.826223	2025-05-14 20:40:47.888
358	0202040	2025-05-13 00:00:00	232	1	13	5	\N	280.00	1	\N	pending	waiting	paid	CANCELAMENTO. JÁ ENCAMINHADO AO CLIENTE O REQUERIMENTO!	\N	\N	18	2025-05-14 12:29:03.152276	2025-05-14 20:23:17.156
392	533713	2025-05-13 00:00:00	286	2	11	1	\N	500.00	1	\N	pending	waiting	paid		\N	\N	18	2025-05-14 18:09:48.49637	2025-05-14 18:21:21.665
374	1236029	2025-05-14 00:00:00	273	2	15	5	\N	59.00	1	\N	pending	waiting	pending		\N	\N	\N	2025-05-14 15:38:56.277701	2025-05-14 15:38:57.059
363	1236020	2025-05-12 00:00:00	264	2	15	3	\N	300.00	1	\N	pending	waiting	paid		\N	\N	18	2025-05-14 13:44:35.510405	2025-05-14 18:32:01.369
364	1236023	2025-05-12 00:00:00	265	2	15	5	\N	59.00	1	\N	pending	waiting	paid		\N	\N	18	2025-05-14 13:45:46.259507	2025-05-14 19:16:09.574
366	1236024	2025-05-12 00:00:00	267	2	15	1	\N	750.00	1	\N	pending	waiting	paid		\N	\N	18	2025-05-14 13:49:30.767513	2025-05-14 20:28:30.876
375	1236028	2025-05-14 00:00:00	274	2	15	1	\N	650.00	1	\N	pending	waiting	pending		\N	\N	\N	2025-05-14 15:44:05.303868	2025-05-14 15:44:06.336
361	642720	2025-05-12 00:00:00	262	3	12	1	3	650	1	\N	completed	completed	paid	CADASTRO PF , 1 INCLUSÃO POSTERIOR 	\N	7	18	2025-05-14 12:45:57.433936	2025-05-14 19:17:33.122
376	1236027	2025-05-14 00:00:00	275	2	15	1	\N	650.00	1	\N	pending	waiting	pending		\N	\N	\N	2025-05-14 15:49:44.283486	2025-05-14 15:49:45.726
352	881010327	2025-05-13 00:00:00	256	2	14	2	\N	300.00	1	\N	completed	completed	paid	INCLUSÃO DE UMA PLACA	\N	7	18	2025-05-14 11:52:30.617017	2025-05-14 20:37:23.573
343	5603713	2025-05-13 00:00:00	248	2	9	5	\N	1000.00	1	\N	completed	completed	pending	VINCULAÇÃO MATRIZ E FILIAL 	\N	7	\N	2025-05-13 20:53:40.339253	2025-05-14 14:28:46.102
377	5603714	2025-05-14 00:00:00	276	2	9	5	\N	250.00	1	\N	pending	waiting	pending	CURSO RT 	\N	\N	\N	2025-05-14 16:28:12.796001	2025-05-14 16:28:13.774
344	0202041	2025-05-13 00:00:00	249	1	13	5	\N	500.00	4	\N	completed	completed	pending	REVALIDAÇÃO	\N	7	\N	2025-05-13 21:00:34.492774	2025-05-14 14:31:13.738
353	881010328	2025-05-13 00:00:00	257	2	14	5	\N	50.00	1	\N	completed	completed	paid	SEGUNDA VIA	\N	7	18	2025-05-14 11:54:14.627279	2025-05-14 20:35:31.592
371	700394	2025-05-14 00:00:00	270	3	10	5	\N	280	1	\N	pending	waiting	pending	2 VIA 	\N	\N	\N	2025-05-14 14:39:15.473227	2025-05-14 14:39:16.087
378	5603715	2025-05-14 00:00:00	277	2	9	1	\N	700.00	1	\N	pending	waiting	pending		\N	\N	\N	2025-05-14 16:37:47.114478	2025-05-14 16:37:48.347
379	642719	2025-05-12 00:00:00	278	2	12	1	\N	350	1	\N	pending	waiting	paid	inclusão de uma placa	\N	\N	18	2025-05-14 16:45:05.419538	2025-05-14 18:05:06.202
380	5603716	2025-05-14 00:00:00	280	2	9	5	\N	300.00	1	\N	pending	waiting	pending		\N	\N	\N	2025-05-14 16:48:42.815918	2025-05-14 16:48:43.688
362	642723	2025-05-12 00:00:00	263	3	12	1	1	550	1	\N	completed	completed	paid	REATIVAÇÃO  COM UMA PLACA	\N	7	18	2025-05-14 12:56:54.010751	2025-05-14 18:29:58.352
367	642718	2025-05-12 00:00:00	268	2	12	1	\N	450	1	\N	pending	waiting	paid	1 INCLUSÃO 1 EXCLUSÃO 	\N	\N	18	2025-05-14 14:31:53.90758	2025-05-14 20:32:31.569
382	881010297	2025-05-06 00:00:00	281	2	14	5	\N	250.00	1	\N	pending	waiting	paid	REVALIDAÇÃO/SEGUNDA VIA	\N	\N	18	2025-05-14 17:26:42.932265	2025-05-14 18:08:32.98
391	1236022	2025-05-12 00:00:00	285	1	15	2	\N	3500.00	1	\N	pending	waiting	paid	AGUARDANDO HABILITAÇÃO DO CERTIFICADO 	\N	\N	18	2025-05-14 18:06:31.306625	2025-05-14 18:11:19.437
388	1236031	2025-05-14 00:00:00	283	2	15	1	\N	350.00	1	\N	pending	waiting	pending		\N	\N	\N	2025-05-14 17:54:25.410504	2025-05-14 17:54:26.52
394	533715	2025-05-13 00:00:00	288	2	11	1	\N	500.00	1	\N	pending	waiting	paid		\N	\N	18	2025-05-14 18:14:15.704128	2025-05-14 18:23:39.254
390	5603718	2025-05-14 00:00:00	284	2	9	1	\N	610.00	1	\N	pending	waiting	pending		\N	\N	\N	2025-05-14 18:01:07.763208	2025-05-14 18:01:08.816
383	642722	2025-05-12 00:00:00	282	2	12	2	\N	700	1	\N	pending	waiting	paid	INCLUIR SVS9H37, SSY1G47  EXCLUIR  FPH7D97,EGX7H65	\N	\N	18	2025-05-14 17:47:32.976604	2025-05-14 18:09:47.137
381	642721	2025-05-12 00:00:00	279	2	12	3	\N	400	1	\N	pending	waiting	paid	inclusão da placa QQS8B95 - exclusão da placa IZU4D92	\N	\N	18	2025-05-14 16:49:28.073331	2025-05-14 18:07:23.488
393	533714	2025-05-13 00:00:00	287	2	11	5	\N	50.00	1	\N	pending	waiting	paid		\N	\N	18	2025-05-14 18:12:47.538783	2025-05-14 18:22:59.238
395	533716	2025-05-13 00:00:00	289	2	11	3	\N	450.00	1	\N	pending	waiting	paid	Jomara123#	\N	\N	18	2025-05-14 18:15:58.875112	2025-05-14 18:27:55.586
396	533717	2025-05-14 00:00:00	290	2	11	5	\N	250.00	1	\N	pending	waiting	pending	revalidação concluida	\N	\N	\N	2025-05-14 18:17:22.194366	2025-05-14 18:17:23.226
397	533718	2025-05-14 00:00:00	291	2	11	5	\N	50.00	1	\N	pending	waiting	pending		\N	\N	\N	2025-05-14 18:18:05.216141	2025-05-14 18:18:07.433
398	5603719	2025-05-14 00:00:00	292	2	9	1	\N	550.00	1	\N	pending	waiting	pending		\N	\N	\N	2025-05-14 18:18:51.077615	2025-05-14 18:18:52.301
399	642717	2025-05-09 00:00:00	293	2	12	1	\N	350.00	1	\N	pending	waiting	paid	INCLUSÃO DE UMA PLACA	\N	\N	18	2025-05-14 18:27:57.767964	2025-05-14 19:14:26.75
400	5603717	2025-05-14 00:00:00	294	2	9	2	\N	1050.00	1	\N	pending	waiting	pending		\N	\N	\N	2025-05-14 18:31:03.301256	2025-05-14 18:31:03.994
401	5603720	2025-05-14 00:00:00	295	2	9	1	\N	400.00	1	\N	pending	waiting	pending		\N	\N	\N	2025-05-14 19:11:31.959949	2025-05-14 19:11:34.118
354	881010329	2025-05-13 00:00:00	258	2	14	1	\N	0	1	\N	pending	waiting	paid	CADASTRO+ INCLUSÃO DE PLACA	\N	\N	18	2025-05-14 11:56:40.023608	2025-05-14 20:33:52.372
359	881010309	2025-05-08 00:00:00	261	2	14	2	\N	950	1	\N	pending	waiting	paid	cliente ainda não encaminhou arquivo do certificado digita	\N	\N	18	2025-05-14 12:34:01.812044	2025-05-14 20:16:05.029
402	5603721	2025-05-14 00:00:00	113	2	9	4	\N	240.00	1	\N	pending	waiting	pending		\N	\N	\N	2025-05-14 20:18:18.277296	2025-05-14 20:18:19.796
404	0202042	2025-05-14 00:00:00	297	2	13	5	\N	300.00	1	\N	pending	waiting	pending	REVALIDAÇÃO	\N	\N	\N	2025-05-14 20:53:12.693067	2025-05-14 20:53:13.402
403	5603687	2025-05-08 00:00:00	296	1	9	5	\N	410.00	1	\N	pending	waiting	pending	Segunda via/renovação 	\N	\N	\N	2025-05-14 20:30:28.551588	2025-05-14 20:30:29.548
326	881010312	2025-05-09 00:00:00	230	2	14	1	\N	300.00	1	\N	pending	waiting	paid	inclusão posterior/cliente ainda vai encaminhar documento	\N	\N	18	2025-05-13 18:56:43.602348	2025-05-13 19:27:51.345
405	881010333	2025-05-14 00:00:00	298	1	14	1	\N	490.00	1	\N	pending	waiting	pending	RENOVAÇÃO DE CADASTRO + INCLUSÃO DE UMA PLACA	\N	\N	\N	2025-05-15 11:33:48.791575	2025-05-15 11:33:49.757
\.


--
-- Data for Name: sales_status_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sales_status_history (id, sale_id, from_status, to_status, user_id, notes, created_at) FROM stdin;
121	48		pending	16	Venda criada	2025-05-06 13:35:53.963054
122	48	pending	in_progress	8	Execução iniciada	2025-05-06 13:39:24.002724
123	48	in_progress	in_progress	8	Atualização do tipo de execução para OPERACIONAL	2025-05-06 13:41:26.127956
124	48	in_progress	completed	8	Execução concluída	2025-05-06 13:42:01.905945
125	49		pending	13	Venda criada	2025-05-06 14:01:41.922746
126	48	pending	in_progress	18	Iniciada tratativa financeira	2025-05-06 14:07:02.180638
127	48	in_progress	paid	18	Pagamento confirmado	2025-05-06 14:08:06.434128
128	49	pending	in_progress	7	Execução iniciada	2025-05-06 14:09:31.932195
129	49	in_progress	completed	7	Execução concluída	2025-05-06 14:10:17.282864
130	49	pending	in_progress	18	Iniciada tratativa financeira	2025-05-06 14:11:11.717402
131	49	in_progress	paid	18	Pagamento confirmado	2025-05-06 14:11:54.413906
132	50		pending	13	Venda criada	2025-05-06 14:29:09.209658
133	50	pending	in_progress	8	Execução iniciada	2025-05-06 14:30:14.278244
134	50	in_progress	completed	8	Execução concluída	2025-05-06 14:30:28.054825
135	51		pending	15	Venda criada	2025-05-06 14:30:57.783939
136	52		pending	13	Venda criada	2025-05-06 14:31:54.62132
137	51	pending	in_progress	8	Execução iniciada	2025-05-06 14:32:20.265827
138	51	in_progress	completed	8	Execução concluída	2025-05-06 14:32:43.525727
139	52	pending	in_progress	8	Execução iniciada	2025-05-06 14:33:08.644921
140	52	in_progress	completed	8	Execução concluída	2025-05-06 14:33:35.308485
141	53		pending	15	Venda criada	2025-05-06 14:34:11.353964
142	54		pending	10	Venda criada	2025-05-06 14:34:59.279004
143	55		pending	13	Venda criada	2025-05-06 14:35:06.01003
144	53	pending	in_progress	8	Execução iniciada	2025-05-06 14:35:08.381906
145	53	in_progress	completed	8	Execução concluída	2025-05-06 14:35:31.476573
146	54	pending	in_progress	8	Execução iniciada	2025-05-06 14:35:47.999292
147	54	in_progress	completed	8	Execução concluída	2025-05-06 14:36:00.086716
148	55	pending	in_progress	8	Execução iniciada	2025-05-06 14:36:34.909652
149	55	in_progress	completed	8	Execução concluída	2025-05-06 14:36:44.10786
150	56		pending	13	Venda criada	2025-05-06 14:36:50.054636
151	57		pending	15	Venda criada	2025-05-06 14:37:21.484995
152	56	pending	in_progress	8	Execução iniciada	2025-05-06 14:37:28.359684
153	56	in_progress	completed	8	Execução concluída	2025-05-06 14:37:45.806879
154	57	pending	in_progress	8	Execução iniciada	2025-05-06 14:38:14.106809
155	57	in_progress	completed	8	Execução concluída	2025-05-06 14:38:26.944804
158	59		pending	15	Venda criada	2025-05-06 14:46:08.203152
160	59	pending	in_progress	8	Execução iniciada	2025-05-06 14:46:27.063886
161	59	in_progress	completed	8	Execução concluída	2025-05-06 14:46:43.063084
163	61		pending	15	Venda criada	2025-05-06 16:34:52.946254
164	62		pending	15	Venda criada	2025-05-06 16:44:18.846207
165	63		pending	15	Venda criada	2025-05-06 16:46:29.46404
168	66		pending	15	Venda criada	2025-05-06 16:51:17.465023
169	67		pending	15	Venda criada	2025-05-06 16:53:34.648317
173	61	pending	in_progress	8	Execução iniciada	2025-05-06 16:57:40.138238
174	61	in_progress	completed	8	Execução concluída	2025-05-06 16:57:50.154183
175	62	pending	in_progress	8	Execução iniciada	2025-05-06 16:58:03.412694
176	62	in_progress	completed	8	Execução concluída	2025-05-06 16:58:25.117865
177	63	pending	in_progress	8	Execução iniciada	2025-05-06 16:58:50.856252
178	63	in_progress	completed	8	Execução concluída	2025-05-06 16:59:00.869593
181	66	pending	in_progress	8	Execução iniciada	2025-05-06 16:59:35.972454
182	66	in_progress	completed	8	Execução concluída	2025-05-06 17:00:10.447575
183	67	pending	in_progress	8	Execução iniciada	2025-05-06 17:00:51.225565
184	67	in_progress	completed	8	Execução concluída	2025-05-06 17:01:01.525239
185	68		pending	10	Venda criada	2025-05-06 17:09:42.007813
186	69		pending	11	Venda criada	2025-05-06 17:11:50.155705
187	71		pending	11	Venda criada	2025-05-06 17:15:44.077153
189	73		pending	11	Venda criada	2025-05-06 17:20:37.729426
190	74		pending	14	Venda criada	2025-05-06 17:20:45.569816
192	76		pending	11	Venda criada	2025-05-06 17:23:15.677804
193	77		pending	11	Venda criada	2025-05-06 17:24:48.746207
194	78		pending	11	Venda criada	2025-05-06 17:26:59.268994
195	79		pending	11	Venda criada	2025-05-06 17:29:17.321146
196	80		pending	11	Venda criada	2025-05-06 17:31:26.762816
197	81		pending	12	Venda criada	2025-05-06 17:38:19.966958
198	82		pending	12	Venda criada	2025-05-06 17:43:48.811962
199	83		pending	12	Venda criada	2025-05-06 17:46:06.789722
200	68	pending	in_progress	8	Execução iniciada	2025-05-06 18:09:04.17215
201	68	in_progress	completed	8	Execução concluída	2025-05-06 18:09:21.081575
202	69	pending	in_progress	8	Execução iniciada	2025-05-06 18:09:47.768034
203	69	in_progress	completed	8	Execução concluída	2025-05-06 18:09:56.963799
204	71	pending	in_progress	8	Execução iniciada	2025-05-06 18:10:08.147365
205	71	in_progress	completed	8	Execução concluída	2025-05-06 18:10:18.509861
206	73	pending	in_progress	8	Execução iniciada	2025-05-06 18:11:46.012749
207	73	in_progress	completed	8	Execução concluída	2025-05-06 18:12:06.463372
208	74	pending	in_progress	8	Execução iniciada	2025-05-06 18:12:18.652639
209	76	pending	in_progress	8	Execução iniciada	2025-05-06 18:13:56.591815
210	76	in_progress	completed	8	Execução concluída	2025-05-06 18:14:06.357132
211	77	pending	in_progress	8	Execução iniciada	2025-05-06 18:14:10.456297
212	77	in_progress	completed	8	Execução concluída	2025-05-06 18:14:35.50596
213	78	pending	in_progress	8	Execução iniciada	2025-05-06 18:14:40.621223
214	78	in_progress	completed	8	Execução concluída	2025-05-06 18:15:09.015499
215	79	pending	in_progress	8	Execução iniciada	2025-05-06 18:15:14.7903
216	79	in_progress	completed	8	Execução concluída	2025-05-06 18:15:48.063966
217	80	pending	in_progress	8	Execução iniciada	2025-05-06 18:16:24.864887
218	80	in_progress	completed	8	Execução concluída	2025-05-06 18:16:35.397944
219	81	pending	in_progress	8	Execução iniciada	2025-05-06 18:16:42.642331
220	81	in_progress	completed	8	Execução concluída	2025-05-06 18:16:52.102335
221	82	pending	in_progress	8	Execução iniciada	2025-05-06 18:16:56.367234
222	82	in_progress	completed	8	Execução concluída	2025-05-06 18:17:06.165278
223	83	pending	in_progress	8	Execução iniciada	2025-05-06 18:17:10.239175
224	83	in_progress	completed	8	Execução concluída	2025-05-06 18:17:19.748548
225	68	pending	in_progress	18	Iniciada tratativa financeira	2025-05-06 18:22:26.024743
226	68	in_progress	paid	18	Pagamento confirmado	2025-05-06 18:22:52.225674
227	54	pending	in_progress	18	Iniciada tratativa financeira	2025-05-06 18:24:41.569877
228	83	pending	in_progress	18	Iniciada tratativa financeira	2025-05-06 18:28:47.611147
229	74	in_progress	completed	8	Execução concluída	2025-05-06 18:30:16.187568
230	73	pending	in_progress	18	Iniciada tratativa financeira	2025-05-06 18:33:32.690223
231	96		pending	7	Venda criada	2025-05-06 18:43:10.327056
232	97		pending	7	Venda criada	2025-05-06 18:45:55.838818
233	96	pending	in_progress	7	Execução iniciada	2025-05-06 18:47:22.79695
234	96	in_progress	completed	7	Execução concluída	2025-05-06 18:47:55.606101
235	97	pending	in_progress	8	Execução iniciada	2025-05-06 18:49:54.481965
236	97	in_progress	completed	8	Execução concluída	2025-05-06 18:54:40.333288
237	98		pending	11	Venda criada	2025-05-06 19:27:40.026531
238	99		pending	11	Venda criada	2025-05-06 19:28:34.442745
239	100		pending	11	Venda criada	2025-05-06 19:29:46.734546
240	101		pending	11	Venda criada	2025-05-06 19:30:57.407639
241	102		pending	11	Venda criada	2025-05-06 19:31:54.7997
242	103		pending	11	Venda criada	2025-05-06 19:32:38.914542
243	104		pending	11	Venda criada	2025-05-06 19:36:34.82351
244	105		pending	11	Venda criada	2025-05-06 19:38:46.738796
245	106		pending	11	Venda criada	2025-05-06 19:43:10.007413
246	107		pending	11	Venda criada	2025-05-06 19:44:23.328662
247	108		pending	11	Venda criada	2025-05-06 19:45:35.024129
248	109		pending	14	Venda criada	2025-05-06 19:46:40.353595
249	110		pending	11	Venda criada	2025-05-06 19:48:38.098303
250	111		pending	11	Venda criada	2025-05-06 19:50:00.825852
251	112		pending	14	Venda criada	2025-05-06 19:53:27.700541
252	113		pending	14	Venda criada	2025-05-06 19:59:05.942289
253	114		pending	14	Venda criada	2025-05-06 20:09:42.476109
254	115		pending	14	Venda criada	2025-05-06 20:13:50.642437
255	115	pending	in_progress	18	Iniciada tratativa financeira	2025-05-06 20:31:08.827767
256	114	pending	in_progress	18	Iniciada tratativa financeira	2025-05-06 20:33:35.969065
257	116		pending	12	Venda criada	2025-05-06 20:52:06.560398
259	118		pending	12	Venda criada	2025-05-06 20:55:08.334516
260	119		pending	12	Venda criada	2025-05-06 20:56:07.82321
262	123		pending	12	Venda criada	2025-05-06 20:59:02.265798
263	111	pending	in_progress	18	Iniciada tratativa financeira	2025-05-06 21:03:00.796132
264	123	pending	in_progress	18	Iniciada tratativa financeira	2025-05-07 11:22:41.695165
265	110	pending	returned	8	EMPRESA NÃO POSSUÍ CNAE	2025-05-07 11:37:34.06718
266	119	pending	in_progress	8	Execução iniciada	2025-05-07 11:38:00.347919
267	119	in_progress	completed	8	Execução concluída	2025-05-07 11:39:47.743364
269	98	pending	in_progress	8	Execução iniciada	2025-05-07 11:41:40.118737
270	98	in_progress	completed	8	Execução concluída	2025-05-07 11:41:48.35495
271	123	pending	in_progress	8	Execução iniciada	2025-05-07 11:42:11.128339
272	123	in_progress	completed	8	Execução concluída	2025-05-07 11:42:36.722641
273	118	pending	in_progress	8	Execução iniciada	2025-05-07 11:42:40.413208
274	118	in_progress	completed	8	Execução concluída	2025-05-07 11:42:54.506268
275	116	pending	in_progress	8	Execução iniciada	2025-05-07 11:42:58.002283
276	116	in_progress	completed	8	Execução concluída	2025-05-07 11:43:16.051393
277	115	pending	in_progress	8	Execução iniciada	2025-05-07 11:43:23.924771
278	115	in_progress	completed	8	Execução concluída	2025-05-07 11:43:35.073723
279	114	pending	in_progress	8	Execução iniciada	2025-05-07 11:43:40.833656
280	114	in_progress	completed	8	Execução concluída	2025-05-07 11:43:49.251651
281	113	pending	in_progress	8	Execução iniciada	2025-05-07 11:44:03.302075
282	113	in_progress	completed	8	Execução concluída	2025-05-07 11:44:08.246478
283	109	pending	in_progress	8	Execução iniciada	2025-05-07 11:44:29.252998
284	109	in_progress	completed	8	Execução concluída	2025-05-07 11:44:48.155848
285	112	pending	in_progress	8	Execução iniciada	2025-05-07 11:44:52.855886
286	112	in_progress	completed	8	Execução concluída	2025-05-07 11:45:23.17461
287	54	in_progress	paid	18	Pagamento confirmado	2025-05-07 11:47:01.486311
288	55	pending	in_progress	18	Iniciada tratativa financeira	2025-05-07 11:48:02.28445
289	55	in_progress	paid	18	Pagamento confirmado	2025-05-07 11:48:12.418117
292	56	pending	in_progress	18	Iniciada tratativa financeira	2025-05-07 11:52:26.022136
293	56	in_progress	paid	18	Pagamento confirmado	2025-05-07 11:52:35.261467
294	73	in_progress	paid	18	Pagamento confirmado	2025-05-07 11:54:25.352495
296	125		pending	13	Venda criada	2025-05-07 12:24:35.858965
297	57	pending	in_progress	18	Iniciada tratativa financeira	2025-05-07 12:27:18.134415
298	57	in_progress	paid	18	Pagamento confirmado	2025-05-07 12:27:55.727476
299	59	pending	in_progress	18	Iniciada tratativa financeira	2025-05-07 12:29:13.206393
300	59	in_progress	paid	18	Pagamento confirmado	2025-05-07 12:29:40.937214
301	61	pending	in_progress	18	Iniciada tratativa financeira	2025-05-07 12:34:32.716885
302	61	in_progress	paid	18	Pagamento confirmado	2025-05-07 12:34:41.619664
303	125	pending	in_progress	8	Execução iniciada	2025-05-07 12:35:24.966248
304	125	in_progress	completed	8	Execução concluída	2025-05-07 12:35:31.292416
305	62	pending	in_progress	18	Iniciada tratativa financeira	2025-05-07 12:36:40.912305
306	62	in_progress	paid	18	Pagamento confirmado	2025-05-07 12:36:50.601784
308	127		pending	15	Venda criada	2025-05-07 13:52:02.921019
309	127	pending	in_progress	8	Execução iniciada	2025-05-07 14:10:34.843058
310	133		pending	9	Venda criada	2025-05-07 14:16:13.747102
311	134		pending	11	Venda criada	2025-05-07 14:43:05.692116
312	127	in_progress	completed	8	Execução concluída	2025-05-07 14:43:15.15284
313	135		pending	11	Venda criada	2025-05-07 14:48:39.630693
319	63	pending	in_progress	18	Iniciada tratativa financeira	2025-05-07 17:29:33.609975
320	63	in_progress	paid	18	Pagamento confirmado	2025-05-07 17:29:54.467689
324	67	pending	in_progress	18	Iniciada tratativa financeira	2025-05-07 17:36:16.051096
325	67	in_progress	paid	18	Pagamento confirmado	2025-05-07 17:36:24.852437
326	69	pending	in_progress	18	Iniciada tratativa financeira	2025-05-07 17:38:30.689028
327	69	in_progress	paid	18	Pagamento confirmado	2025-05-07 17:38:39.368321
328	71	pending	in_progress	18	Iniciada tratativa financeira	2025-05-07 17:39:58.784939
329	71	in_progress	paid	18	Pagamento confirmado	2025-05-07 17:40:06.56524
330	139		pending	9	Venda criada	2025-05-07 17:40:38.296973
331	74	pending	in_progress	18	Iniciada tratativa financeira	2025-05-07 17:40:55.07009
332	74	in_progress	paid	18	Pagamento confirmado	2025-05-07 17:41:12.126123
333	140		pending	10	Venda criada	2025-05-07 17:42:01.350011
334	141		pending	9	Venda criada	2025-05-07 17:42:38.466355
335	76	pending	in_progress	18	Iniciada tratativa financeira	2025-05-07 17:43:27.788753
336	76	in_progress	paid	18	Pagamento confirmado	2025-05-07 17:43:44.288703
337	142		pending	9	Venda criada	2025-05-07 17:45:48.019478
338	77	pending	in_progress	18	Iniciada tratativa financeira	2025-05-07 17:46:15.512464
339	77	in_progress	paid	18	Pagamento confirmado	2025-05-07 17:46:31.391339
340	143		pending	9	Venda criada	2025-05-07 17:48:37.100088
341	144		pending	9	Venda criada	2025-05-07 17:50:23.086017
342	145		pending	9	Venda criada	2025-05-07 17:57:40.011802
343	78	pending	in_progress	18	Iniciada tratativa financeira	2025-05-07 17:57:54.784636
344	78	in_progress	paid	18	Pagamento confirmado	2025-05-07 17:58:11.559454
345	146		pending	9	Venda criada	2025-05-07 18:00:06.775031
347	148		pending	15	Venda criada	2025-05-07 18:05:31.199122
348	149		pending	15	Venda criada	2025-05-07 18:07:30.230583
349	150		pending	9	Venda criada	2025-05-07 18:07:53.858172
353	152		pending	1	Venda criada	2025-05-07 18:11:02.267924
354	153		pending	15	Venda criada	2025-05-07 18:11:33.335883
355	154		pending	1	Venda criada	2025-05-07 18:17:14.110508
356	157		pending	16	Venda criada	2025-05-07 18:20:00.917962
357	158		pending	15	Venda criada	2025-05-07 18:20:07.33114
358	159		pending	9	Venda criada	2025-05-07 18:20:49.647578
359	160		pending	9	Venda criada	2025-05-07 18:22:21.821445
360	161		pending	9	Venda criada	2025-05-07 18:23:52.333936
361	162		pending	16	Venda criada	2025-05-07 18:48:08.59938
364	154	pending	in_progress	7	Execução iniciada	2025-05-07 19:01:49.197714
365	154	in_progress	completed	7	Execução concluída	2025-05-07 19:01:53.757093
366	153	pending	in_progress	7	Execução iniciada	2025-05-07 19:02:26.022972
367	153	in_progress	completed	7	Execução concluída	2025-05-07 19:03:14.281995
368	148	pending	in_progress	7	Execução iniciada	2025-05-07 19:03:56.423708
369	148	in_progress	completed	7	Execução concluída	2025-05-07 19:04:03.805249
370	140	pending	in_progress	7	Execução iniciada	2025-05-07 19:04:48.630058
371	140	in_progress	completed	7	Execução concluída	2025-05-07 19:04:57.366939
372	98	pending	in_progress	18	Iniciada tratativa financeira	2025-05-07 19:12:25.388602
373	98	in_progress	paid	18	Pagamento confirmado	2025-05-07 19:12:36.567907
374	99	pending	in_progress	18	Iniciada tratativa financeira	2025-05-07 19:14:24.665086
375	157	pending	in_progress	7	Execução iniciada	2025-05-07 19:15:07.410771
376	99	in_progress	paid	18	Pagamento confirmado	2025-05-07 19:15:17.144371
377	157	in_progress	completed	7	Execução concluída	2025-05-07 19:15:59.479939
378	100	pending	in_progress	18	Iniciada tratativa financeira	2025-05-07 19:17:09.064305
379	164		pending	10	Venda criada	2025-05-07 19:17:30.440378
380	100	in_progress	paid	18	Pagamento confirmado	2025-05-07 19:17:40.411102
381	101	pending	in_progress	18	Iniciada tratativa financeira	2025-05-07 19:20:07.036951
382	101	in_progress	paid	18	Pagamento confirmado	2025-05-07 19:20:15.641355
383	102	pending	in_progress	18	Iniciada tratativa financeira	2025-05-07 19:22:01.234209
384	102	in_progress	paid	18	Pagamento confirmado	2025-05-07 19:22:10.204869
385	103	pending	in_progress	18	Iniciada tratativa financeira	2025-05-07 19:23:39.131337
386	103	in_progress	paid	18	Pagamento confirmado	2025-05-07 19:23:49.969434
387	165		pending	9	Venda criada	2025-05-07 19:31:04.365617
388	166		pending	9	Venda criada	2025-05-07 19:32:41.015985
390	167		pending	10	Venda criada	2025-05-07 19:36:33.379734
391	104	pending	in_progress	18	Iniciada tratativa financeira	2025-05-07 19:37:01.196383
392	104	in_progress	paid	18	Pagamento confirmado	2025-05-07 19:37:10.004102
395	105	pending	in_progress	18	Iniciada tratativa financeira	2025-05-07 19:38:26.889333
396	105	in_progress	paid	18	Pagamento confirmado	2025-05-07 19:38:34.757609
397	169		pending	9	Venda criada	2025-05-07 19:38:40.781854
398	170		pending	14	Venda criada	2025-05-07 19:38:59.616231
399	106	pending	in_progress	18	Iniciada tratativa financeira	2025-05-07 19:39:03.964014
400	106	in_progress	paid	18	Pagamento confirmado	2025-05-07 19:39:12.444652
401	107	pending	in_progress	18	Iniciada tratativa financeira	2025-05-07 19:41:26.320609
402	107	in_progress	paid	18	Pagamento confirmado	2025-05-07 19:41:34.158112
403	108	pending	in_progress	18	Iniciada tratativa financeira	2025-05-07 19:42:28.798947
404	108	in_progress	paid	18	Pagamento confirmado	2025-05-07 19:42:36.846885
406	171		pending	9	Venda criada	2025-05-07 19:43:34.714521
407	109	pending	in_progress	18	Iniciada tratativa financeira	2025-05-07 19:45:58.564963
408	109	in_progress	paid	18	Pagamento confirmado	2025-05-07 19:46:09.33371
409	110	pending	in_progress	18	Iniciada tratativa financeira	2025-05-07 19:48:17.693617
410	110	in_progress	paid	18	Pagamento confirmado	2025-05-07 19:48:26.715401
413	173		pending	9	Venda criada	2025-05-07 19:51:20.255053
414	112	pending	in_progress	18	Iniciada tratativa financeira	2025-05-07 19:51:56.807295
415	112	in_progress	paid	18	Pagamento confirmado	2025-05-07 19:52:14.875684
417	174		pending	9	Venda criada	2025-05-07 19:54:19.987885
418	113	pending	in_progress	18	Iniciada tratativa financeira	2025-05-07 19:54:32.907899
419	113	in_progress	paid	18	Pagamento confirmado	2025-05-07 19:54:41.488583
420	116	pending	in_progress	18	Iniciada tratativa financeira	2025-05-07 19:55:24.398439
421	116	in_progress	paid	18	Pagamento confirmado	2025-05-07 19:55:37.005748
424	176		pending	9	Venda criada	2025-05-07 19:58:04.269045
426	165	pending	in_progress	18	Iniciada tratativa financeira	2025-05-07 20:00:27.157227
427	165	in_progress	paid	18	Pagamento confirmado	2025-05-07 20:00:42.747356
429	178		pending	9	Venda criada	2025-05-07 20:02:36.339827
430	166	pending	in_progress	18	Iniciada tratativa financeira	2025-05-07 20:04:40.576845
431	166	in_progress	paid	18	Pagamento confirmado	2025-05-07 20:04:51.488488
432	179		pending	9	Venda criada	2025-05-07 20:07:30.028633
433	180		pending	9	Venda criada	2025-05-07 20:25:11.665619
434	181		pending	9	Venda criada	2025-05-07 20:30:33.030264
435	182		pending	9	Venda criada	2025-05-07 20:35:07.345084
436	152	pending	in_progress	7	Execução iniciada	2025-05-07 20:35:19.79013
437	152	in_progress	completed	7	Execução concluída	2025-05-07 20:35:27.117722
438	171	pending	in_progress	18	Iniciada tratativa financeira	2025-05-07 20:36:30.478117
439	106	pending	in_progress	7	Execução iniciada	2025-05-07 20:36:33.410643
440	171	in_progress	paid	18	Pagamento confirmado	2025-05-07 20:36:40.258714
441	106	in_progress	completed	7	Execução concluída	2025-05-07 20:36:53.822875
442	183		pending	14	Venda criada	2025-05-07 20:37:47.125787
443	173	pending	in_progress	18	Iniciada tratativa financeira	2025-05-07 20:39:22.44331
444	173	in_progress	paid	18	Pagamento confirmado	2025-05-07 20:39:37.856153
445	184		pending	9	Venda criada	2025-05-07 20:40:54.367997
446	185		pending	15	Venda criada	2025-05-07 20:44:06.903371
448	176	pending	in_progress	18	Iniciada tratativa financeira	2025-05-07 20:46:32.948613
449	176	in_progress	paid	18	Pagamento confirmado	2025-05-07 20:46:46.090995
450	186		pending	9	Venda criada	2025-05-07 20:47:48.162724
451	187		pending	9	Venda criada	2025-05-07 20:51:30.750961
452	188		pending	9	Venda criada	2025-05-07 20:56:52.90923
453	189		pending	9	Venda criada	2025-05-07 20:59:34.1132
454	190		pending	9	Venda criada	2025-05-07 21:03:17.610714
455	191		pending	9	Venda criada	2025-05-07 21:07:01.385858
456	133	pending	in_progress	18	Iniciada tratativa financeira	2025-05-07 21:11:38.587679
457	133	in_progress	paid	18	Pagamento confirmado	2025-05-07 21:11:54.87787
458	134	pending	in_progress	18	Iniciada tratativa financeira	2025-05-07 21:13:15.989487
459	134	in_progress	paid	18	Pagamento confirmado	2025-05-07 21:13:30.429894
460	135	pending	in_progress	18	Iniciada tratativa financeira	2025-05-07 21:14:45.910126
461	135	in_progress	paid	18	Pagamento confirmado	2025-05-07 21:14:54.444885
467	139	pending	in_progress	18	Iniciada tratativa financeira	2025-05-08 11:10:01.15566
468	139	in_progress	paid	18	Pagamento confirmado	2025-05-08 11:10:52.741775
469	141	pending	in_progress	18	Iniciada tratativa financeira	2025-05-08 11:12:00.811137
470	141	in_progress	paid	18	Pagamento confirmado	2025-05-08 11:12:17.241457
471	193		pending	15	Venda criada	2025-05-08 11:23:55.136189
473	195		pending	11	Venda criada	2025-05-08 12:59:18.662334
474	196		pending	11	Venda criada	2025-05-08 13:03:35.78617
475	197		pending	11	Venda criada	2025-05-08 13:05:30.847707
476	198		pending	11	Venda criada	2025-05-08 13:07:25.538401
477	199		pending	11	Venda criada	2025-05-08 13:08:49.365839
478	200		pending	11	Venda criada	2025-05-08 13:10:00.079279
479	201		pending	11	Venda criada	2025-05-08 13:11:56.119793
480	202		pending	14	Venda criada	2025-05-08 13:13:37.781199
481	203		pending	14	Venda criada	2025-05-08 13:17:30.79641
483	205		pending	14	Venda criada	2025-05-08 13:23:53.60002
484	206		pending	11	Venda criada	2025-05-08 13:51:14.730155
485	207		pending	11	Venda criada	2025-05-08 13:52:20.987647
486	208		pending	11	Venda criada	2025-05-08 13:53:32.281528
487	209		pending	15	Venda criada	2025-05-08 14:05:53.639206
488	210		pending	15	Venda criada	2025-05-08 14:50:46.545426
489	211		pending	15	Venda criada	2025-05-08 16:21:57.801564
490	212		pending	13	Venda criada	2025-05-08 16:26:39.871169
491	213		pending	10	Venda criada	2025-05-08 16:28:54.99816
492	214		pending	11	Venda criada	2025-05-08 16:36:06.886812
493	215		pending	11	Venda criada	2025-05-08 16:37:53.743571
494	216		pending	11	Venda criada	2025-05-08 16:39:11.722377
495	217		pending	11	Venda criada	2025-05-08 16:40:23.994258
496	218		pending	11	Venda criada	2025-05-08 16:42:01.982062
497	219		pending	11	Venda criada	2025-05-08 16:43:34.526989
498	220		pending	11	Venda criada	2025-05-08 16:44:57.02706
499	221		pending	11	Venda criada	2025-05-08 16:46:53.338839
500	222		pending	11	Venda criada	2025-05-08 16:48:40.552421
501	223		pending	11	Venda criada	2025-05-08 16:49:58.798205
502	224		pending	11	Venda criada	2025-05-08 16:51:45.49537
503	225		pending	11	Venda criada	2025-05-08 16:53:24.613262
504	226		pending	11	Venda criada	2025-05-08 16:55:28.888501
505	227		pending	11	Venda criada	2025-05-08 16:56:59.013062
507	229		pending	11	Venda criada	2025-05-08 16:59:19.565046
508	230		pending	11	Venda criada	2025-05-08 17:00:51.574291
509	231		pending	1	Venda criada	2025-05-08 17:08:18.938022
510	232		pending	15	Venda criada	2025-05-08 17:19:40.492674
511	233		pending	13	Venda criada	2025-05-08 17:44:37.747252
512	230	pending	in_progress	18	Iniciada tratativa financeira	2025-05-08 18:06:17.289574
513	230	in_progress	paid	18	Pagamento confirmado	2025-05-08 18:06:50.83725
514	231	pending	in_progress	18	Iniciada tratativa financeira	2025-05-08 18:12:01.234915
515	231	in_progress	paid	18	Pagamento confirmado	2025-05-08 18:12:09.391437
516	233	pending	in_progress	18	Iniciada tratativa financeira	2025-05-08 18:12:55.653663
517	233	in_progress	paid	18	Pagamento confirmado	2025-05-08 18:14:00.87687
518	229	pending	in_progress	18	Iniciada tratativa financeira	2025-05-08 18:15:02.792763
519	229	in_progress	paid	18	Pagamento confirmado	2025-05-08 18:15:18.985267
520	224	pending	in_progress	18	Iniciada tratativa financeira	2025-05-08 18:17:34.880421
521	224	in_progress	paid	18	Pagamento confirmado	2025-05-08 18:18:05.125453
522	225	pending	in_progress	18	Iniciada tratativa financeira	2025-05-08 18:18:50.92908
523	225	in_progress	paid	18	Pagamento confirmado	2025-05-08 18:18:59.936557
524	226	pending	in_progress	18	Iniciada tratativa financeira	2025-05-08 18:20:23.804964
525	226	in_progress	paid	18	Pagamento confirmado	2025-05-08 18:20:43.256902
526	227	pending	in_progress	18	Iniciada tratativa financeira	2025-05-08 18:21:23.804094
527	227	in_progress	paid	18	Pagamento confirmado	2025-05-08 18:21:33.372502
528	214	pending	in_progress	18	Iniciada tratativa financeira	2025-05-08 18:24:58.625181
529	234		pending	15	Venda criada	2025-05-08 18:25:10.42609
530	214	in_progress	paid	18	Pagamento confirmado	2025-05-08 18:25:42.919726
531	215	pending	in_progress	18	Iniciada tratativa financeira	2025-05-08 18:27:31.575711
532	215	in_progress	paid	18	Pagamento confirmado	2025-05-08 18:27:39.944394
533	216	pending	in_progress	18	Iniciada tratativa financeira	2025-05-08 18:28:34.80406
534	216	in_progress	paid	18	Pagamento confirmado	2025-05-08 18:28:43.320529
535	235		pending	15	Venda criada	2025-05-08 18:31:34.219569
536	217	pending	in_progress	18	Iniciada tratativa financeira	2025-05-08 18:32:15.312593
537	217	in_progress	paid	18	Pagamento confirmado	2025-05-08 18:32:25.391345
538	218	pending	in_progress	18	Iniciada tratativa financeira	2025-05-08 18:35:09.602216
539	218	in_progress	paid	18	Pagamento confirmado	2025-05-08 18:35:20.079962
540	219	pending	in_progress	18	Iniciada tratativa financeira	2025-05-08 19:23:03.708386
541	219	in_progress	paid	18	Pagamento confirmado	2025-05-08 19:23:18.876964
542	220	pending	in_progress	18	Iniciada tratativa financeira	2025-05-08 19:25:24.610289
543	220	in_progress	paid	18	Pagamento confirmado	2025-05-08 19:25:40.969865
544	221	pending	in_progress	18	Iniciada tratativa financeira	2025-05-08 19:27:01.030609
545	221	in_progress	paid	18	Pagamento confirmado	2025-05-08 19:27:12.269054
546	222	pending	in_progress	18	Iniciada tratativa financeira	2025-05-08 19:28:14.575205
547	222	in_progress	paid	18	Pagamento confirmado	2025-05-08 19:28:23.6899
548	223	pending	in_progress	18	Iniciada tratativa financeira	2025-05-08 19:29:44.866277
549	223	in_progress	paid	18	Pagamento confirmado	2025-05-08 19:29:55.144225
550	206	pending	in_progress	18	Iniciada tratativa financeira	2025-05-08 19:31:09.995499
551	206	in_progress	paid	18	Pagamento confirmado	2025-05-08 19:31:27.761726
552	207	pending	in_progress	18	Iniciada tratativa financeira	2025-05-08 19:32:44.830478
553	207	in_progress	paid	18	Pagamento confirmado	2025-05-08 19:33:05.920443
554	208	pending	in_progress	18	Iniciada tratativa financeira	2025-05-08 19:34:45.690383
555	208	in_progress	paid	18	Pagamento confirmado	2025-05-08 19:35:04.843896
556	195	pending	in_progress	18	Iniciada tratativa financeira	2025-05-08 19:36:55.356057
557	195	in_progress	paid	18	Pagamento confirmado	2025-05-08 19:37:21.530273
558	196	pending	in_progress	18	Iniciada tratativa financeira	2025-05-08 19:37:57.514263
559	196	in_progress	paid	18	Pagamento confirmado	2025-05-08 19:38:12.842172
560	236		pending	14	Venda criada	2025-05-08 19:38:47.523054
561	197	pending	in_progress	18	Iniciada tratativa financeira	2025-05-08 19:40:06.553254
562	197	in_progress	paid	18	Pagamento confirmado	2025-05-08 19:40:15.718638
563	236	pending	in_progress	18	Iniciada tratativa financeira	2025-05-08 19:42:40.431372
564	236	in_progress	paid	18	Pagamento confirmado	2025-05-08 19:42:53.389702
565	237		pending	9	Venda criada	2025-05-08 20:11:36.634439
566	238		pending	9	Venda criada	2025-05-08 20:17:57.467927
567	239		pending	7	Venda criada	2025-05-08 20:25:35.413723
568	240		pending	9	Venda criada	2025-05-08 20:25:42.729429
569	241		pending	9	Venda criada	2025-05-08 20:31:10.75085
570	242		pending	13	Venda criada	2025-05-08 20:31:49.077952
571	243		pending	9	Venda criada	2025-05-08 20:34:56.185437
572	244		pending	9	Venda criada	2025-05-08 20:41:08.106092
573	239	pending	in_progress	18	Iniciada tratativa financeira	2025-05-09 11:16:15.535147
574	239	in_progress	paid	18	Pagamento confirmado	2025-05-09 11:16:29.841866
575	245		pending	9	Venda criada	2025-05-09 11:26:58.174046
576	246		pending	12	Venda criada	2025-05-09 12:15:02.284087
577	247		pending	12	Venda criada	2025-05-09 12:19:23.644126
578	248		pending	16	Venda criada	2025-05-09 13:40:59.200495
579	249		pending	12	Venda criada	2025-05-09 14:07:56.383672
580	250		pending	12	Venda criada	2025-05-09 14:09:45.972831
581	251		pending	12	Venda criada	2025-05-09 14:11:57.958099
582	252		pending	15	Venda criada	2025-05-09 14:21:05.379689
583	253		pending	9	Venda criada	2025-05-09 16:12:22.182587
584	254		pending	9	Venda criada	2025-05-09 16:16:53.302474
585	255		pending	9	Venda criada	2025-05-09 16:26:15.593492
586	256		pending	9	Venda criada	2025-05-09 16:46:00.206248
587	257		pending	13	Venda criada	2025-05-09 16:47:16.680423
588	258		pending	13	Venda criada	2025-05-09 16:49:36.661754
589	259		pending	9	Venda criada	2025-05-09 16:52:03.350249
590	260		pending	12	Venda criada	2025-05-09 17:15:44.184739
591	261		pending	15	Venda criada	2025-05-09 17:22:14.564016
592	262		pending	15	Venda criada	2025-05-09 17:24:26.947363
593	263		pending	12	Venda criada	2025-05-09 17:24:39.820254
594	244	pending	in_progress	18	Iniciada tratativa financeira	2025-05-09 17:32:17.318507
595	264		pending	11	Venda criada	2025-05-09 17:32:22.7129
596	244	in_progress	paid	18	Pagamento confirmado	2025-05-09 17:32:33.768214
597	265		pending	10	Venda criada	2025-05-09 17:32:40.142351
598	266		pending	11	Venda criada	2025-05-09 17:34:30.376295
599	267		pending	11	Venda criada	2025-05-09 17:35:12.921165
600	247	pending	in_progress	18	Iniciada tratativa financeira	2025-05-09 17:35:35.670076
601	247	in_progress	paid	18	Pagamento confirmado	2025-05-09 17:35:48.980512
602	268		pending	11	Venda criada	2025-05-09 17:36:12.225148
603	249	pending	in_progress	18	Iniciada tratativa financeira	2025-05-09 17:37:06.870013
604	249	in_progress	paid	18	Pagamento confirmado	2025-05-09 17:37:23.23063
605	269		pending	11	Venda criada	2025-05-09 17:37:41.353284
606	270		pending	12	Venda criada	2025-05-09 17:37:55.939117
607	250	pending	in_progress	18	Iniciada tratativa financeira	2025-05-09 17:38:29.235816
608	271		pending	11	Venda criada	2025-05-09 17:38:51.257254
609	250	in_progress	paid	18	Pagamento confirmado	2025-05-09 17:39:01.430625
610	252	pending	in_progress	18	Iniciada tratativa financeira	2025-05-09 17:40:19.396818
611	272		pending	11	Venda criada	2025-05-09 17:40:20.964456
612	252	in_progress	paid	18	Pagamento confirmado	2025-05-09 17:40:33.351374
613	260	pending	in_progress	18	Iniciada tratativa financeira	2025-05-09 17:41:45.059419
614	99	pending	in_progress	8	Execução iniciada	2025-05-09 17:41:53.338721
615	99	in_progress	completed	8	Execução concluída	2025-05-09 17:42:02.969504
616	100	pending	in_progress	8	Execução iniciada	2025-05-09 17:42:14.141411
617	100	in_progress	completed	8	Execução concluída	2025-05-09 17:42:21.725616
618	260	in_progress	paid	18	Pagamento confirmado	2025-05-09 17:42:28.723927
619	101	pending	in_progress	8	Execução iniciada	2025-05-09 17:42:39.022684
621	102	pending	in_progress	8	Execução iniciada	2025-05-09 17:42:52.270892
622	102	in_progress	completed	8	Execução concluída	2025-05-09 17:42:58.594495
623	103	pending	in_progress	8	Execução iniciada	2025-05-09 17:43:09.28187
625	104	pending	in_progress	8	Execução iniciada	2025-05-09 17:43:21.551717
620	101	in_progress	completed	8	Execução concluída	2025-05-09 17:42:44.615447
624	261	pending	in_progress	18	Iniciada tratativa financeira	2025-05-09 17:43:10.525025
626	261	in_progress	paid	18	Pagamento confirmado	2025-05-09 17:43:24.067296
627	104	in_progress	completed	8	Execução concluída	2025-05-09 17:43:27.431345
628	105	pending	in_progress	8	Execução iniciada	2025-05-09 17:43:36.190153
629	105	in_progress	completed	8	Execução concluída	2025-05-09 17:43:54.857342
630	107	pending	in_progress	8	Execução iniciada	2025-05-09 17:44:05.023539
631	107	in_progress	completed	8	Execução concluída	2025-05-09 17:44:11.958509
632	108	pending	in_progress	8	Execução iniciada	2025-05-09 17:44:20.721725
633	111	pending	in_progress	8	Execução iniciada	2025-05-09 17:44:39.965701
634	111	in_progress	completed	8	Execução concluída	2025-05-09 17:44:46.364673
635	133	pending	in_progress	8	Execução iniciada	2025-05-09 17:45:09.422729
636	133	in_progress	completed	8	Execução concluída	2025-05-09 17:45:25.48184
637	134	pending	in_progress	8	Execução iniciada	2025-05-09 17:46:39.621109
638	135	pending	in_progress	8	Execução iniciada	2025-05-09 17:46:48.232688
639	273		pending	15	Venda criada	2025-05-09 17:50:16.949957
640	274		pending	16	Venda criada	2025-05-09 17:51:11.479251
641	275		pending	11	Venda criada	2025-05-09 17:51:16.880098
642	276		pending	14	Venda criada	2025-05-09 17:51:47.496675
643	263	pending	in_progress	18	Iniciada tratativa financeira	2025-05-09 17:51:58.143231
644	263	in_progress	paid	18	Pagamento confirmado	2025-05-09 17:52:11.560271
645	277		pending	11	Venda criada	2025-05-09 17:52:26.114978
647	268	pending	in_progress	18	Iniciada tratativa financeira	2025-05-09 17:53:41.742779
648	268	in_progress	paid	18	Pagamento confirmado	2025-05-09 17:53:57.972397
649	279		pending	11	Venda criada	2025-05-09 17:54:27.105857
651	281		pending	11	Venda criada	2025-05-09 17:55:43.366237
652	271	pending	in_progress	18	Iniciada tratativa financeira	2025-05-09 17:55:52.070422
653	271	in_progress	paid	18	Pagamento confirmado	2025-05-09 17:56:04.789101
654	272	pending	in_progress	18	Iniciada tratativa financeira	2025-05-09 17:56:49.139045
655	272	in_progress	paid	18	Pagamento confirmado	2025-05-09 17:56:57.740125
656	282		pending	11	Venda criada	2025-05-09 17:57:02.478613
657	275	pending	in_progress	18	Iniciada tratativa financeira	2025-05-09 17:57:48.960311
658	275	in_progress	paid	18	Pagamento confirmado	2025-05-09 17:57:57.966613
659	276	pending	in_progress	18	Iniciada tratativa financeira	2025-05-09 17:58:52.863243
660	276	in_progress	paid	18	Pagamento confirmado	2025-05-09 17:59:01.811642
661	283		pending	11	Venda criada	2025-05-09 18:00:41.138185
662	284		pending	11	Venda criada	2025-05-09 18:01:52.303812
664	286		pending	11	Venda criada	2025-05-09 18:03:16.014852
665	287		pending	11	Venda criada	2025-05-09 18:04:01.230476
666	288		pending	11	Venda criada	2025-05-09 18:05:07.631539
667	279	pending	in_progress	18	Iniciada tratativa financeira	2025-05-09 18:10:03.590132
668	279	in_progress	paid	18	Pagamento confirmado	2025-05-09 18:10:19.644179
671	281	pending	in_progress	18	Iniciada tratativa financeira	2025-05-09 18:12:40.379723
672	281	in_progress	paid	18	Pagamento confirmado	2025-05-09 18:12:53.39631
673	284	pending	in_progress	18	Iniciada tratativa financeira	2025-05-09 18:13:55.940535
674	284	in_progress	paid	18	Pagamento confirmado	2025-05-09 18:14:07.00443
677	262	pending	in_progress	18	Iniciada tratativa financeira	2025-05-09 18:19:41.154563
678	264	pending	in_progress	18	Iniciada tratativa financeira	2025-05-09 18:21:25.916839
679	264	in_progress	paid	18	Pagamento confirmado	2025-05-09 18:21:35.130043
680	265	pending	in_progress	18	Iniciada tratativa financeira	2025-05-09 18:23:27.13019
681	265	in_progress	paid	18	Pagamento confirmado	2025-05-09 18:23:41.989672
682	266	pending	in_progress	18	Iniciada tratativa financeira	2025-05-09 18:25:49.245153
683	266	in_progress	paid	18	Pagamento confirmado	2025-05-09 18:25:58.162488
684	289		pending	7	Venda criada	2025-05-09 18:40:16.16786
685	270	pending	in_progress	18	Iniciada tratativa financeira	2025-05-09 18:42:31.996174
686	270	in_progress	paid	18	Pagamento confirmado	2025-05-09 18:42:45.291734
687	269	pending	in_progress	18	Iniciada tratativa financeira	2025-05-09 18:43:17.820626
688	269	in_progress	paid	18	Pagamento confirmado	2025-05-09 18:43:26.296272
689	267	pending	in_progress	18	Iniciada tratativa financeira	2025-05-09 18:44:41.17651
690	267	in_progress	paid	18	Pagamento confirmado	2025-05-09 18:44:48.4277
691	291		pending	15	Venda criada	2025-05-09 18:45:55.074946
692	251	pending	in_progress	18	Iniciada tratativa financeira	2025-05-09 18:46:03.269718
693	251	in_progress	paid	18	Pagamento confirmado	2025-05-09 18:46:11.541176
694	240	pending	in_progress	18	Iniciada tratativa financeira	2025-05-09 18:47:13.813503
695	240	in_progress	paid	18	Pagamento confirmado	2025-05-09 18:47:25.051779
696	241	pending	in_progress	18	Iniciada tratativa financeira	2025-05-09 18:50:12.999115
697	241	in_progress	paid	18	Pagamento confirmado	2025-05-09 18:50:50.747953
698	242	pending	in_progress	18	Iniciada tratativa financeira	2025-05-09 18:52:48.840712
699	242	in_progress	paid	18	Pagamento confirmado	2025-05-09 18:56:49.392528
700	243	pending	in_progress	18	Iniciada tratativa financeira	2025-05-09 19:00:21.617553
701	243	in_progress	paid	18	Pagamento confirmado	2025-05-09 19:00:39.28751
702	246	pending	in_progress	18	Iniciada tratativa financeira	2025-05-09 19:03:21.304907
703	246	in_progress	paid	18	Pagamento confirmado	2025-05-09 19:03:35.152631
704	277	pending	in_progress	18	Iniciada tratativa financeira	2025-05-09 19:12:37.857829
705	277	in_progress	paid	18	Pagamento confirmado	2025-05-09 19:12:52.574993
706	232	pending	in_progress	18	Iniciada tratativa financeira	2025-05-09 19:24:02.666791
707	232	in_progress	paid	18	Pagamento confirmado	2025-05-09 19:24:19.086731
708	234	pending	in_progress	18	Iniciada tratativa financeira	2025-05-09 19:25:33.429834
709	234	in_progress	paid	18	Pagamento confirmado	2025-05-09 19:25:51.539276
710	235	pending	in_progress	18	Iniciada tratativa financeira	2025-05-09 19:28:44.534005
711	235	in_progress	paid	18	Pagamento confirmado	2025-05-09 19:28:54.925688
712	292		pending	12	Venda criada	2025-05-09 20:23:34.314654
713	293		pending	12	Venda criada	2025-05-09 20:24:47.791266
714	294		pending	12	Venda criada	2025-05-09 20:26:12.966056
715	295		pending	9	Venda criada	2025-05-09 20:26:30.864361
716	296		pending	12	Venda criada	2025-05-09 20:28:34.12524
717	297		pending	9	Venda criada	2025-05-09 20:33:21.918469
718	298		pending	9	Venda criada	2025-05-09 20:38:10.148907
719	237	pending	in_progress	18	Iniciada tratativa financeira	2025-05-09 20:41:40.663612
720	237	in_progress	paid	18	Pagamento confirmado	2025-05-09 20:41:53.054481
721	299		pending	9	Venda criada	2025-05-09 20:42:49.267042
722	238	pending	in_progress	18	Iniciada tratativa financeira	2025-05-09 20:43:12.918177
723	238	in_progress	paid	18	Pagamento confirmado	2025-05-09 20:43:27.030756
724	209	pending	in_progress	18	Iniciada tratativa financeira	2025-05-09 20:48:04.12748
725	209	in_progress	paid	18	Pagamento confirmado	2025-05-09 20:48:14.080281
726	300		pending	14	Venda criada	2025-05-09 20:53:20.713336
727	301		pending	13	Venda criada	2025-05-09 20:55:38.806392
728	302		pending	14	Venda criada	2025-05-09 20:57:27.499558
729	300	pending	in_progress	18	Iniciada tratativa financeira	2025-05-09 21:05:00.757325
730	300	in_progress	paid	18	Pagamento confirmado	2025-05-09 21:05:12.793337
731	302	pending	in_progress	18	Iniciada tratativa financeira	2025-05-09 21:07:24.457584
732	302	in_progress	paid	18	Pagamento confirmado	2025-05-09 21:07:37.185477
733	210	pending	in_progress	18	Iniciada tratativa financeira	2025-05-09 21:10:52.248049
734	210	in_progress	paid	18	Pagamento confirmado	2025-05-09 21:11:00.209304
735	303		pending	16	Venda criada	2025-05-13 12:37:07.945832
736	304		pending	11	Venda criada	2025-05-13 13:44:51.066595
737	305		pending	11	Venda criada	2025-05-13 13:47:10.00939
738	306		pending	11	Venda criada	2025-05-13 13:48:15.641847
739	307		pending	10	Venda criada	2025-05-13 13:48:56.560006
740	308		pending	11	Venda criada	2025-05-13 13:49:29.988589
741	309		pending	11	Venda criada	2025-05-13 13:50:38.737836
742	310		pending	10	Venda criada	2025-05-13 13:52:01.079457
743	311		pending	11	Venda criada	2025-05-13 13:52:12.522756
744	312		pending	11	Venda criada	2025-05-13 13:53:36.401723
745	313		pending	11	Venda criada	2025-05-13 13:55:37.747713
746	314		pending	11	Venda criada	2025-05-13 13:56:18.553684
747	315		pending	11	Venda criada	2025-05-13 13:57:11.17642
748	316		pending	13	Venda criada	2025-05-13 14:07:02.263291
749	317		pending	13	Venda criada	2025-05-13 14:10:13.474857
750	318		pending	13	Venda criada	2025-05-13 14:12:08.13785
751	319		pending	13	Venda criada	2025-05-13 14:13:11.414935
752	320		pending	16	Venda criada	2025-05-13 17:13:57.021387
753	171	pending	in_progress	7	Execução iniciada	2025-05-13 18:04:06.205724
754	171	in_progress	completed	7	Execução concluída	2025-05-13 18:04:52.9026
755	321		pending	9	Venda criada	2025-05-13 18:13:46.547485
756	185	pending	in_progress	7	Execução iniciada	2025-05-13 18:15:32.196001
757	185	in_progress	completed	7	Execução concluída	2025-05-13 18:15:47.7954
758	264	pending	in_progress	7	Execução iniciada	2025-05-13 18:16:27.135544
759	264	in_progress	completed	7	Execução concluída	2025-05-13 18:16:41.160944
760	322		pending	9	Venda criada	2025-05-13 18:19:50.986494
761	216	pending	in_progress	7	Execução iniciada	2025-05-13 18:22:23.588544
762	216	in_progress	completed	7	Execução concluída	2025-05-13 18:22:36.773842
763	214	pending	in_progress	7	Execução iniciada	2025-05-13 18:23:08.41798
764	214	in_progress	completed	7	Execução concluída	2025-05-13 18:23:15.166323
765	265	pending	in_progress	7	Execução iniciada	2025-05-13 18:24:14.708407
766	323		pending	9	Venda criada	2025-05-13 18:26:31.112594
767	219	pending	in_progress	7	Execução iniciada	2025-05-13 18:26:33.356848
768	219	in_progress	completed	7	Execução concluída	2025-05-13 18:28:04.074649
769	324		pending	9	Venda criada	2025-05-13 18:30:47.758078
770	181	pending	in_progress	7	Execução iniciada	2025-05-13 18:31:14.18105
771	315	pending	in_progress	18	Iniciada tratativa financeira	2025-05-13 18:36:16.873619
772	315	in_progress	paid	18	Pagamento confirmado	2025-05-13 18:36:30.504523
773	325		pending	9	Venda criada	2025-05-13 18:44:33.217413
774	226	pending	in_progress	7	Execução iniciada	2025-05-13 18:47:19.544043
775	226	in_progress	completed	7	Execução concluída	2025-05-13 18:47:30.771645
776	326		pending	14	Venda criada	2025-05-13 18:56:44.124715
777	327		pending	9	Venda criada	2025-05-13 18:57:25.685613
778	316	pending	in_progress	18	Iniciada tratativa financeira	2025-05-13 19:06:32.163409
779	181	in_progress	returned	1	PEDIDO EM ABERTO COM CLIENTE	2025-05-13 19:06:58.261287
780	181	returned	corrected	1	TESTE	2025-05-13 19:07:09.102684
781	181	corrected	in_progress	1	Execução iniciada	2025-05-13 19:07:18.019546
782	316	in_progress	paid	18	Pagamento confirmado	2025-05-13 19:07:21.185226
783	181	in_progress	returned	1	PEDIDO EM ABERTO COM CLIENTE	2025-05-13 19:08:47.19943
785	184	pending	in_progress	1	Execução iniciada	2025-05-13 19:10:09.983431
786	190	pending	in_progress	7	Execução iniciada	2025-05-13 19:15:32.922264
787	190	in_progress	completed	7	Execução concluída	2025-05-13 19:15:49.85044
788	182	pending	in_progress	7	Execução iniciada	2025-05-13 19:16:33.080491
789	182	in_progress	completed	7	Execução concluída	2025-05-13 19:17:17.183368
790	222	pending	in_progress	7	Execução iniciada	2025-05-13 19:17:51.279097
791	222	in_progress	completed	7	Execução concluída	2025-05-13 19:18:18.260152
792	205	pending	in_progress	7	Execução iniciada	2025-05-13 19:19:03.478483
793	205	in_progress	completed	7	Execução concluída	2025-05-13 19:19:16.112112
794	183	pending	in_progress	1	Execução iniciada	2025-05-13 19:20:24.649775
795	326	pending	in_progress	18	Iniciada tratativa financeira	2025-05-13 19:27:35.035419
796	326	in_progress	paid	18	Pagamento confirmado	2025-05-13 19:27:51.306173
797	220	pending	in_progress	7	Execução iniciada	2025-05-13 19:35:26.661586
798	220	in_progress	completed	7	Execução concluída	2025-05-13 19:36:02.069452
799	186	pending	in_progress	7	Execução iniciada	2025-05-13 19:36:47.724622
800	186	in_progress	completed	7	Execução concluída	2025-05-13 19:38:21.839339
801	191	pending	in_progress	7	Execução iniciada	2025-05-13 19:40:36.350163
802	191	in_progress	completed	7	Execução concluída	2025-05-13 19:40:41.216204
803	309	pending	in_progress	18	Iniciada tratativa financeira	2025-05-13 19:56:35.738491
804	309	in_progress	paid	18	Pagamento confirmado	2025-05-13 19:56:44.382867
805	329		pending	14	Venda criada	2025-05-13 19:57:41.97953
806	310	pending	in_progress	18	Iniciada tratativa financeira	2025-05-13 19:57:57.267925
807	310	in_progress	paid	18	Pagamento confirmado	2025-05-13 19:58:25.004186
808	311	pending	in_progress	18	Iniciada tratativa financeira	2025-05-13 20:00:15.480534
809	311	in_progress	paid	18	Pagamento confirmado	2025-05-13 20:00:47.821943
810	312	pending	in_progress	18	Iniciada tratativa financeira	2025-05-13 20:02:42.752726
811	312	in_progress	paid	18	Pagamento confirmado	2025-05-13 20:02:50.945034
812	313	pending	in_progress	18	Iniciada tratativa financeira	2025-05-13 20:04:12.086512
813	313	in_progress	paid	18	Pagamento confirmado	2025-05-13 20:04:19.337091
814	314	pending	in_progress	18	Iniciada tratativa financeira	2025-05-13 20:05:11.485611
815	314	in_progress	paid	18	Pagamento confirmado	2025-05-13 20:05:22.238223
816	317	pending	in_progress	18	Iniciada tratativa financeira	2025-05-13 20:07:36.556947
817	317	in_progress	paid	18	Pagamento confirmado	2025-05-13 20:07:44.273537
818	318	pending	in_progress	18	Iniciada tratativa financeira	2025-05-13 20:08:44.088688
819	318	in_progress	paid	18	Pagamento confirmado	2025-05-13 20:08:51.541871
820	301	pending	in_progress	18	Iniciada tratativa financeira	2025-05-13 20:09:34.839792
821	301	in_progress	paid	18	Pagamento confirmado	2025-05-13 20:09:45.486385
822	303	pending	in_progress	18	Iniciada tratativa financeira	2025-05-13 20:10:22.598128
823	303	in_progress	paid	18	Pagamento confirmado	2025-05-13 20:10:30.444283
824	299	pending	in_progress	18	Iniciada tratativa financeira	2025-05-13 20:11:17.772981
825	299	in_progress	paid	18	Pagamento confirmado	2025-05-13 20:11:25.854712
826	304	pending	in_progress	18	Iniciada tratativa financeira	2025-05-13 20:13:44.771612
827	304	in_progress	paid	18	Pagamento confirmado	2025-05-13 20:13:55.386992
828	305	pending	in_progress	18	Iniciada tratativa financeira	2025-05-13 20:15:20.597499
829	305	in_progress	paid	18	Pagamento confirmado	2025-05-13 20:15:29.158402
830	306	pending	in_progress	18	Iniciada tratativa financeira	2025-05-13 20:18:22.38297
831	306	in_progress	paid	18	Pagamento confirmado	2025-05-13 20:18:32.082317
832	330		pending	14	Venda criada	2025-05-13 20:18:52.637499
833	308	pending	in_progress	18	Iniciada tratativa financeira	2025-05-13 20:18:58.187709
834	308	in_progress	paid	18	Pagamento confirmado	2025-05-13 20:19:06.213714
835	331		pending	9	Venda criada	2025-05-13 20:24:01.994648
836	332		pending	9	Venda criada	2025-05-13 20:25:13.002319
837	292	pending	in_progress	18	Iniciada tratativa financeira	2025-05-13 20:27:16.709723
838	292	in_progress	paid	18	Pagamento confirmado	2025-05-13 20:27:32.560142
839	333		pending	9	Venda criada	2025-05-13 20:29:08.045525
840	334		pending	9	Venda criada	2025-05-13 20:30:56.596792
841	335		pending	14	Venda criada	2025-05-13 20:31:05.807358
842	336		pending	9	Venda criada	2025-05-13 20:32:18.507728
843	337		pending	9	Venda criada	2025-05-13 20:33:33.323647
844	338		pending	9	Venda criada	2025-05-13 20:35:19.114887
845	339		pending	14	Venda criada	2025-05-13 20:35:53.90144
846	340		pending	9	Venda criada	2025-05-13 20:37:47.962876
847	341		pending	14	Venda criada	2025-05-13 20:38:01.847609
848	342		pending	14	Venda criada	2025-05-13 20:40:05.300582
849	293	pending	in_progress	18	Iniciada tratativa financeira	2025-05-13 20:49:04.112398
850	293	in_progress	paid	18	Pagamento confirmado	2025-05-13 20:49:18.709507
851	294	pending	in_progress	18	Iniciada tratativa financeira	2025-05-13 20:51:06.92768
852	294	in_progress	paid	18	Pagamento confirmado	2025-05-13 20:51:17.48908
853	343		pending	9	Venda criada	2025-05-13 20:53:40.727894
854	344		pending	13	Venda criada	2025-05-13 21:00:37.285471
855	158	pending	in_progress	7	Execução iniciada	2025-05-13 21:02:12.219875
856	158	in_progress	completed	7	Execução concluída	2025-05-13 21:02:59.182577
857	238	pending	in_progress	7	Execução iniciada	2025-05-13 21:18:54.127243
858	238	in_progress	completed	7	Execução concluída	2025-05-13 21:19:08.6104
859	335	pending	in_progress	18	Iniciada tratativa financeira	2025-05-14 11:34:49.974747
860	335	in_progress	paid	18	Pagamento confirmado	2025-05-14 11:34:59.436659
861	345		pending	14	Venda criada	2025-05-14 11:36:43.934236
862	336	pending	in_progress	18	Iniciada tratativa financeira	2025-05-14 11:37:37.580883
863	336	in_progress	paid	18	Pagamento confirmado	2025-05-14 11:37:50.989464
864	337	pending	in_progress	18	Iniciada tratativa financeira	2025-05-14 11:39:25.016649
865	337	in_progress	paid	18	Pagamento confirmado	2025-05-14 11:39:33.55553
866	346		pending	14	Venda criada	2025-05-14 11:40:11.761326
867	338	pending	in_progress	18	Iniciada tratativa financeira	2025-05-14 11:40:23.367687
868	338	in_progress	paid	18	Pagamento confirmado	2025-05-14 11:40:30.697395
869	347		pending	14	Venda criada	2025-05-14 11:41:52.00598
870	348		pending	14	Venda criada	2025-05-14 11:44:09.631593
871	349		pending	15	Venda criada	2025-05-14 11:44:59.190205
872	350		pending	14	Venda criada	2025-05-14 11:46:43.23633
873	351		pending	14	Venda criada	2025-05-14 11:49:00.29707
874	352		pending	14	Venda criada	2025-05-14 11:52:30.932783
875	353		pending	14	Venda criada	2025-05-14 11:54:14.964786
876	354		pending	14	Venda criada	2025-05-14 11:56:40.495806
877	355		pending	7	Venda criada	2025-05-14 12:02:12.653127
878	357		pending	15	Venda criada	2025-05-14 12:20:55.652359
879	358		pending	13	Venda criada	2025-05-14 12:29:03.278314
880	359		pending	14	Venda criada	2025-05-14 12:34:02.322569
881	361		pending	1	Venda criada	2025-05-14 12:45:57.573343
882	362		pending	1	Venda criada	2025-05-14 12:56:54.32351
883	363		pending	15	Venda criada	2025-05-14 13:44:35.868717
884	364		pending	15	Venda criada	2025-05-14 13:45:46.847506
885	365		pending	15	Venda criada	2025-05-14 13:47:37.405458
886	366		pending	15	Venda criada	2025-05-14 13:49:31.22706
887	189	pending	in_progress	7	Execução iniciada	2025-05-14 14:15:38.294712
888	189	in_progress	completed	7	Execução concluída	2025-05-14 14:16:44.449042
889	188	pending	in_progress	7	Execução iniciada	2025-05-14 14:17:07.97919
890	188	in_progress	completed	7	Execução concluída	2025-05-14 14:17:14.961936
891	187	pending	in_progress	7	Execução iniciada	2025-05-14 14:17:31.110922
892	187	in_progress	completed	7	Execução concluída	2025-05-14 14:17:48.747544
893	167	pending	in_progress	7	Execução iniciada	2025-05-14 14:19:39.560792
894	167	in_progress	completed	7	Execução concluída	2025-05-14 14:19:46.145386
895	162	pending	in_progress	7	Execução iniciada	2025-05-14 14:20:07.312223
896	162	in_progress	completed	7	Execução concluída	2025-05-14 14:20:22.737134
897	361	pending	in_progress	7	Execução iniciada	2025-05-14 14:21:50.83084
898	361	in_progress	completed	7	Execução concluída	2025-05-14 14:21:55.580839
899	362	pending	in_progress	7	Execução iniciada	2025-05-14 14:22:41.959086
900	362	in_progress	completed	7	Execução concluída	2025-05-14 14:22:57.828394
901	352	pending	in_progress	7	Execução iniciada - Tipo de execução alterado de OPERACIONAL para CERTIFICADO DIGITAL	2025-05-14 14:24:23.676464
902	352	in_progress	completed	7	Execução concluída	2025-05-14 14:24:39.426635
903	329	pending	in_progress	7	Execução iniciada	2025-05-14 14:26:36.570973
904	343	pending	in_progress	7	Execução iniciada	2025-05-14 14:28:11.909785
905	343	in_progress	completed	7	Execução concluída	2025-05-14 14:28:46.062972
906	327	pending	in_progress	7	Execução iniciada	2025-05-14 14:29:20.416141
907	327	in_progress	completed	7	Execução concluída	2025-05-14 14:30:31.511038
908	344	pending	in_progress	7	Execução iniciada	2025-05-14 14:31:06.057345
909	344	in_progress	completed	7	Execução concluída	2025-05-14 14:31:13.701219
910	353	pending	in_progress	7	Execução iniciada	2025-05-14 14:31:50.69244
911	367		pending	1	Venda criada	2025-05-14 14:31:54.096771
912	353	in_progress	completed	7	Execução concluída	2025-05-14 14:32:04.959527
913	322	pending	in_progress	7	Execução iniciada	2025-05-14 14:32:31.042191
914	322	in_progress	completed	7	Execução concluída	2025-05-14 14:32:46.491138
915	146	pending	in_progress	7	Execução iniciada	2025-05-14 14:34:29.984997
916	146	in_progress	completed	7	Execução concluída	2025-05-14 14:34:38.255581
917	179	pending	in_progress	7	Execução iniciada	2025-05-14 14:35:26.130031
918	179	in_progress	completed	7	Execução concluída	2025-05-14 14:35:51.405467
919	178	pending	in_progress	7	Execução iniciada	2025-05-14 14:37:03.848338
920	178	in_progress	completed	7	Execução concluída	2025-05-14 14:37:12.109041
921	141	pending	in_progress	7	Execução iniciada	2025-05-14 14:38:16.307867
922	141	in_progress	completed	7	Execução concluída	2025-05-14 14:38:37.805867
923	371		pending	10	Venda criada	2025-05-14 14:39:15.626784
924	142	pending	in_progress	7	Execução iniciada	2025-05-14 14:39:26.999165
925	142	in_progress	completed	7	Execução concluída	2025-05-14 14:39:43.299042
926	372		pending	15	Venda criada	2025-05-14 14:57:23.39281
927	373		pending	16	Venda criada	2025-05-14 14:58:57.66832
928	374		pending	15	Venda criada	2025-05-14 15:38:56.561065
929	375		pending	15	Venda criada	2025-05-14 15:44:05.818966
930	376		pending	15	Venda criada	2025-05-14 15:49:45.097095
931	377		pending	9	Venda criada	2025-05-14 16:28:13.199539
932	378		pending	9	Venda criada	2025-05-14 16:37:47.717739
933	379		pending	1	Venda criada	2025-05-14 16:45:05.772066
934	380		pending	9	Venda criada	2025-05-14 16:48:43.17577
935	381		pending	1	Venda criada	2025-05-14 16:49:28.34557
936	382		pending	14	Venda criada	2025-05-14 17:26:43.269443
937	383		pending	1	Venda criada	2025-05-14 17:47:33.546337
938	388		pending	15	Venda criada	2025-05-14 17:54:25.672258
939	390		pending	9	Venda criada	2025-05-14 18:01:08.163072
940	379	pending	in_progress	18	Iniciada tratativa financeira	2025-05-14 18:04:53.324642
941	379	in_progress	paid	18	Pagamento confirmado	2025-05-14 18:05:05.89769
942	391		pending	15	Venda criada	2025-05-14 18:06:31.528957
943	381	pending	in_progress	18	Iniciada tratativa financeira	2025-05-14 18:07:12.695325
944	381	in_progress	paid	18	Pagamento confirmado	2025-05-14 18:07:23.434831
945	382	pending	in_progress	18	Iniciada tratativa financeira	2025-05-14 18:08:18.551474
946	382	in_progress	paid	18	Pagamento confirmado	2025-05-14 18:08:32.912753
947	383	pending	in_progress	18	Iniciada tratativa financeira	2025-05-14 18:09:35.32902
948	383	in_progress	paid	18	Pagamento confirmado	2025-05-14 18:09:47.068581
949	392		pending	11	Venda criada	2025-05-14 18:09:48.710792
950	391	pending	in_progress	18	Iniciada tratativa financeira	2025-05-14 18:10:59.35182
951	391	in_progress	paid	18	Pagamento confirmado	2025-05-14 18:11:19.39403
952	393		pending	11	Venda criada	2025-05-14 18:12:48.239407
953	394		pending	11	Venda criada	2025-05-14 18:14:15.949477
954	395		pending	11	Venda criada	2025-05-14 18:15:59.929698
955	396		pending	11	Venda criada	2025-05-14 18:17:22.483619
956	397		pending	11	Venda criada	2025-05-14 18:18:06.260648
957	398		pending	9	Venda criada	2025-05-14 18:18:51.641666
958	392	pending	in_progress	18	Iniciada tratativa financeira	2025-05-14 18:20:53.790482
959	392	in_progress	paid	18	Pagamento confirmado	2025-05-14 18:21:21.557822
960	393	pending	in_progress	18	Iniciada tratativa financeira	2025-05-14 18:22:41.86199
961	393	in_progress	paid	18	Pagamento confirmado	2025-05-14 18:22:59.195948
962	394	pending	in_progress	18	Iniciada tratativa financeira	2025-05-14 18:23:28.130725
963	394	in_progress	paid	18	Pagamento confirmado	2025-05-14 18:23:39.061088
964	395	pending	in_progress	18	Iniciada tratativa financeira	2025-05-14 18:27:23.505352
965	395	in_progress	paid	18	Pagamento confirmado	2025-05-14 18:27:55.33894
966	399		pending	1	Venda criada	2025-05-14 18:27:57.898628
967	362	pending	in_progress	18	Iniciada tratativa financeira	2025-05-14 18:29:41.515538
968	362	in_progress	paid	18	Pagamento confirmado	2025-05-14 18:29:58.105965
969	400		pending	9	Venda criada	2025-05-14 18:31:03.530594
970	363	pending	in_progress	18	Iniciada tratativa financeira	2025-05-14 18:31:46.609331
971	363	in_progress	paid	18	Pagamento confirmado	2025-05-14 18:32:01.28295
972	401		pending	9	Venda criada	2025-05-14 19:11:33.555629
973	399	pending	in_progress	18	Iniciada tratativa financeira	2025-05-14 19:14:06.41138
974	399	in_progress	paid	18	Pagamento confirmado	2025-05-14 19:14:26.037788
975	364	pending	in_progress	18	Iniciada tratativa financeira	2025-05-14 19:15:50.265096
976	364	in_progress	paid	18	Pagamento confirmado	2025-05-14 19:16:08.719432
977	361	pending	in_progress	18	Iniciada tratativa financeira	2025-05-14 19:17:15.008388
978	361	in_progress	paid	18	Pagamento confirmado	2025-05-14 19:17:32.547633
979	359	pending	in_progress	18	Iniciada tratativa financeira	2025-05-14 20:15:54.376747
980	359	in_progress	paid	18	Pagamento confirmado	2025-05-14 20:16:04.994859
981	402		pending	9	Venda criada	2025-05-14 20:18:18.662663
982	365	pending	in_progress	18	Iniciada tratativa financeira	2025-05-14 20:21:18.788644
983	365	in_progress	paid	18	Pagamento confirmado	2025-05-14 20:21:40.530094
984	358	pending	in_progress	18	Iniciada tratativa financeira	2025-05-14 20:22:39.395162
985	358	in_progress	paid	18	Pagamento confirmado	2025-05-14 20:23:17.117187
986	366	pending	in_progress	18	Iniciada tratativa financeira	2025-05-14 20:28:06.735755
987	366	in_progress	paid	18	Pagamento confirmado	2025-05-14 20:28:30.827906
988	355	pending	in_progress	18	Iniciada tratativa financeira	2025-05-14 20:29:54.128082
989	355	in_progress	paid	18	Pagamento confirmado	2025-05-14 20:30:06.131198
990	403		pending	9	Venda criada	2025-05-14 20:30:29.065589
991	367	pending	in_progress	18	Iniciada tratativa financeira	2025-05-14 20:32:12.698877
992	367	in_progress	paid	18	Pagamento confirmado	2025-05-14 20:32:31.483637
993	354	pending	in_progress	18	Iniciada tratativa financeira	2025-05-14 20:33:31.862267
994	354	in_progress	paid	18	Pagamento confirmado	2025-05-14 20:33:52.32654
995	353	pending	in_progress	18	Iniciada tratativa financeira	2025-05-14 20:35:18.779132
996	353	in_progress	paid	18	Pagamento confirmado	2025-05-14 20:35:31.548951
997	352	pending	in_progress	18	Iniciada tratativa financeira	2025-05-14 20:37:08.223383
998	352	in_progress	paid	18	Pagamento confirmado	2025-05-14 20:37:23.355631
999	351	pending	in_progress	18	Iniciada tratativa financeira	2025-05-14 20:39:26.124715
1000	351	in_progress	paid	18	Pagamento confirmado	2025-05-14 20:39:39.904028
1001	350	pending	in_progress	18	Iniciada tratativa financeira	2025-05-14 20:40:30.607882
1002	350	in_progress	paid	18	Pagamento confirmado	2025-05-14 20:40:47.839675
1003	349	pending	in_progress	18	Iniciada tratativa financeira	2025-05-14 20:42:26.372825
1004	349	in_progress	paid	18	Pagamento confirmado	2025-05-14 20:42:41.655203
1005	348	pending	in_progress	18	Iniciada tratativa financeira	2025-05-14 20:43:59.818188
1006	348	in_progress	paid	18	Pagamento confirmado	2025-05-14 20:44:11.945589
1007	404		pending	13	Venda criada	2025-05-14 20:53:12.961728
1008	347	pending	in_progress	18	Iniciada tratativa financeira	2025-05-14 20:53:36.708516
1009	347	in_progress	paid	18	Pagamento confirmado	2025-05-14 20:53:50.589434
1010	405		pending	14	Venda criada	2025-05-15 11:33:49.308819
\.


--
-- Data for Name: service_providers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.service_providers (id, name, document, document_type, contact_name, phone, phone2, email, address, active, created_at) FROM stdin;
1	MARIO	191.000.000-00	cpf		(11) 11111-11111		TESTE@TESTE.COM	\N	t	2025-05-02 14:08:47.862849
2	DULCE	690.753.200-00	cpf		(11) 11111-11111		teste@teste.com	\N	t	2025-05-05 13:23:02.669432
3	MICHELE	376.048.030-67	cpf		(11) 11111-11111		teste@teste.com	\N	t	2025-05-05 13:23:23.024127
\.


--
-- Data for Name: service_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.service_types (id, name, description, active, created_at) FROM stdin;
1	SINDICATO		t	2025-05-02 14:03:27.589923
2	CERTIFICADO DIGITAL		t	2025-05-02 14:03:37.303452
3	GOV		t	2025-05-05 13:13:35.754678
4	HABILITAÇÃO CERTIFICADO		t	2025-05-05 13:13:42.598754
5	OPERACIONAL	SERVIÇOS QUE NÃO VÃO PARA PAGAMENTO	t	2025-05-06 13:40:51.452829
\.


--
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.services (id, name, description, active, created_at) FROM stdin;
1	INCLUSÃO DE PLACA		t	1746194276
3	ATUALIZAÇÃO MERCOSUL		t	1746194276
4	2ª VIA CARTEIRINHA / EXTRATO		t	1746194276
5	ATUALIZAÇÃO CADASTRAL		t	1746194276
6	EXCLUSÃO DE PLACA		t	1746194276
7	REVALIDAÇÃO ORDINÁRIA		t	1746194276
8	ATUALIZAÇÃO PLACA REVALIDAÇÃO ORDINARIA		t	1746194276
9	CANCELAMENTO CADASTRO		t	1746194276
10	REATIVAÇÃO CADASTRAL		t	1746194276
11	CADASTRO TAF		t	1746194276
12	INCLUSÃO MOTORISTA TAF		t	1746194276
13	INCLUSÃO MOTORISTA AUXILIAR		t	1746194276
2	CADASTRO NOVO RNTRC		t	1746194276
14	CURSO MOPP NOVO		t	1746194276
15	CURSO MOPP RENOVAÇÃO		t	1746194276
16	CURSO CARGAS INDIVISIVEIS NOVO		t	1746194276
17	CURSO CARGA INDIVISIVEIS RENOVAÇÃO		t	1746194276
18	CURSO ESCOLAR NOVO		t	1746194276
19	CURSO ESCOLAR RENOVAÇÃO		t	1746194276
20	CURSO TRANSPORTE PASSAGEIROS NOVO		t	1746194276
21	CURSO TRANSPORTE PASSAGEIROS RENOVAÇÃO		t	1746194276
22	CURSO NR 20		t	1746194276
23	CURSO NR 35		t	1746194276
24	CADASTRO OTM		t	1746194276
25	EMISSÃO CERTIFICADO DIGITAL		t	1746194276
26	ASSESORIA EMISSÃO BOLETO MULTA		t	1746194276
27	AET FD		t	1746194276
28	AET PR		t	1746194276
29	AET SP		t	1746194276
30	AET SC		t	1746194276
31	AET MG		t	1746194276
32	AET MS		t	1746194276
33	AET MT		t	1746194276
34	AET GO		t	1746194276
35	AET PA		t	1746194276
36	AET BA		t	1746194276
37	AET PE		t	1746194276
38	AET RS		t	1746194276
39	AET ES		t	1746194276
40	AET RJ		t	1746194276
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.session (sid, sess, expire) FROM stdin;
KSG0PvE1uzCG7a7tgUsjbWy0dFB6FKCA	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-05T14:39:10.842Z","httpOnly":true,"path":"/"}}	2025-06-05 17:30:04
8m1lVFS1xTfD-DosQgDl5SRDxLHpXsAN	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-04T19:40:11.687Z","httpOnly":true,"path":"/"},"passport":{"user":15}}	2025-06-08 17:30:12
J7Jy3WpK3MvPWvuknZVH5YpeNv71J4TW	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-07T22:21:13.817Z","httpOnly":true,"path":"/"},"passport":{"user":1}}	2025-06-08 18:35:01
8KIq0FwHJSW7Z12tF2tFTbmq_TeW8ijq	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-07T12:44:31.279Z","httpOnly":true,"path":"/"},"passport":{"user":11}}	2025-06-07 13:19:54
Zsng81hzVqQOCkMfi-j-9_NK3D4qyYx5	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-05T17:14:40.224Z","httpOnly":true,"path":"/"},"passport":{"user":14}}	2025-06-05 17:18:53
IbOFm_MQyoYwzhvNTLqc40e2bJKcPj-s	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-05T13:39:39.602Z","httpOnly":true,"path":"/"},"passport":{"user":13}}	2025-06-08 21:12:01
zSRR9pYZrJY57wnhAlmSKXOuDNb6JVtQ	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-04T19:36:38.707Z","httpOnly":true,"path":"/"},"passport":{"user":14}}	2025-06-04 20:33:22
Jf_kwAFq3aeh3MSSFaYmxrCFBrDoPiRq	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-04T19:44:11.753Z","httpOnly":true,"path":"/"},"passport":{"user":9}}	2025-06-13 16:25:36
rm4cV7WJg1ui3m40DQYfTaAOnC7tAsOg	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-05T17:42:03.569Z","httpOnly":true,"path":"/"},"passport":{"user":12}}	2025-06-05 17:57:05
ffiXxECQeQVAUZ_o4ts26ztTE_CpmLml	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-05T15:40:40.620Z","httpOnly":true,"path":"/"},"passport":{"user":1}}	2025-06-05 16:13:47
an3HFuF_9GPy3lJJwYP2PrfLiAeh-XzE	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-04T19:37:36.789Z","httpOnly":true,"path":"/"},"passport":{"user":12}}	2025-06-08 17:13:29
lc59--B4yOBvYr9btOdu4kQlbYB_04Qy	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-04T20:23:12.455Z","httpOnly":true,"path":"/"}}	2025-06-04 21:14:10
UaBB8KYXbmIRxZhA_iJ-FWb_C_L8g-Yn	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-08T14:05:00.507Z","httpOnly":true,"path":"/"},"passport":{"user":15}}	2025-06-08 20:55:41
y70acxIJaLnZj2zvkDS11W7UV_ozHm0j	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-12T12:35:00.768Z","httpOnly":true,"path":"/"},"passport":{"user":16}}	2025-06-12 14:13:13
TbaHY2TU_rgODWdHOVMNg9oSGORZW12S	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-04T21:14:53.776Z","httpOnly":true,"path":"/"}}	2025-06-04 21:14:55
maMkLwkrkkXhu9YXHCmkQXnDLhYXya-C	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-12T17:11:05.729Z","httpOnly":true,"path":"/"},"passport":{"user":16}}	2025-06-12 20:56:22
2rojkhviHSiP0dx0gS-FxLBLfERTGkxT	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-04T19:50:36.174Z","httpOnly":true,"path":"/"},"passport":{"user":13}}	2025-06-12 14:04:56
EgEpBjlIXr02iLnknuXNN8IP5I-bA1OV	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-04T20:09:12.303Z","httpOnly":true,"path":"/"},"passport":{"user":11}}	2025-06-04 20:31:21
XU5fIM5pbcT5y8-rrpk8sL9_ahHwNDmo	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-13T18:06:58.417Z","httpOnly":true,"path":"/"},"passport":{"user":11}}	2025-06-14 11:30:51
QAhCXY8zaDDMilIAs12PBFu5flPnTCbW	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-01T21:25:22.348Z","httpOnly":true,"path":"/"},"passport":{"user":4}}	2025-06-01 21:31:26
BU5Rdi5gJltIPmWVzxSWOo60ZtO6p698	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-04T19:44:19.579Z","httpOnly":true,"path":"/"},"passport":{"user":11}}	2025-06-12 13:35:02
c8QbjVLavXbOforXXwIvMf3mHE5XGdEz	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-07T11:22:51.233Z","httpOnly":true,"path":"/"},"passport":{"user":15}}	2025-06-07 20:41:10
vNg4T5ZqGifsEx9xnaSuIAs7xX78Sd8k	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-08T13:37:55.608Z","httpOnly":true,"path":"/"},"passport":{"user":16}}	2025-06-08 14:21:08
DyLwMdvQT9Tv09_5w0blb_BF4EbejFnS	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-04T16:35:22.033Z","httpOnly":true,"path":"/"},"passport":{"user":1}}	2025-06-06 20:03:01
6twXUOR4LSClZmNV5Y_Y7jvlw7s5iCXs	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-04T19:49:58.695Z","httpOnly":true,"path":"/"},"passport":{"user":2}}	2025-06-04 21:07:36
gErg5yF-rSOuga6XG6nQnAvd54342ZY-	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-13T12:22:45.653Z","httpOnly":true,"path":"/"},"passport":{"user":13}}	2025-06-13 20:54:14
nxGXlObn5LTkklv9LbYLg7hcSG26TwJq	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-04T20:11:05.194Z","httpOnly":true,"path":"/"},"passport":{"user":12}}	2025-06-05 03:50:29
Fk6OfQ00UOVFb0eYj5ZVYqEsIk8_psRs	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-05T13:25:19.811Z","httpOnly":true,"path":"/"},"passport":{"user":16}}	2025-06-05 13:40:26
bBcx7Vfa_uFvTM-mhaz6JHFhsCqBxNHl	{"cookie":{"originalMaxAge":2591999999,"expires":"2025-06-05T20:50:43.194Z","httpOnly":true,"path":"/"},"passport":{"user":12}}	2025-06-05 20:59:48
raSGjCL8S-BthsX4uBcNcxr3GxAMq8VM	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-05T14:01:42.039Z","httpOnly":true,"path":"/"},"passport":{"user":15}}	2025-06-05 14:05:36
WFY6Khbm9oNDweBtoH8ZZLSEZqyujNGY	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-05T17:07:58.498Z","httpOnly":true,"path":"/"},"passport":{"user":11}}	2025-06-05 19:50:42
lu1sSemw7hB1O4q-52wGW2Q47tvBjtjH	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-06T13:59:00.044Z","httpOnly":true,"path":"/"},"passport":{"user":15}}	2025-06-06 20:46:39
jTLXJ_zQ3y-zZe0ZEmLqoNSvV9PP9Eae	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-06T14:38:13.890Z","httpOnly":true,"path":"/"},"passport":{"user":11}}	2025-06-06 14:48:53
a1dAHiL9xJOoWpP5EU9MacGK5ckujKRj	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-04T20:09:33.535Z","httpOnly":true,"path":"/"},"passport":{"user":15}}	2025-06-04 20:10:46
ot9CInhbdMHFx-VoEisK6Wj_mDDtOclr	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-13T17:51:46.551Z","httpOnly":true,"path":"/"},"passport":{"user":1}}	2025-06-14 11:38:56
JiD2CBS2o8qqkyKXRdzT9jrULqQd_bqY	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-12T19:04:18.571Z","httpOnly":true,"path":"/"},"passport":{"user":1}}	2025-06-15 11:53:55
xaXkgzbm54AObs1eK6JJa3QbbWI7oblQ	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-08T12:14:22.409Z","httpOnly":true,"path":"/"},"passport":{"user":12}}	2025-06-08 20:56:20
b0FjuijqLvAi-_5VxReVXh6ELKBJ2ft6	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-05T17:19:25.687Z","httpOnly":true,"path":"/"},"passport":{"user":14}}	2025-06-13 21:14:52
Fc1lJ_YwI6a52uU5sQNGDAnMMiiAukFR	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-14T11:29:28.346Z","httpOnly":true,"path":"/"},"passport":{"user":14}}	2025-06-14 11:35:23
GW-aaZATH7ImB_SEJZRihhNO6slcEucl	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-05T18:32:12.484Z","httpOnly":true,"path":"/"},"passport":{"user":17}}	2025-06-13 21:18:43
XlDJvFQz7ho0ayOHuPaN73HZxYSlj8ru	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-07T13:49:29.639Z","httpOnly":true,"path":"/"},"passport":{"user":11}}	2025-06-08 18:22:46
rtgVRRh_hXVsaJHD_4kBnjo8RS-GoEFl	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-05T14:40:50.971Z","httpOnly":true,"path":"/"},"passport":{"user":10}}	2025-06-08 17:11:49
zGeJLufz7jHnqakWo9vpt7JnN4n6i8_m	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-12T14:05:18.697Z","httpOnly":true,"path":"/"},"passport":{"user":13}}	2025-06-12 21:48:45
deTzp_zSfw3r8IfGue1n2HT3m_oLQwRk	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-12T13:22:18.868Z","httpOnly":true,"path":"/"},"passport":{"user":18}}	2025-06-14 11:08:06
tsl-Z28nzKJ32zkKa0n4iDoPIXsmEzck	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-12T18:12:32.039Z","httpOnly":true,"path":"/"},"passport":{"user":9}}	2025-06-12 21:48:45
-PxiF5UFz8BNVOvqY8yikV3MPS6e68xR	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-06T21:47:23.444Z","httpOnly":true,"path":"/"},"passport":{"user":1}}	2025-06-15 11:39:27
x_DBoFYAyRfa9TnZSWnxROlQu-aM1Vei	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-05T12:04:45.708Z","httpOnly":true,"path":"/"},"passport":{"user":7}}	2025-06-14 11:33:51
7WDUOfOKVNVDmKUjNnIb_gq6NZKLGhyn	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-04T19:30:25.782Z","httpOnly":true,"path":"/"},"passport":{"user":1}}	2025-06-14 11:33:51
AvV7EDWJukLyAvdp0mMo5uHUFdE-9iqI	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-04T20:32:13.283Z","httpOnly":true,"path":"/"},"passport":{"user":9}}	2025-06-08 21:12:00
tF4GTpMBDK4hyNqXhDz1dxivpSUYN6E8	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-04T19:57:39.047Z","httpOnly":true,"path":"/"},"passport":{"user":16}}	2025-06-12 14:32:27
vDzVSYO5PMMyuVDTYiQoSk7aEtXZLDn6	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-13T16:26:11.575Z","httpOnly":true,"path":"/"},"passport":{"user":9}}	2025-06-14 11:33:51
YhGE2pFJJIzvyoZ2_I-XCfQty5LzGCR0	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-12T13:38:21.842Z","httpOnly":true,"path":"/"},"passport":{"user":11}}	2025-06-12 14:36:17
ZFQNFrNCsmqiSR0uk825Gmk13owO0ukq	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-13T11:43:10.001Z","httpOnly":true,"path":"/"},"passport":{"user":15}}	2025-06-13 20:44:14
N2Jvt_4Wckla55w_2HMK8Zjt_Hg-1pxN	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-08T17:47:58.631Z","httpOnly":true,"path":"/"},"passport":{"user":16}}	2025-06-08 20:53:23
iqOYN4sezdByk-pn8S_3Zd_5H95yG9Xl	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-05T12:04:22.767Z","httpOnly":true,"path":"/"},"passport":{"user":8}}	2025-06-13 20:53:52
L7laLpMVLviLPcbiVeHkhJjzx-4dmQ9v	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-12T13:46:56.116Z","httpOnly":true,"path":"/"},"passport":{"user":10}}	2025-06-13 20:53:52
ARaotA-fHJ-s6mdnFWPi_kH0h-DRFzXd	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-13T14:29:45.282Z","httpOnly":true,"path":"/"},"passport":{"user":16}}	2025-06-13 20:53:52
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, username, password, role) FROM stdin;
2	vendedor	123456	vendedor
4	operacional	123456	operacional
3	financeiro	123456	financeiro
9	gustavo	gustavo123	vendedor
11	mathiely	mathiely123	vendedor
12	paola	paola123	vendedor
10	jessica santos	jessicasantos123	vendedor
13	larissa	larissa123	vendedor
14	luana	luana123	vendedor
15	jessica priscila	jessicapriscila123	vendedor
16	dafni	dafni123	vendedor
8	gelson	8b82d77a366d7c66d3d73c90a039c6501f7ad9ba716c765bacf319c520dddfc3fa0a7f6e26b8f415ec8a1eb3692da7bbe27a0cbaadd21204dd6508a2442ba6e9.69a0bb0d1f3a416f5fd69817eb7f7aa9	operacional
7	angelica	c373ef26836a4fa2e6a879f7ccda605d56a899b1066f4e02af4114809907397748a553d6b62eb451ed3101631423019716225d60d09929c5840b869addb45cb5.095556248aa9d212063ff13d5884ec5e	operacional
17	gabriel	gabriel123	operacional
18	jack	jack123	financeiro
19	thais	thais123	vendedor
5	supervisor	25cb3135ceb151f66445a6ef24c00b44c7edae3ba852327a764a2adb640c98684e44b28a6b52eed03abf0be17b2f8dcde5f2459b2a52928bd11437e85cba1778.c7c22531c71a748d8d3abfae01c37630	supervisor
1	admin	fa8e7bd4a7af435a6ac88fc3c8c39cdaca4260845dd676ae3f5c64da8dffac73a282fd9321ea88f86eeed00fac24c3eeded19e52498851e110818cebe3532a34.86ab43bf9364f906b7031b3fb0a7914c	admin
\.


--
-- Name: activity_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.activity_logs_id_seq', 3, true);


--
-- Name: cost_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.cost_types_id_seq', 8, true);


--
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.customers_id_seq', 298, true);


--
-- Name: debug_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.debug_logs_id_seq', 315, true);


--
-- Name: payment_methods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.payment_methods_id_seq', 3, true);


--
-- Name: report_executions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.report_executions_id_seq', 64, true);


--
-- Name: reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.reports_id_seq', 12, true);


--
-- Name: sale_installments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sale_installments_id_seq', 406, true);


--
-- Name: sale_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sale_items_id_seq', 451, true);


--
-- Name: sale_operational_costs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sale_operational_costs_id_seq', 137, true);


--
-- Name: sale_payment_receipts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sale_payment_receipts_id_seq', 219, true);


--
-- Name: sale_service_providers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sale_service_providers_id_seq', 142, true);


--
-- Name: sales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sales_id_seq', 405, true);


--
-- Name: sales_status_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sales_status_history_id_seq', 1010, true);


--
-- Name: service_providers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.service_providers_id_seq', 3, true);


--
-- Name: service_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.service_types_id_seq', 5, true);


--
-- Name: services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.services_id_seq', 40, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 19, true);


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: cost_types cost_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cost_types
    ADD CONSTRAINT cost_types_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: debug_logs debug_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.debug_logs
    ADD CONSTRAINT debug_logs_pkey PRIMARY KEY (id);


--
-- Name: payment_methods payment_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_pkey PRIMARY KEY (id);


--
-- Name: report_executions report_executions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_executions
    ADD CONSTRAINT report_executions_pkey PRIMARY KEY (id);


--
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- Name: sale_installments sale_installments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_installments
    ADD CONSTRAINT sale_installments_pkey PRIMARY KEY (id);


--
-- Name: sale_items sale_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_pkey PRIMARY KEY (id);


--
-- Name: sale_operational_costs sale_operational_costs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_operational_costs
    ADD CONSTRAINT sale_operational_costs_pkey PRIMARY KEY (id);


--
-- Name: sale_payment_receipts sale_payment_receipts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_payment_receipts
    ADD CONSTRAINT sale_payment_receipts_pkey PRIMARY KEY (id);


--
-- Name: sale_service_providers sale_service_providers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_service_providers
    ADD CONSTRAINT sale_service_providers_pkey PRIMARY KEY (id);


--
-- Name: sales sales_order_number_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_order_number_unique UNIQUE (order_number);


--
-- Name: sales sales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_pkey PRIMARY KEY (id);


--
-- Name: sales_status_history sales_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_status_history
    ADD CONSTRAINT sales_status_history_pkey PRIMARY KEY (id);


--
-- Name: service_providers service_providers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_providers
    ADD CONSTRAINT service_providers_pkey PRIMARY KEY (id);


--
-- Name: service_types service_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_types
    ADD CONSTRAINT service_types_pkey PRIMARY KEY (id);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: activity_logs activity_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: customers customers_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: report_executions report_executions_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_executions
    ADD CONSTRAINT report_executions_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.reports(id);


--
-- Name: report_executions report_executions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_executions
    ADD CONSTRAINT report_executions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: reports reports_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: sale_installments sale_installments_payment_method_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_installments
    ADD CONSTRAINT sale_installments_payment_method_id_fkey FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id);


--
-- Name: sale_installments sale_installments_sale_id_sales_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_installments
    ADD CONSTRAINT sale_installments_sale_id_sales_id_fk FOREIGN KEY (sale_id) REFERENCES public.sales(id);


--
-- Name: sale_items sale_items_sale_id_sales_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_sale_id_sales_id_fk FOREIGN KEY (sale_id) REFERENCES public.sales(id);


--
-- Name: sale_items sale_items_service_id_services_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_service_id_services_id_fk FOREIGN KEY (service_id) REFERENCES public.services(id);


--
-- Name: sale_items sale_items_service_type_id_service_types_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_service_type_id_service_types_id_fk FOREIGN KEY (service_type_id) REFERENCES public.service_types(id);


--
-- Name: sale_operational_costs sale_operational_costs_cost_type_id_cost_types_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_operational_costs
    ADD CONSTRAINT sale_operational_costs_cost_type_id_cost_types_id_fk FOREIGN KEY (cost_type_id) REFERENCES public.cost_types(id);


--
-- Name: sale_operational_costs sale_operational_costs_responsible_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_operational_costs
    ADD CONSTRAINT sale_operational_costs_responsible_id_users_id_fk FOREIGN KEY (responsible_id) REFERENCES public.users(id);


--
-- Name: sale_operational_costs sale_operational_costs_sale_id_sales_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_operational_costs
    ADD CONSTRAINT sale_operational_costs_sale_id_sales_id_fk FOREIGN KEY (sale_id) REFERENCES public.sales(id);


--
-- Name: sale_operational_costs sale_operational_costs_service_provider_id_service_providers_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_operational_costs
    ADD CONSTRAINT sale_operational_costs_service_provider_id_service_providers_id FOREIGN KEY (service_provider_id) REFERENCES public.service_providers(id);


--
-- Name: sale_payment_receipts sale_payment_receipts_confirmed_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_payment_receipts
    ADD CONSTRAINT sale_payment_receipts_confirmed_by_users_id_fk FOREIGN KEY (confirmed_by) REFERENCES public.users(id);


--
-- Name: sale_payment_receipts sale_payment_receipts_installment_id_sale_installments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_payment_receipts
    ADD CONSTRAINT sale_payment_receipts_installment_id_sale_installments_id_fk FOREIGN KEY (installment_id) REFERENCES public.sale_installments(id);


--
-- Name: sale_service_providers sale_service_providers_sale_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_service_providers
    ADD CONSTRAINT sale_service_providers_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id) ON DELETE CASCADE;


--
-- Name: sale_service_providers sale_service_providers_service_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_service_providers
    ADD CONSTRAINT sale_service_providers_service_provider_id_fkey FOREIGN KEY (service_provider_id) REFERENCES public.service_providers(id);


--
-- Name: sales sales_customer_id_customers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_customer_id_customers_id_fk FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: sales sales_payment_method_id_payment_methods_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_payment_method_id_payment_methods_id_fk FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id);


--
-- Name: sales sales_responsible_financial_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_responsible_financial_id_users_id_fk FOREIGN KEY (responsible_financial_id) REFERENCES public.users(id);


--
-- Name: sales sales_responsible_operational_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_responsible_operational_id_users_id_fk FOREIGN KEY (responsible_operational_id) REFERENCES public.users(id);


--
-- Name: sales sales_seller_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_seller_id_users_id_fk FOREIGN KEY (seller_id) REFERENCES public.users(id);


--
-- Name: sales sales_service_provider_id_service_providers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_service_provider_id_service_providers_id_fk FOREIGN KEY (service_provider_id) REFERENCES public.service_providers(id);


--
-- Name: sales sales_service_type_id_service_types_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_service_type_id_service_types_id_fk FOREIGN KEY (service_type_id) REFERENCES public.service_types(id);


--
-- Name: sales_status_history sales_status_history_sale_id_sales_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_status_history
    ADD CONSTRAINT sales_status_history_sale_id_sales_id_fk FOREIGN KEY (sale_id) REFERENCES public.sales(id);


--
-- Name: sales_status_history sales_status_history_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_status_history
    ADD CONSTRAINT sales_status_history_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

