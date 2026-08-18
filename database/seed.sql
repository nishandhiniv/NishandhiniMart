--
-- PostgreSQL database dump
--

\restrict ni8vnAS23zTGBOm3r7EhTYO2AmjaCS35URljdeZ6uzsftbtqjKI2ZSuxa2fNV5e

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users VALUES (1, 'Test User', 'testuser', 'test@example.com', 'test123', 'buyer');
INSERT INTO public.users VALUES (2, 'New User', 'newuser', 'newuser@example.com', 'pass123', 'buyer');
INSERT INTO public.users VALUES (4, 'Nisha Test', 'nisha_test_2026', 'nisha_test_2026@example.com', 'test123', 'buyer');
INSERT INTO public.users VALUES (5, 'saravathi D', 'sara', 'sara@gmail.com', '12345678', 'buyer');
INSERT INTO public.users VALUES (6, 'asmi R', 'asmi', 'asmi@gmail.com', '12345678', 'buyer');
INSERT INTO public.users VALUES (7, 'vanitha A', 'vanitha', 'vani@gmail.com', '12345678', 'buyer');
INSERT INTO public.users VALUES (8, 'kaviyasri L', 'kaviya', 'kaviya@gmail.com', '12345678', 'buyer');
INSERT INTO public.users VALUES (9, 'Demo User', 'demo_user', 'demo@example.com', 'demo123', 'buyer');


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 9, true);


--
-- PostgreSQL database dump complete
--

\unrestrict ni8vnAS23zTGBOm3r7EhTYO2AmjaCS35URljdeZ6uzsftbtqjKI2ZSuxa2fNV5e

