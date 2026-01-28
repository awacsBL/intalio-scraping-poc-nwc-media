--
-- PostgreSQL database dump
--

\restrict A4aVifjaFf57mVMgqr61ZGFSy3oWqOSTMg1ZqqgSbLo1g75eOLGI0dskeQGZlbO

-- Dumped from database version 15.15 (Debian 15.15-1.pgdg13+1)
-- Dumped by pg_dump version 15.15 (Debian 15.15-1.pgdg13+1)

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
-- Name: comments; Type: TABLE; Schema: public; Owner: flynas
--

CREATE TABLE public.comments (
    id integer NOT NULL,
    comment_id character varying NOT NULL,
    post_id integer NOT NULL,
    comment_text text NOT NULL,
    owner_username character varying,
    owner_id character varying,
    likes_count integer,
    "timestamp" timestamp without time zone,
    collected_at timestamp without time zone,
    ai_results json
);


ALTER TABLE public.comments OWNER TO flynas;

--
-- Name: comments_id_seq; Type: SEQUENCE; Schema: public; Owner: flynas
--

CREATE SEQUENCE public.comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.comments_id_seq OWNER TO flynas;

--
-- Name: comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: flynas
--

ALTER SEQUENCE public.comments_id_seq OWNED BY public.comments.id;


--
-- Name: posts; Type: TABLE; Schema: public; Owner: flynas
--

CREATE TABLE public.posts (
    id integer NOT NULL,
    post_id character varying NOT NULL,
    shortcode character varying,
    post_url character varying,
    owner_username character varying,
    owner_id character varying,
    caption text,
    post_type character varying,
    likes_count integer,
    comments_count integer,
    "timestamp" timestamp without time zone,
    collected_at timestamp without time zone,
    source character varying,
    ai_results json
);


ALTER TABLE public.posts OWNER TO flynas;

--
-- Name: posts_id_seq; Type: SEQUENCE; Schema: public; Owner: flynas
--

CREATE SEQUENCE public.posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.posts_id_seq OWNER TO flynas;

--
-- Name: posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: flynas
--

ALTER SEQUENCE public.posts_id_seq OWNED BY public.posts.id;


--
-- Name: target_hashtags; Type: TABLE; Schema: public; Owner: flynas
--

CREATE TABLE public.target_hashtags (
    id integer NOT NULL,
    hashtag character varying NOT NULL,
    post_count integer,
    is_active boolean,
    added_at timestamp without time zone,
    last_scraped_at timestamp without time zone,
    notes text,
    tags json
);


ALTER TABLE public.target_hashtags OWNER TO flynas;

--
-- Name: target_hashtags_id_seq; Type: SEQUENCE; Schema: public; Owner: flynas
--

CREATE SEQUENCE public.target_hashtags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.target_hashtags_id_seq OWNER TO flynas;

--
-- Name: target_hashtags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: flynas
--

ALTER SEQUENCE public.target_hashtags_id_seq OWNED BY public.target_hashtags.id;


--
-- Name: target_places; Type: TABLE; Schema: public; Owner: flynas
--

CREATE TABLE public.target_places (
    id integer NOT NULL,
    place_name character varying NOT NULL,
    place_id character varying NOT NULL,
    city character varying,
    country character varying,
    latitude character varying,
    longitude character varying,
    post_count integer,
    is_active boolean,
    added_at timestamp without time zone,
    last_scraped_at timestamp without time zone,
    notes text,
    tags json
);


ALTER TABLE public.target_places OWNER TO flynas;

--
-- Name: target_places_id_seq; Type: SEQUENCE; Schema: public; Owner: flynas
--

CREATE SEQUENCE public.target_places_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.target_places_id_seq OWNER TO flynas;

--
-- Name: target_places_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: flynas
--

ALTER SEQUENCE public.target_places_id_seq OWNED BY public.target_places.id;


--
-- Name: target_users; Type: TABLE; Schema: public; Owner: flynas
--

CREATE TABLE public.target_users (
    id integer NOT NULL,
    username character varying NOT NULL,
    user_id character varying,
    display_name character varying,
    profile_url character varying,
    follower_count integer,
    is_verified boolean,
    is_active boolean,
    added_at timestamp without time zone,
    last_scraped_at timestamp without time zone,
    notes text,
    tags json
);


ALTER TABLE public.target_users OWNER TO flynas;

--
-- Name: target_users_id_seq; Type: SEQUENCE; Schema: public; Owner: flynas
--

CREATE SEQUENCE public.target_users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.target_users_id_seq OWNER TO flynas;

--
-- Name: target_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: flynas
--

ALTER SEQUENCE public.target_users_id_seq OWNED BY public.target_users.id;


--
-- Name: comments id; Type: DEFAULT; Schema: public; Owner: flynas
--

ALTER TABLE ONLY public.comments ALTER COLUMN id SET DEFAULT nextval('public.comments_id_seq'::regclass);


--
-- Name: posts id; Type: DEFAULT; Schema: public; Owner: flynas
--

ALTER TABLE ONLY public.posts ALTER COLUMN id SET DEFAULT nextval('public.posts_id_seq'::regclass);


--
-- Name: target_hashtags id; Type: DEFAULT; Schema: public; Owner: flynas
--

ALTER TABLE ONLY public.target_hashtags ALTER COLUMN id SET DEFAULT nextval('public.target_hashtags_id_seq'::regclass);


--
-- Name: target_places id; Type: DEFAULT; Schema: public; Owner: flynas
--

ALTER TABLE ONLY public.target_places ALTER COLUMN id SET DEFAULT nextval('public.target_places_id_seq'::regclass);


--
-- Name: target_users id; Type: DEFAULT; Schema: public; Owner: flynas
--

ALTER TABLE ONLY public.target_users ALTER COLUMN id SET DEFAULT nextval('public.target_users_id_seq'::regclass);


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: flynas
--

COPY public.comments (id, comment_id, post_id, comment_text, owner_username, owner_id, likes_count, "timestamp", collected_at, ai_results) FROM stdin;
1	18073675304608369	71	جزاكم الله خيرا ❤️	khalidfares_	\N	2	2025-12-15 15:08:05	\N	\N
2	17954729385029247	71	جزاك الله خيرا شيخنا الحبيب ❤️	isa.alabdulla	\N	2	2025-12-15 14:47:47	\N	\N
3	18089685293303354	71	اللهم آمين يارب العالمين يرزقني بها آميين يارب العالمين 🕋🇸🇦🕋🤲🏻	kamardjawhara	\N	1	2025-12-15 15:26:52	\N	\N
4	18050150942692907	71	ـ┓━━━🕌🕋🕌━━━┏ ـ \nأللَّهُمَ‌ صَلِ ‌عَلَى ‌مُحَمَّد ‌وَعَلَی ‌آلِ‌ مُحَمَّدٍ‌‎ \n ـ┛━━━🕌🕋🕌━━━┗ ـ	quran_karem.0_	\N	1	2025-12-15 16:11:46	\N	\N
5	18399738580131735	71	اللهم إنَ نسألك عمره قريبة 🤲🏼	shifaa__alsudur	\N	17	2025-12-15 14:49:39	\N	\N
6	17864651862457632	71	يارب عمره قريبه 🤲🏻	danyahehsan	\N	1	2025-12-15 20:27:42	\N	\N
7	18149218804389352	71	‏ربّ إني لما أنزلت إليّ من خير فقير\nربّ لا تذرني فرداً وأنت خير الوارثين\nربّ إني مسني الضر وأنت أرحم الراحمين\nربّ إني مغلوب فانتصر\nربّ اشرح لي صدري ويسرلي أمري \nربّ إني ظلمت نفسي فاغفرلي\nربّ أعوذ بك من همزات الشياطين\nربّ اجعلني مقيم الصلاة ومن ذريتي ربنا وتقبل دعاء	fa.a.2025	\N	1	2025-12-15 15:35:59	\N	\N
8	17966650601847206	71	والله العضيم اني ما تكلمت الا من الجوع !!!!! والفقر وضيق الحال حسبنا الله ونعم الوكيل في من اوصلنا الى هاذا الحال انا اختكم من اليمن نازحين انا واسرتي بيتنا ايجار الشهرب 20 الف يمني والان علينا 60 الف حق 3 شهور وصاحب البيت من الناس الي ماترحم والله يا اخي انه يجي كل يوم يبهذلنا ويتكلم علينا ويريد يخرجنا من البيت للشارع لاننا ما قدرنا ندفعله الأجار شافونا الجيران نبكي ورجعو تكلمو الجيران ومهلنا الاخر الأسبوع اذا مادفعنا له حلف يمين بالله بيخرجنا إلى الشارع بلا رحمه وحنا لا يوجد معانا قوت يومنا وعايشين انا وامي واخوتي سغار والدنا متوفي الله يرحمه وما معنا أحد في هذا الدنيا يوقف جا انبنا في هذه الظروف القاسيه اخوتي الصغار خرجو للشارع وشافو الجيران ياكلو واوقفو عند بابهم لجل يعطوهم ولو كسره خبز والله الذي له ملك السموات والارض انهم غلقو الباب وطردوهم ورجعو يبكو من القهر والجوع ما احد رحمهم والان لوما احدنا ساعدنا حتا قیمت كيلو دقيق اقسم بالله انحنانموت من الجوع انا داخله على الله ثم عليك واريد منك المساعده لوجه الله انشدك بالله يا من تحب الخير انك تراسلني وتساعدني ولو بشي بسيط نقضي به حاجتنا الله يعوضك خير منها هذا رقمي واتساب فرج همنا الله يفرج همك دنيا واخره 967713996987+ اسالك بالله يا من لك القدره ان تساعدنا راسلني واتساب وتطلب اسم بطاقتي وتساعدنا بلذي تقدرعليه الله يفرج عنك كرب الدنياوالاخره 😢😢😢😢😢😢	ttttttttttttttruy	\N	2	2025-12-15 14:51:41	\N	\N
9	17951745534020006	60	🙌🙌🙌	thebnashop	\N	1	2025-12-15 14:51:50	\N	\N
10	18010222634648642	29	😍	_muhammed_favascp_	\N	2	2025-12-11 18:48:42	\N	\N
11	17994613874856810	29	😎	__ayza__.__rin__	\N	3	2025-12-10 14:21:29	\N	\N
12	17869693317486351	29	❤️	_rina_a______	\N	3	2025-12-10 11:13:21	\N	\N
13	17982652595930329	61	🤠 Let’s go!!	passionatepattens	\N	1	2025-12-14 22:29:38	\N	\N
14	17892686484372593	61	I could come visit so often @karaegould	halimariesills	\N	1	2025-12-14 17:58:13	\N	\N
15	17967162077990919	61	@redeyez629	predsbsn72	\N	1	2025-12-14 18:34:52	\N	\N
16	18087754211290596	61	@julie.l.petty ✈️❄️✈️❄️😁	dependabledale	\N	1	2025-12-15 01:37:37	\N	\N
17	18250749283291247	61	@hannnnnah27 would be so fun!	bridgett.hennessy	\N	1	2025-12-14 18:55:58	\N	\N
18	18076907513248244	61	Fun! 😍	casey_j_lee	\N	1	2025-12-14 18:48:28	\N	\N
19	17972830505814087	61	@cayleighshepherd	theofficiallogie_t	\N	1	2025-12-14 23:48:08	\N	\N
20	17904577686324336	61	@allywiegandauthor Texas trip needed asap!!! 👏🏼🤠	sydney.annemarie	\N	1	2025-12-14 19:17:44	\N	\N
21	18012239267647587	61	@sheenaecregan	annsnarr	\N	1	2025-12-15 13:46:51	\N	\N
22	18185217142348251	61	@erikthurza	devlyn	\N	1	2025-12-15 13:05:08	\N	\N
23	18114577669602173	63	@courtneyives 🇨🇦	jenburns70	\N	1	2025-12-13 01:44:51	\N	\N
24	17869405014420715	63	@jmcamp86 🇨🇦	justalexandra	\N	1	2025-12-13 05:18:14	\N	\N
25	18034793006735744	63	@kaitlyn.snelling.napier	sarah_dan	\N	1	2025-12-12 20:12:10	\N	\N
26	18317624170222502	63	@imryanjohnson	mrsgingerjohnson	\N	1	2025-12-12 21:17:24	\N	\N
27	18121193845551337	63	@atbuckner21	ayla.mae3	\N	1	2025-12-13 13:01:01	\N	\N
28	18085622989844835	63	@redeyez629	scoutthetherapydoodle	\N	1	2025-12-13 22:27:19	\N	\N
29	18076030034005958	63	@hari8rattan	carolineeatherly	\N	1	2025-12-14 18:38:19	\N	\N
30	18096183466883637	63	Montreal would be a dream. Girls getaway @realcountryinnash?	hello_mads	\N	1	2025-12-13 14:18:19	\N	\N
31	18399825571120030	63	@_ashlee_ramsey_	sdaniels53	\N	1	2025-12-15 20:24:12	\N	\N
32	17990939597740560	63	🇨🇦😍	casey_j_lee	\N	1	2025-12-16 01:04:37	\N	\N
33	18106983295567568	65	@simonjward22	rachelsiegman	\N	0	2025-12-11 22:15:55	\N	\N
34	18076665686220418	65	Are you from TN? “Bc you’re the only TEN I SEE! 😍 @kelseyann1015	dylangearhart	\N	1	2025-12-11 01:47:44	\N	\N
35	18089285635780149	59	@_ashlee_ramsey_	shmemebaker	\N	1	2025-12-15 19:39:48	\N	\N
36	18087228997961504	59	@cayleighshepherd	theofficiallogie_t	\N	1	2025-12-15 19:36:03	\N	\N
37	17920267239071663	59	So fun! Want to see more of the US!	fox835	\N	1	2025-12-16 01:02:45	\N	\N
38	17953570182026767	59	@julie.l.petty	dependabledale	\N	1	2025-12-15 21:56:26	\N	\N
39	18067816334528067	59	@shear.elegancewv	murskisisters	\N	1	2025-12-15 19:37:59	\N	\N
40	18115655728514730	59	Ooh, I have a few on my list! 😍	casey_j_lee	\N	1	2025-12-15 20:47:13	\N	\N
41	17916604725235407	59	🛩 Ready!	casey_j_lee	\N	1	2025-12-16 01:05:51	\N	\N
42	17930461332119030	64	@honeybunchesofaryn	carolineeatherly	\N	1	2025-12-12 10:54:02	\N	\N
43	18212757868313226	64	@matthew_strickland_	carolineeatherly	\N	1	2025-12-12 10:53:20	\N	\N
44	17851429452599229	64	Our 1st wedding anniversary is coming up and we’ve both never been to Europe!! 😮	kierstentho	\N	4	2025-12-11 18:06:49	\N	\N
45	18095750470941839	64	@carolineeatherly 🇮🇪🇮🇪	eleanor_bridg4	\N	1	2025-12-12 15:30:56	\N	\N
46	17871447276396756	64	@juliesoldner	carolineeatherly	\N	1	2025-12-12 10:53:47	\N	\N
47	18177717151369077	64	@alex_gaughan	justjackrealtor	\N	2	2025-12-12 14:59:33	\N	\N
48	18103726642679649	64	Would love this !!!!❤️❤️	carolineeatherly	\N	1	2025-12-12 10:52:49	\N	\N
49	18083878298026966	64	I’d love to go to any of these cities!	heathmacd	\N	1	2025-12-12 05:31:37	\N	\N
50	18520685071064741	64	I'll take one of each please 😂	aljcostumes	\N	2	2025-12-12 13:53:15	\N	\N
51	18063253907203553	64	Me too @heathmacd 🤣	darcynorth	\N	1	2025-12-14 01:10:09	\N	\N
52	18078460528976494	95	💞💞💞	mergul__satbayeva	\N	0	2025-12-14 07:41:09	\N	\N
53	18120336109542595	95	😍😍😍	aigul_adepbai	\N	0	2025-12-14 07:32:04	\N	\N
54	18086834228070224	95	❤️	aigerim.bahytkyzy	\N	0	2025-12-14 11:22:51	\N	\N
55	18066438425161876	95	😍😍😍😍	meirim.baltabay	\N	0	2025-12-14 08:16:15	\N	\N
56	18074247089463197	95	😍😍😍😍	medet__satbayev	\N	0	2025-12-14 07:05:30	\N	\N
57	18096783577843399	95	❤️❤️❤️❤️	medet__satbayev	\N	0	2025-12-14 07:05:32	\N	\N
58	18089054539958124	95	🔥🔥🔥	shukirbaevasaule	\N	0	2025-12-15 10:23:02	\N	\N
59	18086658922989865	95	Спасибо за то что , ты всем нам дала эту смелость) и новую уверенность в завтрашнем дне без тревожности, без суеты) да у нас пока нет больших доходов как раньше, но какое есть внутреннее спокойствие и счастье от сегодняшнего дня, и солнце в завтрашнем дне! Это такое счастье, не гонять тараканов по голове, не разговаривать с собой сутками, а просто жить и делиться с людьми действительно что тебе нравится и дорого❤️	kemenova.energy	\N	2	2025-12-14 07:18:45	\N	\N
60	17849305470610311	16	Yummy	foodandfashinnash	\N	0	2025-12-13 18:47:42	\N	\N
61	18051063755692583	100	🔥🔥🔥	viktoriazonenko13	\N	0	2025-12-10 17:08:17	\N	\N
62	18438857563098999	100	🔥🔥🔥	zarushka__	\N	0	2025-12-10 16:28:04	\N	\N
63	18079311494332041	100	🙌🙌🙌	elmiraa_tlekkyzy	\N	0	2025-12-10 21:08:29	\N	\N
64	17865901779530590	100	🔥🔥🔥	shukirbaevasaule	\N	0	2025-12-11 09:00:15	\N	\N
65	18059685944277806	100	❤️❤️❤️	rimmayerkenova	\N	0	2025-12-10 16:23:11	\N	\N
66	17864592666455665	100	Сыйлық	_aigul_82	\N	0	2025-12-15 00:00:33	\N	\N
67	17956064354901457	94	😍😍😍😍	didar_satayeva	\N	0	2025-12-14 18:32:38	\N	\N
68	17963851872007842	94	😍😍😍	merey_asylbekovna	\N	0	2025-12-14 16:24:52	\N	\N
69	17856148887579468	94	😍😍😍😍	elmiraa_tlekkyzy	\N	0	2025-12-15 10:00:25	\N	\N
70	18099094876834122	94	😍😍😍	aigul_adepbai	\N	0	2025-12-15 07:25:56	\N	\N
71	18075404207009942	94	🔥🔥🔥	ai__naim	\N	0	2025-12-14 17:37:38	\N	\N
72	17963172782865304	94	😍😍😍	aidanamrenova	\N	0	2025-12-14 18:20:18	\N	\N
73	17869980561482027	94	😍😍😍	diva_tonuss	\N	0	2025-12-14 16:34:07	\N	\N
74	18095791843891315	94	🔥🔥🔥🔥	nazira_arystan1960	\N	0	2025-12-15 08:30:32	\N	\N
75	17925447276188012	94	😍😍😍😍	gulnaz.alibekkyzy	\N	0	2025-12-14 16:38:06	\N	\N
76	18063670853543988	94	❤️❤️❤️	asel_sultangazina	\N	0	2025-12-14 17:19:02	\N	\N
77	17926990419036129	97	👏😍🔥	s.ayperi	\N	0	2025-12-13 07:19:20	\N	\N
78	18080633354515545	97	😍😍😍🔥🔥🔥	gulim_yerdimbek	\N	0	2025-12-13 07:56:37	\N	\N
79	18032640236541311	97	🔥🔥🔥🔥😍	saltanat_daut_	\N	0	2025-12-13 10:05:23	\N	\N
80	17987197430873538	97	😍😍😍😍😍	meirim.baltabay	\N	0	2025-12-13 06:48:13	\N	\N
81	18098947525834758	97	😍😍😍	ai__naim	\N	0	2025-12-13 06:57:56	\N	\N
82	18083322754886527	97	😍😍😍😍	aigul_adepbai	\N	0	2025-12-13 09:14:41	\N	\N
83	17954118312025953	97	🔥🔥🔥🔥🔥🔥🔥	saule_yegetay	\N	0	2025-12-13 09:54:39	\N	\N
84	17989792166745859	97	😍😍😍😍	manara_syzdykova	\N	0	2025-12-13 07:06:44	\N	\N
85	18069254600454849	97	🔥🔥🔥	merey_asylbekovna	\N	0	2025-12-13 12:10:06	\N	\N
86	17917724277231860	97	🔥🔥🔥🔥	sabina.xudeybezdiet	\N	0	2025-12-13 06:20:32	\N	\N
87	18032311307759670	8	Aik bat mujhai bhi gift karday please	itx_sameeer._	\N	0	2025-12-14 07:49:03	\N	\N
88	17908901595277346	84	🔥	yousefabujazar2	\N	0	2025-12-14 16:47:09	\N	\N
89	17907052812141757	84	Flynas Customer Relations — your website listed my 14 Dec Nairobi departure as Terminal 1C, but the flight actually departed from Terminal 1A. Because of this incorrect information, I missed the flight. This was entirely due to Flynas’ error, not passenger fault.\n\nI require:\n\t1.\tWritten confirmation that the flight departed from Terminal 1A (for Trip.com compensation), and\n\t2.\tConfirmation that my remaining Amman–Nairobi segment on 26/27 Dec will be honored with no penalty.\n\nBooking ID: PCZRFJ. Please respond within 48 hours or I will escalate to aviation authorities	yutoloh	\N	0	2025-12-14 05:08:37	\N	\N
90	18076419701211905	84	I am deeply frustrated regarding an incident I had today that resulted to miss my flight to Georgia. I request an urgent investigation and appropriately action regarding the conduct of flynas representative and the subsequent lack of assistance from flynas team and supervisor. The flynas supervisor at King Abdulaziz Airport Jeddah was very rude to us , extremely disrespectful and very unprofessional. We Recieved the boarding pass but wasn’t allowed to fly due to the procedural delay by the flynas representative .	sana.shihabb	\N	0	2025-12-13 09:25:36	\N	\N
91	18144134926445745	84	PLEASE RESPOND, MY LUGGAGE WAS LOST ON A FLYNAS FLIGHT. IT'S BEEN 6 WEEKS AND THERE'S BEEN NO RESPONSE FROM YOU.	fikramnursyawal	\N	0	2025-12-14 11:48:17	\N	\N
92	18061455530258971	84	Worst airlines ever..very poor customer service	sana.shihabb	\N	0	2025-12-15 18:50:55	\N	\N
93	18102860125776719	62	🥇✈️🏃‍♂️	jadon_frederick	\N	0	2025-12-13 19:17:33	\N	\N
94	17906170326151161	62	Woot!! @darnellcolemusic I could come see you!!!	hearmetravel	\N	1	2025-12-14 09:44:14	\N	\N
95	18085379438088596	7		eurambler	\N	1	2025-12-14 13:58:55	\N	\N
96	18063127481539605	7	Great! 👏	planespotting.747	\N	1	2025-12-14 06:44:53	\N	\N
97	17931197112011946	99	😍😍😍	janisbek_elmira	\N	0	2025-12-10 17:38:51	\N	\N
98	17934637704104771	99	😍😍😍	meirim.baltabay	\N	0	2025-12-10 15:51:53	\N	\N
99	18153180370422654	99	😍😍😍😍	elmiraa_tlekkyzy	\N	0	2025-12-10 15:44:31	\N	\N
100	18195725428335496	99	🔥🔥🔥	bekbaevagulsim1960	\N	0	2025-12-10 17:35:33	\N	\N
101	18062722607206667	99	😍😍😍😍😍	zhaina_uzdenbayeva	\N	0	2025-12-10 15:54:21	\N	\N
102	17991261050863143	99	🔥🔥🔥🔥	elmiraa_tlekkyzy	\N	0	2025-12-10 15:44:32	\N	\N
103	17851917117598736	99	👏👏👏	adilet__satbayev	\N	0	2025-12-10 17:07:49	\N	\N
104	18077498486219145	99	😍😍😍😍😍👏	zhanat_shoshakhova	\N	0	2025-12-10 15:45:17	\N	\N
105	18072220853073529	99	😍😍😍😍	asiiakizatova	\N	0	2025-12-11 03:46:38	\N	\N
106	18052681763678671	99	❤️❤️❤️❤️❤️	elmiraa_tlekkyzy	\N	0	2025-12-10 15:44:36	\N	\N
107	18053004299352286	96	❤️❤️❤️	rimmayerkenova	\N	0	2025-12-13 13:33:30	\N	\N
108	17903149989317226	83	@hanane_blh1 😍	maria_ra233	\N	3	2025-12-13 20:18:18	\N	\N
109	17916703935228568	83	🙌🙌	tala_jandali	\N	1	2025-12-14 06:56:50	\N	\N
110	18299402920286153	83	😍😍	mohammed_mustkim_11	\N	1	2025-12-13 19:42:52	\N	\N
111	18084543500038489	83	😍😍😍😍😍	qater_ennada_	\N	1	2025-12-14 11:57:02	\N	\N
112	17920371204209750	83	❤️	shifa.tour	\N	1	2025-12-13 19:53:34	\N	\N
113	17945461845089907	83	❤️	brave1832	\N	1	2025-12-14 11:50:55	\N	\N
114	18106706281657161	83	You are all beautiful❤️and the most beautiful thing about you is your innocence🥰May God protect you	wasmel6	\N	2	2025-12-14 06:35:06	\N	\N
115	18069916697383252	83	@hanane_blh1 ❤️❤️💪🏻💪🏻😘😘	xx_m_i_l_i_xx	\N	1	2025-12-14 06:15:52	\N	\N
116	18545171053038669	83	The kindest and most wonderful and beautiful flight attendant you have😍 god bless you dear @hanane_blh1	alaa_bijoux_	\N	3	2025-12-13 21:00:14	\N	\N
117	17934598017132898	83	So proud of you You truly shine in the sky ❤️❤️❤️	fadila___sahraoui	\N	1	2025-12-14 07:57:30	\N	\N
\.


--
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: flynas
--

COPY public.posts (id, post_id, shortcode, post_url, owner_username, owner_id, caption, post_type, likes_count, comments_count, "timestamp", collected_at, source, ai_results) FROM stdin;
1	3788078867635018642	DSR9aj2jJuS	https://www.instagram.com/p/DSR9aj2jJuS/	worldtripdeal	49661807690	𝑨𝒏𝒐𝒕𝒉𝒆𝒓 𝒉𝒂𝒑𝒑𝒚 𝒓𝒆𝒕𝒖𝒓𝒏𝒊𝒏𝒈 𝒄𝒍𝒊𝒆𝒏𝒕, 𝒂𝒏𝒅 𝒘𝒆 𝒄𝒐𝒖𝒍𝒅𝒏’𝒕 𝒃𝒆 𝒑𝒓𝒐𝒖𝒅𝒆𝒓.\n𝑻𝒉𝒆𝒓𝒆’𝒔 𝒏𝒐𝒕𝒉𝒊𝒏𝒈 𝒃𝒆𝒕𝒕𝒆𝒓 𝒕𝒉𝒂𝒏 𝒔𝒆𝒆𝒊𝒏𝒈 𝒐𝒖𝒓 𝒄𝒍𝒊𝒆𝒏𝒕𝒔 𝒄𝒐𝒎𝒆 𝒃𝒂𝒄𝒌 𝒔𝒂𝒕𝒊𝒔𝒇𝒊𝒆𝒅, 𝒄𝒐𝒏𝒇𝒊𝒅𝒆𝒏𝒕, 𝒂𝒏𝒅 𝒓𝒆𝒂𝒅𝒚 𝒇𝒐𝒓 𝒕𝒉𝒆𝒊𝒓 𝒏𝒆𝒙𝒕 𝒋𝒐𝒖𝒓𝒏𝒆𝒚. 𝑻𝒉𝒂𝒏𝒌 𝒚𝒐𝒖 𝒇𝒐𝒓 𝒕𝒓𝒖𝒔𝒕𝒊𝒏𝒈 𝒖𝒔 𝒂𝒈𝒂𝒊𝒏  𝒂𝒏𝒅 𝒕𝒉𝒊𝒔 𝒊𝒔 𝒘𝒉𝒚 𝒘𝒆’𝒓𝒆 𝒑𝒂𝒔𝒔𝒊𝒐𝒏𝒂𝒕𝒆 𝒂𝒃𝒐𝒖𝒕 𝒘𝒉𝒂𝒕 𝒘𝒆 𝒅𝒐. \n📍𝐆e𝐨r𝐠i𝐚\n📌𝐏𝐨𝐬𝐭𝐞𝐝 𝐰𝐢𝐭𝐡 𝐟𝐮𝐥𝐥 𝐜𝐨𝐧𝐬𝐞𝐧𝐭 𝐟𝐫𝐨𝐦 𝐭𝐡𝐞 𝐩𝐞𝐫𝐬𝐨𝐧 𝐟𝐞𝐚𝐭𝐮𝐫𝐞𝐝.\n\n#emirates #rebranding #travel #uealifestyle #tourism #Internationaltravel #saudiarabia #flynas #emirates #quatarairways #airarabia #spain #europe #WorldCup2026  #Frequenttravelers #Businessclasstravel #italy #family #residency #iran #persian #follower #nonfollower #highlights #europewithkids #Asia #baku #trip #holiday #professional	Sidecar	6	0	2025-12-15 10:23:32	\N	hashtag	\N
2	3787895539329688739	DSRTuyECGSj	https://www.instagram.com/p/DSRTuyECGSj/	nni.photography	2973124391	A320neo #flynas	Image	5	0	2025-12-15 04:19:17	\N	hashtag	\N
3	3787594452467076574	DSQPRZEik3e	https://www.instagram.com/p/DSQPRZEik3e/	airkibris001	56343595208	Uganda ➡️ Somalia ➡️ Saudi Arabia 🗺️\n\n3 Ülke, 2 Uçuş, Tek Operasyon. Flynas A320neo ile IVAO World Tour'da bir bacağı daha (Leg 42-43) yeşile boyadık! 🟢\n\n#xplane12 #flightsimulator #aviation #avgeek #virtualpilot #flightsim #ivao #ivaoworldtour #ifrworldtour2025 #airbus #a320neo #tolissa320 #toliss #virtualaviation #simpilot#flynas #nasair #jeddah #jeddahairport #entebbe #uganda #mogadishu #somalia #saudiarabia #redsea #aviationdaily #wingview #cockpitview	Sidecar	7	0	2025-12-14 18:21:05	\N	hashtag	\N
4	3787313646112754689	DSPPbHxikwB	https://www.instagram.com/p/DSPPbHxikwB/	hagsjdhfnxhegsga	55748009058	December 12, XY50 to Riyadh\nAfter I put my baggage in the overhead compartment, a male flight attendant told me to put it at my feet. In our country, luggage is not allowed at your feet. It's illegal to do so. Despite my frantic explanation, the flight attendant tried to get me to put it at my feet, but instead dropped it on my child's lap, causing my child to scream in shock. Instead of apologizing, the flight attendant reported our behavior to another female flight attendant and yelled at my child. The female flight attendant gave us the choice of either getting off the plane or apologizing to him. We had no choice but to apologize, but he was the one who should be apologizing. In my country, forcing someone to apologize is a crime. And yelling at a child is also a crime. The male flight attendant yelled at the girl. Their actions are a crime, so I filed a police report in my country. My report was accepted, and Flynas will likely be advertised as a dangerous airline in my country. \n#flynas	Image	1	0	2025-12-14 09:03:10	\N	hashtag	\N
5	3787294896525830060	DSPLKR3Emes	https://www.instagram.com/p/DSPLKR3Emes/	wingsflap.tomy	4234804989	タイトルが入ってからやっとセントレアで撮影できたXJのflynasハイブリッドです。\n到着は残念ながら雨でしたが、出発は光が差してくれたのでそこそこ見れる写真になりました。\n\nThai AirAsia X\nA330-343/HS-XTR (Green Prime Lively)\nChubu Centrair International Airport (RJGG/NGO)\n14/DEC/2025\n#飛行機 #タイエアアジアx #エアバスa330 #セントレア #ハイブリッド塗装 #flynas #aviationphoto #aviationspotter #飛行機好きな人と繋がりたい	Sidecar	16	0	2025-12-14 08:25:55	\N	hashtag	\N
6	3787274239276299611	DSPGdrTDTVb	https://www.instagram.com/p/DSPGdrTDTVb/	airmaster_15	62743988072	@flynas A320 NEO Zero visibility arrival into Lahore Airport \n\n#Flynas #flynas #A320neo #A320NEO #AirbusA320neo #Arrival #Landing #NeoPower #PlaneSpotting #PlaneSpotter #AvGeek #AviationLovers #AviationPhotography #AirportPhotography #AircraftSpotting #InstaAviation #InstaPlanes #PlaneGram #AviationDaily #AirlinePhotography #AirplaneLovers #JetLife #FlightSpotting #FinalApproach #RunwayShots #AviationReels #ReelsAviation #ViralAviation #SaudiAviation #middleeastaviation	Image	36	0	2025-12-14 07:44:53	\N	hashtag	\N
7	3787163158420106671	DSOtNPME62v	https://www.instagram.com/p/DSOtNPME62v/	tokoname_spotter	48191913322	タイトルが入った 緑のエアアジアがセントレアに飛来しました✨\nHSXTR AirAsia X (Green Prime Livery)\n↓\nrjgg/ngo\n↓\n#a330#airasia #airasiax #flynas #セントレア写真部 #sky_airplane_gallery	Sidecar	184	4	2025-12-14 04:04:11	\N	hashtag	\N
8	3786734554313567439	DSNLwOgjqzP	https://www.instagram.com/p/DSNLwOgjqzP/	mwaqas817	1451002269	At Quick Premier League Official Account \n\nSeason 1 Trophy Reveal Ceremony \n\nOrganiser: Quick Travel Services\nSponsored By: flynas طيران ناس\n\n#quicktravel #Flynas #cricket #action #TrophyReveal #ceremonyn	Image	1	1	2025-12-13 13:52:38	\N	hashtag	\N
9	3786571453694042271	DSMmqzOEWCf	https://www.instagram.com/p/DSMmqzOEWCf/	flyingbosnian_	14495299604	Mix of tails at Sarajevo International Airport  #sarajevoairport #flynas #flydubai #eurowings #ryanair #kuwaitairways #lufthansa #lotpolishairlines #austrianairlines #croatiaairlines #airplanetails #airplanespotting #sarajevo #planespotting #planespotters #flyingbosnian #visitsarajevo	Sidecar	40	0	2025-12-13 08:28:34	\N	hashtag	\N
10	3744882565102810350	DP4ftoKgbTu	https://www.instagram.com/p/DP4ftoKgbTu/	fourbears_shop	304587417	✨ Ready to take off with charm and style! ✨\nOur adorable Flynas cabin crew teddy bear is all set for another sky-high adventure 🛫💙\nPerfect for aviation lovers and collectors who dream of friendly skies! ☁️🐻\n\n#FlynasCabinCrew #FlynasCrew #FlynasFlightAttendant #Flynas ✈️\n#CabinCrewLife #FlightAttendantLife #CrewLife #AviationLovers\n#TeddyBearLove #AviationGifts #AviationCollectibles #TravelInStyle\n#Airhostess #StewardessLife #TeddyBear #FourBearsShop #FourBears_Shop #FourBears	Image	12	0	2025-10-16 20:00:12	\N	hashtag	\N
11	3673449431456176283	DL6tsuOTlib	https://www.instagram.com/p/DL6tsuOTlib/	fourbears_shop	304587417	✈️ Meet the Flynas teddy bears — ready for takeoff!\nThank you @ninamelizza for this adorable shot in uniform, giving our bears a first-class hug. 💙🧸\n\n#FlynasCabinCrew #FlynasCrew #FlynasFlightAttendant #Flynas ✈️ \n#CabinCrewLife #FlightAttendantLife #CrewLife \n#TeddyBearLove #AviationGifts #AviationCollectibles #TravelInStyle #Airhostess #StewardessLife\n#TeddyBear #FourBearsShop #FourBears_Shop #FourBears	Image	25	0	2025-07-10 06:35:18	\N	hashtag	\N
35	3763489835579875779	DQ6mhDNiCHD	https://www.instagram.com/p/DQ6mhDNiCHD/	dc_own_records	3159681703	#flynas✈️ #saudiarabia #travel	Image	2	0	2025-11-11 12:09:31	\N	hashtag	\N
67	3784055858305922072	DSDqsEcj3QY	https://www.instagram.com/p/DSDqsEcj3QY/	flynashville	3443230296	Senator Bill Hagerty and President and CEO Doug Kreulen proudly welcomed the executives from the Japan Football Association to Nashville International Airport. We hope to see you again soon.	Sidecar	107	0	2025-12-09 21:10:36	\N	user_profile	\N
12	3673062484209583492	DL5Vt5hIEWE	https://www.instagram.com/p/DL5Vt5hIEWE/	ensair_1988	64663764064	Today was the next Flynas flight with special livery 😊. I like the colourful and fresh 320NEO planes. Thank you for waving and always happy landings.\n\n#flynas✈️ #flynas #flynascrew #salzburg #salzburgairport #colourful #airbus320neo #airplane_lovers #instagrammaviation #instaplane #instaplanespotter #aviation #aviationfriends #aviationworld #aviationworld #aviationgeek #aviation4u #aviationdaily #aviationphotography #plane #planepics #planelovers #planespotter #wavingpilot #waving	Sidecar	20	4	2025-07-09 17:46:30	\N	hashtag	\N
13	3670902581110099002	DLxqnLAIcw6	https://www.instagram.com/p/DLxqnLAIcw6/	ensair_1988	64663764064	Todays Flynas flight from Riyadh to Salzburg and return with this nice Airbus 320NEO and this cool livery. Very friendly waving pilots and hot weather😅. \n\n#flynas #flynas✈️ #flynascrew #salzburg #salzburgairport #airbus320neo #wavingpilot #waving #airplane_lovers #aviationfriends #aviationworld #aviationgeek #aviation4u #aviation #aviationdaily #airbusboeingaviation #instagrammaviation #instaplane #instaspotter #plane #planepics #planelovers #planespotter	Sidecar	27	6	2025-07-06 18:15:10	\N	hashtag	\N
14	3665053285518165487	DLc4ot-MEXv	https://www.instagram.com/p/DLc4ot-MEXv/	spotterinaction	40509335046	#Airbus #airbusA320neo #a320251n #Flynas #HZNS32 #flynascabincrew #flynaspilot #flynascrew #planespotting #avgeekspotting #planespotters #spotters #crazyforplanes #airbuslovers #aviationphotography #instagramaviationphotography #instagramaviation #instagood #bestaviation4u #aviation4us #planelovers #planepics #Limc #Landing #milanairports\n\n@flynas\n@milanairports\n@airbus	Sidecar	19	4	2025-06-28 16:33:40	\N	hashtag	\N
15	3639523934723049164	DKCL7xQswbM	https://www.instagram.com/p/DKCL7xQswbM/	photophactory.me	6767329225	Grace in the golden hour with Gorgeous @stay_steele \n::\n::\nIn Frame - @stay_steele \nPhotos - @photophactory.me\n::\n::\n#cabincrewlife #flightattendant #etihadcrew #dubai❤️ #photography #emiratescabincrew #photoshoot #emiratescrew 👑 #doha #flydubai #emiratesairline #dubaicrewgirls #globaltraveller #flydubaicrew #dohamakeup #goingplacestogether #qatarinstagram #dohainstagram #dohaphoto #globaltrotter #qatarphotography #flynascrew #qatarairwayscabincrew #qatarphotographer #dohaphotographer #Qatarairwayscrew #elinchrom #dohainstagram #pradeepkwijekoon	Sidecar	1979	45	2025-05-24 11:11:24	\N	hashtag	\N
16	3786587388986294922	DSMqSsHgIKK	https://www.instagram.com/p/DSMqSsHgIKK/	newheightscantina	74817445610	Rise and dine ☀️🍳 Our breakfast favorites are ready to fuel your morning before takeoff \n\n #airportfood #flynashville #nashvilleeats	Sidecar	2	1	2025-12-13 09:00:14	\N	hashtag	\N
17	3785349297353787161	DSIQyFbjAcZ	https://www.instagram.com/p/DSIQyFbjAcZ/	threecasksnashville	10804390437	Premium, crafted, and piled high with flavor. 🍔🔥 Our burgers are the upgrade your travel day deserves. They pair perfectly with our locally made, fully Tennessee tap beer list! \n\n #flynashville #airporteats #drinklocal	Sidecar	1	0	2025-12-11 16:00:22	\N	hashtag	\N
18	3784270756289715781	DSEbjPyjB5F	https://www.instagram.com/p/DSEbjPyjB5F/	markboxmusic	3601888984	Will you be at BNA Nashville Airport Wednesday morning?  Me too!!! I’m playing our Ole Red location inside BNA on Wednesday 12/10/2025 from 8:30am - 12:30.  Come early! Stay late!  But don’t miss your flight. Or….do. 😁\n#Nashville #OleRed #FlyNashville \n#BNA #BNAnews #BNAairport	Image	26	2	2025-12-10 04:17:30	\N	hashtag	\N
19	3781000614663646432	DR40AbEj2zg	https://www.instagram.com/p/DR40AbEj2zg/	newheightscantina	74817445610	Housemade salsa, warm queso, creamy guac, the essentials. 🥑🌶️\n\nGrab a bowl (or three) and dig in. The perfect start to any airport meal.\n\n #airportfood #nashvilleeats #flynashville	Sidecar	3	1	2025-12-05 16:00:18	\N	hashtag	\N
20	3778615076522385095	DRwVmRjDV7H	https://www.instagram.com/p/DRwVmRjDV7H/	threecasksnashville	10804390437	Early flight? Long layover?  Dig into our breakfast favorites before you board and start your trip the right way! ☀️🍳\n\n #flynashville #airporteats	Sidecar	0	0	2025-12-02 09:00:40	\N	hashtag	\N
21	3770914540041841916	DRU-suFjKz8	https://www.instagram.com/p/DRU-suFjKz8/	tnwhiskeytrail	555035635	Skip the holiday mad dash through the airport this year. Select unique Tennessee gifts at @flynashville's Tennessee Whiskey Trail Trailhead Store near TSA after Security. Then, enjoy a spirited pour and delicious eats from @threecasksnashville in Concourse C, near Gate C-20. \n\n#TNWhiskeyTrail #TNwhiskey #Nashville #BNA #FlyNashville	Sidecar	-1	0	2025-11-21 18:01:05	\N	hashtag	\N
22	3770872086580379905	DRU1C8OD0EB	https://www.instagram.com/p/DRU1C8OD0EB/	threecasksnashville	10804390437	Starting today through 1/4/26, buy any food item off our special menu and we'll donate $2 directly to No Kid Hungry! \n\nWe're featuring a limited time brisket menu with house-smoked brisket made fresh each day and sliced to order! Try out our limited time brisket breakfast plate, sandwich and meat plus plate!\n\n #flynashville #airporteats	Sidecar	1	0	2025-11-21 16:36:44	\N	hashtag	\N
23	3769555137913240491	DRQJm0MkTur	https://www.instagram.com/p/DRQJm0MkTur/	fraportusa_tennessee	10807941406	Cheers to Titans Press Box! Proud to celebrate with them being named a USA Today Best Airport Bar 2025. Here’s to great food, great drinks, and an even greater team.\n.\n.\n.\n#ShopDineBeNashville #FraportNashville #FlyNashville	Sidecar	19	0	2025-11-19 21:00:00	\N	hashtag	\N
24	3769510812810574209	DRP_hzOkXmB	https://www.instagram.com/p/DRP_hzOkXmB/	thetitanspressbox	59444561469	We’re thrilled to share that @thetitanspressbox has been named the No. 1 Best Airport Bar of 2025 by @usatoday 10Best Readers’ Choice! 🏆\n\nSince our opening in September 2023 at Nashville International Airport® (BNA®), we’ve invited travelers to “Travel Like a Titan,” and this incredible honor is a celebration of every guest, team member, and partner who makes it happen.\n\nThank you for your votes, your support and your travel miles. 🚀\n\n.\n.\n.\n.\n.\n.\n.\n\n#TitansPressBox #BestAirportBar #TravelLikeATitan #NashvilleEats #AirportDining #titanup #flynashville #usatoday	Sidecar	862	17	2025-11-19 19:32:07	\N	hashtag	\N
36	3618397696496163427	DI3IYirvtpj	https://www.instagram.com/p/DI3IYirvtpj/	bukhariflynasgsa	71447180504	We are pleased to inform you that the Country Manager of Flynas Pakistan visited the Islamabad market to hold productive meetings with Hajj-focused and top-performing agents.\n\nThe visit aimed to strengthen partnerships, understand market trends, and boost coordination ahead of Hajj 2025. Valuable insights were exchanged, and agents expressed strong interest in supporting our upcoming plans and strategies. #foryoupagereels #fightcoronavirus #fypシ゚viralシfypシ゚viralシalシ #likeforfollow #fightagainstcoronavirus #flynas #flynas✈️ #flynasa #flynascrew #flynashville #flynasairlines #flynas_contest #flynascabincrew #flynasairlines✈️ #flynascharter2017	Sidecar	4	0	2025-04-25 07:37:20	\N	hashtag	\N
37	3577764028204287142	DGmxW2HSYSm	https://www.instagram.com/p/DGmxW2HSYSm/	total_fly	47720628127	HURRY UP YOUR BOOKINGS  #emirates #flynas✈️ #airindiaexpress #indigo #akasa #airport ##crewlife #oman #saudiarabia #airindia #indigo #ethihadairways #delta #flydubai #flynas_contest	Image	5	0	2025-02-28 06:05:29	\N	hashtag	\N
25	3768151150458428073	DRLKYG_Ddqp	https://www.instagram.com/p/DRLKYG_Ddqp/	nashvillehistoryx	8223860959	“President Kennedy greets guests at Vanderbilt’s 90th anniversary convocation, 1963.”\n\n—\n\nOn May 18, 1963, Vanderbilt University and Dudley Field hosted John F. Kennedy, the 35th President of the United States. President Kennedy was in Nashville to commemorate the 90th anniversary of Vanderbilt University and to dedicate the construction of the Percy Priest Dam.\n\nPresident Kennedy stepped off “Air Force One” on Berry Field in the Metropolitan Airport at 10:35 a.m. This was the beginning of his three hours in Nashville. Thousands of men, women and children jammed the airport for the arrival, reaching for a presidential handshake and watching for the contagious smile of the chief executive.\n\nThe parade route was lined with flag-waving youngsters. Mayor Beverly Briley joined the motorcade for the 8-mile trek to the stadium. Other metro officials and councilmen had special buses to take them to the stadium where reserved seats were waiting. \n\nThe mayor said he thought there were well over 200,000 people who saw the President during the day. Some 33,000 heard him speak at Vanderbilt University. Thousands more watched on television. \n\nPresident Kennedy arrived at Dudley Field at 11:10 a.m., and was driven straight onto the field next to a platform specially built for this occasion. Awaiting the president were dozens of dignitaries and Vanderbilt University officials. \n\nUpon leaving Dudley Field, the President was on his way to the governor’s mansion for a luncheon. He was the first president to visit Tennessee’s executive mansion. President Kennedy met with several guests and then retreated to a private upstairs room for a shower and change of clothes. Lunch consisted of ham, chicken, asparagus, and strawberry shortcake.\n\nThe President was taken to Overton High School where an army helicopter was waiting for him. The helicopter flew JFK straight to Muscle Shoals, Alabama. — Commodore History Corner Archive\n\n(Photo by Cecil Stoughton, White House / John F. Kennedy Presidential Library and Museum, Boston)\n\n#presidentkennedy #nashvilletn #vanderbiltuniversity #nashvillehistory #nashvilletennessee #flynashville #nashvillenews #nashvilletn #historicnashville #nash	Image	524	6	2025-11-17 22:30:43	\N	hashtag	\N
26	3786814948442498288	DSNeCHYDeTw	https://www.instagram.com/p/DSNeCHYDeTw/	marmara.travel1	30365737882	🕋🌙 عمرة شهر رمضان المبارك🌙🕋\nيسر وكالة مرمرة للأسفار والسياحة أن تقدم لزبنائها الكرام عرض خاص  بشهر رمضان 2026 بأثمنة جد مناسبة مع خط مباشر من مطار طنجة إلى مطار المدينة المنورة.\n\n✓خطوط مباشرة مع تواريخ متعددة.\n✓ فنادق متعددة و مختلفة حسب اختياركم بمكة المكرمة والمدينة المنورة .\n ✓تأشيرة الدخول إلى المملكة السعودية مع تأمين طبي.\n✓التنقلات داخل المملكة السعودية.\n✓المزارات بمكة والمدينة.\n✓ تصريح زيارة الروضة الشريفة حسب الإمكانية .\n✓مرافق ديني وتقني من الوكالة طيلة مدة الرحلة.\n\n📿رحلات عمرة طيلة السنة مع طيران مباشر 📿\n\n-- للحجز و الاستفسار اتصلو بنا على الارقام التالية :\n06 61 85 04 01 -- 05 39 42 45 10\n06 62 74 77 23 -- 06 62 74 77 29\n06 62 74 77 58 -- 06 62 74 77 93\n06 62 74 77 44 -- 06 17 98 04 51\n\n-- كما يمكنكم زيارتنا على العنوان التالي :\n9، اقامة فلورنسيا شارع الجيش الملكي ، طريق الرباط - طنجة\n💥💥 سارعو بالتسجيل المقاعد جد محدودة💥💥\n\n#عمرة #مكة_المكرمة #المدينة_المنورة #الحرم_النبوي #الحرم_المكي #سياحة  #اسفار #الخطوط_السعودية\n #رمضان_كريم #الخطوطـالملكيةالمغربية\n #saudiairlines #saudiarabia #ramadankareem #flynas✈️ #omra #omra_moubaraka #mecca #almadinah_almunawarah #alhamdulilah #alkaaba #royalairmaroc🇲🇦	Image	8	0	2025-12-13 16:32:21	\N	hashtag	\N
27	3785974319860429689	DSKe5XACDN5	https://www.instagram.com/p/DSKe5XACDN5/	5mtravelsolutions	35834629613	✈️ 𝗙𝗹𝘆 𝗛𝗶𝗴𝗵 𝘄𝗶𝘁𝗵 𝟱𝗠 𝗧𝗿𝗮𝘃𝗲𝗹 𝗦𝗼𝗹𝘂𝘁𝗶𝗼𝗻𝘀!\n𝗚𝗲𝘁 𝘁𝗵𝗲 𝗹𝗼𝘄𝗲𝘀𝘁 𝗳𝗮𝗿𝗲𝘀 𝗼𝗻 𝗱𝗼𝗺𝗲𝘀𝘁𝗶𝗰 & 𝗶𝗻𝘁𝗲𝗿𝗻𝗮𝘁𝗶𝗼𝗻𝗮𝗹 𝗳𝗹𝗶𝗴𝗵𝘁𝘀 𝘄𝗶𝘁𝗵 𝘀𝗺𝗼𝗼𝘁𝗵, 𝗿𝗲𝗹𝗶𝗮𝗯𝗹𝗲 𝗯𝗼𝗼𝗸𝗶𝗻𝗴 𝘀𝗲𝗿𝘃𝗶𝗰𝗲𝘀.\n🌍 𝗬𝗼𝘂𝗿 𝗷𝗼𝘂𝗿𝗻𝗲𝘆 𝘀𝘁𝗮𝗿𝘁𝘀 𝗵𝗲𝗿𝗲 𝗕𝗼𝗼𝗸 𝘆𝗼𝘂𝗿 𝘁𝗶𝗰𝗸𝗲𝘁𝘀 𝘁𝗼𝗱𝗮𝘆!\n\n📞 𝗖𝗼𝗻𝘁𝗮𝗰𝘁 𝘂𝘀:\n 𝟬𝟯𝟮𝟭-𝟮𝟰𝟭𝟯𝟴𝟭𝟲 \n📍 𝗦𝘂𝗶𝘁𝗲 𝟳𝟭𝟯, 𝟳𝘁𝗵 𝗙𝗹𝗼𝗼𝗿, 𝗕𝗮𝗹𝗮𝗱 𝗧𝗿𝗮𝗱𝗲 𝗖𝗲𝗻𝘁𝗿𝗲 𝗕𝗹𝗼𝗰𝗸 𝟯, 𝗕𝗮𝗵𝗮𝗱𝘂𝗿𝗮𝗯𝗮𝗱, 𝗞𝗮𝗿𝗮𝗰𝗵𝗶.\n#airline #qatarairways #emiratesairlines✈️ #pia #flyjinnah #flynas✈️ #ethopiaairlines #airarabia #internationaltravel #domestictravel #anytimeanywhere  #5mtravelsolutions	Image	1	0	2025-12-12 13:05:01	\N	hashtag	\N
28	3785801960541814764	DSJ3tM4En_s	https://www.instagram.com/p/DSJ3tM4En_s/	v__for_vign_esh	8435570425	Uff ........\n\n#travelphotography #traveling #travelblogger #travelrealindia #travel #flynas✈️ #saudiarabia #saudavel #travelphotography #insta	Image	18	0	2025-12-12 06:59:43	\N	hashtag	\N
29	3784352748154783801	DSEuMYqigg5	https://www.instagram.com/p/DSEuMYqigg5/	_aizaan_mhd_19	54724226728	🇸🇦✈️fly\n#flynas✈️ #newdestination✈️ #riyadhinternationalairport	Sidecar	-1	3	2025-12-10 07:00:24	\N	hashtag	\N
30	3781597405872213168	DR67s4MjUyw	https://www.instagram.com/p/DR67s4MjUyw/	flynas	593372283	طيران واحد، ووجهات ما لها نهاية ✈️\nمغامرتك القادمة بانتظارك… \n\nاحجز تذكرتك الآن!🤩\n\n#طيران_ناس✈️\n\n-\n\nOne airline, endless destinations ✈️🤩\n\nYour next adventure awaits, book your ticket now!\n\n#flynas✈️	Image	86	7	2025-12-06 11:46:08	\N	hashtag	\N
31	3778172383547377937	DRuw8PliEkR	https://www.instagram.com/p/DRuw8PliEkR/	_iam_sehan	60033841046	#flynas✈️ \n\n#aviationlovers #Kingdom\n#instadaily😎✌️\n#gobliss #saudiarabia	Sidecar	-1	0	2025-12-01 18:21:07	\N	hashtag	\N
32	3773202547326752878	DRdG7m7Aphu	https://www.instagram.com/p/DRdG7m7Aphu/	hazemkhaled36	13693517313	مش هتفهمنى غير بمزاجى🖤\n#flynas✈️	Sidecar	11	0	2025-11-24 21:46:56	\N	hashtag	\N
33	3769543914752682547	DRQHDf0Eaoz	https://www.instagram.com/p/DRQHDf0Eaoz/	saudiskys	74450955100	flynas HZ-NS52 (Year of Saudi Coffee) 🇸🇦 \nAirbus A320-251N\n#flynas✈️ #flynas #aviation #airplanespotted  #airplanespotting\n#airplanespotter  #saudia #فلاي_ناس	Sidecar	33	1	2025-11-19 20:37:53	\N	hashtag	\N
34	3769162772979241976	DROwZJ4DdP4	https://www.instagram.com/p/DROwZJ4DdP4/	rekotravelor	74796501932	للمرة الثانية على التوالى . الطيران مع اجمل شركة طيران flynas \nالوجبة ده خفيفة وجميلة .... بصراحة كنت نايم فى الطيارة لانى كنت بايت فى المطار عشان الطيارة كان معادها 9 صباحا \nوملحقتش افطر برغم ان الفطار كان معايا .. بس نسيتوا فى الشنطة الكبيرة اللى داخلة على السير .... \nلكن فلاى ناس بقه ... شركة الطيران العسل .. قاموا بالواجب والله .... وكمان طقم المضيفين ولاد وبنات بجد والله ناس عسل كده ودايما مبتسمين ومبسوطين ...... طيران flynas احلى طيران فى #العالم ❤\n\n #travel #السعودية #rekotraveler #flynas #flynas✈️	Image	0	0	2025-11-19 08:00:38	\N	hashtag	\N
38	3440930565865478127	C_ApB5rMhfv	https://www.instagram.com/p/C_ApB5rMhfv/	captain_abdullatif_spotting	56660946526	Special livery lovers! ✈️\nFlynas 🇸🇦 A320-251N HZ-NS35 “year of Arabic calligraphy “ livery getting pulled into the gate at king Fahd international airport DMM/OEDF ✈️\n\n.\n\n.\n\n.\n\n.\n\n@flynas @airbus @dacoksa #airbus #airbuslovers #airbus320 #a320 #a320neo #a320family #a320lovers #airbus320neo #flynas #flynas_contest #flynas✈️ #saudi #saudiarabia #ksa #dammam #dmm #oedf #kingfahdinternationalairport	Image	43	0	2024-08-23 11:01:49	\N	hashtag	\N
39	3369536320145271194	C7C_248CSma	https://www.instagram.com/p/C7C_248CSma/	pakistani_cabincrew	57219781390	Nazish Ch @free_life__01 is the Lead Cabin Crew in Flynas @flynas 🇸🇦✈️🇵🇰\n.\n.\n.\n.\n.\n.\n#flynascabincrew #flynas✈️#flynasflightattendant #flynas #flynas_contest #flynas_crew #flynascrew #pursar #pakistanicrew #pakistaniairhostess #piacabincrew #pakistanicc #pakistaniflightattendant #pakistaniairhostess #pakistanicabincrew #vipcabincrew #vipflightattendant #cabincrewinterview #crew #cc #cabincrew #cabincrewlifestyle #cabincrewlife #cabincrewdubai #crewlife #cabincrewgirls #qatarairways #pakistaninternationalairlines🇵🇰✈️ #airblue #Airsial #saudiarabia🇸🇦	Image	324	12	2024-05-16 22:54:12	\N	hashtag	\N
40	3268498451401192923	C1cCgY4rrXb	https://www.instagram.com/p/C1cCgY4rrXb/	crewsdoll	5702478626	Fly with us this Holiday 💚💚💚 #flynas #flyer #flynas✈️ #flynas_contest #flynas_contest #flynashville #flynascrew #flynascabincrew #flynasairlines #instragram #cabincrew #cabincrewlifestyle #crewlife #air #airhostess #happynewyear #happybirthday #happylife	Image	28	0	2023-12-29 13:10:00	\N	hashtag	\N
41	3262433598344564883	C1GfhKUoJCT	https://www.instagram.com/p/C1GfhKUoJCT/	avgeek_iiap	22665746104	Flynas AirBus 320 NEO HZ-NS33🇸🇦✈️🇵🇰 in Islamabad International Airport ✈️✈️✈️\n@flynas \n@flynas.maroc \n@flynas_kg \n#flynas #flynas✈️ #flynas_contest #flynashville #islamabadgram #islamabadairport #instalove #islamabadinternationalairport #iiap #islamabad #aviation #avgeek #a320 #aviationdaily #aviator #aviacao #avgeeks #avgeekspotting #airbus #aviationphotography #hzns33 #beauty #beautyofpakistan #beautiful #pakistan #trending #travelphotography #trendingreels #viral \n@avgeek_iiap	Image	113	4	2023-12-21 04:20:13	\N	hashtag	\N
42	3237827839437434582	CzvE0Plie7W	https://www.instagram.com/p/CzvE0Plie7W/	pakistani_cabincrew	57219781390	Maham Ateeq Sheikh @mahamateeqsheikhh is the cabin Crew in Flynas @flynas 🇸🇦✈️🇵🇰\n.\n.\n.\n.\n.\n.\n#flynascabincrew #flynas✈️#flynasflightattendant #flynas #flynas_contest #flynas_crew #flynascrew #pursar #pakistanicrew #pakistaniairhostess #piacabincrew #pakistanicc #pakistaniflightattendant #pakistaniairhostess #pakistanicabincrew #vipcabincrew #vipflightattendant #cabincrewinterview #crew #cc #cabincrew #cabincrewlifestyle #cabincrewlife #cabincrewdubai #crewlife #cabincrewgirls #qatarairways #pakistaninternationalairlines🇵🇰✈️ #airblue #Airsial #saudiarabia🇸🇦	Image	146	7	2023-11-17 05:32:58	\N	hashtag	\N
43	3237815375148678892	CzvB-3UCP7s	https://www.instagram.com/p/CzvB-3UCP7s/	pakistani_cabincrew	57219781390	Neelam Javed @neelamjavedjaved is the Cabin Crew in Flynas @flynas 🇸🇦✈️🇵🇰\n.\n.\n.\n.\n.\n.\n #pursar #pakistanicrew #pakistaniairhostess #piacabincrew #pakistanicc #pakistaniflightattendant #pakistaniairhostess #pakistanicabincrew #vipcabincrew #vipflightattendant #cabincrewinterview #crew #cc #cabincrew #cabincrewlifestyle #cabincrewlife #cabincrewdubai #crewlife #cabincrewgirls #qatarairways #pakistaninternationalairlines🇵🇰✈️ #airblue #airsial⭐️ #flynascabincrew #flynas✈️ #flynasflightattendant #flynas #flynas_contest #flynas_crew #flynascrew	Image	97	3	2023-11-17 05:08:12	\N	hashtag	\N
44	3237808586097273494	CzvAcEhCaqW	https://www.instagram.com/p/CzvAcEhCaqW/	pakistani_cabincrew	57219781390	SQ Chandio @ahmerabiyat.sd is the Flight Purser in Flynas @flynas 🇵🇰✈️🇸🇦 \n.\n.\n.\n.\n.\n.\n#flynascabincrew #flynas✈️ #flynasflightattendant #flynas #flynas_contest #flynas_crew #flynascrew #pursar #pakistanicrew #pakistaniairhostess #piacabincrew #pakistanicc #pakistaniflightattendant #pakistaniairhostess #pakistanicabincrew #vipcabincrew #vipflightattendant #cabincrewinterview #crew #cc #cabincrew #cabincrewlifestyle #cabincrewlife #cabincrewdubai #crewlife #cabincrewgirls #qatarairways #pakistaninternationalairlines🇵🇰✈️ #airblue #Airsial #saudiarabia🇸🇦	Image	218	10	2023-11-17 04:54:42	\N	hashtag	\N
45	3225828240073964899	CzEcbF0CD1j	https://www.instagram.com/p/CzEcbF0CD1j/	pakistani_cabincrew	57219781390	Maria Awan @fabulicious_94 is the Cabin Crew in Flynas @flynas \n.\n.\n.\n.\n.\n.\n#flynascabincrew #flynas✈️ #flynasflightattendant #flynas #flynas_contest #flynas_crew #flynascrew  #pursar #pakistanicrew #pakistaniairhostess #piacabincrew #pakistanicc #pakistaniflightattendant #pakistaniairhostess #pakistanicabincrew #vipcabincrew #vipflightattendant #cabincrewinterview #crew #cc #cabincrew #cabincrewlifestyle #cabincrewlife #cabincrewdubai #crewlife #cabincrewgirls #qatarairways #pakistaninternationalairlines🇵🇰✈️ #airblue #airsial	Image	107	3	2023-10-31 16:11:54	\N	hashtag	\N
46	3778909549236109820	DRxYjaojMH8	https://www.instagram.com/p/DRxYjaojMH8/	flystyle_ashgabat	3139278881	"PREMIUM CARD"... А ты получил свою???\nGaraşsyzlygyň 15 ýyllygy\n 3 etaž N326 (Surikow tarap).\nGülüstan russkiý bazar\n 2 etaž N31 N32\nİmo, link\n+99365212078\nInstagram:\n@flystyle_ashgabat	Video	15	4	2025-12-02 20:01:01	\N	user_profile	\N
47	3748255416552544171	DQEenE3DFer	https://www.instagram.com/p/DQEenE3DFer/	flystyle_ashgabat	3139278881	Фактический факт 💚😁\nРусский базар 2 этаж 31 32 магазин\nОптовка 3 этаж со стороны Сурикова 326\nПо всем вопросам обращайтесь в директ \n@flystyle_ashgabat\nİMO:link\n+99365212078	Video	20	0	2025-10-21 12:11:46	\N	user_profile	\N
48	3731543008455028047	DPJGph7De1P	https://www.instagram.com/p/DPJGph7De1P/	flystyle_ashgabat	3139278881	Как нас найти на оптовке?	Video	15	0	2025-09-28 10:19:37	\N	user_profile	\N
49	3785171981004742593	DSHodytjJ_B	https://www.instagram.com/p/DSHodytjJ_B/	flystyle_ashgabat	3139278881	Уже в наличии.\nРусский базар 2 этаж 31 32 магазин\nОптовка 3 этаж со стороны Сурикова 326\nПо всем вопросам обращайтесь в директ \n@flystyle_ashgabat\nİMO:link\n+99365212078	Video	3	0	2025-12-11 10:21:14	\N	user_profile	\N
50	3780088334442610488	DR1kk_6DL84	https://www.instagram.com/p/DR1kk_6DL84/	flystyle_ashgabat	3139278881	Garaşsyzlygyň 15 ýyllygy\n 3 etaž N326 (Surikow tarap).\nGülüstan russkiý bazar\n 2 etaž N31 N32\nİmo, link\n+99365212078\nInstagram:\n@flystyle_ashgabat\n#flystyle #fly_style	Video	21	0	2025-12-04 10:25:54	\N	user_profile	\N
51	3776678028496381890	DRpdKg_jKfC	https://www.instagram.com/p/DRpdKg_jKfC/	flystyle_ashgabat	3139278881	Русский базар 2 этаж 31 32 магазин\nОптовка 3 этаж со стороны Сурикова 326\nПо всем вопросам обращайтесь в директ \n@flystyle_ashgabat\nİMO:link\n+99365212078	Video	7	0	2025-11-29 17:02:02	\N	user_profile	\N
52	3774398032708941039	DRhWwNcjLTv	https://www.instagram.com/p/DRhWwNcjLTv/	flystyle_ashgabat	3139278881	Свитшоты в наличии \nРусский базар 2 этаж 31 32 магазин\nОптовка 3 этаж со стороны Сурикова 326\nПо всем вопросам обращайтесь в директ \n@flystyle_ashgabat\nİMO:link\n+99365212078	Video	14	0	2025-11-26 13:24:18	\N	user_profile	\N
53	3773005527354469180	DRcaIlxjGs8	https://www.instagram.com/p/DRcaIlxjGs8/	flystyle_ashgabat	3139278881	Те самые штаны!!!! В наличии \nРусский базар 2 этаж 31 32 магазин\nОптовка 3 этаж со стороны Сурикова 326\nПо всем вопросам обращайтесь в директ \n@flystyle_ashgabat\nİMO:link\n+99365212078	Video	11	0	2025-11-25 08:11:18	\N	user_profile	\N
54	3761260204693130081	DQyrjpojAth	https://www.instagram.com/p/DQyrjpojAth/	flystyle_ashgabat	3139278881	Русский базар 2 этаж 31 32 магазин\nОптовка 3 этаж со стороны Сурикова 326\nПо всем вопросам обращайтесь в директ \n@flystyle_ashgabat\nİMO:link\n+99365212078	Video	15	1	2025-11-08 10:41:35	\N	user_profile	\N
55	3758341646162089942	DQoT9CMDFfW	https://www.instagram.com/p/DQoT9CMDFfW/	flystyle_ashgabat	3139278881	Куртки уже в наличии \nРусский базар 2 этаж 31 32 магазин\nОптовка 3 этаж со стороны Сурикова 326\nПо всем вопросам обращайтесь в директ \n@flystyle_ashgabat\nİMO:link\n+99365212078	Video	18	2	2025-11-04 09:42:06	\N	user_profile	\N
56	3755280363888052710	DQdb5g5jAnm	https://www.instagram.com/p/DQdb5g5jAnm/	flystyle_ashgabat	3139278881	Джинсы.. Обзор на новые поступления...\nРусский базар 2 этаж 31 32 магазин\nОптовка 3 этаж со стороны Сурикова 326\nПо всем вопросам обращайтесь в директ \n@flystyle_ashgabat\nİMO:link\n+99365212078	Video	13	1	2025-10-31 04:21:54	\N	user_profile	\N
57	3754782943240544013	DQbqzF0jF8N	https://www.instagram.com/p/DQbqzF0jF8N/	flystyle_ashgabat	3139278881	Обзор на новый ЗИПКИ...\nРусский базар 2 этаж 31 32 магазин\nОптовка 3 этаж со стороны Сурикова 326\nПо всем вопросам обращайтесь в директ \n@flystyle_ashgabat\nİMO:link\n+99365212078	Video	10	3	2025-10-30 12:29:46	\N	user_profile	\N
58	3788460093680135738	DSTUGIRjC46	https://www.instagram.com/p/DSTUGIRjC46/	flynashville	3443230296	Know the Way at BNA®! Initial work for the new bigger, better rental car facility and parking garage will continue this week, and we want to make sure our passengers and community are informed. From Monday, Dec. 15 to Friday, Dec. 19, there will be overnight partial and single-lane closures between 8 p.m. and 5 a.m. along the terminal roadways while crews conduct initial work for this new development that is part of New Horizon, our current growth and expansion plan. Only one lane will be closed at a time. Please watch for the work zone and follow signage if driving at the airport at night this week. Thank you for your cooperation and understanding as we build a world-class airport!\n\nFor more information about New Horizon, which will enable BNA to support 40 million annual passengers in the future, visit BNANewHorizon.com. #NewHorizon #KnowTheWay	Image	10	0	2025-12-15 23:01:03	\N	user_profile	\N
59	3788353637656516111	DSS74_YE1YP	https://www.instagram.com/p/DSS74_YE1YP/	flynashville	3443230296	On the seventh day of flights, BNA gave to me... seven nonstop flights to capital cities and counting!\n\nThis holiday season, Santa wanted to experience the unique traditions different cities celebrate. What better way to do that than by visiting state capitals? With nonstop flights to state capitals across the country, you can join in on the festivities.\n\nDon't forget to like, comment, and share for a chance to win our stocking giveaway!	Image	172	138	2025-12-15 19:29:34	\N	user_profile	\N
60	3787718741900204943	DSQriCoDRuP	https://www.instagram.com/p/DSQriCoDRuP/	flynashville	3443230296	Our BNA gear is airfield tested. Head over to @thebnashop to grab yours in time to put under the tree.	Image	68	1	2025-12-14 22:28:08	\N	user_profile	\N
61	3787582373140950383	DSQMhnUmO1v	https://www.instagram.com/p/DSQMhnUmO1v/	flynashville	3443230296	On the sixth day of flights, BNA gave to me...six nonstop flights to Texas! 🐎⭐\n\nSomeone told Santa that the "stars at night are big and bright deep in the heart of Texas," so he had to check it out for himself. You too can see the stars at night in Texas by flying nonstop to Dallas, Houston, Austin, and San Antonio. \n\nDon't forget to like, comment, and share for a chance to win the stocking giveaway.	Image	271	321	2025-12-14 17:57:12	\N	user_profile	\N
62	3786880243672619056	DSNs4STDRgw	https://www.instagram.com/p/DSNs4STDRgw/	flynashville	3443230296	On the fifth day of Flights, BNA gave to me… 5 GOLDEN RINGS! \n(Think Olympic sized rings 😉)\nSanta says it’s never too early to plan, and with five flights to Los Angeles and surrounding areas, your journey to the 2028 Summer Olympics starts at BNA! \n\n#BNA12daysofflights	Image	213	153	2025-12-13 18:42:12	\N	user_profile	\N
63	3786199956538472658	DSLSMziEzjS	https://www.instagram.com/p/DSLSMziEzjS/	flynashville	3443230296	On the fourth day of flights, BNA gave to me...four nonstop flights to Canadian cities!\n\nSanta couldn’t wait until Christmas Eve to eat maple cookies, so he made stops in Toronto, Vancouver, Calgary, and Montreal to pick up all things maple he could fit in his sleigh. \n\nEach like, comment, and share is an entry into the stocking giveaway! \n\n#BNA12daysofflights	Image	302	336	2025-12-12 20:10:35	\N	user_profile	\N
64	3785408545454624691	DSIeQQhjQ-z	https://www.instagram.com/p/DSIeQQhjQ-z/	flynashville	3443230296	On the third day of flights, BNA gave to me...three European adventures! \n\nSanta’s feeling a little generous today, so he’s sending us to London, Dublin, and Reykjavik because why stop at one?\n\nAnd don’t worry, we passed along your requests for more European options. He said he’ll put it on his to-do list! \n\nDon’t forget that every like, comment, and share gets you an entry into our stocking giveaway. \n\n#BNA12daysofflights	Image	654	764	2025-12-11 17:58:11	\N	user_profile	\N
65	3784696867562032696	DSF8b-1kY44	https://www.instagram.com/p/DSF8b-1kY44/	flynashville	3443230296	On the second day of flights, BNA gave to me...two Tennessee vacations! \n\nWe’re touching down in Memphis and Knoxville, where Santa is starting on the west side of the state to trade in his jingle bells for Beale Street blues and then heading east to learn Rocky Top in preparation for nonstop service from BNA in March 2026. \n\nWhich @tnvacation are you choosing? \n\nDon't forget that each like, comment, and share = one entry into our stocking giveaway!	Image	284	124	2025-12-10 18:24:13	\N	user_profile	\N
66	3784091030581481989	DSDyr5LjRIF	https://www.instagram.com/p/DSDyr5LjRIF/	flynashville	3443230296	What better way to kick off our 12 Days of Flights than with carolers? Thank you to the American Caroling Company for helping us get in the holiday spirit.	Sidecar	137	4	2025-12-09 22:20:29	\N	user_profile	\N
68	3783960660086993245	DSDVCwMibFd	https://www.instagram.com/p/DSDVCwMibFd/	flynashville	3443230296	On the first day of flights, BNA® gave to me... one (hundred) nonstop destinations - and counting! \nFirst stop: Iceland - where the landscapes look magical enough to be Santa's second home. \n\nFollow along for all 12 days of flights for your chance to win a BNA® stocking stuffed with goodies. Every like, comment, or share = one entry. \n\nSee you tomorrow for day 2!  #BNA12daysofflights	Image	429	313	2025-12-09 18:01:30	\N	user_profile	\N
69	3783431000240704531	DSBcnMBjEwT	https://www.instagram.com/p/DSBcnMBjEwT/	flynashville	3443230296	'Tis the season to take flight! 🎄🎅🏽✈️\n\nOur 12 Days of Flights kicks off tomorrow, and each comment, like, and share is your ticket to win a BNA stocking stuffed with goodies. Day 1 lands tomorrow! \n\n#BNA12DaysofFlights	Image	160	21	2025-12-09 00:29:07	\N	user_profile	\N
70	3788235917509840696	DSShH78jM84	https://www.instagram.com/p/DSShH78jM84/	sharqilibrary	70121915461	⁨\t⁨\tللتقديم التواصل على الواتس -الرابط في البايو- :🔹0510533038🔹 0510532020 أو الحضور لمكتب القلم الشرقي\n➖\n#الكليات_التقنية #ITC #علوم_الطيران #الكلية_التقنية #الكلية_التقنية_العالمية_للطيران #صيانة_الطائرات #طائرة #طائرة_بدون_طيار #ميكانيكا_الطيران #ميكانيكا #طيران #اتصالات_الطيران #تدريب #رتبة #وكيل #وكيل_رقيب #رقيب #رقيب_اول #فني_صيانة #فني_صيانة_الطائرات #عسكرية #عسكري #ابتعاث #القواعد_العسكرية #هندسة_صيانه_هياكل_ومحركات_الطائرات✈️ #الطيران_المدني⁩ #سياحة⁩	Video	0	0	2025-12-15 15:37:10	\N	mentions	\N
71	3788207109729721149	DSSakunDJs9	https://www.instagram.com/p/DSSakunDJs9/	ahmad_alnufais	21198768	*\nمن الكويت إلى جدة…\nرحلة مباشرة تقرّب المسافة، وتفتح لك أكثر من وجهة 🩵✈️\n\nمع رحلات Flynas المباشرة من الكويت إلى جدة،\nتقدر تجمع بين أداء العمرة، والاستمتاع بجدة بروحها، بحرها، وتاريخها.\n@flynas \nراحة في السفر،\nوتجربة متكاملة من أول خطوة.\n\nhttps://www.flynas.com/ar/flights-from-kuwait-city-to-jeddah\n\n#نأخذك_لأبعد_مدى	Video	3774	72	2025-12-15 14:43:25	\N	mentions	\N
72	3788126183452577180	DSSILGJDA2c	https://www.instagram.com/p/DSSILGJDA2c/	iahmedll_	45124765202	#الرياض #king_khaled_international_airport #مطر	Video	2	0	2025-12-15 11:57:51	\N	mentions	\N
73	3787669338233507993	DSQgTH4DBCZ	https://www.instagram.com/p/DSQgTH4DBCZ/	hayalfassam	501702412	•\nتشرَّفت بمشاركتي في نسخة هذا العام #عام_الحرف_اليدوية_2025 \n #أسبوع_مسك_للفنون2025 ضمن #سوق_الفن_والتصميم كانت جهُودًا رائعة وملحوظة يُشكر الكل عليها من جميع المسؤولين والقائمين والمنظمين ونحن الفنانين المشاركين سُعدنا بتواجدنا في هذا الأسبوع وبكُل ما قدمنا؛ كما أشكر كل من كان لهُ دور ودعم في زيارة مساحتي سرَّني حضوركم مع عطاءكم من خلال جمال كلماتكم أو حتى اقتناء مما عرضت لكُم وفقنا الله دومًا وياكم ♡\n\n‏#MiskArtWeek2025 #ArtDesignMarket\n•	Image	4	0	2025-12-14 20:49:52	\N	mentions	\N
74	3787580976613222080	DSQMNStDubA	https://www.instagram.com/p/DSQMNStDubA/	mazaj.ix	44445271702	@flynas ♥️	Video	36	0	2025-12-14 17:55:46	\N	mentions	\N
75	3787513736442205022	DSP860ajNNe	https://www.instagram.com/p/DSP860ajNNe/	hamzaarain09	57120901081	🏏Cricket Action Alertl🏏\n\nThe stage is set for the\n🏏Quick Premier League S1✨️\n"organized by ✈️Quick Travel Services✈️. A big thanks to 🩵 Flynas 🩵 for sponsoring this magnificent event! Get ready for the big teams to clash on the pitch! \n.\nTeam ✈️World Destination Online✈️ is excited to\nparticipate, play, and enjoy this fantastic event\nwith everyone! Let the games begin.🏏✨️🧢\n.\n.\n.\n#CricketVibes \n#cricketleague🏏 \n#turfcricket🏏 \n#Cricket tournament \n#Quicktravelagency\n#Worlddestinationonline\n#hamzaarain09 \n#instagaram	Image	2	0	2025-12-14 15:40:43	\N	mentions	\N
76	3787343074347737056	DSPWHW9CF_g	https://www.instagram.com/p/DSPWHW9CF_g/	scenetraveller	45646897188	@SceneTraveller: flynas has expanded its family-focused travel services with the launch of a dedicated “Kids & Family” check-in counter at King Fahd International Airport in Dammam.\n\nDesigned to make airport journeys smoother for parents, the new counters feature clear family-friendly branding and aim to reduce queues for travellers with children, allowing them to start their trip with more ease and less waiting.\n\nThis rollout follows flynas’ earlier launches of the same service at Riyadh’s King Khalid International Airport last July and Jeddah’s King Abdulaziz International Airport in October—making it the first airline in Saudi Arabia to introduce a countrywide family check-in experience.\n\nFor more travel news from across the Middle East, head to www.SceneTraveller.com or download the #SceneNow app (link in bio).	Image	-1	0	2025-12-14 10:02:21	\N	mentions	\N
77	3787139500707789715	DSOn0-OibuT	https://www.instagram.com/p/DSOn0-OibuT/	nkmngo2	48554627487	FlynasカラーにAirasiaのロゴが入り見事なハイブリッドカラーになったHS-XTR\n状態の良いうちに捕獲しておけばレジ番厨的にも一安心ですね\n\nThai Airasia X\nAirbus A330-343\nHS-XTR\nFlynas Hybrid Lively\n\nLocation：NGO/RJGG\nTaken date：2025.12.14\n\n #airplane\n #airplanespotting \n #airplanephotos \n #タイエアアジアx\n #airasia\n #thaiairasiax\n #Airbus\n #airbusa330\n #hs_xtr\n #中部国際空港\n #centrair\n #nkmセントレア2025	Image	73	0	2025-12-14 03:17:11	\N	mentions	\N
78	3787109446179158585	DSOg_nxCPo5	https://www.instagram.com/p/DSOg_nxCPo5/	yasir.airways	1374535918	#cebupacific #flyadeal #flynas #airbus #boeing #a320 #b737 #aviation #leasedaircraft #planespotting #riyadh #saudia #asia #travel #foryou #planespotting #fyp #	Video	3	0	2025-12-14 02:19:10	\N	mentions	\N
79	3786865797877691826	DSNpmEmk3Wy	https://www.instagram.com/p/DSNpmEmk3Wy/	aircraft_capture	75521890940	@flynas A320 spotted at @dxb\n.\n.\n.\n.\n.\n.\n#airbus #aviationspotter #aviation #landing #aviationgeeks #aviationlovers #aviationlife #aviationdaily #flying #landing #runway #foryoupage #a320neo #a320family #a320lovers	Video	6	0	2025-12-13 18:18:17	\N	mentions	\N
80	3773816174303822481	DRfSdDlAMKR	https://www.instagram.com/p/DRfSdDlAMKR/	flynas	593372283	هذا الشتاء، استعدّ لجولة حول السعودية لأن #شتانا_لكل_الناس ❄️\nوكل وجهة لها قصة تُروى…\nوتبدأ من السعودية …\n\nاحجز رحلتك بأفضل الأسعار!\n\n#روح_السعودية\n#حيّ_الشتاء\n\n-\n\nGet ready this winter for a journey across Saudi Arabia \nBecause it’s our #WinterForAll ❄️\nAnd every destination has a story to tell…\nthat starts in Saudi. \n\nBook your flight now with the best fares! \n\n#VisitSaudi\n#WinterIsAlive	Image	63	25	2025-11-25 18:06:06	\N	user_profile	\N
81	3746999005189263790	DQAA74mDFGu	https://www.instagram.com/p/DQAA74mDFGu/	flynas	593372283	اكتشف وجهاتنا لشتاء 2025 ✈️☃️\nموسم جديد… وتجارب تنتظرك في كل مدينة ❄️\n\n#شتانا_لكل_الناس❄️☃️\n\n-\n\nDiscover our Winter 2025 destinations ✈️☃️\nNew season, new journeys, endless experiences ❄️\n\n#WinterForAll❄️☃️	Sidecar	306	60	2025-10-19 18:05:11	\N	user_profile	\N
82	3788309042221333632	DSSxwCpALyA	https://www.instagram.com/p/DSSxwCpALyA/	flynas	593372283	في حائل، جولة روان كانت بين الجبال اللي تحرس المدينة، وهناك \nتسلّقت، واستكشفت، وعاشت حكايات بين قلاعها 🧗🏻‍♀️ حائل وجهتك لمغامرتك الجاية، احجز تذكرتك اليوم!\n\n#شتانا_لكل_الناس ❄️☃️\n#روح_السعودية\n#حي_الشتاء\n\nIn Ha’il, Rawan walked where mountains guard the city and history meets the wind. She climbed, explored, and experienced tales found in forts and dunes🇸🇦🧗🏻‍♂️\nMake Hail your next adventure, and book your ticket now!\n\n#WinterForAll❄️☃️ #VisitSaudi #WinterIsAlive	Image	31	0	2025-12-15 18:00:57	\N	user_profile	\N
83	3786907014219714642	DSNy92UAFBS	https://www.instagram.com/p/DSNy92UAFBS/	flynas	593372283	دبي… طاقة وتشويق في كل لحظة! 🤩✈️\nوأكيد مع ورق اللعب من #مدينة_القدية زادت أجوائنا تحدي وجمال! 🃏\n\n@VisitSaudiAR\n@qiddiyacity \n\n#روح_السعودية\n#شتانا_لكل_الناس ❄️☃️\n#طيران_ناس ✈️\n\nDubai… energy and excitement in every moment! 🤩✈️\nAnd of course, with the playing cards from #QiddiyaCity, our vibes got even more thrilling and stylish! 🃏\n\n@VisitSaudiAR\n@qiddiyacity \n\n#VisitSaudi\n#WinterForAll ❄️☃️\n#flynas ✈️	Video	343	44	2025-12-13 19:40:26	\N	user_profile	\N
84	3786086208095532416	DSK4VjCijWA	https://www.instagram.com/p/DSK4VjCijWA/	flynas	593372283	جهزنا لكم أجواء الشتاء بكل تفاصيلها... جهّزوا نفسكم للمغامرة ولحكايات الشتاء 🤩\n#شتانا_لكل_الناس ❄️⛄️\n\nWinter vibes are all set… Get ready for adventure and stories worth remembering 🤩\n#WinterForAll❄️⛄️	Video	149	5	2025-12-12 16:24:57	\N	user_profile	\N
85	3784034651770593747	DSDl3eUjiHT	https://www.instagram.com/p/DSDl3eUjiHT/	flynas	593372283	في جدة، قضى فهد لياليه بين الإحتفالات، الألعاب النارية وصوت الموج على الكورنيش 🌊\nاندمج مع الناس، جرّب نكهات جديدة، وشاف جمال جدة وبحرها.\n خلّي جدة تكون وجهتك الجاية🤩\n\nاحجز رحلتك ابتداءً من 259 ريال سعودي!\n\n#شتانا_لكل_الناس ❄️☃️\n#روح_السعودية\n#حي_الشتاء \n\nIn Jeddah, Fahad spent his nights between concerts, fireworks, and sound of waves on the Corniche. 🌊\nHe joined the crowd and watched Jeddah light up by the sea.\nSounds like your trip?🤩\n\nBook your trip starting from 259 SAR!\n\n#WinterForAll❄️☃️\n#VisitSaudi\n#WinterIsAlive	Image	72	5	2025-12-09 20:28:24	\N	user_profile	\N
86	3783733081724001304	DSChTDVDZwY	https://www.instagram.com/p/DSChTDVDZwY/	flynas	593372283	نكهات روسيا وتجارب موسكو ما تنتهي! ❄️🇷🇺\nمن ألذ الأطباق الروسية… إلى أجمل المغامرات في قلب موسكو 🤩\n\nمغامرتك القادمة بانتظارك… احجز تذكرتك الآن! ✈️\n\n#شتانا_لكل_الناس❄️☃️\n\n-\n\nRussia’s flavors and Moscow’s endless experiences! ❄️🇷🇺\nFrom must-try dishes to unforgettable city adventures 🤩\n\nYour next journey awaits… book your flight now! ✈️\n\n#WinterForAll❄️☃️	Sidecar	94	6	2025-12-09 10:29:18	\N	user_profile	\N
87	3780336603106278397	DR2dByHjnv9	https://www.instagram.com/p/DR2dByHjnv9/	flynas	593372283	في الشرقية، يلقى سعود توازنه. هناك حيث السكون يحكي حكاية، وكل مشهد ينبض بتراثه.\nوإذا كنت مثل سعود، بتعيش تجربة تناسبك !\n\nاحجز رحلتك للشرقية اليوم ابتداءً من209 ريال سعودي!\n\n#شتانا_لكل_الناس\n#روح_السعودية\n#حي_الشتاء\n\nIn the Eastern Province, Saud finds balance. It's where stillness meets story, and every landscape comes alive with heritage. If you’re like Saud, you’ll live your perfect experience!\n\nBook your flight starting from 209 SAR!\n\n#WinterForAll☃️\n#VisitSaudi \n#WinterIsAlive	Image	69	8	2025-12-04 18:01:07	\N	user_profile	\N
88	3778017562467325511	DRuNvTODVZH	https://www.instagram.com/p/DRuNvTODVZH/	flynas	593372283	🌇 زارت ريتشيل معارض الفن، وتجولت بين المقاهي وشوارع المدينة \nكل زاوية فيها حكاية تبقى بالذاكرة.\nالإلهام ما كان بعيد… كان في كل مكان.\n\nاحجز رحلتك ابتداءً من209 ريال سعودي \n\n#شتانا_لكل_الناس \n#روح_السعودية\n#حيّ_الشتاء\n\n-\n\nRachel explored art shows, cafés, and city streets that buzzed with life. Every corner offered a new sound, color, or story to remember. Inspiration wasn’t hard to chase — it was everywhere 🌇\n\nBook your trip starting from 209 SAR \n\n#WinterForAll\n#VisitSaudi\n#WinterIsAlive	Image	182	8	2025-12-01 13:13:41	\N	user_profile	\N
89	3777272748582637088	DRrkY1PCA4g	https://www.instagram.com/p/DRrkY1PCA4g/	flynas	593372283	✈️🔦	Video	1012	16	2025-11-30 12:34:36	\N	user_profile	\N
90	3774557529842679525	DRh7BMujH7l	https://www.instagram.com/p/DRh7BMujH7l/	flynas	593372283	الحِجر، وجبل الفيل، وسماء مليانة نجوم…\nكان جون يبحث عن الاستثنائية والتميز، ولقاه بالعلا وبطبيعتها الاستثنائية..\n\nاحجز رحلتك ابتداءً من 389 ريال سعودي \nجاهز لمغامرتك الجاية؟\n\n#شتانا_لكل_الناس ❄️\n#روح_السعودية\n#حي_الشتاء\n\n-\n\nThe Hegra, the trails of Elephant Rock, and a sky full of stars. John was searching for the extraordinary, and AlUla is made of it..\n\nBook your trip starting from 389 SAR\nIs it time for your next adventure? \n\n#WinterForAll❄️\n#VisitSaudi\n#WinterIsAlive	Image	131	14	2025-11-26 18:39:09	\N	user_profile	\N
91	3782922215680179130	DR_o7ZejPu6	https://www.instagram.com/p/DR_o7ZejPu6/	nazgul_satbayeva	1444662404	Прочитала классную фразу🤍\n\nВеликие тоже падают, но ты должен встать чего бы тебе это не стоило, и только после этого ты поймёшь, чего ты стоишь на самом деле \n#РойДжонс	Image	227	14	2025-12-08 07:38:11	\N	user_profile	\N
92	3693699578184804181	DNCqDJAtydV	https://www.instagram.com/p/DNCqDJAtydV/	nazgul_satbayeva	1444662404	“Если бы я должен был выбрать только одно качество, одну черту характера, которую я считаю наиболее связанной с успехом, независимо от вида деятельности, я бы выбрала  настойчивость. \nЭто воля дойти до конца; упасть семьдесят раз и встать со словами:\nЗдесь должна быть семьдесят первая возможность!🚀\n\nВЗЛЕТАЕМ КОМАНДА?	Image	197	15	2025-08-07 05:08:44	\N	user_profile	\N
93	3765769447311947876	DRCs1xFDDhk	https://www.instagram.com/p/DRCs1xFDDhk/	nazgul_satbayeva	1444662404	Мама поддерживала нас  и мы поддержали ее когда мы нужны были🥹\nПочему мы ушли оставим 80 тыс$ дохода.	Video	498	35	2025-11-14 15:48:18	\N	user_profile	\N
94	3787532535916719045	DSQBMYyjOvF	https://www.instagram.com/p/DSQBMYyjOvF/	nazgul_satbayeva	1444662404	💘	Video	210	25	2025-12-14 16:18:25	\N	user_profile	\N
95	3787253593083688862	DSPBxPCEzee	https://www.instagram.com/p/DSPBxPCEzee/	nazgul_satbayeva	1444662404	Хочу сохранить эти фотографии тут🫶🏼\nЯ поняла как давно как будто не было таких дней🫶🏼\nЭто всего лишь вторые выходные с детьми за полгода. Раньше для нас это было традицией — каждые выходные выезжать за город, в какие-то уютные отели. \nКаждый три месяца а то и чаще, мы летали за границу, жили в ощущении стабильности и уверенности в завтрашнем дне.\nДумали все мы заслуживаем эту жизнь.\nНо всё изменилось. Мы ушли из компании где столько было несправедливости и мы ушли.\n лишились привычного, стабильного дохода. \nЭто было непростое решение, осознанное и болезненное. Мы понимали, какую цену за него придётся заплатить — отказ от комфорта, от привычной жизни, от лёгкости.\n\nИ всё же мы были готовы к этому. Потому что иногда надо делать выбор.\n Бросить жалко, нести тяжело знакомо?\n\nИ чаще всего мы держимся не за бизнес, а за мысль о том..сколько времени уже туда вложили.\nХотя на самом деле важнее другое \nкуда я вложу следующие пять лет своей жизни.\nИменно ради будущего детей мы сделать новый шаг чему мы очень рады✨	Sidecar	136	8	2025-12-14 07:03:51	\N	user_profile	\N
96	3786692467568635971	DSNCLyLE3BD	https://www.instagram.com/p/DSNCLyLE3BD/	nazgul_satbayeva	1444662404	👊🏻	Video	60	1	2025-12-13 12:29:07	\N	user_profile	\N
97	3786499973962272400	DSMWaoiDA6Q	https://www.instagram.com/p/DSMWaoiDA6Q/	nazgul_satbayeva	1444662404	Super top style от @botastylist \nКак вам образ?	Sidecar	308	31	2025-12-13 06:06:33	\N	user_profile	\N
98	3784971963748345273	DSG6_KICGW5	https://www.instagram.com/p/DSG6_KICGW5/	luna_.madina_	69089166418	✨ ВОЛШЕБНАЯ ВСТРЕЧА. ВОЛШЕБНЫЕ ЛЮДИ. ИГРА, КОТОРАЯ МЕНЯЕТ СУДЬБЫ. ✨\n\n12.12 в 12:00 мы собираемся в тёплом женском круге, чтобы прожить ту самую трансформацию, которую каждая чувствует… но редко разрешает себе пройти до конца.\n\nЯ проведу для вас трансформационную игру «Лила» это глубокий инструмент, который помогает увидеть свои внутренние блоки, страхи, ограничивающие сценарии и… выйти из них.\nЛила - это не «просто игра».\nЭто честный разговор с собой.\nЭто зеркало, которое показывает путь.\nЭто дверца, которую ты сама открываешь, когда готова перестать тянуть старое.\n\nВ этот день мы:\n\n✨ соприкоснёмся с вашими истинными запросами,\n✨ увидим, где энергия застряла,\n✨ будем мягко, осознанно освобождаться,\n✨ найдём новые решения,\n✨ и почувствуем то самое состояние облегчения и внутреннего «всё, теперь я могу».\n\nРядом со мной @nazgul_satbayeva , автор книги «Қазақша HR», сильная женщина, бизнесвумен, человек, который умеет вдохновлять своим примером и направлять через мудрость.\n\nЭто встреча  для тех, кто чувствует, что готов перезагрузиться.\nДля тех, кто хочет ясности.\nДля тех, кто устал тащить чужие ожидания.\nДля тех, кто хочет вернуться к себе.\n\nПриходите.\nЭтот день станет точкой, с которой начнётся что-то новое.\n\n#трансформация\n#играЛила\n#женскийкруг	Image	48	0	2025-12-11 03:30:00	\N	user_profile	\N
99	3784613866177602401	DSFpkJxiKNh	https://www.instagram.com/p/DSFpkJxiKNh/	dinara_boranbayevaa	1726232478	«Когда у тебя осознанно выбран наставник, ты уже уверенно шаг за шагом двигаешься вперёд» \n🚀 🚀 🚀	Video	232	28	2025-12-10 15:42:46	\N	user_profile	\N
100	3784577443043250462	DSFhSIFjJEe	https://www.instagram.com/p/DSFhSIFjJEe/	tonus_naz	11115000504	Тапсырыс беру үшін  төменге «сыйлық» деп жазып кет👇🏻	Sidecar	73	6	2025-12-10 14:26:49	\N	user_profile	\N
101	3783857293738146862	DSC9ikyCHwu	https://www.instagram.com/p/DSC9ikyCHwu/	dinara_boranbayevaa	1726232478	Біздің таңдауымыз CORAL CLUB компаниясы! \nСебебі біз өзімізді таңдадық! Не үшін???\n\n- Өз құндылығымызды бірінші орынға қойып, мақсатымызбен әрекетімізге сай қарым-қатынасты \nкөре отырып болашағымызға нық сенімді қадам бастық!!!\n\nАрмандарды орындауға мықты продукт, маркетинг, бонус және тәжірибесі мол наставниктерді таңдадық!!!\n\nБІЗГЕ СӘТТІЛІК ТІЛЕП ҚОЙЫҢЫЗДАР✊💕 \nГОУ В НАШУ КОМАНДУ✅	Video	163	32	2025-12-09 14:38:34	\N	user_profile	\N
102	3783787269640213954	DSCtnlwjNXC	https://www.instagram.com/p/DSCtnlwjNXC/	tonus_naz	11115000504	АНАМНЫҢ БАҚЫТТАН АҚҚАН КӨЗ ЖАСЫН КӨРУ МЕН ҮШІН БАҚЫТ💔🥹	Video	680	81	2025-12-09 12:17:45	\N	user_profile	\N
\.


--
-- Data for Name: target_hashtags; Type: TABLE DATA; Schema: public; Owner: flynas
--

COPY public.target_hashtags (id, hashtag, post_count, is_active, added_at, last_scraped_at, notes, tags) FROM stdin;
\.


--
-- Data for Name: target_places; Type: TABLE DATA; Schema: public; Owner: flynas
--

COPY public.target_places (id, place_name, place_id, city, country, latitude, longitude, post_count, is_active, added_at, last_scraped_at, notes, tags) FROM stdin;
\.


--
-- Data for Name: target_users; Type: TABLE DATA; Schema: public; Owner: flynas
--

COPY public.target_users (id, username, user_id, display_name, profile_url, follower_count, is_verified, is_active, added_at, last_scraped_at, notes, tags) FROM stdin;
\.


--
-- Name: comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: flynas
--

SELECT pg_catalog.setval('public.comments_id_seq', 117, true);


--
-- Name: posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: flynas
--

SELECT pg_catalog.setval('public.posts_id_seq', 102, true);


--
-- Name: target_hashtags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: flynas
--

SELECT pg_catalog.setval('public.target_hashtags_id_seq', 1, false);


--
-- Name: target_places_id_seq; Type: SEQUENCE SET; Schema: public; Owner: flynas
--

SELECT pg_catalog.setval('public.target_places_id_seq', 1, false);


--
-- Name: target_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: flynas
--

SELECT pg_catalog.setval('public.target_users_id_seq', 1, false);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: flynas
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: flynas
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- Name: target_hashtags target_hashtags_pkey; Type: CONSTRAINT; Schema: public; Owner: flynas
--

ALTER TABLE ONLY public.target_hashtags
    ADD CONSTRAINT target_hashtags_pkey PRIMARY KEY (id);


--
-- Name: target_places target_places_pkey; Type: CONSTRAINT; Schema: public; Owner: flynas
--

ALTER TABLE ONLY public.target_places
    ADD CONSTRAINT target_places_pkey PRIMARY KEY (id);


--
-- Name: target_users target_users_pkey; Type: CONSTRAINT; Schema: public; Owner: flynas
--

ALTER TABLE ONLY public.target_users
    ADD CONSTRAINT target_users_pkey PRIMARY KEY (id);


--
-- Name: ix_comments_comment_id; Type: INDEX; Schema: public; Owner: flynas
--

CREATE UNIQUE INDEX ix_comments_comment_id ON public.comments USING btree (comment_id);


--
-- Name: ix_comments_post_id; Type: INDEX; Schema: public; Owner: flynas
--

CREATE INDEX ix_comments_post_id ON public.comments USING btree (post_id);


--
-- Name: ix_comments_timestamp; Type: INDEX; Schema: public; Owner: flynas
--

CREATE INDEX ix_comments_timestamp ON public.comments USING btree ("timestamp");


--
-- Name: ix_posts_owner_username; Type: INDEX; Schema: public; Owner: flynas
--

CREATE INDEX ix_posts_owner_username ON public.posts USING btree (owner_username);


--
-- Name: ix_posts_post_id; Type: INDEX; Schema: public; Owner: flynas
--

CREATE UNIQUE INDEX ix_posts_post_id ON public.posts USING btree (post_id);


--
-- Name: ix_posts_timestamp; Type: INDEX; Schema: public; Owner: flynas
--

CREATE INDEX ix_posts_timestamp ON public.posts USING btree ("timestamp");


--
-- Name: ix_target_hashtags_hashtag; Type: INDEX; Schema: public; Owner: flynas
--

CREATE UNIQUE INDEX ix_target_hashtags_hashtag ON public.target_hashtags USING btree (hashtag);


--
-- Name: ix_target_hashtags_is_active; Type: INDEX; Schema: public; Owner: flynas
--

CREATE INDEX ix_target_hashtags_is_active ON public.target_hashtags USING btree (is_active);


--
-- Name: ix_target_places_is_active; Type: INDEX; Schema: public; Owner: flynas
--

CREATE INDEX ix_target_places_is_active ON public.target_places USING btree (is_active);


--
-- Name: ix_target_places_place_id; Type: INDEX; Schema: public; Owner: flynas
--

CREATE UNIQUE INDEX ix_target_places_place_id ON public.target_places USING btree (place_id);


--
-- Name: ix_target_places_place_name; Type: INDEX; Schema: public; Owner: flynas
--

CREATE INDEX ix_target_places_place_name ON public.target_places USING btree (place_name);


--
-- Name: ix_target_users_is_active; Type: INDEX; Schema: public; Owner: flynas
--

CREATE INDEX ix_target_users_is_active ON public.target_users USING btree (is_active);


--
-- Name: ix_target_users_user_id; Type: INDEX; Schema: public; Owner: flynas
--

CREATE INDEX ix_target_users_user_id ON public.target_users USING btree (user_id);


--
-- Name: ix_target_users_username; Type: INDEX; Schema: public; Owner: flynas
--

CREATE UNIQUE INDEX ix_target_users_username ON public.target_users USING btree (username);


--
-- Name: comments comments_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: flynas
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id);


--
-- PostgreSQL database dump complete
--

\unrestrict A4aVifjaFf57mVMgqr61ZGFSy3oWqOSTMg1ZqqgSbLo1g75eOLGI0dskeQGZlbO

